import type { PotionDef, RecipeDef, StationDef, StationId } from './types'

/** Home stations (content doc → Recipe Tree → Stations). The ritual circle arrives with M6. */
export const STATIONS: Readonly<Record<StationId, StationDef>> = {
  mortar: { id: 'mortar', name: 'Mortar', verb: 'Grind' },
  press: { id: 'press', name: 'Press', verb: 'Press' },
  'drying-rack': { id: 'drying-rack', name: 'Drying Rack', verb: 'Dry' },
  'spinning-wheel': { id: 'spinning-wheel', name: 'Spinning Wheel', verb: 'Spin' },
  cauldron: { id: 'cauldron', name: 'Cauldron', verb: 'Brew' },
}

export const STATION_ORDER: readonly StationId[] = [
  'mortar',
  'press',
  'drying-rack',
  'spinning-wheel',
  'cauldron',
]

const SEC = 1000

/** Meadow recipes. Amounts and times are starting values for balancing. */
const RECIPE_LIST: RecipeDef[] = [
  // Refining (one raw input type → one refined material)
  {
    id: 'refined-petal-paste',
    station: 'mortar',
    inputs: [{ tag: 'petals', amount: 4 }],
    output: { itemId: 'refined-petal-paste', amount: 1 },
    durationMs: 10 * SEC,
  },
  {
    id: 'refined-leaf-tea',
    station: 'drying-rack',
    inputs: [{ tag: 'leaves', amount: 4 }],
    output: { itemId: 'refined-leaf-tea', amount: 1 },
    durationMs: 10 * SEC,
  },
  {
    id: 'refined-berry-juice',
    station: 'press',
    inputs: [{ tag: 'fruit', amount: 3 }],
    output: { itemId: 'refined-berry-juice', amount: 1 },
    durationMs: 12 * SEC,
  },
  {
    id: 'refined-dew-water',
    station: 'press',
    inputs: [{ itemId: 'raw-dewdrops', amount: 2 }],
    output: { itemId: 'refined-dew-water', amount: 1 },
    durationMs: 8 * SEC,
  },
  {
    id: 'refined-fluff-thread',
    station: 'spinning-wheel',
    inputs: [{ tag: 'fluff', amount: 4 }],
    output: { itemId: 'refined-fluff-thread', amount: 1 },
    durationMs: 12 * SEC,
  },
  {
    id: 'refined-lucky-essence',
    station: 'drying-rack',
    inputs: [{ itemId: 'raw-lucky-leaf', amount: 1 }],
    output: { itemId: 'refined-lucky-essence', amount: 1 },
    durationMs: 20 * SEC,
  },

  // Components (combined in the cauldron)
  {
    id: 'component-sun-salve',
    station: 'cauldron',
    inputs: [
      { itemId: 'refined-petal-paste', amount: 1 },
      { itemId: 'refined-dew-water', amount: 1 },
    ],
    output: { itemId: 'component-sun-salve', amount: 1 },
    durationMs: 20 * SEC,
  },
  {
    id: 'component-lucky-charm-dust',
    station: 'cauldron',
    inputs: [
      { itemId: 'refined-lucky-essence', amount: 1 },
      { itemId: 'refined-petal-paste', amount: 1 },
    ],
    output: { itemId: 'component-lucky-charm-dust', amount: 1 },
    durationMs: 25 * SEC,
  },
  {
    id: 'component-thistle-twine',
    station: 'cauldron',
    inputs: [
      { itemId: 'refined-fluff-thread', amount: 1 },
      { itemId: 'refined-leaf-tea', amount: 1 },
    ],
    output: { itemId: 'component-thistle-twine', amount: 1 },
    durationMs: 20 * SEC,
  },
  {
    id: 'component-calming-tea',
    station: 'cauldron',
    inputs: [
      { itemId: 'refined-leaf-tea', amount: 1 },
      { itemId: 'refined-dew-water', amount: 1 },
    ],
    output: { itemId: 'component-calming-tea', amount: 1 },
    durationMs: 20 * SEC,
  },
  {
    id: 'component-sweet-bait',
    station: 'cauldron',
    inputs: [
      { itemId: 'refined-berry-juice', amount: 1 },
      { itemId: 'refined-petal-paste', amount: 1 },
    ],
    output: { itemId: 'component-sweet-bait', amount: 1 },
    durationMs: 20 * SEC,
  },

  {
    // Content doc lists Leaf Tea + Spore Dust; Spore Dust is a Forest material, so the Meadow
    // version uses Petal Paste (bitter flower smoke) to avoid needing a later region.
    id: 'component-pest-smudge',
    station: 'cauldron',
    inputs: [
      { itemId: 'refined-leaf-tea', amount: 1 },
      { itemId: 'refined-petal-paste', amount: 1 },
    ],
    output: { itemId: 'component-pest-smudge', amount: 1 },
    durationMs: 20 * SEC,
  },

  // Forest refining and components
  {
    id: 'refined-spore-dust',
    station: 'mortar',
    inputs: [{ tag: 'caps', amount: 4 }],
    output: { itemId: 'refined-spore-dust', amount: 1 },
    durationMs: 14 * SEC,
  },
  {
    id: 'refined-acorn-flour',
    station: 'mortar',
    inputs: [{ itemId: 'raw-acorns', amount: 3 }],
    output: { itemId: 'refined-acorn-flour', amount: 1 },
    durationMs: 14 * SEC,
  },
  {
    id: 'refined-golden-spore',
    station: 'mortar',
    inputs: [{ itemId: 'raw-golden-caps', amount: 1 }],
    output: { itemId: 'refined-golden-spore', amount: 1 },
    durationMs: 20 * SEC,
  },
  {
    id: 'component-earth-loam',
    station: 'cauldron',
    inputs: [
      { itemId: 'refined-acorn-flour', amount: 1 },
      { itemId: 'refined-spore-dust', amount: 1 },
    ],
    output: { itemId: 'component-earth-loam', amount: 1 },
    durationMs: 25 * SEC,
  },

  // Swamp refining and components
  {
    id: 'refined-reed-fiber',
    station: 'spinning-wheel',
    inputs: [{ tag: 'stalks', amount: 3 }],
    output: { itemId: 'refined-reed-fiber', amount: 1 },
    durationMs: 12 * SEC,
  },
  {
    // Content doc: Dew Water is pressed from dewdrops or duckweed.
    id: 'refined-dew-water-duckweed',
    station: 'press',
    inputs: [{ itemId: 'raw-duckweed', amount: 3 }],
    output: { itemId: 'refined-dew-water', amount: 1 },
    durationMs: 10 * SEC,
  },
  {
    id: 'refined-lily-oil',
    station: 'press',
    inputs: [{ itemId: 'raw-lily-petals', amount: 3 }],
    output: { itemId: 'refined-lily-oil', amount: 1 },
    durationMs: 14 * SEC,
  },
  {
    id: 'refined-orchid-essence',
    station: 'drying-rack',
    inputs: [{ itemId: 'raw-orchid-petals', amount: 1 }],
    output: { itemId: 'refined-orchid-essence', amount: 1 },
    durationMs: 20 * SEC,
  },
  {
    id: 'component-lily-balm',
    station: 'cauldron',
    inputs: [
      { itemId: 'refined-lily-oil', amount: 1 },
      { itemId: 'refined-petal-paste', amount: 1 },
    ],
    output: { itemId: 'component-lily-balm', amount: 1 },
    durationMs: 25 * SEC,
  },

  // Potions (brewed in the cauldron)
  {
    id: 'potion-greenthumb-brew',
    station: 'cauldron',
    inputs: [
      { itemId: 'component-sun-salve', amount: 1 },
      { itemId: 'refined-leaf-tea', amount: 1 },
    ],
    output: { itemId: 'potion-greenthumb-brew', amount: 1 },
    durationMs: 30 * SEC,
  },
  {
    id: 'potion-quickwing-tonic',
    station: 'cauldron',
    inputs: [
      { itemId: 'component-sun-salve', amount: 1 },
      { itemId: 'refined-fluff-thread', amount: 1 },
    ],
    output: { itemId: 'potion-quickwing-tonic', amount: 1 },
    durationMs: 30 * SEC,
  },
  {
    id: 'potion-deep-pockets-draught',
    station: 'cauldron',
    inputs: [
      { itemId: 'component-thistle-twine', amount: 1 },
      { itemId: 'refined-berry-juice', amount: 1 },
    ],
    output: { itemId: 'potion-deep-pockets-draught', amount: 1 },
    durationMs: 30 * SEC,
  },
  {
    id: 'potion-lucky-dew',
    station: 'cauldron',
    inputs: [
      { itemId: 'component-lucky-charm-dust', amount: 1 },
      { itemId: 'refined-dew-water', amount: 1 },
    ],
    output: { itemId: 'potion-lucky-dew', amount: 1 },
    durationMs: 40 * SEC,
  },
  {
    id: 'potion-swiftroot-elixir',
    station: 'cauldron',
    inputs: [
      { itemId: 'component-earth-loam', amount: 1 },
      { itemId: 'refined-dew-water', amount: 1 },
    ],
    output: { itemId: 'potion-swiftroot-elixir', amount: 1 },
    durationMs: 40 * SEC,
  },
  {
    id: 'potion-waterstride-philter',
    station: 'cauldron',
    inputs: [
      { itemId: 'component-lily-balm', amount: 1 },
      { itemId: 'component-thistle-twine', amount: 1 },
    ],
    output: { itemId: 'potion-waterstride-philter', amount: 1 },
    durationMs: 40 * SEC,
  },
]

