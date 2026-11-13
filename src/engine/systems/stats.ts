import type { System } from './types'

/** Tracks total play time and offline time (shown on the final screen at the end of the game). */
export const statsSystem: System = {
  id: 'stats',
  update(state, dtMs, ctx) {
    if (ctx.offline) state.stats.offlineMs += dtMs
    else state.stats.activePlayMs += dtMs
  },
}
