import { describe, expect, it } from 'vitest'
import {
  DEFAULT_LOOK,
  OUTFIT_COLORS,
  OUTFIT_PIECES,
  OUTFIT_SETS,
  SKIN_TONES,
} from '../src/data/appearance'
import { applyAction } from '../src/engine/actions'
import { ownedPieces } from '../src/engine/character'
import { deserialize, serialize } from '../src/engine/save'
import { createNewGame } from '../src/engine/state'

const START = 1_700_000_000_000

describe('outfit data', () => {
  it('only lists pieces that exist', () => {
    for (const set of Object.values(OUTFIT_SETS)) {
      for (const id of set.pieces) expect(OUTFIT_PIECES[id], set.id).toBeDefined()
    }
  })
})

describe('the character', () => {
  it('starts with a default look and the starter outfit, not yet created', () => {
    const state = createNewGame(START)
    expect(state.character.created).toBe(false)
    expect(state.character.look).toEqual(DEFAULT_LOOK)
    expect(state.character.wardrobe.outfit.pieceId).toBe('piece-petal-dress')
  })

  it('can change its look, but only to offered choices', () => {
    const state = createNewGame(START)
    applyAction(state, { type: 'character/look', patch: { body: 'male', hair: 'curls' } })
    expect(state.character.look.body).toBe('male')
    expect(state.character.look.hair).toBe('curls')
    applyAction(state, { type: 'character/look', patch: { skin: SKIN_TONES[8] } })
    expect(state.character.look.skin).toBe(SKIN_TONES[8])
    expect(applyAction(state, { type: 'character/look', patch: { skin: '#123456' } })).toEqual([
      { type: 'blocked', reason: 'locked' },
    ])
    expect(state.character.look.skin).toBe(SKIN_TONES[8])
  })

  it('finishing the creator is remembered in the save', () => {
    const state = createNewGame(START)
    applyAction(state, { type: 'character/finish' })
    expect(deserialize(serialize(state, START)).character.created).toBe(true)
  })
})

describe('the wardrobe', () => {
  it('owns the starter set, and unlocked sets', () => {
    const state = createNewGame(START)
    expect(ownedPieces(state)).toContain('piece-petal-tunic')
    expect(ownedPieces(state)).not.toContain('piece-dewdrop-gown')
    state.outfits.push('outfit-dewdrop')
    expect(ownedPieces(state)).toContain('piece-dewdrop-gown')
  })

  it('wears owned pieces in the right slot, in their own color', () => {
    const state = createNewGame(START)
    applyAction(state, { type: 'wardrobe/equip', slot: 'outfit', pieceId: 'piece-petal-tunic' })
    expect(state.character.wardrobe.outfit).toEqual({
      pieceId: 'piece-petal-tunic',
      color: OUTFIT_PIECES['piece-petal-tunic'].color,
    })
    expect(
      applyAction(state, { type: 'wardrobe/equip', slot: 'shoes', pieceId: 'piece-petal-tunic' }),
    ).toEqual([{ type: 'blocked', reason: 'locked' }])
    expect(
      applyAction(state, { type: 'wardrobe/equip', slot: 'outfit', pieceId: 'piece-dewdrop-gown' }),
    ).toEqual([{ type: 'blocked', reason: 'locked' }])
  })

  it('can take a piece off and recolor what is worn', () => {
    const state = createNewGame(START)
    applyAction(state, { type: 'wardrobe/equip', slot: 'headpiece', pieceId: null })
    expect(state.character.wardrobe.headpiece.pieceId).toBeNull()
    applyAction(state, { type: 'wardrobe/recolor', slot: 'outfit', color: OUTFIT_COLORS[8] })
    expect(state.character.wardrobe.outfit.color).toBe(OUTFIT_COLORS[8])
    expect(applyAction(state, { type: 'wardrobe/recolor', slot: 'outfit', color: 'red' })).toEqual([
      { type: 'blocked', reason: 'locked' },
    ])
  })
})
