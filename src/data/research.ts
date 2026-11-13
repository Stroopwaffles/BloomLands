import type { ResearchBranch, ResearchDef } from './types'

export const BRANCHES: readonly { id: ResearchBranch; name: string; note?: string }[] = [
  { id: 'refining', name: 'Refining' },
  { id: 'brewing', name: 'Brewing' },
  { id: 'spellcraft', name: 'Spellcraft' },
  { id: 'rites', name: 'Rites', note: 'Rituals are performed at the Ritual Circle.' },
]

const SEC = 1000
const MIN = 60 * SEC

/**
 * The Meadow's research tree. Early research costs raw materials so the tree can start;
 * later research costs refined materials and components. Values are starting points.
 */
const RESEARCH_LIST: ResearchDef[] = [
  // Refining
  {
    id: 'research-grinding',
    name: 'Grinding',
    branch: 'refining',
    description: 'Grind petals into paste at the mortar.',
    cost: [{ tag: 'petals', amount: 6 }],
    durationMs: 30 * SEC,
    requires: [],
    unlocks: ['refined-petal-paste'],
  },
  {
    id: 'research-drying',
    name: 'Drying',
    branch: 'refining',
    description: 'Dry leaves into tea on the drying rack.',
    cost: [{ tag: 'leaves', amount: 6 }],
    durationMs: 30 * SEC,
    requires: [],
    unlocks: ['refined-leaf-tea'],
  },
  {
    id: 'research-pressing',
    name: 'Pressing',
    branch: 'refining',
    description: 'Press berries into juice and dewdrops into dew water.',
    cost: [
      { tag: 'fruit', amount: 3 },
      { itemId: 'raw-dewdrops', amount: 2 },
    ],
    durationMs: 1 * MIN,
    requires: ['research-grinding'],
    unlocks: ['refined-berry-juice', 'refined-dew-water'],
  },
  {
    id: 'research-spinning',
    name: 'Spinning',
    branch: 'refining',
    description: 'Spin fluff into thread on the spinning wheel.',
    cost: [{ tag: 'fluff', amount: 6 }],
    durationMs: 45 * SEC,
    requires: ['research-drying'],
    unlocks: ['refined-fluff-thread'],
  },
  {
    id: 'research-lucky-drying',
    name: 'Drying Luck',
    branch: 'refining',
    description: 'Dry a lucky leaf into lucky essence.',
    cost: [
      { itemId: 'raw-lucky-leaf', amount: 1 },
      { itemId: 'refined-leaf-tea', amount: 2 },
    ],
    durationMs: 90 * SEC,
    requires: ['research-drying'],
    unlocks: ['refined-lucky-essence'],
  },

  // Brewing
  {
    id: 'research-salves',
    name: 'Salves',
    branch: 'brewing',
    description: 'Combine petal paste and dew water into Sun Salve.',
    cost: [
      { itemId: 'refined-petal-paste', amount: 2 },
      { itemId: 'refined-dew-water', amount: 1 },
    ],
    durationMs: 1 * MIN,
    requires: ['research-grinding', 'research-pressing'],
    unlocks: ['component-sun-salve'],
  },
  {
    id: 'research-teas',
    name: 'Calming Teas',
    branch: 'brewing',
    description: 'Steep leaf tea in dew water into Calming Tea.',
    cost: [
      { itemId: 'refined-leaf-tea', amount: 2 },
      { itemId: 'refined-dew-water', amount: 1 },
    ],
    durationMs: 1 * MIN,
    requires: ['research-drying', 'research-pressing'],
    unlocks: ['component-calming-tea'],
  },
  {
    id: 'research-twine',
    name: 'Twining',
    branch: 'brewing',
    description: 'Stiffen fluff thread with leaf tea into Thistle Twine.',
    cost: [
      { itemId: 'refined-fluff-thread', amount: 2 },
      { itemId: 'refined-leaf-tea', amount: 1 },
    ],
    durationMs: 1 * MIN,
    requires: ['research-spinning'],
    unlocks: ['component-thistle-twine'],
  },
  {
    id: 'research-baits',
    name: 'Sweet Baits',
    branch: 'brewing',
    description: 'Mix berry juice and petal paste into Sweet Bait.',
    cost: [{ itemId: 'refined-berry-juice', amount: 2 }],
    durationMs: 1 * MIN,
    requires: ['research-pressing'],
    unlocks: ['component-sweet-bait'],
  },
  {
    id: 'research-charms',
    name: 'Charm Dusts',
    branch: 'brewing',
    description: 'Blend lucky essence into Lucky Charm Dust.',
    cost: [{ itemId: 'refined-lucky-essence', amount: 1 }],
    durationMs: 90 * SEC,
    requires: ['research-lucky-drying', 'research-grinding'],
    unlocks: ['component-lucky-charm-dust'],
  },
  {
    id: 'research-smudges',
    name: 'Smudges',
    branch: 'brewing',
    description: 'Blend leaf tea and petal paste into a bitter Pest Smudge.',
    cost: [
      { itemId: 'refined-leaf-tea', amount: 2 },
      { itemId: 'refined-petal-paste', amount: 1 },
    ],
    durationMs: 1 * MIN,
    requires: ['research-drying', 'research-grinding'],
    unlocks: ['component-pest-smudge'],
  },
  {
    id: 'research-greenthumb',
    name: 'Greenthumb Brew',
    branch: 'brewing',
    description: 'A potion that makes every tap count for more.',
    cost: [{ itemId: 'component-sun-salve', amount: 2 }],
    durationMs: 2 * MIN,
    requires: ['research-salves'],
    unlocks: ['potion-greenthumb-brew'],
  },
  {
    id: 'research-quickwing',
    name: 'Quickwing Tonic',
    branch: 'brewing',
    description: 'A potion for faster flights.',
    cost: [
      { itemId: 'component-sun-salve', amount: 1 },
      { itemId: 'refined-fluff-thread', amount: 1 },
    ],
    durationMs: 2 * MIN,
    requires: ['research-salves', 'research-spinning'],
    unlocks: ['potion-quickwing-tonic'],
  },
  {
    id: 'research-deep-pockets',
    name: 'Deep Pockets Draught',
    branch: 'brewing',
    description: 'A potion that makes your satchel hold more.',
    cost: [
      { itemId: 'component-thistle-twine', amount: 1 },
      { itemId: 'refined-berry-juice', amount: 1 },
    ],
    durationMs: 2 * MIN,
    requires: ['research-twine', 'research-pressing'],
    unlocks: ['potion-deep-pockets-draught'],
  },
  {
    id: 'research-lucky-dew',
    name: 'Lucky Dew',
    branch: 'brewing',
    description: 'A potion that coaxes rarer plants to grow.',
    cost: [{ itemId: 'component-lucky-charm-dust', amount: 1 }],
    durationMs: 3 * MIN,
    requires: ['research-charms'],
    unlocks: ['potion-lucky-dew'],
  },
]

