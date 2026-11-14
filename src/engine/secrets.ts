import { SPOTS } from '../data/world'
import { bloomLevel } from './modifiers'
import { regionUnlocked } from './regions'
import { giveCurio } from './bloom'
import type { GameEvent } from './events'
import type { GameState } from './state'

/**
 * Secret areas (design doc 3.12): unlocked by a region-specific requirement, they re-lock on
 * prestige. The first visit each run finds their curio; their unique outfit is kept forever.
 */

export function unlockSecret(state: GameState, spotId: string): GameEvent[] {
  if (!SPOTS[spotId]?.secret || state.secrets.includes(spotId)) return []
  state.secrets.push(spotId)
  return [{ type: 'secret', spotId, found: 'unlocked' }]
}

/** Opens secret areas whose story or bloom requirement is now met (checked as the game runs). */
export function advanceSecrets(state: GameState): void {
  for (const spot of Object.values(SPOTS)) {
    const unlock = spot.secret?.unlock
    // Ritual secrets open from their rite, scout secrets from a lucky search, and riding
    // secrets only while you ride the right mount.
    if (!unlock || unlock.kind === 'ritual' || unlock.kind === 'scout') continue
    if (unlock.kind === 'riding') continue
    if (state.secrets.includes(spot.id)) continue
    if (!regionUnlocked(state, spot.regionId)) continue
    const met =
      unlock.kind === 'story'
        ? state.stories[unlock.storyId]?.complete === true
        : unlock.kind === 'requests'
          ? (state.settlements[unlock.settlementId]?.filled ?? 0) >= unlock.count
          : unlock.kind === 'calmed'
            ? (state.challenges.calmed[unlock.creatureId] ?? 0) >= unlock.count
            : bloomLevel(state, spot.regionId) >= unlock.level
    if (met) state.inbox.push(...unlockSecret(state, spot.id))
  }
}

/**
 * A scout searching a region (or, very rarely, a harvest there) may stumble on its hidden
 * passage. `scale` turns a scout's chance into a rarer one for harvests.
 */
export function rollScoutSecret(
  state: GameState,
  regionId: string,
  random: () => number,
  scale = 1,
): GameEvent[] {
  const events: GameEvent[] = []
  for (const spot of Object.values(SPOTS)) {
    const unlock = spot.secret?.unlock
    if (!unlock || unlock.kind !== 'scout' || unlock.regionId !== regionId) continue
    if (state.secrets.includes(spot.id)) continue
    if (random() < unlock.chance * scale) events.push(...unlockSecret(state, spot.id))
  }
  return events
}

/** Called when the player lands at a spot: the first visit to a secret area finds its treasures. */
export function discoverSecret(state: GameState, spotId: string): GameEvent[] {
  const secret = SPOTS[spotId]?.secret
  if (!secret || state.secretsVisited.includes(spotId)) return []
  state.secretsVisited.push(spotId)
  const events: GameEvent[] = [{ type: 'secret', spotId, found: 'visited' }]
  events.push(...giveCurio(state, secret.curioId))
  if (!state.outfits.includes(secret.outfitId)) {
    state.outfits.push(secret.outfitId)
    events.push({ type: 'outfit', outfitId: secret.outfitId })
  }
  return events
}
