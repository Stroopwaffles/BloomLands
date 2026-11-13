import { describe, expect, it } from 'vitest'
import { ITEM_VALUES, TRADER_RULES } from '../src/data/economy'
import { ITEMS } from '../src/data/items'
import { PLANTS } from '../src/data/plants'
import { RECIPES } from '../src/data/recipes'
import { UPGRADES } from '../src/data/upgrades'
import { applyAction } from '../src/engine/actions'
import { payingStock } from '../src/engine/costs'
import { ensureSpot } from '../src/engine/gathering'
import {
  clickPower,
  courtPoints,
  courtRank,
  satchelCapacity,
  stationBuilt,
  storageCapacity,
  trinketCount,
  wingSpeed,
} from '../src/engine/modifiers'
import { stateRandom } from '../src/engine/rng'
import { countItems, createNewGame, type GameState } from '../src/engine/state'
import { advance } from '../src/engine/tick'
import { makeRequest, requestableItems } from '../src/engine/traders'

const START = 1_700_000_000_000

function home(overrides: Partial<Pick<GameState, 'inventory' | 'upgrades'>> = {}): GameState {
  const state = createNewGame(START)
  Object.assign(state, overrides)
  return state
}

describe('data', () => {
  it('prices every raw material and craftable item', () => {
    for (const plant of Object.values(PLANTS)) {
      for (const y of plant.yields) expect(ITEM_VALUES[y.itemId], y.itemId).toBeGreaterThan(0)
    }
    for (const recipe of Object.values(RECIPES)) {
      expect(ITEM_VALUES[recipe.output.itemId], recipe.id).toBeGreaterThan(0)
    }
  })

  it('only requires upgrades that exist', () => {
    for (const upgrade of Object.values(UPGRADES)) {
      for (const req of upgrade.requires) expect(UPGRADES[req], upgrade.id).toBeDefined()
    }
  })
})

describe('traders', () => {
  it('arrive after a while, up to the request limit', () => {
    const state = home()
    advance(state, START + 4_000)
    expect(state.traders.requests).toHaveLength(0)
    advance(state, START + TRADER_RULES.firstArrivalMs)
    expect(state.traders.requests).toHaveLength(1)
    advance(state, START + TRADER_RULES.firstArrivalMs + 60 * 60_000)
    expect(state.traders.requests.length).toBeLessThanOrEqual(TRADER_RULES.maxRequests)
  })

  it('leave when a request expires', () => {
    const state = home()
    state.traders.requests.push({ ...makeRequest(state, stateRandom(state)), remainingMs: 1000 })
    state.traders.nextArrivalMs = 10 * 60_000
    advance(state, START + 1000)
    expect(state.traders.requests).toHaveLength(0)
  })

  it('only ask for raw plants until you can craft something', () => {
    const state = home()
    for (const id of requestableItems(state)) expect(ITEMS[id].category).toBe('raw')
    state.research.completed.push('research-grinding')
    expect(requestableItems(state)).toContain('refined-petal-paste')
  })

  it("don't ask for crafted items whose station isn't built", () => {
    const state = home()
    state.research.completed.push('research-pressing')
    expect(requestableItems(state)).not.toContain('refined-berry-juice')
    state.upgrades.push('lodging-press')
    expect(requestableItems(state)).toContain('refined-berry-juice')
  })

  it('pay more than the items are worth', () => {
    const state = home()
    const random = stateRandom(state)
    for (let i = 0; i < 50; i++) {
      const request = makeRequest(state, random)
      const value = request.wants.reduce((s, w) => s + ITEM_VALUES[w.itemId] * w.amount, 0)
      expect(request.glimmers).toBe(Math.round(value * TRADER_RULES.rewardMultiplier))
      expect(request.wants.length).toBeGreaterThan(0)
    }
  })

  it('take the items and pay glimmers (and sometimes a trinket)', () => {
    const state = home({ inventory: { 'raw-daisy-petals': 10 } })
    state.traders.requests.push({
      id: 7,
      traderId: 'trader-snail-peddler',
      wants: [{ itemId: 'raw-daisy-petals', amount: 6 }],
      glimmers: 18,
      trinketId: 'trinket-thimble',
      remainingMs: 60_000,
    })
    expect(applyAction(state, { type: 'trade/fulfill', requestId: 7 })).toEqual([
      { type: 'trade-filled', requestId: 7, glimmers: 18, trinketId: 'trinket-thimble' },
    ])
    expect(state.resources.glimmers).toBe(18)
    expect(state.inventory).toEqual({ 'raw-daisy-petals': 4, 'trinket-thimble': 1 })
    expect(state.traders.requests).toHaveLength(0)
    expect(state.stats.requestsFilled).toBe(1)
  })

  it("refuse when you're short, and can be sent away", () => {
    const state = home()
    state.traders.requests.push(makeRequest(state, stateRandom(state)))
    const id = state.traders.requests[0].id
    expect(applyAction(state, { type: 'trade/fulfill', requestId: id })[0]).toMatchObject({
      reason: 'missing-items',
    })
    applyAction(state, { type: 'trade/dismiss', requestId: id })
    expect(state.traders.requests).toHaveLength(0)
  })
})

