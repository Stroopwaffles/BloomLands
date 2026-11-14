import { describe, expect, it } from 'vitest'
import { SUPPLY_RULES } from '../src/data/helpers'
import { NIGHTFALL_MS } from '../src/data/time'
import { applyAction } from '../src/engine/actions'
import {
  advanceHelpers,
  bestSource,
  searchOdds,
  supplyHaul,
  supplyStatus,
} from '../src/engine/helpers'
import { createNewGame, type GameState, type HelperState } from '../src/engine/state'

const START = 1_700_000_000_000

function court(...upgrades: string[]): GameState {
  const state = createNewGame(START)
  state.upgrades.push('lodging-mouse-bunks', 'lodging-supply-nook', ...upgrades)
  state.time.dayMs = 0.2 * 3_600_000 // morning
  state.weather.meadow = { kind: 'breeze', remainingMs: 1e9 }
  return state
}

function supplier(state: GameState): HelperState {
  const helper: HelperState = {
    id: 1,
    type: 'supply',
    name: 'Test',
    task: null,
    phase: 'idle',
    remainingMs: 0,
    tripSpot: null,
    tripItem: null,
    bag: {},
  }
  state.helpers.list.push(helper)
  return helper
}

describe('supply helpers search with real odds', () => {
  it('bring plenty of commons, and uncommons less often', () => {
    const state = court()
    const clover = supplyHaul(state, 'raw-clover-leaves')
    const berries = supplyHaul(state, 'raw-wild-berries')
    expect(clover).toBeGreaterThan(4)
    expect(berries).toBeGreaterThan(0)
    expect(berries).toBeLessThan(clover)
  })

  it("can't search for rare plants until the court has a Seed Catalogue", () => {
    const state = court()
    expect(supplyHaul(state, 'raw-lucky-leaf')).toBe(0)
    expect(supplyStatus(state, 'raw-lucky-leaf')).toBe('too-rare')
    state.upgrades.push('lodging-seed-catalogue')
    const normal = supplyHaul(state, 'raw-lucky-leaf')
    expect(normal).toBeGreaterThan(0)
    expect(normal).toBeLessThan(0.3) // roughly one lucky leaf every several trips
    state.upgrades.push('lodging-botanists-library')
    expect(supplyHaul(state, 'raw-lucky-leaf')).toBeGreaterThan(normal * 1.8)
  })

  it('find no morning dew at night, unless it rains', () => {
    const state = court()
    expect(supplyHaul(state, 'raw-dewdrops')).toBeGreaterThan(0)
    state.time.dayMs = NIGHTFALL_MS + 60_000
    expect(supplyHaul(state, 'raw-dewdrops')).toBe(0)
    expect(supplyStatus(state, 'raw-dewdrops')).toBe('not-now')
    state.weather.meadow = { kind: 'light-rain', remainingMs: 1e9 }
    expect(supplyHaul(state, 'raw-dewdrops')).toBeGreaterThan(0)
  })

  it('luck and bloom help them too', () => {
    const state = court('lodging-seed-catalogue')
    const plain = searchOdds(state, 'buttercup-rise', 'raw-lucky-leaf').chance
    state.buffs.push({ potionId: 'potion-lucky-dew', remainingMs: 60_000 })
    expect(searchOdds(state, 'buttercup-rise', 'raw-lucky-leaf').chance).toBeGreaterThan(plain)
  })

  it('go where the odds are best', () => {
    const state = court()
    // Dewdrops grow at both Meadow spots; Buttercup Rise has fewer other plants competing.
    expect(bestSource(state, 'raw-dewdrops')?.spotId).toBeDefined()
  })

  it("don't set out for something they can't find, and come back with what they found", () => {
    const state = court()
    const helper = supplier(state)
    applyAction(state, { type: 'supply/setMinimum', itemId: 'raw-lucky-leaf', amount: 3 })
    advanceHelpers(state, 60_000, Math.random)
    expect(helper.phase).toBe('idle')
    applyAction(state, { type: 'supply/setMinimum', itemId: 'raw-clover-leaves', amount: 40 })
    for (let i = 0; i < 6; i++) advanceHelpers(state, 60_000, Math.random)
    const clover = state.inventory['raw-clover-leaves'] ?? 0
    expect(clover).toBeGreaterThan(0)
    expect(clover).toBeLessThanOrEqual(6 * SUPPLY_RULES.searches * 2)
  })
})
