import type { HelperType } from './helpers'
import type { CostEntry, StationId } from './types'

export type QolId = 'auto-deposit' | 'auto-return' | 'return-trip' | 'bulk-craft'

export type UpgradeEffect =
  | { kind: 'station'; station: StationId }
  | { kind: 'stationSlot'; station: StationId }
  | { kind: 'storage'; amount: number }
  | { kind: 'clickPower'; amount: number }
  | { kind: 'satchel'; amount: number }
  | { kind: 'wingSpeed'; amount: number }
  | { kind: 'qol'; qol: QolId }
  | { kind: 'helpers'; helper: HelperType; amount: number }
  | { kind: 'feature'; feature: 'ritual-circle' }
  | { kind: 'stable'; amount: number }

export type UpgradeCategory = 'lodging' | 'gear' | 'comfort'

export interface UpgradeDef {
  id: string
  name: string
  category: UpgradeCategory
  description: string
  glimmers: number
  items: CostEntry[]
  requires: string[]
  effect: UpgradeEffect
  /** Court points this adds (lodging upgrades grow the court). */
  courtPoints: number
}

export const UPGRADE_CATEGORIES: readonly { id: UpgradeCategory; name: string; note: string }[] = [
  { id: 'lodging', name: 'Lodging', note: 'Grow your home. Each room raises your court.' },
  { id: 'gear', name: 'Gear', note: 'Better tools for gathering and flying.' },
  {
    id: 'comfort',
    name: 'Comforts',
    note: 'Quality-of-life helpers. Once bought, they are yours forever.',
  },
]

/** Stations every new court starts with ("a humble start"). */
export const STARTING_STATIONS: readonly StationId[] = ['mortar', 'drying-rack']

const trinkets = (amount: number): CostEntry => ({ tag: 'trinket', amount })

