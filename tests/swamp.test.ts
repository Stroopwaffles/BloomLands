import { describe, expect, it } from 'vitest'
import { CREATURES, WEATHER } from '../src/data/challenges'
import { BREWER_KEEP } from '../src/data/helpers'
import { MOUNTS } from '../src/data/mounts'
import { RECIPES } from '../src/data/recipes'
import { SPOTS, WATER_FLIGHT_FACTOR } from '../src/data/world'
import { applyAction } from '../src/engine/actions'
import { advanceCreatures } from '../src/engine/challenges'
import { stationInUse } from '../src/engine/crafting'
import { advanceHelpers, helperFlightMs } from '../src/engine/helpers'
import { spellCost } from '../src/engine/magic'
import { clickPower, courtRank } from '../src/engine/modifiers'
import { advanceSecrets } from '../src/engine/secrets'
import { latestRegion, placeOpen, playerWatched } from '../src/engine/regions'
import { researchStatus } from '../src/engine/research'
import { rollPlant } from '../src/engine/gathering'
import { createNewGame, type GameState, type HelperState } from '../src/engine/state'
import { travelMs } from '../src/engine/travel'

const START = 1_700_000_000_000

/** A Hedge Court that has opened the Forest and knows the Rite of the Reed Gate. */
function readyForSwamp(): GameState {
  const state = createNewGame(START)
  state.upgrades.push(
    'lodging-ritual-circle',
    'lodging-roost',
    'lodging-mouse-bunks',
    'lodging-storeroom-1',
    'lodging-cauldron',
    'lodging-storeroom-2',
    'lodging-press',
    'lodging-spinning-wheel',
  )
  state.unlockedRegions.push('forest')
  state.research.completed.push('research-reed-gate')
  state.inventory = { 'component-earth-loam': 2, 'component-sun-salve': 1 }
  return state
}

function inSwamp(): GameState {
  const state = readyForSwamp()
  applyAction(state, { type: 'ritual/perform', ritualId: 'ritual-reed-gate' })
  return state
}

/** Puts the player at a spot without flying there. */
function standAt(state: GameState, spotId: string): void {
  state.player.travel = null
  state.player.place = spotId
  state.spots[spotId] ??= {
    slots: [{ plantId: SPOTS[spotId].plants[0], hp: 1, regrowMs: 0 }],
  } as GameState['spots'][string]
}

function helper(state: GameState, type: HelperState['type'], task: string | null): HelperState {
  const h: HelperState = {
    id: state.helpers.nextId++,
    type,
    name: 'Test',
    task,
    phase: 'idle',
    remainingMs: 0,
    tripSpot: null,
    tripItem: null,
    bag: {},
  }
  state.helpers.list.push(h)
  return h
}

describe('opening the Swamp', () => {
  it('needs a Hedge Court before the Reed Gate opens', () => {
    const state = readyForSwamp()
    state.upgrades = ['lodging-ritual-circle']
    expect(courtRank(state)).toBeLessThan(2)
    expect(applyAction(state, { type: 'ritual/perform', ritualId: 'ritual-reed-gate' })).toEqual([
      { type: 'blocked', reason: 'needs-rank' },
    ])
  })

  it('the Rite of the Reed Gate opens the Swamp, its weather and Toad Village', () => {
    const state = readyForSwamp()
    expect(courtRank(state)).toBe(2)
    expect(placeOpen(state, 'reeds-hollow')).toBe(false)
    const events = applyAction(state, { type: 'ritual/perform', ritualId: 'ritual-reed-gate' })
    expect(events.map((e) => e.type)).toEqual(['ritual-performed', 'region-unlocked'])
    expect(placeOpen(state, 'reeds-hollow')).toBe(true)
    expect(['fog', 'drizzle', 'muggy']).toContain(state.weather.swamp.kind)
    expect(state.settlements['toad-village']).toBeDefined()
    expect(latestRegion(state)).toBe('swamp')
  })

  it('Swamp research appears once the Swamp is open', () => {
    const state = readyForSwamp()
    state.research.completed.push('research-pressing')
    expect(researchStatus(state, 'research-lily-oil')).toBe('locked')
    applyAction(state, { type: 'ritual/perform', ritualId: 'ritual-reed-gate' })
    expect(researchStatus(state, 'research-lily-oil')).toBe('available')
  })

  it('Parley and Kindred Call use Lily Balm in the Swamp', () => {
    const state = inSwamp()
    standAt(state, 'reeds-hollow')
    expect(spellCost(state, 'spell-parley')).toContainEqual({
      itemId: 'component-lily-balm',
      amount: 1,
    })
  })

  it('Wisp Hollow opens once the Swamp reaches Budding bloom', () => {
    const state = inSwamp()
    advanceSecrets(state)
    expect(placeOpen(state, 'wisp-hollow')).toBe(false)
    state.bloom.swamp = 60
    advanceSecrets(state)
    expect(placeOpen(state, 'wisp-hollow')).toBe(true)
  })
})

