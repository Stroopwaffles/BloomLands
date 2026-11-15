import { CREATURES } from '../data/challenges'
import { FLIGHT_EVENT_RULES } from '../data/challenges'
import { HOME, isEventBase, isSettlement, isSpiritPlace, isSpot, placeRegion } from '../data/world'
import type { GameEvent } from './events'
import { applyInstantEvents, flightSpeed, rollFlightEvent, settleFlightEvent } from './flightEvents'
import { ensureRegion, grounded, placeOpen } from './regions'
import { discoverSecret } from './secrets'
import { depositSatchel, ensureSpot } from './gathering'
import { hasQol, travelMultiplier, wingSpeed } from './modifiers'
import { legAt, legShares, routeLegTimes, routeOf, SPIRIT_PATH } from './route'
import type { Random } from './rng'
import { countItems, type GameState } from './state'

/**
 * Flight time between two places for this player, or null if there's no route. Each leg of the
 * route (one per region crossed) gets its own region's weather; then wing speed and curios apply.
 */
export function travelMs(state: GameState, from: string, to: string): number | null {
  const route = routeOf(state, from, to)
  if (!route) return null
  const legs = routeLegTimes(state, from, to, route)
  const ms = legs.reduce((total, l) => total + l.ms, 0)
  // A hawk circling the destination makes you wait for your moment.
  const creature = state.challenges.creatures[to]
  const delay = creature ? (CREATURES[creature.creatureId]?.delaysFlights ?? 1) : 1
  return Math.ceil((ms / wingSpeed(state)) * travelMultiplier(state) * delay)
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
  if (to !== HOME && !isSpot(to) && !isSettlement(to) && !isSpiritPlace(to) && !isEventBase(to)) {
    return [{ type: 'blocked', reason: 'not-here' }]
  }
  if (!placeOpen(state, to)) return [{ type: 'blocked', reason: 'locked' }]
  // A Sky Isles storm grounds everyone, unless Stormward (or the Storm Bell) carries you through.
  if (grounded(state, player.place, to) && !((player.stormwardMs ?? 0) > 0)) {
    return [{ type: 'blocked', reason: 'storm' }]
  }
  const totalMs = travelMs(state, player.place, to)
  if (totalMs === null) return [{ type: 'blocked', reason: 'not-here' }]

  const route = routeOf(state, player.place, to)!
  state.prestige.freshRun = false
  const legs = legShares(
    routeLegTimes(state, player.place, to, route).map((l) => ({
      regionId: l.leg.regionId,
      ms: l.ms,
    })),
  )
  player.travel = {
    to,
    from: player.place,
    legs,
    totalMs,
    remainingMs: totalMs,
    ...(auto ? { auto: true } : {}),
  }
  if (random && !auto) {
    // Something may happen somewhere along the way, over whichever region is below.
    const at =
      FLIGHT_EVENT_RULES.earliest +
      random() * (FLIGHT_EVENT_RULES.latest - FLIGHT_EVENT_RULES.earliest)
    const regionId = legs[legAt(legs, at)].regionId
    if (regionId !== SPIRIT_PATH) rollFlightEvent(state, player.travel, random, regionId, at)
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
  player.travel.remainingMs -= dtMs * flightSpeed(state)
  applyInstantEvents(state, random)
  if (player.travel.remainingMs > 0) return

  settleFlightEvent(state, player.travel, random)
  const wasAuto = player.travel.auto === true
  player.place = player.travel.to
  player.travel = null
  ensureRegion(state, placeRegion(player.place), random)

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
