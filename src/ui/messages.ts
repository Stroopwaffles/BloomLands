import type { BlockedReason } from '../engine/events'

/** Friendly text for why something can't be done right now. */
export const BLOCKED_TEXT: Record<BlockedReason, string> = {
  'satchel-full': 'Your satchel is full.',
  'not-here': "You can't do that from here.",
  'not-home': 'You need to be at home.',
  flying: "You're in the middle of a flight.",
  'no-plant': 'Nothing is growing there.',
  locked: 'Not researched yet.',
  'station-busy': 'This station is busy.',
  'research-busy': 'You are already researching something.',
  'missing-items': 'Not enough materials.',
  'already-done': 'Already done.',
}
