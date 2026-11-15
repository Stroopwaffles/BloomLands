import { describe, expect, it } from 'vitest'
import { PLANTS } from '../src/data/plants'
import { SPOTS } from '../src/data/world'
import { applyAction } from '../src/engine/actions'
import { ensureSpot, regrowSpots, rollPlant, tapPlant } from '../src/engine/gathering'
import { pickWeighted, stateRandom } from '../src/engine/rng'
import { deserialize, serialize } from '../src/engine/save'
import { countItems, createNewGame, type GameState } from '../src/engine/state'
import { advance } from '../src/engine/tick'
import { travelMs } from '../src/engine/travel'

const START = 1_700_000_000_000
const never = () => 0.999 // a "random" source that never triggers bonus drops
const always = () => 0 // one that always does

/** A new game with the player standing in a spot whose slots are all the given plant. */
function atSpot(spotId: string, plantId: string): GameState {
  const state = createNewGame(START)
  state.player.place = spotId
  const spot = ensureSpot(state, spotId, stateRandom(state))
  for (const slot of spot.slots) {
    slot.plantId = plantId
    slot.hp = PLANTS[plantId].toughness
  }
  return state
}

describe('data', () => {
  it('only lists plants and items that exist', () => {
    for (const spot of Object.values(SPOTS)) {
      for (const plantId of spot.plants) expect(PLANTS[plantId], plantId).toBeDefined()
    }
  })
})

describe('random numbers', () => {
  it('are reproducible from the saved seed', () => {
    const a = createNewGame(START)
    const b = createNewGame(START)
    const ra = stateRandom(a)
    const rb = stateRandom(b)
    expect([ra(), ra(), ra()]).toEqual([rb(), rb(), rb()])
    expect(a.rng).toBe(b.rng)
  })

  it('pick by weight', () => {
    expect(
      pickWeighted(
        [
          ['a', 1],
          ['b', 3],
        ] as const,
        () => 0.1,
      ),
    ).toBe('a')
    expect(
      pickWeighted(
        [
          ['a', 1],
          ['b', 3],
        ] as const,
        () => 0.5,
      ),
    ).toBe('b')
  })

  it('grow common plants far more often than rare ones', () => {
    const state = createNewGame(START)
    const random = stateRandom(state)
    const counts: Record<string, number> = {}
    for (let i = 0; i < 5000; i++) {
      const id = rollPlant('buttercup-rise', random)
      counts[id] = (counts[id] ?? 0) + 1
    }
    expect(counts['plant-clover']).toBeGreaterThan(counts['plant-four-leaf-clover'] * 5)
    expect(counts['plant-four-leaf-clover']).toBeGreaterThan(0)
  })
})

describe('tapping plants', () => {
  it('takes as many taps as the plant is tough', () => {
    const state = atSpot('dandelion-drift', 'plant-dandelion') // toughness 3
    expect(tapPlant(state, 'dandelion-drift', 0, never)[0]).toMatchObject({
      type: 'hit',
      hpLeft: 2,
    })
    expect(tapPlant(state, 'dandelion-drift', 0, never)[0]).toMatchObject({
      type: 'hit',
      hpLeft: 1,
    })
    const [event] = tapPlant(state, 'dandelion-drift', 0, never)
    expect(event).toMatchObject({
      type: 'harvest',
      plantId: 'plant-dandelion',
      items: [{ itemId: 'raw-dandelion-fluff', amount: 3 }],
      bonus: false,
      trinketId: null,
    })
    expect(state.player.satchel).toEqual({ 'raw-dandelion-fluff': 3 })
    expect(state.stats.taps).toBe(3)
    expect(state.stats.plantsHarvested).toBe(1)
  })

  it('needs fewer taps with more click power', () => {
    const state = atSpot('dandelion-drift', 'plant-dandelion')
    state.player.clickPower = 3
    expect(tapPlant(state, 'dandelion-drift', 0, never)[0].type).toBe('harvest')
  })

  it('leaves the slot empty and regrowing after a harvest', () => {
    const state = atSpot('buttercup-rise', 'plant-clover')
    tapPlant(state, 'buttercup-rise', 2, never)
    const slot = state.spots['buttercup-rise'].slots[2]
    expect(slot.plantId).toBeNull()
    expect(slot.regrowMs).toBe(SPOTS['buttercup-rise'].regrowMs)
    expect(tapPlant(state, 'buttercup-rise', 2, never)).toEqual([
      { type: 'blocked', reason: 'no-plant' },
    ])
  })

  it('can give bonus materials and a trinket', () => {
    const state = atSpot('buttercup-rise', 'plant-clover')
    const [event] = tapPlant(state, 'buttercup-rise', 0, always)
    expect(event).toMatchObject({
      type: 'harvest',
      bonus: true,
      items: [{ itemId: 'raw-clover-leaves', amount: 3 }],
    })
    expect(event.type === 'harvest' && event.trinketId).toBe('trinket-lost-button')
    expect(state.player.satchel['trinket-lost-button']).toBe(1)
  })

  it('stops when the satchel is full, without losing the last harvest', () => {
    const state = atSpot('dandelion-drift', 'plant-dandelion')
    state.player.satchelCapacity = 4
    state.player.clickPower = 10
    tapPlant(state, 'dandelion-drift', 0, never) // 3 fluff
    tapPlant(state, 'dandelion-drift', 1, never) // 6 fluff, over capacity but kept
    expect(countItems(state.player.satchel)).toBe(6)
    expect(tapPlant(state, 'dandelion-drift', 2, never)).toEqual([
      { type: 'blocked', reason: 'satchel-full' },
    ])
  })

  it('only works where the player is, and not mid-flight', () => {
    const state = atSpot('buttercup-rise', 'plant-clover')
    expect(tapPlant(state, 'dandelion-drift', 0, never)[0]).toMatchObject({ reason: 'not-here' })
    applyAction(state, { type: 'travel/go', to: 'home' })
    expect(tapPlant(state, 'buttercup-rise', 0, never)[0]).toMatchObject({ reason: 'flying' })
  })
})

