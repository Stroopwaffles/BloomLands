import { describe, expect, it } from 'vitest'
import { ITEMS } from '../src/data/items'
import { POTIONS, RECIPES } from '../src/data/recipes'
import { RESEARCH } from '../src/data/research'
import { applyAction } from '../src/engine/actions'
import { clickPower, luck, satchelCapacity, wingSpeed } from '../src/engine/buffs'
import { canAfford, pay } from '../src/engine/costs'
import { checkCraft, unlockedRecipes } from '../src/engine/crafting'
import { ensureSpot, rollPlant, tapPlant } from '../src/engine/gathering'
import { researchStatus } from '../src/engine/research'
import { stateRandom } from '../src/engine/rng'
import { countItems, createNewGame, type GameState } from '../src/engine/state'
import { advance } from '../src/engine/tick'
import { travelMs } from '../src/engine/travel'

const START = 1_700_000_000_000

function gameWith(inventory: Record<string, number>, research: string[] = []): GameState {
  const state = createNewGame(START)
  state.inventory = { ...inventory }
  state.research.completed = [...research]
  return state
}

describe('data', () => {
  it('only refers to items and recipes that exist', () => {
    for (const recipe of Object.values(RECIPES)) {
      expect(ITEMS[recipe.output.itemId], recipe.id).toBeDefined()
      for (const input of recipe.inputs) {
        if ('itemId' in input) expect(ITEMS[input.itemId], `${recipe.id} input`).toBeDefined()
      }
    }
    for (const node of Object.values(RESEARCH)) {
      for (const recipeId of node.unlocks) expect(RECIPES[recipeId], node.id).toBeDefined()
      for (const req of node.requires) expect(RESEARCH[req], node.id).toBeDefined()
    }
    for (const potionId of Object.keys(POTIONS)) expect(ITEMS[potionId]).toBeDefined()
  })

  it('unlocks every recipe somewhere in the research tree', () => {
    const unlockable = new Set(Object.values(RESEARCH).flatMap((node) => node.unlocks))
    for (const recipeId of Object.keys(RECIPES))
      expect(unlockable.has(recipeId), recipeId).toBe(true)
  })
})

describe('costs', () => {
  it('pays tag costs from any matching items, largest stacks first', () => {
    const stock = { 'raw-daisy-petals': 2, 'raw-buttercup-petals': 5, 'raw-clover-leaves': 9 }
    expect(pay(stock, [{ tag: 'petals', amount: 6 }])).toBe(true)
    expect(stock).toEqual({ 'raw-daisy-petals': 1, 'raw-clover-leaves': 9 })
  })

  it("doesn't let a tag use up an item another entry needs", () => {
    const stock = { 'raw-dewdrops': 2, 'raw-wild-berries': 3 }
    expect(
      canAfford(stock, [
        { tag: 'fruit', amount: 3 },
        { itemId: 'raw-dewdrops', amount: 2 },
      ]),
    ).toBe(true)
    expect(canAfford(stock, [{ itemId: 'raw-dewdrops', amount: 3 }])).toBe(false)
  })

  it('changes nothing when it cannot pay', () => {
    const stock = { 'raw-daisy-petals': 2 }
    expect(pay(stock, [{ tag: 'petals', amount: 3 }])).toBe(false)
    expect(stock).toEqual({ 'raw-daisy-petals': 2 })
  })
})

describe('research', () => {
  it('starts with only the root research available', () => {
    const state = createNewGame(START)
    expect(researchStatus(state, 'research-grinding')).toBe('available')
    expect(researchStatus(state, 'research-drying')).toBe('available')
    expect(researchStatus(state, 'research-pressing')).toBe('locked')
    expect(unlockedRecipes(state).size).toBe(0)
  })

  it('takes real time, pays its cost up front and unlocks recipes', () => {
    const state = gameWith({ 'raw-daisy-petals': 10 })
    const [event] = applyAction(state, { type: 'research/start', researchId: 'research-grinding' })
    expect(event).toEqual({ type: 'research-start', researchId: 'research-grinding' })
    expect(state.inventory).toEqual({ 'raw-daisy-petals': 4 })
    expect(researchStatus(state, 'research-grinding')).toBe('in-progress')

    advance(state, START + 30_000)
    expect(researchStatus(state, 'research-grinding')).toBe('done')
    expect(unlockedRecipes(state).has('refined-petal-paste')).toBe(true)
    expect(researchStatus(state, 'research-pressing')).toBe('available')
  })

  it('runs one research at a time and refuses locked or unaffordable research', () => {
    const state = gameWith({ 'raw-daisy-petals': 10, 'raw-clover-leaves': 10 })
    applyAction(state, { type: 'research/start', researchId: 'research-grinding' })
    expect(applyAction(state, { type: 'research/start', researchId: 'research-drying' })).toEqual([
      { type: 'blocked', reason: 'research-busy' },
    ])
    expect(
      applyAction(gameWith({}), { type: 'research/start', researchId: 'research-grinding' }),
    ).toEqual([{ type: 'blocked', reason: 'missing-items' }])
    expect(
      applyAction(gameWith({}), { type: 'research/start', researchId: 'research-salves' }),
    ).toEqual([{ type: 'blocked', reason: 'locked' }])
  })

  it('finishes while the game is closed', () => {
    const state = gameWith({ 'raw-clover-leaves': 6 })
    applyAction(state, { type: 'research/start', researchId: 'research-drying' })
    advance(state, START + 3_600_000)
    expect(state.research.completed).toContain('research-drying')
  })
})

