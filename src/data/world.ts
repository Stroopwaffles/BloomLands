import type { RegionDef, SettlementDef, SpotDef } from './types'

/** The player's home. Not a harvesting spot, but a place you can fly to. */
export const HOME = 'home'

const SPOT_LIST: SpotDef[] = [
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
]

export const SPOTS: Readonly<Record<string, SpotDef>> = Object.fromEntries(
  SPOT_LIST.map((spot) => [spot.id, spot]),
)

// Secret areas (content doc → each region's Secret Areas)
const SECRET_SPOTS: SpotDef[] = [
  {
    id: 'fairy-ring',
    name: 'The Fairy Ring',
    regionId: 'meadow',
    description: 'A circle of mushrooms that only shows itself after a rite performed at dawn.',
    plants: ['plant-ringcap', 'plant-clover', 'plant-daisy', 'plant-morning-dew'],
    slots: 6,
    regrowMs: 30_000,
    trinkets: ['trinket-glass-bead', 'trinket-thimble'],
    secret: { curioId: 'curio-pocket-sundial', outfitId: 'outfit-dewdrop' },
  },
]
for (const spot of SECRET_SPOTS) (SPOTS as Record<string, SpotDef>)[spot.id] = spot

export const SETTLEMENTS: Readonly<Record<string, SettlementDef>> = {
  thimblewick: {
    id: 'thimblewick',
    name: 'Thimblewick',
    regionId: 'meadow',
    description:
      'A village of field mice living in burrows and old thimbles under the roots of a hawthorn.',
    folk: 'field mice',
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
}

export const REGIONS: Readonly<Record<string, RegionDef>> = {
  meadow: {
    id: 'meadow',
    name: 'Meadow',
    settlement: 'thimblewick',
    spiritPlace: 'sunstone-hill',
    secretSpots: ['fairy-ring'],
    spots: ['buttercup-rise', 'dandelion-drift'],
  },
}

/** Every place you can fly to, in display order. */
export function allPlaces(): string[] {
  return [
    HOME,
    ...Object.values(REGIONS).flatMap((region) => [
      region.settlement,
      ...region.spots,
      region.spiritPlace,
      ...region.secretSpots,
    ]),
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

/**
 * Base flight times in ms, before wing speed. Home sits at the edge of the Meadow.
 * Starting values for balancing.
 */
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

export function baseTravelMs(from: string, to: string): number | null {
  if (from === to) return null
  return ROUTES[`${from}|${to}`] ?? ROUTES[`${to}|${from}`] ?? null
}

export function placeName(placeId: string): string {
  if (placeId === HOME) return 'Home'
  return (
    SPOTS[placeId]?.name ?? SETTLEMENTS[placeId]?.name ?? SPIRIT_PLACES[placeId]?.name ?? placeId
  )
}
