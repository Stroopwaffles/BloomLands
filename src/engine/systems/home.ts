import { advanceBuffs } from '../buffs'
import { advanceStations } from '../crafting'
import { advanceHelpers } from '../helpers'
import { advanceResearch } from '../research'
import { stateRandom } from '../rng'
import { advanceSettlements } from '../settlements'
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
  update: (state, dtMs) => {
    const random = stateRandom(state)
    advanceTraders(state, dtMs, random)
    advanceSettlements(state, dtMs, random)
  },
}

/** Helpers go on their trips and bring things home (also while offline). */
export const helpersSystem: System = {
  id: 'helpers',
  update: (state, dtMs) => advanceHelpers(state, dtMs, stateRandom(state)),
}

/** Potion effects count down and wear off. */
export const buffsSystem: System = {
  id: 'buffs',
  update: (state, dtMs) => advanceBuffs(state, dtMs),
}
