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
  return WEATHER[state.weather[regionId]?.kind ?? 'sunshine']
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
  if (to === HOME) return weather.flightHome
  if (from === HOME) return weather.flightAway
  return (weather.flightHome + weather.flightAway) / 2
}

/** Can plants that only grow in the morning grow right now in this region? */
export function morningPlantsGrow(state: GameState, regionId: string): boolean {
  return isMorning(state) || weatherIn(state, regionId).dewAllDay
}
