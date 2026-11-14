import { BLOOM_LEVELS, BLOOM_PER_LEVEL, CURIOS, type CurioDef } from '../data/bloom'
import { COURT_RANKS } from '../data/economy'
import { HELPER_RULES, PIRATES_PER_CREW, type HelperType } from '../data/helpers'
import { itemHasTag } from '../data/items'
import { POTIONS } from '../data/recipes'
import type { PotionEffect, StationId } from '../data/types'
import { PLENTY } from '../data/magic'
import { MOUNTS, mountBonusValue } from '../data/mounts'
import { STARTING_STATIONS, UPGRADES, type QolId, type UpgradeEffect } from '../data/upgrades'
import { HOME, REGIONS, SETTLEMENTS, SPIRIT_PLACES, SPOTS } from '../data/world'
import type { GameState } from './state'

/** The region a place belongs to (home sits at the edge of the Meadow). */
function placeRegion(placeId: string): string {
  if (placeId === HOME) return 'meadow'
  return (
    SPOTS[placeId]?.regionId ??
    SETTLEMENTS[placeId]?.regionId ??
    SPIRIT_PLACES[placeId]?.regionId ??
    'meadow'
  )
}

/**
 * The player's effective stats: base values plus upgrades plus active potions.
 * Every rule reads stats from here so bonuses always apply consistently.
 */

function potionEffects(state: GameState): PotionEffect[] {
  return state.buffs.flatMap((buff) =>
    POTIONS[buff.potionId] ? [POTIONS[buff.potionId].effect] : [],
  )
}

function upgradeEffects(state: GameState): UpgradeEffect[] {
  return state.upgrades.flatMap((id) => (UPGRADES[id] ? [UPGRADES[id].effect] : []))
}

export function clickPower(state: GameState): number {
  let power = state.player.clickPower
  for (const e of upgradeEffects(state)) if (e.kind === 'clickPower') power += e.amount
  for (const e of potionEffects(state)) if (e.kind === 'clickPower') power += e.amount
  // Riding a mount like the frog in its home region gathers faster.
  const id = state.mounts.riding
  const mount = id ? MOUNTS[id] : null
  if (id && mount && mount.bonus.kind === 'clickPower') {
    if (placeRegion(state.player.place) === mount.regionId) {
      power += mountBonusValue(mount, state.mounts.owned[id]?.level ?? 1)
    }
  }
  return power
}

/** A Waterstride Philter is active: no water slowdowns, and the heron lets you be. */
export function hasWaterstride(state: GameState): boolean {
  return potionEffects(state).some((e) => e.kind === 'waterstride')
}

/** Speed of the mount being ridden (1 if none). */
function ridingSpeed(state: GameState): number {
  const id = state.mounts.riding
  const mount = id ? MOUNTS[id] : null
  if (!id || !mount) return 1
  const level = state.mounts.owned[id]?.level ?? 1
  return mount.speed + (level - 1) * mount.speedPerLevel
}

export function wingSpeed(state: GameState): number {
  let speed = state.player.wingSpeed
  for (const e of upgradeEffects(state)) if (e.kind === 'wingSpeed') speed += e.amount
  speed *= ridingSpeed(state)
  for (const e of potionEffects(state)) if (e.kind === 'wingSpeed') speed *= e.multiplier
  return speed
}

/** Satchel space where the player is now (or, with `placeId`, would be there). */
export function satchelCapacity(state: GameState, placeId = state.player.place): number {
  let capacity = state.player.satchelCapacity
  for (const e of upgradeEffects(state)) if (e.kind === 'satchel') capacity += e.amount
  // Riding a mount in its home region carries extra.
  const id = state.mounts.riding
  const mount = id ? MOUNTS[id] : null
  if (id && mount && mount.bonus.kind === 'satchel') {
    if (placeRegion(placeId) === mount.regionId) {
      capacity += mountBonusValue(mount, state.mounts.owned[id]?.level ?? 1)
    }
  }
  for (const e of potionEffects(state)) if (e.kind === 'satchel') capacity += e.amount
  return capacity
}

