import { describe, expect, it } from 'vitest'
import { DAY_MS } from '../src/data/time'
import { applyAction } from '../src/engine/actions'
import { advanceCamps } from '../src/engine/challenges'
import { advanceWeather, rollWeather } from '../src/engine/environment'
import { castSpell, checkRitual, spellCost } from '../src/engine/magic'
import { luck } from '../src/engine/modifiers'
import { wildMountAt } from '../src/engine/mounts'
import { placeOpen } from '../src/engine/regions'
import { createNewGame, type GameState, type HelperState } from '../src/engine/state'
import { advance } from '../src/engine/tick'

const START = 1_700_000_000_000

/** A Blossom Court that knows the Rite of Long Twilight. */
function readyForGlade(): GameState {
  const state = createNewGame(START)
  state.upgrades.push('lodging-ritual-circle')
  state.unlockedRegions.push('forest', 'swamp', 'orchard', 'caves')
  state.research.completed.push('research-long-twilight')
  state.inventory = { 'component-crystal-focus': 1, 'component-lily-balm': 2 }
  for (let id = 1; id <= 30; id++) {
    state.helpers.list.push({ id, type: 'gatherer', name: 'H', task: null } as HelperState)
  }
  return state
}

function inGlade(): GameState {
  const state = readyForGlade()
  applyAction(state, { type: 'ritual/perform', ritualId: 'ritual-long-twilight' }, () => 0.99)
  return state
}

function at(state: GameState, placeId: string): void {
  state.player.travel = null
  state.player.place = placeId
}

describe('opening the Glade', () => {
  it('the Rite of Long Twilight opens it, starting the moon at the top of the cycle', () => {
    const state = readyForGlade()
    expect(placeOpen(state, 'moonpetal-meadow')).toBe(false)
    applyAction(state, { type: 'ritual/perform', ritualId: 'ritual-long-twilight' }, () => 0.99)
    expect(placeOpen(state, 'moonpetal-meadow')).toBe(true)
    expect(state.settlements.emberglow).toBeDefined()
    expect(state.weather.glade.step).toBe(0)
    expect(['waxing-moon', 'starfall']).toContain(state.weather.glade.kind)
  })
})

describe('the moon cycle', () => {
  it('goes waxing, full, waning, new, and round again', () => {
    let moon = rollWeather('glade', () => 0.99)
    const seen = [moon.kind]
    for (let i = 0; i < 4; i++) {
      moon = rollWeather('glade', () => 0.99, moon)
      seen.push(moon.kind)
    }
    expect(seen).toEqual(['waxing-moon', 'full-moon', 'waning-moon', 'new-moon', 'waxing-moon'])
  })

  it('a waxing or waning moon can be a starfall, and the cycle carries on', () => {
    const fall = rollWeather('glade', () => 0)
    expect(fall).toMatchObject({ kind: 'starfall', step: 0 })
    expect(rollWeather('glade', () => 0, fall).kind).toBe('full-moon')
  })

  it('moves on as time passes', () => {
    const state = inGlade()
    state.weather.glade.remainingMs = 1
    advanceWeather(state, 10, () => 0.99)
    expect(state.weather.glade.kind).toBe('full-moon')
  })
})

describe('Glade secrets', () => {
  it('the Moonrise Rite needs a full moon and opens the Dream Hollow', () => {
    const state = inGlade()
    state.research.completed.push('research-moonrise-rite')
    state.inventory = { 'component-moon-draught': 1, 'component-crystal-focus': 1 }
    expect(checkRitual(state, 'ritual-moonrise')).toBe('not-full-moon')
    state.weather.glade = { kind: 'full-moon', remainingMs: 60_000, step: 1 }
    applyAction(state, { type: 'ritual/perform', ritualId: 'ritual-moonrise' })
    expect(placeOpen(state, 'dream-hollow')).toBe(true)
  })

  it('the Starwell is only open while riding the luna moth', () => {
    const state = inGlade()
    expect(placeOpen(state, 'starwell')).toBe(false)
    state.mounts.owned['mount-luna-moth'] = { level: 1 }
    state.mounts.riding = 'mount-luna-moth'
    expect(placeOpen(state, 'starwell')).toBe(true)
    state.mounts.riding = null
    expect(placeOpen(state, 'starwell')).toBe(false)
  })
})

