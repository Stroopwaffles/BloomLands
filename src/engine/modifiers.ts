import { COURT_RANKS } from '../data/economy'
import { HELPER_RULES, type HelperType } from '../data/helpers'
import { itemHasTag } from '../data/items'
import { POTIONS } from '../data/recipes'
import type { PotionEffect, StationId } from '../data/types'
import { STARTING_STATIONS, UPGRADES, type QolId, type UpgradeEffect } from '../data/upgrades'
import type { GameState } from './state'

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
  return power
}

export function wingSpeed(state: GameState): number {
  let speed = state.player.wingSpeed
  for (const e of upgradeEffects(state)) if (e.kind === 'wingSpeed') speed += e.amount
  for (const e of potionEffects(state)) if (e.kind === 'wingSpeed') speed *= e.multiplier
  return speed
}

export function satchelCapacity(state: GameState): number {
  let capacity = state.player.satchelCapacity
  for (const e of upgradeEffects(state)) if (e.kind === 'satchel') capacity += e.amount
  for (const e of potionEffects(state)) if (e.kind === 'satchel') capacity += e.amount
  return capacity
}

/** Multiplies how often uncommon and rarer plants grow. */
export function luck(state: GameState): number {
  let value = 1
  for (const e of potionEffects(state)) if (e.kind === 'luck') value *= e.multiplier
  return value
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
