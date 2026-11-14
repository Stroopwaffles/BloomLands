import { describe, expect, it } from 'vitest'
import {
  CAMP_RULES,
  CREATURES,
  FLIGHT_EVENT_RULES,
  PEST_RULES,
  REGION_FLIGHT_EVENTS,
  type FlightEventKind,
} from '../src/data/challenges'
import { PLANTS } from '../src/data/plants'
import { DAY_MS, NIGHTFALL_MS } from '../src/data/time'
import { SPOTS } from '../src/data/world'
import { applyAction } from '../src/engine/actions'
import { advancePests, piratesInRegion } from '../src/engine/challenges'
import { dayPhase, isMorning, weatherFlightFactor } from '../src/engine/environment'
import { activeFlightEvent } from '../src/engine/flightEvents'
import { ensureSpot, rollPlant } from '../src/engine/gathering'
import { knownSpells } from '../src/engine/magic'
import { stateRandom } from '../src/engine/rng'
import { countItems, createNewGame, type GameState } from '../src/engine/state'
import { advance } from '../src/engine/tick'
import { travelMs } from '../src/engine/travel'

const START = 1_700_000_000_000
const ALL_SPELLS = ['research-bugbane', 'research-lullaby', 'research-gust', 'research-tanglevine']

/** Standing in Buttercup Rise, with the challenge timers pushed far away unless a test sets them. */
function atButtercup(): GameState {
  const state = createNewGame(START)
  state.player.place = 'buttercup-rise'
  ensureSpot(state, 'buttercup-rise', stateRandom(state))
  state.challenges.nextCreatureMs = 1e12
  state.challenges.nextCampMs = 1e12
  state.traders.nextArrivalMs = 1e12
  state.weather.meadow = { kind: 'sunshine', remainingMs: 1e12 }
  return state
}

function plantAll(state: GameState, plantId: string) {
  for (const slot of state.spots['buttercup-rise'].slots) {
    slot.plantId = plantId
    slot.hp = PLANTS[plantId].toughness
    slot.pests = 0
  }
}

describe('day and night', () => {
  it('turns through the day and wraps around', () => {
    const state = atButtercup()
    state.time.dayMs = 0
    expect(dayPhase(state)).toBe('dawn')
    advance(state, START + Math.round(0.5 * DAY_MS)) // offline catch-up
    expect(dayPhase(state)).toBe('afternoon')
    advance(state, START + DAY_MS + 1000)
    expect(dayPhase(state)).toBe('dawn')
  })

  it('morning dew only grows in the morning, unless it rains', () => {
    const state = atButtercup()
    const random = stateRandom(state)
    const grows = (morningOk: boolean) => {
      for (let i = 0; i < 2000; i++) {
        if (rollPlant('buttercup-rise', random, 1, morningOk) === 'plant-morning-dew') return true
      }
      return false
    }
    expect(grows(true)).toBe(true)
    expect(grows(false)).toBe(false)
    state.time.dayMs = NIGHTFALL_MS
    expect(isMorning(state)).toBe(false)
  })
})

describe('weather', () => {
  it('changes flight times', () => {
    const state = atButtercup()
    state.player.place = 'home'
    expect(travelMs(state, 'home', 'buttercup-rise')).toBe(8_000)
    state.weather.meadow.kind = 'breeze'
    expect(weatherFlightFactor(state, 'buttercup-rise', 'home')).toBe(0.75)
    expect(travelMs(state, 'home', 'buttercup-rise')).toBe(10_000)
    expect(travelMs(state, 'buttercup-rise', 'home')).toBe(6_000)
    state.weather.meadow.kind = 'light-rain'
    expect(travelMs(state, 'buttercup-rise', 'home')).toBe(10_000)
  })

  it('sunshine makes plants regrow faster', () => {
    const grown = (kind: 'sunshine' | 'breeze') => {
      const state = atButtercup()
      state.weather.meadow.kind = kind
      plantAll(state, 'plant-clover')
      applyAction(state, { type: 'gather/tap', spotId: 'buttercup-rise', slot: 0 })
      advance(state, START + 14_000)
      return state.spots['buttercup-rise'].slots[0].plantId !== null
    }
    expect(grown('sunshine')).toBe(true) // 20s regrowth / 1.5 = 13.3s
    expect(grown('breeze')).toBe(false)
  })

  it('changes over time', () => {
    const state = createNewGame(START)
    const seen = new Set<string>()
    for (let i = 1; i <= 40; i++) {
      advance(state, START + i * 15 * 60_000)
      seen.add(state.weather.meadow.kind)
    }
    expect(seen.size).toBeGreaterThan(1)
  })
})