describe('starfall', () => {
  it('stars can be caught at a Glade spot during a starfall, one at a time', () => {
    const state = inGlade()
    at(state, 'moonpetal-meadow')
    state.weather.glade = { kind: 'waxing-moon', remainingMs: 60_000, step: 0 }
    expect(applyAction(state, { type: 'star/catch' })).toEqual([
      { type: 'blocked', reason: 'no-stars' },
    ])
    state.weather.glade = { kind: 'starfall', remainingMs: 60_000, step: 0 }
    const [caught] = applyAction(state, { type: 'star/catch' }, () => 0.9)
    expect(caught).toMatchObject({ type: 'star-caught', itemId: null })
    expect(state.resources.glimmers).toBeGreaterThan(0)
    expect(applyAction(state, { type: 'star/catch' })).toEqual([
      { type: 'blocked', reason: 'cooling-down' },
    ])
    advance(state, state.meta.lastTickAt + 3000)
    expect(applyAction(state, { type: 'star/catch' }, () => 0)).toEqual([
      { type: 'star-caught', glimmers: 0, itemId: 'raw-stardust' },
    ])
  })
})

describe('the Moonshadow Crew', () => {
  it('only camps under a new moon, and Shadowlight sends them off', () => {
    const state = inGlade()
    state.unlockedRegions = ['glade']
    state.spots['silverbrook'] = { slots: [] } as unknown as GameState['spots'][string]
    const camp = (kind: 'new-moon' | 'full-moon') => {
      state.weather.glade = { kind, remainingMs: 1e9, step: 3 }
      state.challenges.camps = {}
      state.challenges.nextCampMs = 0
      advanceCamps(state, 1, () => 0)
      return state.challenges.camps['silverbrook']
    }
    expect(camp('full-moon')).toBeUndefined()
    expect(camp('new-moon')).toBe('moonshadow-crew')
    state.research.completed.push('research-shadowlight')
    state.inventory = { 'component-glow-ink': 1, 'component-moon-draught': 1 }
    at(state, 'silverbrook')
    castSpell(state, 'spell-shadowlight')
    expect(state.challenges.camps['silverbrook']).toBeUndefined()
    expect(state.weather.glade.remainingMs).toBe(0)
  })
})

describe('Glade mounts and people', () => {
  it('the blue jay is only seen in the morning, and wants Moon Draught and a Starlight Lens', () => {
    const state = inGlade()
    state.time.dayMs = 0.5 * DAY_MS
    expect(wildMountAt(state, 'silverbrook')).toBeNull()
    state.time.dayMs = 0.1 * DAY_MS
    expect(wildMountAt(state, 'silverbrook')).toBe('mount-blue-jay')
    at(state, 'silverbrook')
    expect(spellCost(state, 'spell-kindred-call')).toEqual([
      { itemId: 'component-moon-draught', amount: 1 },
      { itemId: 'component-starlight-lens', amount: 1 },
    ])
  })

  it('the Moon-Phase Locket picks the moon at the Moon Pool, once a day', () => {
    const state = inGlade()
    at(state, 'moon-pool')
    const choose = () => applyAction(state, { type: 'moon/choose', phase: 'full-moon' })
    expect(choose()).toEqual([{ type: 'blocked', reason: 'locked' }])
    state.prestige.relics.push('relic-selenne-4')
    expect(choose()).toEqual([{ type: 'moon-chosen', phase: 'full-moon' }])
    expect(state.weather.glade.kind).toBe('full-moon')
    expect(choose()).toEqual([{ type: 'blocked', reason: 'cooling-down' }])
  })

  it('curios: the Fallen Star and the Dreamcatcher', () => {
    const state = inGlade()
    const before = luck(state)
    state.curios.push('curio-fallen-star', 'curio-dreamcatcher')
    expect(luck(state)).toBeCloseTo(before * 1.15)
    const report = advance(state, state.meta.lastTickAt + 60 * 60_000)
    expect(report.simulatedMs).toBe(66 * 60_000)
  })
})
