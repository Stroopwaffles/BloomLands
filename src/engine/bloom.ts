import { CURIOS } from '../data/bloom'
import type { GameEvent } from './events'
import { bloomLevel, regionBloomMultiplier } from './modifiers'
import type { GameState } from './state'

/** Adds bloom to a region. Bloom never goes down (design doc 3.9). */
export function addBloom(state: GameState, regionId: string, amount: number): GameEvent[] {
  if (amount <= 0) return []
  amount = Math.round(amount * regionBloomMultiplier(state, regionId))
  const before = bloomLevel(state, regionId)
  state.bloom[regionId] = (state.bloom[regionId] ?? 0) + amount
  const after = bloomLevel(state, regionId)
  return [{ type: 'bloom', regionId, amount, levelUp: after > before }]
}

/** Gives the player a curio (once). */
export function giveCurio(state: GameState, curioId: string): GameEvent[] {
  if (!CURIOS[curioId] || state.curios.includes(curioId)) return []
  state.curios.push(curioId)
  return [{ type: 'curio', curioId }]
}
