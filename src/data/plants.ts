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
