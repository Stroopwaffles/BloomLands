import { describe, expect, it } from 'vitest'
import { advanceStations } from '../src/engine/crafting'
import { advanceResearch } from '../src/engine/research'
import { createNewGame } from '../src/engine/state'

describe('workshop and research news', () => {
  it('finished research posts a research-done event', () => {
    const state = createNewGame(0)
    state.research.current = { id: 'research-grinding', totalMs: 1000, remainingMs: 1000 }
    advanceResearch(state, 500)
    expect(state.inbox).toEqual([])
    advanceResearch(state, 600)
    expect(state.inbox).toEqual([{ type: 'research-done', researchId: 'research-grinding' }])
  })

  it('each finished workshop job posts a craft-done event with what it made', () => {
    const state = createNewGame(0)
    state.stations.mortar.jobs = [
      { id: 'refined-petal-paste', totalMs: 1000, remainingMs: 1000, count: 3 },
    ]
    advanceStations(state, 1000)
    expect(state.inbox).toEqual([
      {
        type: 'craft-done',
        recipeId: 'refined-petal-paste',
        itemId: 'refined-petal-paste',
        amount: 3,
      },
    ])
  })
})
