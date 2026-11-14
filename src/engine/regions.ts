import { CREATURES } from '../data/challenges'
import { REGIONS, REGION_ORDER, SPOTS, isSecret, placeRegion, HOME } from '../data/world'
import { rollWeather } from './environment'
import type { GameEvent } from './events'
import type { Random } from './rng'
import type { GameState } from './state'

/** Regions the player has opened (design doc 3.12: a court rank plus the region's rite). */
/** The newest region the player has opened (the menu shows and plays it). */
export function latestRegion(state: GameState): string {
  return [...REGION_ORDER].reverse().find((id) => state.unlockedRegions.includes(id)) ?? 'meadow'
}

export function regionUnlocked(state: GameState, regionId: string): boolean {
  return state.unlockedRegions.includes(regionId)
}

/** Can the player (or a helper) go here right now? */
export function placeOpen(state: GameState, placeId: string): boolean {
  if (placeId === HOME) return true
  if (!regionUnlocked(state, placeRegion(placeId))) return false
  return !isSecret(placeId) || state.secrets.includes(placeId)
}

/** Harvesting spots the player can reach, in display order. */
export function openSpots(state: GameState): string[] {
  return Object.values(REGIONS)
    .flatMap((r) => [...r.spots, ...r.secretSpots])
    .filter((id) => SPOTS[id] && placeOpen(state, id))
}

export function unlockRegion(state: GameState, regionId: string, random: Random): GameEvent[] {
  if (!REGIONS[regionId] || regionUnlocked(state, regionId)) return []
  state.unlockedRegions.push(regionId)
  const settlement = REGIONS[regionId].settlement
  state.settlements[settlement] ??= { requests: [], nextArrivalMs: 60_000, filled: 0 }
  if (!state.weather[regionId]) state.weather[regionId] = rollWeather(regionId, random)
  return [{ type: 'region-unlocked', regionId }]
}

/** A creature watching this spot blocks gathering there (and helpers stay away). */
export function spotWatched(state: GameState, spotId: string): boolean {
  const creature = state.challenges.creatures[spotId]
  return !!creature && CREATURES[creature.creatureId]?.behavior === 'watches'
}
