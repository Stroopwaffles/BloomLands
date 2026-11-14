import { describe, expect, it } from 'vitest'
import { FLIGHT_EVENT_RULES, REGION_FLIGHT_EVENTS } from '../src/data/challenges'
import { POST_RULES } from '../src/data/economy'
import { REGION_FLIGHT_MS, SPIRIT_PATH_MS, WATER_FLIGHT_FACTOR } from '../src/data/world'
import { applyAction } from '../src/engine/actions'
import { activeFlightEvent } from '../src/engine/flightEvents'
import { helperFlightMs } from '../src/engine/helpers'
import { advancePost, postDelayMs, postFee } from '../src/engine/post'
import { flightBreakdown, routeOf, routeVia, SPIRIT_PATH } from '../src/engine/route'
import { createNewGame, type GameState, type HelperState } from '../src/engine/state'
import { advanceTravel, travelMs } from '../src/engine/travel'

const START = 1_700_000_000_000

/** A court with all three regions open, calm weather everywhere. */
function world(): GameState {
  const state = createNewGame(START)
  state.unlockedRegions = ['meadow', 'forest', 'swamp']
  for (const region of ['meadow', 'forest', 'swamp']) {
    state.weather[region] = { kind: 'drizzle', remainingMs: 600_000 }
  }
  state.weather.meadow = { kind: 'sunshine', remainingMs: 600_000 }
  state.weather.forest = { kind: 'mist', remainingMs: 600_000 }
  state.weather.swamp = { kind: 'muggy', remainingMs: 600_000 }
  state.settlements['toad-village'] = { requests: [], nextArrivalMs: 600_000, filled: 0 }
  state.settlements.acornhollow = { requests: [], nextArrivalMs: 600_000, filled: 0 }
  return state
}

/** A random source that returns these values in turn (then 0.99). */
function sequence(...values: number[]): () => number {
  let i = 0
  return () => (i < values.length ? values[i++] : 0.99)
}

describe('routes', () => {
  it('a long flight crosses every region in between, in equal legs', () => {
    const state = world()
    const route = routeOf(state, 'home', 'reeds-hollow')!
    expect(route.legs.map((l) => l.regionId)).toEqual(['meadow', 'forest', 'swamp'])
    for (const leg of route.legs) expect(leg.baseMs).toBe((REGION_FLIGHT_MS * 2) / 3)
    expect(routeVia(route, 'home', 'reeds-hollow')).toBe('via the Forest')
    expect(routeVia(routeOf(state, 'home', 'acornhollow')!, 'home', 'acornhollow')).toBe('')
  })

  it('each leg gets the weather of the region below it', () => {
    const state = world()
    const calm = travelMs(state, 'home', 'reeds-hollow')!
    state.weather.forest = { kind: 'rain', remainingMs: 600_000 } // slows flights by 25%
    const leg = (REGION_FLIGHT_MS * 2) / 3
    expect(travelMs(state, 'home', 'reeds-hollow')).toBe(Math.ceil(calm + leg * 0.25 - leg * 0.1))
  })

  it('open water only slows the leg over the water', () => {
    const state = world()
    const reeds = travelMs(state, 'home', 'reeds-hollow')!
    const pools = travelMs(state, 'home', 'lilypad-pools')!
    const leg = (REGION_FLIGHT_MS * 2) / 3
    expect(pools - reeds).toBe(Math.ceil(leg * (WATER_FLIGHT_FACTOR - 1)))
  })

  it('the map breakdown adds up to the flight time', () => {
    const state = world()
    const b = flightBreakdown(state, 'home', 'lilypad-pools')!
    expect(b.totalMs).toBe(travelMs(state, 'home', 'lilypad-pools'))
    expect(b.legs.map((l) => l.name)).toEqual(['Meadow', 'Forest', 'Swamp'])
    expect(b.legs[2].effects.map((e) => e.label)).toContain('Open water')
  })
})

describe('Spirit Paths', () => {
  it('awakening a spirit opens a quick path between its resting place and home', () => {
    const state = world()
    const before = travelMs(state, 'home', 'sunken-willow')!
    state.spirits['spirit-mirebelle'] = { awakened: true }
    const route = routeOf(state, 'home', 'sunken-willow')!
    expect(route.viaPath).toBe(true)
    expect(route.legs).toEqual([{ regionId: SPIRIT_PATH, baseMs: SPIRIT_PATH_MS, hop: false }])
    expect(travelMs(state, 'home', 'sunken-willow')).toBeLessThan(before / 3)
  })

  it('flights to other places in that region take the path, then hop', () => {
    const state = world()
    state.spirits['spirit-mirebelle'] = { awakened: true }
    const route = routeOf(state, 'home', 'lilypad-pools')!
    expect(route.legs.map((l) => l.regionId)).toEqual([SPIRIT_PATH, 'swamp'])
    expect(routeVia(route, 'home', 'lilypad-pools')).toBe('via the Spirit Path')
  })

  it('links two awakened spirits directly', () => {
    const state = world()
    state.spirits['spirit-mirebelle'] = { awakened: true }
    state.spirits['spirit-bramblebeard'] = { awakened: true }
    expect(routeOf(state, 'elder-oak', 'sunken-willow')!.legs).toHaveLength(1)
  })

  it('the path ignores weather, and helpers use it too', () => {
    const state = world()
    const helper = { id: 1, type: 'gatherer', tripSpot: null } as unknown as HelperState
    state.helpers.list.push(helper)
    const slow = helperFlightMs(state, helper, 'reeds-hollow')
    state.spirits['spirit-mirebelle'] = { awakened: true }
    expect(helperFlightMs(state, helper, 'reeds-hollow')).toBeLessThan(slow)
    state.weather.swamp = { kind: 'drizzle', remainingMs: 600_000 }
    const legs = flightBreakdown(state, 'home', 'sunken-willow')!.legs
    expect(legs[0].effects).toEqual([])
  })
})

