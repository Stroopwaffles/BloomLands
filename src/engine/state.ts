import { GAME_VERSION, SAVE_VERSION } from './version'

/**
 * The complete game state. Everything a save needs lives here, and it must stay
 * plain JSON (no classes, Maps, Dates or functions) so it can be saved and loaded.
 */
export interface GameState {
  meta: {
    saveVersion: number
    gameVersion: string
    /** When this game (run 1) was started. ms since epoch. */
    createdAt: number
    /** Wall-clock time the engine last advanced to. ms since epoch. */
    lastTickAt: number
    /** Last successful save. ms since epoch, or null if never saved. */
    lastSavedAt: number | null
  }
  resources: {
    glimmers: number
    trinkets: number
  }
  /** Item stock by item ID, e.g. { 'raw-clover-leaves': 12 }. */
  inventory: Record<string, number>
  /** Permanent or run bonuses that engine rules read. Filled in by later systems. */
  bonuses: {
    /** Extra offline progress allowed on top of the base 4 hours. */
    offlineCapMs: number
  }
  stats: {
    /** Time simulated while the game was open. */
    activePlayMs: number
    /** Time simulated as offline progress. */
    offlineMs: number
  }
}

export function createNewGame(now: number): GameState {
  return {
    meta: {
      saveVersion: SAVE_VERSION,
      gameVersion: GAME_VERSION,
      createdAt: now,
      lastTickAt: now,
      lastSavedAt: null,
    },
    resources: {
      glimmers: 0,
      trinkets: 0,
    },
    inventory: {},
    bonuses: {
      offlineCapMs: 0,
    },
    stats: {
      activePlayMs: 0,
      offlineMs: 0,
    },
  }
}
