/**
 * Economy data: what items are worth to traders, who visits, and the court ranks.
 * All numbers are starting values for balancing.
 */

/** Glimmer value of one of each item, used to price trader requests. */
export const ITEM_VALUES: Readonly<Record<string, number>> = {
  // Raw
  'raw-clover-leaves': 2,
  'raw-daisy-petals': 2,
  'raw-buttercup-petals': 2,
  'raw-dandelion-fluff': 3,
  'raw-wild-berries': 5,
  'raw-dewdrops': 4,
  'raw-lucky-leaf': 25,
  'raw-ringcap': 30,
  'raw-moss-tufts': 3,
  'raw-fern-fronds': 3,
  'raw-bilberries': 4,
  'raw-mushroom-caps': 5,
  'raw-acorns': 7,
  'raw-red-caps': 8,
  'raw-golden-caps': 30,
  'raw-inkcap': 35,
  'raw-birch-catkins': 35,
  'raw-duckweed': 2,
  'raw-reed-stalks': 3,
  'raw-cattail-fluff': 4,
  'raw-marigold-petals': 4,
  'raw-myrtle-leaves': 7,
  'raw-lily-petals': 9,
  'raw-orchid-petals': 32,
  'raw-wisp-lily': 40,
  'raw-honey': 4,
  'raw-apple-petals': 4,
  'raw-cherry-petals': 5,
  'raw-bee-balm-leaves': 8,
  'raw-crabapples': 9,
  'raw-golden-pollen': 35,
  'raw-quince-petals': 38,
  'raw-royal-jelly': 45,
  'raw-truffle': 45,
  'raw-cave-moss': 5,
  'raw-root-fibers': 5,
  'raw-glowcap-spores': 6,
  'raw-ghost-petals': 11,
  'raw-crystal-shards': 14,
  'raw-star-spores': 40,
  'raw-geode-crystals': 50,
  'raw-star-crystal': 60,
  'raw-sunshaft-fern': 45,
  // Refined
  'refined-petal-paste': 10,
  'refined-leaf-tea': 10,
  'refined-berry-juice': 18,
  'refined-dew-water': 10,
  'refined-fluff-thread': 14,
  'refined-lucky-essence': 35,
  'refined-spore-dust': 22,
  'refined-acorn-flour': 24,
  'refined-golden-spore': 45,
  'refined-reed-fiber': 16,
  'refined-lily-oil': 30,
  'refined-orchid-essence': 40,
  'refined-honey-syrup': 16,
  'refined-pollen-gold': 45,
  'refined-glow-spores': 22,
  'refined-crystal-powder': 34,
  // Components
  'component-sun-salve': 25,
  'component-calming-tea': 25,
  'component-thistle-twine': 30,
  'component-sweet-bait': 32,
  'component-lucky-charm-dust': 55,
  'component-pest-smudge': 28,
  'component-earth-loam': 55,
  'component-lily-balm': 50,
  'component-beeswax-candle': 60,
  'component-glow-ink': 60,
  'component-crystal-focus': 75,
  'component-heart-nectar': 110,
  // Potions
  'potion-greenthumb-brew': 45,
  'potion-quickwing-tonic': 50,
  'potion-deep-pockets-draught': 70,
  'potion-lucky-dew': 90,
  'potion-swiftroot-elixir': 95,
  'potion-waterstride-philter': 100,
  'potion-glowlight': 110,
}

/** Settlement shops. Starting values for balancing. */
export const SHOP_RULES = {
  /** Shops pay this share of an item's worth (traders pay 1.5×, so requests stay better). */
  sellRate: 0.5,
  /** Shops charge this many times an item's worth. */
  buyRate: 2,
  /** What a trinket is worth to a shop. */
  trinketValue: 40,
}

/** The Acorn Post: sending the satchel home from a settlement. Starting values for balancing. */
export const POST_RULES = {
  /** One Glimmer for every this many items... */
  itemsPerGlimmer: 4,
  /** ...but never less than this. */
  minFee: 3,
  /** Parcels take this much longer than the flight home would (before your wing speed). */
  delayFactor: 1.5,
  minDelayMs: 10_000,
}

export interface TraderDef {
  id: string
  name: string
  title: string
  greeting: string
}

/** Recurring traveling traders (content doc → Asset List → Decisions). More arrive later. */
export const TRADERS: readonly TraderDef[] = [
  {
    id: 'trader-snail-peddler',
    name: 'Tumble',
    title: 'the snail peddler',
    greeting: 'Slow and steady, dear. Have you got what I need?',
  },
]

export const TRADER_RULES = {
  /** Only one trader visits the court at a time. */
  maxRequests: 1,
  /** Time until the first trader of a new game arrives. */
  firstArrivalMs: 20_000,
  /** Time between arrivals while there's room for another request. */
  arrivalMs: 2 * 60_000,
  /** How long a request waits before the trader moves on. */
  expiryMs: 15 * 60_000,
  /** Requests pay this much more than the items' plain value. */
  rewardMultiplier: 1.5,
  /** Chance a request also pays a trinket. */
  trinketChance: 0.15,
}

export interface CourtRankDef {
  name: string
  /** Court points needed (from lodging upgrades now; helpers add points later). */
  points: number
}

/** Court ranks (design doc 3.10). Thresholds are starting values for balancing. */
export const COURT_RANKS: readonly CourtRankDef[] = [
  { name: 'Wanderer', points: 0 },
  { name: 'Hearthling', points: 6 },
  { name: 'Hedge Court', points: 16 },
  { name: 'Bramble Court', points: 30 },
  { name: 'Blossom Court', points: 50 },
  { name: 'Moon Court', points: 75 },
  { name: 'Grand Court', points: 100 },
]