/** How much more the satchel holds than it can carry right now (0 if not over-full). */
export function satchelOverload(state: GameState): number {
  let carried = 0
  for (const amount of Object.values(state.player.satchel)) carried += amount
  return Math.max(0, carried - satchelCapacity(state))
}

/**
 * Why the satchel is smaller here than it could be: a satchel mount (like the bumblebee) only
 * carries extra in its own region. Null if that isn't the reason (a Deep Pockets Draught wore off).
 */
export function satchelMountAway(state: GameState, placeId = state.player.place): string | null {
  const id = state.mounts.riding
  const mount = id ? MOUNTS[id] : null
  if (!mount || mount.bonus.kind !== 'satchel' || placeRegion(placeId) === mount.regionId) {
    return null
  }
  return `the ${mount.name.toLowerCase()} only carries extra in the ${REGIONS[mount.regionId]?.name ?? 'its home region'}`
}

/** Multiplies how often uncommon and rarer plants grow. */
export function luck(state: GameState): number {
  let value = 1
  for (const e of potionEffects(state)) if (e.kind === 'luck') value *= e.multiplier
  return value
}

function curioEffects(state: GameState): CurioDef['effect'][] {
  return state.curios.flatMap((id) => (CURIOS[id] ? [CURIOS[id].effect] : []))
}

/** Curios that shorten flights. */
export function travelMultiplier(state: GameState): number {
  let value = 1
  for (const e of curioEffects(state)) if (e.kind === 'travel') value *= e.multiplier
  return value
}

export function traderPayMultiplier(state: GameState): number {
  let value = 1
  for (const e of curioEffects(state)) if (e.kind === 'traderPay') value *= e.multiplier
  return value
}

export function potionDurationMultiplier(state: GameState): number {
  let value = 1
  for (const e of curioEffects(state)) if (e.kind === 'potionDuration') value *= e.multiplier
  return value
}

/** Curios that make trinkets turn up more often. */
export function trinketChanceMultiplier(state: GameState): number {
  let value = 1
  for (const e of curioEffects(state)) if (e.kind === 'trinketChance') value *= e.multiplier
  return value
}

/** Extra yield for plants with a tag (e.g. Burdock's Field Guide for mushrooms). */
export function tagYieldBonus(state: GameState, tags: readonly string[] | undefined): number {
  let bonus = 0
  for (const e of curioEffects(state)) {
    if (e.kind === 'tagYield' && tags?.includes(e.tag)) bonus += e.amount
  }
  return bonus
}

export function researchSpeed(state: GameState): number {
  let value = 1
  for (const e of curioEffects(state)) if (e.kind === 'researchSpeed') value *= e.multiplier
  return value
}

/** Curios that raise bloom gained in one region. */
export function regionBloomMultiplier(state: GameState, regionId: string): number {
  let value = 1
  for (const e of curioEffects(state)) {
    if (e.kind === 'regionBloom' && e.regionId === regionId) value *= e.multiplier
  }
  return value
}

/** Curios that raise the bloom from helping villagers (Mayor's Chain of Office). */
export function settlementBloomMultiplier(state: GameState): number {
  let value = 1
  for (const e of curioEffects(state)) if (e.kind === 'settlementBloom') value *= e.multiplier
  return value
}

/** Curios that shorten helpers' flights (Reed Pipe). */
export function helperTripMultiplier(state: GameState): number {
  let value = 1
  for (const e of curioEffects(state)) if (e.kind === 'helperTrips') value *= e.multiplier
  return value
}

/** Curios that make rarer plants likelier in some weather (Wisp Lantern in fog). */
export function weatherLuckMultiplier(state: GameState, weather: string): number {
  let value = 1
  for (const e of curioEffects(state)) {
    if (e.kind === 'weatherLuck' && e.weather === weather) value *= e.multiplier
  }
  return value
}

/** Regrowth from potions and the Rite of Plenty. */
export function boostRegrowth(state: GameState): number {
  let value = state.plentyMs > 0 ? PLENTY.regrowth : 1
  for (const e of potionEffects(state)) if (e.kind === 'regrowth') value *= e.multiplier
  return value
}

