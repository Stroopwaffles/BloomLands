import type { ItemDef } from './types'

/** All items, from content doc → Meadow. Later regions add to this list. */
const ITEM_LIST: ItemDef[] = [
  // Meadow raw materials
  { id: 'raw-clover-leaves', name: 'Clover leaves', category: 'raw', tags: ['leaves'] },
  { id: 'raw-daisy-petals', name: 'Daisy petals', category: 'raw', tags: ['petals'] },
  { id: 'raw-buttercup-petals', name: 'Buttercup petals', category: 'raw', tags: ['petals'] },
  { id: 'raw-dandelion-fluff', name: 'Dandelion fluff', category: 'raw', tags: ['fluff'] },
  { id: 'raw-wild-berries', name: 'Wild berries', category: 'raw', tags: ['fruit'] },
  { id: 'raw-dewdrops', name: 'Dewdrops', category: 'raw' },
  { id: 'raw-lucky-leaf', name: 'Lucky leaf', category: 'raw' },
  { id: 'raw-ringcap', name: 'Ringcap', category: 'raw', tags: ['caps'] },

  // Forest raw materials
  { id: 'raw-moss-tufts', name: 'Moss tufts', category: 'raw', tags: ['leaves'] },
  { id: 'raw-fern-fronds', name: 'Fern fronds', category: 'raw', tags: ['leaves'] },
  { id: 'raw-bilberries', name: 'Bilberries', category: 'raw', tags: ['fruit'] },
  { id: 'raw-mushroom-caps', name: 'Mushroom caps', category: 'raw', tags: ['caps'] },
  { id: 'raw-acorns', name: 'Acorns', category: 'raw', tags: ['fruit'] },
  { id: 'raw-red-caps', name: 'Red caps', category: 'raw', tags: ['caps'] },
  { id: 'raw-golden-caps', name: 'Golden caps', category: 'raw', tags: ['caps'] },
  { id: 'raw-inkcap', name: 'Inkcap', category: 'raw', tags: ['caps'] },
  { id: 'raw-birch-catkins', name: 'Silver catkins', category: 'raw', tags: ['fluff'] },

  // Refined materials (content doc → Recipe Tree → Tier 1)
  { id: 'refined-petal-paste', name: 'Petal Paste', category: 'refined' },
  { id: 'refined-leaf-tea', name: 'Leaf Tea', category: 'refined' },
  { id: 'refined-berry-juice', name: 'Berry Juice', category: 'refined' },
  { id: 'refined-fluff-thread', name: 'Fluff Thread', category: 'refined' },
  { id: 'refined-dew-water', name: 'Dew Water', category: 'refined' },
  { id: 'refined-lucky-essence', name: 'Lucky Essence', category: 'refined' },
  { id: 'refined-spore-dust', name: 'Spore Dust', category: 'refined' },
  { id: 'refined-acorn-flour', name: 'Acorn Flour', category: 'refined' },
  { id: 'refined-golden-spore', name: 'Golden Spore', category: 'refined' },

  // Components (Tier 2)
  { id: 'component-sun-salve', name: 'Sun Salve', category: 'component' },
  { id: 'component-lucky-charm-dust', name: 'Lucky Charm Dust', category: 'component' },
  { id: 'component-thistle-twine', name: 'Thistle Twine', category: 'component' },
  { id: 'component-calming-tea', name: 'Calming Tea', category: 'component' },
  { id: 'component-sweet-bait', name: 'Sweet Bait', category: 'component' },
  { id: 'component-pest-smudge', name: 'Pest Smudge', category: 'component' },
  { id: 'component-earth-loam', name: 'Earth Loam', category: 'component' },

  // Potions
  { id: 'potion-greenthumb-brew', name: 'Greenthumb Brew', category: 'potion' },
  { id: 'potion-quickwing-tonic', name: 'Quickwing Tonic', category: 'potion' },
  { id: 'potion-deep-pockets-draught', name: 'Deep Pockets Draught', category: 'potion' },
  { id: 'potion-lucky-dew', name: 'Lucky Dew', category: 'potion' },
  { id: 'potion-swiftroot-elixir', name: 'Swiftroot Elixir', category: 'potion' },

  // Meadow trinkets
  { id: 'trinket-lost-button', name: 'Lost button', category: 'trinket', tags: ['trinket'] },
  { id: 'trinket-glass-bead', name: 'Glass bead', category: 'trinket', tags: ['trinket'] },
  { id: 'trinket-thimble', name: 'Thimble', category: 'trinket', tags: ['trinket'] },

  // Forest trinkets
  { id: 'trinket-glass-marble', name: 'Glass marble', category: 'trinket', tags: ['trinket'] },
  { id: 'trinket-brass-key', name: 'Brass key', category: 'trinket', tags: ['trinket'] },
  { id: 'trinket-ribbon-scrap', name: 'Ribbon scrap', category: 'trinket', tags: ['trinket'] },
]

export const ITEMS: Readonly<Record<string, ItemDef>> = Object.fromEntries(
  ITEM_LIST.map((item) => [item.id, item]),
)

export function itemName(id: string): string {
  return ITEMS[id]?.name ?? id
}

export function itemHasTag(id: string, tag: string): boolean {
  return ITEMS[id]?.tags?.includes(tag) ?? false
}

/** Display names for material tags, e.g. "any petals". */
export const TAG_NAMES: Readonly<Record<string, string>> = {
  petals: 'Petals',
  leaves: 'Leaves',
  caps: 'Caps',
  fruit: 'Fruit',
  fluff: 'Fluff',
  stalks: 'Stalks',
  trinket: 'Trinkets',
}
