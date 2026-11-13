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
  /** Its region bonus while you ride it there (design doc 3.14). */
  bonus:
    | { kind: 'satchel'; amount: number; perLevel: number; label: string }
    | { kind: 'regionTravel'; multiplier: number; perLevel: number; label: string }
  maxLevel: number
  /** Per level above 1. */
  speedPerLevel: number
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
    bonus: { kind: 'satchel', amount: 10, perLevel: 2, label: 'satchel space in the Meadow' },
    maxLevel: 5,
    speedPerLevel: 0.05,
  },
  'mount-flying-squirrel': {
    id: 'mount-flying-squirrel',
    name: 'Flying squirrel',
    regionId: 'forest',
    homeSpot: 'mossy-stump-ring',
    description: 'Glides from tree to tree. Hops around the Forest in a flash.',
    food: { itemId: 'raw-acorns', amount: 4 },
    feedingsToBefriend: 5,
    feedCooldownMs: 2 * 60_000,
    speed: 1.2,
    bonus: {
      kind: 'regionTravel',
      multiplier: 0.6,
      perLevel: 0.05,
      label: 'faster hops within the Forest',
    },
    maxLevel: 5,
    speedPerLevel: 0.05,
  },
}

/** Region bonus value at a level: satchel space, or the travel-time multiplier inside the region. */
export function mountBonusValue(mount: MountDef, level: number): number {
  const b = mount.bonus
  return b.kind === 'satchel'
    ? b.amount + (level - 1) * b.perLevel
    : Math.max(0.3, b.multiplier - (level - 1) * b.perLevel)
}

/** Food needed to raise a mount from `level` to `level + 1`. */
export function levelUpFood(mount: MountDef, level: number): ItemStack {
  return { itemId: mount.food.itemId, amount: mount.food.amount * 2 * level }
}
