import {
  REGION_WEATHER,
  WEATHER,
  WEATHER_RULES,
  type WeatherDef,
  type WeatherKind,
} from '../data/challenges'
import { DAY_MS, NIGHTFALL_MS, PHASE_STARTS, type DayPhase } from '../data/time'
import { HOME, placeRegion } from '../data/world'
import { pickWeighted, type Random } from './rng'
import type { GameState } from './state'
import { dewAllDay, morningWeather, weatherCleared } from './modifiers'

// ---------------------------------------------------------------------------------------------
// Day and night

export function dayPhase(state: GameState): DayPhase {
  const at = state.time.dayMs / DAY_MS
  let phase: DayPhase = 'dawn'
  for (const p of PHASE_STARTS) if (at >= p.at) phase = p.phase
  return phase
}

export function isMorning(state: GameState): boolean {
  const phase = dayPhase(state)
  return phase === 'dawn' || phase === 'morning'
}

export function isNight(state: GameState): boolean {
  return state.time.dayMs >= NIGHTFALL_MS
}

export function advanceTime(state: GameState, dtMs: number): void {
  state.time.dayMs = (state.time.dayMs + dtMs) % DAY_MS
}

/** The next part of the day, and how long until it starts. */
export function nextPhase(state: GameState): { phase: DayPhase; name: string; inMs: number } {
  const at = state.time.dayMs / DAY_MS
  const next = PHASE_STARTS.find((p) => p.at > at) ?? PHASE_STARTS[0]
  const startMs = next.at * DAY_MS
  const inMs = startMs > state.time.dayMs ? startMs - state.time.dayMs : DAY_MS - state.time.dayMs
  return { phase: next.phase, name: next.name, inMs }
}

/** How long daytime (dawn to nightfall) and night last. */
export const DAYTIME_MS = NIGHTFALL_MS
export const NIGHTTIME_MS = DAY_MS - NIGHTFALL_MS

/** How long until night falls, or (at night) until dawn. */
export function untilDayChange(state: GameState): { to: 'night' | 'day'; inMs: number } {
  return isNight(state)
    ? { to: 'day', inMs: DAY_MS - state.time.dayMs }
    : { to: 'night', inMs: NIGHTFALL_MS - state.time.dayMs }
}

/** The Rite of Turning: jump to dawn, or to nightfall. */
export function turnSky(state: GameState, to: 'day' | 'night'): void {
  state.time.dayMs = to === 'day' ? 0 : NIGHTFALL_MS
}

// ---------------------------------------------------------------------------------------------
// Weather (per region)

/** The region a place belongs to. Home sits at the edge of the Meadow. */
export function regionOf(placeId: string): string {
  return placeRegion(placeId)
}

export function weatherIn(state: GameState, regionId: string): WeatherDef {
  // A relic like the Blossom Fan brings its weather every morning.
  const morning = morningWeather(state, regionId)
  if (morning && isMorning(state) && morning in WEATHER) return WEATHER[morning as WeatherKind]
  return WEATHER[state.weather[regionId]?.kind ?? 'sunshine']
}

/** What the weather is called right now: the same sky reads differently by day and by night. */
export function describeWeather(
  weather: WeatherDef,
  phase: DayPhase,
): { name: string; description: string } {
  return {
    name: weather.names?.[phase] ?? weather.name,
    description:
      phase === 'night' ? (weather.nightDescription ?? weather.description) : weather.description,
  }
}

export function rollWeather(
  regionId: string,
  random: Random,
): { kind: WeatherKind; remainingMs: number } {
  const kinds = REGION_WEATHER[regionId] ?? REGION_WEATHER.meadow
  const kind = pickWeighted(
    kinds.map((id) => [id, WEATHER[id].weight] as const),
    random,
  )
  const remainingMs =
    WEATHER_RULES.minMs + Math.floor(random() * (WEATHER_RULES.maxMs - WEATHER_RULES.minMs))
  return { kind, remainingMs }
}

export function advanceWeather(state: GameState, dtMs: number, random: Random): void {
  for (const [regionId, weather] of Object.entries(state.weather)) {
    weather.remainingMs -= dtMs
    if (weather.remainingMs <= 0) state.weather[regionId] = rollWeather(regionId, random)
  }
}

/** Multiplies a flight's time for the weather along the way. */
export function weatherFlightFactor(state: GameState, from: string, to: string): number {
  const weather = weatherIn(state, regionOf(to === HOME ? from : to))
  if (weatherCleared(state, weather.id)) return 1
  if (to === HOME) return weather.flightHome
  if (from === HOME) return weather.flightAway
  return (weather.flightHome + weather.flightAway) / 2
}

/** Can plants that only grow in the morning grow right now in this region? */
export function morningPlantsGrow(state: GameState, regionId: string): boolean {
  return isMorning(state) || weatherIn(state, regionId).dewAllDay || dewAllDay(state)
}
