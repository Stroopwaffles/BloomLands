import { describe, expect, it } from 'vitest'
import { DAY_MS } from '../src/data/time'
import { applyAction } from '../src/engine/actions'
import { supplyableItems } from '../src/engine/helpers'
import { createNewGame, type GameState } from '../src/engine/state'
import { advance } from '../src/engine/tick'

const START = 1_700_000_000_000

function readyForDawn(): GameState {
  const state = createNewGame(START)
  state.upgrades.push('lodging-ritual-circle')
  state.research.completed.push('research-rite-of-dawn')
  state.inventory = { 'component-sun-salve': 2, 'component-lucky-charm-dust': 2 }
  state.time.dayMs = 0.1 * DAY_MS // morning
  return state
}

describe('the Fairy Ring', () => {
  it('stays hidden until the Rite of Dawn is performed', () => {
    const state = createNewGame(START)
    expect(applyAction(state, { type: 'travel/go', to: 'fairy-ring' })).toEqual([
      { type: 'blocked', reason: 'locked' },
    ])
  })

  it('the Rite of Dawn only works in the morning', () => {
    const state = readyForDawn()
    state.time.dayMs = 0.7 * DAY_MS
    expect(applyAction(state, { type: 'ritual/perform', ritualId: 'ritual-dawn' })).toEqual([
      { type: 'blocked', reason: 'not-morning' },
    ])
  })

  it('opens the ring; the first visit finds a curio and an outfit', () => {
    const state = readyForDawn()
    const events = applyAction(state, { type: 'ritual/perform', ritualId: 'ritual-dawn' })
    expect(events.map((e) => e.type)).toEqual(['ritual-performed', 'secret'])
    expect(state.secrets).toEqual(['fairy-ring'])
    expect(applyAction(state, { type: 'ritual/perform', ritualId: 'ritual-dawn' })).toEqual([
      { type: 'blocked', reason: 'already-done' },
    ])

    applyAction(state, { type: 'travel/go', to: 'fairy-ring' }, () => 0.99)
    advance(state, START + 9_000)
    expect(state.player.place).toBe('fairy-ring')
    expect(state.curios).toContain('curio-pocket-sundial')
    expect(state.outfits).toContain('outfit-dewdrop')
    expect(state.inbox.map((e) => e.type)).toEqual(['secret', 'curio', 'outfit'])
    expect(state.spots['fairy-ring'].slots).toHaveLength(9)
  })

  it("isn't somewhere supply helpers go", () => {
    expect(supplyableItems()).not.toContain('raw-ringcap')
  })
})
