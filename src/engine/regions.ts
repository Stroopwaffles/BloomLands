import { CREATURES } from '../data/challenges'
import { REGIONS, REGION_ORDER, SPOTS, isSecret, placeRegion, HOME } from '../data/world'
import { rollWeather } from './environment'
import type { GameEvent } from './events'
import type { Random } from './rng'
import { BLOOM_LEVELS } from '../data/bloom'
import { MOUNTS } from '../data/mounts'
import { WEATHER } from '../data/challenges'
import {
  alwaysLit,
  bonusEffects,
  courtRank,
  hasLight,
  hasWaterstride,
  stormProof,
} from './modifiers'
import type { GameState } from './state'

/** The newest region the player has opened (the menu shows and plays it). */
export function latestRegion(state: GameState): string {
  return [...REGION_ORDER].reverse().find((id) => state.unlockedRegions.includes(id)) ?? 'meadow'
}

/** Regions the player has opened (design doc 3.12: a court rank plus the region's rite). */
export function regionUnlocked(state: GameState, regionId: string): boolean {
  return state.unlockedRegions.includes(regionId)
}

/**
 * Can the player get into a region right now? Open regions always; a dark region (the Caves)
 * also while the player has light and the court has the rank its rite needs.
 */
export function regionReachable(state: GameState, regionId: string): boolean {
  if (regionUnlocked(state, regionId)) return true
  const region = REGIONS[regionId]
  if (!region?.needsLight || !region.unlock) return false
  return (hasLight(state) || alwaysLit(state, regionId)) && courtRank(state) >= region.unlock.rank
}

/**
 * A storm in a region that grounds flights (the Sky Isles) keeps everyone from flying to or from
 * it, unless the Storm Bell or Stormward lets you through.
 */
export function grounded(state: GameState, from: string, to: string): boolean {
  if (stormProof(state)) return false
  for (const placeId of [from, to]) {
    const regionId = placeRegion(placeId)
    const kind = state.weather[regionId]?.kind
    if (kind && WEATHER[kind]?.grounds) return true
  }
  return false
}

/**
 * Regions reached by a mount instead of a rite (the Sky Isles and the blue jay) open for good
 * once the court has the mount and the rank.
 */
export function advanceMountRegions(state: GameState, random: Random): void {
  for (const region of Object.values(REGIONS)) {
    const unlock = region.unlock
    if (!unlock?.mountId || regionUnlocked(state, region.id)) continue
    if (!state.mounts.owned[unlock.mountId] || courtRank(state) < unlock.rank) continue
    state.inbox.push(...unlockRegion(state, region.id, random))
  }
}

/** Gives a region its weather and village the first time anyone arrives (also by light). */
export function ensureRegion(state: GameState, regionId: string, random: Random): void {
  const region = REGIONS[regionId]
  if (!region) return
  state.settlements[region.settlement] ??= { requests: [], nextArrivalMs: 60_000, filled: 0 }
  if (!state.weather[regionId]) state.weather[regionId] = rollWeather(regionId, random)
  if (state.bloom[regionId] === undefined) state.bloom[regionId] = startingBloom(state, regionId)
}

/** Bloom a region starts a run with: Deep Roots everywhere, a level more with its relic. */
export function startingBloom(state: GameState, regionId: string): number {
  let points = 0
  let headStart = false
  for (const e of bonusEffects(state)) {
    if (e.kind === 'startBloom') points += e.amount
    if (e.kind === 'headStart' && e.regionId === regionId) headStart = true
  }
  return points + (headStart ? BLOOM_LEVELS[1].points : 0)
}

/**
 * A region opening for this run: its starting bloom, and mounts that relics tame for you
 * (Whistling Grass Blade and friends). Safe to call again.
 */
export function welcomeRegion(state: GameState, regionId: string): void {
  if (state.bloom[regionId] === undefined) state.bloom[regionId] = startingBloom(state, regionId)
  for (const e of bonusEffects(state)) {
    if (e.kind !== 'kinship' || MOUNTS[e.mountId]?.regionId !== regionId) continue
    if (!state.mounts.owned[e.mountId]) state.mounts.owned[e.mountId] = { level: 1 }
  }
}

/** Can the player (or a helper) go here right now? */
export function placeOpen(state: GameState, placeId: string): boolean {
  if (placeId === HOME) return true
  if (!regionReachable(state, placeRegion(placeId))) return false
  if (!isSecret(placeId)) return true
  // The Starwell: only reachable while riding the luna moth.
  const unlock = SPOTS[placeId]?.secret?.unlock
  if (unlock?.kind === 'riding') return state.mounts.riding === unlock.mountId
  return state.secrets.includes(placeId)
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
  welcomeRegion(state, regionId)
  return [{ type: 'region-unlocked', regionId }]
}

/** A creature watching this spot blocks gathering there (and helpers stay away). */
export function spotWatched(state: GameState, spotId: string): boolean {
  const creature = state.challenges.creatures[spotId]
  const behavior = creature ? CREATURES[creature.creatureId]?.behavior : null
  return behavior === 'watches' || behavior === 'blocks'
}

/**
 * Is the player kept from gathering here by a watching creature? Hush Step sneaks past any of
 * them; a Waterstride Philter is enough for the heron, who ignores anyone skimming the water.
 */
export function playerWatched(state: GameState, spotId: string): boolean {
  if (!spotWatched(state, spotId)) return false
  const def = CREATURES[state.challenges.creatures[spotId].creatureId]
  // Webs and rubble have to be cleared: there's no sneaking past them.
  if (def?.behavior === 'blocks') return true
  if (state.player.sneakMs > 0) return false
  return !(def?.ignoresWaterstride && hasWaterstride(state))
}
