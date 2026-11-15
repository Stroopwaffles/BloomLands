import { RECIPES } from '../data/recipes'
import { RESEARCH } from '../data/research'
import type { CostEntry, StationId } from '../data/types'
import { BULK_CRAFT_COUNT } from '../data/upgrades'
import { canPay, payCost } from './costs'
import type { GameEvent } from './events'
import { craftEchoChance, hasQol, stationBuilt, stationSlots } from './modifiers'
import { stateRandom } from './rng'
import { addItems, type GameState } from './state'

/** Recipe IDs unlocked by finished research. */
export function unlockedRecipes(state: GameState): Set<string> {
  const unlocked = new Set<string>()
  for (const id of state.research.completed) {
    for (const recipeId of RESEARCH[id]?.unlocks ?? []) unlocked.add(recipeId)
  }
  return unlocked
}

/** Jobs running at a station: the player's own, plus any brewer working there. */
export function stationInUse(state: GameState, station: StationId): number {
  const brewers = state.helpers.list.filter(
    (h) =>
      h.type === 'brewer' &&
      h.phase === 'gathering' &&
      !!h.tripItem &&
      RECIPES[h.tripItem]?.station === station,
  ).length
  return state.stations[station].jobs.length + brewers
}

/** Batch sizes the player can choose right now. */
export function batchSizes(state: GameState): number[] {
  return hasQol(state, 'bulk-craft') ? [1, BULK_CRAFT_COUNT] : [1]
}

export function scaledInputs(recipeId: string, count: number): CostEntry[] {
  return RECIPES[recipeId].inputs.map((entry) => ({ ...entry, amount: entry.amount * count }))
}

export type CraftCheck =
  'ok' | 'locked' | 'not-home' | 'not-built' | 'station-busy' | 'missing-items'

export function checkCraft(state: GameState, recipeId: string, count = 1): CraftCheck {
  const recipe = RECIPES[recipeId]
  if (!recipe || !unlockedRecipes(state).has(recipeId)) return 'locked'
  if (!batchSizes(state).includes(count)) return 'locked'
  if (!stationBuilt(state, recipe.station)) return 'not-built'
  if (state.player.travel || state.player.place !== 'home') return 'not-home'
  if (stationInUse(state, recipe.station) >= stationSlots(state, recipe.station)) {
    return 'station-busy'
  }
  if (!canPay(state, scaledInputs(recipeId, count))) return 'missing-items'
  return 'ok'
}

/**
 * Starts a recipe (or a batch of `count`). Inputs are taken now (see payingStocks in costs.ts);
 * the results arrive in storage when it finishes. A batch takes `count` times as long.
 */
export function startCraft(state: GameState, recipeId: string, count = 1): GameEvent[] {
  const check = checkCraft(state, recipeId, count)
  if (check !== 'ok') return [{ type: 'blocked', reason: check }]
  const recipe = RECIPES[recipeId]
  payCost(state, scaledInputs(recipeId, count))
  const totalMs = recipe.durationMs * count
  state.stations[recipe.station].jobs.push({ id: recipeId, totalMs, remainingMs: totalMs, count })
  return [{ type: 'craft-start', recipeId, count }]
}

/** Advances every station's jobs; finished results go straight into storage. */
export function advanceStations(state: GameState, dtMs: number): void {
  for (const station of Object.values(state.stations)) {
    if (station.jobs.length === 0) continue
    for (const job of station.jobs) job.remainingMs -= dtMs
    const finished = station.jobs.filter((job) => job.remainingMs <= 0)
    if (finished.length === 0) continue
    for (const job of finished) {
      const recipe = RECIPES[job.id]
      if (!recipe) continue
      let amount = recipe.output.amount * (job.count ?? 1)
      // The Echo Crystal: sometimes a job comes out double.
      const echo = craftEchoChance(state)
      if (echo > 0 && stateRandom(state)() < echo) amount *= 2
      addItems(state.inventory, recipe.output.itemId, amount)
      state.stats.itemsCrafted += amount
      state.inbox.push({
        type: 'craft-done',
        recipeId: job.id,
        itemId: recipe.output.itemId,
        amount,
      })
    }
    station.jobs = station.jobs.filter((job) => job.remainingMs > 0)
  }
}