describe('pests', () => {
  it('infest petal plants and come off one tap at a time, before the plant', () => {
    const state = atButtercup()
    plantAll(state, 'plant-daisy')
    const spot = state.spots['buttercup-rise']
    spot.pestCheckMs = 0
    advancePests(state, 1, () => 0) // force an infestation
    const infested = spot.slots.findIndex((s) => (s.pests ?? 0) > 0)
    expect(spot.slots[infested].pests).toBe(PEST_RULES.count)

    const tap = () =>
      applyAction(state, { type: 'gather/tap', spotId: 'buttercup-rise', slot: infested })
    expect(tap()[0]).toMatchObject({ type: 'pest-cleared', pestsLeft: 2 })
    tap()
    tap()
    expect(spot.slots[infested].hp).toBe(2) // the daisy itself hasn't been touched yet
    tap()
    expect(tap()[0].type).toBe('harvest')
    expect(state.stats.pestsCleared).toBe(3)
  })

  it('leave plants without the right tag alone', () => {
    const state = atButtercup()
    plantAll(state, 'plant-clover')
    state.spots['buttercup-rise'].pestCheckMs = 0
    advancePests(state, 1, () => 0)
    expect(state.spots['buttercup-rise'].slots.every((s) => !s.pests)).toBe(true)
  })

  it('Bugbane Whisper clears a whole spot', () => {
    const state = atButtercup()
    plantAll(state, 'plant-daisy')
    state.spots['buttercup-rise'].slots[0].pests = 3
    state.spots['buttercup-rise'].slots[1].pests = 2
    state.research.completed.push(...ALL_SPELLS)
    state.inventory = { 'component-pest-smudge': 1 }
    expect(applyAction(state, { type: 'spell/cast', spellId: 'spell-bugbane' })[0]).toEqual({
      type: 'spell-cast',
      spellId: 'spell-bugbane',
    })
    expect(state.spots['buttercup-rise'].slots.every((s) => !s.pests)).toBe(true)
    expect(state.inventory).toEqual({})
  })
})

describe('the rabbit', () => {
  function withRabbit(): GameState {
    const state = atButtercup()
    plantAll(state, 'plant-clover')
    state.challenges.nextCreatureMs = 0
    advance(state, START + 100)
    state.challenges.nextCreatureMs = 1e12
    return state
  }

  it('visits a spot you know and eats plants until it leaves', () => {
    const state = withRabbit()
    expect(state.challenges.creatures['buttercup-rise']).toMatchObject({ creatureId: 'rabbit' })
    advance(state, START + 100 + 2 * CREATURES.rabbit.eatEveryMs)
    const eaten = state.spots['buttercup-rise'].slots.filter((s) => !s.plantId).length
    expect(eaten).toBeGreaterThanOrEqual(1)
    advance(state, START + 100 + CREATURES.rabbit.staysMs)
    expect(state.challenges.creatures['buttercup-rise']).toBeUndefined()
  })

  it('can be shooed with taps', () => {
    const state = withRabbit()
    for (let i = 1; i < CREATURES.rabbit.taps; i++) {
      expect(applyAction(state, { type: 'creature/tap', spotId: 'buttercup-rise' })[0].type).toBe(
        'creature-tap',
      )
    }
    expect(applyAction(state, { type: 'creature/tap', spotId: 'buttercup-rise' })[0]).toMatchObject(
      { type: 'creature-gone', how: 'shooed' },
    )
  })

  it('can be calmed with Lullaby', () => {
    const state = withRabbit()
    state.research.completed.push(...ALL_SPELLS)
    state.inventory = { 'component-calming-tea': 1 }
    const events = applyAction(state, { type: 'spell/cast', spellId: 'spell-lullaby' })
    expect(events[1]).toMatchObject({ type: 'creature-gone', how: 'calmed' })
  })
})

