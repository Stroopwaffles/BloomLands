export type Rarity = 'common' | 'uncommon' | 'rare' | 'very-rare'

export type ItemCategory = 'raw' | 'refined' | 'component' | 'potion' | 'trinket'

export interface ItemDef {
  /** Stable ID, also used as the art ID for the item's icon. */
  id: string
  name: string
  category: ItemCategory
  /** Material tags from the content doc (petals, leaves, caps, fruit, fluff, stalks). */
  tags?: string[]
}

export interface ItemStack {
  itemId: string
  amount: number
}

/** A cost or recipe input: a specific item, or any items with a tag (e.g. any petals). */
export type CostEntry = { itemId: string; amount: number } | { tag: string; amount: number }

export type StationId = 'mortar' | 'press' | 'drying-rack' | 'spinning-wheel' | 'cauldron'

export interface StationDef {
  id: StationId
  name: string
  verb: string
}

export interface RecipeDef {
  id: string
  station: StationId
  inputs: CostEntry[]
  output: ItemStack
  durationMs: number
}

export type PotionEffect =
  | { kind: 'clickPower'; amount: number }
  | { kind: 'wingSpeed'; multiplier: number }
  | { kind: 'satchel'; amount: number }
  | { kind: 'luck'; multiplier: number }
  | { kind: 'regrowth'; multiplier: number }
  /** Waterstride: no slowdowns over water, and the heron lets you be. */
  | { kind: 'waterstride' }
  /** Glowlight: light to visit dark places (the Caves) before they're lit for good. */
  | { kind: 'light' }
  /** Moonsight: see through fog, mist and darkness (light for the Caves too). */
  | { kind: 'moonsight' }
  /** Featherfall: wind and weather never slow your flights, and gusts never blow you back. */
  | { kind: 'featherfall' }

export interface PotionDef {
  /** The potion's item ID. */
  id: string
  effect: PotionEffect
  durationMs: number
  description: string
}

export type ResearchBranch = 'refining' | 'brewing' | 'spellcraft' | 'rites'

export interface ResearchDef {
  id: string
  name: string
  branch: ResearchBranch
  description: string
  cost: CostEntry[]
  durationMs: number
  requires: string[]
  /** Recipe IDs this research unlocks. */
  unlocks: string[]
  /** Spell IDs this research teaches. */
  spells?: string[]
  /** Ritual IDs this research teaches. */
  rituals?: string[]
  /** Only shows up once this region is open (content doc: "recipes appear as regions unlock"). */
  region?: string
}

export interface PlantDef {
  /** Stable ID, also the art ID. */
  id: string
  name: string
  /** Clicks needed at base click power. */
  toughness: number
  rarity: Rarity
  /** What a full harvest gives. */
  yields: ItemStack[]
  /** Only grows in the morning (or any time it rains). */
  morningOnly?: boolean
  /** Pests that can infest it (material tag the pests like). */
  tags?: string[]
}

export interface SpotDef {
  id: string
  name: string
  regionId: string
  description: string
  /** Plants that can grow here. */
  plants: string[]
  /** How many plants grow here at once. */
  slots: number
  /** Time for an empty slot to grow a new plant. */
  regrowMs: number
  /** Trinkets that can turn up as bonus drops here. */
  trinkets: string[]
  /** Open water: flights here are slower without the frog or Waterstride (WATER_FLIGHT_FACTOR). */
  water?: boolean
  /** Secret areas stay hidden until unlocked (design doc 3.12). */
  secret?: {
    /** Curio found on the first visit each run. */
    curioId: string
    /** Unique outfit unlocked on the first visit (kept forever). */
    outfitId: string
    /** What reveals it. Rituals unlock their secret directly; the others are checked as you play. */
    unlock: SecretUnlock
  }
}

export type SecretUnlock =
  | { kind: 'ritual'; hint: string }
  | { kind: 'story'; storyId: string; hint: string }
  | { kind: 'bloom'; level: number; hint: string }
  /** Help a settlement's villagers this many times. */
  | { kind: 'requests'; settlementId: string; count: number; hint: string }
  /** Calm a creature this many times. */
  | { kind: 'calmed'; creatureId: string; count: number; hint: string }
  /** A scout searching the region may stumble on it (a rare harvest there can reveal it too). */
  | { kind: 'scout'; regionId: string; chance: number; hint: string }
  /** Only reachable while riding this mount (it never stays open on its own). */
  | { kind: 'riding'; mountId: string; hint: string }
  /** Opens once the court reaches this rank (index into COURT_RANKS). */
  | { kind: 'rank'; rank: number; hint: string }
  /** Only appears from this run on (a reward for prestige). */
  | { kind: 'run'; run: number; hint: string }

export interface SettlementDef {
  id: string
  name: string
  regionId: string
  description: string
  /** Who lives here (the folk helpers recruited here belong to). */
  folk: string
  /** The village shop. */
  shop: { name: string; keeper: string; greeting: string }
}

export interface RegionDef {
  id: string
  name: string
  settlement: string
  /** Where the region's spirit of the land rests. */
  spiritPlace: string
  /** Secret areas, shown once unlocked. */
  secretSpots: string[]
  /** Harvesting spots, in display order. */
  spots: string[]
  /** The harvesting spot whose scenery stands for the whole region (menu, flights). */
  sceneSpot: string
  /**
   * What it takes to reach this region (null: open from the start): a court rank, plus either a
   * rite or (the Sky Isles) a tamed mount strong enough to fly there.
   */
  unlock: { rank: number; ritualId?: string; mountId?: string } | null
  /**
   * Dark until lit: before its rite, light (a Glowlight Potion, or a mount that glows) lets a
   * court of the right rank visit.
   */
  needsLight?: boolean
  /** Always dark (the Caves, the twilight Glade): the interface uses its night colors there. */
  dark?: boolean
}
