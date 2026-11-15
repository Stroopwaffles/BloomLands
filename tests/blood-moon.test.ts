import { describe, expect, it } from 'vitest'
import { DAY_MS, NIGHTFALL_MS } from '../src/data/time'
import { applyAction } from '../src/engine/actions'
import { placeOpen, openSpots } from '../src/engine/regions'
import {
  advanceSpecialEvents,
  checkEventRecipe,
  eventStore,
  startEvent,
} from '../src/engine/specialEvents'
import { createNewGame, type GameState, type HelperState } from '../src/engine/state'
import { travelMs, advanceTravel } from '../src/engine/travel'

const START = 1_700_000_000_000

function hearthling(): GameState {
  const state = createNewGame(START)
  state.character.created = true
  for (let id = 1; id <= 4; id++) {
    state.helpers.list.push({ id, type: 'gatherer', name: 'H', task: null } as HelperState)
  }
  return state
}

/** Runs the clock up to just after nightfall. */
function nightfall(state: GameState, random: () => number, offline = false) {
  state.time.dayMs = NIGHTFALL_MS - 10
  state.specialEvents.wasNight = false
  advanceSpecialEvents(state, 0, random, offline)
  state.time.dayMs = NIGHTFALL_MS + 10
  advanceSpecialEvents(state, 0, random, offline)
}

function duringBloodMoon(): GameState {
  const state = hearthling()
  startEvent(state, 'blood-moon', () => 0.5)
  return state
}

describe('when a Blood Moon rises', () => {
  it('may rise at nightfall, more likely each night it doesn’t', () => {
    const state = hearthling()
    nightfall(state, () => 0.5)
    expect(state.specialEvents.active).toBeNull()
    expect(state.specialEvents.nightsWithout).toBe(1)
    for (let i = 0; i < 8; i++) nightfall(state, () => 0.5)
    expect(state.specialEvents.active).toMatchObject({ id: 'blood-moon' })
    expect(state.inbox).toContainEqual({ type: 'event-started', eventId: 'blood-moon' })
    expect(state.specialEvents.nightsWithout).toBe(0)
  })

  it('never while the game is closed, and never for a brand-new Wanderer', () => {
    const away = hearthling()
    nightfall(away, () => 0, true)
    expect(away.specialEvents.active).toBeNull()
    const fresh = createNewGame(START)
    nightfall(fresh, () => 0)
    expect(fresh.specialEvents.active).toBeNull()
  })

  it('opens the Crimson Vale, one flight from anywhere, and closes it again', () => {
    const state = hearthling()
    expect(placeOpen(state, 'moonless-manor')).toBe(false)
    startEvent(state, 'blood-moon', () => 0.5)
    expect(placeOpen(state, 'moonless-manor')).toBe(true)
    expect(placeOpen(state, 'graveblossom-garden')).toBe(true)
    expect(travelMs(state, 'home', 'moonless-manor')).toBeGreaterThan(0)
    applyAction(state, { type: 'travel/go', to: 'graveblossom-garden' }, () => 0.99)
    advanceTravel(state, 60_000, () => 0.5)
    expect(state.player.place).toBe('graveblossom-garden')
    // The moon sets: the vale fades, and you're carried safely home.
    advanceSpecialEvents(state, 41 * 60_000, () => 0.5, false)
    expect(state.specialEvents.active).toBeNull()
    expect(state.player.place).toBe('home')
    expect(state.inbox).toContainEqual({
      type: 'event-ended',
      eventId: 'blood-moon',
      sentHome: true,
    })
    expect(placeOpen(state, 'graveblossom-garden')).toBe(false)
  })
})

describe('the Crimson Vale and the Moonless Manor', () => {
  it('harvests go to the manor’s pantry, never the satchel (even a full one)', () => {
    const state = duringBloodMoon()
    state.player.place = 'graveblossom-garden'
    state.player.satchel = { 'raw-clover-leaves': 999 }
    state.spots['graveblossom-garden'] = {
      slots: [{ plantId: 'plant-bloodrose', hp: 1, regrowMs: 0 }],
    }
    applyAction(state, { type: 'gather/tap', spotId: 'graveblossom-garden', slot: 0 }, () => 0.99)
    expect(eventStore(state, 'blood-moon')['event-bloodrose-petals']).toBe(2)
    expect(state.player.satchel).toEqual({ 'raw-clover-leaves': 999 })
  })

  it('the manor’s cauldron makes essences and outfits from the pantry', () => {
    const state = duringBloodMoon()
    Object.assign(eventStore(state, 'blood-moon'), {
      'event-bloodrose-petals': 12,
      'event-nightshade': 4,
      'event-widows-lace': 2,
      'event-batwing-fronds': 2,
    })
    const craft = (recipeId: string) => applyAction(state, { type: 'event/craft', recipeId })
    expect(craft('event-bloodrose-essence')).toEqual([{ type: 'blocked', reason: 'not-here' }])
    state.player.place = 'moonless-manor'
    for (let i = 0; i < 4; i++) craft('event-bloodrose-essence')
    craft('event-shadow-silk')
    expect(craft('event-outfit-crimson-rose')).toContainEqual({
      type: 'outfit',
      outfitId: 'outfit-crimson-rose',
    })
    expect(state.outfits).toContain('outfit-crimson-rose')
    expect(checkEventRecipe(state, 'event-outfit-crimson-rose')).toBe('already-done')
    expect(eventStore(state, 'blood-moon')['event-bloodrose-essence']).toBeUndefined()
  })

  it('stays out of the main game, and its pantry lasts through the Root Song', () => {
    const state = duringBloodMoon()
    expect(openSpots(state)).not.toContain('graveblossom-garden')
    eventStore(state, 'blood-moon')['event-moonblood'] = 2
    state.upgrades.push('lodging-ritual-circle')
    state.research.completed.push('research-root-song')
    state.inventory['component-harmony-blend'] = 1
    for (let id = 10; id < 40; id++) {
      state.helpers.list.push({ id, type: 'gatherer', name: 'H', task: null } as HelperState)
    }
    applyAction(state, { type: 'ritual/perform', ritualId: 'ritual-root-song' })
    expect(state.prestige.run).toBe(2)
    expect(eventStore(state, 'blood-moon')['event-moonblood']).toBe(2)
    expect(state.time.dayMs).toBeLessThan(DAY_MS)
  })
})
