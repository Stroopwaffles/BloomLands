import type { CurioDef } from './bloom'
import type { UpgradeEffect } from './upgrades'

/**
 * Prestige (design doc 3.11, content doc → Relics and Root Song Upgrades). Performing the Root
 * Song Ritual gives the land Root Song and starts a new run. Root Song buys permanent upgrades;
 * spirits give one relic each per run. Both last forever.
 */

/** Everything a relic or Root Song upgrade can do, on top of what curios already do. */
export type BonusEffect =
  | CurioDef['effect']
  // Relics
  /** The region's bloom starts one level higher each run. */
  | { kind: 'headStart'; regionId: string }
  /** The creature is friendly: it never turns up to cause trouble. */
  | { kind: 'truce'; creatureId: string }
  /** The mount is tamed from the start of each run, once its region is open. */
  | { kind: 'kinship'; mountId: string }
  /** Morning dew grows at any time of day. */
  | { kind: 'dewAllDay' }
  /** This weather loses its downsides: rare plants stop hiding and helpers stop dawdling. */
  | { kind: 'clearWeather'; weather: string }
  /** Every morning the region has this weather. */
  | { kind: 'morningWeather'; regionId: string; weather: string }
  /** The region is always lit: no rite or light needed (the court rank still is). */
  | { kind: 'alwaysLit'; regionId: string }
  /** Plants need this many fewer taps (minimum 1). */
  | { kind: 'plantEase'; amount: number }
  /** Helpers bring back this much more from every trip. */
  | { kind: 'helperYield'; multiplier: number }
  /** Trader and villager requests stay this much longer. */
  | { kind: 'requestStay'; multiplier: number }
  /** Each finished refining or brewing job may come out double. */
  | { kind: 'craftEcho'; chance: number }
  /** Once a day, choose the Glade's moon phase (Moon-Phase Locket). */
  | { kind: 'moonChoice' }
  /** Storms never ground flights (Storm Bell). */
  | { kind: 'stormProof' }
  // Root Song upgrades
  | { kind: 'startGlimmers'; amount: number }
  | { kind: 'startBloom'; amount: number }
  | { kind: 'startHelpers'; amount: number }
  /** Start with every research of the first this-many regions already done. */
  | { kind: 'startResearch'; regions: number }
  /** Befriending mounts takes this many fewer feedings (minimum 1). */
  | { kind: 'befriendEase'; amount: number }
  /** Traders arrive this much sooner (0.8 = 20% sooner). */
  | { kind: 'traderVisits'; multiplier: number }
  /** Spirits ask for this many fewer of each offered item (minimum 1). */
  | { kind: 'spiritEase'; amount: number }
  | { kind: 'recruitCost'; multiplier: number }
  | { kind: 'lodgingCost'; multiplier: number }

export const PRESTIGE_RULES = {
  /** Moon Court (index into COURT_RANKS), with the Sky Isles reached: every run sees all seven regions. */
  requiredRank: 5,
  /** Root Song earned: one per this many bloom points, summed over every region. */
  bloomPerSong: 10,
  perRank: 3,
  perStory: 2,
  perSpirit: 5,
  perCrew: 3,
  /** The ending comes with the fifth prestige (milestone 17). */
  endingAfter: 5,
}

export interface RootUpgradeDef {
  id: string
  name: string
  /** What one tier does. */
  perTier: string
  /** Root Song for each tier, in order (its length is the number of tiers). */
  costs: number[]
  /** Only matters from the next run on (start-of-run gifts). */
  nextRun?: boolean
  /** Bonuses at a tier (1 and up). */
  bonus?: (tier: number) => BonusEffect[]
  /** Upgrade-style effects at a tier (click power, wings, satchel, station slots). */
  upgrade?: (tier: number) => UpgradeEffect[]
}

const repeat = <T>(tier: number, effect: T): T[] => Array.from({ length: tier }, () => effect)

