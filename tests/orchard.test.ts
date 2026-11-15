import { describe, expect, it } from 'vitest'
import { CURIOS } from '../src/data/bloom'
import { applyAction } from '../src/engine/actions'
import { sendCreatureAway } from '../src/engine/challenges'
import { settleFlightEvent } from '../src/engine/flightEvents'
import { plantWeights } from '../src/engine/gathering'
import { spellCost } from '../src/engine/magic'
import { courtRank, mountSpeedMultiplier, storageCapacity } from '../src/engine/modifiers'
import { placeOpen } from '../src/engine/regions'
import { advanceSecrets } from '../src/engine/secrets'
import { createNewGame, type GameState, type HelperState } from '../src/engine/state'
import { BASE_OFFLINE_CAP_MS, offlineCapMs } from '../src/engine/tick'

const START = 1_700_000_000_000

/** A Bramble Court that has opened the Swamp and knows the Rite of First Blossom. */
function readyForOrchard(): GameState {
  const state = createNewGame(START)
  state.upgrades.push('lodging-ritual-circle')
  state.unlockedRegions.push('forest', 'swamp')
  state.research.completed.push('research-first-blossom')
  state.inventory = { 'component-lily-balm': 2, 'component-sun-salve': 2 }
  // Helpers count toward the court: enough of them for a Bramble Court.
  for (let id = 1; id <= 18; id++) {
    state.helpers.list.push({ id, type: 'gatherer', name: 'H', task: null } as HelperState)
  }
  return state
}

function inOrchard(): GameState {
  const state = readyForOrchard()
  applyAction(state, { type: 'ritual/perform', ritualId: 'ritual-first-blossom' })
  return state
}

function standAt(state: GameState, spotId: string): void {
  state.player.travel = null
  state.player.place = spotId
}

describe('opening the Blossom Orchard', () => {
  it('needs a Bramble Court and the Rite of First Blossom', () => {
    const state = readyForOrchard()
    expect(courtRank(state)).toBeGreaterThanOrEqual(3)
    expect(placeOpen(state, 'petalfall-rows')).toBe(false)
    const events = applyAction(state, { type: 'ritual/perform', ritualId: 'ritual-first-blossom' })
    expect(events.map((e) => e.type)).toEqual(['ritual-performed', 'region-unlocked'])
    expect(placeOpen(state, 'petalfall-rows')).toBe(true)
    expect(state.settlements.combhaven).toBeDefined()
    expect(['blossom-wind', 'spring-shower', 'late-frost']).toContain(state.weather.orchard.kind)
  })

  it('Parley and Kindred Call use Beeswax Candles in the Orchard', () => {
    const state = inOrchard()
    standAt(state, 'petalfall-rows')
    expect(spellCost(state, 'spell-parley')).toContainEqual({
      itemId: 'component-beeswax-candle',
      amount: 1,
    })
  })
})

describe('the grumpy badger', () => {
  function badgerAt(state: GameState): void {
    standAt(state, 'old-pear')
    state.challenges.creatures['old-pear'] = {
      creatureId: 'badger',
      tapsLeft: 0,
      remainingMs: 60_000,
      eatMs: 20_000,
    }
  }

  it('cannot be shooed, only calmed', () => {
    const state = inOrchard()
    badgerAt(state)
    expect(applyAction(state, { type: 'creature/tap', spotId: 'old-pear' })).toEqual([
      { type: 'blocked', reason: 'calm-only' },
    ])
    expect(state.challenges.creatures['old-pear']).toBeDefined()
  })

  it("calming it three times reveals Badger's Tunnel", () => {
    const state = inOrchard()
    for (let i = 0; i < 3; i++) {
      advanceSecrets(state)
      expect(placeOpen(state, 'badgers-tunnel')).toBe(false)
      badgerAt(state)
      sendCreatureAway(state, 'old-pear', 'calmed')
    }
    expect(state.challenges.calmed.badger).toBe(3)
    advanceSecrets(state)
    expect(placeOpen(state, 'badgers-tunnel')).toBe(true)
  })
})

describe('Orchard secrets, weather and friends', () => {
  it('helping Combhaven five times opens the Royal Cell', () => {
    const state = inOrchard()
    state.settlements.combhaven.filled = 4
    advanceSecrets(state)
    expect(placeOpen(state, 'royal-cell')).toBe(false)
    state.settlements.combhaven.filled = 5
    advanceSecrets(state)
    expect(placeOpen(state, 'royal-cell')).toBe(true)
  })

  it('a blossom wind blows in an extra petal on every petal harvest', () => {
    const state = inOrchard()
    standAt(state, 'petalfall-rows')
    state.weather.orchard = { kind: 'blossom-wind', remainingMs: 1e9 }
    state.spots['petalfall-rows'] = {
      slots: [{ plantId: 'plant-apple-blossom', hp: 1, regrowMs: 0 }],
    } as GameState['spots'][string]
    applyAction(state, { type: 'gather/tap', spotId: 'petalfall-rows', slot: 0 }, () => 0.99)
    expect(state.player.satchel['raw-apple-petals']).toBe(3)
  })

  it('riding the hummingbird in the Orchard makes rarer plants likelier there', () => {
    const state = inOrchard()
    standAt(state, 'petalfall-rows')
    const weight = () =>
      plantWeights(state, 'petalfall-rows').find(([id]) => id === 'plant-golden-pollen')![1]
    const plain = weight()
    state.mounts.owned['mount-hummingbird'] = { level: 1 }
    state.mounts.riding = 'mount-hummingbird'
    expect(weight()).toBeCloseTo(plain * 1.5)
    standAt(state, 'buttercup-rise')
    expect(weight()).toBeCloseTo(plain)
  })

  it('the Nectar Nabbers go for honey and pollen first', () => {
    const state = inOrchard()
    state.player.satchel = { 'raw-honey': 2, 'raw-golden-pollen': 1, 'raw-apple-petals': 10 }
    const travel = {
      to: 'old-pear',
      totalMs: 1000,
      remainingMs: 0,
      event: {
        kind: 'ambush' as const,
        showAtMs: 1000,
        taps: 0,
        resolved: false,
        crewId: 'nectar-nabbers',
      },
    }
    settleFlightEvent(state, travel, () => 0)
    expect(state.player.satchel['raw-honey']).toBeUndefined()
    expect(state.player.satchel['raw-golden-pollen']).toBeUndefined()
    expect(state.player.satchel['raw-apple-petals']).toBe(10)
  })

  it('Orchard curios: storage, mount speed and a longer offline cap', () => {
    const state = createNewGame(START)
    const storage = storageCapacity(state)
    state.curios.push(
      'curio-honeycomb-brooch',
      'curio-knights-pennant',
      'curio-badgers-pocket-watch',
    )
    expect(storageCapacity(state)).toBe(storage + 150)
    expect(mountSpeedMultiplier(state)).toBeCloseTo(1.1)
    expect(offlineCapMs(state)).toBe(BASE_OFFLINE_CAP_MS + 2 * 60 * 60_000)
    expect(CURIOS['curio-queens-seal'].effect).toEqual({ kind: 'traderTrinkets', multiplier: 2 })
  })
})
