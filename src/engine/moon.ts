import { MOON_CYCLE, STARFALL_RULES, type WeatherKind } from '../data/challenges'
import { DAY_MS } from '../data/time'
import { isSpot, placeRegion } from '../data/world'
import { rollWeather } from './environment'
import type { GameEvent } from './events'
import { canChooseMoon, satchelCapacity } from './modifiers'
import type { Random } from './rng'
import { addItems, countItems, type GameState } from './state'

/**
 * The Moonlit Glade's moon (design doc 3.16): a cycle of phases instead of weather. During a
 * starfall, stars tumble through the scene and can be tapped; the Moon-Phase Locket lets you
 * pick the phase once a day.
 */

/** Catches a falling star at a Glade spot during a starfall. */
export function catchStar(state: GameState, random: Random): GameEvent[] {
  const { player } = state
  if (player.travel || !isSpot(player.place) || placeRegion(player.place) !== 'glade') {
    return [{ type: 'blocked', reason: 'not-here' }]
  }
  if (state.weather.glade?.kind !== 'starfall') return [{ type: 'blocked', reason: 'no-stars' }]
  if ((player.starMs ?? 0) > 0) return [{ type: 'blocked', reason: 'cooling-down' }]
  player.starMs = STARFALL_RULES.cooldownMs
  const roll = random()
  let itemId: string | null =
    roll < STARFALL_RULES.stardustChance
      ? 'raw-stardust'
      : roll < STARFALL_RULES.stardustChance + STARFALL_RULES.moonlightChance
        ? 'raw-moonlight'
        : null
  // A full satchel turns the find into Glimmers instead.
  if (itemId && countItems(player.satchel) >= satchelCapacity(state)) itemId = null
  const span = STARFALL_RULES.glimmersMax - STARFALL_RULES.glimmersMin + 1
  const glimmers = itemId ? 0 : STARFALL_RULES.glimmersMin + Math.floor(random() * span)
  if (itemId) addItems(player.satchel, itemId, 1)
  state.resources.glimmers += glimmers
  state.stats.glimmersEarned += glimmers
  return [{ type: 'star-caught', glimmers, itemId }]
}

/** Phases the Moon-Phase Locket can choose. */
export const CHOOSABLE_MOONS: readonly WeatherKind[] = [...MOON_CYCLE, 'starfall']

/** The Moon-Phase Locket: at the Moon Pool, once a day, choose the Glade's moon. */
export function chooseMoon(state: GameState, phase: WeatherKind, random: Random): GameEvent[] {
  if (!canChooseMoon(state)) return [{ type: 'blocked', reason: 'locked' }]
  if (!CHOOSABLE_MOONS.includes(phase)) return [{ type: 'blocked', reason: 'locked' }]
  if (state.player.travel || state.player.place !== 'moon-pool') {
    return [{ type: 'blocked', reason: 'not-here' }]
  }
  if ((state.player.moonLocketMs ?? 0) > 0) return [{ type: 'blocked', reason: 'cooling-down' }]
  // A starfall sits where a waxing moon would, so the cycle carries on to the full moon.
  const step = phase === 'starfall' ? 0 : MOON_CYCLE.indexOf(phase)
  const { remainingMs } = rollWeather('glade', random)
  state.weather.glade = { kind: phase, remainingMs, step }
  state.player.moonLocketMs = DAY_MS
  return [{ type: 'moon-chosen', phase }]
}

export function advanceMoonTimers(state: GameState, dtMs: number): void {
  const { player } = state
  if (player.starMs) player.starMs = Math.max(0, player.starMs - dtMs)
  if (player.moonLocketMs) player.moonLocketMs = Math.max(0, player.moonLocketMs - dtMs)
}