describe('upgrades', () => {
  it('cost glimmers and items, and need their requirements', () => {
    const state = home({ inventory: { 'raw-daisy-petals': 10 } })
    expect(
      applyAction(state, { type: 'upgrade/buy', upgradeId: 'lodging-press' })[0],
    ).toMatchObject({ reason: 'missing-glimmers' })
    state.resources.glimmers = 100
    expect(applyAction(state, { type: 'upgrade/buy', upgradeId: 'lodging-press' })[0].type).toBe(
      'upgrade-bought',
    )
    expect(state.resources.glimmers).toBe(60)
    expect(state.inventory).toEqual({})
    expect(stationBuilt(state, 'press')).toBe(true)
    expect(
      applyAction(state, { type: 'upgrade/buy', upgradeId: 'lodging-press' })[0],
    ).toMatchObject({ reason: 'already-done' })
    expect(
      applyAction(state, { type: 'upgrade/buy', upgradeId: 'lodging-storeroom-2' })[0],
    ).toMatchObject({ reason: 'locked' })
  })

  it('spend trinkets of any kind', () => {
    const state = home({
      upgrades: ['gear-gloves-1'],
      inventory: { 'trinket-thimble': 1, 'trinket-glass-bead': 1 },
    })
    state.resources.glimmers = 500
    expect(trinketCount(state)).toBe(2)
    applyAction(state, { type: 'upgrade/buy', upgradeId: 'gear-gloves-2' })
    expect(trinketCount(state)).toBe(1)
  })

  it('improve stats', () => {
    const state = home({
      upgrades: ['gear-gloves-1', 'gear-satchel-1', 'gear-wings-1', 'lodging-storeroom-1'],
    })
    expect(clickPower(state)).toBe(2)
    expect(satchelCapacity(state)).toBe(30)
    expect(wingSpeed(state)).toBe(1.25)
    expect(storageCapacity(state)).toBe(250)
  })

  it('grow the court through its ranks', () => {
    const state = home()
    expect(courtRank(state)).toBe(0)
    state.resources.glimmers = 10_000
    state.inventory = { 'raw-daisy-petals': 20, 'raw-dandelion-fluff': 20, 'raw-clover-leaves': 20 }
    applyAction(state, { type: 'upgrade/buy', upgradeId: 'lodging-press' })
    applyAction(state, { type: 'upgrade/buy', upgradeId: 'lodging-spinning-wheel' })
    expect(courtPoints(state)).toBe(4)
    const [event] = applyAction(state, { type: 'upgrade/buy', upgradeId: 'lodging-storeroom-1' })
    expect(event).toMatchObject({ type: 'upgrade-bought', rankUp: false })
    const [rankUp] = applyAction(state, { type: 'upgrade/buy', upgradeId: 'lodging-cauldron' })
    expect(rankUp).toMatchObject({ rankUp: true })
    expect(courtRank(state)).toBe(1)
  })
})

describe('storage', () => {
  it('only takes what fits; trinkets take no space', () => {
    const state = home({ inventory: { 'raw-clover-leaves': 145 } })
    state.player.satchel = { 'raw-daisy-petals': 10, 'trinket-thimble': 1 }
    const [event] = applyAction(state, { type: 'satchel/deposit' })
    expect(event).toMatchObject({ type: 'deposit', leftOver: 5 })
    expect(state.inventory['raw-daisy-petals']).toBe(5)
    expect(state.inventory['trinket-thimble']).toBe(1)
    expect(state.player.satchel).toEqual({ 'raw-daisy-petals': 5 })
    expect(applyAction(state, { type: 'satchel/deposit' })).toEqual([
      { type: 'blocked', reason: 'storage-full' },
    ])
  })
})

