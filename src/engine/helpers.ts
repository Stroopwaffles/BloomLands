import {
  HELPER_NAMES,
  HELPER_RULES,
  HELPER_TYPES,
  RARITY_HAUL_FACTOR,
  type HelperType,
} from '../data/helpers'
import { ITEMS } from '../data/items'
import { PLANTS } from '../data/plants'
import type { ItemStack } from '../data/types'
import { baseTravelMs, HOME, isSettlement, SPOTS } from '../data/world'
import { CAMP_RULES } from '../data/challenges'
import { piratesInRegion } from './challenges'
import type { GameEvent } from './events'
import { rollPlant } from './gathering'
import { mountSpeed, spareMounts } from './mounts'
import { helperCapacity, helperCount, storageCapacity, storageUsed } from './modifiers'
import type { Random } from './rng'
import { addItems, countItems, type GameState, type HelperState } from './state'

// ---------------------------------------------------------------------------------------------
// Recruiting

/** Glimmers to recruit the next helper of a type. */
export function recruitCost(state: GameState, type: HelperType): number {
  const owned = helperCount(state, type)
  return Math.round(HELPER_TYPES[type].baseCost * HELPER_RULES.costGrowth ** owned)
}

export type RecruitCheck = 'ok' | 'not-here' | 'locked' | 'no-room' | 'missing-glimmers'

export function checkRecruit(state: GameState, type: HelperType): RecruitCheck {
  if (state.player.travel || !isSettlement(state.player.place)) return 'not-here'
  const capacity = helperCapacity(state, type)
  if (capacity === 0) return 'locked'
  if (helperCount(state, type) >= capacity) return 'no-room'
  if (state.resources.glimmers < recruitCost(state, type)) return 'missing-glimmers'
  return 'ok'
}

/** Recruits a helper at a settlement; they set off for your home and start work right away. */
export function recruitHelper(state: GameState, type: HelperType): GameEvent[] {
  const check = checkRecruit(state, type)
  if (check !== 'ok') return [{ type: 'blocked', reason: check }]
  state.resources.glimmers -= recruitCost(state, type)
  const id = state.helpers.nextId++
  const helper: HelperState = {
    id,
    type,
    name: HELPER_NAMES[(id - 1) % HELPER_NAMES.length],
    task: type === 'gatherer' ? (state.player.lastSpot ?? Object.keys(SPOTS)[0]) : null,
    phase: 'idle',
    remainingMs: 0,
    tripSpot: null,
    tripItem: null,
    bag: {},
  }
  state.helpers.list.push(helper)
  return [{ type: 'recruited', helperId: id, helperType: type }]
}

/** Points a gatherer at a harvesting spot (or null to rest at home). Takes effect next trip. */
export function assignHelper(
  state: GameState,
  helperId: number,
  spotId: string | null,
): GameEvent[] {
  const helper = state.helpers.list.find((h) => h.id === helperId)
  if (!helper || helper.type !== 'gatherer') return [{ type: 'blocked', reason: 'locked' }]
  if (spotId !== null && !SPOTS[spotId]) return [{ type: 'blocked', reason: 'not-here' }]
  helper.task = spotId
  return []
}

export function setMinimum(state: GameState, itemId: string, amount: number): GameEvent[] {
  if (!supplyableItems().includes(itemId)) return [{ type: 'blocked', reason: 'locked' }]
  const value = Math.max(0, Math.floor(amount))
  if (value > 0) state.supply.minimums[itemId] = value
  else delete state.supply.minimums[itemId]
  return []
}

// ---------------------------------------------------------------------------------------------
// What supply helpers can fetch

/** Plants and spots that give an item, so supply helpers know where to go. */
function sourcesOf(itemId: string): { spotId: string; plantId: string }[] {
  const sources: { spotId: string; plantId: string }[] = []
  for (const spot of Object.values(SPOTS)) {
    for (const plantId of spot.plants) {
      if (PLANTS[plantId].yields.some((y) => y.itemId === itemId)) {
        sources.push({ spotId: spot.id, plantId })
      }
    }
  }
  return sources
}

/** Raw materials supply helpers know how to fetch. */
export function supplyableItems(): string[] {
  return Object.values(ITEMS)
    .filter((item) => item.category === 'raw' && sourcesOf(item.id).length > 0)
    .map((item) => item.id)
}

/** How many of an item a supply helper brings back from one trip. */
export function supplyHaul(itemId: string): number {
  const source = sourcesOf(itemId)[0]
  if (!source) return 0
  const plant = PLANTS[source.plantId]
  const plants = Math.max(
    1,
    Math.round(HELPER_RULES.plantsPerTrip * RARITY_HAUL_FACTOR[plant.rarity]),
  )
  const perPlant = plant.yields.find((y) => y.itemId === itemId)?.amount ?? 0
  return plants * perPlant
}

