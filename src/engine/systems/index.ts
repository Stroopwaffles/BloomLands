import { buffsSystem, researchSystem, stationsSystem } from './home'
import { statsSystem } from './stats'
import type { System } from './types'
import { regrowthSystem, travelSystem } from './world'

/**
 * All systems, in the order they run each tick. Later milestones add to this list.
 * Buffs run last so a potion's effect covers the whole slice of time it was active for.
 */
export const SYSTEMS: readonly System[] = [
  statsSystem,
  regrowthSystem,
  travelSystem,
  stationsSystem,
  researchSystem,
  buffsSystem,
]

export type { System, TickContext } from './types'
