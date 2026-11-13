import { HOME } from '../data/world'
import { GAME_VERSION, SAVE_VERSION } from './version'

/** One plant slot in a harvesting spot. */
export interface SlotState {
  /** The plant growing here, or null while the slot regrows. */
  plantId: string | null
  /** Clicks of damage still needed to harvest (counts down by click power). */
  hp: number
  /** Time left until an empty slot grows a new plant. */
  regrowMs: number
}

export interface SpotState {
  slots: SlotState[]
}

export interface TravelState {
  to: string
  totalMs: number
  remainingMs: number
}

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
  /** Random number generator state, saved so results are reproducible. */
  rng: number
  player: {
    /** Where the player is, or where they took off from while flying. 'home' or a spot ID. */
    place: string
    /** Set while flying somewhere. */
    travel: TravelState | null
    /** Items carried on the current trip. */
    satchel: Record<string, number>
    satchelCapacity: number
    /** Damage per tap. */
    clickPower: number
    /** Multiplies flight speed (mounts multiply it further, later). */
    wingSpeed: number
  }
  resources: {
    glimmers: number
    trinkets: number
  }
  /** Home storage: item stock by item ID, e.g. { 'raw-clover-leaves': 12 }. */
  inventory: Record<string, number>
  /** Harvesting spots the player has visited, by spot ID. */
  spots: Record<string, SpotState>
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
    plantsHarvested: number
    taps: number
  }
}

export const BASE_SATCHEL_CAPACITY = 20

export function createNewGame(now: number): GameState {
  return {
    meta: {
      saveVersion: SAVE_VERSION,
      gameVersion: GAME_VERSION,
      createdAt: now,
      lastTickAt: now,
      lastSavedAt: null,
    },
    rng: now >>> 0,
    player: {
      place: HOME,
      travel: null,
      satchel: {},
      satchelCapacity: BASE_SATCHEL_CAPACITY,
      clickPower: 1,
      wingSpeed: 1,
    },
    resources: {
      glimmers: 0,
      trinkets: 0,
    },
    inventory: {},
    spots: {},
    bonuses: {
      offlineCapMs: 0,
    },
    stats: {
      activePlayMs: 0,
      offlineMs: 0,
      plantsHarvested: 0,
      taps: 0,
    },
  }
}

/** Total number of items in a stack record (satchel or storage). */
export function countItems(stacks: Record<string, number>): number {
  let total = 0
  for (const amount of Object.values(stacks)) total += amount
  return total
}

export function addItems(stacks: Record<string, number>, itemId: string, amount: number): void {
  const next = (stacks[itemId] ?? 0) + amount
  if (next > 0) stacks[itemId] = next
  else delete stacks[itemId]
}