export const RECIPES: Readonly<Record<string, RecipeDef>> = Object.fromEntries(
  RECIPE_LIST.map((recipe) => [recipe.id, recipe]),
)

const MIN = 60 * SEC

/** Potion effects (content doc → Potions). Values are starting points for balancing. */
const POTION_LIST: PotionDef[] = [
  {
    id: 'potion-greenthumb-brew',
    effect: { kind: 'clickPower', amount: 1 },
    durationMs: 3 * MIN,
    description: '+1 click power',
  },
  {
    id: 'potion-quickwing-tonic',
    effect: { kind: 'wingSpeed', multiplier: 1.5 },
    durationMs: 3 * MIN,
    description: 'Flights 50% faster',
  },
  {
    id: 'potion-deep-pockets-draught',
    effect: { kind: 'satchel', amount: 10 },
    durationMs: 5 * MIN,
    description: '+10 satchel space',
  },
  {
    id: 'potion-lucky-dew',
    effect: { kind: 'luck', multiplier: 2 },
    durationMs: 3 * MIN,
    description: 'Rarer plants grow twice as often',
  },
  {
    id: 'potion-swiftroot-elixir',
    effect: { kind: 'regrowth', multiplier: 1.5 },
    durationMs: 5 * MIN,
    description: 'Plants regrow 50% faster everywhere',
  },
  {
    id: 'potion-waterstride-philter',
    effect: { kind: 'waterstride' },
    durationMs: 5 * MIN,
    description: 'No slowdowns over water, and the heron lets you be',
  },
]

export const POTIONS: Readonly<Record<string, PotionDef>> = Object.fromEntries(
  POTION_LIST.map((potion) => [potion.id, potion]),
)
