import { CREATURES } from '../data/challenges'
import { PLENTY, REGION_SIGNATURE, REGIONAL_SPELLS, RITUALS, SPELLS } from '../data/magic'
import type { CostEntry } from '../data/types'
import { RESEARCH } from '../data/research'
import { clearCamp, clearPests, parley, pestsAt, sendCreatureAway, sneak } from './challenges'
import { canPay, payCost } from './costs'
import { isMorning, turnSky } from './environment'
import type { BlockedReason, GameEvent } from './events'
import { activeFlightEvent, foilAmbush } from './flightEvents'
import { courtRank, hasFeature } from './modifiers'
import { canTameHere, tameMountHere } from './mounts'
import { regionUnlocked, unlockRegion } from './regions'
import { stateRandom } from './rng'
import { unlockSecret } from './secrets'
import { placeRegion, REGIONS } from '../data/world'
import { performPrestige } from './prestige'
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
    case 'creature': {
      // Calming works on creatures, not on rubble.
      const creature = state.challenges.creatures[place]
      return !travel && !!creature && !CREATURES[creature.creatureId]?.noCalm
    }
    case 'webs': {
      const creature = state.challenges.creatures[place]
      return !travel && !!creature && !!CREATURES[creature.creatureId]?.webs
    }
    case 'camp':
      return !travel && !!state.challenges.camps[place]
    case 'ambush':
      return activeFlightEvent(state)?.kind === 'ambush'
    case 'tame':
      return canTameHere(state)
    case 'parley':
      return !travel && !!state.challenges.camps[place]
    case 'sneak': {
      // Hush Step slips past watchers, not past webs or rubble.
      const creature = state.challenges.creatures[place]
      return (
        !travel &&
        !!creature &&
        CREATURES[creature.creatureId]?.behavior === 'watches' &&
        state.player.sneakMs <= 0
      )
    }
  }
}

/**
 * What a spell costs right here. Parley and Kindred Call use the local region's signature
 * component (Earth Loam in the Forest) in place of Sun Salve.
 */
export function spellCost(state: GameState, spellId: string): CostEntry[] {
  const cost = SPELLS[spellId]?.cost ?? []
  if (!REGIONAL_SPELLS.includes(spellId)) return cost
  const signature = REGION_SIGNATURE[placeRegion(state.player.place)] ?? REGION_SIGNATURE.meadow
  return cost.map((entry) =>
    'itemId' in entry && entry.itemId === REGION_SIGNATURE.meadow
      ? { itemId: signature, amount: entry.amount }
      : entry,
  )
}

export function checkSpell(state: GameState, spellId: string): 'ok' | BlockedReason {
  if (!SPELLS[spellId] || !knownSpells(state).includes(spellId)) return 'locked'
  if (!hasTarget(state, spellId)) return 'no-target'
  if (!canPay(state, spellCost(state, spellId))) return 'missing-items'
  return 'ok'
}

/** Casts a spell where the player is (or mid-flight). Each cast costs components. */
export function castSpell(state: GameState, spellId: string): GameEvent[] {
  const check = checkSpell(state, spellId)
  if (check !== 'ok') return [{ type: 'blocked', reason: check }]
  payCost(state, spellCost(state, spellId))
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
    case 'parley':
      return [cast, ...parley(state, place)]
    case 'sneak':
      return [cast, ...sneak(state)]
    case 'webs':
      return [cast, ...sendCreatureAway(state, place, 'shooed')]
  }
}

/** A one-time rite whose work is done (its region is open, or its secret revealed). */
export function ritualDone(state: GameState, ritualId: string): boolean {
  const ritual = RITUALS[ritualId]
  if (!ritual) return false
  if (ritual.effect === 'open-fairy-ring') return state.secrets.includes('fairy-ring')
  if (ritual.effect === 'unlock-region' && ritual.region)
    return regionUnlocked(state, ritual.region)
  return false
}

export function checkRitual(state: GameState, ritualId: string): 'ok' | BlockedReason {
  if (!RITUALS[ritualId] || !knownRituals(state).includes(ritualId)) return 'locked'
  if (!hasFeature(state, 'ritual-circle')) return 'no-circle'
  if (state.player.travel || state.player.place !== 'home') return 'not-home'
  if (RITUALS[ritualId].morningOnly && !isMorning(state)) return 'not-morning'
  if (ritualDone(state, ritualId)) return 'already-done'
  const region = RITUALS[ritualId].region
  if (region && courtRank(state) < (REGIONS[region].unlock?.rank ?? 0)) return 'needs-rank'
  if (courtRank(state) < (RITUALS[ritualId].rank ?? 0)) return 'needs-rank'
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
    case 'plenty':
      state.plentyMs += PLENTY.durationMs
      break
    case 'unlock-region':
      return [
        { type: 'ritual-performed', ritualId },
        ...unlockRegion(state, ritual.region!, stateRandom(state)),
      ]
    case 'root-song':
      return [{ type: 'ritual-performed', ritualId }, ...performPrestige(state)]
  }
  return [{ type: 'ritual-performed', ritualId }]
}
