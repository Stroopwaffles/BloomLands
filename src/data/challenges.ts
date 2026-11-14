/**
 * Weather and challenges for each region (design doc 3.15, content doc → each region).
 * All numbers are starting values for balancing.
 */
import type { DayPhase } from './time'

export type WeatherKind =
  | 'sunshine'
  | 'breeze'
  | 'light-rain'
  | 'mist'
  | 'rain'
  | 'falling-leaves'
  | 'fog'
  | 'drizzle'
  | 'muggy'
  | 'blossom-wind'
  | 'spring-shower'
  | 'late-frost'

export interface WeatherDef {
  id: WeatherKind
  /** Daytime name and description. */
  name: string
  description: string
  /** Names for other times of day, so the sky never reads "Night · Sunny". */
  names?: Partial<Record<DayPhase, string>>
  /** Description at night, if the daytime one doesn't fit. */
  nightDescription?: string
  weight: number
  /** Multiplies plant regrowth speed. */
  regrowth: number
  /** Multiplies flight time when flying home / away from home. */
  flightHome: number
  flightAway: number
  /** Morning dew can grow at any time of day. */
  dewAllDay: boolean
  /** Multiplies how often rarer plants grow (mist hides them). */
  luck?: number
  /** Plants with this tag grow more often (rain brings up mushrooms, drizzle opens lilies). */
  tagBoost?: { tag: string; multiplier: number }
  /** Multiplies helpers' flight times in the region (muggy heat makes them dawdle). */
  helperTrips?: number
  /** Harvests of plants with this tag give extra (a blossom wind blows in bonus petals). */
  tagYield?: { tag: string; amount: number }
}

export const WEATHER: Readonly<Record<WeatherKind, WeatherDef>> = {
  sunshine: {
    id: 'sunshine',
    name: 'Sunny',
    description: 'Clear skies and warm sun: plants regrow faster.',
    names: { dusk: 'Clear skies', night: 'Starry skies' },
    nightDescription: 'A clear, starry night: plants still regrow faster.',
    weight: 45,
    regrowth: 1.5,
    flightHome: 1,
    flightAway: 1,
    dewAllDay: false,
  },
  breeze: {
    id: 'breeze',
    name: 'Breeze',
    description: 'A tailwind home, a headwind on the way out.',
    weight: 30,
    regrowth: 1,
    flightHome: 0.75,
    flightAway: 1.25,
    dewAllDay: false,
  },
  'light-rain': {
    id: 'light-rain',
    name: 'Light rain',
    description: 'Slower flights, but dew gathers all day.',
    nightDescription: 'Slower flights, but dew gathers at any hour.',
    weight: 25,
    regrowth: 1,
    flightHome: 1.25,
    flightAway: 1.25,
    dewAllDay: true,
  },
  mist: {
    id: 'mist',
    name: 'Mist',
    description: 'Rare plants hide in the mist, but hidden paths show through.',
    weight: 35,
    regrowth: 1,
    flightHome: 1.1,
    flightAway: 1.1,
    dewAllDay: false,
    luck: 0.6,
  },
  rain: {
    id: 'rain',
    name: 'Rain',
    description: 'Slower flights, but mushrooms spring up everywhere.',
    weight: 30,
    regrowth: 1.2,
    flightHome: 1.25,
    flightAway: 1.25,
    dewAllDay: true,
    tagBoost: { tag: 'caps', multiplier: 2.5 },
  },
  'falling-leaves': {
    id: 'falling-leaves',
    name: 'Falling leaves',
    description: 'Gusty and golden. Flights are a little slower.',
    weight: 35,
    regrowth: 1,
    flightHome: 1.15,
    flightAway: 1.15,
    dewAllDay: false,
  },
  fog: {
    id: 'fog',
    name: 'Fog',
    description: "Rare plants hide in the fog. Will-o'-wisps flicker at the edges.",
    weight: 30,
    regrowth: 1,
    flightHome: 1.1,
    flightAway: 1.1,
    dewAllDay: false,
    luck: 0.6,
  },
  drizzle: {
    id: 'drizzle',
    name: 'Drizzle',
    description: 'Slower flights, but lilies and marigolds bloom more.',
    weight: 35,
    regrowth: 1,
    flightHome: 1.25,
    flightAway: 1.25,
    dewAllDay: true,
    tagBoost: { tag: 'petals', multiplier: 2 },
  },
  muggy: {
    id: 'muggy',
    name: 'Muggy heat',
    description: "Plants regrow faster, but helpers' trips are slower.",
    names: { night: 'Muggy' },
    nightDescription:
      "Warm and sticky even after dark: plants regrow faster, but helpers' trips are slower.",
    weight: 35,
    regrowth: 1.4,
    flightHome: 1,
    flightAway: 1,
    dewAllDay: false,
    helperTrips: 1.3,
  },
  'blossom-wind': {
    id: 'blossom-wind',
    name: 'Blossom wind',
    description: 'Drifting petals: every petal plant gives one extra when harvested.',
    weight: 35,
    regrowth: 1,
    flightHome: 0.9,
    flightAway: 1.1,
    dewAllDay: false,
    tagYield: { tag: 'petals', amount: 1 },
  },
  'spring-shower': {
    id: 'spring-shower',
    name: 'Spring shower',
    description: 'Slower flights, but everything regrows faster.',
    weight: 35,
    regrowth: 1.3,
    flightHome: 1.2,
    flightAway: 1.2,
    dewAllDay: true,
  },
  'late-frost': {
    id: 'late-frost',
    name: 'Late frost',
    description: 'A nip in the air: plants regrow more slowly.',
    weight: 25,
    regrowth: 0.75,
    flightHome: 1,
    flightAway: 1,
    dewAllDay: false,
  },
}

