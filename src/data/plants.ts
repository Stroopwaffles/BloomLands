import type { PlantDef, Rarity } from './types'

/** Plants from content doc → Regions. Toughness and yields are starting values for balancing. */
const PLANT_LIST: PlantDef[] = [
  // Meadow
  {
    id: 'plant-clover',
    name: 'Clover',
    toughness: 1,
    rarity: 'common',
    yields: [{ itemId: 'raw-clover-leaves', amount: 2 }],
  },
  {
    id: 'plant-daisy',
    tags: ['petals'],
    name: 'Daisy',
    toughness: 2,
    rarity: 'common',
    yields: [{ itemId: 'raw-daisy-petals', amount: 2 }],
  },
  {
    id: 'plant-buttercup',
    tags: ['petals'],
    name: 'Buttercup',
    toughness: 2,
    rarity: 'common',
    yields: [{ itemId: 'raw-buttercup-petals', amount: 2 }],
  },
  {
    id: 'plant-dandelion',
    name: 'Dandelion',
    toughness: 3,
    rarity: 'common',
    yields: [{ itemId: 'raw-dandelion-fluff', amount: 3 }],
  },
  {
    id: 'plant-wild-strawberry',
    name: 'Wild strawberry',
    toughness: 4,
    rarity: 'uncommon',
    yields: [{ itemId: 'raw-wild-berries', amount: 2 }],
  },
  {
    id: 'plant-morning-dew',
    name: 'Morning dew',
    toughness: 1,
    rarity: 'uncommon',
    yields: [{ itemId: 'raw-dewdrops', amount: 1 }],
    morningOnly: true,
  },
  {
    id: 'plant-four-leaf-clover',
    name: 'Four-leaf clover',
    toughness: 1,
    rarity: 'rare',
    yields: [{ itemId: 'raw-lucky-leaf', amount: 1 }],
  },
  // Meadow secret: The Fairy Ring
  {
    id: 'plant-ringcap',
    name: 'Ringcap mushroom',
    toughness: 3,
    rarity: 'rare',
    yields: [{ itemId: 'raw-ringcap', amount: 1 }],
  },

  // Forest
  {
    id: 'plant-moss',
    name: 'Moss',
    toughness: 2,
    rarity: 'common',
    yields: [{ itemId: 'raw-moss-tufts', amount: 2 }],
  },
  {
    id: 'plant-fern',
    name: 'Fern',
    toughness: 3,
    rarity: 'common',
    yields: [{ itemId: 'raw-fern-fronds', amount: 2 }],
  },
  {
    id: 'plant-bilberry',
    name: 'Bilberry',
    toughness: 4,
    rarity: 'common',
    yields: [{ itemId: 'raw-bilberries', amount: 3 }],
  },
  {
    id: 'plant-button-mushroom',
    tags: ['caps'],
    name: 'Button mushroom',
    toughness: 5,
    rarity: 'common',
    yields: [{ itemId: 'raw-mushroom-caps', amount: 2 }],
  },
  {
    id: 'plant-acorn',
    name: 'Acorn',
    toughness: 5,
    rarity: 'uncommon',
    yields: [{ itemId: 'raw-acorns', amount: 2 }],
  },
  {
    id: 'plant-red-cap',
    tags: ['caps'],
    name: 'Red-cap toadstool',
    toughness: 6,
    rarity: 'uncommon',
    yields: [{ itemId: 'raw-red-caps', amount: 2 }],
  },
  {
    id: 'plant-golden-chanterelle',
    tags: ['caps'],
    name: 'Golden chanterelle',
    toughness: 7,
    rarity: 'rare',
    yields: [{ itemId: 'raw-golden-caps', amount: 1 }],
  },
  // Forest secrets
  {
    id: 'plant-inkcap',
    tags: ['caps'],
    name: 'Inkcap mushroom',
    toughness: 5,
    rarity: 'rare',
    yields: [{ itemId: 'raw-inkcap', amount: 1 }],
  },
  {
    id: 'plant-birch-catkin',
    name: 'Silver birch catkin',
    toughness: 4,
    rarity: 'rare',
    yields: [{ itemId: 'raw-birch-catkins', amount: 1 }],
  },
]

export const PLANTS: Readonly<Record<string, PlantDef>> = Object.fromEntries(
  PLANT_LIST.map((plant) => [plant.id, plant]),
)

/** How often each rarity grows, relative to the others. */
export const RARITY_WEIGHT: Readonly<Record<Rarity, number>> = {
  common: 100,
  uncommon: 30,
  rare: 6,
  'very-rare': 1,
}