describe('flight events come from the region below', () => {
  it('pirates over the Forest are the Bramble Corsairs, even on the way to the Swamp', () => {
    const state = world()
    // at = halfway (over the Forest), event rolled, first kind (ambush)
    applyAction(state, { type: 'travel/go', to: 'reeds-hollow' }, sequence(0.5, 0, 0))
    expect(state.player.travel!.event).toMatchObject({
      kind: 'ambush',
      crewId: 'bramble-corsairs',
      regionId: 'forest',
    })
    expect(state.player.travel!.legs!.map((l) => l.regionId)).toEqual(['meadow', 'forest', 'swamp'])
  })

  it('nothing happens on the Spirit Path', () => {
    const state = world()
    state.spirits['spirit-mirebelle'] = { awakened: true }
    applyAction(state, { type: 'travel/go', to: 'sunken-willow' }, sequence(0.5, 0, 0))
    expect(state.player.travel!.event).toBeUndefined()
  })

  function flying(kind: 'snag' | 'wisp' | 'windfall', regionId: string): GameState {
    const state = world()
    applyAction(state, { type: 'travel/go', to: 'reeds-hollow' }, () => 0.99)
    const travel = state.player.travel!
    travel.event = { kind, showAtMs: travel.totalMs, taps: 0, resolved: false, regionId }
    return state
  }

  it('a bramble snag slows the flight until you pull free', () => {
    const state = flying('snag', 'forest')
    const before = state.player.travel!.remainingMs
    advanceTravel(state, 1000, () => 0.5)
    expect(state.player.travel!.remainingMs).toBe(before - 1000 * FLIGHT_EVENT_RULES.snagSpeed)
    for (let i = 0; i < FLIGHT_EVENT_RULES.snagTaps; i++) {
      applyAction(state, { type: 'flight/tap' })
    }
    expect(activeFlightEvent(state)).toBeNull()
    const after = state.player.travel!.remainingMs
    advanceTravel(state, 1000, () => 0.5)
    expect(state.player.travel!.remainingMs).toBe(after - 1000)
  })

  it("following a will-o'-wisp is a shortcut", () => {
    const state = flying('wisp', 'swamp')
    const before = state.player.travel!.remainingMs
    applyAction(state, { type: 'flight/tap' })
    expect(state.player.travel!.remainingMs).toBe(
      Math.round(before * FLIGHT_EVENT_RULES.wispShortcut),
    )
  })

  it('each region has its own windfall', () => {
    const state = flying('windfall', 'forest')
    applyAction(state, { type: 'flight/tap' })
    expect(state.player.satchel[REGION_FLIGHT_EVENTS.forest.windfall.itemId]).toBe(1)
  })
})

describe('the Acorn Post', () => {
  function atToadVillage(): GameState {
    const state = world()
    state.player.place = 'toad-village'
    state.upgrades.push('qol-post')
    state.resources.glimmers = 100
    state.player.satchel = { 'raw-reed-stalks': 18, 'trinket-bottle-cap': 1 }
    return state
  }

  it('needs the upgrade, a settlement and something to send', () => {
    const state = atToadVillage()
    state.upgrades = []
    expect(applyAction(state, { type: 'post/send' })).toEqual([
      { type: 'blocked', reason: 'locked' },
    ])
    state.upgrades.push('qol-post')
    state.player.place = 'reeds-hollow'
    expect(applyAction(state, { type: 'post/send' })).toEqual([
      { type: 'blocked', reason: 'not-here' },
    ])
    state.player.place = 'toad-village'
    state.player.satchel = {}
    expect(applyAction(state, { type: 'post/send' })).toEqual([
      { type: 'blocked', reason: 'no-target' },
    ])
  })

  it('sends the whole satchel for a small fee, and it arrives in storage later', () => {
    const state = atToadVillage()
    const fee = postFee(state)
    expect(fee).toBe(Math.max(POST_RULES.minFee, Math.ceil(19 / POST_RULES.itemsPerGlimmer)))
    const delay = postDelayMs(state, 'toad-village')
    const events = applyAction(state, { type: 'post/send' })
    expect(events[0]).toMatchObject({ type: 'parcel-sent', count: 19, fee })
    expect(state.player.satchel).toEqual({})
    expect(state.resources.glimmers).toBe(100 - fee)
    advancePost(state, delay - 1)
    expect(state.inventory['raw-reed-stalks']).toBeUndefined()
    advancePost(state, 1)
    expect(state.inventory['raw-reed-stalks']).toBe(18)
    expect(state.inventory['trinket-bottle-cap']).toBe(1)
    expect(state.post.parcels).toHaveLength(0)
  })

  it('waits at the door when storage is full (trinkets still come in)', () => {
    const state = atToadVillage()
    state.storageCapacity = 10
    state.inventory = { 'raw-clover-leaves': 5 }
    applyAction(state, { type: 'post/send' })
    advancePost(state, 10 * 60_000)
    expect(state.inventory['raw-reed-stalks']).toBe(5)
    expect(state.inventory['trinket-bottle-cap']).toBe(1)
    expect(state.post.parcels[0].items['raw-reed-stalks']).toBe(13)
    state.storageCapacity = 500
    advancePost(state, 1)
    expect(state.inventory['raw-reed-stalks']).toBe(18)
    expect(state.post.parcels).toHaveLength(0)
  })
})
