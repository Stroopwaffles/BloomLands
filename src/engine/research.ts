import type { CostEntry } from '../data/types'
import { RESEARCH } from '../data/research'
import { canPay, payCost } from './costs'
import type { GameEvent } from './events'
import { researchSpeed, researchCostMultiplier } from './modifiers'
import { regionUnlocked } from './regions'
import type { GameState } from './state'

export type ResearchStatus = 'done' | 'in-progress' | 'available' | 'locked'

export function researchStatus(state: GameState, id: string): ResearchStatus {
  if (state.research.completed.includes(id)) return 'done'
  if (state.research.current?.id === id) return 'in-progress'
  const node = RESEARCH[id]
  if (!node) return 'locked'
  if (node.region && !regionUnlocked(state, node.region)) return 'locked'
  return node.requires.every((req) => state.research.completed.includes(req))
    ? 'available'
    : 'locked'
}

export type ResearchCheck = 'ok' | 'locked' | 'already-done' | 'research-busy' | 'missing-items'

export function checkResearch(state: GameState, id: string): ResearchCheck {
  const status = researchStatus(state, id)
  if (status === 'done') return 'already-done'
  if (status === 'locked') return 'locked'
  if (state.research.current) return 'research-busy'
  if (!canPay(state, researchCost(state, id))) return 'missing-items'
  return 'ok'
}

/** What research costs right now (the Windbound Tome takes some off; never below 1). */
export function researchCost(state: GameState, id: string): CostEntry[] {
  const multiplier = researchCostMultiplier(state)
  const cost = RESEARCH[id]?.cost ?? []
  if (multiplier === 1) return cost
  return cost.map((e) => ({ ...e, amount: Math.max(1, Math.ceil(e.amount * multiplier)) }))
}

/** Starts research. One at a time; the cost is paid when it starts (see payingStocks). */
export function startResearch(state: GameState, id: string): GameEvent[] {
  const check = checkResearch(state, id)
  if (check !== 'ok') return [{ type: 'blocked', reason: check }]
  const node = RESEARCH[id]
  payCost(state, researchCost(state, id))
  state.research.current = { id, totalMs: node.durationMs, remainingMs: node.durationMs }
  return [{ type: 'research-start', researchId: id }]
}

export function advanceResearch(state: GameState, dtMs: number): void {
  const current = state.research.current
  if (!current) return
  current.remainingMs -= dtMs * researchSpeed(state)
  if (current.remainingMs > 0) return
  state.research.completed.push(current.id)
  state.research.current = null
  state.inbox.push({ type: 'research-done', researchId: current.id })
}