export const ROOT_UPGRADE_LIST: RootUpgradeDef[] = [
  {
    id: 'root-deep-roots',
    name: 'Deep Roots',
    perTier: 'Every region starts each run with 5 more bloom.',
    costs: [10, 20, 35, 55, 80],
    nextRun: true,
    bonus: (t) => [{ kind: 'startBloom', amount: 5 * t }],
  },
  {
    id: 'root-glimmer-purse',
    name: 'Glimmer Purse',
    perTier: 'Start each run with 150 more Glimmers.',
    costs: [5, 10, 20, 35, 55],
    nextRun: true,
    bonus: (t) => [{ kind: 'startGlimmers', amount: 150 * t }],
  },
  {
    id: 'root-seasoned-hands',
    name: 'Seasoned Hands',
    perTier: '+1 click power.',
    costs: [20, 50, 100],
    upgrade: (t) => [{ kind: 'clickPower', amount: t }],
  },
  {
    id: 'root-swift-wings',
    name: 'Swift Wings',
    perTier: '+10% wing speed.',
    costs: [10, 20, 35, 55, 80],
    upgrade: (t) => [{ kind: 'wingSpeed', amount: 0.1 * t }],
  },
  {
    id: 'root-roomy-satchel',
    name: 'Roomy Satchel',
    perTier: 'Your satchel holds 5 more.',
    costs: [8, 16, 28, 45, 70],
    upgrade: (t) => [{ kind: 'satchel', amount: 5 * t }],
  },
  {
    id: 'root-old-friends',
    name: 'Old Friends',
    perTier: 'Start each run with one more gatherer already at home.',
    costs: [15, 35, 70],
    nextRun: true,
    bonus: (t) => [{ kind: 'startHelpers', amount: t }],
  },
  {
    id: 'root-kind-heart',
    name: 'Kind Heart',
    perTier: 'Befriending a mount takes one fewer feeding.',
    costs: [10, 25, 50],
    bonus: (t) => [{ kind: 'befriendEase', amount: t }],
  },
  {
    id: 'root-quick-study',
    name: 'Quick Study',
    perTier: 'Research is 10% faster.',
    costs: [10, 20, 35, 55, 80],
    bonus: (t) => [{ kind: 'researchSpeed', multiplier: 1 + 0.1 * t }],
  },
  {
    id: 'root-remembered-recipes',
    name: 'Remembered Recipes',
    perTier: "Start each run knowing one more region's research (Meadow first).",
    costs: [20, 45, 80, 130],
    nextRun: true,
    bonus: (t) => [{ kind: 'startResearch', regions: t }],
  },
  {
    id: 'root-second-cauldron',
    name: 'Second Cauldron',
    perTier: 'The cauldron brews one more batch at a time.',
    costs: [40],
    upgrade: (t) => repeat(t, { kind: 'stationSlot', station: 'cauldron' }),
  },
  {
    id: 'root-long-rest',
    name: 'Long Rest',
    perTier: 'Offline progress lasts an hour longer.',
    costs: [10, 20, 35, 55],
    bonus: (t) => [{ kind: 'offlineCap', ms: t * 60 * 60_000 }],
  },
  {
    id: 'root-traders-favor',
    name: "Trader's Favor",
    perTier: 'Traders visit 15% sooner.',
    costs: [10, 25, 45],
    bonus: (t) => [{ kind: 'traderVisits', multiplier: 1 - 0.15 * t }],
  },
  {
    id: 'root-spirits-ear',
    name: "Spirit's Ear",
    perTier: 'Spirits ask for one fewer of each offering (never less than 1).',
    costs: [15, 35, 60],
    bonus: (t) => [{ kind: 'spiritEase', amount: t }],
  },
  {
    id: 'root-warm-welcome',
    name: 'Warm Welcome',
    perTier: 'Recruiting helpers costs 10% less.',
    costs: [8, 18, 32],
    bonus: (t) => [{ kind: 'recruitCost', multiplier: 1 - 0.1 * t }],
  },
  {
    id: 'root-steady-hearth',
    name: 'Steady Hearth',
    perTier: 'Lodging costs 10% fewer Glimmers.',
    costs: [10, 22, 40],
    bonus: (t) => [{ kind: 'lodgingCost', multiplier: 1 - 0.1 * t }],
  },
]

export const ROOT_UPGRADES: Readonly<Record<string, RootUpgradeDef>> = Object.fromEntries(
  ROOT_UPGRADE_LIST.map((u) => [u.id, u]),
)

