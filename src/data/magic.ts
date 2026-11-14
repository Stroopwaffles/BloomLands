import type { CostEntry } from './types'

/** What a spell is cast at (design doc 3.5: spells are for encounters). */
export type SpellTarget =
  | 'pests'
  | 'creature'
  | 'ambush'
  | 'camp'
  | 'tame'
  | 'parley'
  | 'sneak'
  | 'webs'
  | 'shadow'
  | 'storm'

export interface SpellDef {
  id: string
  name: string
  description: string
  target: SpellTarget
  cost: CostEntry[]
}

/**
 * Each region's signature component (content doc → Recipe Tree). Parley and Kindred Call use the
 * signature of the region you cast them in, in place of Sun Salve.
 */
export const REGION_SIGNATURE: Readonly<Record<string, string>> = {
  meadow: 'component-sun-salve',
  forest: 'component-earth-loam',
  swamp: 'component-lily-balm',
  orchard: 'component-beeswax-candle',
  caves: 'component-glow-ink',
  glade: 'component-moon-draught',
  sky: 'component-wind-silk',
}

/** Spells whose Sun Salve is swapped for the local region's signature component. */
export const REGIONAL_SPELLS: readonly string[] = ['spell-kindred-call', 'spell-parley']

/** Spells (content doc → Recipe Tree → Spells). Costs are starting values. */
export const SPELLS: Readonly<Record<string, SpellDef>> = {
  'spell-bugbane': {
    id: 'spell-bugbane',
    name: 'Bugbane Whisper',
    description: 'Clears every pest in a harvesting spot.',
    target: 'pests',
    cost: [{ itemId: 'component-pest-smudge', amount: 1 }],
  },
  'spell-lullaby': {
    id: 'spell-lullaby',
    name: 'Lullaby',
    description: 'Calms a large creature, who wanders off peacefully.',
    target: 'creature',
    cost: [{ itemId: 'component-calming-tea', amount: 1 }],
  },
  'spell-gust': {
    id: 'spell-gust',
    name: 'Gust',
    description: 'Blows away a pirate ambush mid-flight.',
    target: 'ambush',
    cost: [{ itemId: 'component-thistle-twine', amount: 1 }],
  },
  'spell-kindred-call': {
    id: 'spell-kindred-call',
    name: 'Kindred Call',
    description: 'Invites a befriended creature to join your court as a mount.',
    target: 'tame',
    cost: [
      { itemId: 'component-sweet-bait', amount: 1 },
      { itemId: 'component-sun-salve', amount: 1 },
    ],
  },
  'spell-parley': {
    id: 'spell-parley',
    name: 'Parley',
    description:
      'Shares a treat and a kind word with a pirate camp. Enough of them wins a crew over.',
    target: 'parley',
    cost: [
      { itemId: 'component-sweet-bait', amount: 1 },
      { itemId: 'component-sun-salve', amount: 1 },
    ],
  },
  'spell-hush-step': {
    id: 'spell-hush-step',
    name: 'Hush Step',
    description:
      'Light as a seed: gather for two minutes without bothering a watching owl or heron.',
    target: 'sneak',
    cost: [
      { itemId: 'component-calming-tea', amount: 1 },
      { itemId: 'component-thistle-twine', amount: 1 },
    ],
  },
  'spell-web-unweave': {
    id: 'spell-web-unweave',
    name: 'Web Unweave',
    description: 'Gently unpicks the spider webs blocking a spot in the Caves.',
    target: 'webs',
    cost: [{ itemId: 'component-glow-ink', amount: 1 }],
  },
  'spell-shadowlight': {
    id: 'spell-shadowlight',
    name: 'Shadowlight',
    description:
      'In the Glade: ends a new moon early, and sends the Moonshadow Crew packing from their camp.',
    target: 'shadow',
    cost: [
      { itemId: 'component-glow-ink', amount: 1 },
      { itemId: 'component-moon-draught', amount: 1 },
    ],
  },
  'spell-stormward': {
    id: 'spell-stormward',
    name: 'Stormward',
    description:
      'For ten minutes, you can fly to and from the Sky Isles even in a storm. Cast it anywhere.',
    target: 'storm',
    cost: [
      { itemId: 'component-wind-silk', amount: 1 },
      { itemId: 'component-crystal-focus', amount: 1 },
    ],
  },
  'spell-tanglevine': {
    id: 'spell-tanglevine',
    name: 'Tanglevine',
    description: 'Vines gently tangle a pirate camp until the pirates pack up and leave.',
    target: 'camp',
    cost: [
      { itemId: 'component-thistle-twine', amount: 1 },
      { itemId: 'component-sun-salve', amount: 1 },
    ],
  },
}

export type RitualEffect =
  | 'turn-to-day'
  | 'turn-to-night'
  | 'open-fairy-ring'
  | 'open-secret'
  | 'unlock-region'
  | 'plenty'
  | 'root-song'

