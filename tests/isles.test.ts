import { describe, expect, it } from 'vitest'
import { RECIPES } from '../src/data/recipes'
import { applyAction } from '../src/engine/actions'
import { castSpell } from '../src/engine/magic'
import { courtRank, luck } from '../src/engine/modifiers'
import { rootSongPreview } from '../src/engine/prestige'
import { advanceMountRegions, placeOpen, unlockRegion } from '../src/engine/regions'
import { researchCost } from '../src/engine/research'
import { advanceSecrets } from '../src/engine/secrets'
import { createNewGame, type GameState, type HelperState } from '../src/engine/state'
import { travelMs } from '../src/engine/travel'

const START = 1_700_000_000_000

/** A Moon Court with every region up to the Glade open. */
function moonCourt(): GameState {
  const state = createNewGame(START)
  state.unlockedRegions.push('forest', 'swamp', 'orchard', 'caves', 'glade')
  for (let id = 1; id <= 44; id++) {
    state.helpers.list.push({ id, type: 'gatherer', name: 'H', task: null } as HelperState)
  }
  return state
}

function inIsles(): GameState {
  const state = moonCourt()
  unlockRegion(state, 'sky', () => 0.99)
  state.weather.sky = { kind: 'updraft', remainingMs: 1e9 }
  return state
}

describe('reaching the Sky Isles', () => {
  it('opens once the court has the blue jay and the Moon Court rank', () => {
    const state = moonCourt()
    expect(courtRank(state)).toBeGreaterThanOrEqual(5)
    advanceMountRegions(state, () => 0.5)
    expect(placeOpen(state, 'cloudbloom-terraces')).toBe(false)
    state.mounts.owned['mount-blue-jay'] = { level: 1 }
    advanceMountRegions(state, () => 0.5)
    expect(placeOpen(state, 'cloudbloom-terraces')).toBe(true)
    expect(state.inbox).toContainEqual({ type: 'region-unlocked', regionId: 'sky' })
    expect(state.settlements.nimbusrest).toBeDefined()
  })

  it('a smaller court has to wait, even with the jay', () => {
    const state = moonCourt()
    state.helpers.list = state.helpers.list.slice(0, 10)
    state.mounts.owned['mount-blue-jay'] = { level: 1 }
    advanceMountRegions(state, () => 0.5)
    expect(placeOpen(state, 'nimbusrest')).toBe(false)
  })

  it('the Jay-Blue Feather tames the jay as soon as the Glade opens', () => {
    const state = moonCourt()
    state.unlockedRegions = state.unlockedRegions.filter((r) => r !== 'glade')
    state.prestige.relics.push('relic-aeris-3')
    unlockRegion(state, 'glade', () => 0.5)
    expect(state.mounts.owned['mount-blue-jay']).toEqual({ level: 1 })
  })
})

describe('Sky Isles weather', () => {
  it('a storm grounds flights to and from the isles; Stormward or the Storm Bell gets through', () => {
    const state = inIsles()
    state.weather.sky = { kind: 'storm', remainingMs: 1e9 }
    const go = () => applyAction(state, { type: 'travel/go', to: 'nimbusrest' })
    expect(go()).toEqual([{ type: 'blocked', reason: 'storm' }])
    // Elsewhere is fine.
    expect(applyAction(state, { type: 'travel/go', to: 'buttercup-rise' })[0].type).toBe('depart')
    state.player.travel = null
    state.research.completed.push('research-stormward')
    state.inventory = { 'component-wind-silk': 1, 'component-crystal-focus': 1 }
    castSpell(state, 'spell-stormward')
    expect(go()[0].type).toBe('depart')
    state.player.travel = null
    state.player.stormwardMs = 0
    state.prestige.relics.push('relic-aeris-4')
    expect(go()[0].type).toBe('depart')
  })

  it('a rainbow adds one to every harvest', () => {
    const state = inIsles()
    state.weather.sky = { kind: 'rainbow', remainingMs: 1e9 }
    state.player.place = 'cloudbloom-terraces'
    state.spots['cloudbloom-terraces'] = {
      slots: [{ plantId: 'plant-skybell', hp: 1, regrowMs: 0 }],
    }
    const events = applyAction(
      state,
      { type: 'gather/tap', spotId: 'cloudbloom-terraces', slot: 0 },
      () => 0.99,
    )
    expect(events.find((e) => e.type === 'harvest')).toMatchObject({
      items: [{ itemId: 'raw-skybell-petals', amount: 3 }],
    })
  })

  it('the hawk slows flights to its spot, unless it is a friend', () => {
    const state = inIsles()
    state.player.place = 'nimbusrest'
    const usual = travelMs(state, 'nimbusrest', 'windharp-cliffs')!
    state.challenges.creatures['windharp-cliffs'] = {
      creatureId: 'hawk',
      tapsLeft: 0,
      remainingMs: 60_000,
      eatMs: 0,
    }
    expect(travelMs(state, 'nimbusrest', 'windharp-cliffs')).toBeGreaterThan(usual * 1.4)
  })
})

describe('Sky Isles secrets and curios', () => {
  it('the Aurora Garden opens at Moon Court; the Cloud Archive only from run 2', () => {
    const state = inIsles()
    advanceSecrets(state)
    expect(placeOpen(state, 'aurora-garden')).toBe(true)
    expect(placeOpen(state, 'cloud-archive')).toBe(false)
    state.prestige.run = 2
    advanceSecrets(state)
    expect(placeOpen(state, 'cloud-archive')).toBe(true)
  })

  it('Star Chart, Windbound Tome and Aurora Prism', () => {
    const state = inIsles()
    state.bloom.meadow = 300
    const song = rootSongPreview(state).total
    state.curios.push('curio-star-chart', 'curio-windbound-tome', 'curio-aurora-prism')
    expect(rootSongPreview(state).total).toBe(song + Math.round(song * 0.15))
    expect(researchCost(state, 'research-cloud-silk')).toEqual([
      { itemId: 'raw-cloud-fluff', amount: 5 },
    ])
    state.buffs.push({ potionId: 'potion-lucky-dew', remainingMs: 60_000 })
    const boosted = luck(state)
    state.curios = state.curios.filter((c) => c !== 'curio-aurora-prism')
    expect(boosted).toBeGreaterThan(luck(state))
  })

  it('Harmony Blend now takes all seven signatures', () => {
    expect(RECIPES['component-harmony-blend'].inputs).toHaveLength(7)
  })
})
