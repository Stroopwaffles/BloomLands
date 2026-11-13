import {
  DEFAULT_LOOK,
  defaultWardrobe,
  type CharacterLook,
  type Wardrobe,
} from '../data/appearance'
import type { FlightEventKind, WeatherKind } from '../data/challenges'
import type { HelperType } from '../data/helpers'
import { START_OF_DAY_MS } from '../data/time'
import type { ItemStack, StationId } from '../data/types'
import type { GameEvent } from './events'
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
  /** Pests on this plant; each tap clears one before the plant itself can be tapped. */
  pests?: number
}

export interface SpotState {
  slots: SlotState[]
  /** Time until this spot next checks for pests. */
  pestCheckMs?: number
}

export interface WeatherState {
  kind: WeatherKind
  remainingMs: number
}

/** A large creature visiting a harvesting spot. */
export interface CreatureState {
  creatureId: string
  tapsLeft: number
  /** Time until it wanders off by itself. */
  remainingMs: number
  /** Time until it eats another plant. */
  eatMs: number
}

/** Something happening mid-flight (design doc 3.15). */
export interface FlightEventState {
  kind: FlightEventKind
  /** The event shows up once the flight has this much time left. */
  showAtMs: number
  /** Taps so far (shooing pirates, catching seeds). */
  taps: number
  resolved: boolean
  /** Gusts: true if it was a tailwind. */
  tailwind?: boolean
}

/** A timed job: crafting at a station, or research. */
export interface JobState {
  /** Recipe ID (stations) or research ID (research). */
  id: string
  totalMs: number
  remainingMs: number
  /** Batch size for crafting (Big Batches). Missing means 1. */
  count?: number
}

export interface StationState {
  jobs: JobState[]
}

export interface BuffState {
  /** The potion that gave this buff. */
  potionId: string
  remainingMs: number
}

export interface TravelState {
  to: string
  totalMs: number
  remainingMs: number
  /** True for a flight home started by Homing Instinct (so Round Trips can fly back after). */
  auto?: boolean
  event?: FlightEventState
}

export type HelperPhase = 'idle' | 'outbound' | 'gathering' | 'returning' | 'unloading'

/** One recruited helper and what they're doing. */
export interface HelperState {
  id: number
  type: HelperType
  name: string
  /** Gatherers: the spot they work (null = resting at home). Supply helpers choose their own. */
  task: string | null
  phase: HelperPhase
  /** Time left in the current phase. */
  remainingMs: number
  /** Spot of the current trip. */
  tripSpot: string | null
  /** Supply helpers: the item this trip is fetching. */
  tripItem: string | null
  /** What they're carrying home. */
  bag: Record<string, number>
}

/** A visiting trader's request: bring these items, get this reward. */
export interface TradeRequest {
  id: number
  traderId: string
  wants: ItemStack[]
  glimmers: number
  trinketId: string | null
  /** Time until the trader moves on. */
  remainingMs: number
}

export interface StoryProgress {
  chapter: number
  /** The task's stat when the chapter began (progress counts from here). */
  statStart: number
  complete: boolean
}

