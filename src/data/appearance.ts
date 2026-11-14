/**
 * Character appearance and outfits (design doc 3.13). Shapes are separate drawings; colors are
 * chosen from curated palettes so every combination stays in the soft storybook style (7.3).
 */

export type Body = 'female' | 'male'
export type WingShape = 'butterfly' | 'dragonfly' | 'moth' | 'petal'
export type HairStyle = 'bob' | 'long' | 'pigtails' | 'tufts' | 'curls' | 'bun'
export type EyeShape = 'round' | 'sparkle' | 'sleepy'
export type OutfitSlot = 'headpiece' | 'outfit' | 'shoes' | 'accessory'

export interface CharacterLook {
  body: Body
  skin: string
  hair: HairStyle
  hairColor: string
  eyes: EyeShape
  eyeColor: string
  wings: WingShape
  wingColor: string
}

export const BODIES: readonly { id: Body; name: string }[] = [
  { id: 'female', name: 'Female' },
  { id: 'male', name: 'Male' },
]

export const WING_SHAPES: readonly { id: WingShape; name: string }[] = [
  { id: 'butterfly', name: 'Butterfly' },
  { id: 'dragonfly', name: 'Dragonfly' },
  { id: 'moth', name: 'Moth' },
  { id: 'petal', name: 'Petal' },
]

export const HAIR_STYLES: readonly { id: HairStyle; name: string }[] = [
  { id: 'bob', name: 'Bob' },
  { id: 'long', name: 'Long' },
  { id: 'pigtails', name: 'Pigtails' },
  { id: 'tufts', name: 'Tufts' },
  { id: 'curls', name: 'Curls' },
  { id: 'bun', name: 'Bun' },
]

export const EYE_SHAPES: readonly { id: EyeShape; name: string }[] = [
  { id: 'round', name: 'Round' },
  { id: 'sparkle', name: 'Sparkly' },
  { id: 'sleepy', name: 'Sleepy' },
]

/** A broad, inclusive range, plus fantasy tones (design doc 3.13). */
export const SKIN_TONES: readonly string[] = [
  '#ffe8d9',
  '#f9d4bb',
  '#eab894',
  '#d49a6f',
  '#b07650',
  '#8a5639',
  '#5e3a26',
  '#d8d0f5',
  '#cdeedb',
  '#d5e9fb',
]

export const HAIR_COLORS: readonly string[] = [
  '#f2b45c',
  '#f6dc8c',
  '#9a5b34',
  '#5a3a2a',
  '#2e2430',
  '#c9564b',
  '#f7b7c8',
  '#b9a3e8',
  '#8cd3c4',
  '#f3f0f7',
]

export const EYE_COLORS: readonly string[] = [
  '#6b4e71',
  '#3f5f8f',
  '#3f7a55',
  '#7a4a2a',
  '#2e2430',
  '#a0527c',
  '#3d8f94',
  '#8a6a2a',
]

export const WING_COLORS: readonly string[] = [
  '#e9ddff',
  '#d5ecff',
  '#ffe0ec',
  '#dff5d8',
  '#fff1c4',
  '#c9f0ec',
  '#f5d0fe',
  '#ffffff',
]

/** Outfit colors: soft pastels plus a few richer storybook tones. */
export const OUTFIT_COLORS: readonly string[] = [
  '#f7b7c8',
  '#cdbbf5',
  '#b9e3c6',
  '#a9d4f5',
  '#ffe59e',
  '#f8c99b',
  '#ffffff',
  '#d98aa2',
  '#7c5cff',
  '#4f8a4a',
  '#3f6fb0',
  '#c97a3a',
]

export const DEFAULT_LOOK: CharacterLook = {
  body: 'female',
  skin: SKIN_TONES[1],
  hair: 'bob',
  hairColor: HAIR_COLORS[0],
  eyes: 'round',
  eyeColor: EYE_COLORS[0],
  wings: 'butterfly',
  wingColor: WING_COLORS[0],
}

export interface OutfitPiece {
  id: string
  name: string
  slot: OutfitSlot
  /** The color it comes in before you recolor it. */
  color: string
}

