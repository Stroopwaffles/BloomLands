import { ITEM_VALUES, SHOP_RULES } from '../data/economy'
import { ITEMS } from '../data/items'
import { PLANTS } from '../data/plants'
import { REGIONS, SETTLEMENTS, SPOTS } from '../data/world'
import type { BlockedReason, GameEvent } from './events'
import { satchelCapacity } from './modifiers'
import { addItems, countItems, type GameState } from './state'

/**
 * Settlement shops: each one sells the common plants of its own region, and buys anything the
 * player is carrying. Buying fills the satchel; selling empties it. Shops pay less than traders
 * and villagers (whose requests also grow the court and the land), so requests stay worthwhile.
 */

/** What an item is worth, before the shop's rates (trinkets have a fixed worth). */
export function itemWorth(itemId: string): number {
  if (ITEMS[itemId]?.category === 'trinket') return SHOP_RULES.trinketValue
  return ITEM_VALUES[itemId] ?? 0
}

/** Glimmers the shop pays for one. */
export function sellPrice(itemId: string): number {
  const worth = itemWorth(itemId)
  return worth > 0 ? Math.max(1, Math.floor(worth * SHOP_RULES.sellRate)) : 0
}

/** Glimmers one costs from the shop. */
export function buyPrice(itemId: string): number {
  return Math.ceil(itemWorth(itemId) * SHOP_RULES.buyRate)
}

/** The common raw materials that grow in a settlement's region (its open, non-secret spots). */
export function shopStock(settlementId: string): string[] {
  const settlement = SETTLEMENTS[settlementId]
  if (!settlement) return []
  const stock: string[] = []
  for (const spotId of REGIONS[settlement.regionId]?.spots ?? []) {
    const spot = SPOTS[spotId]
    if (!spot || spot.secret) continue
    for (const plantId of spot.plants) {
      const plant = PLANTS[plantId]
      if (plant.rarity !== 'common') continue
      for (const y of plant.yields) if (!stock.includes(y.itemId)) stock.push(y.itemId)
    }
  }
  return stock
}

function atShop(state: GameState): string | null {
  const place = state.player.place
  return !state.player.travel && SETTLEMENTS[place] ? place : null
}

export function checkSell(state: GameState, itemId: string, amount: number): 'ok' | BlockedReason {
  if (!atShop(state)) return 'not-here'
  if (amount < 1 || (state.player.satchel[itemId] ?? 0) < amount) return 'missing-items'
  if (sellPrice(itemId) <= 0) return 'locked'
  return 'ok'
}

/** Sells items from the satchel. */
export function sellItems(state: GameState, itemId: string, amount: number): GameEvent[] {
  const check = checkSell(state, itemId, amount)
  if (check !== 'ok') return [{ type: 'blocked', reason: check }]
  const glimmers = sellPrice(itemId) * amount
  addItems(state.player.satchel, itemId, -amount)
  state.resources.glimmers += glimmers
  state.stats.glimmersEarned += glimmers
  return [{ type: 'shop-sold', itemId, amount, glimmers }]
}

export function checkBuy(state: GameState, itemId: string, amount: number): 'ok' | BlockedReason {
  const settlementId = atShop(state)
  if (!settlementId) return 'not-here'
  if (amount < 1 || !shopStock(settlementId).includes(itemId)) return 'locked'
  if (countItems(state.player.satchel) + amount > satchelCapacity(state)) return 'satchel-full'
  if (state.resources.glimmers < buyPrice(itemId) * amount) return 'missing-glimmers'
  return 'ok'
}

/** Buys a region's common goods into the satchel. */
export function buyItems(state: GameState, itemId: string, amount: number): GameEvent[] {
  const check = checkBuy(state, itemId, amount)
  if (check !== 'ok') return [{ type: 'blocked', reason: check }]
  const glimmers = buyPrice(itemId) * amount
  state.resources.glimmers -= glimmers
  addItems(state.player.satchel, itemId, amount)
  return [{ type: 'shop-bought', itemId, amount, glimmers }]
}
