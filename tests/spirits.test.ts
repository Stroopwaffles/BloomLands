import { describe, expect, it } from 'vitest'
import { BLOOM_LEVELS, BLOOM_REWARDS } from '../src/data/bloom'
import { applyAction } from '../src/engine/actions'
import { addBloom } from '../src/engine/bloom'
import { checkSpirit, spiritAwake } from '../src/engine/spirits'
import { createNewGame } from '../src/engine/state'
import { advance } from '../src/engine/tick'

const START = 1_700_000_000_000

describe('Sorrel', () => {
  it('lives at Sunstone Hill, which can be flown to', () => {
    const state = createNewGame(START)
    applyAction(state, { type: 'travel/go', to: 'sunstone-hill' }, () => 0.99)
    advance(state, START + 10_000)
    expect(state.player.place).toBe('sunstone-hill')
  })

  it('awakens once every requirement is met, taking the offering', () => {
    const state = createNewGame(START)
    state.player.place = 'sunstone-hill'
    expect(checkSpirit(state, 'spirit-sorrel')).toBe('missing-items')

    addBloom(state, 'meadow', BLOOM_LEVELS[2].points)
    state.stories['story-pip'] = { chapter: 3, statStart: 0, complete: true }
    expect(checkSpirit(state, 'spirit-sorrel')).toBe('missing-items') // no offering yet
    state.inventory = { 'component-sun-salve': 3 }
    expect(checkSpirit(state, 'spirit-sorrel')).toBe('ok')

    const before = state.bloom.meadow
    const events = applyAction(state, { type: 'spirit/awaken', spiritId: 'spirit-sorrel' })
    expect(events.map((e) => e.type)).toContain('bloom')
    expect(spiritAwake(state, 'spirit-sorrel')).toBe(true)
    expect(state.inventory).toEqual({})
    expect(state.bloom.meadow).toBe(before + BLOOM_REWARDS.spiritAwakened)
    expect(checkSpirit(state, 'spirit-sorrel')).toBe('already-done')
  })

  it('must be visited in person', () => {
    const state = createNewGame(START)
    expect(checkSpirit(state, 'spirit-sorrel')).toBe('not-here')
  })
})