export interface RitualDef {
  id: string
  name: string
  description: string
  effect: RitualEffect
  cost: CostEntry[]
  /** Only works in the morning. */
  morningOnly?: boolean
  /** For 'unlock-region' rites: which region opens. */
  region?: string
  /** The court rank needed to perform it (index into COURT_RANKS), besides a region's own. */
  rank?: number
  /** Only works under a full moon in the Glade. */
  fullMoonOnly?: boolean
  /** For 'open-secret' rites: which secret area opens. */
  secret?: string
}

/** Rite of Plenty: how long it lasts and how much faster plants regrow. */
export const PLENTY = { durationMs: 10 * 60_000, regrowth: 1.5 }

/** Rituals are performed at the Ritual Circle at home. */
export const RITUALS: Readonly<Record<string, RitualDef>> = {
  'ritual-turning-day': {
    id: 'ritual-turning-day',
    name: 'Rite of Turning: Dawn',
    description: 'Turns the sky to dawn.',
    effect: 'turn-to-day',
    cost: [{ itemId: 'component-sun-salve', amount: 1 }],
  },
  'ritual-dawn': {
    id: 'ritual-dawn',
    name: 'Rite of Dawn',
    description: 'Performed in the morning, it reveals the Fairy Ring for this run.',
    effect: 'open-fairy-ring',
    morningOnly: true,
    cost: [
      { itemId: 'component-sun-salve', amount: 1 },
      { itemId: 'component-lucky-charm-dust', amount: 1 },
    ],
  },
  'ritual-open-path': {
    id: 'ritual-open-path',
    name: 'Rite of the Open Path',
    description: 'Opens the way to the Forest. Needs a Hearthling court.',
    effect: 'unlock-region',
    region: 'forest',
    cost: [{ itemId: 'component-sun-salve', amount: 2 }],
  },
  'ritual-reed-gate': {
    id: 'ritual-reed-gate',
    name: 'Rite of the Reed Gate',
    description: 'Parts the reeds into the Swamp. Needs a Hedge Court.',
    effect: 'unlock-region',
    region: 'swamp',
    cost: [
      { itemId: 'component-earth-loam', amount: 2 },
      { itemId: 'component-sun-salve', amount: 1 },
    ],
  },
  'ritual-first-blossom': {
    id: 'ritual-first-blossom',
    name: 'Rite of First Blossom',
    description: 'Wakes the sleeping orchard. Needs a Bramble Court.',
    effect: 'unlock-region',
    region: 'orchard',
    cost: [
      { itemId: 'component-lily-balm', amount: 2 },
      { itemId: 'component-sun-salve', amount: 2 },
    ],
  },
  'ritual-lantern': {
    id: 'ritual-lantern',
    name: 'Lantern Rite',
    description: 'Lights the way into the Caves for good. Needs a Bramble Court.',
    effect: 'unlock-region',
    region: 'caves',
    cost: [
      { itemId: 'component-beeswax-candle', amount: 2 },
      { itemId: 'component-lily-balm', amount: 1 },
    ],
  },
  'ritual-long-twilight': {
    id: 'ritual-long-twilight',
    name: 'Rite of Long Twilight',
    description:
      'Calls up an evening that never ends: the Moonlit Glade opens. Needs a Blossom Court.',
    effect: 'unlock-region',
    region: 'glade',
    cost: [
      { itemId: 'component-crystal-focus', amount: 1 },
      { itemId: 'component-lily-balm', amount: 2 },
    ],
  },
  'ritual-moonrise': {
    id: 'ritual-moonrise',
    name: 'Moonrise Rite',
    description: 'Performed under a full moon, it opens the Dream Hollow for this run.',
    effect: 'open-secret',
    secret: 'dream-hollow',
    fullMoonOnly: true,
    cost: [
      { itemId: 'component-moon-draught', amount: 1 },
      { itemId: 'component-crystal-focus', amount: 1 },
    ],
  },
  'ritual-plenty': {
    id: 'ritual-plenty',
    name: 'Rite of Plenty',
    description: 'For ten minutes, plants regrow 50% faster in every open region.',
    effect: 'plenty',
    cost: [
      { itemId: 'component-earth-loam', amount: 1 },
      { itemId: 'component-sun-salve', amount: 1 },
    ],
  },
  'ritual-root-song': {
    id: 'ritual-root-song',
    name: 'Root Song Ritual',
    description:
      'Gives the land Root Song and begins a new run. Your fairy, outfits, Comforts, relics and Root Song stay; everything else starts over.',
    effect: 'root-song',
    rank: 4,
    cost: [{ itemId: 'component-harmony-blend', amount: 1 }],
  },
  'ritual-turning-night': {
    id: 'ritual-turning-night',
    name: 'Rite of Turning: Dusk',
    description: 'Turns the sky to night.',
    effect: 'turn-to-night',
    cost: [{ itemId: 'component-calming-tea', amount: 1 }],
  },
}
