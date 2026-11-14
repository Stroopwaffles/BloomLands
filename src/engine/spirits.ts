import { BLOOM_LEVELS, BLOOM_REWARDS } from '../data/bloom'
import { itemName } from '../data/items'
import { REGIONS } from '../data/world'
import { giveRelic, spiritGiftsBefore } from './prestige'
import { SPIRITS, type SpiritRequirement } from '../data/spirits'
import { addBloom } from './bloom'
import { canPay, payCost } from './costs'
import type { GameEvent } from './events'
import { bloomLevel, spiritEase } from './modifiers'
import type { GameState } from './state'

/**
 * Spirits of the land (design doc 3.9). Each one sleeps until its requirements are met; awakening
 * it gives the region a big bloom boost, and its next relic (one per run). Each relic it has
 * already given makes its requirements grow: more bloom and bigger offerings.
 */

/** What a spirit asks for this run. */
export function spiritRequirements(state: GameState, spiritId: string): SpiritRequirement[] {
  const spirit = SPIRITS[spiritId]
  const given = spiritGiftsBefore(state, spiritId)
  const ease = spiritEase(state)
  if (given === 0 && ease === 0) return spirit.requirements
  return spirit.requirements.map((req) => {
    if (req.kind === 'bloom') {
      const level = Math.min(BLOOM_LEVELS.length - 1, req.level + given)
      const region = REGIONS[spirit.regionId]?.name ?? spirit.regionId
      return { ...req, level, label: `Help the ${region} reach ${BLOOM_LEVELS[level].name} bloom` }
    }
    if (req.kind === 'offering') {
      const items = req.items.map((entry) => ({
        ...entry,
        amount: Math.max(1, entry.amount * (1 + given) - ease),
      }))
      const names = items.map(
        (e) => `${e.amount} ${'itemId' in e && e.itemId ? itemName(e.itemId) : 'items'}`,
      )
      return { ...req, items, label: `Offer ${names.join(' and ')}` }
    }
    return req
  })
}

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
  if (!spiritRequirements(state, spiritId).every((req) => requirementMet(state, spiritId, req))) {
    return 'missing-items'
  }
  return 'ok'
}

/** Makes the offering and wakes the spirit. */
export function awakenSpirit(state: GameState, spiritId: string): GameEvent[] {
  const check = checkSpirit(state, spiritId)
  if (check !== 'ok') return [{ type: 'blocked', reason: check }]
  const spirit = SPIRITS[spiritId]
  for (const req of spiritRequirements(state, spiritId)) {
    if (req.kind === 'offering') payCost(state, req.items)
  }
  state.spirits[spiritId] = { awakened: true }
  return [
    { type: 'story', text: `${spirit.name.split(',')[0]} awakens!`, complete: true },
    ...addBloom(state, spirit.regionId, BLOOM_REWARDS.spiritAwakened),
    ...giveRelic(state, spiritId),
  ]
}