// Spellcraft
RESEARCH_LIST.push(
  {
    id: 'research-bugbane',
    name: 'Bugbane Whisper',
    branch: 'spellcraft',
    description: 'A whispered charm that shoos every pest from a spot.',
    cost: [{ itemId: 'component-pest-smudge', amount: 2 }],
    durationMs: 2 * MIN,
    requires: ['research-smudges'],
    unlocks: [],
    spells: ['spell-bugbane'],
  },
  {
    id: 'research-lullaby',
    name: 'Lullaby',
    branch: 'spellcraft',
    description: 'A soft song that calms large creatures.',
    cost: [{ itemId: 'component-calming-tea', amount: 2 }],
    durationMs: 2 * MIN,
    requires: ['research-teas'],
    unlocks: [],
    spells: ['spell-lullaby'],
  },
  {
    id: 'research-gust',
    name: 'Gust',
    branch: 'spellcraft',
    description: 'Call up a puff of wind to blow away ambushing pirates.',
    cost: [{ itemId: 'component-thistle-twine', amount: 2 }],
    durationMs: 2 * MIN,
    requires: ['research-twine'],
    unlocks: [],
    spells: ['spell-gust'],
  },
  {
    id: 'research-tanglevine',
    name: 'Tanglevine',
    branch: 'spellcraft',
    description: 'Gentle vines that persuade a pirate camp to move on.',
    cost: [
      { itemId: 'component-thistle-twine', amount: 1 },
      { itemId: 'component-sun-salve', amount: 1 },
    ],
    durationMs: 3 * MIN,
    requires: ['research-gust', 'research-salves'],
    unlocks: [],
    spells: ['spell-tanglevine'],
  },
)

RESEARCH_LIST.push({
  id: 'research-kindred-call',
  name: 'Kindred Call',
  branch: 'spellcraft',
  description: 'A warm call that invites a befriended creature to stay.',
  cost: [{ itemId: 'component-sweet-bait', amount: 2 }],
  durationMs: 3 * MIN,
  requires: ['research-baits', 'research-salves'],
  unlocks: [],
  spells: ['spell-kindred-call'],
})

// Rites
RESEARCH_LIST.push({
  id: 'research-turning',
  name: 'Rite of Turning',
  branch: 'rites',
  description: 'A short rite that turns the sky between day and night.',
  cost: [
    { itemId: 'component-sun-salve', amount: 1 },
    { itemId: 'component-calming-tea', amount: 1 },
  ],
  durationMs: 2 * MIN,
  requires: ['research-salves', 'research-teas'],
  unlocks: [],
  rituals: ['ritual-turning-day', 'ritual-turning-night'],
})

RESEARCH_LIST.push({
  id: 'research-rite-of-dawn',
  name: 'Rite of Dawn',
  branch: 'rites',
  description: 'An old rite whispered at sunrise. Something in the Meadow answers it.',
  cost: [
    { itemId: 'component-lucky-charm-dust', amount: 1 },
    { itemId: 'component-sun-salve', amount: 1 },
  ],
  durationMs: 3 * MIN,
  requires: ['research-turning', 'research-charms'],
  unlocks: [],
  rituals: ['ritual-dawn'],
})

export const RESEARCH: Readonly<Record<string, ResearchDef>> = Object.fromEntries(
  RESEARCH_LIST.map((node) => [node.id, node]),
)

export const RESEARCH_ORDER: readonly string[] = RESEARCH_LIST.map((node) => node.id)
