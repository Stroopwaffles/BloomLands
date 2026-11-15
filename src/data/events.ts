/**
 * Special events: rare happenings that open a region of their own for a limited time. Each event
 * has a mini base where its own materials are made into its own rewards. Event materials never
 * reach the main game (they go straight to the event's pantry), so event recipes can't leak into
 * the regular economy. Pantries and rewards are kept forever, through every run, so progress
 * carries over to the next time the event comes round.
 */

export interface EventDef {
  id: string
  name: string
  /** The region that opens while the event lasts. */
  regionId: string
  /** The event's mini base (where its materials are used). */
  baseId: string
  durationMs: number
  /** Chance it begins at each nightfall... */
  chance: number
  /** ...plus this much more for every night it didn't (so it never stays away too long). */
  pityPerNight: number
  /** The court rank (index into COURT_RANKS) needed before it can happen. */
  minRank: number
  /** Said when it begins and ends. */
  rises: string
  sets: string
}

const MIN = 60_000

export const EVENTS: Readonly<Record<string, EventDef>> = {
  'blood-moon': {
    id: 'blood-moon',
    name: 'Blood Moon',
    regionId: 'crimson-vale',
    baseId: 'moonless-manor',
    durationMs: 40 * MIN,
    chance: 0.12,
    pityPerNight: 0.06,
    minRank: 1,
    rises: 'A Blood Moon rises! The Crimson Vale has appeared beyond the edge of the map…',
    sets: 'The Blood Moon sets, and the Crimson Vale fades into the mist.',
  },
}

export interface EventBaseDef {
  id: string
  name: string
  regionId: string
  eventId: string
  description: string
  /** Who keeps the base. */
  host: { id: string; name: string; title: string; greeting: string[] }
  /** What the base's workshop is called. */
  workshop: string
}

export const EVENT_BASES: Readonly<Record<string, EventBaseDef>> = {
  'moonless-manor': {
    id: 'moonless-manor',
    name: 'The Moonless Manor',
    regionId: 'crimson-vale',
    eventId: 'blood-moon',
    description:
      'A crooked manor of black stone and broken glass. Candles light themselves as you pass.',
    host: {
      id: 'char-countess-nocturna',
      name: 'Countess Nocturna',
      title: 'a vampire fairy who only wakes under a Blood Moon',
      greeting: [
        'Ahhh. A visitor. How… delicious. Do come in. Mind the bats; they bite. Only a little.',
        'Bring me what grows in my vale, little fairy, and my cauldron will make you something to wear. Something… unforgettable.',
      ],
    },
    workshop: "The Countess's Cauldron",
  },
}

export interface EventRecipe {
  id: string
  eventId: string
  name: string
  description: string
  inputs: { itemId: string; amount: number }[]
  /** An item for the pantry, or an outfit set unlocked forever. */
  output: { itemId: string; amount: number } | { outfitId: string }
}

export const EVENT_RECIPES: readonly EventRecipe[] = [
  {
    id: 'event-bloodrose-essence',
    eventId: 'blood-moon',
    name: 'Bloodrose Essence',
    description: 'Bloodrose petals steeped with a drop of nightshade.',
    inputs: [
      { itemId: 'event-bloodrose-petals', amount: 3 },
      { itemId: 'event-nightshade', amount: 1 },
    ],
    output: { itemId: 'event-bloodrose-essence', amount: 1 },
  },
  {
    id: 'event-shadow-silk',
    eventId: 'blood-moon',
    name: 'Shadow Silk',
    description: "Widow's lace spun with batwing fronds into a cloth darker than night.",
    inputs: [
      { itemId: 'event-widows-lace', amount: 2 },
      { itemId: 'event-batwing-fronds', amount: 2 },
    ],
    output: { itemId: 'event-shadow-silk', amount: 1 },
  },
  {
    id: 'event-ghostlight-wax',
    eventId: 'blood-moon',
    name: 'Ghostlight Wax',
    description: 'Ghostcaps and grave moss melted into a wax that glows a cold green.',
    inputs: [
      { itemId: 'event-ghostcap', amount: 3 },
      { itemId: 'event-grave-moss', amount: 2 },
    ],
    output: { itemId: 'event-ghostlight-wax', amount: 1 },
  },
  {
    id: 'event-outfit-crimson-rose',
    eventId: 'blood-moon',
    name: 'Crimson Rose set',
    description: 'A bloodrose gown and a crown of black thorns.',
    inputs: [
      { itemId: 'event-bloodrose-essence', amount: 4 },
      { itemId: 'event-shadow-silk', amount: 1 },
    ],
    output: { outfitId: 'outfit-crimson-rose' },
  },
  {
    id: 'event-outfit-gravewalker',
    eventId: 'blood-moon',
    name: 'Gravewalker set',
    description: 'A long ghostlit coat and a raven-feather hat.',
    inputs: [
      { itemId: 'event-ghostlight-wax', amount: 3 },
      { itemId: 'event-shadow-silk', amount: 2 },
      { itemId: 'event-grave-moss', amount: 6 },
    ],
    output: { outfitId: 'outfit-gravewalker' },
  },
  {
    id: 'event-outfit-vampire',
    eventId: 'blood-moon',
    name: "Vampire's Regalia",
    description: 'A high-collared cape and a circlet of bat wings. The Countess approves.',
    inputs: [
      { itemId: 'event-bloodrose-essence', amount: 2 },
      { itemId: 'event-shadow-silk', amount: 3 },
      { itemId: 'event-ghostlight-wax', amount: 2 },
      { itemId: 'event-moonblood', amount: 1 },
    ],
    output: { outfitId: 'outfit-vampire' },
  },
]
