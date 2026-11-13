import { SPOTS } from '../data/world'
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
