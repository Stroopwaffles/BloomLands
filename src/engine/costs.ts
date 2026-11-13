import { itemHasTag } from '../data/items'
import type { CostEntry } from '../data/types'
import { addItems } from './state'

/** How many of the stock can pay for this entry (the item itself, or all items with the tag). */
export function available(stock: Record<string, number>, entry: CostEntry): number {
  if ('itemId' in entry) return stock[entry.itemId] ?? 0
  let total = 0
  for (const [itemId, amount] of Object.entries(stock)) {
    if (itemHasTag(itemId, entry.tag)) total += amount
  }
  return total
}

export function canAfford(stock: Record<string, number>, cost: readonly CostEntry[]): boolean {
  // Specific items are checked before tags so a tag can't "use up" an item another entry needs.
  const remaining = { ...stock }
  for (const entry of sortCost(cost)) {
    if (available(remaining, entry) < entry.amount) return false
    take(remaining, entry)
  }
  return true
}

/** Removes the cost from stock. Returns false (and changes nothing) if it can't be paid. */
export function pay(stock: Record<string, number>, cost: readonly CostEntry[]): boolean {
  if (!canAfford(stock, cost)) return false
  for (const entry of sortCost(cost)) take(stock, entry)
  return true
}

function sortCost(cost: readonly CostEntry[]): CostEntry[] {
  return [...cost].sort((a, b) => Number('tag' in a) - Number('tag' in b))
}

/** Takes an entry from stock. Tags draw from the largest stacks first. */
function take(stock: Record<string, number>, entry: CostEntry): void {
  if ('itemId' in entry) {
    addItems(stock, entry.itemId, -entry.amount)
    return
  }
  let needed = entry.amount
  const matching = Object.entries(stock)
    .filter(([itemId]) => itemHasTag(itemId, entry.tag))
    .sort(([, a], [, b]) => b - a)
  for (const [itemId, amount] of matching) {
    if (needed <= 0) break
    const used = Math.min(amount, needed)
    addItems(stock, itemId, -used)
    needed -= used
  }
}
