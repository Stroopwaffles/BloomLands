import { BLOOM_LEVELS, BLOOM_PER_LEVEL, CURIOS } from '../data/bloom'
import { RELICS, ROOT_UPGRADES, type BonusEffect } from '../data/prestige'
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
  const effects = state.buffs.flatMap((buff) =>
    POTIONS[buff.potionId] ? [POTIONS[buff.potionId].effect] : [],
  )
  // The Aurora Prism makes every potion work better.
  const strength = product(state, 'potionStrength')
  if (strength === 1) return effects
  return effects.map((e) => {
    if ('multiplier' in e) return { ...e, multiplier: 1 + (e.multiplier - 1) * strength }
    if ('amount' in e) return { ...e, amount: Math.round(e.amount * strength) }
    return e
  })
}

function upgradeEffects(state: GameState): UpgradeEffect[] {
  const bought = state.upgrades.flatMap((id) => (UPGRADES[id] ? [UPGRADES[id].effect] : []))
  // Root Song upgrades like Seasoned Hands work like gear that lasts forever.
  for (const [id, tier] of Object.entries(state.prestige.upgrades)) {
    const upgrade = ROOT_UPGRADES[id]?.upgrade
    if (upgrade && tier > 0) bought.push(...upgrade(tier))
  }
  return bought
}