export interface RelicDef {
  id: string
  spiritId: string
  /** 1 to 5: the order the spirit gives them in, one per run. */
  index: number
  name: string
  description: string
  effects: BonusEffect[]
}

const relic = (
  spiritId: string,
  index: number,
  name: string,
  description: string,
  effects: BonusEffect[],
): RelicDef => ({
  id: `relic-${spiritId.replace('spirit-', '')}-${index}`,
  spiritId,
  index,
  name,
  description,
  effects,
})

export const RELIC_LIST: RelicDef[] = [
  // Sorrel, the Meadow's Breath
  relic('spirit-sorrel', 1, 'Seed of First Light', 'Meadow bloom starts one level higher.', [
    { kind: 'headStart', regionId: 'meadow' },
  ]),
  relic('spirit-sorrel', 2, 'Clover Ribbon', 'The rabbit is friendly and never munches spots.', [
    { kind: 'truce', creatureId: 'rabbit' },
  ]),
  relic(
    'spirit-sorrel',
    3,
    'Whistling Grass Blade',
    'The bumblebee is tamed from the start of each run.',
    [{ kind: 'kinship', mountId: 'mount-bumblebee' }],
  ),
  relic('spirit-sorrel', 4, 'Dew-Catcher Cup', 'Morning dew grows at any time of day.', [
    { kind: 'dewAllDay' },
  ]),
  relic(
    'spirit-sorrel',
    5,
    'Heart of the Meadow',
    'Every plant needs one fewer tap (never less than 1).',
    [{ kind: 'plantEase', amount: 1 }],
  ),
  // Bramblebeard, the Old Wood
  relic('spirit-bramblebeard', 1, 'Acorn of Patience', 'Forest bloom starts one level higher.', [
    { kind: 'headStart', regionId: 'forest' },
  ]),
  relic(
    'spirit-bramblebeard',
    2,
    'Owl-Feather Token',
    'The owl is friendly and never watches over spots.',
    [{ kind: 'truce', creatureId: 'owl' }],
  ),
  relic(
    'spirit-bramblebeard',
    3,
    'Hollow-Oak Key',
    'The flying squirrel is tamed from the start of each run.',
    [{ kind: 'kinship', mountId: 'mount-flying-squirrel' }],
  ),
  relic(
    'spirit-bramblebeard',
    4,
    "Mist-Walker's Moss",
    'Forest mist never hides rare plants or slows anyone down.',
    [{ kind: 'clearWeather', weather: 'mist' }],
  ),
  relic('spirit-bramblebeard', 5, 'Heartwood Crown', 'All research is 25% faster.', [
    { kind: 'researchSpeed', multiplier: 1.25 },
  ]),
  // Mirebelle, the Still Water
  relic('spirit-mirebelle', 1, 'Ripple Stone', 'Swamp bloom starts one level higher.', [
    { kind: 'headStart', regionId: 'swamp' },
  ]),
  relic('spirit-mirebelle', 2, "Heron's Plume", 'The heron is friendly and never blocks spots.', [
    { kind: 'truce', creatureId: 'heron' },
  ]),
  relic(
    'spirit-mirebelle',
    3,
    'Lily-Pad Whistle',
    'The frog is tamed from the start of each run.',
    [{ kind: 'kinship', mountId: 'mount-frog' }],
  ),
  relic(
    'spirit-mirebelle',
    4,
    'Riddle Shell',
    'Muggy heat no longer slows helpers, and fog no longer hides rare plants.',
    [
      { kind: 'clearWeather', weather: 'muggy' },
      { kind: 'clearWeather', weather: 'fog' },
    ],
  ),
  relic(
    'spirit-mirebelle',
    5,
    'Still-Water Pearl',
    'Helpers bring back 25% more from every trip.',
    [{ kind: 'helperYield', multiplier: 1.25 }],
  ),
  // Grandmother Pome
  relic('spirit-pome', 1, 'Grafted Twig', 'Orchard bloom starts one level higher.', [
    { kind: 'headStart', regionId: 'orchard' },
  ]),
  relic(
    'spirit-pome',
    2,
    "Badger's Biscuit Tin",
    'The grumpy badger is friendly and never digs up spots.',
    [{ kind: 'truce', creatureId: 'badger' }],
  ),
  relic(
    'spirit-pome',
    3,
    'Nectar Thimble',
    'The hummingbird is tamed from the start of each run.',
    [{ kind: 'kinship', mountId: 'mount-hummingbird' }],
  ),
  relic(
    'spirit-pome',
    4,
    'Blossom Fan',
    'A blossom wind blows through the Orchard every morning.',
    [{ kind: 'morningWeather', regionId: 'orchard', weather: 'blossom-wind' }],
  ),
  relic(
    'spirit-pome',
    5,
    'Golden Apple',
    'Trader requests pay 25% more, and all requests wait 50% longer.',
    [
      { kind: 'traderPay', multiplier: 1.25 },
      { kind: 'requestStay', multiplier: 1.5 },
    ],
  ),
  // Old Quartz, the Deep Echo
  relic('spirit-quartz', 1, 'Echoing Pebble', 'Caves bloom starts one level higher.', [
    { kind: 'headStart', regionId: 'caves' },
  ]),
  relic(
    'spirit-quartz',
    2,
    'Spool of Truce',
    'The spider is friendly and never spins blocking webs.',
    [{ kind: 'truce', creatureId: 'spider' }],
  ),
  relic('spirit-quartz', 3, 'Everglow Jar', 'The glowworm is tamed from the start of each run.', [
    { kind: 'kinship', mountId: 'mount-glowworm' },
  ]),
  relic(
    'spirit-quartz',
    4,
    'Ever-Lit Lantern',
    'The Caves are always lit: no Lantern Rite or Glowlight Potion needed.',
    [{ kind: 'alwaysLit', regionId: 'caves' }],
  ),
  relic(
    'spirit-quartz',
    5,
    'Echo Crystal',
    'Every refining or brewing job has a 20% chance to come out double.',
    [{ kind: 'craftEcho', chance: 0.2 }],
  ),
  // Selenne, the Quiet Moon
  relic('spirit-selenne', 1, 'Moonstone Bead', 'Glade bloom starts one level higher.', [
    { kind: 'headStart', regionId: 'glade' },
  ]),
  relic(
    'spirit-selenne',
    2,
    'Moth-Silk Ribbon',
    'The moth swarm is gentle and shares the glowing flowers.',
    [{ kind: 'truce', creatureId: 'moth-swarm' }],
  ),
  relic(
    'spirit-selenne',
    3,
    'Silver Cocoon',
    'The luna moth is tamed from the start of each run.',
    [{ kind: 'kinship', mountId: 'mount-luna-moth' }],
  ),
  relic(
    'spirit-selenne',
    4,
    'Moon-Phase Locket',
    "Once a day, choose the Glade's moon phase (at the Moon Pool).",
    [{ kind: 'moonChoice' }],
  ),
  relic('spirit-selenne', 5, 'Moonsilver Tear', 'All potions last 50% longer.', [
    { kind: 'potionDuration', multiplier: 1.5 },
  ]),
  // Aeris, the High Wind
  relic('spirit-aeris', 1, 'Cloud Wisp', 'Sky Isles bloom starts one level higher.', [
    { kind: 'headStart', regionId: 'sky' },
  ]),
  relic(
    'spirit-aeris',
    2,
    "Hawk's Truce Feather",
    'The hawk is friendly and never delays flights.',
    [{ kind: 'truce', creatureId: 'hawk' }],
  ),
  relic(
    'spirit-aeris',
    3,
    'Jay-Blue Feather',
    'The blue jay is tamed as soon as the Glade opens, so the Sky Isles open when your court rank allows.',
    [{ kind: 'kinship', mountId: 'mount-blue-jay' }],
  ),
  relic('spirit-aeris', 4, 'Storm Bell', 'Storms never ground flights to or from the Sky Isles.', [
    { kind: 'stormProof' },
  ]),
  relic('spirit-aeris', 5, 'Feather of the High Wind', 'All flights are 25% faster.', [
    { kind: 'travel', multiplier: 0.75 },
  ]),
]

export const RELICS: Readonly<Record<string, RelicDef>> = Object.fromEntries(
  RELIC_LIST.map((r) => [r.id, r]),
)

export const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V'] as const
