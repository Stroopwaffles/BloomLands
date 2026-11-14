import { CREATURES, REGION_WEATHER, type WeatherKind } from '../data/challenges'
import {
  BLOOMCALL,
  CLEAR_SKIES,
  PLENTY,
  REGION_SIGNATURE,
  REGIONAL_SPELLS,
  RENEWAL,
  RITUALS,
  SPELLS,
} from '../data/magic'
import type { CostEntry } from '../data/types'
import { RESEARCH } from '../data/research'
import { clearCamp, clearPests, parley, pestsAt, sendCreatureAway, sneak } from './challenges'
import { addBloom } from './bloom'
import { canPay, payCost } from './costs'
import { isMorning, turnSky } from './environment'
import type { BlockedReason, GameEvent } from './events'
import { activeFlightEvent, foilAmbush } from './flightEvents'
import { courtRank, hasFeature, spellSaveChance } from './modifiers'
import { canTameHere, tameMountHere, wildMountAt } from './mounts'
import { regionUnlocked, unlockRegion } from './regions'
import { stateRandom } from './rng'
import { unlockSecret } from './secrets'
import { placeRegion, REGIONS } from '../data/world'
import { MOUNTS } from '../data/mounts'
import { performPrestige } from './prestige'
import type { GameState } from './state'

/** Spells the player has researched. */
export function knownSpells(state: GameState): string[] {
  return state.research.completed.flatMap((id) => RESEARCH[id]?.spells ?? [])
}

export function knownRituals(state: GameState): string[] {
  return state.research.completed.flatMap((id) => RESEARCH[id]?.rituals ?? [])
}

/** How long Stormward lets you fly through Sky Isles storms. */
export const STORMWARD_MS = 10 * 60_000

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
    case 'shadow': {
      // In the Glade: a new moon to brighten, or the Moonshadow Crew camped right here.
      if (travel || placeRegion(place) !== 'glade') return false
      const camp = state.challenges.camps[place]
      return state.weather.glade?.kind === 'new-moon' || camp === 'moonshadow-crew'
    }
    case 'storm':
      // Worth casting while a storm grounds the Sky Isles (and Stormward isn't already on).
      return (
        Object.values(state.weather).some((w) => w.kind === 'storm') &&
        !((state.player.stormwardMs ?? 0) > 0)
      )
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
  // Some creatures want something special to join you (the blue jay).
  if (SPELLS[spellId]?.target === 'tame' && !state.player.travel) {
    const wild = wildMountAt(state, state.player.place)
    const tameCost = wild ? MOUNTS[wild]?.tameCost : undefined
    if (tameCost) return tameCost
  }
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
  // The Moth-Wing Quill: now and then a spell costs nothing.
  const save = spellSaveChance(state)
  if (!(save > 0 && stateRandom(state)() < save)) payCost(state, spellCost(state, spellId))
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
    case 'storm':
      state.player.stormwardMs = STORMWARD_MS
      return [cast]
    case 'shadow': {
      const events: GameEvent[] = [cast]
      if (state.challenges.camps[place] === 'moonshadow-crew')
        events.push(...clearCamp(state, place))
      // The new moon gives way early to a waxing moon.
      const moon = state.weather.glade
      if (moon?.kind === 'new-moon') moon.remainingMs = 0
      return events
    }
  }
}

/** A one-time rite whose work is done (its region is open, or its secret revealed). */
export function ritualDone(state: GameState, ritualId: string): boolean {
  const ritual = RITUALS[ritualId]
  if (!ritual) return false
  if (ritual.effect === 'open-fairy-ring') return state.secrets.includes('fairy-ring')
  if (ritual.effect === 'open-secret' && ritual.secret) return state.secrets.includes(ritual.secret)
  if (ritual.effect === 'unlock-region' && ritual.region)
    return regionUnlocked(state, ritual.region)
  return false
}

