import {
  BREWER_KEEP,
  gathersAtSpot,
  PEDDLER_RULES,
  HELPER_NAMES,
  HELPER_RULES,
  HELPER_TYPES,
  RARITY_HAUL_FACTOR,
  SCOUT_RULES,
  type HelperType,
} from '../data/helpers'
import { ITEMS } from '../data/items'
import { PLANTS } from '../data/plants'
import { RECIPES } from '../data/recipes'
import type { ItemStack } from '../data/types'
import { baseTravelMs, HOME, isSettlement, placeRegion, SETTLEMENTS, SPOTS } from '../data/world'
import { CAMP_RULES } from '../data/challenges'
import { piratesInRegion } from './challenges'
import { canPay, payCost } from './costs'
import { stationInUse, unlockedRecipes } from './crafting'
import { weatherIn } from './environment'
import type { GameEvent } from './events'
import { rollPlant } from './gathering'
import { mountSpeed, spareMounts } from './mounts'
import { placeOpen, spotWatched } from './regions'
import { routeOf } from './route'
import { sellPrice } from './shop'
import {
  helperCapacity,
  helperCount,
  helperTripMultiplier,
  stationBuilt,
  stationSlots,
  storageCapacity,
  storageUsed,
  trinketChanceMultiplier,
} from './modifiers'
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
    task: gathersAtSpot(type) ? (state.player.lastSpot ?? Object.keys(SPOTS)[0]) : null,
    phase: 'idle',
    remainingMs: 0,
    tripSpot: null,
    tripItem: null,
    bag: {},
    ...(type === 'brewer' ? { keep: BREWER_KEEP.default } : {}),
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
  if (!helper || !gathersAtSpot(helper.type)) return [{ type: 'blocked', reason: 'locked' }]
  if (spotId !== null && (!SPOTS[spotId] || !placeOpen(state, spotId))) {
    return [{ type: 'blocked', reason: 'not-here' }]
  }
  helper.task = spotId
  return []
}

/** Tells a brewer which recipe to make (null: rest) and how much of it to keep in storage. */
export function setBrew(
  state: GameState,
  helperId: number,
  recipeId: string | null,
  keep?: number,
): GameEvent[] {
  const helper = state.helpers.list.find((h) => h.id === helperId)
  if (!helper || helper.type !== 'brewer') return [{ type: 'blocked', reason: 'locked' }]
  if (recipeId !== null && (!RECIPES[recipeId] || !unlockedRecipes(state).has(recipeId))) {
    return [{ type: 'blocked', reason: 'locked' }]
  }
  helper.task = recipeId
  if (keep !== undefined) helper.keep = Math.max(1, Math.floor(keep))
  return []
}

export type BrewCheck =
  'ok' | 'no-recipe' | 'not-built' | 'enough' | 'station-busy' | 'missing-items'

/** Can this brewer start another batch right now? (Also explains why not, for the screen.) */
export function brewCheck(state: GameState, helper: HelperState): BrewCheck {
  const recipe = helper.task ? RECIPES[helper.task] : null
  if (!recipe || !unlockedRecipes(state).has(recipe.id)) return 'no-recipe'
  if (!stationBuilt(state, recipe.station)) return 'not-built'
  const keep = helper.keep ?? BREWER_KEEP.default
  if ((state.inventory[recipe.output.itemId] ?? 0) >= keep) return 'enough'
  if (stationInUse(state, recipe.station) >= stationSlots(state, recipe.station)) {
    return 'station-busy'
  }
  if (!canPay(state, recipe.inputs)) return 'missing-items'
  return 'ok'
}

/** Sets the most of an item to keep in storage (0 = no limit). Peddlers sell anything above it. */
export function setMaximum(state: GameState, itemId: string, amount: number): GameEvent[] {
  if (!ITEMS[itemId] || sellPrice(itemId) <= 0) return [{ type: 'blocked', reason: 'locked' }]
  const value = Math.max(0, Math.floor(amount))
  if (value > 0) state.supply.maximums[itemId] = value
  else delete state.supply.maximums[itemId]
  return []
}

/** How far above its storage limit an item is (0 if it has no limit or is under it). */
export function surplus(state: GameState, itemId: string): number {
  const max = state.supply.maximums[itemId]
  if (!max) return 0
  return Math.max(0, (state.inventory[itemId] ?? 0) - max)
}

/** The item furthest above its limit, if any. */
function nextSurplus(state: GameState): string | null {
  let best: string | null = null
  let bestOver = 0
  for (const itemId of Object.keys(state.supply.maximums)) {
    const over = surplus(state, itemId)
    if (over > bestOver) {
      best = itemId
      bestOver = over
    }
  }
  return best
}

/** The village shop nearest home (among open regions), where peddlers sell. */
export function nearestMarket(state: GameState): string | null {
  let best: string | null = null
  let bestMs = Infinity
  for (const id of Object.keys(SETTLEMENTS)) {
    if (!placeOpen(state, id)) continue
    const ms = routeOf(state, HOME, id)?.baseMs ?? Infinity
    if (ms < bestMs) {
      best = id
      bestMs = ms
    }
  }
  return best
}

/** A peddler packs the biggest surplus (up to a haul) and heads for market. */
function startPeddling(state: GameState, helper: HelperState): boolean {
  const itemId = nextSurplus(state)
  const market = nearestMarket(state)
  if (!itemId || !market) return false
  const amount = Math.min(surplus(state, itemId), PEDDLER_RULES.haul)
  addItems(state.inventory, itemId, -amount)
  addItems(helper.bag, itemId, amount)
  helper.tripSpot = market
  helper.tripItem = itemId
  helper.phase = 'outbound'
  helper.remainingMs = helperFlightMs(state, helper, market)
  return true
}

