import { describe, expect, it } from 'vitest'
import { RELIC_LIST } from '../src/data/prestige'
import { SPIRITS } from '../src/data/spirits'
import { applyAction } from '../src/engine/actions'
import { advanceCreatures } from '../src/engine/challenges'
import { checkRitual } from '../src/engine/magic'
import { clickPower, courtRank, satchelCapacity } from '../src/engine/modifiers'
import { befriended } from '../src/engine/mounts'
import { nextRelic, rootSongPreview } from '../src/engine/prestige'
import { regionReachable, unlockRegion } from '../src/engine/regions'
import { awakenSpirit, spiritRequirements } from '../src/engine/spirits'
import { createNewGame, type GameState, type HelperState } from '../src/engine/state'

const START = 1_700_000_000_000

/** A Blossom Court that knows the Root Song Ritual and has a Harmony Blend ready. */
function readyToSing(): GameState {
  const state = createNewGame(START)
  state.character.created = true
  state.upgrades.push('lodging-ritual-circle', 'qol-auto-deposit')
  state.research.completed.push('research-root-song')
  state.inventory['component-harmony-blend'] = 1
  for (let id = 1; id <= 30; id++) {
    state.helpers.list.push({ id, type: 'gatherer', name: 'H', task: null } as HelperState)
  }
  state.bloom.meadow = 120
  state.outfits.push('outfit-dewdrop')
  state.resources.glimmers = 5000
  state.curios.push('curio-pips-compass')
  return state
}

function sing(state: GameState) {
  return applyAction(state, { type: 'ritual/perform', ritualId: 'ritual-root-song' })
}

describe('the Root Song Ritual', () => {
  it('needs the research, a Blossom Court and a Harmony Blend', () => {
    const state = readyToSing()
    expect(courtRank(state)).toBeGreaterThanOrEqual(4)
    expect(checkRitual(state, 'ritual-root-song')).toBe('ok')
    state.helpers.list = state.helpers.list.slice(0, 5)
    expect(checkRitual(state, 'ritual-root-song')).toBe('needs-rank')
    const fresh = readyToSing()
    fresh.inventory = {}
    expect(checkRitual(fresh, 'ritual-root-song')).toBe('missing-items')
  })

  it('starts a new run, keeping what lasts and earning Root Song', () => {
    const state = readyToSing()
    const earned = rootSongPreview(state).total
    expect(earned).toBeGreaterThan(0)
    const events = sing(state)
    expect(events).toContainEqual({ type: 'prestige', run: 2, rootSong: earned })
    // Kept
    expect(state.character.created).toBe(true)
    expect(state.outfits).toContain('outfit-dewdrop')
    expect(state.upgrades).toEqual(['qol-auto-deposit'])
    expect(state.prestige.rootSong).toBe(earned)
    expect(state.prestige.run).toBe(2)
    // Reset
    expect(state.resources.glimmers).toBe(0)
    expect(state.helpers.list).toEqual([])
    expect(state.research.completed).toEqual([])
    expect(state.curios).toEqual([])
    expect(state.bloom.meadow).toBe(0)
    expect(state.unlockedRegions).toEqual(['meadow'])
    expect(state.inventory).toEqual({})
    expect(state.player.place).toBe('home')
  })
})

describe('Root Song upgrades', () => {
  it('tiers cost Root Song and stop at the top', () => {
    const state = createNewGame(START)
    state.prestige.rootSong = 30
    const power = clickPower(state)
    applyAction(state, { type: 'rootsong/buy', upgradeId: 'root-seasoned-hands' })
    expect(clickPower(state)).toBe(power + 1)
    expect(state.prestige.rootSong).toBe(10)
    expect(applyAction(state, { type: 'rootsong/buy', upgradeId: 'root-seasoned-hands' })).toEqual([
      { type: 'blocked', reason: 'missing-root-song' },
    ])
    state.prestige.rootSong = 1000
    applyAction(state, { type: 'rootsong/buy', upgradeId: 'root-second-cauldron' })
    expect(applyAction(state, { type: 'rootsong/buy', upgradeId: 'root-second-cauldron' })).toEqual(
      [{ type: 'blocked', reason: 'maxed' }],
    )
    const satchel = satchelCapacity(state)
    applyAction(state, { type: 'rootsong/buy', upgradeId: 'root-roomy-satchel' })
    expect(satchelCapacity(state)).toBe(satchel + 5)
  })

  it('start-of-run gifts arrive with the next run', () => {
    const state = readyToSing()
    state.prestige.rootSong = 500
    state.prestige.upgrades = {
      'root-glimmer-purse': 2,
      'root-old-friends': 1,
      'root-remembered-recipes': 1,
      'root-deep-roots': 1,
    }
    sing(state)
    expect(state.resources.glimmers).toBe(300)
    expect(state.helpers.list).toHaveLength(1)
    expect(state.research.completed).toContain('research-salves')
    expect(state.research.completed.some((id) => id.includes('loam'))).toBe(false)
    expect(state.bloom.meadow).toBe(5)
  })

  it('gifts bought on a new run before leaving home still count; later ones wait', () => {
    const state = readyToSing()
    sing(state)
    state.prestige.rootSong = 100
    applyAction(state, { type: 'rootsong/buy', upgradeId: 'root-glimmer-purse' })
    expect(state.resources.glimmers).toBe(150)
    applyAction(state, { type: 'travel/go', to: 'buttercup-rise' })
    applyAction(state, { type: 'rootsong/buy', upgradeId: 'root-glimmer-purse' })
    expect(state.resources.glimmers).toBe(150)
  })
})

