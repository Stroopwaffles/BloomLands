/** Day and night (design doc 3.16). One in-game day lasts about an hour of real time. */
export const DAY_MS = 60 * 60_000

export type DayPhase = 'dawn' | 'morning' | 'afternoon' | 'dusk' | 'night'

/** Where each phase starts, as a fraction of the day. */
export const PHASE_STARTS: readonly { phase: DayPhase; at: number; name: string }[] = [
  { phase: 'dawn', at: 0, name: 'Dawn' },
  { phase: 'morning', at: 0.08, name: 'Morning' },
  { phase: 'afternoon', at: 0.3, name: 'Afternoon' },
  { phase: 'dusk', at: 0.55, name: 'Dusk' },
  { phase: 'night', at: 0.62, name: 'Night' },
]

/** A new game starts early in the morning. */
export const START_OF_DAY_MS = 0.1 * DAY_MS
export const NIGHTFALL_MS = 0.62 * DAY_MS