describe('pirate camps', () => {
  function withCamp(): GameState {
    const state = atButtercup()
    state.challenges.nextCampMs = 0
    advance(state, START + 100)
    state.challenges.nextCampMs = 1e12
    return state
  }

  it('take over part of a spot and slow down helpers in the region', () => {
    const state = withCamp()
    expect(state.challenges.camps['buttercup-rise']).toBe('dandelion-drifters')
    expect(piratesInRegion(state, 'meadow')).toBe(true)
    const blocked = SPOTS['buttercup-rise'].slots - CAMP_RULES.slotsTaken
    expect(
      applyAction(state, { type: 'gather/tap', spotId: 'buttercup-rise', slot: blocked }),
    ).toEqual([{ type: 'blocked', reason: 'camp' }])
  })

  it('leave when Tanglevine is cast', () => {
    const state = withCamp()
    state.research.completed.push(...ALL_SPELLS)
    state.player.satchel = { 'component-thistle-twine': 1, 'component-sun-salve': 1 }
    const events = applyAction(state, { type: 'spell/cast', spellId: 'spell-tanglevine' })
    expect(events.map((e) => e.type)).toEqual(['spell-cast', 'camp-cleared', 'bloom'])
    expect(state.bloom.meadow).toBe(2)
    expect(state.challenges.camps).toEqual({})
    expect(state.player.satchel).toEqual({})
    expect(state.stats.campsCleared).toBe(1)
  })
})

describe('flight events', () => {
  function flightWith(kind: FlightEventKind): GameState {
    const state = atButtercup()
    state.player.place = 'home'
    applyAction(state, { type: 'travel/go', to: 'dandelion-drift' }, () => 0.99) // no event rolled
    const travel = state.player.travel!
    travel.event = { kind, showAtMs: travel.totalMs, taps: 0, resolved: false, regionId: 'meadow' }
    return state
  }

  it('an unanswered ambush makes off with a few satchel items, never trinkets', () => {
    const state = flightWith('ambush')
    state.player.satchel = { 'raw-daisy-petals': 10, 'trinket-thimble': 1 }
    advance(state, START + 12_000)
    expect(state.player.satchel['raw-daisy-petals']).toBe(10 - FLIGHT_EVENT_RULES.ambushSteals)
    expect(state.player.satchel['trinket-thimble']).toBe(1)
  })

  it('tapping enough times shoos the ambush', () => {
    const state = flightWith('ambush')
    state.player.satchel = { 'raw-daisy-petals': 10 }
    for (let i = 0; i < FLIGHT_EVENT_RULES.ambushTaps; i++)
      applyAction(state, { type: 'flight/tap' })
    expect(activeFlightEvent(state)).toBeNull()
    advance(state, START + 12_000)
    expect(state.player.satchel['raw-daisy-petals']).toBe(10)
    expect(state.stats.ambushesFoiled).toBe(1)
  })

  it('Gust blows an ambush away at once', () => {
    const state = flightWith('ambush')
    state.research.completed.push(...ALL_SPELLS)
    state.inventory = { 'component-thistle-twine': 1 }
    expect(knownSpells(state)).toContain('spell-gust')
    const events = applyAction(state, { type: 'spell/cast', spellId: 'spell-gust' })
    expect(events.map((e) => e.type)).toEqual(['spell-cast', 'flight-event'])
  })

  it('drifting seeds can be caught', () => {
    const state = flightWith('windfall')
    for (let i = 0; i < 10; i++) applyAction(state, { type: 'flight/tap' })
    expect(state.player.satchel['raw-dandelion-fluff']).toBe(
      REGION_FLIGHT_EVENTS.meadow.windfall.max,
    )
  })

  it('helping the lost traveler earns a thank-you', () => {
    const state = flightWith('traveler')
    applyAction(state, { type: 'flight/tap' })
    expect(state.resources.glimmers).toBe(REGION_FLIGHT_EVENTS.meadow.traveler.glimmers)
  })

  it('gusts change the flight time by themselves', () => {
    const state = flightWith('gust')
    const before = state.player.travel!.remainingMs
    advance(state, START + 100)
    const after = state.player.travel!.remainingMs
    expect(after).not.toBe(before - 100)
    expect(state.player.travel!.event?.resolved).toBe(true)
  })

  it("don't happen on automatic flights", () => {
    const state = atButtercup()
    state.upgrades.push('qol-auto-return')
    for (const slot of state.spots['buttercup-rise'].slots) slot.plantId = 'plant-clover'
    state.player.satchel = { 'raw-daisy-petals': 19 }
    state.spots['buttercup-rise'].slots[0].hp = 1
    applyAction(state, { type: 'gather/tap', spotId: 'buttercup-rise', slot: 0 }, () => 0)
    expect(state.player.travel?.auto).toBe(true)
    expect(state.player.travel?.event).toBeUndefined()
  })
})

