import { describe, expect, it } from 'vitest'
import { applyAction } from '../src/engine/actions'
import { advanceCreatures } from '../src/engine/challenges'
import { castSpell } from '../src/engine/magic'
import {
  clickPower,
  courtRank,
  regionBloomMultiplier,
  regionCalmMultiplier,
  scoutTrinketMultiplier,
} from '../src/engine/modifiers'
import { wildMountAt } from '../src/engine/mounts'
import { placeOpen, regionReachable } from '../src/engine/regions'
import { advanceSecrets, rollScoutSecret } from '../src/engine/secrets'
import { createNewGame, type GameState, type HelperState } from '../src/engine/state'
import { advanceTravel } from '../src/engine/travel'

const START = 1_700_000_000_000

/** A Bramble Court with the Orchard open and the Lantern Rite known. */
function readyForCaves(): GameState {
  const state = createNewGame(START)
  state.upgrades.push('lodging-ritual-circle')
  state.unlockedRegions.push('forest', 'swamp', 'orchard')
  state.research.completed.push('research-lantern-rite')
  state.inventory = { 'component-beeswax-candle': 2, 'component-lily-balm': 1 }
  for (let id = 1; id <= 15; id++) {
    state.helpers.list.push({ id, type: 'gatherer', name: 'H', task: null } as HelperState)
  }
  return state
}

function inCaves(): GameState {
  const state = readyForCaves()
  applyAction(state, { type: 'ritual/perform', ritualId: 'ritual-lantern' })
  return state
}

function at(state: GameState, spotId: string, creatureId?: string): void {
  state.player.travel = null
  state.player.place = spotId
  state.spots[spotId] = {
    slots: [{ plantId: 'plant-cave-moss', hp: 1, regrowMs: 0 }],
  } as GameState['spots'][string]
  if (creatureId) {
    state.challenges.creatures[spotId] = {
      creatureId,
      tapsLeft: creatureId === 'spider' ? 10 : 8,
      remainingMs: 60_000,
      eatMs: 0,
    }
  }
}

describe('lighting the Caves', () => {
  it('the Lantern Rite opens them for good', () => {
    const state = readyForCaves()
    expect(courtRank(state)).toBeGreaterThanOrEqual(3)
    expect(placeOpen(state, 'fungus-gallery')).toBe(false)
    applyAction(state, { type: 'ritual/perform', ritualId: 'ritual-lantern' })
    expect(placeOpen(state, 'fungus-gallery')).toBe(true)
    expect(state.settlements.glimmerdeep).toBeDefined()
  })

  it('before the rite, a Glowlight Potion lets the court visit', () => {
    const state = readyForCaves()
    expect(regionReachable(state, 'caves')).toBe(false)
    state.buffs.push({ potionId: 'potion-glowlight', remainingMs: 60 * 60_000 })
    expect(regionReachable(state, 'caves')).toBe(true)
    applyAction(state, { type: 'travel/go', to: 'glimmerdeep' }, () => 0.99)
    advanceTravel(state, 10 * 60_000, () => 0.5)
    expect(state.player.place).toBe('glimmerdeep')
    expect(state.weather.caves).toBeDefined()
    expect(state.settlements.glimmerdeep).toBeDefined()
    // A court below the rite's rank can't go, even with light.
    state.helpers.list = []
    expect(regionReachable(state, 'caves')).toBe(false)
  })

  it('a glowworm counts as light, and only shows up once Lumen is brave', () => {
    const state = readyForCaves()
    state.mounts.owned['mount-glowworm'] = { level: 1 }
    state.mounts.riding = 'mount-glowworm'
    expect(regionReachable(state, 'caves')).toBe(true)
    const fresh = inCaves()
    expect(wildMountAt(fresh, 'fungus-gallery')).toBeNull()
    fresh.stories['story-lumen'] = { chapter: 4, statStart: 0, complete: true }
    expect(wildMountAt(fresh, 'fungus-gallery')).toBe('mount-glowworm')
  })
})