/** Meadow-era upgrades. Costs are starting values for balancing. */
const UPGRADE_LIST: UpgradeDef[] = [
  // Lodging
  {
    id: 'lodging-storeroom-1',
    name: 'Storeroom',
    category: 'lodging',
    description: '+100 storage space.',
    glimmers: 50,
    items: [],
    requires: [],
    effect: { kind: 'storage', amount: 100 },
    courtPoints: 1,
  },
  {
    id: 'lodging-press',
    name: 'Press Nook',
    category: 'lodging',
    description: 'Builds the press, for juices and dew water.',
    glimmers: 40,
    items: [{ tag: 'petals', amount: 10 }],
    requires: [],
    effect: { kind: 'station', station: 'press' },
    courtPoints: 2,
  },
  {
    id: 'lodging-spinning-wheel',
    name: 'Spinning Corner',
    category: 'lodging',
    description: 'Builds the spinning wheel, for threads.',
    glimmers: 60,
    items: [{ tag: 'fluff', amount: 10 }],
    requires: [],
    effect: { kind: 'station', station: 'spinning-wheel' },
    courtPoints: 2,
  },
  {
    id: 'lodging-cauldron',
    name: 'Hearth and Cauldron',
    category: 'lodging',
    description: 'Builds the cauldron, for components and potions.',
    glimmers: 120,
    items: [{ tag: 'leaves', amount: 15 }],
    requires: [],
    effect: { kind: 'station', station: 'cauldron' },
    courtPoints: 3,
  },
  {
    id: 'lodging-storeroom-2',
    name: 'Bigger Storeroom',
    category: 'lodging',
    description: '+200 storage space.',
    glimmers: 250,
    items: [trinkets(1)],
    requires: ['lodging-storeroom-1'],
    effect: { kind: 'storage', amount: 200 },
    courtPoints: 2,
  },
  {
    id: 'lodging-cauldron-2',
    name: 'Second Cauldron',
    category: 'lodging',
    description: 'Brew two things at once.',
    glimmers: 400,
    items: [trinkets(2)],
    requires: ['lodging-cauldron'],
    effect: { kind: 'stationSlot', station: 'cauldron' },
    courtPoints: 3,
  },
  {
    id: 'lodging-ritual-circle',
    name: 'Ritual Circle',
    category: 'lodging',
    description: 'A ring of smooth stones in the garden, for performing rites.',
    glimmers: 100,
    items: [{ tag: 'petals', amount: 12 }],
    requires: [],
    effect: { kind: 'feature', feature: 'ritual-circle' },
    courtPoints: 2,
  },
  {
    id: 'lodging-roost',
    name: 'Bumblebee Roost',
    category: 'lodging',
    description: 'A cozy roost for a mount. Needed before you can tame one.',
    glimmers: 120,
    items: [{ tag: 'fluff', amount: 10 }],
    requires: [],
    effect: { kind: 'stable', amount: 1 },
    courtPoints: 2,
  },
  {
    id: 'lodging-mouse-bunks',
    name: 'Mouse Bunks',
    category: 'lodging',
    description: 'Room for 2 gatherers. Recruit them at Thimblewick.',
    glimmers: 80,
    items: [{ tag: 'leaves', amount: 10 }],
    requires: [],
    effect: { kind: 'helpers', helper: 'gatherer', amount: 2 },
    courtPoints: 2,
  },
  {
    id: 'lodging-supply-nook',
    name: 'Supply Nook',
    category: 'lodging',
    description: 'Room for 1 supply helper, who keeps your stock topped up.',
    glimmers: 150,
    items: [{ tag: 'petals', amount: 10 }],
    requires: ['lodging-mouse-bunks'],
    effect: { kind: 'helpers', helper: 'supply', amount: 1 },
    courtPoints: 2,
  },
  {
    id: 'lodging-mouse-bunks-2',
    name: 'Bigger Bunkroom',
    category: 'lodging',
    description: 'Room for 2 more gatherers.',
    glimmers: 300,
    items: [trinkets(1)],
    requires: ['lodging-mouse-bunks'],
    effect: { kind: 'helpers', helper: 'gatherer', amount: 2 },
    courtPoints: 2,
  },
  {
    id: 'lodging-supply-nook-2',
    name: 'Supply Loft',
    category: 'lodging',
    description: 'Room for 2 more supply helpers.',
    glimmers: 450,
    items: [trinkets(2)],
    requires: ['lodging-supply-nook'],
    effect: { kind: 'helpers', helper: 'supply', amount: 2 },
    courtPoints: 2,
  },
  {
    id: 'lodging-storeroom-3',
    name: 'Grand Pantry',
    category: 'lodging',
    description: '+400 storage space.',
    glimmers: 800,
    items: [trinkets(2)],
    requires: ['lodging-storeroom-2'],
    effect: { kind: 'storage', amount: 400 },
    courtPoints: 3,
  },
  {
    id: 'lodging-squirrel-drey',
    name: 'Squirrel Drey',
    category: 'lodging',
    description: 'A leafy nest for one more mount (the flying squirrel likes it high up).',
    glimmers: 400,
    items: [{ itemId: 'raw-acorns', amount: 10 }],
    requires: ['lodging-roost'],
    effect: { kind: 'stable', amount: 1 },
    courtPoints: 2,
  },
  {
    id: 'lodging-root-cellar',
    name: 'Root Cellar',
    category: 'lodging',
    description: '+300 storage space, dug cool and dry under the roots.',
    glimmers: 600,
    items: [
      { itemId: 'refined-acorn-flour', amount: 4 },
      { tag: 'leaves', amount: 20 },
    ],
    requires: ['lodging-storeroom-2'],
    effect: { kind: 'storage', amount: 300 },
    courtPoints: 3,
  },
  {
    id: 'lodging-hedgehog-hollow',
    name: 'Hedgehog Hollow',
    category: 'lodging',
    description: 'Room for 2 more gatherers, snug in a mossy bank.',
    glimmers: 550,
    items: [{ itemId: 'raw-moss-tufts', amount: 20 }],
    requires: ['lodging-mouse-bunks-2'],
    effect: { kind: 'helpers', helper: 'gatherer', amount: 2 },
    courtPoints: 2,
  },
  {
    id: 'lodging-press-2',
    name: 'Second Mortar Bench',
    category: 'lodging',
    description: 'One more mortar slot, for all that flour and spore dust.',
    glimmers: 350,
    items: [{ tag: 'caps', amount: 12 }],
    requires: [],
    effect: { kind: 'stationSlot', station: 'mortar' },
    courtPoints: 2,
  },

  // Gear
  {
    id: 'gear-gloves-1',
    name: 'Leaf Gloves',
    category: 'gear',
    description: '+1 click power.',
    glimmers: 30,
    items: [],
    requires: [],
    effect: { kind: 'clickPower', amount: 1 },
    courtPoints: 0,
  },
  {
    id: 'gear-gloves-2',
    name: 'Bark Gloves',
    category: 'gear',
    description: '+1 click power.',
    glimmers: 200,
    items: [trinkets(1)],
    requires: ['gear-gloves-1'],
    effect: { kind: 'clickPower', amount: 1 },
    courtPoints: 0,
  },
  {
    id: 'gear-gloves-3',
    name: 'Beetle-Shell Gauntlets',
    category: 'gear',
    description: '+2 click power.',
    glimmers: 900,
    items: [trinkets(3)],
    requires: ['gear-gloves-2'],
    effect: { kind: 'clickPower', amount: 2 },
    courtPoints: 0,
  },
  {
    id: 'gear-satchel-1',
    name: 'Patched Satchel',
    category: 'gear',
    description: '+10 satchel space.',
    glimmers: 40,
    items: [],
    requires: [],
    effect: { kind: 'satchel', amount: 10 },
    courtPoints: 0,
  },
  {
    id: 'gear-satchel-2',
    name: 'Woven Satchel',
    category: 'gear',
    description: '+15 satchel space.',
    glimmers: 250,
    items: [trinkets(1)],
    requires: ['gear-satchel-1'],
    effect: { kind: 'satchel', amount: 15 },
    courtPoints: 0,
  },
  {
    id: 'gear-satchel-3',
    name: 'Silk Satchel',
    category: 'gear',
    description: '+25 satchel space.',
    glimmers: 1000,
    items: [trinkets(3)],
    requires: ['gear-satchel-2'],
    effect: { kind: 'satchel', amount: 25 },
    courtPoints: 0,
  },
  {
    id: 'gear-wings-1',
    name: 'Wing Stretches',
    category: 'gear',
    description: 'Flights 25% faster.',
    glimmers: 50,
    items: [],
    requires: [],
    effect: { kind: 'wingSpeed', amount: 0.25 },
    courtPoints: 0,
  },
  {
    id: 'gear-wings-2',
    name: 'Morning Flight Drills',
    category: 'gear',
    description: 'Flights another 25% faster.',
    glimmers: 300,
    items: [trinkets(1)],
    requires: ['gear-wings-1'],
    effect: { kind: 'wingSpeed', amount: 0.25 },
    courtPoints: 0,
  },
  {
    id: 'gear-wings-3',
    name: 'Dragonfly Lessons',
    category: 'gear',
    description: 'Flights another 50% faster.',
    glimmers: 1200,
    items: [trinkets(3)],
    requires: ['gear-wings-2'],
    effect: { kind: 'wingSpeed', amount: 0.5 },
    courtPoints: 0,
  },

  // Comforts (quality of life; kept forever, design doc 3.11)
  {
    id: 'qol-auto-return',
    name: 'Homing Instinct',
    category: 'comfort',
    description: 'Fly home automatically when your satchel is full.',
    glimmers: 150,
    items: [trinkets(1)],
    requires: [],
    effect: { kind: 'qol', qol: 'auto-return' },
    courtPoints: 0,
  },
  {
    id: 'qol-auto-deposit',
    name: 'Tidy Habits',
    category: 'comfort',
    description: 'Unpack your satchel into storage as soon as you get home.',
    glimmers: 80,
    items: [trinkets(1)],
    requires: [],
    effect: { kind: 'qol', qol: 'auto-deposit' },
    courtPoints: 0,
  },
  {
    id: 'qol-return-trip',
    name: 'Round Trips',
    category: 'comfort',
    description: 'After flying home with a full satchel, fly straight back to where you were.',
    glimmers: 250,
    items: [trinkets(2)],
    requires: ['qol-auto-return', 'qol-auto-deposit'],
    effect: { kind: 'qol', qol: 'return-trip' },
    courtPoints: 0,
  },
  {
    id: 'qol-bulk-craft',
    name: 'Big Batches',
    category: 'comfort',
    description: 'Craft five at once at any station.',
    glimmers: 200,
    items: [trinkets(2)],
    requires: [],
    effect: { kind: 'qol', qol: 'bulk-craft' },
    courtPoints: 0,
  },
]

export const UPGRADES: Readonly<Record<string, UpgradeDef>> = Object.fromEntries(
  UPGRADE_LIST.map((upgrade) => [upgrade.id, upgrade]),
)

export const UPGRADE_ORDER: readonly string[] = UPGRADE_LIST.map((upgrade) => upgrade.id)

/** How many items one batch makes when Big Batches is owned. */
export const BULK_CRAFT_COUNT = 5
