import { EVENT_BASES, EVENT_RECIPES, EVENTS, type EventDef } from '../data/events'
import { HOME, placeRegion, REGIONS, SPOTS } from '../data/world'
import { isNight } from './environment'
import type { GameEvent } from './events'
import { courtRank } from './modifiers'
import { ensureRegion } from './regions'
import type { Random } from './rng'
import { addItems, type GameState } from './state'

/**
 * Special events (the Blood Moon, and others to come). At each nightfall a waiting event may
 * begin; while it lasts, its region and mini base are open. Its materials go straight to the
 * event's pantry, and the base's recipes turn them into rewards (outfits) kept forever.
 */

export function activeEvent(state: GameState): EventDef | null {
  const active = state.specialEvents.active
  return active ? (EVENTS[active.id] ?? null) : null
}

/** Is this region's event happening right now? */
export function eventRegionOpen(state: GameState, regionId: string): boolean {
  const event = REGIONS[regionId]?.event
  return !!event && state.specialEvents.active?.id === event
}

/** The event pantry: where an event's materials and makings are kept (never in storage). */
export function eventStore(state: GameState, eventId: string): Record<string, number> {
  return (state.specialEvents.stores[eventId] ??= {})
}

export function startEvent(state: GameState, eventId: string, random: Random): GameEvent[] {
  const def = EVENTS[eventId]
  if (!def || state.specialEvents.active) return []
  state.specialEvents.active = { id: eventId, remainingMs: def.durationMs }
  state.specialEvents.nightsWithout = 0
  state.specialEvents.seen[eventId] = (state.specialEvents.seen[eventId] ?? 0) + 1
  ensureRegion(state, def.regionId, random)
  return [{ type: 'event-started', eventId }]
}

/** The event ends. Anyone still in its region finds themselves safely back home. */
export function endEvent(state: GameState): GameEvent[] {
  const def = activeEvent(state)
  state.specialEvents.active = null
  if (!def) return []
  const { player } = state
  const inside = (placeId: string | undefined) => !!placeId && placeRegion(placeId) === def.regionId
  const sentHome =
    inside(player.place) || inside(player.travel?.to) || (!!player.travel && inside(player.place))
  if (sentHome) {
    player.travel = null
    player.place = HOME
  }
  // The vale's troubles fade with it.
  for (const spotId of REGIONS[def.regionId].spots) delete state.challenges.creatures[spotId]
  return [{ type: 'event-ended', eventId: def.id, sentHome }]
}

/** Counts down the active event, and rolls for a new one at each nightfall (live play only). */
export function advanceSpecialEvents(
  state: GameState,
  dtMs: number,
  random: Random,
  offline: boolean,
): void {
  const events = state.specialEvents
  if (events.active) {
    events.active.remainingMs -= dtMs
    if (events.active.remainingMs <= 0) state.inbox.push(...endEvent(state))
  }
  const night = isNight(state)
  const nightfall = night && !events.wasNight
  events.wasNight = night
  if (!nightfall || events.active) return
  // Events only begin while you're playing, so you're there to see them.
  if (offline) return
  for (const def of Object.values(EVENTS)) {
    if (courtRank(state) < def.minRank) continue
    const chance = def.chance + events.nightsWithout * def.pityPerNight
    if (random() < chance) {
      state.inbox.push(...startEvent(state, def.id, random))
      return
    }
  }
  events.nightsWithout++
}

export type EventCraftCheck = 'ok' | 'locked' | 'not-here' | 'missing-items' | 'already-done'

export function checkEventRecipe(state: GameState, recipeId: string): EventCraftCheck {
  const recipe = EVENT_RECIPES.find((r) => r.id === recipeId)
  if (!recipe) return 'locked'
  const base = Object.values(EVENT_BASES).find((b) => b.eventId === recipe.eventId)
  if (!base || state.player.travel || state.player.place !== base.id) return 'not-here'
  if (state.specialEvents.active?.id !== recipe.eventId) return 'not-here'
  if ('outfitId' in recipe.output && state.outfits.includes(recipe.output.outfitId)) {
    return 'already-done'
  }
  const store = eventStore(state, recipe.eventId)
  if (!recipe.inputs.every((i) => (store[i.itemId] ?? 0) >= i.amount)) return 'missing-items'
  return 'ok'
}

/** Makes an event recipe at its base: from the pantry, into the pantry (or the wardrobe). */
export function craftEventRecipe(state: GameState, recipeId: string): GameEvent[] {
  const check = checkEventRecipe(state, recipeId)
  if (check !== 'ok') return [{ type: 'blocked', reason: check }]
  const recipe = EVENT_RECIPES.find((r) => r.id === recipeId)!
  const store = eventStore(state, recipe.eventId)
  for (const input of recipe.inputs) addItems(store, input.itemId, -input.amount)
  if ('outfitId' in recipe.output) {
    state.outfits.push(recipe.output.outfitId)
    return [
      { type: 'event-crafted', recipeId },
      { type: 'outfit', outfitId: recipe.output.outfitId },
    ]
  }
  addItems(store, recipe.output.itemId, recipe.output.amount)
  return [{ type: 'event-crafted', recipeId }]
}

/** The event a harvesting spot belongs to (its harvests go to that event's pantry). */
export function spotEvent(spotId: string): string | null {
  const spot = SPOTS[spotId]
  return (spot && REGIONS[spot.regionId]?.event) || null
}
