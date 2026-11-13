import { statsSystem } from './stats'
import type { System } from './types'

/** All systems, in the order they run each tick. Later milestones add to this list. */
export const SYSTEMS: readonly System[] = [statsSystem]

export type { System, TickContext } from './types'