/** Which weather each region gets. */
export const REGION_WEATHER: Readonly<Record<string, readonly WeatherKind[]>> = {
  meadow: ['sunshine', 'breeze', 'light-rain'],
  forest: ['mist', 'rain', 'falling-leaves'],
  swamp: ['fog', 'drizzle', 'muggy'],
  orchard: ['blossom-wind', 'spring-shower', 'late-frost'],
}

export const WEATHER_RULES = {
  minMs: 8 * 60_000,
  maxMs: 15 * 60_000,
}

export const PEST_RULES = {
  /** How often each visited spot checks for a new infestation. */
  checkMs: 60_000,
  chance: 0.2,
  /** Pests on a newly infested plant; each tap clears one. */
  count: 3,
}

export interface PestDef {
  id: string
  name: string
  /** Plants with this material tag attract them. */
  tag: string
}

/** Each region's pest (content doc → each region's Challenges). */
export const PESTS: Readonly<Record<string, PestDef>> = {
  meadow: { id: 'aphid', name: 'aphids', tag: 'petals' },
  forest: { id: 'beetle', name: 'beetles', tag: 'caps' },
  swamp: { id: 'slug', name: 'slugs', tag: 'petals' },
  orchard: { id: 'caterpillar', name: 'caterpillars', tag: 'blossoms' },
}

export interface CreatureDef {
  id: string
  name: string
  regionId: string
  /**
   * 'eats': munches plants until shooed (taps) or calmed.
   * 'watches': blocks the spot (no gathering, no helpers) until calmed or snuck past.
   */
  behavior: 'eats' | 'watches'
  /** Taps to shoo it away. */
  taps: number
  /** It eats a plant this often while it's there. */
  eatEveryMs: number
  /** It wanders off by itself after this long. */
  staysMs: number
  /** Only turns up at these spots (default: any spot in its region). */
  spots?: string[]
  /** A Waterstride Philter lets you gather under its nose (the heron ignores you). */
  ignoresWaterstride?: boolean
  /** Too grumpy to shoo: only a calming spell sends it away. */
  calmOnly?: boolean
}