describe('water and the frog', () => {
  it('flights to open water are slower, unless you ride the frog or drink Waterstride', () => {
    const state = inSwamp()
    standAt(state, 'reeds-hollow')
    const reeds = travelMs(state, 'toad-village', 'reeds-hollow')!
    const pools = travelMs(state, 'toad-village', 'lilypad-pools')!
    expect(pools).toBe(Math.ceil(reeds * WATER_FLIGHT_FACTOR))

    state.mounts.owned['mount-frog'] = { level: 1 }
    state.mounts.riding = 'mount-frog'
    const onFrog = travelMs(state, 'toad-village', 'lilypad-pools')!
    expect(onFrog).toBe(travelMs(state, 'toad-village', 'reeds-hollow'))

    state.mounts.riding = null
    state.buffs.push({ potionId: 'potion-waterstride-philter', remainingMs: 60_000 })
    expect(travelMs(state, 'toad-village', 'lilypad-pools')).toBe(reeds)
  })

  it('the frog adds click power in the Swamp only', () => {
    const state = inSwamp()
    state.mounts.owned['mount-frog'] = { level: 1 }
    state.mounts.riding = 'mount-frog'
    standAt(state, 'buttercup-rise')
    const meadow = clickPower(state)
    standAt(state, 'reeds-hollow')
    expect(clickPower(state)).toBe(meadow + 1)
    state.mounts.owned['mount-frog'].level = MOUNTS['mount-frog'].maxLevel
    expect(clickPower(state)).toBe(meadow + 3)
  })
})

describe('the heron', () => {
  function heronAtPools(): GameState {
    const state = inSwamp()
    standAt(state, 'lilypad-pools')
    state.challenges.creatures['lilypad-pools'] = {
      creatureId: 'heron',
      tapsLeft: 0,
      remainingMs: 60_000,
      eatMs: 0,
    }
    return state
  }

  it('only ever turns up at the Lilypad Pools', () => {
    const state = inSwamp()
    state.spots['reeds-hollow'] = { slots: [] } as unknown as GameState['spots'][string]
    state.spots['lilypad-pools'] = { slots: [] } as unknown as GameState['spots'][string]
    for (let i = 0; i < 20; i++) {
      state.challenges.creatures = {}
      state.challenges.nextCreatureMs = 0
      advanceCreatures(state, 1, Math.random)
      const herons = Object.entries(state.challenges.creatures).filter(
        ([, c]) => c.creatureId === 'heron',
      )
      for (const [spotId] of herons) expect(spotId).toBe('lilypad-pools')
    }
    expect(CREATURES.heron.spots).toEqual(['lilypad-pools'])
  })

  it('blocks gathering, but ignores you while Waterstride lasts', () => {
    const state = heronAtPools()
    expect(applyAction(state, { type: 'gather/tap', spotId: 'lilypad-pools', slot: 0 })).toEqual([
      { type: 'blocked', reason: 'watching' },
    ])
    state.buffs.push({ potionId: 'potion-waterstride-philter', remainingMs: 60_000 })
    expect(playerWatched(state, 'lilypad-pools')).toBe(false)
    const events = applyAction(state, { type: 'gather/tap', spotId: 'lilypad-pools', slot: 0 })
    expect(events[0].type).not.toBe('blocked')
  })

  it('Waterstride does not fool the owl', () => {
    const state = inSwamp()
    standAt(state, 'fernshade-floor')
    state.challenges.creatures['fernshade-floor'] = {
      creatureId: 'owl',
      tapsLeft: 0,
      remainingMs: 60_000,
      eatMs: 0,
    }
    state.buffs.push({ potionId: 'potion-waterstride-philter', remainingMs: 60_000 })
    expect(playerWatched(state, 'fernshade-floor')).toBe(true)
  })
})

describe('Swamp weather', () => {
  it('drizzle makes petal plants grow more often', () => {
    let seed = 1
    const random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
    const count = (boost?: { tag: string; multiplier: number }) => {
      let lilies = 0
      for (let i = 0; i < 4000; i++) {
        if (rollPlant('lilypad-pools', random, 1, true, boost) === 'plant-water-lily') lilies++
      }
      return lilies
    }
    expect(count(WEATHER.drizzle.tagBoost)).toBeGreaterThan(count() * 1.4)
  })

  it("muggy heat slows helpers' flights, and the Reed Pipe speeds them up", () => {
    const state = inSwamp()
    const h = helper(state, 'gatherer', 'reeds-hollow')
    state.weather.swamp = { kind: 'drizzle', remainingMs: 60_000 }
    const normal = helperFlightMs(state, h, 'reeds-hollow')
    state.weather.swamp = { kind: 'muggy', remainingMs: 60_000 }
    expect(helperFlightMs(state, h, 'reeds-hollow')).toBe(Math.ceil(normal * 1.3))
    state.curios.push('curio-reed-pipe')
    expect(helperFlightMs(state, h, 'reeds-hollow')).toBeLessThan(Math.ceil(normal * 1.3))
  })
})