export interface SettlementState {
  requests: TradeRequest[]
  nextArrivalMs: number
  /** Requests fulfilled here this run. */
  filled: number
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
  /** The player's fairy (design doc 3.13). Kept through prestige. */
  character: {
    /** False until the player finishes the character creator. */
    created: boolean
    look: CharacterLook
    wardrobe: Wardrobe
  }
  /** Position in the in-game day (0 = dawn), in ms. */
  time: {
    dayMs: number
  }
  /** Weather by region ID. */
  weather: Record<string, WeatherState>
  challenges: {
    /** Large creatures, by the spot they're visiting. */
    creatures: Record<string, CreatureState>
    /** Pirate camps, by spot: crew ID. */
    camps: Record<string, string>
    nextCreatureMs: number
    nextCampMs: number
  }
  player: {
    /** Where the player is, or where they took off from while flying. 'home' or a spot ID. */
    place: string
    /** Set while flying somewhere. */
    travel: TravelState | null
    /** The last harvesting spot visited (for Round Trips). */
    lastSpot: string | null
    /** Items carried on the current trip. */
    satchel: Record<string, number>
    /** When true, costs are paid from storage only and the satchel is left alone. */
    satchelLocked: boolean
    /** Base satchel space, before gear and potions. */
    satchelCapacity: number
    /** Base damage per tap, before gear and potions. */
    clickPower: number
    /** Base flight speed, before gear, potions and (later) mounts. */
    wingSpeed: number
  }
  resources: {
    glimmers: number
  }
  /** Home storage: item stock by item ID, e.g. { 'raw-clover-leaves': 12 }. Trinkets live here. */
  inventory: Record<string, number>
  /** Base storage space, before lodging upgrades. */
  storageCapacity: number
  /** Harvesting spots the player has visited, by spot ID. */
  spots: Record<string, SpotState>
  /** Home crafting stations, by station ID. Only built stations can be used. */
  stations: Record<StationId, StationState>
  research: {
    /** IDs of finished research. */
    completed: string[]
    current: JobState | null
  }
  /** Active potion effects. */
  buffs: BuffState[]
  /** IDs of bought upgrades (lodging, gear and comforts). */
  upgrades: string[]
  helpers: {
    list: HelperState[]
    nextId: number
  }
  supply: {
    /** Minimum stock levels by item ID. Supply helpers fetch anything below its minimum. */
    minimums: Record<string, number>
  }
  /** Bloom points by region ID (design doc 3.9). */
  bloom: Record<string, number>
  /** Curios found this run. */
  curios: string[]
  mounts: {
    /** Creatures being befriended: feedings so far and time until the next feeding. */
    friendship: Record<string, { feedings: number; cooldownMs: number }>
    /** Tamed mounts and their levels. */
    owned: Record<string, { level: number }>
    /** The mount the player is riding, if any. */
    riding: string | null
  }
  /** Events from game ticks (not player actions) waiting to be shown on screen. */
  inbox: GameEvent[]
  /** Secret areas unlocked this run (they re-lock on prestige). */
  secrets: string[]
  /** Secret areas visited this run (their curio is found on the first visit). */
  secretsVisited: string[]
  /** Outfits unlocked (kept forever, for the wardrobe). */
  outfits: string[]
  /** Pirate crews by crew ID: Parleys so far, and whether they've been won over (this run). */
  crews: Record<string, { trust: number; won: boolean }>
  /** Spirits of the land, by spirit ID (this run). */
  spirits: Record<string, { awakened: boolean }>
  /** Story progress by story ID (missing = not started). */
  stories: Record<string, StoryProgress>
  /** Villager requests, by settlement ID. */
  settlements: Record<string, SettlementState>
  traders: {
    requests: TradeRequest[]
    /** Time until the next trader arrives (while there's room for one). */
    nextArrivalMs: number
    nextRequestId: number
  }
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
    itemsCrafted: number
    potionsDrunk: number
    requestsFilled: number
    glimmersEarned: number
    helperTrips: number
    pestsCleared: number
    creaturesShooed: number
    campsCleared: number
    ambushesFoiled: number
    spellsCast: number
    ritualsPerformed: number
    villagersHelped: number
  }
}

export const BASE_SATCHEL_CAPACITY = 20
export const BASE_STORAGE_CAPACITY = 100

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
    character: {
      created: false,
      look: { ...DEFAULT_LOOK },
      wardrobe: defaultWardrobe(DEFAULT_LOOK.body),
    },
    time: {
      dayMs: START_OF_DAY_MS,
    },
    weather: {
      meadow: { kind: 'sunshine', remainingMs: 10 * 60_000 },
    },
    challenges: {
      creatures: {},
      camps: {},
      nextCreatureMs: 5 * 60_000,
      nextCampMs: 15 * 60_000,
    },
    player: {
      place: HOME,
      travel: null,
      lastSpot: null,
      satchel: {},
      satchelLocked: false,
      satchelCapacity: BASE_SATCHEL_CAPACITY,
      clickPower: 1,
      wingSpeed: 1,
    },
    resources: {
      glimmers: 0,
    },
    inventory: {},
    storageCapacity: BASE_STORAGE_CAPACITY,
    spots: {},
    stations: {
      mortar: { jobs: [] },
      press: { jobs: [] },
      'drying-rack': { jobs: [] },
      'spinning-wheel': { jobs: [] },
      cauldron: { jobs: [] },
    },
    research: {
      completed: [],
      current: null,
    },
    buffs: [],
    upgrades: [],
    bloom: { meadow: 0 },
    curios: [],
    stories: {},
    inbox: [],
    secrets: [],
    secretsVisited: [],
    outfits: [],
    spirits: {},
    crews: {},
    mounts: { friendship: {}, owned: {}, riding: null },
    settlements: {
      thimblewick: { requests: [], nextArrivalMs: 60_000, filled: 0 },
    },
    helpers: {
      list: [],
      nextId: 1,
    },
    supply: {
      minimums: {},
    },
    traders: {
      requests: [],
      nextArrivalMs: 20_000,
      nextRequestId: 1,
    },
    bonuses: {
      offlineCapMs: 0,
    },
    stats: {
      activePlayMs: 0,
      offlineMs: 0,
      plantsHarvested: 0,
      taps: 0,
      itemsCrafted: 0,
      potionsDrunk: 0,
      requestsFilled: 0,
      glimmersEarned: 0,
      helperTrips: 0,
      pestsCleared: 0,
      creaturesShooed: 0,
      campsCleared: 0,
      ambushesFoiled: 0,
      spellsCast: 0,
      ritualsPerformed: 0,
      villagersHelped: 0,
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
