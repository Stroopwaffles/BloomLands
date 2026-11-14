import { MOUNTS, mountBonusValue } from '../data/mounts'
import { SPIRITS } from '../data/spirits'
import {
  baseTravelMs,
  HOME,
  placeRegion,
  REGION_ORDER,
  REGIONS,
  SPIRIT_PATH_MS,
  SPOTS,
  WATER_FLIGHT_FACTOR,
} from '../data/world'
import { dayPhase, describeWeather, weatherIn } from './environment'
import { hasWaterstride, travelMultiplier, wingSpeed } from './modifiers'
import { spiritAwake } from './spirits'
import type { GameState } from './state'

/**
 * Routes: the regions a flight passes over. A long flight is split into legs, one per region it
 * crosses, so each region's weather (and pirates, and other happenings) affect its own stretch.
 * Awakened spirits open the Spirit Path: a quick, calm way between their resting places and home.
 */

/** The region ID used for a leg along the Spirit Path. */
export const SPIRIT_PATH = 'spirit-path'

export interface RouteLeg {
  /** The region below the fairy on this leg, or SPIRIT_PATH. */
  regionId: string
  /** Flight time before speed and weather. */
  baseMs: number
  /** A short hop inside one region (the flying squirrel speeds these up). */
  hop: boolean
}

export interface Route {
  legs: RouteLeg[]
  baseMs: number
  viaPath: boolean
}

const sum = (legs: RouteLeg[]) => legs.reduce((total, leg) => total + leg.baseMs, 0)

function hopLeg(from: string, to: string): RouteLeg {
  return { regionId: placeRegion(from), baseMs: baseTravelMs(from, to) ?? 0, hop: true }
}

/** The plain route: a hop inside a region, or a long flight split evenly over every region crossed. */
function directLegs(from: string, to: string): RouteLeg[] | null {
  const base = baseTravelMs(from, to)
  if (base === null) return null
  const a = REGION_ORDER.indexOf(placeRegion(from))
  const b = REGION_ORDER.indexOf(placeRegion(to))
  if (a === b) return [hopLeg(from, to)]
  const step = b > a ? 1 : -1
  const regions: string[] = []
  for (let i = a; i !== b + step; i += step) regions.push(REGION_ORDER[i])
  return regions.map((regionId) => ({ regionId, baseMs: base / regions.length, hop: false }))
}

/** Places on the Spirit Path: home, and the resting places of awakened spirits. */
export function pathNodes(state: GameState): string[] {
  return [
    HOME,
    ...Object.values(SPIRITS)
      .filter((spirit) => spiritAwake(state, spirit.id))
      .map((spirit) => spirit.place),
  ]
}

/** The quickest way between two places: direct, or along the Spirit Path when that's shorter. */
export function routeOf(state: GameState, from: string, to: string): Route | null {
  const direct = directLegs(from, to)
  if (!direct) return null
  let best: Route = { legs: direct, baseMs: sum(direct), viaPath: false }
  const regionA = placeRegion(from)
  const regionB = placeRegion(to)
  if (regionA === regionB) return best
  const nodes = pathNodes(state)
  for (const na of nodes.filter((n) => placeRegion(n) === regionA)) {
    for (const nb of nodes.filter((n) => placeRegion(n) === regionB)) {
      const legs: RouteLeg[] = []
      if (from !== na) legs.push(hopLeg(from, na))
      legs.push({ regionId: SPIRIT_PATH, baseMs: SPIRIT_PATH_MS, hop: false })
      if (nb !== to) legs.push(hopLeg(nb, to))
      if (sum(legs) < best.baseMs) best = { legs, baseMs: sum(legs), viaPath: true }
    }
  }
  return best
}

/** Which way the wind matters: flying toward home, away from it, or along a region. */
export function headingOf(from: string, to: string): 'home' | 'away' | 'level' {
  if (to === HOME) return 'home'
  if (from === HOME) return 'away'
  const a = REGION_ORDER.indexOf(placeRegion(from))
  const b = REGION_ORDER.indexOf(placeRegion(to))
  return b < a ? 'home' : b > a ? 'away' : 'level'
}

export interface LegEffect {
  label: string
  factor: number
}

