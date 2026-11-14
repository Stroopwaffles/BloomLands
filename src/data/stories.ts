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
  'char-gubbins': {
    id: 'char-gubbins',
    name: 'Mayor Gubbins',
    title: 'the pompous, kind-hearted toad mayor',
    settlement: 'toad-village',
  },
  'char-wren': {
    id: 'char-wren',
    name: 'Wren Mudwhistle',
    title: 'a newt musician',
    settlement: 'toad-village',
  },
  'char-waxwick': {
    id: 'char-waxwick',
    name: 'Waxwick',
    title: 'a worker-bee foreman',
    settlement: 'combhaven',
  },
  'char-bumbleton': {
    id: 'char-bumbleton',
    name: 'Sir Bumbleton',
    title: 'a retired (and very dramatic) bumblebee knight',
    settlement: 'combhaven',
  },
  'char-digby': {
    id: 'char-digby',
    name: 'Digby Loamsworth',
    title: 'a mole engineer',
    settlement: 'glimmerdeep',
  },
  'char-lumen': {
    id: 'char-lumen',
    name: 'Lumen',
    title: 'a shy young glowworm',
    settlement: 'glimmerdeep',
  },
  'char-nox': {
    id: 'char-nox',
    name: 'Old Nox',
    title: 'an ancient firefly lamplighter',
    settlement: 'emberglow',
  },
  'char-vesper': {
    id: 'char-vesper',
    name: 'Vesper',
    title: 'a dreamy moth poet',
    settlement: 'emberglow',
  },
  'char-cumulus': {
    id: 'char-cumulus',
    name: 'Professor Cumulus',
    title: 'an absent-minded cloud-sprite astronomer',
    settlement: 'nimbusrest',
  },
  'char-twill': {
    id: 'char-twill',
    name: 'Twill',
    title: 'a young wind sprite who weaves sails',
    settlement: 'nimbusrest',
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
  'story-gubbins': {
    id: 'story-gubbins',
    characterId: 'char-gubbins',
    curioId: 'curio-mayors-chain',
    chapters: [
      {
        lines: [
          'Ahem! HARRUMPH. A visitor! Welcome, welcome, to Toad Village, jewel of the Swamp!',
          'I, Mayor Gubbins, am planning the first ever Grand Lily-Pad Regatta. Very grand. Very wet.',
          'Every boat needs a mast. Reeds, my dear fairy. Lots of reeds.',
        ],
        task: {
          kind: 'bring',
          items: [{ itemId: 'raw-reed-stalks', amount: 10 }],
          label: 'Bring the Mayor 10 Reed stalks',
        },
      },
      {
        lines: ['Splendid masts! Now the rigging. Twine would snap. We need proper Reed Fiber.'],
        task: {
          kind: 'bring',
          items: [{ itemId: 'refined-reed-fiber', amount: 2 }],
          label: 'Bring the Mayor 2 Reed Fiber',
        },
      },
      {
        lines: [
          'Alas, the villagers say regattas are "a lot of fuss". A LOT of fuss? It is EXACTLY enough fuss!',
          'Perhaps if somebody helped them with their chores, they would have time to sail.',
        ],
        task: {
          kind: 'stat',
          stat: 'villagersHelped',
          amount: 3,
          label: 'Help 3 villagers in Toad Village',
        },
      },
      {
        lines: [
          'Everyone is coming! Now, the mayoral trophy must SHINE. Lily Balm, the finest polish there is.',
        ],
        task: {
          kind: 'bring',
          items: [{ itemId: 'component-lily-balm', amount: 1 }],
          label: 'Bring the Mayor 1 Lily Balm',
        },
      },
    ],
    ending: [
      'What a regatta! Three boats sank, and everybody agrees it was the best day in Swamp history.',
      'Please, wear my spare chain of office. The villagers will listen to you. Mostly.',
    ],
  },
  'story-wren': {
    id: 'story-wren',
    characterId: 'char-wren',
    curioId: 'curio-reed-pipe',
    chapters: [
      {
        lines: [
          'Oh! Hello. Shh. Listen. Hear the frogs? Every one of them is singing a different song.',
          "I'm starting a frog choir. A proper one. With instruments. Reed pipes first, please.",
        ],
        task: {
          kind: 'bring',
          items: [{ itemId: 'raw-reed-stalks', amount: 8 }],
          label: 'Bring Wren 8 Reed stalks',
        },
      },
      {
        lines: [
          'Lovely pipes. Now drums. Cattail fluff makes the softest drum pads. Frogs like soft.',
        ],
        task: {
          kind: 'bring',
          items: [{ itemId: 'raw-cattail-fluff', amount: 6 }],
          label: 'Bring Wren 6 Cattail fluff',
        },
      },
      {
        lines: [
          'Now we need singers. While you gather, listen for frogs who can hold a tune.',
          'Most of them just go "ribbit". We need the ones who go "ribBIT".',
        ],
        task: {
          kind: 'stat',
          stat: 'plantsHarvested',
          amount: 30,
          label: 'Gather 30 plants while you listen for singing frogs',
        },
      },
      {
        lines: ['All that croaking makes for sore throats. Myrtle leaves make a soothing tea.'],
        task: {
          kind: 'bring',
          items: [{ itemId: 'raw-myrtle-leaves', amount: 4 }],
          label: 'Bring Wren 4 Myrtle leaves',
        },
      },
    ],
    ending: [
      'The first concert of the Mudwhistle Frog Choir! Nobody was in tune, and it was perfect.',
      'Take my first reed pipe. Play it for your helpers. They fly faster with a tune to hum.',
    ],
  },
  'story-waxwick': {
    id: 'story-waxwick',
    characterId: 'char-waxwick',
    curioId: 'curio-honeycomb-brooch',
    chapters: [
      {
        lines: [
          "Buzz! Hard hats on! Sorry, you don't have a hard hat. Stand behind the wax line.",
          'The spring storm knocked out the whole east wing of the hive. We need comb. Lots of comb.',
        ],
        task: {
          kind: 'bring',
          items: [{ itemId: 'raw-honey', amount: 12 }],
          label: 'Bring Waxwick 12 Honey',
        },
      },
      {
        lines: [
          'Good honey. Now scaffolding. Reed fiber is light and strong. Swamp folk swear by it.',
        ],
        task: {
          kind: 'bring',
          items: [{ itemId: 'refined-reed-fiber', amount: 3 }],
          label: 'Bring Waxwick 3 Reed Fiber',
        },
      },
      {
        lines: [
          'The workers are tired and grumpy. Help a few neighbors, and morale will lift itself.',
        ],
        task: {
          kind: 'stat',
          stat: 'villagersHelped',
          amount: 3,
          label: 'Help 3 villagers in Combhaven',
        },
      },
      {
        lines: [
          'Last thing: the new wing is dark as a cellar. Candles, please. Beeswax, naturally.',
        ],
        task: {
          kind: 'bring',
          items: [{ itemId: 'component-beeswax-candle', amount: 2 }],
          label: 'Bring Waxwick 2 Beeswax Candles',
        },
      },
    ],
    ending: [
      "The east wing is open, and it's the finest wax work in the Orchard, if I say so myself.",
      "Take this brooch. Honeycomb packs tight: you'll be amazed what fits in your storeroom.",
    ],
  },
  'story-bumbleton': {
    id: 'story-bumbleton',
    characterId: 'char-bumbleton',
    curioId: 'curio-knights-pennant',
    chapters: [
      {
        lines: [
          'Halt! Who goes— oh, a fairy. Splendid. I am Sir Bumbleton, hero of a hundred battles.',
          'I am writing my memoirs. Chapter one: the Siege of Cherry Hill. I need... reference petals.',
        ],
        task: {
          kind: 'bring',
          items: [{ itemId: 'raw-cherry-petals', amount: 8 }],
          label: 'Bring Sir Bumbleton 8 Cherry petals',
        },
      },
      {
        lines: [
          'Chapter two: the Great Beast Wars! I drove off a dozen monsters. Possibly two.',
          'Remind me how it felt. Send a few big creatures packing, and report back.',
        ],
        task: {
          kind: 'stat',
          stat: 'creaturesShooed',
          amount: 3,
          label: 'Send away 3 large creatures',
        },
      },
      {
        lines: ['Chapter three: the Crabapple Catapult. Purely for historical accuracy.'],
        task: {
          kind: 'bring',
          items: [{ itemId: 'raw-crabapples', amount: 4 }],
          label: 'Bring Sir Bumbleton 4 Crabapples',
        },
      },
      {
        lines: [
          'The final chapter: the Golden Quest. Every knight needs a treasure. Mine was pollen.',
        ],
        task: {
          kind: 'bring',
          items: [{ itemId: 'raw-golden-pollen', amount: 1 }],
          label: 'Bring Sir Bumbleton 1 Golden pollen',
        },
      },
    ],
    ending: [
      'It is finished! "The Legendary Adventures of Sir Bumbleton", in four thrilling volumes.',
      'Carry my pennant, brave fairy. Any steed that flies under it flies a little faster.',
    ],
  },
  'story-digby': {
    id: 'story-digby',
    characterId: 'char-digby',
    curioId: 'curio-brass-spyglass',
    chapters: [
      {
        lines: [
          'Ah! Careful, that’s a load-bearing pebble. Digby Loamsworth, engineer.',
          'My family has never seen the sun. Not once! I’m building a lift, all the way up. I need rope.',
        ],
        task: {
          kind: 'bring',
          items: [{ itemId: 'raw-root-fibers', amount: 10 }],
          label: 'Bring Digby 10 Root fibers',
        },
      },
      {
        lines: [
          'Good strong rope. Now, counterweights. Crystal is heavy and lovely. Lovely heavy.',
        ],
        task: {
          kind: 'bring',
          items: [{ itemId: 'raw-crystal-shards', amount: 4 }],
          label: 'Bring Digby 4 Crystal shards',
        },
      },
      {
        lines: [
          'The town thinks I’m digging a hole to nowhere. Help the neighbors, and they’ll come round.',
        ],
        task: {
          kind: 'stat',
          stat: 'villagersHelped',
          amount: 3,
          label: 'Help 3 villagers in Glimmerdeep',
        },
      },
      {
        lines: ['Last thing. The shaft is pitch black. Candles, so nobody bumps their nose.'],
        task: {
          kind: 'bring',
          items: [{ itemId: 'component-beeswax-candle', amount: 2 }],
          label: 'Bring Digby 2 Beeswax Candles',
        },
      },
    ],
    ending: [
      'It works! We went up, and there it was. The sun. Grandma cried. I cried. The lift cried, a bit.',
      'Take my spyglass. And the lift is yours to use: things grow at the bottom of the sunbeam now.',
    ],
  },
  'story-lumen': {
    id: 'story-lumen',
    characterId: 'char-lumen',
    curioId: 'curio-nightlight-jar',
    chapters: [
      {
        lines: [
          'Oh! Um. Hello. I’m Lumen. I’m a glowworm. I’m... afraid of the dark. I know. I KNOW.',
          'Would you stay nearby while you gather? It’s less scary with company.',
        ],
        task: {
          kind: 'stat',
          stat: 'plantsHarvested',
          amount: 20,
          label: 'Gather 20 plants while Lumen keeps you company',
        },
      },
      {
        lines: [
          'Glowcaps glow too, like me! Could you bring some? Glowing friends are the best friends.',
        ],
        task: {
          kind: 'bring',
          items: [{ itemId: 'raw-glowcap-spores', amount: 6 }],
          label: 'Bring Lumen 6 Glowcap spores',
        },
      },
      {
        lines: [
          'A little jar of Glow Ink would make the perfect nightlight. Then I’d never be alone.',
        ],
        task: {
          kind: 'bring',
          items: [{ itemId: 'component-glow-ink', amount: 1 }],
          label: 'Bring Lumen 1 Glow Ink',
        },
      },
      {
        lines: [
          'I want to be brave. Really brave. Will you show me how? Chase off something big and scary.',
        ],
        task: {
          kind: 'stat',
          stat: 'creaturesShooed',
          amount: 1,
          label: 'Send away a spider, rockfall or other big trouble',
        },
      },
    ],
    ending: [
      'You did it, and I watched the whole time with my eyes open! I’m going to be brave too.',
      'Keep my nightlight. And... my cousin is a big glowworm. She’s by the fungi now. She’d like you.',
    ],
  },
  'story-nox': {
    id: 'story-nox',
    characterId: 'char-nox',
    curioId: 'curio-lamplighters-wick',
    chapters: [
      {
        lines: [
          'Evening, little one. Old Nox, lamplighter of Emberglow these three hundred twilights.',
          'My glow is fading, you see. I need an apprentice. Will you walk the lantern rounds with me?',
        ],
        task: {
          kind: 'stat',
          stat: 'plantsHarvested',
          amount: 25,
          label: 'Walk the rounds: gather 25 plants anywhere',
        },
      },
      {
        lines: ['Lanterns burn best on jasmine. Its scent keeps the dark polite.'],
        task: {
          kind: 'bring',
          items: [{ itemId: 'raw-jasmine-blossoms', amount: 8 }],
          label: 'Bring Old Nox 8 Jasmine blossoms',
        },
      },
      {
        lines: [
          'And a little moonpetal oil, for the wicks. A lamplighter is only as good as his wicks.',
        ],
        task: {
          kind: 'bring',
          items: [{ itemId: 'refined-moonpetal-oil', amount: 2 }],
          label: 'Bring Old Nox 2 Moonpetal Oil',
        },
      },
      {
        lines: [
          'Now, an apprentice must be known in the village. Help a few folk, and they’ll trust you.',
        ],
        task: {
          kind: 'stat',
          stat: 'villagersHelped',
          amount: 3,
          label: 'Help 3 villagers anywhere',
        },
      },
    ],
    ending: [
      'There. Emberglow knows your name now. Pipwick will take the rounds, and you showed her how.',
      'Take my old wick. It burns slow and steady, like any good magic should.',
    ],
  },
  'story-vesper': {
    id: 'story-vesper',
    characterId: 'char-vesper',
    curioId: 'curio-moth-wing-quill',
    chapters: [
      {
        lines: [
          'Oh! A visitor. I am Vesper. I write poems. Mostly about moonlight. Mostly sad ones.',
          'The moth swarm crowds the glowing flowers and nobody else gets a turn. I want to write them a poem to share. I need inspiration.',
        ],
        task: {
          kind: 'bring',
          items: [{ itemId: 'raw-moonpetals', amount: 8 }],
          label: 'Bring Vesper 8 Moonpetals for inspiration',
        },
      },
      {
        lines: ['They will not listen while they are crowding. Gently move them along, would you?'],
        task: {
          kind: 'stat',
          stat: 'creaturesShooed',
          amount: 2,
          label: 'Send away 2 big troubles (the moth swarm counts)',
        },
      },
      {
        lines: [
          'Moths adore moon draught. A sip, and they might sit still long enough to hear me.',
        ],
        task: {
          kind: 'bring',
          items: [{ itemId: 'component-moon-draught', amount: 1 }],
          label: 'Bring Vesper 1 Moon Draught',
        },
      },
      {
        lines: [
          'One last thing: a midnight rose, for the final verse. It has to be a midnight rose.',
        ],
        task: {
          kind: 'bring',
          items: [{ itemId: 'raw-midnight-petals', amount: 2 }],
          label: 'Bring Vesper 2 Midnight petals',
        },
      },
    ],
    ending: [
      'They listened! The whole swarm, wings folded, and then they… shared. They actually shared.',
      'Take my quill. It has written its best poem. The swarm will be gentler now, I promise.',
    ],
  },
  'story-cumulus': {
    id: 'story-cumulus',
    characterId: 'char-cumulus',
    curioId: 'curio-star-chart',
    chapters: [
      {
        lines: [
          'Ah! A visitor! Or a very large moth. No, a fairy. Professor Cumulus, astronomer.',
          'My star maps have blown away again. All of them. Could you gather while you look? Gathering helps one notice things.',
        ],
        task: {
          kind: 'stat',
          stat: 'plantsHarvested',
          amount: 30,
          label: 'Gather 30 plants anywhere, keeping an eye out for star maps',
        },
      },
      {
        lines: [
          'Splendid! Now I need ink that won’t fade. Aurora dye, I think. It shifts like the sky.',
        ],
        task: {
          kind: 'bring',
          items: [{ itemId: 'refined-aurora-dye', amount: 1 }],
          label: 'Bring Professor Cumulus 1 Aurora Dye',
        },
      },
      {
        lines: ['And a lens to see the faint stars. A Starlight Lens, if you can manage it.'],
        task: {
          kind: 'bring',
          items: [{ itemId: 'component-starlight-lens', amount: 1 }],
          label: 'Bring Professor Cumulus 1 Starlight Lens',
        },
      },
      {
        lines: [
          'Last of all: weights! Something to hold the maps down. Brass gears would do nicely.',
        ],
        task: {
          kind: 'bring',
          items: [{ itemId: 'trinket-brass-gear', amount: 2 }],
          label: 'Bring Professor Cumulus 2 Brass gears',
        },
      },
    ],
    ending: [
      'Every star in its place, and every map weighed down! Look how the land below shines in the charts.',
      'Take this chart. When you sing the Root Song, it will help the land remember even more.',
    ],
  },
  'story-twill': {
    id: 'story-twill',
    characterId: 'char-twill',
    curioId: 'curio-windwoven-shawl',
    chapters: [
      {
        lines: [
          'Hi! I’m Twill! I’m weaving a sail big enough to catch the highest wind there is!',
          'It needs so much cloud fluff. So, so much. Could you bring some?',
        ],
        task: {
          kind: 'bring',
          items: [{ itemId: 'raw-cloud-fluff', amount: 12 }],
          label: 'Bring Twill 12 Cloud fluff',
        },
      },
      {
        lines: ['Thistledown makes the edges strong. Wind thistles grow on the cliffs.'],
        task: {
          kind: 'bring',
          items: [{ itemId: 'raw-thistledown', amount: 8 }],
          label: 'Bring Twill 8 Thistledown',
        },
      },
      {
        lines: ['Now the hard part: a thread of wind silk to stitch it all together.'],
        task: {
          kind: 'bring',
          items: [{ itemId: 'component-wind-silk', amount: 1 }],
          label: 'Bring Twill 1 Wind Silk',
        },
      },
      {
        lines: [
          'It’s ready! But the hawk keeps diving at it. Could you chase off something big while I launch?',
        ],
        task: {
          kind: 'stat',
          stat: 'creaturesShooed',
          amount: 2,
          label: 'Send away 2 big troubles (calming the hawk counts)',
        },
      },
    ],
    ending: [
      'IT FLIES! It caught the highest wind and I went all the way round the Sun Spire!',
      'I made you a shawl from the leftover silk. The wind will carry you a little faster now.',
    ],
  },
}
