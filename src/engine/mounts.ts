import { levelUpFood, MOUNTS } from '../data/mounts'
import { canPay, payCost } from './costs'
import type { BlockedReason, GameEvent } from './events'
import { mountSpeedMultiplier, stableCapacity } from './modifiers'
import type { GameState } from './state'

/**
 * Mounts (design doc 3.14): befriend a creature by bringing its favorite food over several
 * visits, then tame it with Kindred Call. Ride one at a time; spare mounts help your helpers.
 */

export function friendship(state: GameState, mountId: string) {
  return state.mounts.friendship[mountId] ?? { feedings: 0, cooldownMs: 0 }
}

export function befriended(state: GameState, mountId: string): boolean {
  return friendship(state, mountId).feedings >= MOUNTS[mountId].feedingsToBefriend
}

export function ownsMount(state: GameState, mountId: string): boolean {
  return mountId in state.mounts.owned
}

/** The wild mount at this spot that hasn't been tamed yet, if any. */
export function wildMountAt(state: GameState, spotId: string): string | null {
  return (
    Object.values(MOUNTS).find((m) => m.homeSpot === spotId && !ownsMount(state, m.id))?.id ?? null
  )
}

export function checkFeed(state: GameState, mountId: string): 'ok' | BlockedReason {
  const mount = MOUNTS[mountId]
  if (!mount) return 'locked'
  if (state.player.travel || state.player.place !== mount.homeSpot) return 'not-here'
  if (ownsMount(state, mountId) || befriended(state, mountId)) return 'already-done'
  if (friendship(state, mountId).cooldownMs > 0) return 'not-ready'
  if (!canPay(state, [mount.food])) return 'missing-items'
  return 'ok'
}

export function feedMount(state: GameState, mountId: string): GameEvent[] {
  const check = checkFeed(state, mountId)
  if (check !== 'ok') return [{ type: 'blocked', reason: check }]
  const mount = MOUNTS[mountId]
  payCost(state, [mount.food])
  const next = friendship(state, mountId).feedings + 1
  state.mounts.friendship[mountId] = { feedings: next, cooldownMs: mount.feedCooldownMs }
  return [{ type: 'mount-fed', mountId, feedings: next }]
}

/** True if Kindred Call would work right here. */
export function canTameHere(state: GameState): boolean {
  if (state.player.travel) return false
  const mountId = wildMountAt(state, state.player.place)
  return (
    mountId !== null &&
    befriended(state, mountId) &&
    Object.keys(state.mounts.owned).length < stableCapacity(state)
  )
}

/** Kindred Call's effect: the befriended creature joins your court. */
export function tameMountHere(state: GameState): GameEvent[] {
  const mountId = wildMountAt(state, state.player.place)
  if (!mountId || !canTameHere(state)) return [{ type: 'blocked', reason: 'no-target' }]
  state.mounts.owned[mountId] = { level: 1 }
  delete state.mounts.friendship[mountId]
  return [{ type: 'mount-tamed', mountId }]
}

export function rideMount(state: GameState, mountId: string | null): GameEvent[] {
  if (state.player.travel) return [{ type: 'blocked', reason: 'flying' }]
  if (state.player.place !== 'home') return [{ type: 'blocked', reason: 'not-home' }]
  if (mountId !== null && !ownsMount(state, mountId)) return [{ type: 'blocked', reason: 'locked' }]
  state.mounts.riding = mountId
  return []
}

export function checkLevelUp(state: GameState, mountId: string): 'ok' | BlockedReason {
  const owned = state.mounts.owned[mountId]
  if (!owned) return 'locked'
  if (owned.level >= MOUNTS[mountId].maxLevel) return 'already-done'
  if (state.player.travel || state.player.place !== 'home') return 'not-home'
  if (!canPay(state, [levelUpFood(MOUNTS[mountId], owned.level)])) return 'missing-items'
  return 'ok'
}

export function levelUpMount(state: GameState, mountId: string): GameEvent[] {
  const check = checkLevelUp(state, mountId)
  if (check !== 'ok') return [{ type: 'blocked', reason: check }]
  const owned = state.mounts.owned[mountId]
  payCost(state, [levelUpFood(MOUNTS[mountId], owned.level)])
  owned.level++
  return [{ type: 'mount-level', mountId, level: owned.level }]
}

/** Speed multiplier a mount gives at its level. */
export function mountSpeed(state: GameState, mountId: string): number {
  const mount = MOUNTS[mountId]
  const level = state.mounts.owned[mountId]?.level ?? 1
  return (mount.speed + (level - 1) * mount.speedPerLevel) * mountSpeedMultiplier(state)
}

/** Mounts you own but aren't riding, fastest first. Helpers borrow these. */
export function spareMounts(state: GameState): string[] {
  return Object.keys(state.mounts.owned)
    .filter((id) => id !== state.mounts.riding)
    .sort((a, b) => mountSpeed(state, b) - mountSpeed(state, a))
}

export function advanceMounts(state: GameState, dtMs: number): void {
  for (const f of Object.values(state.mounts.friendship)) {
    if (f.cooldownMs > 0) f.cooldownMs = Math.max(0, f.cooldownMs - dtMs)
  }
}