describe('brewers', () => {
  function brewery(): { state: GameState; brewer: HelperState } {
    const state = inSwamp()
    state.upgrades.push('lodging-brewers-corner')
    state.research.completed.push('research-grinding')
    state.inventory = { 'raw-daisy-petals': 100 }
    const brewer = helper(state, 'brewer', null)
    return { state, brewer }
  }

  it('only brews recipes you have researched', () => {
    const { state, brewer } = brewery()
    expect(
      applyAction(state, {
        type: 'helpers/brew',
        helperId: brewer.id,
        recipeId: 'component-lily-balm',
      }),
    ).toEqual([{ type: 'blocked', reason: 'locked' }])
    applyAction(state, {
      type: 'helpers/brew',
      helperId: brewer.id,
      recipeId: 'refined-petal-paste',
      keep: 5,
    })
    expect(brewer.task).toBe('refined-petal-paste')
    expect(brewer.keep).toBe(5)
  })

  it('keeps brewing, even while you are away, until storage holds enough', () => {
    const { state, brewer } = brewery()
    applyAction(state, {
      type: 'helpers/brew',
      helperId: brewer.id,
      recipeId: 'refined-petal-paste',
      keep: 5,
    })
    advanceHelpers(state, 1, Math.random)
    expect(brewer.phase).toBe('gathering')
    expect(stationInUse(state, 'mortar')).toBe(1)
    // The mortar's only slot is taken by the brewer, so the player has to wait.
    expect(applyAction(state, { type: 'craft/start', recipeId: 'refined-petal-paste' })).toEqual([
      { type: 'blocked', reason: 'station-busy' },
    ])
    for (let i = 0; i < 20; i++) advanceHelpers(state, 60_000, Math.random)
    expect(state.inventory['refined-petal-paste']).toBe(5)
    expect(state.inventory['raw-daisy-petals']).toBe(100 - 5 * 4)
    expect(brewer.phase).toBe('idle')
  })

  it('waits when ingredients run out', () => {
    const { state, brewer } = brewery()
    state.inventory = { 'raw-daisy-petals': 3 }
    brewer.task = 'refined-petal-paste'
    advanceHelpers(state, 60_000, Math.random)
    expect(brewer.phase).toBe('idle')
    expect(state.inventory['raw-daisy-petals']).toBe(3)
    expect(BREWER_KEEP.default).toBeGreaterThan(0)
    expect(RECIPES['refined-petal-paste']).toBeDefined()
  })
})

describe('scouts', () => {
  it('bring home trinkets from the spot they search, even with storage full', () => {
    const state = inSwamp()
    state.storageCapacity = 0
    state.inventory = { 'raw-clover-leaves': 500 }
    const scout = helper(state, 'scout', 'reeds-hollow')
    let found = 0
    for (let i = 0; i < 30; i++) {
      advanceHelpers(state, 60_000, Math.random)
      found = Object.entries(state.inventory)
        .filter(([id]) => SPOTS['reeds-hollow'].trinkets.includes(id))
        .reduce((sum, [, n]) => sum + n, 0)
    }
    expect(found).toBeGreaterThan(0)
    expect(scout.bag['raw-clover-leaves']).toBeUndefined()
  })
})

describe('Swamp curios', () => {
  it("the Mayor's Chain raises the bloom from helping villagers", () => {
    const state = inSwamp()
    const help = (s: GameState) => {
      s.player.travel = null
      s.player.place = 'toad-village'
      s.settlements['toad-village'].requests = [
        {
          id: 1,
          traderId: 'villager-puddle',
          wants: [{ itemId: 'raw-duckweed', amount: 1 }],
          glimmers: 5,
          trinketId: null,
          remainingMs: 60_000,
        },
      ]
      s.inventory['raw-duckweed'] = 1
      applyAction(s, { type: 'villager/fulfill', settlementId: 'toad-village', requestId: 1 })
      return s.bloom.swamp ?? 0
    }
    const plain = help(inSwamp())
    state.curios.push('curio-mayors-chain')
    expect(help(state)).toBeGreaterThan(plain)
  })
})