describe('webs and rockfalls', () => {
  it('spider webs block gathering until torn down by tapping', () => {
    const state = inCaves()
    at(state, 'fungus-gallery', 'spider')
    const tap = () => applyAction(state, { type: 'gather/tap', spotId: 'fungus-gallery', slot: 0 })
    expect(tap()).toEqual([{ type: 'blocked', reason: 'watching' }])
    state.player.sneakMs = 60_000 // Hush Step doesn't get you past webs
    expect(tap()).toEqual([{ type: 'blocked', reason: 'watching' }])
    for (let i = 0; i < 10; i++) {
      applyAction(state, { type: 'creature/tap', spotId: 'fungus-gallery' })
    }
    expect(state.challenges.creatures['fungus-gallery']).toBeUndefined()
  })

  it('Web Unweave clears webs; Lullaby calms spiders but not rubble', () => {
    const state = inCaves()
    state.research.completed.push('research-web-unweave', 'research-lullaby')
    state.inventory['component-glow-ink'] = 1
    at(state, 'fungus-gallery', 'spider')
    expect(castSpell(state, 'spell-web-unweave').map((e) => e.type)).toContain('creature-gone')
    at(state, 'crystal-seam', 'rockfall')
    state.inventory['component-calming-tea'] = 1
    expect(castSpell(state, 'spell-lullaby')).toEqual([{ type: 'blocked', reason: 'no-target' }])
  })

  it('rockfalls only happen during rumbles', () => {
    const state = inCaves()
    // Two visited spots, so a spider turning up at one leaves room for a rockfall at the other.
    state.spots['crystal-seam'] = { slots: [] } as unknown as GameState['spots'][string]
    state.spots['fungus-gallery'] = { slots: [] } as unknown as GameState['spots'][string]
    const spawned = (kind: 'rumbles' | 'still-air') => {
      state.weather.caves = { kind, remainingMs: 1e9 }
      state.challenges.creatures = {}
      state.challenges.nextCreatureMs = 0
      advanceCreatures(state, 1, () => 0)
      return Object.values(state.challenges.creatures).some((c) => c.creatureId === 'rockfall')
    }
    expect(spawned('still-air')).toBe(false)
    expect(spawned('rumbles')).toBe(true)
  })
})

describe('Caves secrets and curios', () => {
  it('the Sunken Geode is found by a scout, not by bloom', () => {
    const state = inCaves()
    state.bloom.caves = 500
    advanceSecrets(state)
    expect(placeOpen(state, 'sunken-geode')).toBe(false)
    expect(rollScoutSecret(state, 'caves', () => 0.99)).toEqual([])
    const events = rollScoutSecret(state, 'caves', () => 0)
    expect(events).toEqual([{ type: 'secret', spotId: 'sunken-geode', found: 'unlocked' }])
    expect(placeOpen(state, 'sunken-geode')).toBe(true)
  })

  it("Digby's story opens the Surface Lift", () => {
    const state = inCaves()
    state.stories['story-digby'] = { chapter: 4, statStart: 0, complete: true }
    advanceSecrets(state)
    expect(placeOpen(state, 'surface-lift')).toBe(true)
  })

  it('curios: spyglass, nightlight, heartstone and the miner lamp', () => {
    const state = inCaves()
    state.curios.push(
      'curio-brass-spyglass',
      'curio-nightlight-jar',
      'curio-heartstone',
      'curio-miners-lamp',
    )
    expect(scoutTrinketMultiplier(state)).toBe(1.5)
    expect(regionCalmMultiplier(state, 'caves')).toBe(0.5)
    expect(regionCalmMultiplier(state, 'meadow')).toBe(1)
    expect(regionBloomMultiplier(state, 'meadow')).toBeCloseTo(1.1)
    at(state, 'buttercup-rise')
    const surface = clickPower(state)
    at(state, 'fungus-gallery')
    expect(clickPower(state)).toBe(surface + 1)
  })
})
