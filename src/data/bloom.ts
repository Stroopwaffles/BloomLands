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
    | { kind: 'trinketChance'; multiplier: number }
    | { kind: 'tagYield'; tag: string; amount: number }
    | { kind: 'researchSpeed'; multiplier: number }
    | { kind: 'regionBloom'; regionId: string; multiplier: number }
    | { kind: 'settlementBloom'; multiplier: number }
    | { kind: 'helperTrips'; multiplier: number }
    | { kind: 'weatherLuck'; weather: string; multiplier: number }
    | { kind: 'storage'; amount: number }
    | { kind: 'mountSpeed'; multiplier: number }
    | { kind: 'traderTrinkets'; multiplier: number }
    | { kind: 'offlineCap'; ms: number }
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
  'curio-forgotten-acorn': {
    id: 'curio-forgotten-acorn',
    name: 'Forgotten Acorn',
    description: 'Trinkets turn up 50% more often when you harvest.',
    effect: { kind: 'trinketChance', multiplier: 1.5 },
  },
  'curio-burdocks-field-guide': {
    id: 'curio-burdocks-field-guide',
    name: "Burdock's Field Guide",
    description: 'Mushrooms give 1 extra cap when harvested.',
    effect: { kind: 'tagYield', tag: 'caps', amount: 1 },
  },
  'curio-pressed-flower-bookmark': {
    id: 'curio-pressed-flower-bookmark',
    name: 'Pressed-Flower Bookmark',
    description: 'Research goes 15% faster.',
    effect: { kind: 'researchSpeed', multiplier: 1.15 },
  },
  'curio-heartwood-charm': {
    id: 'curio-heartwood-charm',
    name: 'Heartwood Charm',
    description: 'Bloom gained in the Forest is 25% higher.',
    effect: { kind: 'regionBloom', regionId: 'forest', multiplier: 1.25 },
  },
  'curio-mayors-chain': {
    id: 'curio-mayors-chain',
    name: "Mayor's Chain of Office",
    description: 'Helping villagers raises 50% more bloom.',
    effect: { kind: 'settlementBloom', multiplier: 1.5 },
  },
  'curio-reed-pipe': {
    id: 'curio-reed-pipe',
    name: 'Reed Pipe',
    description: "Helpers' flights take 15% less time.",
    effect: { kind: 'helperTrips', multiplier: 0.85 },
  },
  'curio-wisp-lantern': {
    id: 'curio-wisp-lantern',
    name: 'Wisp Lantern',
    description: 'In fog, rarer plants grow twice as often.',
    effect: { kind: 'weatherLuck', weather: 'fog', multiplier: 2 },
  },
  'curio-honeycomb-brooch': {
    id: 'curio-honeycomb-brooch',
    name: 'Honeycomb Brooch',
    description: '+150 storage space.',
    effect: { kind: 'storage', amount: 150 },
  },
  'curio-knights-pennant': {
    id: 'curio-knights-pennant',
    name: "Knight's Pennant",
    description: 'Mounts fly 10% faster.',
    effect: { kind: 'mountSpeed', multiplier: 1.1 },
  },
  'curio-queens-seal': {
    id: 'curio-queens-seal',
    name: "Queen's Seal",
    description: 'Traders offer trinkets twice as often.',
    effect: { kind: 'traderTrinkets', multiplier: 2 },
  },
  'curio-badgers-pocket-watch': {
    id: 'curio-badgers-pocket-watch',
    name: "Badger's Pocket Watch",
    description: 'Progress while you are away is kept for 2 more hours.',
    effect: { kind: 'offlineCap', ms: 2 * 60 * 60_000 },
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
  acornhollow: [
    { id: 'villager-bristle', name: 'Bristle', title: 'the hedgehog lamplighter' },
    { id: 'villager-chestnut', name: 'Chestnut', title: 'a squirrel who stores everything' },
    { id: 'villager-thornbury', name: 'Mother Thornbury', title: 'who runs the acorn bakery' },
  ],
  'toad-village': [
    {
      id: 'villager-croaksworth',
      name: 'Grandpa Croaksworth',
      title: 'who naps on the biggest pad',
    },
    { id: 'villager-puddle', name: 'Puddle', title: 'a tadpole who wants to help' },
    { id: 'villager-lilywhite', name: 'Madame Lilywhite', title: 'the reed weaver' },
  ],
  combhaven: [
    { id: 'villager-pollyanna', name: 'Pollyanna', title: 'who sorts the pollen' },
    { id: 'villager-hexley', name: 'Hexley', title: 'the hexagon architect' },
    { id: 'villager-mother-comb', name: 'Mother Comb', title: 'keeper of the honey vats' },
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
