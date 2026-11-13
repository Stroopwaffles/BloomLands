import { describe, expect, it } from 'vitest'
import { HELPER_RULES } from '../src/data/helpers'
import { baseTravelMs } from '../src/data/world'
import { applyAction } from '../src/engine/actions'
import { recruitCost, supplyableItems, supplyHaul } from '../src/engine/helpers'
import { courtPoints, helperCapacity } from '../src/engine/modifiers'
import { countItems, createNewGame, type GameState } from '../src/engine/state'
import { advance } from '../src/engine/tick'

const START = 1_700_000_000_000
const TRIP_TO_BUTTERCUP = baseTravelMs('home', 'buttercup-rise')!
const FULL_TRIP = TRIP_TO_BUTTERCUP * 2 + HELPER_RULES.gatherMs

/** A game standing in Thimblewick with lodging for helpers and money to recruit. */
function inThimblewick(upgrades = ['lodging-mouse-bunks', 'lodging-supply-nook']): GameState {
  const state = createNewGame(START)
  state.upgrades = [...upgrades]
  state.resources.glimmers = 10_000
  state.player.place = 'thimblewick'
  state.traders.nextArrivalMs = 1e12 // keep traders out of these tests
  return state
}

describe('Thimblewick', () => {
  it('can be flown to', () => {
    const state = createNewGame(START)
    applyAction(state, { type: 'travel/go', to: 'thimblewick' })
    advance(state, START + 6_000)
    expect(state.player.place).toBe('thimblewick')
    expect(state.spots).toEqual({}) // a settlement is not a harvesting spot
  })
})

describe('recruiting', () => {
  it('needs lodging first, and room', () => {
    const state = inThimblewick([])
    expect(applyAction(state, { type: 'helpers/recruit', helperType: 'gatherer' })).toEqual([
      { type: 'blocked', reason: 'locked' },
    ])
    state.upgrades.push('lodging-mouse-bunks')
    expect(helperCapacity(state, 'gatherer')).toBe(2)
    applyAction(state, { type: 'helpers/recruit', helperType: 'gatherer' })
    applyAction(state, { type: 'helpers/recruit', helperType: 'gatherer' })
    expect(applyAction(state, { type: 'helpers/recruit', helperType: 'gatherer' })).toEqual([
      { type: 'blocked', reason: 'no-room' },
    ])
  })

  it('only happens at a settlement', () => {
    const state = inThimblewick()
    state.player.place = 'home'
    expect(
      applyAction(state, { type: 'helpers/recruit', helperType: 'gatherer' })[0],
    ).toMatchObject({ reason: 'not-here' })
  })

  it('costs more for each helper of a type, and adds court points', () => {
    const state = inThimblewick()
    const first = recruitCost(state, 'gatherer')
    const pointsBefore = courtPoints(state)
    applyAction(state, { type: 'helpers/recruit', helperType: 'gatherer' })
    expect(state.resources.glimmers).toBe(10_000 - first)
    expect(recruitCost(state, 'gatherer')).toBeGreaterThan(first)
    expect(courtPoints(state)).toBe(pointsBefore + HELPER_RULES.courtPoints)
    expect(state.helpers.list[0]).toMatchObject({ type: 'gatherer', name: 'Nutmeg' })
  })
})