describe('comforts', () => {
  function fullAtSpot(upgrades: string[]): GameState {
    const state = home({ upgrades })
    state.player.place = 'buttercup-rise'
    state.player.lastSpot = 'buttercup-rise'
    const spot = ensureSpot(state, 'buttercup-rise', stateRandom(state))
    spot.slots[0] = { plantId: 'plant-clover', hp: 1, regrowMs: 0 }
    state.player.satchel = { 'raw-daisy-petals': 19 }
    return state
  }

  it('Homing Instinct flies home when the satchel fills', () => {
    const state = fullAtSpot(['qol-auto-return'])
    const events = applyAction(state, { type: 'gather/tap', spotId: 'buttercup-rise', slot: 0 })
    expect(events.map((e) => e.type)).toEqual(['harvest', 'depart'])
    expect(state.player.travel).toMatchObject({ to: 'home', auto: true })
  })

  it('without it, the player stays put', () => {
    const state = fullAtSpot([])
    applyAction(state, { type: 'gather/tap', spotId: 'buttercup-rise', slot: 0 })
    expect(state.player.travel).toBeNull()
  })

  it('Tidy Habits unpacks on arrival, and Round Trips flies back', () => {
    const state = fullAtSpot(['qol-auto-return', 'qol-auto-deposit', 'qol-return-trip'])
    applyAction(state, { type: 'gather/tap', spotId: 'buttercup-rise', slot: 0 })
    advance(state, START + 8_000)
    expect(state.player.place).toBe('home')
    expect(countItems(state.player.satchel)).toBe(0)
    expect(state.inventory['raw-daisy-petals']).toBe(19)
    expect(state.player.travel).toMatchObject({ to: 'buttercup-rise' })
  })

  it('Round Trips only follows automatic trips home', () => {
    const state = home({ upgrades: ['qol-auto-return', 'qol-auto-deposit', 'qol-return-trip'] })
    state.player.lastSpot = 'buttercup-rise'
    state.player.place = 'buttercup-rise'
    applyAction(state, { type: 'travel/go', to: 'home' })
    advance(state, START + 8_000)
    expect(state.player.travel).toBeNull()
  })

  it('Big Batches crafts five at once', () => {
    const state = home({ inventory: { 'raw-daisy-petals': 20 } })
    state.research.completed.push('research-grinding')
    expect(
      applyAction(state, { type: 'craft/start', recipeId: 'refined-petal-paste', count: 5 })[0],
    ).toMatchObject({ reason: 'locked' })
    state.upgrades.push('qol-bulk-craft')
    applyAction(state, { type: 'craft/start', recipeId: 'refined-petal-paste', count: 5 })
    expect(state.inventory).toEqual({})
    expect(state.stations.mortar.jobs[0]).toMatchObject({ count: 5, totalMs: 50_000 })
    advance(state, START + 50_000)
    expect(state.inventory['refined-petal-paste']).toBe(5)
  })
})

describe('paying from the satchel', () => {
  it('research, upgrades and trades use the satchel first, then storage', () => {
    const research = home({ inventory: { 'raw-daisy-petals': 4 } })
    research.player.satchel = { 'raw-buttercup-petals': 3 }
    applyAction(research, { type: 'research/start', researchId: 'research-grinding' })
    expect(research.player.satchel).toEqual({})
    expect(research.inventory).toEqual({ 'raw-daisy-petals': 1 })

    const upgrade = home({ inventory: { 'raw-daisy-petals': 10 } })
    upgrade.resources.glimmers = 100
    upgrade.player.satchel = { 'raw-buttercup-petals': 4 }
    applyAction(upgrade, { type: 'upgrade/buy', upgradeId: 'lodging-press' })
    expect(upgrade.player.satchel).toEqual({})
    expect(upgrade.inventory).toEqual({ 'raw-daisy-petals': 4 })

    const trade = home()
    trade.player.satchel = { 'raw-daisy-petals': 6 }
    trade.traders.requests.push({
      id: 1,
      traderId: 'trader-snail-peddler',
      wants: [{ itemId: 'raw-daisy-petals', amount: 6 }],
      glimmers: 18,
      trinketId: null,
      remainingMs: 60_000,
    })
    expect(applyAction(trade, { type: 'trade/fulfill', requestId: 1 })[0].type).toBe('trade-filled')
    expect(trade.player.satchel).toEqual({})
  })

  it('a locked satchel is left alone; costs use storage only', () => {
    const state = home({ inventory: { 'raw-daisy-petals': 4 } })
    state.player.satchel = { 'raw-buttercup-petals': 6 }
    applyAction(state, { type: 'satchel/setLocked', locked: true })
    expect(payingStock(state)).toEqual({ 'raw-daisy-petals': 4 })

    state.research.completed.push('research-grinding')
    applyAction(state, { type: 'craft/start', recipeId: 'refined-petal-paste' })
    expect(state.player.satchel).toEqual({ 'raw-buttercup-petals': 6 })
    expect(state.inventory).toEqual({})

    // With only the satchel holding enough, a locked satchel can't pay.
    expect(applyAction(state, { type: 'research/start', researchId: 'research-drying' })).toEqual([
      { type: 'blocked', reason: 'missing-items' },
    ])
    applyAction(state, { type: 'satchel/setLocked', locked: false })
    expect(payingStock(state)).toEqual({ 'raw-buttercup-petals': 6 })
  })
})
