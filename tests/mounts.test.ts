import { describe, expect, it } from 'vitest'
import { HELPER_RULES } from '../src/data/helpers'
import { levelUpFood, mountBonusValue, MOUNTS } from '../src/data/mounts'
import { applyAction } from '../src/engine/actions'
import { helperFlightMs } from '../src/engine/helpers'
import { satchelCapacity, wingSpeed } from '../src/engine/modifiers'
import { befriended, checkFeed, ownsMount } from '../src/engine/mounts'
import { createNewGame, type GameState } from '../src/engine/state'
import { advance } from '../src/engine/tick'

const START = 1_700_000_000_000
const BEE = 'mount-bumblebee'
const bee = MOUNTS[BEE]

function atButtercup(): GameState {
  const state = createNewGame(START)
  state.player.place = 'buttercup-rise'
  state.traders.nextArrivalMs = 1e12
  state.challenges.nextCampMs = 1e12
  state.challenges.nextCreatureMs = 1e12
  state.weather.meadow = { kind: 'breeze', remainingMs: 1e12 } // breeze: no regrowth bonus
  state.inventory = { 'raw-clover-leaves': 200 }
  return state
}

function befriendBee(state: GameState) {
  for (let i = 0; i < bee.feedingsToBefriend; i++) {
    expect(applyAction(state, { type: 'mount/feed', mountId: BEE })[0].type).toBe('mount-fed')
    state.mounts.friendship[BEE].cooldownMs = 0
  }
}

describe('befriending the bumblebee', () => {
  it('takes several feedings, a little while apart', () => {
    const state = atButtercup()
    applyAction(state, { type: 'mount/feed', mountId: BEE })
    expect(checkFeed(state, BEE)).toBe('not-ready')
    advance(state, START + bee.feedCooldownMs)
    expect(checkFeed(state, BEE)).toBe('ok')
    expect(state.inventory['raw-clover-leaves']).toBe(200 - bee.food.amount)
  })

  it('only happens where the bumblebee lives', () => {
    const state = atButtercup()
    state.player.place = 'dandelion-drift'
    expect(checkFeed(state, BEE)).toBe('not-here')
  })

  it('then Kindred Call tames it, if there is a roost for it', () => {
    const state = atButtercup()
    befriendBee(state)
    expect(befriended(state, BEE)).toBe(true)
    expect(checkFeed(state, BEE)).toBe('already-done')

    state.research.completed.push('research-kindred-call')
    state.inventory['component-sweet-bait'] = 1
    state.inventory['component-sun-salve'] = 1
    const noRoost = applyAction(state, { type: 'spell/cast', spellId: 'spell-kindred-call' })
    expect(noRoost).toEqual([{ type: 'blocked', reason: 'no-target' }])

    state.upgrades.push('lodging-roost')
    const events = applyAction(state, { type: 'spell/cast', spellId: 'spell-kindred-call' })
    expect(events.map((e) => e.type)).toEqual(['spell-cast', 'mount-tamed'])
    expect(ownsMount(state, BEE)).toBe(true)
  })
})

describe('riding', () => {
  function ownedBee(): GameState {
    const state = atButtercup()
    state.mounts.owned[BEE] = { level: 1 }
    state.player.place = 'home'
    return state
  }

  it('is chosen at home, and makes flights faster', () => {
    const state = ownedBee()
    expect(wingSpeed(state)).toBe(1)
    applyAction(state, { type: 'mount/ride', mountId: BEE })
    expect(wingSpeed(state)).toBe(bee.speed)
    applyAction(state, { type: 'mount/ride', mountId: null })
    expect(state.mounts.riding).toBeNull()
  })

  it('carries extra in its home region', () => {
    const state = ownedBee()
    applyAction(state, { type: 'mount/ride', mountId: BEE })
    state.player.place = 'buttercup-rise'
    expect(satchelCapacity(state)).toBe(20 + mountBonusValue(bee, 1))
  })

  it('levels up by feeding, getting faster and carrying more', () => {
    const state = ownedBee()
    applyAction(state, { type: 'mount/ride', mountId: BEE })
    const food = levelUpFood(bee, 1)
    applyAction(state, { type: 'mount/levelUp', mountId: BEE })
    expect(state.mounts.owned[BEE].level).toBe(2)
    expect(state.inventory['raw-clover-leaves']).toBe(200 - food.amount)
    expect(wingSpeed(state)).toBeCloseTo(bee.speed + bee.speedPerLevel)
  })

  it("can't ride a mount you don't own", () => {
    const state = atButtercup()
    state.player.place = 'home'
    expect(applyAction(state, { type: 'mount/ride', mountId: BEE })).toEqual([
      { type: 'blocked', reason: 'locked' },
    ])
  })
})

describe('helpers and spare mounts', () => {
  it('a spare mount speeds up the first helper', () => {
    const state = atButtercup()
    state.helpers.list.push({
      id: 1,
      type: 'gatherer',
      name: 'Nutmeg',
      task: 'buttercup-rise',
      phase: 'idle',
      remainingMs: 0,
      tripSpot: null,
      tripItem: null,
      bag: {},
    })
    const helper = state.helpers.list[0]
    expect(helperFlightMs(state, helper, 'buttercup-rise')).toBe(8_000)
    state.mounts.owned[BEE] = { level: 1 }
    expect(helperFlightMs(state, helper, 'buttercup-rise')).toBe(Math.ceil(8_000 / bee.speed))
    state.mounts.riding = BEE // now it isn't spare
    expect(helperFlightMs(state, helper, 'buttercup-rise')).toBe(8_000)
    expect(HELPER_RULES.gatherMs).toBeGreaterThan(0)
  })
})
