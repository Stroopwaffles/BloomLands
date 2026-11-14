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

  // Swamp raw materials
  { id: 'raw-duckweed', name: 'Duckweed', category: 'raw' },
  { id: 'raw-reed-stalks', name: 'Reed stalks', category: 'raw', tags: ['stalks'] },
  { id: 'raw-cattail-fluff', name: 'Cattail fluff', category: 'raw', tags: ['fluff'] },
  { id: 'raw-marigold-petals', name: 'Marigold petals', category: 'raw', tags: ['petals'] },
  { id: 'raw-myrtle-leaves', name: 'Myrtle leaves', category: 'raw', tags: ['leaves'] },
  { id: 'raw-lily-petals', name: 'Lily petals', category: 'raw', tags: ['petals'] },
  { id: 'raw-orchid-petals', name: 'Orchid petals', category: 'raw', tags: ['petals'] },
  { id: 'raw-wisp-lily', name: 'Wisp lily', category: 'raw' },

  // Orchard raw materials
  { id: 'raw-honey', name: 'Honey', category: 'raw' },
  { id: 'raw-apple-petals', name: 'Apple petals', category: 'raw', tags: ['petals'] },
  { id: 'raw-cherry-petals', name: 'Cherry petals', category: 'raw', tags: ['petals'] },
  { id: 'raw-bee-balm-leaves', name: 'Bee balm leaves', category: 'raw', tags: ['leaves'] },
  { id: 'raw-crabapples', name: 'Crabapples', category: 'raw', tags: ['fruit'] },
  { id: 'raw-golden-pollen', name: 'Golden pollen', category: 'raw' },
  { id: 'raw-quince-petals', name: 'Quince petals', category: 'raw', tags: ['petals'] },
  { id: 'raw-royal-jelly', name: 'Royal jelly', category: 'raw' },
  { id: 'raw-truffle', name: 'Truffle', category: 'raw' },

  // Caves raw materials
  { id: 'raw-cave-moss', name: 'Cave moss', category: 'raw', tags: ['leaves'] },
  { id: 'raw-root-fibers', name: 'Root fibers', category: 'raw', tags: ['stalks'] },
  { id: 'raw-glowcap-spores', name: 'Glowcap spores', category: 'raw' },
  { id: 'raw-ghost-petals', name: 'Ghost petals', category: 'raw', tags: ['petals'] },
  { id: 'raw-crystal-shards', name: 'Crystal shards', category: 'raw', tags: ['crystals'] },
  { id: 'raw-star-spores', name: 'Star spores', category: 'raw' },
  { id: 'raw-geode-crystals', name: 'Geode crystals', category: 'raw', tags: ['crystals'] },
  { id: 'raw-star-crystal', name: 'Star crystal', category: 'raw', tags: ['crystals'] },
  { id: 'raw-sunshaft-fern', name: 'Sunshaft fern', category: 'raw' },

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
  { id: 'refined-reed-fiber', name: 'Reed Fiber', category: 'refined' },
  { id: 'refined-lily-oil', name: 'Lily Oil', category: 'refined' },
  { id: 'refined-orchid-essence', name: 'Orchid Essence', category: 'refined' },
  { id: 'refined-honey-syrup', name: 'Honey Syrup', category: 'refined' },
  { id: 'refined-pollen-gold', name: 'Pollen Gold', category: 'refined' },
  { id: 'refined-glow-spores', name: 'Glow Spores', category: 'refined' },
  { id: 'refined-crystal-powder', name: 'Crystal Powder', category: 'refined' },

  // Components (Tier 2)
  { id: 'component-sun-salve', name: 'Sun Salve', category: 'component' },
  { id: 'component-lucky-charm-dust', name: 'Lucky Charm Dust', category: 'component' },
  { id: 'component-thistle-twine', name: 'Thistle Twine', category: 'component' },
  { id: 'component-calming-tea', name: 'Calming Tea', category: 'component' },
  { id: 'component-sweet-bait', name: 'Sweet Bait', category: 'component' },
  { id: 'component-pest-smudge', name: 'Pest Smudge', category: 'component' },
  { id: 'component-earth-loam', name: 'Earth Loam', category: 'component' },
  { id: 'component-lily-balm', name: 'Lily Balm', category: 'component' },
  { id: 'component-beeswax-candle', name: 'Beeswax Candle', category: 'component' },
  { id: 'component-glow-ink', name: 'Glow Ink', category: 'component' },
  { id: 'component-crystal-focus', name: 'Crystal Focus', category: 'component' },
  { id: 'component-heart-nectar', name: 'Heart Nectar', category: 'component' },

  // Potions
  { id: 'potion-greenthumb-brew', name: 'Greenthumb Brew', category: 'potion' },
  { id: 'potion-quickwing-tonic', name: 'Quickwing Tonic', category: 'potion' },
  { id: 'potion-deep-pockets-draught', name: 'Deep Pockets Draught', category: 'potion' },
  { id: 'potion-lucky-dew', name: 'Lucky Dew', category: 'potion' },
  { id: 'potion-swiftroot-elixir', name: 'Swiftroot Elixir', category: 'potion' },
  { id: 'potion-waterstride-philter', name: 'Waterstride Philter', category: 'potion' },
  { id: 'potion-glowlight', name: 'Glowlight Potion', category: 'potion' },

  // Meadow trinkets
  { id: 'trinket-lost-button', name: 'Lost button', category: 'trinket', tags: ['trinket'] },
  { id: 'trinket-glass-bead', name: 'Glass bead', category: 'trinket', tags: ['trinket'] },
  { id: 'trinket-thimble', name: 'Thimble', category: 'trinket', tags: ['trinket'] },

  // Forest trinkets
  { id: 'trinket-glass-marble', name: 'Glass marble', category: 'trinket', tags: ['trinket'] },
  { id: 'trinket-brass-key', name: 'Brass key', category: 'trinket', tags: ['trinket'] },
  { id: 'trinket-ribbon-scrap', name: 'Ribbon scrap', category: 'trinket', tags: ['trinket'] },

  // Swamp trinkets
  { id: 'trinket-bottle-cap', name: 'Bottle cap', category: 'trinket', tags: ['trinket'] },
  { id: 'trinket-fishing-fly', name: 'Fishing fly', category: 'trinket', tags: ['trinket'] },
  { id: 'trinket-tiny-bell', name: 'Tiny bell', category: 'trinket', tags: ['trinket'] },

  // Orchard trinkets
  { id: 'trinket-copper-coin', name: 'Copper coin', category: 'trinket', tags: ['trinket'] },
  { id: 'trinket-sewing-needle', name: 'Sewing needle', category: 'trinket', tags: ['trinket'] },
  { id: 'trinket-seed-packet', name: 'Seed packet', category: 'trinket', tags: ['trinket'] },

  // Caves trinkets
  { id: 'trinket-iron-key', name: 'Old iron key', category: 'trinket', tags: ['trinket'] },
  { id: 'trinket-glass-lens', name: 'Glass lens', category: 'trinket', tags: ['trinket'] },
  { id: 'trinket-silver-ring', name: 'Silver ring', category: 'trinket', tags: ['trinket'] },
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
  crystals: 'Crystals',
  trinket: 'Trinkets',
}