/** Regions a region-targeted rite can be performed on. */
export function riteRegions(state: GameState, ritualId: string): string[] {
  if (!RITUALS[ritualId]?.targetsRegion) return []
  // The Glade's moon keeps its own time: Clear Skies can't change it.
  return state.unlockedRegions.filter(
    (id) => !(RITUALS[ritualId].effect === 'clear-skies' && id === 'glade'),
  )
}

/** Weather Clear Skies can bring to a region. */
export function clearSkyChoices(regionId: string): WeatherKind[] {
  return regionId === 'glade' ? [] : [...(REGION_WEATHER[regionId] ?? [])]
}

/** What a rite costs, here and now: Renewal asks one more signature for each repeat this run. */
export function ritualCost(state: GameState, ritualId: string, regionId?: string): CostEntry[] {
  const ritual = RITUALS[ritualId]
  if (!ritual) return []
  if (ritual.effect !== 'renewal' || !regionId) return ritual.cost
  const signature = REGION_SIGNATURE[regionId] ?? REGION_SIGNATURE.meadow
  return [...ritual.cost, { itemId: signature, amount: 1 + (state.renewals[regionId] ?? 0) }]
}

export function checkRitual(
  state: GameState,
  ritualId: string,
  regionId?: string,
  weather?: WeatherKind,
): 'ok' | BlockedReason {
  if (!RITUALS[ritualId] || !knownRituals(state).includes(ritualId)) return 'locked'
  if (!hasFeature(state, 'ritual-circle')) return 'no-circle'
  if (state.player.travel || state.player.place !== 'home') return 'not-home'
  if (RITUALS[ritualId].morningOnly && !isMorning(state)) return 'not-morning'
  if (RITUALS[ritualId].fullMoonOnly && state.weather.glade?.kind !== 'full-moon') {
    return 'not-full-moon'
  }
  if (ritualDone(state, ritualId)) return 'already-done'
  const region = RITUALS[ritualId].region
  if (region && courtRank(state) < (REGIONS[region].unlock?.rank ?? 0)) return 'needs-rank'
  if (courtRank(state) < (RITUALS[ritualId].rank ?? 0)) return 'needs-rank'
  if (RITUALS[ritualId].targetsRegion) {
    if (!regionId || !riteRegions(state, ritualId).includes(regionId)) return 'no-target'
    if (RITUALS[ritualId].effect === 'clear-skies') {
      if (!weather || !clearSkyChoices(regionId).includes(weather)) return 'no-target'
    }
  }
  if (!canPay(state, ritualCost(state, ritualId, regionId))) return 'missing-items'
  return 'ok'
}

/** Performs a ritual at the Ritual Circle at home. */
export function performRitual(
  state: GameState,
  ritualId: string,
  regionId?: string,
  weather?: WeatherKind,
): GameEvent[] {
  const check = checkRitual(state, ritualId, regionId, weather)
  if (check !== 'ok') return [{ type: 'blocked', reason: check }]
  const ritual = RITUALS[ritualId]
  payCost(state, ritualCost(state, ritualId, regionId))
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
    case 'open-secret':
      return [{ type: 'ritual-performed', ritualId }, ...unlockSecret(state, ritual.secret!)]
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
    case 'renewal':
      state.renewals[regionId!] = (state.renewals[regionId!] ?? 0) + 1
      return [
        { type: 'ritual-performed', ritualId, regionId },
        ...addBloom(state, regionId!, RENEWAL.bloom),
      ]
    case 'bloomcall':
      state.bloomcalls[regionId!] = (state.bloomcalls[regionId!] ?? 0) + BLOOMCALL.durationMs
      return [{ type: 'ritual-performed', ritualId, regionId }]
    case 'clear-skies':
      state.weather[regionId!] = { kind: weather!, remainingMs: CLEAR_SKIES.durationMs }
      return [{ type: 'ritual-performed', ritualId, regionId }]
  }
  return [{ type: 'ritual-performed', ritualId }]
}
