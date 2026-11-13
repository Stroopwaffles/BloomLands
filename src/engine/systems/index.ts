import { statsSystem } from './stats'
import type { System } from './types'
import { regrowthSystem, travelSystem } from './world'

/** All systems, in the order they run each tick. Later milestones add to this list. */
export const SYSTEMS: readonly System[] = [statsSystem, regrowthSystem, travelSystem]

export type { System, TickContext } from './types'
