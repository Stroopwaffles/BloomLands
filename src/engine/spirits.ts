import { BLOOM_REWARDS } from '../data/bloom'
import { SPIRITS, type SpiritRequirement } from '../data/spirits'
import { addBloom } from './bloom'
import { canPay, payCost } from './costs'
import type { GameEvent } from './events'
import { bloomLevel } from './modifiers'
import type { GameState } from './state'

/**
 * Spirits of the land (design doc 3.9). Each one sleeps until its requirements are met; awakening
 * it gives the region a big bloom boost. (Relics from spirits arrive with prestige, M14.)
 */

export function requirementMet(
  state: GameState,
  spiritId: string,
  req: SpiritRequirement,
): boolean {
  switch (req.kind) {
    case 'bloom':
      return bloomLevel(state, SPIRITS[spiritId].regionId) >= req.level
    case 'story':
      return state.stories[req.storyId]?.complete === true
    case 'offering':
      return canPay(state, req.items)
  }
}

export function spiritAwake(state: GameState, spiritId: string): boolean {
  return state.spirits[spiritId]?.awakened === true
}

export type SpiritCheck = 'ok' | 'not-here' | 'already-done' | 'missing-items'

export function checkSpirit(state: GameState, spiritId: string): SpiritCheck {
  const spirit = SPIRITS[spiritId]
  if (!spirit || state.player.travel || state.player.place !== spirit.place) return 'not-here'
  if (spiritAwake(state, spiritId)) return 'already-done'
  if (!spirit.requirements.every((req) => requirementMet(state, spiritId, req))) {
    return 'missing-items'
  }
  return 'ok'
}

/** Makes the offering and wakes the spirit. */
export function awakenSpirit(state: GameState, spiritId: string): GameEvent[] {
  const check = checkSpirit(state, spiritId)
  if (check !== 'ok') return [{ type: 'blocked', reason: check }]
  const spirit = SPIRITS[spiritId]
  for (const req of spirit.requirements) if (req.kind === 'offering') payCost(state, req.items)
  state.spirits[spiritId] = { awakened: true }
  return [
    { type: 'story', text: `${spirit.name.split(',')[0]} awakens!`, complete: true },
    ...addBloom(state, spirit.regionId, BLOOM_REWARDS.spiritAwakened),
  ]
}
