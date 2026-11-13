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

  // Meadow trinkets
  { id: 'trinket-lost-button', name: 'Lost button', category: 'trinket' },
  { id: 'trinket-glass-bead', name: 'Glass bead', category: 'trinket' },
  { id: 'trinket-thimble', name: 'Thimble', category: 'trinket' },
]

export const ITEMS: Readonly<Record<string, ItemDef>> = Object.fromEntries(
  ITEM_LIST.map((item) => [item.id, item]),
)

export function itemName(id: string): string {
  return ITEMS[id]?.name ?? id
}
