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
}