export function clickPower(state: GameState): number {
  let power = state.player.clickPower
  for (const e of upgradeEffects(state)) if (e.kind === 'clickPower') power += e.amount
  for (const e of potionEffects(state)) if (e.kind === 'clickPower') power += e.amount
  // Curios like the Miner's Lamp help in one region.
  for (const e of curioEffects(state)) {
    if (e.kind === 'regionClick' && placeRegion(state.player.place) === e.regionId) {
      power += e.amount
    }
  }
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

/** Light for dark regions: a Glowlight Potion, or riding a mount that glows. */
export function hasLight(state: GameState): boolean {
  if (potionEffects(state).some((e) => e.kind === 'light')) return true
  const id = state.mounts.riding
  return !!(id && MOUNTS[id]?.light)
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
  return (mount.speed + (level - 1) * mount.speedPerLevel) * mountSpeedMultiplier(state)
}

/** Curios that make mounts faster (Knight's Pennant). */
export function mountSpeedMultiplier(state: GameState): number {
  let value = 1
  for (const e of curioEffects(state)) if (e.kind === 'mountSpeed') value *= e.multiplier
  return value
}

/**
 * Rarer plants grow more often in a mount's home region while you ride it there (the hummingbird
 * in the Orchard).
 */
export function mountRegionLuck(state: GameState, regionId: string): number {
  const id = state.mounts.riding
  const mount = id ? MOUNTS[id] : null
  if (!id || !mount || mount.bonus.kind !== 'regionLuck' || mount.regionId !== regionId) return 1
  if (placeRegion(state.player.place) !== regionId) return 1
  return mountBonusValue(mount, state.mounts.owned[id]?.level ?? 1)
}

/** Curios that help scouts find trinkets (Brass Spyglass). */
export function scoutTrinketMultiplier(state: GameState): number {
  let value = 1
  for (const e of curioEffects(state)) if (e.kind === 'scoutTrinkets') value *= e.multiplier
  return value
}

/** Curios that make a region's troubles turn up less often (Nightlight Jar): 1 = as usual. */
export function regionCalmMultiplier(state: GameState, regionId: string): number {
  let value = 1
  for (const e of curioEffects(state)) {
    if (e.kind === 'regionCalm' && e.regionId === regionId) value *= e.multiplier
  }
  return value
}

/** Curios that make traders offer trinkets more often (Queen's Seal). */
export function traderTrinketMultiplier(state: GameState): number {
  let value = 1
  for (const e of curioEffects(state)) if (e.kind === 'traderTrinkets') value *= e.multiplier
  return value
}

/** Extra offline progress time from curios (Badger's Pocket Watch). */
export function curioOfflineMs(state: GameState): number {
  let ms = 0
  for (const e of curioEffects(state)) if (e.kind === 'offlineCap') ms += e.ms
  return ms
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
  // Curios like the Fallen Star help everywhere.
  for (const e of curioEffects(state)) if (e.kind === 'luck') value *= e.multiplier
  return value
}

/** Offline time counts for more (Dreamcatcher). */
export function offlineBoost(state: GameState): number {
  return product(state, 'offlineBoost')
}

/** Chance a spell costs nothing (Moth-Wing Quill). */
export function spellSaveChance(state: GameState): number {
  let chance = 0
  for (const e of curioEffects(state)) if (e.kind === 'spellSave') chance += e.chance
  return Math.min(1, chance)
}

/** Storms never ground you (Storm Bell). */
export function stormProof(state: GameState): boolean {
  return curioEffects(state).some((e) => e.kind === 'stormProof')
}

/** How much Root Song the ritual gives, as a multiplier (Star Chart). */
export function rootSongMultiplier(state: GameState): number {
  return product(state, 'rootSong')
}

/** Research costs, as a multiplier (Windbound Tome). */
export function researchCostMultiplier(state: GameState): number {
  return product(state, 'researchCost')
}

/** The Moon-Phase Locket lets you choose the Glade's moon. */
export function canChooseMoon(state: GameState): boolean {
  return curioEffects(state).some((e) => e.kind === 'moonChoice')
}

/**
 * Every lasting bonus the rules read: this run's curios, plus relics and Root Song upgrades,
 * which last forever.
 */
function curioEffects(state: GameState): BonusEffect[] {
  const effects: BonusEffect[] = state.curios.flatMap((id) =>
    CURIOS[id] ? [CURIOS[id].effect] : [],
  )
  for (const id of state.prestige.relics) if (RELICS[id]) effects.push(...RELICS[id].effects)
  for (const [id, tier] of Object.entries(state.prestige.upgrades)) {
    const bonus = ROOT_UPGRADES[id]?.bonus
    if (bonus && tier > 0) effects.push(...bonus(tier))
  }
  return effects
}

/** All lasting bonuses (for the prestige engine). */
export const bonusEffects = curioEffects

function sumAmount<K extends BonusEffect['kind']>(state: GameState, kind: K): number {
  let total = 0
  for (const e of curioEffects(state)) {
    if (e.kind === kind && 'amount' in e) total += e.amount
  }
  return total
}

function product<K extends BonusEffect['kind']>(state: GameState, kind: K): number {
  let value = 1
  for (const e of curioEffects(state)) {
    if (e.kind === kind && 'multiplier' in e) value *= e.multiplier
  }
  return value
}

/** A relic has made this creature friendly: it never turns up to cause trouble. */
export function creatureAtPeace(state: GameState, creatureId: string): boolean {
  return curioEffects(state).some((e) => e.kind === 'truce' && e.creatureId === creatureId)
}

/** Morning dew grows all day (Dew-Catcher Cup). */
export function dewAllDay(state: GameState): boolean {
  return curioEffects(state).some((e) => e.kind === 'dewAllDay')
}

/** This weather has lost its downsides (Mist-Walker's Moss, Riddle Shell). */
export function weatherCleared(state: GameState, weather: string): boolean {
  return curioEffects(state).some((e) => e.kind === 'clearWeather' && e.weather === weather)
}

/** Weather a relic brings to a region every morning (Blossom Fan), if any. */
export function morningWeather(state: GameState, regionId: string): string | null {
  for (const e of curioEffects(state)) {
    if (e.kind === 'morningWeather' && e.regionId === regionId) return e.weather
  }
  return null
}

/** The region is always lit (Ever-Lit Lantern). */
export function alwaysLit(state: GameState, regionId: string): boolean {
  return curioEffects(state).some((e) => e.kind === 'alwaysLit' && e.regionId === regionId)
}

/** Taps every plant is spared (Heart of the Meadow). */
export function plantEase(state: GameState): number {
  return sumAmount(state, 'plantEase')
}

/** How much more helpers bring back (Still-Water Pearl). */
export function helperYieldMultiplier(state: GameState): number {
  return product(state, 'helperYield')
}

/** How much longer trader and villager requests wait (Golden Apple). */
export function requestStayMultiplier(state: GameState): number {
  return product(state, 'requestStay')
}

/** Chance a finished crafting job comes out double (Echo Crystal). */
export function craftEchoChance(state: GameState): number {
  let chance = 0
  for (const e of curioEffects(state)) if (e.kind === 'craftEcho') chance += e.chance
  return Math.min(1, chance)
}

/** Feedings spared when befriending a mount (Kind Heart). */
export function befriendEase(state: GameState): number {
  return sumAmount(state, 'befriendEase')
}

/** How long traders take to arrive, as a multiplier (Trader's Favor). */
export function traderVisitMultiplier(state: GameState): number {
  return product(state, 'traderVisits')
}

/** Items spared from each spirit offering (Spirit's Ear). */
export function spiritEase(state: GameState): number {
  return sumAmount(state, 'spiritEase')
}

export function recruitCostMultiplier(state: GameState): number {
  return product(state, 'recruitCost')
}

export function lodgingCostMultiplier(state: GameState): number {
  return product(state, 'lodgingCost')
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
    if (e.kind === 'allBloom') value *= e.multiplier
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
  for (const e of curioEffects(state)) if (e.kind === 'storage') capacity += e.amount
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
