import type { CostEntry } from './types'

/** What a spell is cast at (design doc 3.5: spells are for encounters). */
export type SpellTarget = 'pests' | 'creature' | 'ambush' | 'camp' | 'tame'

export interface SpellDef {
  id: string
  name: string
  description: string
  target: SpellTarget
  cost: CostEntry[]
}

/** Meadow spells (content doc → Recipe Tree → Spells). Costs are starting values. */
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

export type RitualEffect = 'turn-to-day' | 'turn-to-night'

export interface RitualDef {
  id: string
  name: string
  description: string
  effect: RitualEffect
  cost: CostEntry[]
}

/** Rituals are performed at the Ritual Circle at home. */
export const RITUALS: Readonly<Record<string, RitualDef>> = {
  'ritual-turning-day': {
    id: 'ritual-turning-day',
    name: 'Rite of Turning: Dawn',
    description: 'Turns the sky to dawn.',
    effect: 'turn-to-day',
    cost: [{ itemId: 'component-sun-salve', amount: 1 }],
  },
  'ritual-turning-night': {
    id: 'ritual-turning-night',
    name: 'Rite of Turning: Dusk',
    description: 'Turns the sky to night.',
    effect: 'turn-to-night',
    cost: [{ itemId: 'component-calming-tea', amount: 1 }],
  },
}
