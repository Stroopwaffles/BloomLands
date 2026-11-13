import type { GameState } from '../state'

export interface TickContext {
  /** True while catching up on time that passed with the game closed or hidden. */
  offline: boolean
}

/**
 * A system advances one part of the game (gathering, brewing, helpers, ...) by a slice of time.
 * Systems must handle any dtMs (from a few ms up to a full offline step) and must only touch
 * the game state, never the screen.
 */
export interface System {
  id: string
  update(state: GameState, dtMs: number, ctx: TickContext): void
}
