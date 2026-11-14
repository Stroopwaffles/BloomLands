import type { Rarity } from './types'

export type HelperType = 'gatherer' | 'supply' | 'pirate' | 'brewer' | 'scout'

export interface HelperTypeDef {
  id: HelperType
  name: string
  description: string
  /** Accessory that shows the helper's job (content doc → Asset List). */
  accessory: string
  /** Glimmers for the first one; each further one costs more. */
  baseCost: number
  /** Shown while this type can't be recruited yet. */
  unlockHint: string
}

export const HELPER_TYPES: Readonly<Record<HelperType, HelperTypeDef>> = {
  gatherer: {
    id: 'gatherer',
    name: 'Gatherer',
    description: 'Flies to a harvesting spot you choose, gathers, and brings it all home. Repeats.',
    accessory: 'basket',
    baseCost: 50,
    unlockHint: 'Build Mouse Bunks at home first (Upgrades).',
  },
  supply: {
    id: 'supply',
    name: 'Supply helper',
    description: 'Keeps your storage stocked: fetches whatever falls below the minimums you set.',
    accessory: 'satchel',
    baseCost: 90,
    unlockHint: 'Build a Supply Nook at home first (Upgrades).',
  },
  pirate: {
    id: 'pirate',
    name: 'Reformed pirate',
    description: 'A former pirate, now a friend. Gathers at a spot you choose, like a gatherer.',
    accessory: 'bandana',
    baseCost: 40,
    unlockHint: 'Win over a pirate crew first.',
  },
  brewer: {
    id: 'brewer',
    name: 'Brewer',
    description:
      'Stays home and keeps a station busy: makes the recipe you choose until you have enough.',
    accessory: 'apron',
    baseCost: 120,
    unlockHint: "Build a Brewer's Corner at home first (Upgrades).",
  },
  scout: {
    id: 'scout',
    name: 'Scout',
    description: 'Searches a harvesting spot you choose for trinkets, and brings them home.',
    accessory: 'goggles',
    baseCost: 100,
    unlockHint: "Build a Scout's Perch at home first (Upgrades).",
  },
}

export const HELPER_TYPE_ORDER: readonly HelperType[] = [
  'gatherer',
  'supply',
  'brewer',
  'scout',
  'pirate',
]

/** Helpers who work a chosen spot (gatherers and pirates gather there, scouts search it). */
export function gathersAtSpot(type: HelperType): boolean {
  return type === 'gatherer' || type === 'pirate' || type === 'scout'
}

/** Brewers: how much of their recipe's result they keep in storage, by default and as choices. */
export const BREWER_KEEP = { default: 10, choices: [5, 10, 25, 50] }

/** Scouts: chances per trip of finding a trinket, and of finding a second one. */
export const SCOUT_RULES = { trinketChance: 0.6, secondChance: 0.2 }

/** Hammocks the reformed pirates bring with them, per crew won over. */
export const PIRATES_PER_CREW = 2

/** Starting values for balancing. */
export const HELPER_RULES = {
  /** Time spent gathering at the spot on each trip. */
  gatherMs: 45_000,
  /** Plants gathered per trip. */
  plantsPerTrip: 4,
  /** Each further helper of a type costs this much more than the last. */
  costGrowth: 1.6,
  /** Court points each helper adds. */
  courtPoints: 2,
}

/** Supply helpers gathering one specific plant find fewer of the rarer ones per trip. */
export const RARITY_HAUL_FACTOR: Readonly<Record<Rarity, number>> = {
  common: 1,
  uncommon: 0.5,
  rare: 0.25,
  'very-rare': 0.1,
}

/** Names for field-mouse helpers. */
export const HELPER_NAMES: readonly string[] = [
  'Nutmeg',
  'Fennel',
  'Poppy',
  'Juniper',
  'Wicket',
  'Tansy',
  'Rowan',
  'Basil',
  'Clove',
  'Pepper',
  'Hopscotch',
  'Bluebell',
]
