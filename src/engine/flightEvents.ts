import { FLIGHT_EVENT_RULES, type FlightEventKind } from '../data/challenges'
import { ITEMS } from '../data/items'
import type { GameEvent } from './events'
import { satchelFull } from './gathering'
import { pickWeighted, type Random } from './rng'
import { addItems, type GameState, type TravelState } from './state'

/**
 * Things that can happen mid-flight (design doc 3.15): pirate ambushes, dandelion seeds to catch,
 * a lost traveler, gusts. Only flights the player starts get events.
 */

export function rollFlightEvent(travel: TravelState, random: Random): void {
  if (random() >= FLIGHT_EVENT_RULES.chance) return
  const kind = pickWeighted(
    Object.entries(FLIGHT_EVENT_RULES.weights) as [FlightEventKind, number][],
    random,
  )
  travel.event = {
    kind,
    showAtMs: Math.round(travel.totalMs * (1 - FLIGHT_EVENT_RULES.at)),
    taps: 0,
    resolved: false,
  }
}

/** The event currently showing, if any. */
export function activeFlightEvent(state: GameState) {
  const travel = state.player.travel
  const event = travel?.event
  if (!travel || !event || event.resolved || travel.remainingMs > event.showAtMs) return null
  return event
}

/** Gusts happen on their own the moment they show up. Called as the flight advances. */
export function applyInstantEvents(state: GameState, random: Random): void {
  const travel = state.player.travel
  const event = activeFlightEvent(state)
  if (!travel || !event || event.kind !== 'gust') return
  const tailwind = random() < 0.5
  const factor = tailwind ? FLIGHT_EVENT_RULES.tailwind : FLIGHT_EVENT_RULES.headwind
  const elapsed = travel.totalMs - travel.remainingMs
  travel.remainingMs = Math.round(travel.remainingMs * factor)
  travel.totalMs = elapsed + travel.remainingMs
  event.resolved = true
  event.tailwind = tailwind
}

/** The player taps the event: shoo pirates, catch a seed, help the traveler. */
export function tapFlightEvent(state: GameState): GameEvent[] {
  const event = activeFlightEvent(state)
  if (!event) return [{ type: 'blocked', reason: 'no-target' }]
  state.stats.taps++
  event.taps++
  switch (event.kind) {
    case 'ambush':
      if (event.taps < FLIGHT_EVENT_RULES.ambushTaps) return []
      event.resolved = true
      state.stats.ambushesFoiled++
      return [{ type: 'flight-event', result: 'The Drifters flutter off, outwitted!' }]
    case 'seeds':
      if (satchelFull(state)) {
        event.resolved = true
        return [{ type: 'flight-event', result: 'Your satchel is full.' }]
      }
      addItems(state.player.satchel, 'raw-dandelion-fluff', 1)
      if (event.taps >= FLIGHT_EVENT_RULES.seedsMax) event.resolved = true
      return [{ type: 'flight-event', result: '+1 Dandelion fluff' }]
    case 'traveler':
      event.resolved = true
      state.resources.glimmers += FLIGHT_EVENT_RULES.travelerGlimmers
      return [
        {
          type: 'flight-event',
          result: `The lost beetle thanks you with ${FLIGHT_EVENT_RULES.travelerGlimmers} Glimmers.`,
        },
      ]
    default:
      return []
  }
}

/** Gust (spell): blows an ambush away at once. */
export function foilAmbush(state: GameState): GameEvent[] {
  const event = activeFlightEvent(state)
  if (!event || event.kind !== 'ambush') return [{ type: 'blocked', reason: 'no-target' }]
  event.resolved = true
  state.stats.ambushesFoiled++
  return [{ type: 'flight-event', result: 'A gust sends the Drifters tumbling away!' }]
}

/**
 * When a flight lands with an ambush still going, the pirates make off with a few items from the
 * satchel (never trinkets). A setback, not a failure.
 */
export function settleFlightEvent(state: GameState, travel: TravelState, random: Random): void {
  const event = travel.event
  if (!event || event.resolved || event.kind !== 'ambush') return
  for (let i = 0; i < FLIGHT_EVENT_RULES.ambushSteals; i++) {
    const stealable = Object.keys(state.player.satchel).filter(
      (id) => ITEMS[id]?.category !== 'trinket',
    )
    if (stealable.length === 0) return
    addItems(state.player.satchel, stealable[Math.floor(random() * stealable.length)], -1)
  }
}
