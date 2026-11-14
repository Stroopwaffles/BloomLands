import { ITEMS } from '../data/items'
import { POST_RULES } from '../data/economy'
import { HOME, isSettlement } from '../data/world'
import type { BlockedReason, GameEvent } from './events'
import { hasQol, storageCapacity, storageUsed } from './modifiers'
import { routeOf } from './route'
import { addItems, countItems, type GameState } from './state'

/**
 * The Acorn Post (a comfort upgrade): from any settlement, send your whole satchel home for a
 * small fee. The parcel arrives in storage after a while, so long trips don't need a flight home
 * every time the satchel fills. Parcels travel while the game is closed, too.
 */

/** Glimmers to post what's in the satchel now. */
export function postFee(state: GameState): number {
  const items = countItems(state.player.satchel)
  return Math.max(POST_RULES.minFee, Math.ceil(items / POST_RULES.itemsPerGlimmer))
}

/** How long a parcel takes from a settlement to home (the courier is slower than you). */
export function postDelayMs(state: GameState, settlementId: string): number {
  const base = routeOf(state, settlementId, HOME)?.baseMs ?? 0
  return Math.max(POST_RULES.minDelayMs, Math.round(base * POST_RULES.delayFactor))
}

export function checkPost(state: GameState): 'ok' | BlockedReason {
  if (!hasQol(state, 'post')) return 'locked'
  if (state.player.travel || !isSettlement(state.player.place)) return 'not-here'
  if (countItems(state.player.satchel) === 0) return 'no-target'
  if (state.resources.glimmers < postFee(state)) return 'missing-glimmers'
  return 'ok'
}

/** Hands the whole satchel to the post. */
export function sendParcel(state: GameState): GameEvent[] {
  const check = checkPost(state)
  if (check !== 'ok') return [{ type: 'blocked', reason: check }]
  const fee = postFee(state)
  const items = { ...state.player.satchel }
  const arrivesInMs = postDelayMs(state, state.player.place)
  state.resources.glimmers -= fee
  state.player.satchel = {}
  state.post.parcels.push({
    id: state.post.nextId++,
    from: state.player.place,
    items,
    remainingMs: arrivesInMs,
  })
  return [{ type: 'parcel-sent', count: countItems(items), fee, arrivesInMs }]
}

/**
 * Parcels travel home, then unpack into storage as space allows (trinkets always fit). A parcel
 * that doesn't fit waits at the door until there's room.
 */
export function advancePost(state: GameState, dtMs: number): void {
  for (const parcel of state.post.parcels) {
    parcel.remainingMs = Math.max(0, parcel.remainingMs - dtMs)
    if (parcel.remainingMs > 0) continue
    const before = countItems(parcel.items)
    let free = Math.max(0, storageCapacity(state) - storageUsed(state))
    for (const [itemId, amount] of Object.entries(parcel.items)) {
      const isTrinket = ITEMS[itemId]?.category === 'trinket'
      const take = isTrinket ? amount : Math.min(amount, free)
      if (take <= 0) continue
      if (!isTrinket) free -= take
      addItems(state.inventory, itemId, take)
      addItems(parcel.items, itemId, -take)
    }
    const left = countItems(parcel.items)
    if (left < before && !parcel.announced) {
      parcel.announced = true
      state.inbox.push({ type: 'parcel-arrived', count: before - left, waiting: left })
    }
  }
  state.post.parcels = state.post.parcels.filter((p) => countItems(p.items) > 0)
}
