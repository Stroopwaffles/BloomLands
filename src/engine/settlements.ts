import { BLOOM_REWARDS, SETTLEMENT_RULES, VILLAGERS } from '../data/bloom'
import { SETTLEMENTS } from '../data/world'
import { addBloom } from './bloom'
import { requestStayMultiplier, settlementBloomMultiplier } from './modifiers'
import { canPay, payCost } from './costs'
import type { GameEvent } from './events'
import type { Random } from './rng'
import type { GameState, TradeRequest } from './state'
import { rollWants } from './traders'

/**
 * Villager requests (design doc 3.11): helping a settlement makes it thrive, which raises the
 * region's bloom. Villagers pay a little Glimmers too.
 */

function makeVillagerRequest(state: GameState, settlementId: string, random: Random): TradeRequest {
  const { wants, value } = rollWants(state, random)
  const villagers = VILLAGERS[settlementId] ?? []
  return {
    id: state.traders.nextRequestId++,
    traderId: villagers[Math.floor(random() * villagers.length)]?.id ?? 'villager',
    wants,
    glimmers: Math.round(value * SETTLEMENT_RULES.rewardMultiplier),
    trinketId: null,
    remainingMs: Math.round(SETTLEMENT_RULES.expiryMs * requestStayMultiplier(state)),
  }
}

export function advanceSettlements(state: GameState, dtMs: number, random: Random): void {
  for (const [settlementId, settlement] of Object.entries(state.settlements)) {
    for (const request of settlement.requests) request.remainingMs -= dtMs
    if (settlement.requests.some((r) => r.remainingMs <= 0)) {
      settlement.requests = settlement.requests.filter((r) => r.remainingMs > 0)
    }
    if (settlement.requests.length >= SETTLEMENT_RULES.maxRequests) continue
    settlement.nextArrivalMs -= dtMs
    if (settlement.nextArrivalMs > 0) continue
    settlement.requests.push(makeVillagerRequest(state, settlementId, random))
    settlement.nextArrivalMs = SETTLEMENT_RULES.arrivalMs
  }
}

export type VillagerCheck = 'ok' | 'not-here' | 'missing-items' | 'locked'

export function checkVillagerRequest(
  state: GameState,
  settlementId: string,
  requestId: number,
): VillagerCheck {
  const request = state.settlements[settlementId]?.requests.find((r) => r.id === requestId)
  if (!request) return 'locked'
  if (state.player.travel || state.player.place !== settlementId) return 'not-here'
  if (!canPay(state, request.wants)) return 'missing-items'
  return 'ok'
}

export function fulfillVillagerRequest(
  state: GameState,
  settlementId: string,
  requestId: number,
): GameEvent[] {
  const check = checkVillagerRequest(state, settlementId, requestId)
  if (check !== 'ok') return [{ type: 'blocked', reason: check }]
  const settlement = state.settlements[settlementId]
  const request = settlement.requests.find((r) => r.id === requestId)!
  payCost(state, request.wants)
  state.resources.glimmers += request.glimmers
  state.stats.glimmersEarned += request.glimmers
  settlement.requests = settlement.requests.filter((r) => r.id !== requestId)
  settlement.filled++
  state.stats.villagersHelped++
  return [
    { type: 'villager-helped', settlementId, glimmers: request.glimmers },
    ...addBloom(
      state,
      SETTLEMENTS[settlementId].regionId,
      BLOOM_REWARDS.settlementRequest * settlementBloomMultiplier(state),
    ),
  ]
}

export function dismissVillagerRequest(
  state: GameState,
  settlementId: string,
  requestId: number,
): GameEvent[] {
  const settlement = state.settlements[settlementId]
  if (settlement) settlement.requests = settlement.requests.filter((r) => r.id !== requestId)
  return []
}
