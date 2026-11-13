/**
 * Weather and challenges for the Meadow (design doc 3.15, content doc → Meadow).
 * All numbers are starting values for balancing.
 */

export type WeatherKind = 'sunshine' | 'breeze' | 'light-rain'

export interface WeatherDef {
  id: WeatherKind
  name: string
  description: string
  weight: number
  /** Multiplies plant regrowth speed. */
  regrowth: number
  /** Multiplies flight time when flying home / away from home. */
  flightHome: number
  flightAway: number
  /** Morning dew can grow at any time of day. */
  dewAllDay: boolean
}

export const WEATHER: Readonly<Record<WeatherKind, WeatherDef>> = {
  sunshine: {
    id: 'sunshine',
    name: 'Sunshine',
    description: 'Plants regrow faster.',
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
    weight: 25,
    regrowth: 1,
    flightHome: 1.25,
    flightAway: 1.25,
    dewAllDay: true,
  },
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
  /** Plants with this tag attract aphids. */
  tag: 'petals',
}

export interface CreatureDef {
  id: string
  name: string
  regionId: string
  /** Taps to shoo it away. */
  taps: number
  /** It eats a plant this often while it's there. */
  eatEveryMs: number
  /** It wanders off by itself after this long. */
  staysMs: number
}

export const CREATURES: Readonly<Record<string, CreatureDef>> = {
  rabbit: {
    id: 'rabbit',
    name: 'Rabbit',
    regionId: 'meadow',
    taps: 8,
    eatEveryMs: 15_000,
    staysMs: 3 * 60_000,
  },
}

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
}

export const CAMP_RULES = {
  firstMs: 15 * 60_000,
  minMs: 20 * 60_000,
  maxMs: 30 * 60_000,
  /** A camp takes over this many of a spot's plant slots (the last ones). */
  slotsTaken: 3,
  /** Helpers bring back this share of their usual haul from a region with a camp. */
  helperYield: 0.5,
}

export type FlightEventKind = 'ambush' | 'seeds' | 'traveler' | 'gust'

export const FLIGHT_EVENT_RULES = {
  /** Chance a flight the player starts has an event. */
  chance: 0.35,
  weights: { ambush: 30, seeds: 35, traveler: 15, gust: 20 } as Record<FlightEventKind, number>,
  /** Events appear this far into the flight. */
  at: 0.4,
  ambushTaps: 6,
  ambushSteals: 3,
  seedsMax: 5,
  travelerGlimmers: 15,
  tailwind: 0.7,
  headwind: 1.25,
}
