import { RITUALS, SPELLS } from '../data/magic'
import { RESEARCH } from '../data/research'
import { clearCamp, clearPests, pestsAt, sendCreatureAway } from './challenges'
import { canPay, payCost } from './costs'
import { isMorning, turnSky } from './environment'
import type { BlockedReason, GameEvent } from './events'
import { activeFlightEvent, foilAmbush } from './flightEvents'
import { hasFeature } from './modifiers'
import { canTameHere, tameMountHere } from './mounts'
import { unlockSecret } from './secrets'
import type { GameState } from './state'

/** Spells the player has researched. */
export function knownSpells(state: GameState): string[] {
  return state.research.completed.flatMap((id) => RESEARCH[id]?.spells ?? [])
}

export function knownRituals(state: GameState): string[] {
  return state.research.completed.flatMap((id) => RESEARCH[id]?.rituals ?? [])
}

/** Whether there's something right here for this spell to work on. */
function hasTarget(state: GameState, spellId: string): boolean {
  const { place, travel } = state.player
  switch (SPELLS[spellId].target) {
    case 'pests':
      return !travel && pestsAt(state, place) > 0
    case 'creature':
      return !travel && !!state.challenges.creatures[place]
    case 'camp':
      return !travel && !!state.challenges.camps[place]
    case 'ambush':
      return activeFlightEvent(state)?.kind === 'ambush'
    case 'tame':
      return canTameHere(state)
  }
}

export function checkSpell(state: GameState, spellId: string): 'ok' | BlockedReason {
  if (!SPELLS[spellId] || !knownSpells(state).includes(spellId)) return 'locked'
  if (!hasTarget(state, spellId)) return 'no-target'
  if (!canPay(state, SPELLS[spellId].cost)) return 'missing-items'
  return 'ok'
}

/** Casts a spell where the player is (or mid-flight). Each cast costs components. */
export function castSpell(state: GameState, spellId: string): GameEvent[] {
  const check = checkSpell(state, spellId)
  if (check !== 'ok') return [{ type: 'blocked', reason: check }]
  payCost(state, SPELLS[spellId].cost)
  state.stats.spellsCast++
  const place = state.player.place
  const cast: GameEvent = { type: 'spell-cast', spellId }
  switch (SPELLS[spellId].target) {
    case 'pests':
      clearPests(state, place)
      return [cast]
    case 'creature':
      return [cast, ...sendCreatureAway(state, place, 'calmed')]
    case 'camp':
      return [cast, ...clearCamp(state, place)]
    case 'ambush':
      return [cast, ...foilAmbush(state)]
    case 'tame':
      return [cast, ...tameMountHere(state)]
  }
}

export function checkRitual(state: GameState, ritualId: string): 'ok' | BlockedReason {
  if (!RITUALS[ritualId] || !knownRituals(state).includes(ritualId)) return 'locked'
  if (!hasFeature(state, 'ritual-circle')) return 'no-circle'
  if (state.player.travel || state.player.place !== 'home') return 'not-home'
  if (RITUALS[ritualId].morningOnly && !isMorning(state)) return 'not-morning'
  if (ritualId === 'ritual-dawn' && state.secrets.includes('fairy-ring')) return 'already-done'
  if (!canPay(state, RITUALS[ritualId].cost)) return 'missing-items'
  return 'ok'
}

/** Performs a ritual at the Ritual Circle at home. */
export function performRitual(state: GameState, ritualId: string): GameEvent[] {
  const check = checkRitual(state, ritualId)
  if (check !== 'ok') return [{ type: 'blocked', reason: check }]
  const ritual = RITUALS[ritualId]
  payCost(state, ritual.cost)
  state.stats.ritualsPerformed++
  switch (ritual.effect) {
    case 'turn-to-day':
      turnSky(state, 'day')
      break
    case 'turn-to-night':
      turnSky(state, 'night')
      break
    case 'open-fairy-ring':
      return [{ type: 'ritual-performed', ritualId }, ...unlockSecret(state, 'fairy-ring')]
  }
  return [{ type: 'ritual-performed', ritualId }]
}