describe('regrowth', () => {
  it('regrows empty slots after the spot regrow time, even offline', () => {
    const state = atSpot('buttercup-rise', 'plant-clover')
    tapPlant(state, 'buttercup-rise', 0, never)
    regrowSpots(state, 10_000, stateRandom(state))
    expect(state.spots['buttercup-rise'].slots[0].plantId).toBeNull()

    advance(state, START + 60_000) // offline-sized gap, handled by the regrowth system
    const slot = state.spots['buttercup-rise'].slots[0]
    expect(slot.plantId).not.toBeNull()
    expect(slot.hp).toBe(PLANTS[slot.plantId!].toughness)
  })
})

describe('travel', () => {
  it('flies to a spot and arrives after the flight time', () => {
    const state = createNewGame(START)
    const [event] = applyAction(state, { type: 'travel/go', to: 'buttercup-rise' })
    expect(event).toMatchObject({ type: 'depart', totalMs: 8_000 })
    advance(state, START + 4_000)
    expect(state.player.travel?.remainingMs).toBe(4_000)
    expect(state.player.place).toBe('home')
    advance(state, START + 8_000)
    expect(state.player.travel).toBeNull()
    expect(state.player.place).toBe('buttercup-rise')
    expect(state.spots['buttercup-rise'].slots).toHaveLength(9)
  })

  it('lands while the game is closed', () => {
    const state = createNewGame(START)
    applyAction(state, { type: 'travel/go', to: 'dandelion-drift' })
    advance(state, START + 3_600_000)
    expect(state.player.place).toBe('dandelion-drift')
  })

  it('is faster with more wing speed', () => {
    const state = createNewGame(START)
    state.player.wingSpeed = 2
    expect(travelMs(state, 'home', 'dandelion-drift')).toBe(6_000)
  })

  it("can't start a second flight or fly somewhere unknown", () => {
    const state = createNewGame(START)
    expect(applyAction(state, { type: 'travel/go', to: 'the-moon' })[0]).toMatchObject({
      type: 'blocked',
    })
    expect(applyAction(state, { type: 'travel/go', to: 'home' })[0]).toMatchObject({
      type: 'blocked',
    })
    applyAction(state, { type: 'travel/go', to: 'buttercup-rise' })
    expect(applyAction(state, { type: 'travel/go', to: 'dandelion-drift' })[0]).toMatchObject({
      reason: 'flying',
    })
  })

  it('survives a save and load mid-flight', () => {
    const state = createNewGame(START)
    applyAction(state, { type: 'travel/go', to: 'buttercup-rise' })
    const loaded = deserialize(serialize(state, START))
    expect(loaded.player.travel).toMatchObject({
      to: 'buttercup-rise',
      totalMs: 8000,
      remainingMs: 8000,
    })
    expect(loaded.player.travel).toEqual(state.player.travel)
  })
})

describe('depositing', () => {
  it('moves the satchel into storage at home', () => {
    const state = createNewGame(START)
    state.player.satchel = { 'raw-daisy-petals': 4 }
    state.inventory = { 'raw-daisy-petals': 1 }
    const [event] = applyAction(state, { type: 'satchel/deposit' })
    expect(event).toMatchObject({ type: 'deposit' })
    expect(state.inventory).toEqual({ 'raw-daisy-petals': 5 })
    expect(state.player.satchel).toEqual({})
  })

  it('only works at home', () => {
    const state = atSpot('buttercup-rise', 'plant-clover')
    state.player.satchel = { 'raw-clover-leaves': 2 }
    expect(applyAction(state, { type: 'satchel/deposit' })[0]).toMatchObject({
      reason: 'not-here',
    })
    expect(state.player.satchel).toEqual({ 'raw-clover-leaves': 2 })
  })
})

describe('more plants per spot', () => {
  it('spots visited before they grew nine plants grow the new ones in', async () => {
    const { regrowSpots } = await import('../src/engine/gathering')
    const { createNewGame } = await import('../src/engine/state')
    const state = createNewGame(0)
    state.spots['buttercup-rise'] = {
      slots: Array.from({ length: 6 }, () => ({ plantId: 'plant-clover', hp: 2, regrowMs: 0 })),
    }
    regrowSpots(state, 1000, () => 0.5)
    expect(state.spots['buttercup-rise'].slots).toHaveLength(9)
    regrowSpots(state, 60_000, () => 0.5)
    expect(state.spots['buttercup-rise'].slots.every((s) => s.plantId)).toBe(true)
  })
})
