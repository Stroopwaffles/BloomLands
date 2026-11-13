import { advanceBuffs } from '../buffs'
import { advanceStations } from '../crafting'
import { advanceResearch } from '../research'
import { stateRandom } from '../rng'
import { advanceTraders } from '../traders'
import type { System } from './types'

/** Crafting jobs at home stations finish into storage (also while away or offline). */
export const stationsSystem: System = {
  id: 'stations',
  update: (state, dtMs) => advanceStations(state, dtMs),
}

export const researchSystem: System = {
  id: 'research',
  update: (state, dtMs) => advanceResearch(state, dtMs),
}

/** Traders arrive with requests, and requests expire. */
export const tradersSystem: System = {
  id: 'traders',
  update: (state, dtMs) => advanceTraders(state, dtMs, stateRandom(state)),
}

/** Potion effects count down and wear off. */
export const buffsSystem: System = {
  id: 'buffs',
  update: (state, dtMs) => advanceBuffs(state, dtMs),
}