describe('magic', () => {
  it('spells need research, a target and components', () => {
    const state = atButtercup()
    expect(applyAction(state, { type: 'spell/cast', spellId: 'spell-bugbane' })).toEqual([
      { type: 'blocked', reason: 'locked' },
    ])
    state.research.completed.push(...ALL_SPELLS)
    expect(applyAction(state, { type: 'spell/cast', spellId: 'spell-bugbane' })).toEqual([
      { type: 'blocked', reason: 'no-target' },
    ])
    state.spots['buttercup-rise'].slots[0].pests = 2
    expect(applyAction(state, { type: 'spell/cast', spellId: 'spell-bugbane' })).toEqual([
      { type: 'blocked', reason: 'missing-items' },
    ])
  })

  it('the Rite of Turning switches day and night at the Ritual Circle', () => {
    const state = createNewGame(START)
    state.research.completed.push('research-turning')
    state.inventory = { 'component-calming-tea': 1, 'component-sun-salve': 1 }
    expect(
      applyAction(state, { type: 'ritual/perform', ritualId: 'ritual-turning-night' }),
    ).toEqual([{ type: 'blocked', reason: 'no-circle' }])
    state.upgrades.push('lodging-ritual-circle')
    applyAction(state, { type: 'ritual/perform', ritualId: 'ritual-turning-night' })
    expect(dayPhase(state)).toBe('night')
    applyAction(state, { type: 'ritual/perform', ritualId: 'ritual-turning-day' })
    expect(dayPhase(state)).toBe('dawn')
    expect(countItems(state.inventory)).toBe(0)
    expect(state.stats.ritualsPerformed).toBe(2)
  })
})

describe('camps over time', () => {
  it('pack up on their own after a while', () => {
    const state = atButtercup()
    state.challenges.nextCampMs = 0
    advance(state, START + 100)
    state.challenges.nextCampMs = 1e12
    expect(state.challenges.camps['buttercup-rise']).toBe('dandelion-drifters')
    advance(state, START + 100 + CAMP_RULES.staysMs)
    expect(state.challenges.camps).toEqual({})
    expect(state.stats.campsCleared).toBe(0) // leaving on their own isn't driving them out
  })
})