/** Index into BLOOM_LEVELS for a region. */
export function bloomLevel(state: GameState, regionId: string): number {
  const points = state.bloom[regionId] ?? 0
  let level = 0
  for (let i = 0; i < BLOOM_LEVELS.length; i++) if (points >= BLOOM_LEVELS[i].points) level = i
  return level
}

/** Regrowth speed from a region's bloom. */
export function bloomRegrowth(state: GameState, regionId: string): number {
  return 1 + bloomLevel(state, regionId) * BLOOM_PER_LEVEL.regrowth
}

/** Rarer plants grow more often in a region with more bloom. */
export function bloomLuck(state: GameState, regionId: string): number {
  return 1 + bloomLevel(state, regionId) * BLOOM_PER_LEVEL.luck
}

/** How many mounts the roosts can house. */
export function stableCapacity(state: GameState): number {
  let capacity = 0
  for (const e of upgradeEffects(state)) if (e.kind === 'stable') capacity += e.amount
  return capacity
}

export function storageCapacity(state: GameState): number {
  let capacity = state.storageCapacity
  for (const e of upgradeEffects(state)) if (e.kind === 'storage') capacity += e.amount
  return capacity
}

/** Items that count against storage space. Trinkets are keepsakes and take no space. */
export function storageUsed(state: GameState): number {
  let used = 0
  for (const [itemId, amount] of Object.entries(state.inventory)) {
    if (!itemHasTag(itemId, 'trinket')) used += amount
  }
  return used
}

export function stationBuilt(state: GameState, station: StationId): boolean {
  return (
    STARTING_STATIONS.includes(station) ||
    upgradeEffects(state).some((e) => e.kind === 'station' && e.station === station)
  )
}

/** Jobs a station can run at once (0 if not built). */
export function stationSlots(state: GameState, station: StationId): number {
  if (!stationBuilt(state, station)) return 0
  let slots = 1
  for (const e of upgradeEffects(state)) {
    if (e.kind === 'stationSlot' && e.station === station) slots++
  }
  return slots
}

export function hasFeature(state: GameState, feature: 'ritual-circle'): boolean {
  return upgradeEffects(state).some((e) => e.kind === 'feature' && e.feature === feature)
}

/** How well supply helpers search for rare plants: 0 not at all, 1 normally, 2 keenly. */
export function supplyKeenness(state: GameState): number {
  let level = 0
  for (const e of upgradeEffects(state))
    if (e.kind === 'supplyKeen') level = Math.max(level, e.level)
  return level
}

export function hasQol(state: GameState, qol: QolId): boolean {
  return upgradeEffects(state).some((e) => e.kind === 'qol' && e.qol === qol)
}

/** Trinkets in storage: the rare currency. */
export function trinketCount(state: GameState): number {
  let count = 0
  for (const [itemId, amount] of Object.entries(state.inventory)) {
    if (itemHasTag(itemId, 'trinket')) count += amount
  }
  return count
}

/** How many helpers of a type the lodging has room for (0 = that type isn't unlocked yet). */
export function helperCapacity(state: GameState, type: HelperType): number {
  if (type === 'pirate') {
    return Object.values(state.crews).filter((c) => c.won).length * PIRATES_PER_CREW
  }
  let capacity = 0
  for (const e of upgradeEffects(state)) {
    if (e.kind === 'helpers' && e.helper === type) capacity += e.amount
  }
  return capacity
}

export function helperCount(state: GameState, type: HelperType): number {
  return state.helpers.list.filter((h) => h.type === type).length
}

/** Court points: how grand the court is. Lodging and helpers both count. */
export function courtPoints(state: GameState): number {
  const lodging = state.upgrades.reduce((sum, id) => sum + (UPGRADES[id]?.courtPoints ?? 0), 0)
  return lodging + state.helpers.list.length * HELPER_RULES.courtPoints
}

/** Index into COURT_RANKS of the court's current rank. */
export function courtRank(state: GameState): number {
  const points = courtPoints(state)
  let rank = 0
  for (let i = 0; i < COURT_RANKS.length; i++) if (points >= COURT_RANKS[i].points) rank = i
  return rank
}
