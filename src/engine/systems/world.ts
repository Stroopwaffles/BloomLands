import { advanceCamps, advanceCreatures, advancePests, advanceSneak } from '../challenges'
import { advanceSecrets } from '../secrets'
import { advanceMountRegions } from '../regions'
import { advanceFinale } from '../ending'
import { advanceMoonTimers } from '../moon'
import { advanceBloomcalls, advanceTime, advanceWeather } from '../environment'
import { regrowSpots } from '../gathering'
import { stateRandom } from '../rng'
import { advanceTravel } from '../travel'
import type { System } from './types'

/** The clock turns and the weather changes. Runs first so everything else sees the new time. */
export const environmentSystem: System = {
  id: 'environment',
  update(state, dtMs) {
    advanceTime(state, dtMs)
    advanceWeather(state, dtMs, stateRandom(state))
    advanceBloomcalls(state, dtMs)
  },
}

/** Pests, creatures and pirate camps come and go. */
export const challengesSystem: System = {
  id: 'challenges',
  update(state, dtMs) {
    const random = stateRandom(state)
    advancePests(state, dtMs, random)
    advanceCreatures(state, dtMs, random)
    advanceCamps(state, dtMs, random)
    advanceSneak(state, dtMs)
    advanceMoonTimers(state, dtMs)
    advanceSecrets(state)
    advanceMountRegions(state, random)
    advanceFinale(state)
  },
}

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
