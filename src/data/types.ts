export type Rarity = 'common' | 'uncommon' | 'rare' | 'very-rare'

export type ItemCategory = 'raw' | 'trinket'

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

export interface PlantDef {
  /** Stable ID, also the art ID. */
  id: string
  name: string
  /** Clicks needed at base click power. */
  toughness: number
  rarity: Rarity
  /** What a full harvest gives. */
  yields: ItemStack[]
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
}

export interface RegionDef {
  id: string
  name: string
  /** Harvesting spots, in display order. */
  spots: string[]
}
