import { curioOfflineMs } from './modifiers'
import type { GameState } from './state'
import { SYSTEMS, type System, type TickContext } from './systems'

const HOUR_MS = 60 * 60 * 1000

/** Gaps longer than this are treated as "away" time (closed tab, sleeping device). */
export const LIVE_GAP_MS = 5_000

/** Offline time is simulated in slices of this size so systems never see huge jumps. */
export const OFFLINE_STEP_MS = 60_000

/** Base offline progress cap (design doc Section 5). */
export const BASE_OFFLINE_CAP_MS = 4 * HOUR_MS

export function offlineCapMs(state: GameState): number {
  return BASE_OFFLINE_CAP_MS + state.bonuses.offlineCapMs + curioOfflineMs(state)
}

export interface AdvanceReport {
  /** Real time that passed since the last tick. */
  elapsedMs: number
  /** Time actually simulated (less than elapsed if the offline cap was hit). */
  simulatedMs: number
  /** True if this advance was offline catch-up rather than a normal live tick. */
  offline: boolean
  /** True if the offline cap cut the simulation short. */
  capped: boolean
}

/**
 * Brings the game up to `now`. Used both for live ticks and for catching up after the game
 * was closed, so offline progress always follows exactly the same rules as live play.
 */
export function advance(
  state: GameState,
  now: number,
  systems: readonly System[] = SYSTEMS,
): AdvanceReport {
  const elapsedMs = now - state.meta.lastTickAt
  state.meta.lastTickAt = now

  // Clock moved backwards (or no time passed): nothing to simulate.
  if (!(elapsedMs > 0)) return { elapsedMs: 0, simulatedMs: 0, offline: false, capped: false }

  if (elapsedMs <= LIVE_GAP_MS) {
    simulate(state, elapsedMs, { offline: false }, systems)
    return { elapsedMs, simulatedMs: elapsedMs, offline: false, capped: false }
  }

  const cap = offlineCapMs(state)
  const simulatedMs = Math.min(elapsedMs, cap)
  simulate(state, simulatedMs, { offline: true }, systems)
  return { elapsedMs, simulatedMs, offline: true, capped: elapsedMs > cap }
}

/** Runs all systems for `ms` of game time, in slices of at most OFFLINE_STEP_MS. */
export function simulate(
  state: GameState,
  ms: number,
  ctx: TickContext,
  systems: readonly System[] = SYSTEMS,
): void {
  let remaining = ms
  while (remaining > 0) {
    const step = Math.min(remaining, OFFLINE_STEP_MS)
    for (const system of systems) system.update(state, step, ctx)
    remaining -= step
  }
}
