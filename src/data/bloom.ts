/**
 * Bloom: how healthy each region is (design doc 3.9). It only ever goes up.
 * All numbers are starting values for balancing.
 */

export interface BloomLevelDef {
  name: string
  points: number
}

export const BLOOM_LEVELS: readonly BloomLevelDef[] = [
  { name: 'Wilted', points: 0 },
  { name: 'Waking', points: 10 },
  { name: 'Sprouting', points: 30 },
  { name: 'Budding', points: 60 },
  { name: 'Blooming', points: 100 },
  { name: 'Flourishing', points: 150 },
]

/** Each bloom level makes plants in the region regrow this much faster, and rarer ones likelier. */
export const BLOOM_PER_LEVEL = {
  regrowth: 0.1,
  luck: 0.1,
}

/** Bloom gained from each source. */
export const BLOOM_REWARDS = {
  settlementRequest: 3,
  campCleared: 2,
  storyChapter: 3,
  storyComplete: 10,
  spiritAwakened: 15,
  crewWonOver: 10,
}

export interface CurioDef {
  id: string
  name: string
  description: string
  effect:
    | { kind: 'travel'; multiplier: number }
    | { kind: 'traderPay'; multiplier: number }
    | { kind: 'potionDuration'; multiplier: number }
}

/** Meadow curios (content doc → Curio Index). They last for the current run. */
export const CURIOS: Readonly<Record<string, CurioDef>> = {
  'curio-pips-compass': {
    id: 'curio-pips-compass',
    name: "Pip's Compass",
    description: 'Flights take 10% less time.',
    effect: { kind: 'travel', multiplier: 0.9 },
  },
  'curio-festival-ribbon': {
    id: 'curio-festival-ribbon',
    name: 'Festival Ribbon',
    description: 'Trader requests pay 10% more Glimmers.',
    effect: { kind: 'traderPay', multiplier: 1.1 },
  },
  'curio-pocket-sundial': {
    id: 'curio-pocket-sundial',
    name: 'Pocket Sundial',
    description: 'Potions last 20% longer.',
    effect: { kind: 'potionDuration', multiplier: 1.2 },
  },
}

export interface VillagerDef {
  id: string
  name: string
  title: string
}

/** Villagers who ask for things in each settlement. */
export const VILLAGERS: Readonly<Record<string, readonly VillagerDef[]>> = {
  thimblewick: [
    { id: 'villager-hob', name: 'Hob', title: 'the thimble-maker' },
    { id: 'villager-wisteria', name: 'Wisteria', title: 'who keeps the seed store' },
    { id: 'villager-tumbleweed', name: 'Old Tumbleweed', title: 'the village elder' },
  ],
}

export const SETTLEMENT_RULES = {
  maxRequests: 2,
  firstArrivalMs: 60_000,
  arrivalMs: 3 * 60_000,
  expiryMs: 20 * 60_000,
  /** Villagers pay less than traders, but helping them makes the land bloom. */
  rewardMultiplier: 0.6,
}