describe('gatherers', () => {
  it('fly out, gather, fly home and unpack into storage, again and again', () => {
    const state = inThimblewick()
    applyAction(state, { type: 'helpers/recruit', helperType: 'gatherer' })
    applyAction(state, { type: 'helpers/assign', helperId: 1, spotId: 'buttercup-rise' })
    const helper = state.helpers.list[0]

    advance(state, START + 1000)
    expect(helper.phase).toBe('outbound')
    advance(state, START + TRIP_TO_BUTTERCUP + 1000)
    expect(helper.phase).toBe('gathering')
    advance(state, START + TRIP_TO_BUTTERCUP + HELPER_RULES.gatherMs + 1000)
    expect(helper.phase).toBe('returning')
    expect(countItems(helper.bag)).toBeGreaterThan(0)
    advance(state, START + FULL_TRIP + 2000)
    expect(countItems(state.inventory)).toBeGreaterThan(0)
    expect(state.stats.helperTrips).toBe(1)
    expect(helper.phase).toBe('outbound') // straight back out
  })

  it('keep working while the game is closed', () => {
    const state = inThimblewick()
    state.upgrades.push('lodging-storeroom-1', 'lodging-storeroom-2', 'lodging-storeroom-3')
    applyAction(state, { type: 'helpers/recruit', helperType: 'gatherer' })
    advance(state, START + 60 * 60_000) // one hour away
    expect(state.stats.helperTrips).toBeGreaterThanOrEqual(Math.floor(3_600_000 / FULL_TRIP) - 1)
    expect(countItems(state.inventory)).toBeGreaterThan(20)
  })

  it('rest at home when given no spot', () => {
    const state = inThimblewick()
    applyAction(state, { type: 'helpers/recruit', helperType: 'gatherer' })
    applyAction(state, { type: 'helpers/assign', helperId: 1, spotId: null })
    advance(state, START + 10 * 60_000)
    expect(state.helpers.list[0].phase).toBe('idle')
    expect(state.inventory).toEqual({})
  })

  it('wait at home with their haul when storage is full, then unpack when there is room', () => {
    const state = inThimblewick()
    state.inventory = { 'raw-clover-leaves': 100 } // storage full
    applyAction(state, { type: 'helpers/recruit', helperType: 'gatherer' })
    advance(state, START + FULL_TRIP + 1000)
    const helper = state.helpers.list[0]
    expect(helper.phase).toBe('unloading')
    const carried = countItems(helper.bag)
    state.upgrades.push('lodging-storeroom-1')
    advance(state, START + FULL_TRIP + 1100)
    expect(countItems(helper.bag)).toBe(0)
    expect(countItems(state.inventory)).toBe(100 + carried)
  })
})

describe('supply helpers', () => {
  it('only know raw materials that grow somewhere', () => {
    expect(supplyableItems()).toContain('raw-daisy-petals')
    expect(supplyableItems()).not.toContain('refined-petal-paste')
  })

  it('fetch whatever falls below its minimum', () => {
    const state = inThimblewick()
    applyAction(state, { type: 'helpers/recruit', helperType: 'supply' })
    advance(state, START + 60_000)
    expect(state.helpers.list[0].phase).toBe('idle') // nothing to do yet

    applyAction(state, { type: 'supply/setMinimum', itemId: 'raw-wild-berries', amount: 6 })
    advance(state, START + 61_000)
    const helper = state.helpers.list[0]
    expect(helper).toMatchObject({
      phase: 'outbound',
      tripItem: 'raw-wild-berries',
      tripSpot: 'dandelion-drift',
    })
    advance(state, START + 61_000 + 2 * 12_000 + HELPER_RULES.gatherMs + 1000)
    expect(state.inventory['raw-wild-berries']).toBe(supplyHaul('raw-wild-berries'))
  })

  it('stop once stock is at the minimum', () => {
    const state = inThimblewick()
    state.inventory = { 'raw-daisy-petals': 50 }
    applyAction(state, { type: 'helpers/recruit', helperType: 'supply' })
    applyAction(state, { type: 'supply/setMinimum', itemId: 'raw-daisy-petals', amount: 20 })
    advance(state, START + 10 * 60_000)
    expect(state.helpers.list[0].phase).toBe('idle')
    expect(state.inventory['raw-daisy-petals']).toBe(50)
  })

  it("don't double up on an item another supply helper is already fetching", () => {
    const state = inThimblewick([
      'lodging-mouse-bunks',
      'lodging-supply-nook',
      'lodging-supply-nook-2',
    ])
    applyAction(state, { type: 'helpers/recruit', helperType: 'supply' })
    applyAction(state, { type: 'helpers/recruit', helperType: 'supply' })
    const haul = supplyHaul('raw-daisy-petals')
    applyAction(state, { type: 'supply/setMinimum', itemId: 'raw-daisy-petals', amount: haul })
    advance(state, START + 1000)
    const busy = state.helpers.list.filter((h) => h.phase !== 'idle')
    expect(busy).toHaveLength(1)
  })

  it('setting a minimum to 0 clears it', () => {
    const state = inThimblewick()
    applyAction(state, { type: 'supply/setMinimum', itemId: 'raw-daisy-petals', amount: 5 })
    applyAction(state, { type: 'supply/setMinimum', itemId: 'raw-daisy-petals', amount: 0 })
    expect(state.supply.minimums).toEqual({})
  })
})
