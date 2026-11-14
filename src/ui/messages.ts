import type { BlockedReason } from '../engine/events'

/** Friendly text for why something can't be done right now. */
export const BLOCKED_TEXT: Record<BlockedReason, string> = {
  'satchel-full': 'Your satchel is full.',
  'storage-full': 'Your storage is full. Build a bigger storeroom.',
  'not-here': "You can't do that from here.",
  'not-home': 'You need to be at home.',
  flying: "You're in the middle of a flight.",
  'no-plant': 'Nothing is growing there.',
  locked: 'Not available yet.',
  'not-built': 'Not built yet.',
  'station-busy': 'This station is busy.',
  'research-busy': 'You are already researching something.',
  'missing-items': 'Not enough materials.',
  'missing-glimmers': 'Not enough Glimmers.',
  'already-done': 'Already done.',
  'no-room': 'No room for more. Build more lodging.',
  camp: 'Pirates have camped here.',
  'no-target': 'Nothing here for that.',
  'no-circle': 'Build a Ritual Circle first.',
  'not-ready': 'Not ready yet. Try again soon.',
  'not-morning': 'This rite only works in the morning.',
  watching: 'Something is watching this spot. Calm it, or sneak past with Hush Step.',
  'needs-rank': 'Your court needs a higher rank first.',
  'calm-only': 'Too grumpy to shoo. Only a calming spell will do.',
}
