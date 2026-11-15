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

  // Moonlit Glade raw materials
  { id: 'raw-starmoss', name: 'Starmoss', category: 'raw', tags: ['leaves'] },
  { id: 'raw-jasmine-blossoms', name: 'Jasmine blossoms', category: 'raw', tags: ['moonflowers'] },
  { id: 'raw-primrose-petals', name: 'Primrose petals', category: 'raw', tags: ['petals'] },
  { id: 'raw-moonpetals', name: 'Moonpetals', category: 'raw', tags: ['petals', 'moonflowers'] },
  { id: 'raw-moonlight', name: 'Moonlight', category: 'raw' },
  { id: 'raw-silver-fronds', name: 'Silver fronds', category: 'raw', tags: ['leaves'] },
  { id: 'raw-midnight-petals', name: 'Midnight petals', category: 'raw', tags: ['petals'] },
  { id: 'raw-stardust', name: 'Stardust', category: 'raw' },
  { id: 'raw-poppy-petals', name: 'Poppy petals', category: 'raw', tags: ['petals'] },

  // Sky Isles raw materials
  { id: 'raw-skybell-petals', name: 'Skybell petals', category: 'raw', tags: ['petals'] },
  { id: 'raw-rainbow-moss', name: 'Rainbow moss', category: 'raw', tags: ['leaves'] },
  { id: 'raw-cloud-fluff', name: 'Cloud fluff', category: 'raw', tags: ['fluff'] },
  { id: 'raw-sunpetals', name: 'Sunpetals', category: 'raw', tags: ['petals'] },
  { id: 'raw-thistledown', name: 'Thistledown', category: 'raw', tags: ['fluff'] },
  { id: 'raw-storm-essence', name: 'Storm essence', category: 'raw' },
  { id: 'raw-aurora-petals', name: 'Aurora petals', category: 'raw' },
  { id: 'raw-prism-petals', name: 'Prism petals', category: 'raw' },
  { id: 'raw-whisperleaf', name: 'Whisperleaf', category: 'raw', tags: ['leaves'] },

  // Blood Moon materials: they go straight to the Moonless Manor's pantry
  { id: 'event-bloodrose-petals', name: 'Bloodrose petals', category: 'event' },
  { id: 'event-grave-moss', name: 'Grave moss', category: 'event' },
  { id: 'event-nightshade', name: 'Nightshade berries', category: 'event' },
  { id: 'event-ghostcap', name: 'Ghostcaps', category: 'event' },
  { id: 'event-batwing-fronds', name: 'Batwing fronds', category: 'event' },
  { id: 'event-widows-lace', name: "Widow's lace", category: 'event' },
  { id: 'event-moonblood', name: 'Moonblood', category: 'event' },
  { id: 'event-bloodrose-essence', name: 'Bloodrose Essence', category: 'event' },
  { id: 'event-shadow-silk', name: 'Shadow Silk', category: 'event' },
  { id: 'event-ghostlight-wax', name: 'Ghostlight Wax', category: 'event' },

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
  { id: 'refined-moonpetal-oil', name: 'Moonpetal Oil', category: 'refined' },
  { id: 'refined-moonlight-tincture', name: 'Moonlight Tincture', category: 'refined' },
  { id: 'refined-cloud-silk', name: 'Cloud Silk', category: 'refined' },
  { id: 'refined-storm-vial', name: 'Storm Vial', category: 'refined' },
  { id: 'refined-aurora-dye', name: 'Aurora Dye', category: 'refined' },

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
  { id: 'component-harmony-blend', name: 'Harmony Blend', category: 'component' },
  { id: 'component-moon-draught', name: 'Moon Draught', category: 'component' },
  { id: 'component-starlight-lens', name: 'Starlight Lens', category: 'component' },
  { id: 'component-wind-silk', name: 'Wind Silk', category: 'component' },
  { id: 'component-everbloom-essence', name: 'Everbloom Essence', category: 'component' },

  // Potions
  { id: 'potion-greenthumb-brew', name: 'Greenthumb Brew', category: 'potion' },
  { id: 'potion-quickwing-tonic', name: 'Quickwing Tonic', category: 'potion' },
  { id: 'potion-deep-pockets-draught', name: 'Deep Pockets Draught', category: 'potion' },
  { id: 'potion-lucky-dew', name: 'Lucky Dew', category: 'potion' },
  { id: 'potion-swiftroot-elixir', name: 'Swiftroot Elixir', category: 'potion' },
  { id: 'potion-waterstride-philter', name: 'Waterstride Philter', category: 'potion' },
  { id: 'potion-glowlight', name: 'Glowlight Potion', category: 'potion' },
  { id: 'potion-moonsight', name: 'Moonsight Potion', category: 'potion' },
  { id: 'potion-featherfall', name: 'Featherfall Tonic', category: 'potion' },

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

  // Moonlit Glade trinkets
  { id: 'trinket-pearl', name: 'Pearl', category: 'trinket', tags: ['trinket'] },
  { id: 'trinket-silver-spoon', name: 'Silver spoon', category: 'trinket', tags: ['trinket'] },
  { id: 'trinket-music-box-key', name: 'Music-box key', category: 'trinket', tags: ['trinket'] },

  // Sky Isles trinkets
  { id: 'trinket-golden-feather', name: 'Golden feather', category: 'trinket', tags: ['trinket'] },
  { id: 'trinket-kite-string', name: 'Kite string', category: 'trinket', tags: ['trinket'] },
  { id: 'trinket-brass-gear', name: 'Brass gear', category: 'trinket', tags: ['trinket'] },
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
  moonflowers: 'Moonflowers',
  trinket: 'Trinkets',
}
