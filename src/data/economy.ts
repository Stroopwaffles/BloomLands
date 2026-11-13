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
  // Refined
  'refined-petal-paste': 10,
  'refined-leaf-tea': 10,
  'refined-berry-juice': 18,
  'refined-dew-water': 10,
  'refined-fluff-thread': 14,
  'refined-lucky-essence': 35,
  // Components
  'component-sun-salve': 25,
  'component-calming-tea': 25,
  'component-thistle-twine': 30,
  'component-sweet-bait': 32,
  'component-lucky-charm-dust': 55,
  'component-pest-smudge': 28,
  // Potions
  'potion-greenthumb-brew': 45,
  'potion-quickwing-tonic': 50,
  'potion-deep-pockets-draught': 70,
  'potion-lucky-dew': 90,
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
  /** Requests waiting at once. */
  maxRequests: 2,
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
