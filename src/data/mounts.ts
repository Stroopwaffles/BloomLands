import type { ItemStack } from './types'

/** Mounts (design doc 3.14, content doc → each region's Mount). Starting values for balancing. */
export interface MountDef {
  id: string
  name: string
  regionId: string
  /** Where the wild creature can be found and befriended. */
  homeSpot: string
  description: string
  /** How it moves about in the wild ("is buzzing about."). */
  wildLine: string
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
    | { kind: 'clickPower'; amount: number; perLevel: number; label: string }
    | { kind: 'regionLuck'; multiplier: number; perLevel: number; label: string }
  /** Swims: no slowdown flying over open water. */
  swims?: boolean
  /** Glows: counts as light for visiting dark regions. */
  light?: boolean
  /** Only shows up in the wild once this story is finished. */
  afterStory?: string
  /** Only seen in the wild at dawn and in the morning (the blue jay). */
  morningOnly?: boolean
  /** Kindred Call costs this instead of the usual Sweet Bait and signature (the blue jay). */
  tameCost?: { itemId: string; amount: number }[]
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
    wildLine: 'is buzzing about.',
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
    wildLine: 'is gliding between the trees.',
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
  'mount-frog': {
    id: 'mount-frog',
    name: 'Frog',
    regionId: 'swamp',
    homeSpot: 'lilypad-pools',
    description: 'Bouncy and cheerful. Gathers fast in the Swamp, and happily crosses water.',
    wildLine: 'is sunning itself on a lily pad.',
    food: { itemId: 'raw-duckweed', amount: 5 },
    feedingsToBefriend: 5,
    feedCooldownMs: 2 * 60_000,
    speed: 1.15,
    bonus: { kind: 'clickPower', amount: 1, perLevel: 0.5, label: 'click power in the Swamp' },
    swims: true,
    maxLevel: 5,
    speedPerLevel: 0.05,
  },
  'mount-hummingbird': {
    id: 'mount-hummingbird',
    name: 'Hummingbird',
    regionId: 'orchard',
    homeSpot: 'petalfall-rows',
    description: 'Very fast, and has an eye for the rarest blossoms in the Orchard.',
    wildLine: 'is darting between the blossoms.',
    food: { itemId: 'raw-bee-balm-leaves', amount: 4 },
    feedingsToBefriend: 5,
    feedCooldownMs: 2 * 60_000,
    speed: 1.6,
    bonus: {
      kind: 'regionLuck',
      multiplier: 1.5,
      perLevel: 0.1,
      label: 'rarer plants grow more often in the Orchard',
    },
    maxLevel: 5,
    speedPerLevel: 0.05,
  },
  'mount-glowworm': {
    id: 'mount-glowworm',
    name: 'Glowworm',
    regionId: 'caves',
    homeSpot: 'fungus-gallery',
    description: 'Lights up the Caves (it counts as light to visit), and gathers fast down there.',
    wildLine: 'is glowing softly by the fungi.',
    food: { itemId: 'raw-cave-moss', amount: 5 },
    feedingsToBefriend: 5,
    feedCooldownMs: 2 * 60_000,
    speed: 1.3,
    bonus: { kind: 'clickPower', amount: 1, perLevel: 0.5, label: 'click power in the Caves' },
    light: true,
    afterStory: 'story-lumen',
    maxLevel: 5,
    speedPerLevel: 0.05,
  },
  'mount-luna-moth': {
    id: 'mount-luna-moth',
    name: 'Luna moth',
    regionId: 'glade',
    homeSpot: 'moonpetal-meadow',
    description: 'Finds the Glade’s rarer flowers, and is the only way down into the Starwell.',
    wildLine: 'is drifting over the moonpetals.',
    food: { itemId: 'raw-jasmine-blossoms', amount: 5 },
    feedingsToBefriend: 5,
    feedCooldownMs: 2 * 60_000,
    speed: 1.4,
    bonus: { kind: 'regionLuck', multiplier: 1.3, perLevel: 0.1, label: 'rare finds in the Glade' },
    maxLevel: 5,
    speedPerLevel: 0.05,
  },
  'mount-blue-jay': {
    id: 'mount-blue-jay',
    name: 'Blue jay',
    regionId: 'glade',
    homeSpot: 'silverbrook',
    description:
      'The strongest flyer of all. It nests at the edge of the Glade and is seen at dawn.',
    wildLine: 'is perched on a fern, watching the dawn.',
    food: { itemId: 'raw-acorns', amount: 6 },
    feedingsToBefriend: 6,
    feedCooldownMs: 3 * 60_000,
    speed: 1.8,
    bonus: {
      kind: 'regionTravel',
      multiplier: 0.75,
      perLevel: 0.05,
      label: 'faster flights in the Glade',
    },
    morningOnly: true,
    tameCost: [
      { itemId: 'component-moon-draught', amount: 1 },
      { itemId: 'component-starlight-lens', amount: 1 },
    ],
    maxLevel: 5,
    speedPerLevel: 0.05,
  },
}

/**
 * Region bonus value at a level: satchel space, click power, or the travel-time multiplier inside
 * the region.
 */
export function mountBonusValue(mount: MountDef, level: number): number {
  const b = mount.bonus
  if (b.kind === 'satchel') return b.amount + (level - 1) * b.perLevel
  if (b.kind === 'clickPower') return Math.floor(b.amount + (level - 1) * b.perLevel)
  if (b.kind === 'regionLuck') return b.multiplier + (level - 1) * b.perLevel
  return Math.max(0.3, b.multiplier - (level - 1) * b.perLevel)
}

/** Food needed to raise a mount from `level` to `level + 1`. */
export function levelUpFood(mount: MountDef, level: number): ItemStack {
  return { itemId: mount.food.itemId, amount: mount.food.amount * 2 * level }
}
