import type { RegionDef, SettlementDef, SpotDef } from './types'

/** The player's home. Not a harvesting spot, but a place you can fly to. It sits in the Meadow. */
export const HOME = 'home'

// ---------------------------------------------------------------------------------------------
// Harvesting spots (content doc → each region's Sublocations)

const SPOT_LIST: SpotDef[] = [
  // Meadow
  {
    id: 'buttercup-rise',
    name: 'Buttercup Rise',
    regionId: 'meadow',
    description: 'A gentle sunny slope. Easy plants only.',
    plants: [
      'plant-clover',
      'plant-daisy',
      'plant-buttercup',
      'plant-morning-dew',
      'plant-four-leaf-clover',
    ],
    slots: 6,
    regrowMs: 20_000,
    trinkets: ['trinket-lost-button', 'trinket-thimble'],
  },
  {
    id: 'dandelion-drift',
    name: 'Dandelion Drift',
    regionId: 'meadow',
    description: 'A breezy hollow where dandelion seeds float.',
    plants: ['plant-dandelion', 'plant-wild-strawberry', 'plant-morning-dew'],
    slots: 6,
    regrowMs: 25_000,
    trinkets: ['trinket-glass-bead', 'trinket-lost-button'],
  },

  // Forest
  {
    id: 'fernshade-floor',
    name: 'Fernshade Floor',
    regionId: 'forest',
    description: 'The cool forest floor under the ferns. Mushrooms and moss.',
    plants: ['plant-moss', 'plant-fern', 'plant-button-mushroom', 'plant-red-cap'],
    slots: 6,
    regrowMs: 26_000,
    trinkets: ['trinket-glass-marble', 'trinket-brass-key'],
  },
  {
    id: 'mossy-stump-ring',
    name: 'Mossy Stump Ring',
    regionId: 'forest',
    description:
      "A ring of old stumps in a sunbeam clearing. Berries, acorns, the Forest's treasures.",
    plants: ['plant-bilberry', 'plant-acorn', 'plant-moss', 'plant-golden-chanterelle'],
    slots: 6,
    regrowMs: 30_000,
    trinkets: ['trinket-ribbon-scrap', 'trinket-brass-key'],
  },

  // Swamp
  {
    id: 'reeds-hollow',
    name: 'Reeds Hollow',
    regionId: 'swamp',
    description: 'A dense bed of reeds and cattails along the bank.',
    plants: ['plant-reed', 'plant-cattail', 'plant-marsh-marigold', 'plant-bog-myrtle'],
    slots: 6,
    regrowMs: 28_000,
    trinkets: ['trinket-bottle-cap', 'trinket-fishing-fly'],
  },
  {
    id: 'lilypad-pools',
    name: 'Lilypad Pools',
    regionId: 'swamp',
    description: 'Open water dotted with lilies. Easier to reach with the frog.',
    plants: ['plant-duckweed', 'plant-water-lily', 'plant-bog-orchid'],
    slots: 6,
    regrowMs: 30_000,
    trinkets: ['trinket-tiny-bell', 'trinket-bottle-cap'],
    water: true,
  },

  // Secret areas: hidden until unlocked, re-locked on prestige (design doc 3.12)
  {
    id: 'fairy-ring',
    name: 'The Fairy Ring',
    regionId: 'meadow',
    description: 'A circle of mushrooms that only shows itself after a rite performed at dawn.',
    plants: ['plant-ringcap', 'plant-clover', 'plant-daisy', 'plant-morning-dew'],
    slots: 6,
    regrowMs: 30_000,
    trinkets: ['trinket-glass-bead', 'trinket-thimble'],
    secret: {
      curioId: 'curio-pocket-sundial',
      outfitId: 'outfit-dewdrop',
      unlock: { kind: 'ritual', hint: 'Perform the Rite of Dawn in the morning.' },
    },
  },
  {
    id: 'hollow-log-library',
    name: 'The Hollow Log Library',
    regionId: 'forest',
    description: "Old Burdock's secret reading room, inside a fallen log lined with mossy shelves.",
    plants: ['plant-inkcap', 'plant-fern', 'plant-moss', 'plant-button-mushroom'],
    slots: 6,
    regrowMs: 32_000,
    trinkets: ['trinket-brass-key', 'trinket-glass-marble'],
    secret: {
      curioId: 'curio-pressed-flower-bookmark',
      outfitId: 'outfit-scholar',
      unlock: {
        kind: 'story',
        storyId: 'story-burdock',
        hint: "Finish Old Burdock's storyline.",
      },
    },
  },
  {
    id: 'lost-grove',
    name: 'The Lost Grove',
    regionId: 'forest',
    description: 'A silver-birch glade the Forest only shows to those who have helped it bloom.',
    plants: ['plant-birch-catkin', 'plant-bilberry', 'plant-fern', 'plant-golden-chanterelle'],
    slots: 6,
    regrowMs: 32_000,
    trinkets: ['trinket-ribbon-scrap', 'trinket-glass-marble'],
    secret: {
      curioId: 'curio-heartwood-charm',
      outfitId: 'outfit-acorn',
      unlock: { kind: 'bloom', level: 3, hint: 'Help the Forest reach Budding bloom.' },
    },
  },
  {
    id: 'wisp-hollow',
    name: 'Wisp Hollow',
    regionId: 'swamp',
    description: "A hidden pool the will-o'-wisps lead you to, once the Swamp is blooming.",
    plants: ['plant-wisp-lily', 'plant-water-lily', 'plant-cattail', 'plant-duckweed'],
    slots: 6,
    regrowMs: 32_000,
    trinkets: ['trinket-tiny-bell', 'trinket-fishing-fly'],
    water: true,
    secret: {
      curioId: 'curio-wisp-lantern',
      outfitId: 'outfit-lantern-bug',
      unlock: { kind: 'bloom', level: 3, hint: 'Help the Swamp reach Budding bloom.' },
    },
  },
]

