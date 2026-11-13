import type { CostEntry } from './types'

export interface CharacterDef {
  id: string
  name: string
  title: string
  settlement: string
}

/** Stats a story task can count (progress since the chapter began). */
export type StoryStat = 'plantsHarvested' | 'creaturesShooed' | 'villagersHelped'

export type StoryTask =
  | { kind: 'bring'; items: CostEntry[]; label: string }
  | { kind: 'stat'; stat: StoryStat; amount: number; label: string }

export interface StoryChapter {
  /** What the character says when this chapter begins. */
  lines: string[]
  task: StoryTask
}

export interface StoryDef {
  id: string
  characterId: string
  chapters: StoryChapter[]
  /** What the character says when the story is finished. */
  ending: string[]
  curioId: string
}

/** Location characters (content doc → Meadow → Characters). */
export const CHARACTERS: Readonly<Record<string, CharacterDef>> = {
  'char-pip': {
    id: 'char-pip',
    name: 'Pip Thistledown',
    title: 'an elderly field-mouse mapmaker',
    settlement: 'thimblewick',
  },
  'char-marigold': {
    id: 'char-marigold',
    name: 'Marigold',
    title: 'a young mouse baker',
    settlement: 'thimblewick',
  },
}

export const STORIES: Readonly<Record<string, StoryDef>> = {
  'story-pip': {
    id: 'story-pip',
    characterId: 'char-pip',
    curioId: 'curio-pips-compass',
    chapters: [
      {
        lines: [
          "Oh! Oh dear. A fairy! You haven't seen any maps, have you?",
          'The storm blew my whole collection out of the window. Every map of the Meadow I ever drew!',
          "They'll be scattered all over the flowers. If you're gathering anyway, keep your eyes open?",
        ],
        task: {
          kind: 'stat',
          stat: 'plantsHarvested',
          amount: 20,
          label: 'Gather 20 plants while you look for map scraps',
        },
      },
      {
        lines: [
          'You found some! Bless your wings.',
          "But look, they're soaked. The ink will run if they dry too fast.",
          'A wash of Leaf Tea sets the ink. Could you bring me some?',
        ],
        task: {
          kind: 'bring',
          items: [{ itemId: 'refined-leaf-tea', amount: 2 }],
          label: 'Bring Pip 2 Leaf Tea',
        },
      },
      {
        lines: [
          'Perfect. Now, the last piece... I saw it blow right into a rabbit burrow.',
          "Rabbits are lovely, but they don't share. If you see one, shoo it along and I'll fetch my map.",
        ],
        task: {
          kind: 'stat',
          stat: 'creaturesShooed',
          amount: 1,
          label: 'Send a rabbit on its way',
        },
      },
      {
        lines: [
          'There it is! Only a little nibbled.',
          'One more favor: a map needs a soft case. Bring me some dandelion fluff to pad it?',
        ],
        task: {
          kind: 'bring',
          items: [{ itemId: 'raw-dandelion-fluff', amount: 6 }],
          label: 'Bring Pip 6 Dandelion fluff',
        },
      },
    ],
    ending: [
      'A map of the whole Meadow, good as new! Better, even.',
      'Here, take my old compass. It always knows the quickest way home.',
    ],
  },
  'story-marigold': {
    id: 'story-marigold',
    characterId: 'char-marigold',
    curioId: 'curio-festival-ribbon',
    chapters: [
      {
        lines: [
          "Hello! I'm Marigold. I bake for the whole village.",
          'The festival is coming, and I want to bake the most perfect strawberry tart Thimblewick has ever tasted.',
          'First, the berries. The wild ones from Dandelion Drift are the sweetest.',
        ],
        task: {
          kind: 'bring',
          items: [{ itemId: 'raw-wild-berries', amount: 8 }],
          label: 'Bring Marigold 8 Wild berries',
        },
      },
      {
        lines: [
          'Oh, these are beautiful! Now for the glaze.',
          'Petal Paste makes the prettiest pink glaze. Could you grind some for me?',
        ],
        task: {
          kind: 'bring',
          items: [{ itemId: 'refined-petal-paste', amount: 2 }],
          label: 'Bring Marigold 2 Petal Paste',
        },
      },
      {
        lines: [
          'The tart is baking! Can you smell it?',
          "Everyone's so busy getting ready for the festival. Would you help a few villagers while it bakes?",
        ],
        task: {
          kind: 'stat',
          stat: 'villagersHelped',
          amount: 2,
          label: 'Help 2 villagers in Thimblewick',
        },
      },
      {
        lines: [
          'Nearly time! The tart needs to stay warm on the festival table...',
          'A Sun Salve rubbed on the dish keeps it warm all evening.',
        ],
        task: {
          kind: 'bring',
          items: [{ itemId: 'component-sun-salve', amount: 1 }],
          label: 'Bring Marigold 1 Sun Salve',
        },
      },
    ],
    ending: [
      'The festival was wonderful, and everyone says it was the best tart in a hundred years!',
      "Please, wear this festival ribbon. Traders will know you're a friend of Thimblewick.",
    ],
  },
}