describe('crafting', () => {
  it('needs the recipe researched, to be at home and the inputs', () => {
    expect(checkCraft(gameWith({ 'raw-daisy-petals': 4 }), 'refined-petal-paste')).toBe('locked')

    const away = gameWith({ 'raw-daisy-petals': 4 }, ['research-grinding'])
    away.player.place = 'buttercup-rise'
    expect(checkCraft(away, 'refined-petal-paste')).toBe('not-home')

    expect(checkCraft(gameWith({}, ['research-grinding']), 'refined-petal-paste')).toBe(
      'missing-items',
    )
  })

  it('takes inputs at the start and delivers the result to storage when done', () => {
    const state = gameWith({ 'raw-daisy-petals': 3, 'raw-buttercup-petals': 3 }, [
      'research-grinding',
    ])
    applyAction(state, { type: 'craft/start', recipeId: 'refined-petal-paste' })
    expect(countItems(state.inventory)).toBe(2) // 4 of the 6 petals were used
    expect(state.stations.mortar.jobs).toHaveLength(1)

    advance(state, START + 5_000)
    expect(state.inventory['refined-petal-paste']).toBeUndefined()
    advance(state, START + 10_000)
    expect(state.inventory['refined-petal-paste']).toBe(1)
    expect(state.stations.mortar.jobs).toHaveLength(0)
    expect(state.stats.itemsCrafted).toBe(1)
  })

  it('runs one job per station slot', () => {
    const state = gameWith({ 'raw-daisy-petals': 20 }, ['research-grinding'])
    applyAction(state, { type: 'craft/start', recipeId: 'refined-petal-paste' })
    expect(applyAction(state, { type: 'craft/start', recipeId: 'refined-petal-paste' })).toEqual([
      { type: 'blocked', reason: 'station-busy' },
    ])
    state.stations.mortar.slots = 2
    expect(
      applyAction(state, { type: 'craft/start', recipeId: 'refined-petal-paste' })[0].type,
    ).toBe('craft-start')
  })

  it('can make a potion all the way from raw plants', () => {
    const allResearch = Object.keys(RESEARCH)
    const state = gameWith(
      { 'raw-daisy-petals': 8, 'raw-dewdrops': 2, 'raw-clover-leaves': 4 },
      allResearch,
    )
    const craft = (recipeId: string) => {
      expect(applyAction(state, { type: 'craft/start', recipeId })[0].type).toBe('craft-start')
      advance(state, state.meta.lastTickAt + 60_000)
    }
    craft('refined-petal-paste')
    craft('refined-dew-water')
    craft('refined-leaf-tea')
    craft('component-sun-salve')
    craft('potion-greenthumb-brew')
    expect(state.inventory['potion-greenthumb-brew']).toBe(1)
  })
})

describe('potions', () => {
  it('boost stats while active, then wear off', () => {
    const state = gameWith({ 'potion-greenthumb-brew': 1, 'potion-quickwing-tonic': 1 })
    applyAction(state, { type: 'potion/drink', potionId: 'potion-greenthumb-brew' })
    applyAction(state, { type: 'potion/drink', potionId: 'potion-quickwing-tonic' })
    expect(clickPower(state)).toBe(2)
    expect(wingSpeed(state)).toBe(1.5)
    expect(travelMs(state, 'home', 'dandelion-drift')).toBe(8_000)
    expect(state.inventory).toEqual({})

    advance(state, START + 3 * 60_000)
    expect(state.buffs).toEqual([])
    expect(clickPower(state)).toBe(1)
  })

  it('extend the time left when drunk again instead of stacking', () => {
    const state = gameWith({ 'potion-deep-pockets-draught': 2 })
    applyAction(state, { type: 'potion/drink', potionId: 'potion-deep-pockets-draught' })
    applyAction(state, { type: 'potion/drink', potionId: 'potion-deep-pockets-draught' })
    expect(state.buffs).toEqual([
      { potionId: 'potion-deep-pockets-draught', remainingMs: 10 * 60_000 },
    ])
    expect(satchelCapacity(state)).toBe(30)
  })

  it('make taps stronger', () => {
    const state = gameWith({ 'potion-greenthumb-brew': 1 })
    state.player.place = 'dandelion-drift'
    const spot = ensureSpot(state, 'dandelion-drift', stateRandom(state))
    spot.slots[0] = { plantId: 'plant-dandelion', hp: 3, regrowMs: 0 }
    applyAction(state, { type: 'potion/drink', potionId: 'potion-greenthumb-brew' })
    expect(tapPlant(state, 'dandelion-drift', 0, () => 0.99)[0]).toMatchObject({ hpLeft: 1 })
  })

  it('luck makes rare plants grow more often', () => {
    const count = (luckMultiplier: number) => {
      const random = stateRandom(createNewGame(START))
      let rare = 0
      for (let i = 0; i < 4000; i++) {
        if (rollPlant('buttercup-rise', random, luckMultiplier) === 'plant-four-leaf-clover') rare++
      }
      return rare
    }
    expect(count(2)).toBeGreaterThan(count(1) * 1.5)
    const state = gameWith({ 'potion-lucky-dew': 1 })
    applyAction(state, { type: 'potion/drink', potionId: 'potion-lucky-dew' })
    expect(luck(state)).toBe(2)
  })

  it("can't drink a potion you don't have", () => {
    expect(
      applyAction(gameWith({}), { type: 'potion/drink', potionId: 'potion-lucky-dew' }),
    ).toEqual([{ type: 'blocked', reason: 'missing-items' }])
  })
})
