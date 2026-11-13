import { advanceBuffs } from '../buffs'
import { advanceStations } from '../crafting'
import { advanceResearch } from '../research'
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

/** Potion effects count down and wear off. */
export const buffsSystem: System = {
  id: 'buffs',
  update: (state, dtMs) => advanceBuffs(state, dtMs),
}
