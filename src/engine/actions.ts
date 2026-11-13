import { drinkPotion } from './buffs'
import { startCraft } from './crafting'
import type { GameEvent } from './events'
import { depositSatchel, tapPlant } from './gathering'
import { startResearch } from './research'
import { stateRandom, type Random } from './rng'
import { addItems, type GameState } from './state'
import { simulate } from './tick'
import { dismissRequest, fulfillRequest } from './traders'
import { startTravel } from './travel'
import { buyUpgrade } from './upgrades'

/**
 * Everything the player (or the debug panel) can do to the game goes through an action.
 */
export type Action =
  | { type: 'travel/go'; to: string }
  | { type: 'gather/tap'; spotId: string; slot: number }
  | { type: 'satchel/deposit' }
  | { type: 'craft/start'; recipeId: string; count?: number }
  | { type: 'research/start'; researchId: string }
  | { type: 'potion/drink'; potionId: string }
  | { type: 'trade/fulfill'; requestId: number }
  | { type: 'trade/dismiss'; requestId: number }
  | { type: 'upgrade/buy'; upgradeId: string }
  | { type: 'debug/addGlimmers'; amount: number }
  | { type: 'debug/addItem'; itemId: string; amount: number }
  | { type: 'debug/skipTime'; ms: number }
  | { type: 'debug/setClickPower'; value: number }
  | { type: 'debug/completeResearch' }
  | { type: 'debug/traderNow' }

/** Applies an action and returns what happened, for the screen to show. */
export function applyAction(
  state: GameState,
  action: Action,
  random: Random = stateRandom(state),
): GameEvent[] {
  switch (action.type) {
    case 'travel/go':
      return startTravel(state, action.to)
    case 'gather/tap':
      return tapPlant(state, action.spotId, action.slot, random)
    case 'satchel/deposit':
      return depositSatchel(state)
    case 'craft/start':
      return startCraft(state, action.recipeId, action.count ?? 1)
    case 'research/start':
      return startResearch(state, action.researchId)
    case 'potion/drink':
      return drinkPotion(state, action.potionId)
    case 'trade/fulfill':
      return fulfillRequest(state, action.requestId)
    case 'trade/dismiss':
      return dismissRequest(state, action.requestId)
    case 'upgrade/buy':
      return buyUpgrade(state, action.upgradeId)

    case 'debug/addGlimmers':
      state.resources.glimmers = Math.max(0, state.resources.glimmers + action.amount)
      return []
    case 'debug/addItem':
      addItems(state.inventory, action.itemId, action.amount)
      return []
    case 'debug/skipTime':
      // Fast-forward game time as if the player kept playing (no offline cap).
      if (action.ms > 0) simulate(state, action.ms, { offline: false })
      return []
    case 'debug/setClickPower':
      state.player.clickPower = Math.max(1, Math.floor(action.value))
      return []
    case 'debug/completeResearch':
      if (state.research.current) {
        state.research.completed.push(state.research.current.id)
        state.research.current = null
      }
      return []
    case 'debug/traderNow':
      state.traders.nextArrivalMs = 0
      return []
  }
}
