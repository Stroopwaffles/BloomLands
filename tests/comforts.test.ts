import { describe, expect, it } from 'vitest'
import { applyAction } from '../src/engine/actions'
import { trackedRequests } from '../src/engine/comforts'
import { createNewGame, type GameState, type HelperState } from '../src/engine/state'

const START = 1_700_000_000_000

function withComforts(): GameState {
  const state = createNewGame(START)
  state.upgrades.push('qol-recipe-book', 'qol-request-tracker', 'qol-helper-presets')
  return state
}

function helper(id: number, type: HelperState['type'], task: string | null): HelperState {
  return {
    id,
    type,
    name: 'H',
    task,
    phase: 'idle',
    remainingMs: 0,
    tripSpot: null,
    tripItem: null,
    bag: {},
  }
}

describe('the Recipe Book', () => {
  it('stars and unstars favorites, and needs the Comfort', () => {
    const plain = createNewGame(START)
    expect(
      applyAction(plain, { type: 'recipe/favorite', recipeId: 'refined-petal-paste' }),
    ).toEqual([{ type: 'blocked', reason: 'locked' }])
    const state = withComforts()
    applyAction(state, { type: 'recipe/favorite', recipeId: 'refined-petal-paste' })
    expect(state.preferences.favorites).toEqual(['refined-petal-paste'])
    applyAction(state, { type: 'recipe/favorite', recipeId: 'refined-petal-paste' })
    expect(state.preferences.favorites).toEqual([])
  })
})

describe('the Request Board', () => {
  it('pins a request until it is filled or leaves', () => {
    const state = withComforts()
    state.traders.requests = [
      {
        id: 7,
        traderId: 'trader-tumble',
        wants: [{ itemId: 'raw-daisy-petals', amount: 5 }],
        glimmers: 50,
        trinketId: null,
        remainingMs: 60_000,
      },
    ]
    applyAction(state, { type: 'request/track', kind: 'trader', requestId: 7 })
    expect(trackedRequests(state).map((t) => t.requestId)).toEqual([7])
    // Pinning something that isn't there does nothing.
    expect(applyAction(state, { type: 'request/track', kind: 'trader', requestId: 99 })).toEqual([
      { type: 'blocked', reason: 'no-target' },
    ])
    // Once it's gone, it drops off the board.
    state.traders.requests = []
    expect(trackedRequests(state)).toEqual([])
  })
})

describe('the Helper Ledger', () => {
  it('saves everyone’s jobs and puts them back', () => {
    const state = withComforts()
    state.upgrades.push('lodging-mouse-bunks')
    state.helpers.list = [
      helper(1, 'gatherer', 'buttercup-rise'),
      helper(2, 'gatherer', 'dandelion-drift'),
    ]
    applyAction(state, { type: 'helpers/savePreset', slot: 0 })
    applyAction(state, { type: 'helpers/assign', helperId: 1, spotId: 'dandelion-drift' })
    applyAction(state, { type: 'helpers/assign', helperId: 2, spotId: null })
    applyAction(state, { type: 'helpers/applyPreset', slot: 0 })
    expect(state.helpers.list.map((h) => h.task)).toEqual(['buttercup-rise', 'dandelion-drift'])
  })

  it('favorites and saved jobs last through the Root Song; pins don’t', () => {
    const state = withComforts()
    applyAction(state, { type: 'recipe/favorite', recipeId: 'refined-petal-paste' })
    state.helpers.list = [helper(1, 'gatherer', 'buttercup-rise')]
    applyAction(state, { type: 'helpers/savePreset', slot: 1 })
    state.tracked = [{ kind: 'trader', requestId: 1 }]
    state.upgrades.push('lodging-ritual-circle')
    state.unlockedRegions.push('sky')
    state.research.completed.push('research-root-song')
    state.inventory['component-harmony-blend'] = 1
    for (let id = 10; id < 60; id++) state.helpers.list.push(helper(id, 'gatherer', null))
    applyAction(state, { type: 'ritual/perform', ritualId: 'ritual-root-song' })
    expect(state.prestige.run).toBe(2)
    expect(state.preferences.favorites).toEqual(['refined-petal-paste'])
    expect(state.preferences.helperPresets[1]?.jobs[0]).toMatchObject({ task: 'buttercup-rise' })
    expect(state.tracked).toEqual([])
  })
})
