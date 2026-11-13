import { buffsSystem, helpersSystem, researchSystem, stationsSystem, tradersSystem } from './home'
import { statsSystem } from './stats'
import type { System } from './types'
import { challengesSystem, environmentSystem, regrowthSystem, travelSystem } from './world'

/**
 * All systems, in the order they run each tick. Later milestones add to this list.
 * Buffs run last so a potion's effect covers the whole slice of time it was active for.
 */
export const SYSTEMS: readonly System[] = [
  statsSystem,
  environmentSystem,
  regrowthSystem,
  challengesSystem,
  travelSystem,
  stationsSystem,
  researchSystem,
  tradersSystem,
  helpersSystem,
  buffsSystem,
]

export type { System, TickContext } from './types'
