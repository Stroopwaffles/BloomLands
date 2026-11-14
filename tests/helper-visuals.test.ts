import { describe, expect, it } from 'vitest'
import { helperFlight, helperFlightMs, helpersAt } from '../src/engine/helpers'
import { createNewGame, type HelperState } from '../src/engine/state'

function helper(over: Partial<HelperState>): HelperState {
  return {
    id: 1,
    type: 'gatherer',
    name: 'Pip',
    task: 'buttercup-rise',
    phase: 'idle',
    remainingMs: 0,
    tripSpot: null,
    tripItem: null,
    bag: {},
    ...over,
  }
}

describe('where helpers show up', () => {
  it('helpersAt lists only helpers busy at that place', () => {
    const state = createNewGame(0)
    state.helpers.list.push(
      helper({ id: 1, phase: 'gathering', tripSpot: 'buttercup-rise' }),
      helper({ id: 2, phase: 'outbound', tripSpot: 'buttercup-rise' }),
      helper({ id: 3, phase: 'gathering', tripSpot: 'dandelion-drift' }),
    )
    expect(helpersAt(state, 'buttercup-rise').map((h) => h.id)).toEqual([1])
  })

  it('helperFlight runs from home (0) to the spot (1), both ways', () => {
    const state = createNewGame(0)
    const out = helper({ phase: 'outbound', tripSpot: 'buttercup-rise' })
    state.helpers.list.push(out)
    const total = helperFlightMs(state, out, 'buttercup-rise')
    out.remainingMs = total
    expect(helperFlight(state, out)?.t).toBeCloseTo(0)
    out.remainingMs = total / 4
    expect(helperFlight(state, out)?.t).toBeCloseTo(0.75)
    out.phase = 'returning'
    expect(helperFlight(state, out)).toMatchObject({ returning: true })
    expect(helperFlight(state, out)?.t).toBeCloseTo(0.25)
    out.phase = 'gathering'
    expect(helperFlight(state, out)).toBeNull()
  })
})