export const SPOTS: Readonly<Record<string, SpotDef>> = Object.fromEntries(
  SPOT_LIST.map((spot) => [spot.id, spot]),
)

// ---------------------------------------------------------------------------------------------
// Settlements and spirit places

export const SETTLEMENTS: Readonly<Record<string, SettlementDef>> = {
  thimblewick: {
    id: 'thimblewick',
    name: 'Thimblewick',
    regionId: 'meadow',
    description:
      'A village of field mice living in burrows and old thimbles under the roots of a hawthorn.',
    folk: 'field mice',
  },
  acornhollow: {
    id: 'acornhollow',
    name: 'Acornhollow',
    regionId: 'forest',
    description:
      'Squirrels and hedgehogs living together inside a huge hollow oak, with round doors at every level.',
    folk: 'squirrels and hedgehogs',
  },
  'toad-village': {
    id: 'toad-village',
    name: 'Toad Village',
    regionId: 'swamp',
    description:
      'Toads living in mud-domed houses on giant lily pads, linked by wobbly reed bridges.',
    folk: 'toads',
  },
}

export interface SpiritPlaceDef {
  id: string
  name: string
  regionId: string
  description: string
  spiritId: string
}

export const SPIRIT_PLACES: Readonly<Record<string, SpiritPlaceDef>> = {
  'sunstone-hill': {
    id: 'sunstone-hill',
    name: 'Sunstone Hill',
    regionId: 'meadow',
    description: 'A warm flat stone at the top of the meadow, where the spirit rests.',
    spiritId: 'spirit-sorrel',
  },
  'elder-oak': {
    id: 'elder-oak',
    name: 'The Elder Oak',
    regionId: 'forest',
    description: 'The oldest tree in the forest, with a face in its bark if you look closely.',
    spiritId: 'spirit-bramblebeard',
  },
  'sunken-willow': {
    id: 'sunken-willow',
    name: 'The Sunken Willow',
    regionId: 'swamp',
    description: 'A willow half under water, its branches trailing in the still pool.',
    spiritId: 'spirit-mirebelle',
  },
}

// ---------------------------------------------------------------------------------------------
// Regions (content doc → Recipe Tree → region unlocks)

