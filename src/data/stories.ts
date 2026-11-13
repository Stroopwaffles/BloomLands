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
  'char-hazel': {
    id: 'char-hazel',
    name: 'Hazel Quickpaw',
    title: 'a speedy squirrel courier',
    settlement: 'acornhollow',
  },
  'char-burdock': {
    id: 'char-burdock',
    name: 'Old Burdock',
    title: 'a hedgehog herbalist',
    settlement: 'acornhollow',
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
  'story-hazel': {
    id: 'story-hazel',
    characterId: 'char-hazel',
    curioId: 'curio-forgotten-acorn',
    chapters: [
      {
        lines: [
          'Fairy! Fairy-fairy-fairy! Have you got a minute? Half a minute? I talk fast.',
          "I buried ALL of Acornhollow's festival supplies so nobody would nibble them. Very clever.",
          'Then I forgot where. Less clever. Could you poke around the forest floor while you gather?',
        ],
        task: {
          kind: 'stat',
          stat: 'plantsHarvested',
          amount: 25,
          label: 'Gather 25 plants while you look for Hazel’s caches',
        },
      },
      {
        lines: [
          'You found the first cache! Under a fern! Of course! I love ferns!',
          'Oh no. The acorns in it sprouted. We need fresh ones for the festival cakes.',
        ],
        task: {
          kind: 'bring',
          items: [{ itemId: 'raw-acorns', amount: 8 }],
          label: 'Bring Hazel 8 Acorns',
        },
      },
      {
        lines: [
          'Perfect acorns. Round. Brown. Acorny.',
          'Mother Thornbury says festival cakes need flour, not whole acorns. Who knew? Everyone, apparently.',
        ],
        task: {
          kind: 'bring',
          items: [{ itemId: 'refined-acorn-flour', amount: 2 }],
          label: 'Bring Hazel 2 Acorn Flour',
        },
      },
      {
        lines: [
          'Last cache! It was in the village the whole time, under the lanterns. Very embarrassing.',
          'The villagers are busy decorating. Could you lend them a hand while I hide... I mean, help?',
        ],
        task: {
          kind: 'stat',
          stat: 'villagersHelped',
          amount: 2,
          label: 'Help 2 villagers in Acornhollow',
        },
      },
    ],
    ending: [
      'The festival is ON! Everybody found everything! Mostly thanks to you!',
      "Here, keep this acorn. I forgot to bury it. It's lucky. It finds things. Unlike me.",
    ],
  },
  'story-burdock': {
    id: 'story-burdock',
    characterId: 'char-burdock',
    curioId: 'curio-burdocks-field-guide',
    chapters: [
      {
        lines: [
          'Ah. A visitor. Mind the specimen jars, dear.',
          "I am writing the Forest's very first field guide to mushrooms. Every one, drawn true to life.",
          'I start, as one should, with the humble button mushroom. A few fresh caps, please.',
        ],
        task: {
          kind: 'bring',
          items: [{ itemId: 'raw-mushroom-caps', amount: 6 }],
          label: 'Bring Burdock 6 Mushroom caps',
        },
      },
      {
        lines: [
          'Splendid gills. Now, the red-cap toadstool. Pretty, but you must never eat one.',
          'Bring me a few, and wash your hands after.',
        ],
        task: {
          kind: 'bring',
          items: [{ itemId: 'raw-red-caps', amount: 4 }],
          label: 'Bring Burdock 4 Red caps',
        },
      },
      {
        lines: [
          'To study spores, one grinds them fine. My paws are too old for the mortar these days.',
        ],
        task: {
          kind: 'bring',
          items: [{ itemId: 'refined-spore-dust', amount: 2 }],
          label: 'Bring Burdock 2 Spore Dust',
        },
      },
      {
        lines: [
          'And now the jewel of the book: the golden chanterelle. Rare, shy, and smells of apricots.',
        ],
        task: {
          kind: 'bring',
          items: [{ itemId: 'raw-golden-caps', amount: 1 }],
          label: 'Bring Burdock 1 Golden cap',
        },
      },
    ],
    ending: [
      'There. Finished. The first field guide of the Forest, and your name is in the thank-yous.',
      "Take my old copy. Oh, and the old log by the ferns? It's my secret reading room. Do visit.",
    ],
  },
}
