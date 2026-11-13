import type { ItemStack } from './types'

/** Mounts (design doc 3.14, content doc → each region's Mount). Starting values for balancing. */
export interface MountDef {
  id: string
  name: string
  regionId: string
  /** Where the wild creature can be found and befriended. */
  homeSpot: string
  description: string
  /** Its favorite food: fed once per visit to befriend it, and to level it up. */
  food: ItemStack
  feedingsToBefriend: number
  /** Time it needs between feedings while you befriend it. */
  feedCooldownMs: number
  /** Flight speed multiplier while riding. */
  speed: number
  /** Extra satchel space while riding in its home region. */
  regionSatchel: number
  maxLevel: number
  /** Per level above 1. */
  speedPerLevel: number
  satchelPerLevel: number
}

export const MOUNTS: Readonly<Record<string, MountDef>> = {
  'mount-bumblebee': {
    id: 'mount-bumblebee',
    name: 'Bumblebee',
    regionId: 'meadow',
    homeSpot: 'buttercup-rise',
    description: 'Fuzzy, sturdy and kind. Carries extra in the Meadow.',
    food: { itemId: 'raw-clover-leaves', amount: 5 },
    feedingsToBefriend: 5,
    feedCooldownMs: 2 * 60_000,
    speed: 1.25,
    regionSatchel: 10,
    maxLevel: 5,
    speedPerLevel: 0.05,
    satchelPerLevel: 2,
  },
}

/** Food needed to raise a mount from `level` to `level + 1`. */
export function levelUpFood(mount: MountDef, level: number): ItemStack {
  return { itemId: mount.food.itemId, amount: mount.food.amount * 2 * level }
}
