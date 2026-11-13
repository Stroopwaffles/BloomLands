import { RECIPES } from '../data/recipes'
import { RESEARCH } from '../data/research'
import type { GameEvent } from './events'
import { canAfford, pay } from './costs'
import { addItems, type GameState } from './state'

/** Recipe IDs unlocked by finished research. */
export function unlockedRecipes(state: GameState): Set<string> {
  const unlocked = new Set<string>()
  for (const id of state.research.completed) {
    for (const recipeId of RESEARCH[id]?.unlocks ?? []) unlocked.add(recipeId)
  }
  return unlocked
}

export type CraftCheck = 'ok' | 'locked' | 'not-home' | 'station-busy' | 'missing-items'

export function checkCraft(state: GameState, recipeId: string): CraftCheck {
  const recipe = RECIPES[recipeId]
  if (!recipe || !unlockedRecipes(state).has(recipeId)) return 'locked'
  if (state.player.travel || state.player.place !== 'home') return 'not-home'
  const station = state.stations[recipe.station]
  if (station.jobs.length >= station.slots) return 'station-busy'
  if (!canAfford(state.inventory, recipe.inputs)) return 'missing-items'
  return 'ok'
}

/** Starts a recipe: inputs are taken from storage now; the result arrives when it finishes. */
export function startCraft(state: GameState, recipeId: string): GameEvent[] {
  const check = checkCraft(state, recipeId)
  if (check !== 'ok') return [{ type: 'blocked', reason: check }]
  const recipe = RECIPES[recipeId]
  pay(state.inventory, recipe.inputs)
  state.stations[recipe.station].jobs.push({
    id: recipeId,
    totalMs: recipe.durationMs,
    remainingMs: recipe.durationMs,
  })
  return [{ type: 'craft-start', recipeId }]
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
      addItems(state.inventory, recipe.output.itemId, recipe.output.amount)
      state.stats.itemsCrafted += recipe.output.amount
    }
    station.jobs = station.jobs.filter((job) => job.remainingMs > 0)
  }
}
