import { baseTravelMs, HOME, SPOTS } from '../data/world'
import { wingSpeed } from './buffs'
import type { GameEvent } from './events'
import { ensureSpot } from './gathering'
import type { Random } from './rng'
import type { GameState } from './state'

/** Flight time between two places for this player, or null if there's no route. */
export function travelMs(state: GameState, from: string, to: string): number | null {
  const base = baseTravelMs(from, to)
  if (base === null) return null
  return Math.ceil(base / wingSpeed(state))
}

export function startTravel(state: GameState, to: string): GameEvent[] {
  const { player } = state
  if (player.travel) return [{ type: 'blocked', reason: 'flying' }]
  if (to !== HOME && !SPOTS[to]) return [{ type: 'blocked', reason: 'not-here' }]
  const totalMs = travelMs(state, player.place, to)
  if (totalMs === null) return [{ type: 'blocked', reason: 'not-here' }]

  player.travel = { to, totalMs, remainingMs: totalMs }
  return [{ type: 'depart', to, totalMs }]
}

/** Moves the player along their flight. Arrival happens here, so it also works offline. */
export function advanceTravel(state: GameState, dtMs: number, random: Random): void {
  const { player } = state
  if (!player.travel) return
  player.travel.remainingMs -= dtMs
  if (player.travel.remainingMs > 0) return

  player.place = player.travel.to
  player.travel = null
  if (player.place !== HOME) ensureSpot(state, player.place, random)
}