/** The item furthest below its minimum, counting what other supply helpers are already fetching. */
function nextShortage(state: GameState): string | null {
  let best: string | null = null
  let bestGap = 0
  for (const [itemId, minimum] of Object.entries(state.supply.minimums)) {
    let coming = 0
    for (const h of state.helpers.list) {
      if (h.type !== 'supply' || h.phase === 'idle') continue
      coming += h.tripItem === itemId ? supplyHaul(itemId) : 0
      coming += h.bag[itemId] ?? 0
    }
    const gap = minimum - (state.inventory[itemId] ?? 0) - coming
    if (gap > bestGap) {
      best = itemId
      bestGap = gap
    }
  }
  return best
}

// ---------------------------------------------------------------------------------------------
// Trips

/** What a helper brings back. Pirates camped in the region mean a smaller haul. */
function gather(state: GameState, helper: HelperState, random: Random): ItemStack[] {
  const spotId = helper.tripSpot!
  const share = piratesInRegion(state, SPOTS[spotId].regionId) ? CAMP_RULES.helperYield : 1
  if (helper.tripItem) {
    const amount = Math.max(1, Math.round(supplyHaul(helper.tripItem) * share))
    return [{ itemId: helper.tripItem, amount }]
  }
  const found: ItemStack[] = []
  const plants = Math.max(1, Math.round(HELPER_RULES.plantsPerTrip * share))
  for (let i = 0; i < plants; i++) found.push(...PLANTS[rollPlant(spotId, random)].yields)
  return found
}

/** Unpacks a helper's bag into storage, as much as fits. True once the bag is empty. */
function unload(state: GameState, helper: HelperState): boolean {
  let free = Math.max(0, storageCapacity(state) - storageUsed(state))
  for (const [itemId, amount] of Object.entries(helper.bag)) {
    const take = Math.min(amount, free)
    if (take <= 0) break
    free -= take
    addItems(state.inventory, itemId, take)
    addItems(helper.bag, itemId, -take)
  }
  return countItems(helper.bag) === 0
}

/**
 * A helper's flight time to or from a spot. Spare mounts (owned but not ridden) are lent to
 * helpers in order, fastest mount to the first helper.
 */
export function helperFlightMs(state: GameState, helper: HelperState, spotId: string): number {
  const base = baseTravelMs(HOME, spotId) ?? 0
  const index = state.helpers.list.findIndex((h) => h.id === helper.id)
  const mountId = spareMounts(state)[index]
  return mountId ? Math.ceil(base / mountSpeed(state, mountId)) : base
}

/** Picks the next trip for an idle helper. Returns false if there's nothing to do. */
function startTrip(state: GameState, helper: HelperState): boolean {
  const itemId = helper.type === 'supply' ? nextShortage(state) : null
  const spotId =
    helper.type === 'gatherer' ? helper.task : itemId ? sourcesOf(itemId)[0].spotId : null
  if (!spotId) return false
  helper.tripSpot = spotId
  helper.tripItem = itemId
  helper.phase = 'outbound'
  helper.remainingMs = helperFlightMs(state, helper, spotId)
  return true
}

/** Moves one helper through their trip: out, gather, back, unpack. Carries leftover time over. */
function stepHelper(state: GameState, helper: HelperState, dtMs: number, random: Random): void {
  let time = dtMs
  // A small cap on phase changes per step keeps a misconfigured trip from looping forever.
  for (let guard = 0; guard < 20; guard++) {
    if (helper.phase === 'idle') {
      if (!startTrip(state, helper)) return
      continue
    }
    if (helper.phase === 'unloading') {
      if (!unload(state, helper)) return // storage full: wait at home until there's room
      helper.phase = 'idle'
      helper.tripSpot = null
      helper.tripItem = null
      state.stats.helperTrips++
      continue
    }
    if (time < helper.remainingMs) {
      helper.remainingMs -= time
      return
    }
    time -= helper.remainingMs
    if (helper.phase === 'outbound') {
      helper.phase = 'gathering'
      helper.remainingMs = HELPER_RULES.gatherMs
    } else if (helper.phase === 'gathering') {
      for (const { itemId, amount } of gather(state, helper, random)) {
        addItems(helper.bag, itemId, amount)
      }
      helper.phase = 'returning'
      helper.remainingMs = helperFlightMs(state, helper, helper.tripSpot!)
    } else if (helper.phase === 'returning') {
      helper.phase = 'unloading'
      helper.remainingMs = 0
    }
  }
}

/** All helpers work, including while the game is closed. */
export function advanceHelpers(state: GameState, dtMs: number, random: Random): void {
  for (const helper of state.helpers.list) stepHelper(state, helper, dtMs, random)
}
