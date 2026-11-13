import { UPGRADES } from '../data/upgrades'
import { canPay, payCost } from './costs'
import type { GameEvent } from './events'
import { courtRank } from './modifiers'
import type { GameState } from './state'

export type UpgradeCheck =
  'ok' | 'already-done' | 'locked' | 'not-home' | 'missing-glimmers' | 'missing-items'

export function checkUpgrade(state: GameState, id: string): UpgradeCheck {
  const upgrade = UPGRADES[id]
  if (!upgrade) return 'locked'
  if (state.upgrades.includes(id)) return 'already-done'
  if (!upgrade.requires.every((req) => state.upgrades.includes(req))) return 'locked'
  if (state.player.travel || state.player.place !== 'home') return 'not-home'
  if (state.resources.glimmers < upgrade.glimmers) return 'missing-glimmers'
  if (!canPay(state, upgrade.items)) return 'missing-items'
  return 'ok'
}

export function buyUpgrade(state: GameState, id: string): GameEvent[] {
  const check = checkUpgrade(state, id)
  if (check !== 'ok') return [{ type: 'blocked', reason: check }]
  const upgrade = UPGRADES[id]
  const rankBefore = courtRank(state)
  state.resources.glimmers -= upgrade.glimmers
  payCost(state, upgrade.items)
  state.upgrades.push(id)
  return [{ type: 'upgrade-bought', upgradeId: id, rankUp: courtRank(state) > rankBefore }]
}
