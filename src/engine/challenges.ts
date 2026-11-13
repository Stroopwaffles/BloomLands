import { CAMP_RULES, CREATURE_RULES, CREATURES, CREWS, PEST_RULES } from '../data/challenges'
import { PLANTS } from '../data/plants'
import { SPOTS } from '../data/world'
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
    const candidates = spot.slots.filter(
      (slot, i) =>
        slot.plantId &&
        !slot.pests &&
        !campBlocksSlot(state, spotId, i) &&
        PLANTS[slot.plantId].tags?.includes(PEST_RULES.tag),
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

export function pestsAt(state: GameState, spotId: string): number {
  return (state.spots[spotId]?.slots ?? []).reduce((sum, slot) => sum + (slot.pests ?? 0), 0)
}

// ---------------------------------------------------------------------------------------------
// Large creatures

export function advanceCreatures(state: GameState, dtMs: number, random: Random): void {
  const { challenges } = state
  for (const [spotId, creature] of Object.entries(challenges.creatures)) {
    creature.remainingMs -= dtMs
    creature.eatMs -= dtMs
    while (creature.eatMs <= 0 && creature.remainingMs > 0) {
      eatPlant(state, spotId, random)
      creature.eatMs += CREATURES[creature.creatureId].eatEveryMs
    }
    if (creature.remainingMs <= 0) delete challenges.creatures[spotId]
  }

  challenges.nextCreatureMs -= dtMs
  if (challenges.nextCreatureMs > 0) return
  challenges.nextCreatureMs = between(random, CREATURE_RULES.minMs, CREATURE_RULES.maxMs)
  for (const def of Object.values(CREATURES)) {
    const spots = visitedSpots(state, def.regionId).filter((id) => !challenges.creatures[id])
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
  return [{ type: 'creature-gone', spotId, creatureId: creature.creatureId, how }]
}

// ---------------------------------------------------------------------------------------------
// Pirate camps

export function advanceCamps(state: GameState, dtMs: number, random: Random): void {
  const { challenges } = state
  challenges.nextCampMs -= dtMs
  if (challenges.nextCampMs > 0) return
  challenges.nextCampMs = between(random, CAMP_RULES.minMs, CAMP_RULES.maxMs)
  for (const crew of Object.values(CREWS)) {
    const alreadyCamped = Object.values(challenges.camps).includes(crew.id)
    if (alreadyCamped) continue
    const spots = visitedSpots(state, crew.regionId)
    if (spots.length === 0) continue
    challenges.camps[spots[Math.floor(random() * spots.length)]] = crew.id
  }
}

/** Tanglevine: the pirates pack up and leave (they may come back later). */
export function clearCamp(state: GameState, spotId: string): GameEvent[] {
  const crewId = state.challenges.camps[spotId]
  if (!crewId) return [{ type: 'blocked', reason: 'no-target' }]
  delete state.challenges.camps[spotId]
  state.stats.campsCleared++
  return [{ type: 'camp-cleared', spotId, crewId }]
}

/** True if a pirate crew is camped anywhere in the region (helpers bring back less). */
export function piratesInRegion(state: GameState, regionId: string): boolean {
  return Object.keys(state.challenges.camps).some((spotId) => SPOTS[spotId]?.regionId === regionId)
}
