import type { GameState } from './state'
import { simulate } from './tick'

/**
 * Everything the player (or the debug panel) can do to the game goes through an action.
 * Later milestones add actions such as tapping a plant or starting a brew.
 */
export type Action =
  | { type: 'debug/addGlimmers'; amount: number }
  | { type: 'debug/addItem'; itemId: string; amount: number }
  | { type: 'debug/skipTime'; ms: number }

export function applyAction(state: GameState, action: Action): void {
  switch (action.type) {
    case 'debug/addGlimmers':
      state.resources.glimmers = Math.max(0, state.resources.glimmers + action.amount)
      return
    case 'debug/addItem': {
      const next = (state.inventory[action.itemId] ?? 0) + action.amount
      if (next > 0) state.inventory[action.itemId] = next
      else delete state.inventory[action.itemId]
      return
    }
    case 'debug/skipTime':
      // Fast-forward game time as if the player kept playing (no offline cap).
      if (action.ms > 0) simulate(state, action.ms, { offline: false })
      return
  }
}
