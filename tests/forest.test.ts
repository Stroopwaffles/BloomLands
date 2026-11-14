import { describe, expect, it } from 'vitest'
import { SNEAK_MS } from '../src/data/challenges'
import { applyAction } from '../src/engine/actions'
import { spellCost } from '../src/engine/magic'
import { courtRank, satchelCapacity } from '../src/engine/modifiers'
import { advanceSecrets } from '../src/engine/secrets'
import { latestRegion, placeOpen } from '../src/engine/regions'
import { researchStatus } from '../src/engine/research'
import { createNewGame, type GameState } from '../src/engine/state'
import { travelMs } from '../src/engine/travel'

const START = 1_700_000_000_000

/** A court that has reached Hearthling and knows the Rite of the Open Path. */
function readyForForest(): GameState {
  const state = createNewGame(START)
  state.upgrades.push(
    'lodging-ritual-circle',
    'lodging-roost',
    'lodging-mouse-bunks',
    'lodging-storeroom-1',
  )
  state.research.completed.push('research-open-path')
  state.inventory = { 'component-sun-salve': 4 }
  return state
}

function inForest(): GameState {
  const state = readyForForest()
  applyAction(state, { type: 'ritual/perform', ritualId: 'ritual-open-path' })
  return state
}

describe('opening the Forest', () => {
  it('is closed at first: no flying there', () => {
    const state = createNewGame(START)
    expect(placeOpen(state, 'fernshade-floor')).toBe(false)
    expect(applyAction(state, { type: 'travel/go', to: 'fernshade-floor' })).toEqual([
      { type: 'blocked', reason: 'locked' },
    ])
  })

  it('needs a Hearthling court before the rite works', () => {
    const state = readyForForest()
    state.upgrades = ['lodging-ritual-circle']
    expect(courtRank(state)).toBe(0)
    expect(applyAction(state, { type: 'ritual/perform', ritualId: 'ritual-open-path' })).toEqual([
      { type: 'blocked', reason: 'needs-rank' },
    ])
  })

  it('the Rite of the Open Path opens the region, its weather and its village', () => {
    const state = readyForForest()
    expect(courtRank(state)).toBeGreaterThanOrEqual(1)
    const events = applyAction(state, { type: 'ritual/perform', ritualId: 'ritual-open-path' })
    expect(events.map((e) => e.type)).toEqual(['ritual-performed', 'region-unlocked'])
    expect(state.unlockedRegions).toContain('forest')
    expect(['mist', 'rain', 'falling-leaves']).toContain(state.weather.forest.kind)
    expect(state.settlements.acornhollow).toBeDefined()
    expect(applyAction(state, { type: 'ritual/perform', ritualId: 'ritual-open-path' })).toEqual([
      { type: 'blocked', reason: 'already-done' },
    ])
  })

  it('Forest research only shows up once the Forest is open', () => {
    const state = readyForForest()
    state.research.completed.push('research-grinding')
    expect(researchStatus(state, 'research-spores')).toBe('locked')
    applyAction(state, { type: 'ritual/perform', ritualId: 'ritual-open-path' })
    expect(researchStatus(state, 'research-spores')).toBe('available')
  })

  it('flying between regions takes longer than a hop inside one', () => {
    const state = inForest()
    state.player.place = 'fernshade-floor'
    const hop = travelMs(state, 'fernshade-floor', 'mossy-stump-ring')!
    const long = travelMs(state, 'fernshade-floor', 'buttercup-rise')!
    expect(long).toBeGreaterThan(hop * 2)
  })
})

describe('the owl', () => {
  function owlAtFernshade(): GameState {
    const state = inForest()
    state.player.place = 'fernshade-floor'
    applyAction(state, { type: 'travel/go', to: 'fernshade-floor' })
    state.player.travel = null
    state.player.place = 'fernshade-floor'
    state.spots['fernshade-floor'] ??= {
      slots: [{ plantId: 'plant-moss', hp: 2, regrowMs: 0 }],
    } as GameState['spots'][string]
    state.challenges.creatures['fernshade-floor'] = {
      creatureId: 'owl',
      tapsLeft: 0,
      remainingMs: 60_000,
      eatMs: 0,
    }
    return state
  }

  it('blocks gathering while it watches, and cannot be shooed', () => {
    const state = owlAtFernshade()
    expect(applyAction(state, { type: 'gather/tap', spotId: 'fernshade-floor', slot: 0 })).toEqual([
      { type: 'blocked', reason: 'watching' },
    ])
    expect(applyAction(state, { type: 'creature/tap', spotId: 'fernshade-floor' })).toEqual([
      { type: 'blocked', reason: 'watching' },
    ])
  })

  it('Hush Step lets you gather for a while', () => {
    const state = owlAtFernshade()
    state.research.completed.push('research-hush-step')
    state.inventory['component-calming-tea'] = 1
    state.inventory['component-thistle-twine'] = 1
    applyAction(state, { type: 'spell/cast', spellId: 'spell-hush-step' })
    expect(state.player.sneakMs).toBe(SNEAK_MS)
    const events = applyAction(state, { type: 'gather/tap', spotId: 'fernshade-floor', slot: 0 })
    expect(events[0].type).not.toBe('blocked')
  })
})

describe('Forest magic and mounts', () => {
  it('Parley and Kindred Call use Earth Loam in the Forest', () => {
    const state = inForest()
    expect(spellCost(state, 'spell-parley')).toContainEqual({
      itemId: 'component-sun-salve',
      amount: 1,
    })
    state.player.place = 'mossy-stump-ring'
    expect(spellCost(state, 'spell-parley')).toContainEqual({
      itemId: 'component-earth-loam',
      amount: 1,
    })
    expect(spellCost(state, 'spell-kindred-call')).not.toContainEqual({
      itemId: 'component-sun-salve',
      amount: 1,
    })
  })

  it('the flying squirrel makes Forest hops quicker, but adds no satchel space', () => {
    const state = inForest()
    state.player.place = 'fernshade-floor'
    const before = travelMs(state, 'fernshade-floor', 'mossy-stump-ring')!
    const satchel = satchelCapacity(state)
    state.mounts.owned['mount-flying-squirrel'] = { level: 1 }
    state.mounts.riding = 'mount-flying-squirrel'
    const riding = travelMs(state, 'fernshade-floor', 'mossy-stump-ring')!
    expect(riding).toBeLessThan(before * 0.6)
    expect(satchelCapacity(state)).toBe(satchel)
  })
})

describe('Forest secrets', () => {
  it("the Hollow Log Library opens when Burdock's story is done", () => {
    const state = inForest()
    advanceSecrets(state)
    expect(state.secrets).not.toContain('hollow-log-library')
    state.stories['story-burdock'] = { chapter: 4, complete: true, statStart: 0 }
    advanceSecrets(state)
    expect(state.secrets).toContain('hollow-log-library')
  })

  it('the Lost Grove opens at Budding bloom', () => {
    const state = inForest()
    state.bloom.forest = 60
    advanceSecrets(state)
    expect(state.secrets).toContain('lost-grove')
  })

  it("secrets in a closed region stay hidden, even if they'd qualify", () => {
    const state = createNewGame(START)
    state.bloom.forest = 999
    advanceSecrets(state)
    expect(state.secrets).toEqual([])
  })
})

describe('the newest region', () => {
  it('is the Meadow at first and the Forest once its path opens (menu scene and music)', () => {
    expect(latestRegion(createNewGame(START))).toBe('meadow')
    expect(latestRegion(inForest())).toBe('forest')
  })
})
