import { describe, expect, it } from 'vitest'
import { BLOOM_REWARDS } from '../src/data/bloom'
import { CREWS } from '../src/data/challenges'
import { applyAction } from '../src/engine/actions'
import { ensureSpot } from '../src/engine/gathering'
import { helperCapacity } from '../src/engine/modifiers'
import { stateRandom } from '../src/engine/rng'
import { createNewGame, type GameState, type TravelState } from '../src/engine/state'
import { advance } from '../src/engine/tick'

const START = 1_700_000_000_000
const DRIFTERS = 'dandelion-drifters'

function atCamp(): GameState {
  const state = createNewGame(START)
  state.player.place = 'buttercup-rise'
  ensureSpot(state, 'buttercup-rise', stateRandom(state))
  state.challenges.camps['buttercup-rise'] = DRIFTERS
  state.challenges.nextCampMs = 1e12
  state.challenges.nextCreatureMs = 1e12
  state.traders.nextArrivalMs = 1e12
  state.research.completed.push('research-parley')
  state.inventory = { 'component-sweet-bait': 5, 'component-sun-salve': 5 }
  return state
}

/** Reads the flight through a function so TypeScript doesn't narrow it after a reset. */
const currentTravel = (state: GameState): TravelState | null => state.player.travel

const parley = (state: GameState) =>
  applyAction(state, { type: 'spell/cast', spellId: 'spell-parley' })

describe('winning over the Dandelion Drifters', () => {
  it('takes a few Parleys, each with its own words', () => {
    const state = atCamp()
    const first = parley(state)
    expect(first[1]).toMatchObject({ type: 'story', text: CREWS[DRIFTERS].parleyLines[0] })
    expect(state.crews[DRIFTERS]).toEqual({ trust: 1, won: false })
    expect(state.challenges.camps['buttercup-rise']).toBe(DRIFTERS)
    parley(state)
    const last = parley(state)
    expect(last.map((e) => e.type)).toEqual(['spell-cast', 'story', 'crew-won', 'bloom'])
    expect(state.crews[DRIFTERS].won).toBe(true)
    expect(state.challenges.camps).toEqual({})
    expect(state.bloom.meadow).toBe(BLOOM_REWARDS.crewWonOver)
    expect(state.inventory).toEqual({ 'component-sweet-bait': 2, 'component-sun-salve': 2 })
  })

  it('once won, the crew never camps again this run, and brings pirate helpers', () => {
    const state = atCamp()
    expect(helperCapacity(state, 'pirate')).toBe(0)
    parley(state)
    parley(state)
    parley(state)
    expect(helperCapacity(state, 'pirate')).toBe(2)
    state.challenges.nextCampMs = 0
    advance(state, START + 1000)
    expect(state.challenges.camps).toEqual({})
  })

  it('once won, there are no more ambushes', () => {
    const state = atCamp()
    state.crews[DRIFTERS] = { trust: 3, won: true }
    state.player.place = 'home'
    const kinds = new Set<string>()
    for (let i = 0; i < 200; i++) {
      state.player.travel = null
      applyAction(state, { type: 'travel/go', to: 'buttercup-rise' })
      const travel = currentTravel(state)
      if (travel?.event) kinds.add(travel.event.kind)
    }
    expect(kinds.has('ambush')).toBe(false)
    expect(kinds.size).toBeGreaterThan(0)
  })

  it('reformed pirates are recruited in Thimblewick and gather like gatherers', () => {
    const state = atCamp()
    state.crews[DRIFTERS] = { trust: 3, won: true }
    state.player.place = 'thimblewick'
    state.resources.glimmers = 1000
    expect(applyAction(state, { type: 'helpers/recruit', helperType: 'pirate' })[0].type).toBe(
      'recruited',
    )
    const pirate = state.helpers.list[0]
    expect(pirate.task).not.toBeNull()
    applyAction(state, { type: 'helpers/assign', helperId: pirate.id, spotId: 'dandelion-drift' })
    expect(pirate.task).toBe('dandelion-drift')
  })
})
