import type { CostEntry } from './types'

/** What a spirit asks for before it awakens (design doc 3.12, content doc → Relics). */
export type SpiritRequirement =
  | { kind: 'bloom'; level: number; label: string }
  | { kind: 'story'; storyId: string; label: string }
  | { kind: 'offering'; items: CostEntry[]; label: string }

export interface SpiritDef {
  id: string
  name: string
  regionId: string
  place: string
  /** Said while the spirit still sleeps. */
  sleeping: string[]
  /** Said when the spirit awakens. */
  awakening: string[]
  /** This run's requirements. Later runs ask for more (added with prestige). */
  requirements: SpiritRequirement[]
}

export const SPIRITS: Readonly<Record<string, SpiritDef>> = {
  'spirit-sorrel': {
    id: 'spirit-sorrel',
    name: "Sorrel, the Meadow's Breath",
    regionId: 'meadow',
    place: 'sunstone-hill',
    sleeping: [
      'A swirl of grass seed and sunlight drifts lazily over the warm stone.',
      '"Mmm... little fairy... the Meadow is still so tired... help it wake, and so will I..."',
    ],
    awakening: [
      'The swirl brightens and spins, scattering golden seeds across the hill.',
      '"Ahh. I can feel the Meadow breathing again. Thank you, little one. I will remember this."',
    ],
    requirements: [
      { kind: 'bloom', level: 2, label: 'Help the Meadow reach Sprouting bloom' },
      { kind: 'story', storyId: 'story-pip', label: "Finish Pip Thistledown's story" },
      {
        kind: 'offering',
        items: [{ itemId: 'component-sun-salve', amount: 3 }],
        label: 'Offer 3 Sun Salve',
      },
    ],
  },
  'spirit-bramblebeard': {
    id: 'spirit-bramblebeard',
    name: 'Bramblebeard, the Old Wood',
    regionId: 'forest',
    place: 'elder-oak',
    sleeping: [
      'Deep in the bark, two knots open very slowly. They might be eyes.',
      '"Hmmmm... small... one... The forest... is... sleeping... still... Wake... it... and... then..."',
      'The eyes close again. That was clearly a lot of talking.',
    ],
    awakening: [
      'Moss ripples down the oak like a beard being stroked. Every leaf in the canopy rustles at once.',
      '"Ahhhh... I hear... the roots... singing... Thank... you... little... gardener."',
    ],
    requirements: [
      { kind: 'bloom', level: 2, label: 'Help the Forest reach Sprouting bloom' },
      { kind: 'story', storyId: 'story-hazel', label: "Finish Hazel Quickpaw's story" },
      {
        kind: 'offering',
        items: [
          { itemId: 'component-earth-loam', amount: 3 },
          { itemId: 'refined-golden-spore', amount: 1 },
        ],
        label: 'Offer 3 Earth Loam and 1 Golden Spore',
      },
    ],
  },
  'spirit-mirebelle': {
    id: 'spirit-mirebelle',
    name: 'Mirebelle, the Still Water',
    regionId: 'swamp',
    place: 'sunken-willow',
    sleeping: [
      'Rings of ripples spread across the pool, though nothing touched the water.',
      '"What sleeps in the reeds but never dreams? ...The Swamp, little one. Wake it, and ask me again."',
    ],
    awakening: [
      'The ripples rise into a lady of rings and water, wearing a crown of lilies.',
      '"What is still, yet always moving? A swamp that is loved. Thank you, little gardener."',
    ],
    requirements: [
      { kind: 'bloom', level: 2, label: 'Help the Swamp reach Sprouting bloom' },
      { kind: 'story', storyId: 'story-gubbins', label: "Finish Mayor Gubbins's story" },
      {
        kind: 'offering',
        items: [
          { itemId: 'component-lily-balm', amount: 3 },
          { itemId: 'refined-orchid-essence', amount: 1 },
        ],
        label: 'Offer 3 Lily Balm and 1 Orchid Essence',
      },
    ],
  },
  'spirit-pome': {
    id: 'spirit-pome',
    name: 'Grandmother Pome',
    regionId: 'orchard',
    place: 'grafted-tree',
    sleeping: [
      'The grafted tree rustles, and a smell of baked apples drifts by.',
      '"Mm? Oh, dearie, I\'m still so drowsy. The Orchard needs tending before an old tree can wake."',
    ],
    awakening: [
      'Every branch bursts into blossom at once: apple, cherry, pear and quince.',
      '"There now, dearie. Look at it all, humming again. Come sit, there\'s always pie for you."',
    ],
    requirements: [
      { kind: 'bloom', level: 2, label: 'Help the Orchard reach Sprouting bloom' },
      { kind: 'story', storyId: 'story-waxwick', label: "Finish Waxwick's story" },
      {
        kind: 'offering',
        items: [
          { itemId: 'component-beeswax-candle', amount: 3 },
          { itemId: 'refined-pollen-gold', amount: 1 },
        ],
        label: 'Offer 3 Beeswax Candles and 1 Pollen Gold',
      },
    ],
  },
  'spirit-quartz': {
    id: 'spirit-quartz',
    name: 'Old Quartz, the Deep Echo',
    regionId: 'caves',
    place: 'echo-pool',
    sleeping: [
      'Crystals glint under the still water. Your footsteps come back to you. ...you. ...you.',
      '"Light... light... The deep is dim, small one. Bring the Caves to life. ...life. ...life."',
    ],
    awakening: [
      'Every crystal in the cavern rings at once, a chord that echoes and echoes.',
      '"Awake. Awake. ...Thank you. ...Thank you. ...you."',
    ],
    requirements: [
      { kind: 'bloom', level: 2, label: 'Help the Caves reach Sprouting bloom' },
      { kind: 'story', storyId: 'story-digby', label: "Finish Digby Loamsworth's story" },
      {
        kind: 'offering',
        items: [
          { itemId: 'component-glow-ink', amount: 3 },
          { itemId: 'component-crystal-focus', amount: 1 },
        ],
        label: 'Offer 3 Glow Ink and 1 Crystal Focus',
      },
    ],
  },
}
