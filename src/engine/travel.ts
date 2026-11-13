import { baseTravelMs, HOME, SPOTS } from '../data/world'
import type { GameEvent } from './events'
import { depositSatchel, ensureSpot } from './gathering'
import { hasQol, wingSpeed } from './modifiers'
import type { Random } from './rng'
import { countItems, type GameState } from './state'

/** Flight time between two places for this player, or null if there's no route. */
export function travelMs(state: GameState, from: string, to: string): number | null {
  const base = baseTravelMs(from, to)
  if (base === null) return null
  return Math.ceil(base / wingSpeed(state))
}

/** Starts a flight. `auto` marks a flight home started by Homing Instinct. */
export function startTravel(state: GameState, to: string, auto = false): GameEvent[] {
  const { player } = state
  if (player.travel) return [{ type: 'blocked', reason: 'flying' }]
  if (to !== HOME && !SPOTS[to]) return [{ type: 'blocked', reason: 'not-here' }]
  const totalMs = travelMs(state, player.place, to)
  if (totalMs === null) return [{ type: 'blocked', reason: 'not-here' }]

  player.travel = { to, totalMs, remainingMs: totalMs, ...(auto ? { auto: true } : {}) }
  return [{ type: 'depart', to, totalMs, auto }]
}

/**
 * Moves the player along their flight. Arrival happens here, so it also works offline, along
 * with the comforts that trigger on arrival (Tidy Habits, Round Trips).
 */
export function advanceTravel(state: GameState, dtMs: number, random: Random): void {
  const { player } = state
  if (!player.travel) return
  player.travel.remainingMs -= dtMs
  if (player.travel.remainingMs > 0) return

  const wasAuto = player.travel.auto === true
  player.place = player.travel.to
  player.travel = null

  if (player.place !== HOME) {
    player.lastSpot = player.place
    ensureSpot(state, player.place, random)
    return
  }

  if (hasQol(state, 'auto-deposit')) depositSatchel(state)
  if (
    wasAuto &&
    hasQol(state, 'return-trip') &&
    player.lastSpot &&
    countItems(player.satchel) === 0
  ) {
    startTravel(state, player.lastSpot)
  }
}
