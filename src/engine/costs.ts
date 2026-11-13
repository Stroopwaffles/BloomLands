import { itemHasTag } from '../data/items'
import type { CostEntry } from '../data/types'
import { addItems } from './state'

type Stock = Record<string, number>

/** How many of the stock can pay for this entry (the item itself, or all items with the tag). */
export function available(stock: Stock, entry: CostEntry): number {
  if ('itemId' in entry) return stock[entry.itemId] ?? 0
  let total = 0
  for (const [itemId, amount] of Object.entries(stock)) {
    if (itemHasTag(itemId, entry.tag)) total += amount
  }
  return total
}

/** Several stocks (e.g. satchel and storage) added together, for display and checks. */
export function mergeStocks(...stocks: Stock[]): Stock {
  const merged: Stock = {}
  for (const stock of stocks) {
    for (const [itemId, amount] of Object.entries(stock)) addItems(merged, itemId, amount)
  }
  return merged
}

export function canAfford(stock: Stock, cost: readonly CostEntry[]): boolean {
  // Specific items are checked before tags so a tag can't "use up" an item another entry needs.
  const remaining = { ...stock }
  for (const entry of sortCost(cost)) {
    if (available(remaining, entry) < entry.amount) return false
    takeUpTo(remaining, entry, entry.amount)
  }
  return true
}

/** Removes the cost from stock. Returns false (and changes nothing) if it can't be paid. */
export function pay(stock: Stock, cost: readonly CostEntry[]): boolean {
  return payFrom([stock], cost)
}

/** True if the stocks together can pay the cost. */
export function canAffordFrom(stocks: Stock[], cost: readonly CostEntry[]): boolean {
  return canAfford(mergeStocks(...stocks), cost)
}

/**
 * Pays the cost from several stocks, drawing from them in order (the first is used up before
 * the next is touched). Returns false (and changes nothing) if they can't pay it together.
 */
export function payFrom(stocks: Stock[], cost: readonly CostEntry[]): boolean {
  if (!canAffordFrom(stocks, cost)) return false
  for (const entry of sortCost(cost)) {
    let needed = entry.amount
    for (const stock of stocks) {
      if (needed <= 0) break
      needed -= takeUpTo(stock, entry, needed)
    }
  }
  return true
}

function sortCost(cost: readonly CostEntry[]): CostEntry[] {
  return [...cost].sort((a, b) => Number('tag' in a) - Number('tag' in b))
}

/**
 * Takes up to `limit` of an entry from stock and returns how many were taken.
 * Tags draw from the largest stacks first.
 */
function takeUpTo(stock: Stock, entry: CostEntry, limit: number): number {
  if ('itemId' in entry) {
    const used = Math.min(stock[entry.itemId] ?? 0, limit)
    if (used > 0) addItems(stock, entry.itemId, -used)
    return used
  }
  let needed = limit
  const matching = Object.entries(stock)
    .filter(([itemId]) => itemHasTag(itemId, entry.tag))
    .sort(([, a], [, b]) => b - a)
  for (const [itemId, amount] of matching) {
    if (needed <= 0) break
    const used = Math.min(amount, needed)
    addItems(stock, itemId, -used)
    needed -= used
  }
  return limit - needed
}
