import { POTIONS } from '../data/recipes'
import type { PotionEffect } from '../data/types'
import type { GameEvent } from './events'
import { addItems, type GameState } from './state'

function effects(state: GameState): PotionEffect[] {
  return state.buffs.flatMap((buff) =>
    POTIONS[buff.potionId] ? [POTIONS[buff.potionId].effect] : [],
  )
}

/** Click power including potions. Every rule that needs click power reads it from here. */
export function clickPower(state: GameState): number {
  let power = state.player.clickPower
  for (const effect of effects(state)) if (effect.kind === 'clickPower') power += effect.amount
  return power
}

export function wingSpeed(state: GameState): number {
  let speed = state.player.wingSpeed
  for (const effect of effects(state)) if (effect.kind === 'wingSpeed') speed *= effect.multiplier
  return speed
}

export function satchelCapacity(state: GameState): number {
  let capacity = state.player.satchelCapacity
  for (const effect of effects(state)) if (effect.kind === 'satchel') capacity += effect.amount
  return capacity
}

/** Multiplies how often uncommon and rarer plants grow. */
export function luck(state: GameState): number {
  let value = 1
  for (const effect of effects(state)) if (effect.kind === 'luck') value *= effect.multiplier
  return value
}

/**
 * Drinks a potion from storage. Drinking one that's already active adds its duration to the
 * time left instead of stacking the effect.
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