export const REGIONS: Readonly<Record<string, RegionDef>> = {
  meadow: {
    id: 'meadow',
    name: 'Meadow',
    settlement: 'thimblewick',
    spiritPlace: 'sunstone-hill',
    secretSpots: ['fairy-ring'],
    spots: ['buttercup-rise', 'dandelion-drift'],
    unlock: null,
  },
  forest: {
    id: 'forest',
    name: 'Forest',
    settlement: 'acornhollow',
    spiritPlace: 'elder-oak',
    secretSpots: ['hollow-log-library', 'lost-grove'],
    spots: ['fernshade-floor', 'mossy-stump-ring'],
    unlock: { rank: 1, ritualId: 'ritual-open-path' },
  },
  swamp: {
    id: 'swamp',
    name: 'Swamp',
    settlement: 'toad-village',
    spiritPlace: 'sunken-willow',
    secretSpots: ['wisp-hollow'],
    spots: ['reeds-hollow', 'lilypad-pools'],
    unlock: { rank: 2, ritualId: 'ritual-reed-gate' },
  },
}

export const REGION_ORDER: readonly string[] = ['meadow', 'forest', 'swamp']

/** Every place you can fly to, in display order. */
export function allPlaces(): string[] {
  return [
    HOME,
    ...REGION_ORDER.flatMap((id) => {
      const region = REGIONS[id]
      return [region.settlement, ...region.spots, region.spiritPlace, ...region.secretSpots]
    }),
  ]
}

export function isSpot(placeId: string): boolean {
  return placeId in SPOTS
}

export function isSecret(placeId: string): boolean {
  return SPOTS[placeId]?.secret !== undefined
}

export function isSettlement(placeId: string): boolean {
  return placeId in SETTLEMENTS
}

export function isSpiritPlace(placeId: string): boolean {
  return placeId in SPIRIT_PLACES
}

/** The region a place belongs to. Home sits at the edge of the Meadow. */
export function placeRegion(placeId: string): string {
  if (placeId === HOME) return 'meadow'
  return (
    SPOTS[placeId]?.regionId ??
    SETTLEMENTS[placeId]?.regionId ??
    SPIRIT_PLACES[placeId]?.regionId ??
    'meadow'
  )
}

// ---------------------------------------------------------------------------------------------
// Flight times (design doc 3.12: short hops within a region, long flights between regions)

/** Hand-tuned routes in the Meadow. Starting values for balancing. */
const ROUTES: Record<string, number> = {
  'home|buttercup-rise': 8_000,
  'home|dandelion-drift': 12_000,
  'buttercup-rise|dandelion-drift': 4_000,
  'home|thimblewick': 6_000,
  'thimblewick|buttercup-rise': 5_000,
  'thimblewick|dandelion-drift': 7_000,
  'home|sunstone-hill': 10_000,
  'thimblewick|sunstone-hill': 8_000,
  'buttercup-rise|sunstone-hill': 5_000,
  'dandelion-drift|sunstone-hill': 7_000,
  'home|fairy-ring': 9_000,
  'buttercup-rise|fairy-ring': 4_000,
  'dandelion-drift|fairy-ring': 6_000,
  'thimblewick|fairy-ring': 7_000,
  'sunstone-hill|fairy-ring': 6_000,
}

/** A short hop between two places in the same region (when there's no hand-tuned route). */
export const HOP_MS = 5_000
/** A long flight to a neighboring region; each region further adds this again. */
export const REGION_FLIGHT_MS = 18_000

/**
 * Flights to open water (spot.water) take this much longer, unless you ride a mount that swims
 * (the frog) or have drunk a Waterstride Philter.
 */
export const WATER_FLIGHT_FACTOR = 1.4

export function baseTravelMs(from: string, to: string): number | null {
  if (from === to) return null
  const route = ROUTES[`${from}|${to}`] ?? ROUTES[`${to}|${from}`]
  if (route !== undefined) return route
  const a = REGION_ORDER.indexOf(placeRegion(from))
  const b = REGION_ORDER.indexOf(placeRegion(to))
  if (a < 0 || b < 0) return null
  return a === b ? HOP_MS : REGION_FLIGHT_MS * Math.abs(a - b)
}

export function placeName(placeId: string): string {
  if (placeId === HOME) return 'Home'
  return (
    SPOTS[placeId]?.name ?? SETTLEMENTS[placeId]?.name ?? SPIRIT_PLACES[placeId]?.name ?? placeId
  )
}
