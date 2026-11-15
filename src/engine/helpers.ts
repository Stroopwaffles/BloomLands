import {
  BREWER_KEEP,
  gathersAtSpot,
  PEDDLER_RULES,
  HELPER_NAMES,
  HELPER_RULES,
  HELPER_TYPES,
  searchBonus,
  SUPPLY_RULES,
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
import { plantWeights, rollPlant } from './gathering'
import { mountSpeed, spareMounts } from './mounts'
import { grounded, placeOpen, spotWatched } from './regions'
import { routeOf } from './route'
import { sellPrice } from './shop'
import { rollScoutSecret } from './secrets'
import {
  helperCapacity,
  helperCount,
  helperTripMultiplier,
  stationBuilt,
  stationSlots,
  storageCapacity,
  supplyKeenness,
  storageUsed,
  trinketChanceMultiplier,
  scoutTrinketMultiplier,
  helperYieldMultiplier,
  recruitCostMultiplier,
  weatherCleared,
} from './modifiers'
import type { Random } from './rng'
import { addItems, countItems, type GameState, type HelperState } from './state'

// ---------------------------------------------------------------------------------------------
// Recruiting

/** Glimmers to recruit the next helper of a type. */
export function recruitCost(state: GameState, type: HelperType): number {
  const owned = helperCount(state, type)
  const base = HELPER_TYPES[type].baseCost * HELPER_RULES.costGrowth ** owned
  return Math.round(base * recruitCostMultiplier(state))
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
  helper.purse = (helper.purse ?? 0) + Math.floor(glimmers * PEDDLER_RULES.share)
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

/** One searched plant's chance of being the item, and how many it gives, at a spot right now. */
export function searchOdds(
  state: GameState,
  spotId: string,
  itemId: string,
): { chance: number; perPlant: number } {
  const keenness = supplyKeenness(state)
  let target = 0
  let other = 0
  let perPlant = 0
  for (const [plantId, weight] of plantWeights(state, spotId)) {
    const plant = PLANTS[plantId]
    const yields = plant.yields.find((y) => y.itemId === itemId)
    const bonus = yields ? searchBonus(plant.rarity, keenness) : 0
    if (yields && bonus > 0) {
      target += weight * bonus
      perPlant = Math.max(perPlant, yields.amount)
    } else {
      other += weight
    }
  }
  return { chance: target > 0 ? target / (target + other) : 0, perPlant }
}

/** How many a supply helper finds on an average trip to a spot (pirates in the region halve it). */
function expectedFind(state: GameState, spotId: string, itemId: string): number {
  const { chance, perPlant } = searchOdds(state, spotId, itemId)
  // Pirates nearby take a share; the Still-Water Pearl brings back more.
  const share =
    (piratesInRegion(state, SPOTS[spotId].regionId) ? CAMP_RULES.helperYield : 1) *
    helperYieldMultiplier(state)
  return Math.round(SUPPLY_RULES.searches * share) * chance * perPlant
}

/** The best spot to search for an item right now (open, not watched), and what to expect. */
export function bestSource(
  state: GameState,
  itemId: string,
): { spotId: string; expected: number } | null {
  let best: { spotId: string; expected: number } | null = null
  for (const { spotId } of sourcesOf(itemId, state)) {
    if (spotWatched(state, spotId)) continue
    const expected = expectedFind(state, spotId, itemId)
    if (expected > 0 && (!best || expected > best.expected)) best = { spotId, expected }
  }
  return best
}

/** How many of an item a supply helper brings back on an average trip right now. */
export function supplyHaul(state: GameState, itemId: string): number {
  return bestSource(state, itemId)?.expected ?? 0
}

export type SupplyStatus = 'ok' | 'too-rare' | 'not-now'

/** Can suppliers fetch this item: yes; not until the court learns about rare plants; or not now. */
export function supplyStatus(state: GameState, itemId: string): SupplyStatus {
  if (supplyHaul(state, itemId) > 0) return 'ok'
  const keenness = supplyKeenness(state)
  const rareOnly = sourcesOf(itemId, state).every(
    ({ plantId }) => searchBonus(PLANTS[plantId].rarity, keenness) === 0,
  )
  return rareOnly ? 'too-rare' : 'not-now'
}

/** The item furthest below its minimum, counting what other supply helpers are already fetching. */
function nextShortage(state: GameState): string | null {
  let best: string | null = null
  let bestGap = 0
  for (const [itemId, minimum] of Object.entries(state.supply.minimums)) {
    const haul = supplyHaul(state, itemId)
    if (haul <= 0) continue // out of reach (too rare, or out of season right now)
    let coming = 0
    for (const h of state.helpers.list) {
      if (h.type !== 'supply' || h.phase === 'idle') continue
      coming += h.tripItem === itemId && h.phase !== 'returning' ? haul : 0
      coming += h.bag[itemId] ?? 0
    }
    const gap = minimum - (state.inventory[itemId] ?? 0) - coming
    // Hauls are averages now, so only set out for at least one whole missing item.
    if (gap >= 1 && gap > bestGap) {
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
  const boost = trinketChanceMultiplier(state) * scoutTrinketMultiplier(state)
  // While searching, a scout may also stumble on a hidden passage (the Sunken Geode).
  state.inbox.push(...rollScoutSecret(state, SPOTS[spotId].regionId, random))
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
    // Search plant by plant, with the player's odds plus the helper's eye for what they want.
    const { chance, perPlant } = searchOdds(state, spotId, helper.tripItem)
    let amount = 0
    const searches = Math.round(SUPPLY_RULES.searches * share)
    for (let i = 0; i < searches; i++) if (random() < chance) amount += perPlant
    return amount > 0 ? [{ itemId: helper.tripItem, amount }] : []
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
  const sky = weatherIn(state, placeRegion(spotId))
  const weather = weatherCleared(state, sky.id) ? 1 : (sky.helperTrips ?? 1)
  // Helpers take the Spirit Path too, when it's quicker.
  const route = routeOf(state, HOME, spotId)?.baseMs ?? baseTravelMs(HOME, spotId) ?? 0
  const base = route * weather * helperTripMultiplier(state)
  const index = state.helpers.list.findIndex((h) => h.id === helper.id)
  const mountId = spareMounts(state)[index]
  return Math.ceil(mountId ? base / mountSpeed(state, mountId) : base)
}

/** Helpers busy at a place right now (gathering, searching, or selling at a village shop). */
export function helpersAt(state: GameState, placeId: string): HelperState[] {
  return state.helpers.list.filter((h) => h.phase === 'gathering' && h.tripSpot === placeId)
}

/**
 * Where a flying helper is on their trip: `t` runs from 0 (home) to 1 (their spot), whichever
 * way they're going. Null when they aren't in the air.
 */
export function helperFlight(
  state: GameState,
  helper: HelperState,
): { spotId: string; t: number; returning: boolean } | null {
  if (helper.phase !== 'outbound' && helper.phase !== 'returning') return null
  if (!helper.tripSpot) return null
  const total = helperFlightMs(state, helper, helper.tripSpot)
  const left = total > 0 ? Math.min(1, Math.max(0, helper.remainingMs / total)) : 0
  const returning = helper.phase === 'returning'
  return { spotId: helper.tripSpot, t: returning ? left : 1 - left, returning }
}

/** Picks the next trip for an idle helper. Returns false if there's nothing to do. */
function startTrip(state: GameState, helper: HelperState): boolean {
  const itemId = helper.type === 'supply' ? nextShortage(state) : null
  const spotId = gathersAtSpot(helper.type)
    ? helper.task
    : itemId
      ? (bestSource(state, itemId)?.spotId ?? null)
      : null
  // A watched (blocked) spot: wait at home until it's clear (design doc 3.15). Storms too.
  if (!spotId || spotWatched(state, spotId) || grounded(state, HOME, spotId)) return false
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
