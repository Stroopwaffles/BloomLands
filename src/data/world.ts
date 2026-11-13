import type { RegionDef, SpotDef } from './types'

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

export const REGIONS: Readonly<Record<string, RegionDef>> = {
  meadow: { id: 'meadow', name: 'Meadow', spots: ['buttercup-rise', 'dandelion-drift'] },
}

/**
 * Base flight times in ms, before wing speed. Home sits at the edge of the Meadow.
 * Starting values for balancing.
 */
const ROUTES: Record<string, number> = {
  'home|buttercup-rise': 8_000,
  'home|dandelion-drift': 12_000,
  'buttercup-rise|dandelion-drift': 4_000,
}

export function baseTravelMs(from: string, to: string): number | null {
  if (from === to) return null
  return ROUTES[`${from}|${to}`] ?? ROUTES[`${to}|${from}`] ?? null
}

export function placeName(placeId: string): string {
  return placeId === HOME ? 'Home' : (SPOTS[placeId]?.name ?? placeId)
}
