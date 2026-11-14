import { COURT_RANKS } from '../data/economy'
import { CAPTAIN_LETTERS } from '../data/ending'
import type { GameEvent } from './events'
import { captainJoined, courtRank } from './modifiers'
import type { GameState } from './state'

/**
 * Captain Mallow's letters and the end of the game (design doc 3.11). Everything here is kept
 * through prestige: her letters arrive across every run.
 */

/** A crew won over: the first time ever, Captain Mallow writes (the seventh time, she comes). */
export function recordCrewWon(state: GameState, crewId: string): GameEvent[] {
  const won = state.prestige.crewsEverWon
  if (won.includes(crewId)) return []
  won.push(crewId)
  const events: GameEvent[] = [{ type: 'captain-letter', index: won.length - 1 }]
  if (won.length === CAPTAIN_LETTERS.length) events.push({ type: 'captain-joined' })
  return events
}

/** Letters the captain has sent (one per crew ever won over). */
export function captainLetters(state: GameState) {
  return CAPTAIN_LETTERS.slice(0, state.prestige.crewsEverWon.length)
}

export function unreadLetters(state: GameState): number {
  return Math.max(0, state.prestige.crewsEverWon.length - (state.prestige.lettersRead ?? 0))
}

export function readLetters(state: GameState): GameEvent[] {
  state.prestige.lettersRead = state.prestige.crewsEverWon.length
  return []
}

export { captainJoined }

/** After the ending, the bonus run: no more Root Song Ritual, and it ends at the final rank. */
export function inBonusRun(state: GameState): boolean {
  return state.prestige.endingSeen === true
}

/** The bonus run ends when the court reaches its final rank: the final screen. */
export function advanceFinale(state: GameState): void {
  if (!inBonusRun(state) || state.prestige.finale) return
  if (courtRank(state) < COURT_RANKS.length - 1) return
  state.prestige.finale = true
  state.inbox.push({ type: 'finale' })
}
