import { describe, expect, it } from 'vitest'
import { BLOOM_LEVELS, BLOOM_REWARDS, SETTLEMENT_RULES } from '../src/data/bloom'
import { applyAction } from '../src/engine/actions'
import { addBloom, giveCurio } from '../src/engine/bloom'
import { bloomLevel, bloomLuck, bloomRegrowth } from '../src/engine/modifiers'
import { createNewGame, type GameState } from '../src/engine/state'
import { advance } from '../src/engine/tick'
import { travelMs } from '../src/engine/travel'

const START = 1_700_000_000_000

function quiet(): GameState {
  const state = createNewGame(START)
  state.traders.nextArrivalMs = 1e12
  state.challenges.nextCampMs = 1e12
  state.challenges.nextCreatureMs = 1e12
  state.weather.meadow = { kind: 'sunshine', remainingMs: 1e12 }
  return state
}

describe('bloom', () => {
  it('rises through levels and never goes down', () => {
    const state = quiet()
    expect(bloomLevel(state, 'meadow')).toBe(0)
    expect(addBloom(state, 'meadow', BLOOM_LEVELS[1].points)).toEqual([
      { type: 'bloom', regionId: 'meadow', amount: BLOOM_LEVELS[1].points, levelUp: true },
    ])
    expect(bloomLevel(state, 'meadow')).toBe(1)
    expect(addBloom(state, 'meadow', -50)).toEqual([])
    expect(state.bloom.meadow).toBe(BLOOM_LEVELS[1].points)
  })

  it('makes plants regrow faster and rarer plants likelier', () => {
    const state = quiet()
    addBloom(state, 'meadow', BLOOM_LEVELS[3].points)
    expect(bloomRegrowth(state, 'meadow')).toBeCloseTo(1.3)
    expect(bloomLuck(state, 'meadow')).toBeCloseTo(1.3)
  })
})

describe('curios', () => {
  it('are given once and change the game', () => {
    const state = quiet()
    expect(giveCurio(state, 'curio-pips-compass')).toEqual([
      { type: 'curio', curioId: 'curio-pips-compass' },
    ])
    expect(giveCurio(state, 'curio-pips-compass')).toEqual([])
    expect(travelMs(state, 'home', 'buttercup-rise')).toBe(7_200)

    giveCurio(state, 'curio-pocket-sundial')
    state.inventory = { 'potion-greenthumb-brew': 1 }
    applyAction(state, { type: 'potion/drink', potionId: 'potion-greenthumb-brew' })
    expect(state.buffs[0].remainingMs).toBe(3 * 60_000 * 1.2)
  })

  it('Festival Ribbon makes trader requests pay more', () => {
    const state = quiet()
    giveCurio(state, 'curio-festival-ribbon')
    state.inventory = { 'raw-daisy-petals': 5 }
    state.traders.requests.push({
      id: 1,
      traderId: 'trader-snail-peddler',
      wants: [{ itemId: 'raw-daisy-petals', amount: 5 }],
      glimmers: 100,
      trinketId: null,
      remainingMs: 60_000,
    })
    applyAction(state, { type: 'trade/fulfill', requestId: 1 })
    expect(state.resources.glimmers).toBe(110)
  })
})

describe('villager requests', () => {
  it('arrive in Thimblewick over time', () => {
    const state = quiet()
    advance(state, START + SETTLEMENT_RULES.firstArrivalMs)
    expect(state.settlements.thimblewick.requests).toHaveLength(1)
  })

  it('are filled in the village and raise the bloom', () => {
    const state = quiet()
    state.player.place = 'thimblewick'
    state.inventory = { 'raw-clover-leaves': 10 }
    state.settlements.thimblewick.requests.push({
      id: 5,
      traderId: 'villager-hob',
      wants: [{ itemId: 'raw-clover-leaves', amount: 6 }],
      glimmers: 7,
      trinketId: null,
      remainingMs: 60_000,
    })
    const events = applyAction(state, {
      type: 'villager/fulfill',
      settlementId: 'thimblewick',
      requestId: 5,
    })
    expect(events.map((e) => e.type)).toEqual(['villager-helped', 'bloom'])
    expect(state.bloom.meadow).toBe(BLOOM_REWARDS.settlementRequest)
    expect(state.resources.glimmers).toBe(7)
    expect(state.settlements.thimblewick.filled).toBe(1)
    expect(state.inventory).toEqual({ 'raw-clover-leaves': 4 })
  })

  it('must be filled in person', () => {
    const state = quiet()
    state.inventory = { 'raw-clover-leaves': 10 }
    state.settlements.thimblewick.requests.push({
      id: 5,
      traderId: 'villager-hob',
      wants: [{ itemId: 'raw-clover-leaves', amount: 6 }],
      glimmers: 7,
      trinketId: null,
      remainingMs: 60_000,
    })
    expect(
      applyAction(state, { type: 'villager/fulfill', settlementId: 'thimblewick', requestId: 5 }),
    ).toEqual([{ type: 'blocked', reason: 'not-here' }])
  })
})