export const CREATURES: Readonly<Record<string, CreatureDef>> = {
  rabbit: {
    id: 'rabbit',
    name: 'Rabbit',
    regionId: 'meadow',
    behavior: 'eats',
    taps: 8,
    eatEveryMs: 30_000,
    staysMs: 3 * 60_000,
  },
  owl: {
    id: 'owl',
    name: 'Owl',
    regionId: 'forest',
    behavior: 'watches',
    taps: 0,
    eatEveryMs: 0,
    staysMs: 4 * 60_000,
  },
  heron: {
    id: 'heron',
    name: 'Heron',
    regionId: 'swamp',
    behavior: 'watches',
    taps: 0,
    eatEveryMs: 0,
    staysMs: 4 * 60_000,
    spots: ['lilypad-pools'],
    ignoresWaterstride: true,
  },
  badger: {
    id: 'badger',
    name: 'Grumpy badger',
    regionId: 'orchard',
    behavior: 'eats',
    taps: 0,
    eatEveryMs: 20_000,
    staysMs: 3 * 60_000,
    calmOnly: true,
  },
}

/** How long Hush Step lets you gather under a watching creature's nose. */
export const SNEAK_MS = 2 * 60_000

export const CREATURE_RULES = {
  firstMs: 5 * 60_000,
  minMs: 8 * 60_000,
  maxMs: 14 * 60_000,
}

export interface CrewDef {
  id: string
  name: string
  regionId: string
  description: string
  /** What the crew says after each Parley; the last one wins them over. */
  parleyLines: string[]
  /** Items they go for first when an ambush succeeds. */
  steals?: string[]
}

export const CREWS: Readonly<Record<string, CrewDef>> = {
  'dandelion-drifters': {
    id: 'dandelion-drifters',
    name: 'The Dandelion Drifters',
    regionId: 'meadow',
    description: 'Pirate fairies who ride dandelion seeds and swoop down on gatherers.',
    parleyLines: [
      '"A treat? For us? ...We\'re not falling for that. Probably." They eat it anyway.',
      '"You keep coming back. And the Meadow keeps getting greener. Why do you care so much?"',
      '"Fine. FINE. The Drifters will drift with you. Got any hammocks at that court of yours?"',
    ],
  },
  'bramble-corsairs': {
    id: 'bramble-corsairs',
    name: 'The Bramble Corsairs',
    regionId: 'forest',
    description: 'Pirate fairies who hide in thorn thickets and ambush travelers.',
    parleyLines: [
      '"Halt! Pay the bramble toll!" ...They accept the treat as the toll. Grudgingly.',
      '"The Drifters say you\'re good folk. The Drifters say a lot of things."',
      '"Alright, fairy. No more thorns in your path. Ours are yours now."',
    ],
  },
  'bog-buccaneers': {
    id: 'bog-buccaneers',
    name: 'The Bog Buccaneers',
    regionId: 'swamp',
    description: 'Pirate fairies who sail leaf boats and raid lily-pad gatherers.',
    parleyLines: [
      '"Ahoy! Er, I mean, ARR!" The captain bails out his leaf boat and takes the treat.',
      '"Them Corsairs say you\'re soft. We say soft is nice. Have you seen how damp it is out here?"',
      '"Hoist the lily pad! The Buccaneers sail for your court now. Mind the puddles."',
    ],
  },
  'nectar-nabbers': {
    id: 'nectar-nabbers',
    name: 'The Nectar Nabbers',
    regionId: 'orchard',
    description: 'Sticky-fingered pirate fairies who steal honey and pollen from satchels.',
    steals: ['raw-honey', 'raw-golden-pollen', 'refined-honey-syrup', 'refined-pollen-gold'],
    parleyLines: [
      '"Is that... honey cake? We were only borrowing the honey. Forever. But still."',
      '"The Buccaneers say you share. Nobody shares in the Orchard. It\'s very confusing."',
      '"Fine! The Nabbers will nab for you instead. Sweetest deal we ever made."',
    ],
  },
}