/** Everything that stretches or shortens one leg: its weather, open water, a gliding mount. */
export function legEffects(
  state: GameState,
  leg: RouteLeg,
  heading: 'home' | 'away' | 'level',
  start: string | null,
  end: string | null,
): LegEffect[] {
  if (leg.regionId === SPIRIT_PATH) return []
  const effects: LegEffect[] = []
  const weather = weatherIn(state, leg.regionId)
  const factor =
    heading === 'home'
      ? weather.flightHome
      : heading === 'away'
        ? weather.flightAway
        : (weather.flightHome + weather.flightAway) / 2
  if (factor !== 1) {
    effects.push({ label: describeWeather(weather, dayPhase(state)).name, factor })
  }
  const water = (start && SPOTS[start]?.water) || (end && SPOTS[end]?.water)
  const riding = state.mounts.riding ? MOUNTS[state.mounts.riding] : null
  if (water && !riding?.swims && !hasWaterstride(state)) {
    effects.push({ label: 'Open water', factor: WATER_FLIGHT_FACTOR })
  }
  if (
    leg.hop &&
    riding?.bonus.kind === 'regionTravel' &&
    riding.regionId === leg.regionId &&
    state.mounts.riding
  ) {
    const level = state.mounts.owned[state.mounts.riding]?.level ?? 1
    effects.push({ label: riding.name, factor: mountBonusValue(riding, level) })
  }
  return effects
}

/** A route's legs with their effects, before wing speed and curios. */
export function routeLegTimes(
  state: GameState,
  from: string,
  to: string,
  route: Route,
): { leg: RouteLeg; ms: number; effects: LegEffect[] }[] {
  const heading = headingOf(from, to)
  return route.legs.map((leg, i) => {
    const effects = legEffects(
      state,
      leg,
      heading,
      i === 0 ? from : null,
      i === route.legs.length - 1 ? to : null,
    )
    const ms = effects.reduce((value, e) => value * e.factor, leg.baseMs)
    return { leg, ms, effects }
  })
}

/** "via the Forest", "via the Spirit Path", or '' for a flight with nothing in between. */
export function routeVia(route: Route, from: string, to: string): string {
  if (route.viaPath) return 'via the Spirit Path'
  const ends = new Set([placeRegion(from), placeRegion(to)])
  const between = route.legs.map((leg) => leg.regionId).filter((id) => !ends.has(id))
  if (between.length === 0) return ''
  const names = between.map((id) => `the ${REGIONS[id]?.name ?? id}`)
  const list =
    names.length <= 2 ? names.join(' and ') : `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`
  return `via ${list}`
}

/** The name of a leg's region, for the screen. */
export function legName(regionId: string): string {
  return regionId === SPIRIT_PATH ? 'Spirit Path' : (REGIONS[regionId]?.name ?? regionId)
}

/** Each leg's share of the whole flight (0–1), in order. */
export function legShares(legs: { regionId: string; ms: number }[]): {
  regionId: string
  share: number
}[] {
  const total = legs.reduce((t, l) => t + l.ms, 0) || 1
  return legs.map((l) => ({ regionId: l.regionId, share: l.ms / total }))
}

/** Which leg the fairy is over at a point in the flight (0 = just left, 1 = landing). */
export function legAt(shares: { share: number }[], progress: number): number {
  let edge = 0
  for (let i = 0; i < shares.length; i++) {
    edge += shares[i].share
    if (progress < edge) return i
  }
  return shares.length - 1
}

export interface FlightBreakdown {
  totalMs: number
  via: string
  legs: { name: string; baseMs: number; effects: LegEffect[] }[]
  /** Wing speed (upgrades, mount, Quickwing): flights are divided by this. */
  wingSpeed: number
  /** Curios like Pip's Compass: flights are multiplied by this. */
  curios: number
}

/** Everything that went into a flight's time, for the map. */
export function flightBreakdown(
  state: GameState,
  from: string,
  to: string,
): FlightBreakdown | null {
  const route = routeOf(state, from, to)
  if (!route) return null
  const legs = routeLegTimes(state, from, to, route)
  const speed = wingSpeed(state)
  const curios = travelMultiplier(state)
  const ms = legs.reduce((total, l) => total + l.ms, 0)
  return {
    totalMs: Math.ceil((ms / speed) * curios),
    via: routeVia(route, from, to),
    legs: legs.map((l) => ({
      name: legName(l.leg.regionId),
      baseMs: l.leg.baseMs,
      effects: l.effects,
    })),
    wingSpeed: speed,
    curios,
  }
}
