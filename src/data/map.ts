/**
 * The world map: each region is an island in a chain (the order regions are crossed in), and
 * each place sits at a spot on its island. Positions are percentages of the island (x from the
 * left, y from the top). Starting layout; art may replace the islands later.
 */

export interface IslandDef {
  /** Island fill and outline. */
  color: string
  edge: string
  /** Where each place sits on the island. */
  places: Record<string, { x: number; y: number }>
}

export const MAP_ISLANDS: Readonly<Record<string, IslandDef>> = {
  meadow: {
    color: '#cfeab8',
    edge: '#8cc97a',
    places: {
      home: { x: 22, y: 64 },
      thimblewick: { x: 44, y: 42 },
      'buttercup-rise': { x: 62, y: 66 },
      'dandelion-drift': { x: 80, y: 46 },
      'sunstone-hill': { x: 22, y: 36 },
      'fairy-ring': { x: 82, y: 78 },
    },
  },
  forest: {
    color: '#9fc48a',
    edge: '#5e8a4a',
    places: {
      acornhollow: { x: 26, y: 52 },
      'fernshade-floor': { x: 54, y: 72 },
      'mossy-stump-ring': { x: 76, y: 48 },
      'elder-oak': { x: 50, y: 34 },
      'hollow-log-library': { x: 20, y: 78 },
      'lost-grove': { x: 84, y: 74 },
    },
  },
  swamp: {
    color: '#a9cfc3',
    edge: '#5e9a8e',
    places: {
      'toad-village': { x: 28, y: 50 },
      'reeds-hollow': { x: 22, y: 76 },
      'lilypad-pools': { x: 64, y: 70 },
      'sunken-willow': { x: 58, y: 34 },
      'wisp-hollow': { x: 84, y: 52 },
    },
  },
}
