import { describe, expect, it } from 'vitest'
import { ITEM_VALUES, SHOP_RULES } from '../src/data/economy'
import { PLANTS } from '../src/data/plants'
import { SETTLEMENTS } from '../src/data/world'
import { applyAction } from '../src/engine/actions'
import { buyPrice, sellPrice, shopStock } from '../src/engine/shop'
import { createNewGame, type GameState } from '../src/engine/state'

const START = 1_700_000_000_000

function atThimblewick(): GameState {
  const state = createNewGame(START)
  state.player.place = 'thimblewick'
  state.resources.glimmers = 100
  return state
}

describe('settlement shops', () => {
  it('every settlement has a shop selling only common goods of its own region', () => {
    for (const settlement of Object.values(SETTLEMENTS)) {
      const stock = shopStock(settlement.id)
      expect(stock.length, settlement.id).toBeGreaterThan(0)
      for (const itemId of stock) {
        const source = Object.values(PLANTS).find((p) => p.yields.some((y) => y.itemId === itemId))
        expect(source?.rarity, itemId).toBe('common')
      }
    }
    expect(shopStock('thimblewick')).toEqual(
      expect.arrayContaining(['raw-clover-leaves', 'raw-daisy-petals', 'raw-dandelion-fluff']),
    )
    expect(shopStock('thimblewick')).not.toContain('raw-lucky-leaf')
    expect(shopStock('thimblewick')).not.toContain('raw-moss-tufts')
    expect(shopStock('toad-village')).toContain('raw-reed-stalks')
  })

  it('buys into the satchel, within its space and your Glimmers', () => {
    const state = atThimblewick()
    const price = buyPrice('raw-daisy-petals')
    expect(price).toBe(Math.ceil(ITEM_VALUES['raw-daisy-petals'] * SHOP_RULES.buyRate))
    applyAction(state, { type: 'shop/buy', itemId: 'raw-daisy-petals', amount: 5 })
    expect(state.player.satchel['raw-daisy-petals']).toBe(5)
    expect(state.resources.glimmers).toBe(100 - price * 5)
    state.player.satchel = { 'raw-clover-leaves': 18 }
    expect(applyAction(state, { type: 'shop/buy', itemId: 'raw-daisy-petals', amount: 5 })).toEqual(
      [{ type: 'blocked', reason: 'satchel-full' }],
    )
    state.player.satchel = {}
    state.resources.glimmers = 0
    expect(applyAction(state, { type: 'shop/buy', itemId: 'raw-daisy-petals', amount: 1 })).toEqual(
      [{ type: 'blocked', reason: 'missing-glimmers' }],
    )
  })

  it("won't sell things from other regions, or anything rare", () => {
    const state = atThimblewick()
    for (const itemId of ['raw-moss-tufts', 'raw-lucky-leaf', 'refined-petal-paste']) {
      expect(applyAction(state, { type: 'shop/buy', itemId, amount: 1 })).toEqual([
        { type: 'blocked', reason: 'locked' },
      ])
    }
  })

  it('buys anything you carry, at half its worth (trinkets too)', () => {
    const state = atThimblewick()
    state.player.satchel = { 'raw-golden-caps': 2, 'potion-lucky-dew': 1, 'trinket-thimble': 1 }
    applyAction(state, { type: 'shop/sell', itemId: 'raw-golden-caps', amount: 2 })
    applyAction(state, { type: 'shop/sell', itemId: 'potion-lucky-dew', amount: 1 })
    applyAction(state, { type: 'shop/sell', itemId: 'trinket-thimble', amount: 1 })
    expect(state.player.satchel).toEqual({})
    expect(sellPrice('raw-golden-caps')).toBe(Math.floor(ITEM_VALUES['raw-golden-caps'] / 2))
    expect(state.resources.glimmers).toBe(
      100 +
        sellPrice('raw-golden-caps') * 2 +
        sellPrice('potion-lucky-dew') +
        SHOP_RULES.trinketValue * SHOP_RULES.sellRate,
    )
  })

  it('only trades at a settlement, and not more than you carry', () => {
    const state = atThimblewick()
    state.player.satchel = { 'raw-daisy-petals': 2 }
    expect(
      applyAction(state, { type: 'shop/sell', itemId: 'raw-daisy-petals', amount: 3 }),
    ).toEqual([{ type: 'blocked', reason: 'missing-items' }])
    state.player.place = 'buttercup-rise'
    expect(
      applyAction(state, { type: 'shop/sell', itemId: 'raw-daisy-petals', amount: 1 }),
    ).toEqual([{ type: 'blocked', reason: 'not-here' }])
  })

  it('selling is always worse than buying, so you cannot loop for profit', () => {
    for (const settlement of Object.values(SETTLEMENTS)) {
      for (const itemId of shopStock(settlement.id)) {
        expect(sellPrice(itemId)).toBeLessThan(buyPrice(itemId))
      }
    }
  })
})
