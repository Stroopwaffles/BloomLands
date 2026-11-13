import { regrowSpots } from '../gathering'
import { stateRandom } from '../rng'
import { advanceTravel } from '../travel'
import type { System } from './types'

/** Plants regrow in every visited spot, even while the player is elsewhere or offline. */
export const regrowthSystem: System = {
  id: 'regrowth',
  update(state, dtMs) {
    regrowSpots(state, dtMs, stateRandom(state))
  },
}

/** Flights progress and land. */
export const travelSystem: System = {
  id: 'travel',
  update(state, dtMs) {
    advanceTravel(state, dtMs, stateRandom(state))
  },
}
