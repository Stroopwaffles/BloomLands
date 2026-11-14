import {
  CAMP_RULES,
  CREATURE_RULES,
  CREATURES,
  CREWS,
  PEST_RULES,
  PESTS,
  SNEAK_MS,
} from '../data/challenges'
import { PLANTS } from '../data/plants'
import { SPOTS } from '../data/world'
import { BLOOM_REWARDS } from '../data/bloom'
import { addBloom } from './bloom'
import { recordCrewWon } from './ending'
import { creatureAtPeace, regionCalmMultiplier } from './modifiers'
import type { GameEvent } from './events'
import { campBlocksSlot, eatPlant } from './gathering'
import type { Random } from './rng'
import type { GameState } from './state'

/**
 * Challenges are setbacks, never failures (design doc 3.15): pests make plants take more taps,
 * creatures eat a few plants, camps block part of a spot. Nothing stored is ever lost.
 */

function between(random: Random, min: number, max: number): number {
  return min + Math.floor(random() * (max - min))
}

/** Visited harvesting spots in a region (challenges only happen where the player has been). */
function visitedSpots(state: GameState, regionId: string): string[] {
  return Object.keys(state.spots).filter((id) => SPOTS[id]?.regionId === regionId)
}

// ---------------------------------------------------------------------------------------------
// Pests

export function advancePests(state: GameState, dtMs: number, random: Random): void {
  for (const [spotId, spot] of Object.entries(state.spots)) {
    if (!SPOTS[spotId]) continue
    spot.pestCheckMs = (spot.pestCheckMs ?? PEST_RULES.checkMs) - dtMs
    if (spot.pestCheckMs > 0) continue
    spot.pestCheckMs = PEST_RULES.checkMs
    if (random() >= PEST_RULES.chance) continue
    const pest = PESTS[SPOTS[spotId].regionId]
    if (!pest) continue
    const candidates = spot.slots.filter(
      (slot, i) =>
        slot.plantId &&
        !slot.pests &&
        !campBlocksSlot(state, spotId, i) &&
        PLANTS[slot.plantId].tags?.includes(pest.tag),
    )
    if (candidates.length === 0) continue
    candidates[Math.floor(random() * candidates.length)].pests = PEST_RULES.count
  }
}

/** Bugbane Whisper: clears every pest in a spot. Returns how many were cleared. */
export function clearPests(state: GameState, spotId: string): number {
  let cleared = 0
  for (const slot of state.spots[spotId]?.slots ?? []) {
    cleared += slot.pests ?? 0
    slot.pests = 0
  }
  state.stats.pestsCleared += cleared
  return cleared
}

/** The kind of pest found at a spot (for its picture and name). */
export function pestAt(spotId: string) {
  return PESTS[SPOTS[spotId]?.regionId ?? 'meadow'] ?? PESTS.meadow
}

export function pestsAt(state: GameState, spotId: string): number {
  return (state.spots[spotId]?.slots ?? []).reduce((sum, slot) => sum + (slot.pests ?? 0), 0)
}

// ---------------------------------------------------------------------------------------------
// Large creatures

export function advanceCreatures(state: GameState, dtMs: number, random: Random): void {
  const { challenges } = state
  for (const [spotId, creature] of Object.entries(challenges.creatures)) {
    const def = CREATURES[creature.creatureId]
    creature.remainingMs -= dtMs
    if (def?.behavior === 'eats') {
      creature.eatMs -= dtMs
      while (creature.eatMs <= 0 && creature.remainingMs > 0) {
        eatPlant(state, spotId, random)
        creature.eatMs += def.eatEveryMs
      }
    }
    if (creature.remainingMs <= 0) delete challenges.creatures[spotId]
  }

  challenges.nextCreatureMs -= dtMs
  if (challenges.nextCreatureMs > 0) return
  challenges.nextCreatureMs = between(random, CREATURE_RULES.minMs, CREATURE_RULES.maxMs)
  for (const def of Object.values(CREATURES)) {
    // A spirit's relic can make a creature a friend for good.
    if (creatureAtPeace(state, def.id)) continue
    // Some only turn up in certain weather (a rockfall needs rumbles).
    if (def.weather && state.weather[def.regionId]?.kind !== def.weather) continue
    // Curios like the Nightlight Jar make a region's troubles rarer.
    if (random() >= regionCalmMultiplier(state, def.regionId)) continue
    // A creature won over by a story (Vesper's moths) turns up half as often.
    if (def.gentlerAfter && state.stories[def.gentlerAfter]?.complete && random() < 0.5) continue
    const spots = visitedSpots(state, def.regionId).filter(
      (id) => !challenges.creatures[id] && (!def.spots || def.spots.includes(id)),
    )
    if (spots.length === 0) continue
    const spotId = spots[Math.floor(random() * spots.length)]
    challenges.creatures[spotId] = {
      creatureId: def.id,
      tapsLeft: def.taps,
      remainingMs: def.staysMs,
      eatMs: def.eatEveryMs,
    }
  }
}