export const OUTFIT_PIECES: Readonly<Record<string, OutfitPiece>> = {
  'piece-flower-crown': {
    id: 'piece-flower-crown',
    name: 'Flower crown',
    slot: 'headpiece',
    color: '#f7b7c8',
  },
  'piece-petal-dress': {
    id: 'piece-petal-dress',
    name: 'Petal dress',
    slot: 'outfit',
    color: '#f7b7c8',
  },
  'piece-petal-tunic': {
    id: 'piece-petal-tunic',
    name: 'Petal tunic',
    slot: 'outfit',
    color: '#b9e3c6',
  },
  'piece-leaf-slippers': {
    id: 'piece-leaf-slippers',
    name: 'Leaf slippers',
    slot: 'shoes',
    color: '#8cc084',
  },
  'piece-small-satchel': {
    id: 'piece-small-satchel',
    name: 'Small satchel',
    slot: 'accessory',
    color: '#c97a3a',
  },
  'piece-dewdrop-circlet': {
    id: 'piece-dewdrop-circlet',
    name: 'Dewdrop circlet',
    slot: 'headpiece',
    color: '#a9d4f5',
  },
  'piece-dewdrop-gown': {
    id: 'piece-dewdrop-gown',
    name: 'Dewdrop gown',
    slot: 'outfit',
    color: '#a9d4f5',
  },
  'piece-dewdrop-cloak': {
    id: 'piece-dewdrop-cloak',
    name: 'Dewdrop cloak',
    slot: 'outfit',
    color: '#a9d4f5',
  },
  'piece-moss-robe': {
    id: 'piece-moss-robe',
    name: "Scholar's moss robe",
    slot: 'outfit',
    color: '#6f9a5b',
  },
  'piece-reading-glasses': {
    id: 'piece-reading-glasses',
    name: 'Reading glasses',
    slot: 'accessory',
    color: '#b08a3e',
  },
  'piece-acorn-cap': {
    id: 'piece-acorn-cap',
    name: 'Acorn cap',
    slot: 'headpiece',
    color: '#9b6a3c',
  },
  'piece-leaf-cloak': {
    id: 'piece-leaf-cloak',
    name: 'Leaf cloak',
    slot: 'outfit',
    color: '#c9832f',
  },
  'piece-lantern-bug-cloak': {
    id: 'piece-lantern-bug-cloak',
    name: 'Lantern-bug cloak',
    slot: 'outfit',
    color: '#3f5f6e',
  },
  'piece-lily-pad-hat': {
    id: 'piece-lily-pad-hat',
    name: 'Lily-pad hat',
    slot: 'headpiece',
    color: '#6fae5f',
  },
  'piece-honeycomb-crown': {
    id: 'piece-honeycomb-crown',
    name: 'Honeycomb crown',
    slot: 'headpiece',
    color: '#f2b23a',
  },
  'piece-honeycomb-gown': {
    id: 'piece-honeycomb-gown',
    name: 'Honeycomb gown',
    slot: 'outfit',
    color: '#f2c94f',
  },
  'piece-honeycomb-doublet': {
    id: 'piece-honeycomb-doublet',
    name: 'Honeycomb doublet',
    slot: 'outfit',
    color: '#f2c94f',
  },
  'piece-burrowers-waistcoat': {
    id: 'piece-burrowers-waistcoat',
    name: "Burrower's waistcoat",
    slot: 'outfit',
    color: '#8a6a44',
  },
  'piece-crystal-diadem': {
    id: 'piece-crystal-diadem',
    name: 'Crystal diadem',
    slot: 'headpiece',
    color: '#8ee0f0',
  },
  'piece-geode-mantle': {
    id: 'piece-geode-mantle',
    name: 'Geode mantle',
    slot: 'outfit',
    color: '#7a5aa8',
  },
  'piece-miners-overalls': {
    id: 'piece-miners-overalls',
    name: "Miner's overalls",
    slot: 'outfit',
    color: '#4a6e9a',
  },
  'piece-lamp-helmet': {
    id: 'piece-lamp-helmet',
    name: 'Lamp helmet',
    slot: 'headpiece',
    color: '#f2c94f',
  },
}

export interface OutfitSet {
  id: string
  name: string
  pieces: string[]
}

/** Every new fairy owns the starter set. */
export const STARTER_SET = 'outfit-starter'

export const OUTFIT_SETS: Readonly<Record<string, OutfitSet>> = {
  [STARTER_SET]: {
    id: STARTER_SET,
    name: 'Starter set',
    pieces: [
      'piece-flower-crown',
      'piece-petal-dress',
      'piece-petal-tunic',
      'piece-leaf-slippers',
      'piece-small-satchel',
    ],
  },
  'outfit-dewdrop': {
    id: 'outfit-dewdrop',
    name: 'Dewdrop set',
    pieces: ['piece-dewdrop-circlet', 'piece-dewdrop-gown', 'piece-dewdrop-cloak'],
  },
  'outfit-scholar': {
    id: 'outfit-scholar',
    name: "Scholar's set",
    pieces: ['piece-moss-robe', 'piece-reading-glasses'],
  },
  'outfit-acorn': {
    id: 'outfit-acorn',
    name: 'Acorn set',
    pieces: ['piece-acorn-cap', 'piece-leaf-cloak'],
  },
  'outfit-lantern-bug': {
    id: 'outfit-lantern-bug',
    name: 'Lantern-Bug set',
    pieces: ['piece-lantern-bug-cloak', 'piece-lily-pad-hat'],
  },
  'outfit-honeycomb': {
    id: 'outfit-honeycomb',
    name: 'Honeycomb set',
    pieces: ['piece-honeycomb-crown', 'piece-honeycomb-gown', 'piece-honeycomb-doublet'],
  },
  'outfit-burrower': {
    id: 'outfit-burrower',
    name: "Burrower's set",
    pieces: ['piece-burrowers-waistcoat'],
  },
  'outfit-crystal': {
    id: 'outfit-crystal',
    name: 'Crystal set',
    pieces: ['piece-crystal-diadem', 'piece-geode-mantle'],
  },
  'outfit-miner': {
    id: 'outfit-miner',
    name: "Miner's set",
    pieces: ['piece-miners-overalls', 'piece-lamp-helmet'],
  },
}

export const SLOTS: readonly { id: OutfitSlot; name: string }[] = [
  { id: 'headpiece', name: 'Headpiece' },
  { id: 'outfit', name: 'Outfit' },
  { id: 'shoes', name: 'Shoes' },
  { id: 'accessory', name: 'Accessory' },
]

export interface Worn {
  pieceId: string | null
  color: string
}

export type Wardrobe = Record<OutfitSlot, Worn>

export function defaultWardrobe(body: Body): Wardrobe {
  const outfit = body === 'male' ? 'piece-petal-tunic' : 'piece-petal-dress'
  return {
    headpiece: { pieceId: 'piece-flower-crown', color: OUTFIT_PIECES['piece-flower-crown'].color },
    outfit: { pieceId: outfit, color: OUTFIT_PIECES[outfit].color },
    shoes: { pieceId: 'piece-leaf-slippers', color: OUTFIT_PIECES['piece-leaf-slippers'].color },
    accessory: {
      pieceId: 'piece-small-satchel',
      color: OUTFIT_PIECES['piece-small-satchel'].color,
    },
  }
}
