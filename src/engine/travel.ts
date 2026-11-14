import { CREWS } from '../data/challenges'
import { MOUNTS, mountBonusValue } from '../data/mounts'
import {
  baseTravelMs,
  HOME,
  isSettlement,
  isSpiritPlace,
  isSpot,
  placeRegion,
  SPOTS,
  WATER_FLIGHT_FACTOR,
} from '../data/world'
import { weatherFlightFactor } from './environment'
import type { GameEvent } from './events'
import { applyInstantEvents, rollFlightEvent, settleFlightEvent } from './flightEvents'
import { placeOpen } from './regions'
import { discoverSecret } from './secrets'
import { depositSatchel, ensureSpot } from './gathering'
import { hasQol, hasWaterstride, travelMultiplier, wingSpeed } from './modifiers'
import type { Random } from './rng'
import { countItems, type GameState } from './state'

/** Flight time between two places for this player, or null if there's no route. */
export function travelMs(state: GameState, from: string, to: string): number | null {
  const base = baseTravelMs(from, to)
  if (base === null) return null
  return Math.ceil(
    (base / wingSpeed(state)) *
      weatherFlightFactor(state, from, to) *
      travelMultiplier(state) *
      mountHopFactor(state, from, to) *
      waterFactor(state, from, to),
  )
}

/** Open water is slow going, unless you ride a mount that swims or drank Waterstride. */
export function waterFactor(state: GameState, from: string, to: string): number {
  if (!SPOTS[to]?.water && !SPOTS[from]?.water) return 1
  const riding = state.mounts.riding ? MOUNTS[state.mounts.riding] : null
  if (riding?.swims || hasWaterstride(state)) return 1
  return WATER_FLIGHT_FACTOR
}

/** Mounts like the flying squirrel make hops inside their own region quicker. */
function mountHopFactor(state: GameState, from: string, to: string): number {
  const id = state.mounts.riding
  const mount = id ? MOUNTS[id] : null
  if (!id || !mount || mount.bonus.kind !== 'regionTravel') return 1
  const region = mount.regionId
  if (placeRegion(from) !== region || placeRegion(to) !== region) return 1
  return mountBonusValue(mount, state.mounts.owned[id]?.level ?? 1)
}

/** The pirate crew that might ambush a flight: whoever roams the region you're flying into. */
function ambushCrew(state: GameState, from: string, to: string): string | null {
  const region = placeRegion(to === HOME ? from : to)
  const crew = Object.values(CREWS).find((c) => c.regionId === region)
  return crew && !state.crews[crew.id]?.won ? crew.id : null
}

/**
 * Starts a flight. `auto` marks a flight home started by Homing Instinct. Passing `random` lets the
 * flight roll a mid-flight event (only flights the player starts themselves get events).
 */
export function startTravel(
  state: GameState,
  to: string,
  auto = false,
  random?: Random,
): GameEvent[] {
  const { player } = state
  if (player.travel) return [{ type: 'blocked', reason: 'flying' }]
  if (to !== HOME && !isSpot(to) && !isSettlement(to) && !isSpiritPlace(to)) {
    return [{ type: 'blocked', reason: 'not-here' }]
  }
  if (!placeOpen(state, to)) return [{ type: 'blocked', reason: 'locked' }]
  const totalMs = travelMs(state, player.place, to)
  if (totalMs === null) return [{ type: 'blocked', reason: 'not-here' }]

  player.travel = { to, totalMs, remainingMs: totalMs, ...(auto ? { auto: true } : {}) }
  if (random && !auto) {
    rollFlightEvent(player.travel, random, ambushCrew(state, player.place, to))
  }
  return [{ type: 'depart', to, totalMs, auto }]
}

/**
 * Moves the player along their flight. Arrival happens here, so it also works offline, along
 * with the comforts that trigger on arrival (Tidy Habits, Round Trips).
 */
export function advanceTravel(state: GameState, dtMs: number, random: Random): void {
  const { player } = state
  if (!player.travel) return
  player.travel.remainingMs -= dtMs
  applyInstantEvents(state, random)
  if (player.travel.remainingMs > 0) return

  settleFlightEvent(state, player.travel, random)
  const wasAuto = player.travel.auto === true
  player.place = player.travel.to
  player.travel = null

  if (isSpot(player.place)) {
    player.lastSpot = player.place
    ensureSpot(state, player.place, random)
    state.inbox.push(...discoverSecret(state, player.place))
    return
  }
  if (player.place !== HOME) return

  if (hasQol(state, 'auto-deposit')) depositSatchel(state)
  if (
    wasAuto &&
    hasQol(state, 'return-trip') &&
    player.lastSpot &&
    countItems(player.satchel) === 0
  ) {
    startTravel(state, player.lastSpot)
  }
}
