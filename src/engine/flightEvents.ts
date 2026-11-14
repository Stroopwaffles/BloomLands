import {
  CREWS,
  FLIGHT_EVENT_RULES,
  REGION_FLIGHT_EVENTS,
  type FlightEventKind,
} from '../data/challenges'
import { ITEMS, itemName } from '../data/items'
import type { GameEvent } from './events'
import { satchelFull } from './gathering'
import { pickWeighted, type Random } from './rng'
import { addItems, type GameState, type TravelState } from './state'

/**
 * Things that can happen mid-flight (design doc 3.15). Each region has its own: pirates, things
 * drifting by to catch, lost travelers, and the region's own hazard or luck (gusts in the Meadow,
 * bramble snags in the Forest, will-o'-wisps in the Swamp). Events come from the region the fairy
 * is flying over at the time. Only flights the player starts get events.
 */

/** The pirate crew that roams a region, unless it has been won over. */
function crewOver(state: GameState, regionId: string): string | null {
  const crew = Object.values(CREWS).find((c) => c.regionId === regionId)
  return crew && !state.crews[crew.id]?.won ? crew.id : null
}

/**
 * Maybe sets up an event, `at` of the way through the flight, over `regionId`. Nothing happens on
 * the Spirit Path (or over a region with no happenings).
 */
export function rollFlightEvent(
  state: GameState,
  travel: TravelState,
  random: Random,
  regionId: string,
  at: number,
): void {
  const happenings = REGION_FLIGHT_EVENTS[regionId]
  if (!happenings || random() >= FLIGHT_EVENT_RULES.chance) return
  const crewId = crewOver(state, regionId)
  const kind = pickWeighted(
    (Object.entries(happenings.weights) as [FlightEventKind, number][]).filter(
      ([k]) => crewId !== null || k !== 'ambush',
    ),
    random,
  )
  travel.event = {
    kind,
    showAtMs: Math.round(travel.totalMs * (1 - at)),
    taps: 0,
    resolved: false,
    regionId,
    ...(kind === 'ambush' && crewId ? { crewId } : {}),
  }
}

/** The event currently showing, if any. */
export function activeFlightEvent(state: GameState) {
  const travel = state.player.travel
  const event = travel?.event
  if (!travel || !event || event.resolved || travel.remainingMs > event.showAtMs) return null
  return event
}

/** The region's flavor for an event (what drifts by, who's lost). Meadow if unknown. */
export function eventFlavor(regionId: string | undefined) {
  return REGION_FLIGHT_EVENTS[regionId ?? 'meadow'] ?? REGION_FLIGHT_EVENTS.meadow
}

/** Gusts happen on their own the moment they show up. Called as the flight advances. */
export function applyInstantEvents(state: GameState, random: Random): void {
  const travel = state.player.travel
  const event = activeFlightEvent(state)
  if (!travel || !event || event.kind !== 'gust') return
  const tailwind = random() < 0.5
  reshapeFlight(travel, tailwind ? FLIGHT_EVENT_RULES.tailwind : FLIGHT_EVENT_RULES.headwind)
  event.resolved = true
  event.tailwind = tailwind
}

/** Stretches or shortens what's left of a flight. */
function reshapeFlight(travel: TravelState, factor: number): void {
  const elapsed = travel.totalMs - travel.remainingMs
  travel.remainingMs = Math.round(travel.remainingMs * factor)
  travel.totalMs = elapsed + travel.remainingMs
}

/** How fast the flight moves right now (a bramble snag slows it until you pull free). */
export function flightSpeed(state: GameState): number {
  return activeFlightEvent(state)?.kind === 'snag' ? FLIGHT_EVENT_RULES.snagSpeed : 1
}

/** The player taps the event: shoo pirates, catch what drifts by, help a traveler, and so on. */
export function tapFlightEvent(state: GameState): GameEvent[] {
  const event = activeFlightEvent(state)
  const travel = state.player.travel
  if (!event || !travel) return [{ type: 'blocked', reason: 'no-target' }]
  const flavor = eventFlavor(event.regionId)
  state.stats.taps++
  event.taps++
  switch (event.kind) {
    case 'ambush':
      if (event.taps < FLIGHT_EVENT_RULES.ambushTaps) return []
      event.resolved = true
      state.stats.ambushesFoiled++
      return [{ type: 'flight-event', result: 'The pirates flutter off, outwitted!' }]
    case 'windfall': {
      if (satchelFull(state)) {
        event.resolved = true
        return [{ type: 'flight-event', result: 'Your satchel is full.' }]
      }
      addItems(state.player.satchel, flavor.windfall.itemId, 1)
      if (event.taps >= flavor.windfall.max) event.resolved = true
      return [{ type: 'flight-event', result: `+1 ${itemName(flavor.windfall.itemId)}` }]
    }
    case 'traveler':
      event.resolved = true
      state.resources.glimmers += flavor.traveler.glimmers
      state.stats.glimmersEarned += flavor.traveler.glimmers
      return [
        {
          type: 'flight-event',
          result: `${flavor.traveler.thanks} with ${flavor.traveler.glimmers} Glimmers.`,
        },
      ]
    case 'snag':
      if (event.taps < FLIGHT_EVENT_RULES.snagTaps) return []
      event.resolved = true
      return [{ type: 'flight-event', result: 'You pull free of the brambles!' }]
    case 'wisp':
      event.resolved = true
      reshapeFlight(travel, FLIGHT_EVENT_RULES.wispShortcut)
      return [{ type: 'flight-event', result: "The will-o'-wisp shows you a shortcut!" }]
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
  return [{ type: 'flight-event', result: 'A gust sends the pirates tumbling away!' }]
}

/**
 * When a flight lands with an ambush still going, the pirates make off with a few items from the
 * satchel (never trinkets). A setback, not a failure.
 */
export function settleFlightEvent(state: GameState, travel: TravelState, random: Random): void {
  const event = travel.event
  if (!event || event.resolved || event.kind !== 'ambush') return
  const favorites = CREWS[event.crewId ?? '']?.steals ?? []
  for (let i = 0; i < FLIGHT_EVENT_RULES.ambushSteals; i++) {
    const carried = Object.keys(state.player.satchel).filter(
      (id) => ITEMS[id]?.category !== 'trinket',
    )
    // Some crews go for their favorite things first (the Nectar Nabbers love honey and pollen).
    const preferred = carried.filter((id) => favorites.includes(id))
    const stealable = preferred.length > 0 ? preferred : carried
    if (stealable.length === 0) return
    addItems(state.player.satchel, stealable[Math.floor(random() * stealable.length)], -1)
  }
}