describe('relics', () => {
  function atSunstone(state: GameState): void {
    state.player.place = 'sunstone-hill'
    state.player.travel = null
    state.stories['story-pip'] = { chapter: 9, statStart: 0, complete: true }
  }

  it('a spirit gives its next relic once per run, and asks for more next time', () => {
    const state = createNewGame(START)
    atSunstone(state)
    state.bloom.meadow = 500
    state.inventory['component-sun-salve'] = 20
    const events = awakenSpirit(state, 'spirit-sorrel')
    expect(events).toContainEqual({ type: 'relic', relicId: 'relic-sorrel-1' })
    expect(nextRelic(state, 'spirit-sorrel')?.id).toBe('relic-sorrel-2')
    // The same run never gives a second relic.
    state.spirits = {}
    expect(awakenSpirit(state, 'spirit-sorrel').some((e) => e.type === 'relic')).toBe(false)
    // In the next run, Sorrel wants more bloom and a bigger offering.
    state.prestige.giftedThisRun = []
    const reqs = spiritRequirements(state, 'spirit-sorrel')
    const base = SPIRITS['spirit-sorrel'].requirements
    const bloom = (r: typeof base) => r.find((q) => q.kind === 'bloom')
    expect(bloom(reqs)).toMatchObject({ level: (bloom(base) as { level: number }).level + 1 })
    expect(reqs.find((q) => q.kind === 'offering')).toMatchObject({
      items: [{ itemId: 'component-sun-salve', amount: 6 }],
    })
    state.prestige.upgrades['root-spirits-ear'] = 2
    expect(
      spiritRequirements(state, 'spirit-sorrel').find((q) => q.kind === 'offering'),
    ).toMatchObject({
      items: [{ itemId: 'component-sun-salve', amount: 4 }],
    })
  })

  it('every spirit has five relics in order', () => {
    for (const spiritId of Object.keys(SPIRITS)) {
      const relics = RELIC_LIST.filter((r) => r.spiritId === spiritId)
      expect(relics.map((r) => r.index)).toEqual([1, 2, 3, 4, 5])
    }
  })

  it('head start, kinship and truce', () => {
    const state = readyToSing()
    state.prestige.relics.push('relic-sorrel-1', 'relic-sorrel-2', 'relic-mirebelle-3')
    sing(state)
    expect(state.bloom.meadow).toBe(10)
    unlockRegion(state, 'swamp', () => 0.5)
    expect(state.mounts.owned['mount-frog']).toEqual({ level: 1 })
    // The rabbit never turns up any more.
    state.spots['buttercup-rise'] = { slots: [] } as unknown as GameState['spots'][string]
    for (let i = 0; i < 20; i++) {
      state.challenges.nextCreatureMs = 0
      advanceCreatures(state, 1, () => 0)
    }
    expect(Object.values(state.challenges.creatures).map((c) => c.creatureId)).not.toContain(
      'rabbit',
    )
  })

  it('the Ever-Lit Lantern lights the Caves; Kind Heart shortens befriending', () => {
    const state = readyToSing()
    expect(regionReachable(state, 'caves')).toBe(false)
    state.prestige.relics.push('relic-quartz-4')
    expect(regionReachable(state, 'caves')).toBe(true)
    state.mounts.friendship['mount-bumblebee'] = { feedings: 2, cooldownMs: 0 }
    expect(befriended(state, 'mount-bumblebee')).toBe(false)
    state.prestige.upgrades['root-kind-heart'] = 3
    expect(befriended(state, 'mount-bumblebee')).toBe(true)
  })
})
