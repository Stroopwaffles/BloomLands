import {
  BODIES,
  EYE_COLORS,
  EYE_SHAPES,
  HAIR_COLORS,
  HAIR_STYLES,
  OUTFIT_COLORS,
  OUTFIT_PIECES,
  OUTFIT_SETS,
  SKIN_TONES,
  STARTER_SET,
  WING_COLORS,
  WING_SHAPES,
  type CharacterLook,
  type OutfitSlot,
} from '../data/appearance'
import type { GameEvent } from './events'
import type { GameState } from './state'

/**
 * Character appearance and wardrobe (design doc 3.13). Outfits are cosmetic only. Unlocked outfits
 * are kept forever.
 */

const CHOICES: { [K in keyof CharacterLook]: readonly string[] } = {
  body: BODIES.map((b) => b.id),
  skin: SKIN_TONES,
  hair: HAIR_STYLES.map((h) => h.id),
  hairColor: HAIR_COLORS,
  eyes: EYE_SHAPES.map((e) => e.id),
  eyeColor: EYE_COLORS,
  wings: WING_SHAPES.map((w) => w.id),
  wingColor: WING_COLORS,
}

/** Changes part of the fairy's look. Only values from the offered choices are accepted. */
export function setLook(state: GameState, patch: Partial<CharacterLook>): GameEvent[] {
  for (const [key, value] of Object.entries(patch) as [keyof CharacterLook, string][]) {
    if (!CHOICES[key]?.includes(value)) return [{ type: 'blocked', reason: 'locked' }]
  }
  Object.assign(state.character.look, patch)
  return []
}

/** Finishes the character creator. */
export function finishCreating(state: GameState): GameEvent[] {
  state.character.created = true
  return []
}

/** Every outfit piece the player owns (the starter set plus unlocked sets). */
export function ownedPieces(state: GameState): string[] {
  const sets = [STARTER_SET, ...state.outfits]
  return [...new Set(sets.flatMap((id) => OUTFIT_SETS[id]?.pieces ?? []))]
}

/** Wears a piece (or takes the slot off with null). It comes in its own color. */
export function equipPiece(
  state: GameState,
  slot: OutfitSlot,
  pieceId: string | null,
): GameEvent[] {
  if (pieceId !== null) {
    const piece = OUTFIT_PIECES[pieceId]
    if (!piece || piece.slot !== slot || !ownedPieces(state).includes(pieceId)) {
      return [{ type: 'blocked', reason: 'locked' }]
    }
    state.character.wardrobe[slot] = { pieceId, color: piece.color }
  } else {
    state.character.wardrobe[slot] = { ...state.character.wardrobe[slot], pieceId: null }
  }
  return []
}

/** Recolors whatever is worn in a slot. */
export function recolorSlot(state: GameState, slot: OutfitSlot, color: string): GameEvent[] {
  if (!OUTFIT_COLORS.includes(color)) return [{ type: 'blocked', reason: 'locked' }]
  state.character.wardrobe[slot].color = color
  return []
}
