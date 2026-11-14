import { describe, expect, it } from 'vitest'
import { applyAction } from '../src/engine/actions'
import { advanceBloomcalls, weatherFlightFactor } from '../src/engine/environment'
import { plantWeights } from '../src/engine/gathering'
import { checkRitual, ritualCost } from '../src/engine/magic'
import { hasLight, weatherCleared } from '../src/engine/modifiers'
import { createNewGame, type GameState } from '../src/engine/state'

const START = 1_700_000_000_000

function atCircle(...research: string[]): GameState {
  const state = createNewGame(START)
  state.upgrades.push('lodging-ritual-circle')
  state.unlockedRegions.push('forest', 'swamp', 'glade')
  state.research.completed.push(...research)
  return state
}

const perform = (state: GameState, ritualId: string, regionId?: string, weather?: string) =>
  applyAction(state, {
    type: 'ritual/perform',
    ritualId,
    regionId,
    weather: weather as never,
  })

describe('Rite of Renewal', () => {
  it('raises a chosen region’s bloom, asking one more signature each time', () => {
    const state = atCircle('research-renewal')
    state.inventory = {
      'component-everbloom-essence': 2,
      'component-earth-loam': 3,
    }
    expect(checkRitual(state, 'ritual-renewal')).toBe('no-target')
    expect(ritualCost(state, 'ritual-renewal', 'forest')).toEqual([
      { itemId: 'component-everbloom-essence', amount: 1 },
      { itemId: 'component-earth-loam', amount: 1 },
    ])
    const before = state.bloom.forest ?? 0
    perform(state, 'ritual-renewal', 'forest')
    expect(state.bloom.forest).toBe(before + 20)
    expect(ritualCost(state, 'ritual-renewal', 'forest')[1]).toEqual({
      itemId: 'component-earth-loam',
      amount: 2,
    })
    perform(state, 'ritual-renewal', 'forest')
    expect(state.inventory['component-earth-loam']).toBeUndefined()
    expect(checkRitual(state, 'ritual-renewal', 'forest')).toBe('missing-items')
  })
})

describe('Bloomcall', () => {
  it('makes rare plants twice as likely in one region, for a while', () => {
    const state = atCircle('research-bloomcall')
    state.inventory = { 'component-everbloom-essence': 1, 'component-lucky-charm-dust': 1 }
    const rare = () =>
      plantWeights(state, 'mossy-stump-ring').find(([id]) => id === 'plant-golden-chanterelle')![1]
    const before = rare()
    perform(state, 'ritual-bloomcall', 'forest')
    expect(rare()).toBeCloseTo(before * 2)
    advanceBloomcalls(state, 10 * 60_000)
    expect(rare()).toBeCloseTo(before)
  })
})

describe('Rite of Clear Skies', () => {
  it('sets a region’s weather, but never the Glade’s moon', () => {
    const state = atCircle('research-clear-skies')
    state.inventory = { 'component-wind-silk': 2, 'component-crystal-focus': 2 }
    expect(checkRitual(state, 'ritual-clear-skies', 'glade', 'full-moon')).toBe('no-target')
    expect(checkRitual(state, 'ritual-clear-skies', 'forest', 'sunshine')).toBe('no-target')
    perform(state, 'ritual-clear-skies', 'forest', 'rain')
    expect(state.weather.forest).toEqual({ kind: 'rain', remainingMs: 15 * 60_000 })
  })
})

describe('Moonsight and Featherfall', () => {
  it('Moonsight sees through fog and the dark, and lights the Caves', () => {
    const state = atCircle()
    expect(weatherCleared(state, 'fog')).toBe(false)
    expect(hasLight(state)).toBe(false)
    state.buffs.push({ potionId: 'potion-moonsight', remainingMs: 60_000 })
    expect(weatherCleared(state, 'fog')).toBe(true)
    expect(weatherCleared(state, 'new-moon')).toBe(true)
    expect(hasLight(state)).toBe(true)
  })

  it('Featherfall: weather never slows flights, but can still help', () => {
    const state = atCircle()
    state.weather.forest = { kind: 'rain', remainingMs: 1e9 }
    expect(weatherFlightFactor(state, 'home', 'fernshade-floor')).toBeGreaterThan(1)
    state.buffs.push({ potionId: 'potion-featherfall', remainingMs: 60_000 })
    expect(weatherFlightFactor(state, 'home', 'fernshade-floor')).toBe(1)
  })
})