/** At the shop: everything in the bag is sold, and the Glimmers go in the purse. */
function sellBag(helper: HelperState): void {
  let glimmers = 0
  for (const [itemId, amount] of Object.entries(helper.bag)) glimmers += sellPrice(itemId) * amount
  helper.bag = {}
  helper.purse = (helper.purse ?? 0) + glimmers
}

/** A brewer takes the ingredients and starts a batch at the station. */
function startBrew(state: GameState, helper: HelperState): boolean {
  if (brewCheck(state, helper) !== 'ok') return false
  const recipe = RECIPES[helper.task!]
  payCost(state, recipe.inputs)
  helper.tripItem = recipe.id
  helper.phase = 'gathering'
  helper.remainingMs = recipe.durationMs
  return true
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

/**
 * Plants and spots that give an item, so supply helpers know where to go. With a game state, only
 * spots the player has opened (and no secret areas) count.
 */
function sourcesOf(itemId: string, state?: GameState): { spotId: string; plantId: string }[] {
  const sources: { spotId: string; plantId: string }[] = []
  for (const spot of Object.values(SPOTS)) {
    if (spot.secret) continue
    if (state && !placeOpen(state, spot.id)) continue
    for (const plantId of spot.plants) {
      if (PLANTS[plantId].yields.some((y) => y.itemId === itemId)) {
        sources.push({ spotId: spot.id, plantId })
      }
    }
  }
  return sources
}

/** Raw materials supply helpers know how to fetch (with a state: only from opened regions). */
export function supplyableItems(state?: GameState): string[] {
  return Object.values(ITEMS)
    .filter((item) => item.category === 'raw' && sourcesOf(item.id, state).length > 0)
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
    if (sourcesOf(itemId, state).length === 0) continue
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

/** What a scout finds: trinkets from the spot (and the odd second one). */
function scoutFinds(state: GameState, spotId: string, random: Random): ItemStack[] {
  const trinkets = SPOTS[spotId].trinkets
  if (trinkets.length === 0) return []
  // Curios that make trinkets likelier help scouts too, in proportion.
  const boost = trinketChanceMultiplier(state)
  const found: ItemStack[] = []
  if (random() < Math.min(1, SCOUT_RULES.trinketChance * boost)) {
    found.push({ itemId: trinkets[Math.floor(random() * trinkets.length)], amount: 1 })
    if (random() < Math.min(1, SCOUT_RULES.secondChance * boost)) {
      found.push({ itemId: trinkets[Math.floor(random() * trinkets.length)], amount: 1 })
    }
  }
  return found
}

/** What a helper brings back. Pirates camped in the region mean a smaller haul. */
function gather(state: GameState, helper: HelperState, random: Random): ItemStack[] {
  const spotId = helper.tripSpot!
  if (helper.type === 'scout') return scoutFinds(state, spotId, random)
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
    // Trinkets are keepsakes and take no storage space.
    const isTrinket = ITEMS[itemId]?.category === 'trinket'
    const take = isTrinket ? amount : Math.min(amount, free)
    if (take <= 0) continue
    if (!isTrinket) free -= take
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
  // Muggy heat slows helpers down; the Reed Pipe speeds them up.
  const weather = weatherIn(state, placeRegion(spotId)).helperTrips ?? 1
  // Helpers take the Spirit Path too, when it's quicker.
  const route = routeOf(state, HOME, spotId)?.baseMs ?? baseTravelMs(HOME, spotId) ?? 0
  const base = route * weather * helperTripMultiplier(state)
  const index = state.helpers.list.findIndex((h) => h.id === helper.id)
  const mountId = spareMounts(state)[index]
  return Math.ceil(mountId ? base / mountSpeed(state, mountId) : base)
}

/** Picks the next trip for an idle helper. Returns false if there's nothing to do. */
function startTrip(state: GameState, helper: HelperState): boolean {
  const itemId = helper.type === 'supply' ? nextShortage(state) : null
  const spotId = gathersAtSpot(helper.type)
    ? helper.task
    : itemId
      ? (sourcesOf(itemId, state).find((s) => !spotWatched(state, s.spotId))?.spotId ?? null)
      : null
  // A watched (blocked) spot: wait at home until it's clear (design doc 3.15).
  if (!spotId || spotWatched(state, spotId)) return false
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
      const started =
        helper.type === 'brewer'
          ? startBrew(state, helper)
          : helper.type === 'peddler'
            ? startPeddling(state, helper)
            : startTrip(state, helper)
      if (!started) return
      continue
    }
    if (helper.phase === 'unloading' && helper.type === 'peddler') {
      const glimmers = helper.purse ?? 0
      state.resources.glimmers += glimmers
      state.stats.glimmersEarned += glimmers
      helper.purse = 0
      helper.phase = 'idle'
      helper.tripSpot = null
      helper.tripItem = null
      state.stats.helperTrips++
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
    if (helper.type === 'brewer') {
      // A batch is done: it goes straight into storage, like the player's own crafting.
      const recipe = RECIPES[helper.tripItem ?? '']
      if (recipe) {
        addItems(state.inventory, recipe.output.itemId, recipe.output.amount)
        state.stats.itemsCrafted += recipe.output.amount
      }
      helper.phase = 'idle'
      helper.tripItem = null
      helper.remainingMs = 0
      continue
    }
    if (helper.phase === 'outbound') {
      helper.phase = 'gathering'
      helper.remainingMs = helper.type === 'peddler' ? PEDDLER_RULES.sellMs : HELPER_RULES.gatherMs
    } else if (helper.phase === 'gathering') {
      if (helper.type === 'peddler') {
        sellBag(helper)
      } else {
        for (const { itemId, amount } of gather(state, helper, random)) {
          addItems(helper.bag, itemId, amount)
        }
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