/** Tapping a creature shoos it a little; enough taps and it hops away. */
export function tapCreature(state: GameState, spotId: string): GameEvent[] {
  if (state.player.travel || state.player.place !== spotId) {
    return [{ type: 'blocked', reason: 'not-here' }]
  }
  const creature = state.challenges.creatures[spotId]
  if (!creature) return [{ type: 'blocked', reason: 'no-target' }]
  // Watchers can't be shooed: calm them, or sneak past.
  if (CREATURES[creature.creatureId]?.behavior === 'watches') {
    return [{ type: 'blocked', reason: 'watching' }]
  }
  // Some creatures are too grumpy to shoo (the badger): only a calming spell works.
  if (CREATURES[creature.creatureId]?.calmOnly) return [{ type: 'blocked', reason: 'calm-only' }]
  // Blockers (webs, rubble) and munchers both give way to enough taps.
  state.stats.taps++
  creature.tapsLeft--
  if (creature.tapsLeft > 0) return [{ type: 'creature-tap', spotId, tapsLeft: creature.tapsLeft }]
  return sendCreatureAway(state, spotId, 'shooed')
}

export function sendCreatureAway(
  state: GameState,
  spotId: string,
  how: 'shooed' | 'calmed',
): GameEvent[] {
  const creature = state.challenges.creatures[spotId]
  if (!creature) return [{ type: 'blocked', reason: 'no-target' }]
  delete state.challenges.creatures[spotId]
  state.stats.creaturesShooed++
  if (how === 'calmed') {
    const calmed = state.challenges.calmed
    calmed[creature.creatureId] = (calmed[creature.creatureId] ?? 0) + 1
  }
  return [{ type: 'creature-gone', spotId, creatureId: creature.creatureId, how }]
}

/** Hush Step: gather under a watching creature's nose for a little while. */
export function sneak(state: GameState): GameEvent[] {
  state.player.sneakMs = SNEAK_MS
  return []
}

export function advanceSneak(state: GameState, dtMs: number): void {
  if (state.player.sneakMs > 0) state.player.sneakMs = Math.max(0, state.player.sneakMs - dtMs)
}

// ---------------------------------------------------------------------------------------------
// Pirate camps

export function advanceCamps(state: GameState, dtMs: number, random: Random): void {
  const { challenges } = state
  // Camps eventually pack up by themselves (a setback, never permanent).
  for (const spotId of Object.keys(challenges.camps)) {
    const left = (challenges.campMs[spotId] ?? CAMP_RULES.staysMs) - dtMs
    if (left > 0) {
      challenges.campMs[spotId] = left
    } else {
      delete challenges.camps[spotId]
      delete challenges.campMs[spotId]
    }
  }

  challenges.nextCampMs -= dtMs
  if (challenges.nextCampMs > 0) return
  challenges.nextCampMs = between(random, CAMP_RULES.minMs, CAMP_RULES.maxMs)
  for (const crew of Object.values(CREWS)) {
    const alreadyCamped = Object.values(challenges.camps).includes(crew.id)
    if (alreadyCamped || state.crews[crew.id]?.won) continue
    if (random() >= regionCalmMultiplier(state, crew.regionId)) continue
    // Some crews only camp in their weather (the Moonshadow Crew needs a new moon).
    if (crew.weather && state.weather[crew.regionId]?.kind !== crew.weather) continue
    const spots = visitedSpots(state, crew.regionId)
    if (spots.length === 0) continue
    const spotId = spots[Math.floor(random() * spots.length)]
    challenges.camps[spotId] = crew.id
    challenges.campMs[spotId] = CAMP_RULES.staysMs
  }
}

/** Tanglevine: the pirates pack up and leave (they may come back later). */
export function clearCamp(state: GameState, spotId: string): GameEvent[] {
  const crewId = state.challenges.camps[spotId]
  if (!crewId) return [{ type: 'blocked', reason: 'no-target' }]
  delete state.challenges.camps[spotId]
  delete state.challenges.campMs[spotId]
  state.stats.campsCleared++
  return [
    { type: 'camp-cleared', spotId, crewId },
    ...addBloom(state, SPOTS[spotId].regionId, BLOOM_REWARDS.campCleared),
  ]
}

/**
 * Parley: a treat and a kind word for the crew camped here. Each one builds trust; enough of them
 * wins the crew over for the rest of the run (camp gone, no more ambushes, pirates can be
 * recruited as helpers).
 */
export function parley(state: GameState, spotId: string): GameEvent[] {
  const crewId = state.challenges.camps[spotId]
  if (!crewId) return [{ type: 'blocked', reason: 'no-target' }]
  const crew = CREWS[crewId]
  const progress = state.crews[crewId] ?? { trust: 0, won: false }
  progress.trust++
  state.crews[crewId] = progress
  const line = crew.parleyLines[Math.min(progress.trust, crew.parleyLines.length) - 1]
  if (progress.trust < crew.parleyLines.length) {
    return [{ type: 'story', text: line, complete: false }]
  }
  progress.won = true
  delete state.challenges.camps[spotId]
  delete state.challenges.campMs[spotId]
  return [
    { type: 'story', text: line, complete: true },
    { type: 'crew-won', crewId },
    ...addBloom(state, crew.regionId, BLOOM_REWARDS.crewWonOver),
    ...recordCrewWon(state, crewId),
  ]
}

/** True if a pirate crew is camped anywhere in the region (helpers bring back less). */
export function piratesInRegion(state: GameState, regionId: string): boolean {
  return Object.keys(state.challenges.camps).some((spotId) => SPOTS[spotId]?.regionId === regionId)
}
