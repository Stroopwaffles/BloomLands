import { ITEM_VALUES, TRADER_RULES, TRADERS } from '../data/economy'
import { ITEMS } from '../data/items'
import { PLANTS } from '../data/plants'
import { SPOTS } from '../data/world'
import { RECIPES } from '../data/recipes'
import type { ItemStack } from '../data/types'
import { canPay, payCost } from './costs'
import { unlockedRecipes } from './crafting'
import type { GameEvent } from './events'
import { stationBuilt, traderPayMultiplier } from './modifiers'
import { openSpots } from './regions'
import type { Random } from './rng'
import { addItems, type GameState, type TradeRequest } from './state'

/** Items a trader might ask for: raw plants, plus anything the player can currently craft. */
/** A raw material that grows in an open, non-secret spot. */
function reachableRaw(state: GameState, itemId: string): boolean {
  return openSpots(state).some(
    (spotId) =>
      !SPOTS[spotId].secret &&
      SPOTS[spotId].plants.some((p) => PLANTS[p].yields.some((y) => y.itemId === itemId)),
  )
}

export function requestableItems(state: GameState): string[] {
  const items = Object.keys(ITEM_VALUES).filter(
    (id) => ITEMS[id]?.category === 'raw' && reachableRaw(state, id),
  )
  for (const recipeId of unlockedRecipes(state)) {
    const recipe = RECIPES[recipeId]
    if (recipe && stationBuilt(state, recipe.station) && ITEM_VALUES[recipe.output.itemId]) {
      items.push(recipe.output.itemId)
    }
  }
  return items
}

function between(random: Random, min: number, max: number): number {
  return min + Math.floor(random() * (max - min + 1))
}

function amountFor(itemId: string, random: Random): number {
  const value = ITEM_VALUES[itemId]
  switch (ITEMS[itemId]?.category) {
    case 'raw':
      return value >= 20 ? 1 : between(random, 5, 12)
    case 'refined':
      return between(random, 2, 4)
    case 'component':
      return between(random, 1, 2)
    default:
      return 1
  }
}

/** One or two things to ask for, and what they're worth in Glimmers. */
export function rollWants(state: GameState, random: Random): { wants: ItemStack[]; value: number } {
  const pool = requestableItems(state)
  const wants: ItemStack[] = []
  const kinds = random() < 0.4 ? 2 : 1
  for (let i = 0; i < kinds && pool.length > 0; i++) {
    const index = Math.floor(random() * pool.length)
    const itemId = pool.splice(index, 1)[0]
    wants.push({ itemId, amount: amountFor(itemId, random) })
  }
  const value = wants.reduce((sum, w) => sum + ITEM_VALUES[w.itemId] * w.amount, 0)
  return { wants, value }
}

export function makeRequest(state: GameState, random: Random): TradeRequest {
  const { wants, value } = rollWants(state, random)
  const trinkets = Object.values(ITEMS).filter((item) => item.category === 'trinket')
  const trinketId =
    random() < TRADER_RULES.trinketChance
      ? trinkets[Math.floor(random() * trinkets.length)].id
      : null
  return {
    id: state.traders.nextRequestId++,
    traderId: TRADERS[Math.floor(random() * TRADERS.length)].id,
    wants,
    glimmers: Math.round(value * TRADER_RULES.rewardMultiplier),
    trinketId,
    remainingMs: TRADER_RULES.expiryMs,
  }
}

/** Requests expire, and new traders arrive while there's room (also offline). */
export function advanceTraders(state: GameState, dtMs: number, random: Random): void {
  const { traders } = state
  for (const request of traders.requests) request.remainingMs -= dtMs
  if (traders.requests.some((r) => r.remainingMs <= 0)) {
    traders.requests = traders.requests.filter((r) => r.remainingMs > 0)
  }
  if (traders.requests.length >= TRADER_RULES.maxRequests) return
  traders.nextArrivalMs -= dtMs
  if (traders.nextArrivalMs > 0) return
  traders.requests.push(makeRequest(state, random))
  traders.nextArrivalMs = TRADER_RULES.arrivalMs
}

export type TradeCheck = 'ok' | 'not-home' | 'missing-items' | 'locked'

export function checkTrade(state: GameState, requestId: number): TradeCheck {
  const request = state.traders.requests.find((r) => r.id === requestId)
  if (!request) return 'locked'
  if (state.player.travel || state.player.place !== 'home') return 'not-home'
  if (!canPay(state, request.wants)) return 'missing-items'
  return 'ok'
}

export function fulfillRequest(state: GameState, requestId: number): GameEvent[] {
  const check = checkTrade(state, requestId)
  if (check !== 'ok') return [{ type: 'blocked', reason: check }]
  const request = state.traders.requests.find((r) => r.id === requestId)!
  payCost(state, request.wants)
  const glimmers = Math.round(request.glimmers * traderPayMultiplier(state))
  state.resources.glimmers += glimmers
  if (request.trinketId) addItems(state.inventory, request.trinketId, 1)
  state.traders.requests = state.traders.requests.filter((r) => r.id !== requestId)
  state.stats.requestsFilled++
  state.stats.glimmersEarned += glimmers
  return [{ type: 'trade-filled', requestId, glimmers, trinketId: request.trinketId }]
}

export function dismissRequest(state: GameState, requestId: number): GameEvent[] {
  state.traders.requests = state.traders.requests.filter((r) => r.id !== requestId)
  return []
}
