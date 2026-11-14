/**
 * Hand-placed layouts for harvesting spots (the gathering screen is a living scene, design doc
 * 7.4). Positions are percentages of the scene: x from the left, y where the plant stands.
 */

export interface Point {
  x: number
  y: number
}

export interface SceneLayout {
  /** Where each plant slot grows, in slot order. */
  slots: Point[]
  /** Where a visiting creature sits. */
  creature: Point
  /** Where a pirate camp pitches its tent (over the last few slots). */
  camp: Point
  /** Where a wild mount hovers. */
  mount: Point
}

export const SCENES: Readonly<Record<string, SceneLayout>> = {
  'buttercup-rise': {
    slots: [
      { x: 13, y: 74 },
      { x: 30, y: 62 },
      { x: 46, y: 80 },
      { x: 62, y: 60 },
      { x: 77, y: 76 },
      { x: 89, y: 56 },
    ],
    creature: { x: 26, y: 92 },
    camp: { x: 76, y: 62 },
    mount: { x: 50, y: 30 },
  },
  'dandelion-drift': {
    slots: [
      { x: 12, y: 64 },
      { x: 28, y: 80 },
      { x: 43, y: 62 },
      { x: 60, y: 80 },
      { x: 75, y: 63 },
      { x: 89, y: 80 },
    ],
    creature: { x: 50, y: 94 },
    camp: { x: 76, y: 70 },
    mount: { x: 50, y: 28 },
  },
  'fairy-ring': {
    slots: [
      { x: 50, y: 46 },
      { x: 70, y: 56 },
      { x: 68, y: 80 },
      { x: 50, y: 90 },
      { x: 32, y: 80 },
      { x: 30, y: 56 },
    ],
    creature: { x: 88, y: 88 },
    camp: { x: 34, y: 76 },
    mount: { x: 84, y: 30 },
  },

  // Forest
  'fernshade-floor': {
    slots: [
      { x: 14, y: 70 },
      { x: 30, y: 86 },
      { x: 46, y: 66 },
      { x: 60, y: 88 },
      { x: 74, y: 68 },
      { x: 88, y: 86 },
    ],
    creature: { x: 88, y: 40 },
    camp: { x: 74, y: 76 },
    mount: { x: 52, y: 28 },
  },
  'mossy-stump-ring': {
    slots: [
      { x: 22, y: 64 },
      { x: 36, y: 84 },
      { x: 50, y: 62 },
      { x: 64, y: 86 },
      { x: 78, y: 64 },
      { x: 90, y: 84 },
    ],
    creature: { x: 12, y: 40 },
    camp: { x: 76, y: 72 },
    mount: { x: 50, y: 30 },
  },
  'hollow-log-library': {
    slots: [
      { x: 14, y: 76 },
      { x: 30, y: 90 },
      { x: 46, y: 74 },
      { x: 62, y: 90 },
      { x: 76, y: 74 },
      { x: 90, y: 90 },
    ],
    creature: { x: 88, y: 52 },
    camp: { x: 74, y: 80 },
    mount: { x: 50, y: 40 },
  },
  'lost-grove': {
    slots: [
      { x: 18, y: 72 },
      { x: 34, y: 88 },
      { x: 50, y: 70 },
      { x: 66, y: 88 },
      { x: 82, y: 72 },
      { x: 92, y: 90 },
    ],
    creature: { x: 10, y: 44 },
    camp: { x: 74, y: 78 },
    mount: { x: 50, y: 30 },
  },

  // Swamp
  'reeds-hollow': {
    slots: [
      { x: 12, y: 66 },
      { x: 28, y: 84 },
      { x: 44, y: 64 },
      { x: 60, y: 86 },
      { x: 76, y: 66 },
      { x: 90, y: 84 },
    ],
    creature: { x: 88, y: 46 },
    camp: { x: 76, y: 74 },
    mount: { x: 50, y: 30 },
  },
  'lilypad-pools': {
    slots: [
      { x: 16, y: 72 },
      { x: 32, y: 88 },
      { x: 48, y: 70 },
      { x: 64, y: 90 },
      { x: 78, y: 72 },
      { x: 90, y: 90 },
    ],
    creature: { x: 88, y: 44 },
    camp: { x: 76, y: 80 },
    mount: { x: 40, y: 52 },
  },
  'wisp-hollow': {
    slots: [
      { x: 50, y: 62 },
      { x: 70, y: 70 },
      { x: 66, y: 88 },
      { x: 34, y: 88 },
      { x: 30, y: 70 },
      { x: 86, y: 86 },
    ],
    creature: { x: 12, y: 44 },
    camp: { x: 30, y: 80 },
    mount: { x: 84, y: 30 },
  },

  // Blossom Orchard
  'petalfall-rows': {
    slots: [
      { x: 14, y: 70 },
      { x: 30, y: 86 },
      { x: 46, y: 68 },
      { x: 62, y: 88 },
      { x: 78, y: 70 },
      { x: 90, y: 86 },
    ],
    creature: { x: 88, y: 50 },
    camp: { x: 76, y: 76 },
    mount: { x: 50, y: 30 },
  },
  'old-pear': {
    slots: [
      { x: 16, y: 78 },
      { x: 30, y: 90 },
      { x: 70, y: 90 },
      { x: 84, y: 78 },
      { x: 44, y: 88 },
      { x: 58, y: 80 },
    ],
    creature: { x: 28, y: 66 },
    camp: { x: 78, y: 80 },
    mount: { x: 70, y: 30 },
  },
  'royal-cell': {
    slots: [
      { x: 50, y: 62 },
      { x: 30, y: 74 },
      { x: 70, y: 74 },
      { x: 20, y: 90 },
      { x: 50, y: 90 },
      { x: 80, y: 90 },
    ],
    creature: { x: 88, y: 50 },
    camp: { x: 76, y: 80 },
    mount: { x: 50, y: 28 },
  },
  'badgers-tunnel': {
    slots: [
      { x: 16, y: 80 },
      { x: 32, y: 90 },
      { x: 48, y: 78 },
      { x: 64, y: 90 },
      { x: 80, y: 80 },
      { x: 92, y: 92 },
    ],
    creature: { x: 50, y: 52 },
    camp: { x: 76, y: 82 },
    mount: { x: 50, y: 34 },
  },

  // Caves
  'fungus-gallery': {
    slots: [
      { x: 14, y: 76 },
      { x: 30, y: 90 },
      { x: 46, y: 74 },
      { x: 62, y: 90 },
      { x: 78, y: 76 },
      { x: 90, y: 90 },
    ],
    creature: { x: 86, y: 52 },
    camp: { x: 76, y: 82 },
    mount: { x: 50, y: 36 },
  },
  'crystal-seam': {
    slots: [
      { x: 16, y: 72 },
      { x: 32, y: 88 },
      { x: 50, y: 70 },
      { x: 66, y: 88 },
      { x: 82, y: 72 },
      { x: 92, y: 90 },
    ],
    creature: { x: 50, y: 50 },
    camp: { x: 76, y: 80 },
    mount: { x: 30, y: 34 },
  },
  'sunken-geode': {
    slots: [
      { x: 50, y: 66 },
      { x: 30, y: 76 },
      { x: 70, y: 76 },
      { x: 20, y: 92 },
      { x: 50, y: 92 },
      { x: 80, y: 92 },
    ],
    creature: { x: 86, y: 52 },
    camp: { x: 76, y: 82 },
    mount: { x: 50, y: 34 },
  },
  'surface-lift': {
    slots: [
      { x: 40, y: 72 },
      { x: 60, y: 72 },
      { x: 28, y: 88 },
      { x: 50, y: 92 },
      { x: 72, y: 88 },
      { x: 88, y: 76 },
    ],
    creature: { x: 12, y: 56 },
    camp: { x: 80, y: 80 },
    mount: { x: 80, y: 34 },
  },
}

/** A plain layout for any spot without a hand-placed one. */
export const DEFAULT_SCENE: SceneLayout = SCENES['buttercup-rise']