export const CAMP_RULES = {
  firstMs: 25 * 60_000,
  /** Camps pack up on their own after this long (or sooner with Tanglevine). */
  staysMs: 20 * 60_000,
  minMs: 20 * 60_000,
  maxMs: 30 * 60_000,
  /** A camp takes over this many of a spot's plant slots (the last ones). */
  slotsTaken: 3,
  /** Helpers bring back this share of their usual haul from a region with a camp. */
  helperYield: 0.5,
}

export type FlightEventKind = 'ambush' | 'windfall' | 'traveler' | 'gust' | 'snag' | 'wisp'

export const FLIGHT_EVENT_RULES = {
  /** Chance a flight the player starts has an event. */
  chance: 0.35,
  /** Events happen somewhere between these points of the flight, over whichever region is below. */
  earliest: 0.2,
  latest: 0.8,
  ambushTaps: 6,
  ambushSteals: 3,
  tailwind: 0.7,
  headwind: 1.25,
  /** Taps to pull free of a snag; until then the flight goes at this speed. */
  snagTaps: 5,
  snagSpeed: 0.5,
  /** Following a will-o'-wisp shortens what's left of the flight to this. */
  wispShortcut: 0.6,
}

/** What can happen while flying over each region (F2: every region has its own happenings). */
export interface RegionFlightEvents {
  /** How likely each kind is (an ambush only if the region's pirates aren't won over). */
  weights: Partial<Record<FlightEventKind, number>>
  /** Something to catch as it drifts by. */
  windfall: { itemId: string; text: string; art: string; max: number }
  /** Someone lost to help on their way. */
  traveler: { text: string; thanks: string; art: string; glimmers: number }
}

export const REGION_FLIGHT_EVENTS: Readonly<Record<string, RegionFlightEvents>> = {
  meadow: {
    weights: { ambush: 30, windfall: 35, traveler: 15, gust: 20 },
    windfall: {
      itemId: 'raw-dandelion-fluff',
      text: 'Dandelion seeds drift by!',
      art: 'event-seeds',
      max: 5,
    },
    traveler: {
      text: 'A lost beetle asks you the way home.',
      thanks: 'The lost beetle thanks you',
      art: 'event-lost-beetle',
      glimmers: 15,
    },
  },
  forest: {
    weights: { ambush: 30, windfall: 25, traveler: 15, snag: 30 },
    windfall: {
      itemId: 'raw-acorns',
      text: 'Acorns tumble down from the canopy!',
      art: 'raw-acorns',
      max: 3,
    },
    traveler: {
      text: 'A squirrel courier has lost her way with the mail.',
      thanks: 'The courier thanks you',
      art: 'villager-chestnut',
      glimmers: 20,
    },
  },
  orchard: {
    weights: { ambush: 30, windfall: 30, traveler: 15, gust: 25 },
    windfall: {
      itemId: 'raw-apple-petals',
      text: 'Apple-blossom petals swirl past!',
      art: 'raw-apple-petals',
      max: 4,
    },
    traveler: {
      text: 'A young bee is lost on her very first flight.',
      thanks: 'The young bee thanks you',
      art: 'villager-pollyanna',
      glimmers: 30,
    },
  },
  swamp: {
    weights: { ambush: 30, windfall: 25, traveler: 15, wisp: 30 },
    windfall: {
      itemId: 'raw-lily-petals',
      text: 'Lily petals float up on a warm breeze!',
      art: 'raw-lily-petals',
      max: 3,
    },
    traveler: {
      text: 'A little tadpole has drifted far from home.',
      thanks: 'The tadpole’s family thanks you',
      art: 'villager-puddle',
      glimmers: 25,
    },
  },
}
