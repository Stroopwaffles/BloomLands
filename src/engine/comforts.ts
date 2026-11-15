import { gathersAtSpot, type HelperType } from '../data/helpers'
import { RECIPES } from '../data/recipes'
import { assignHelper, setBrew } from './helpers'
import type { GameEvent } from './events'
import { hasQol } from './modifiers'
import type { GameState } from './state'

/**
 * The last Comforts (design doc 3.11 → QoL upgrades): the Recipe Book (favorites), the Request
 * Board (pinned requests) and the Helper Ledger (saved helper jobs). Favorites and saved jobs are
 * kept through prestige; pinned requests belong to the run, like the requests themselves.
 */

/** How many sets of helper jobs the Helper Ledger keeps. */
export const PRESET_SLOTS = 3

export interface TrackedRequest {
  kind: 'trader' | 'villager'
  requestId: number
  /** For villager requests: their village. */
  settlementId?: string
}

/** A saved set of jobs: for each helper type, each helper's job in list order. */
export interface HelperPreset {
  jobs: { type: HelperType; task: string | null; keep?: number }[]
}

export function toggleFavorite(state: GameState, recipeId: string): GameEvent[] {
  if (!hasQol(state, 'recipe-book')) return [{ type: 'blocked', reason: 'locked' }]
  if (!RECIPES[recipeId]) return [{ type: 'blocked', reason: 'locked' }]
  const favorites = state.preferences.favorites
  const i = favorites.indexOf(recipeId)
  if (i >= 0) favorites.splice(i, 1)
  else favorites.push(recipeId)
  return []
}

/** The request a pin points at, if it's still there. */
export function findTracked(state: GameState, t: TrackedRequest) {
  const list =
    t.kind === 'trader'
      ? state.traders.requests
      : (state.settlements[t.settlementId ?? '']?.requests ?? [])
  return list.find((r) => r.id === t.requestId) ?? null
}

/** Pinned requests that are still waiting (filled or expired ones drop off by themselves). */
export function trackedRequests(state: GameState) {
  return state.tracked.flatMap((t) => {
    const request = findTracked(state, t)
    return request ? [{ ...t, request }] : []
  })
}

export function toggleTracked(state: GameState, t: TrackedRequest): GameEvent[] {
  if (!hasQol(state, 'request-tracker')) return [{ type: 'blocked', reason: 'locked' }]
  const same = (o: TrackedRequest) =>
    o.kind === t.kind && o.requestId === t.requestId && o.settlementId === t.settlementId
  const existing = state.tracked.findIndex(same)
  if (existing >= 0) {
    state.tracked.splice(existing, 1)
    return []
  }
  if (!findTracked(state, t)) return [{ type: 'blocked', reason: 'no-target' }]
  // Tidy away pins whose requests are gone.
  state.tracked = state.tracked.filter((o) => findTracked(state, o))
  state.tracked.push({ ...t })
  return []
}

/** Saves every helper's current job into a Ledger slot. */
export function savePreset(state: GameState, slot: number): GameEvent[] {
  if (!hasQol(state, 'helper-presets')) return [{ type: 'blocked', reason: 'locked' }]
  if (slot < 0 || slot >= PRESET_SLOTS) return [{ type: 'blocked', reason: 'locked' }]
  state.preferences.helperPresets[slot] = {
    jobs: state.helpers.list.map((h) => ({ type: h.type, task: h.task, keep: h.keep })),
  }
  return []
}

/**
 * Puts a saved set of jobs back: the first gatherer gets the first saved gatherer's job, and so
 * on. Jobs at places that aren't open (this run) are skipped.
 */
export function applyPreset(state: GameState, slot: number): GameEvent[] {
  if (!hasQol(state, 'helper-presets')) return [{ type: 'blocked', reason: 'locked' }]
  const preset = state.preferences.helperPresets[slot]
  if (!preset) return [{ type: 'blocked', reason: 'no-target' }]
  const seen: Record<string, number> = {}
  for (const helper of state.helpers.list) {
    const n = seen[helper.type] ?? 0
    seen[helper.type] = n + 1
    const saved = preset.jobs.filter((j) => j.type === helper.type)[n]
    if (!saved || saved.task === helper.task) continue
    if (helper.type === 'brewer') setBrew(state, helper.id, saved.task, saved.keep)
    else if (gathersAtSpot(helper.type)) assignHelper(state, helper.id, saved.task)
  }
  return []
}
