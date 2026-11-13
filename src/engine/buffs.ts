import { POTIONS } from '../data/recipes'
import type { GameEvent } from './events'
import { addItems, type GameState } from './state'

/**
 * Drinks a potion from storage. Drinking one that's already active adds its duration to the
 * time left instead of stacking the effect. (Effects are applied in modifiers.ts.)
 */
export function drinkPotion(state: GameState, potionId: string): GameEvent[] {
  const potion = POTIONS[potionId]
  if (!potion) return [{ type: 'blocked', reason: 'locked' }]
  if ((state.inventory[potionId] ?? 0) < 1) return [{ type: 'blocked', reason: 'missing-items' }]

  addItems(state.inventory, potionId, -1)
  const active = state.buffs.find((buff) => buff.potionId === potionId)
  if (active) active.remainingMs += potion.durationMs
  else state.buffs.push({ potionId, remainingMs: potion.durationMs })
  state.stats.potionsDrunk++
  return [{ type: 'drink', potionId }]
}

export function advanceBuffs(state: GameState, dtMs: number): void {
  for (const buff of state.buffs) buff.remainingMs -= dtMs
  if (state.buffs.some((buff) => buff.remainingMs <= 0)) {
    state.buffs = state.buffs.filter((buff) => buff.remainingMs > 0)
  }
}
