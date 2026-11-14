/**
 * Swamp art (content doc → Region 3: Swamp, and the Asset List). Same 100×100 storybook style as
 * the Meadow and Forest: rounded shapes, outlines in a darker shade of each fill, "sway" on moving
 * parts. Palette: teal, olive, lily-pad green, soft purple.
 */
import { ITEM_TEMPLATES } from './items'

const { shade, bottle, spool, petalPile, leafPile } = ITEM_TEMPLATES

const shadow = `<ellipse cx="50" cy="91" rx="26" ry="5" fill="#3e5a52" opacity="0.14"/>`
const ground = `<ellipse cx="50" cy="97" rx="18" ry="3" fill="#4f6b4a" opacity="0.25"/>`
/** A little patch of water for plants that grow in the pools. */
const pool = `<ellipse cx="50" cy="94" rx="34" ry="6" fill="#7fb8b0" stroke="#4f8a84" stroke-width="1.4" opacity="0.8"/><path d="M28 94 q6 -2 12 0 M60 95 q6 -2 12 0" stroke="#d6f0ea" stroke-width="1.2" fill="none"/>`

const ring = (count: number, draw: (angle: number, i: number) => string): string =>
  Array.from({ length: count }, (_, i) => draw((360 / count) * i, i)).join('')

/** A lily pad: a round leaf with a notch, seen from the side. */
const pad = (x: number, y: number, r: number, fill = '#6fae5f') =>
  `<path d="M${x} ${y} L${x + r} ${y - r * 0.12} A${r} ${r * 0.38} 0 1 1 ${x + r * 0.7} ${y + r * 0.27} Z" fill="${fill}" stroke="${shade(fill, 0.68)}" stroke-width="1.6"/>`

// ---------------------------------------------------------------------------------------------
// Plants (stand on a baseline near y = 96)

const duckweed =
  pool +
  `<g class="sway">` +
  [
    [30, 92, 3.4],
    [38, 95, 3],
    [44, 91, 3.6],
    [52, 94, 3.2],
    [60, 92, 3.6],
    [68, 95, 3],
    [36, 89, 2.6],
    [56, 89, 2.8],
    [64, 89, 2.4],
    [48, 96, 2.6],
  ]
    .map(
      ([x, y, r]) =>
        `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.6}" fill="#8fcf5f" stroke="#5e9a3a" stroke-width="1"/>`,
    )
    .join('') +
  `</g>`

const reedStalk = (x: number, h: number, lean: number) =>
  `<path d="M${x} 96 Q${x + lean / 2} ${96 - h / 2} ${x + lean} ${96 - h}" fill="none" stroke="#7a9a4a" stroke-width="3.2" stroke-linecap="round"/>` +
  `<path d="M${x + lean} ${96 - h} q2 -8 0 -14 q-3 6 0 14 Z" fill="#c9b07a" stroke="#9a8450" stroke-width="1"/>`
const reed =
  ground +
  `<g class="sway">${reedStalk(40, 62, -6)}${reedStalk(50, 74, 2)}${reedStalk(60, 58, 8)}` +
  `<path d="M46 96 Q30 70 22 60 Q36 74 50 92 Z" fill="#9cc46a" stroke="#6a8f3a" stroke-width="1.4"/>` +
  `<path d="M54 96 Q70 72 80 64 Q66 78 52 92 Z" fill="#9cc46a" stroke="#6a8f3a" stroke-width="1.4"/></g>`

const cattailHead = (x: number, y: number) =>
  `<rect x="${x - 4.5}" y="${y}" width="9" height="20" rx="4.5" fill="#8a5a34" stroke="#5e3a1e" stroke-width="1.6"/><path d="M${x} ${y} l0 -8" stroke="#7a9a4a" stroke-width="2" stroke-linecap="round"/>`
const cattail =
  ground +
  `<g class="sway"><path d="M42 96 Q40 70 40 44 M58 96 Q60 72 60 36" fill="none" stroke="#7a9a4a" stroke-width="3" stroke-linecap="round"/>` +
  cattailHead(40, 40) +
  cattailHead(60, 32) +
  `<path d="M50 96 Q34 72 28 56 Q42 72 52 92 Z" fill="#8fbf5a" stroke="#5e8a3a" stroke-width="1.4"/>` +
  `<path d="M50 96 Q68 70 76 58 Q62 76 48 92 Z" fill="#8fbf5a" stroke="#5e8a3a" stroke-width="1.4"/></g>`

const cupFlower = (x: number, y: number, fill: string, r = 9) =>
  `<g transform="translate(${x} ${y})">${ring(
    5,
    (a) =>
      `<ellipse transform="rotate(${a})" cx="0" cy="${-r * 0.6}" rx="${r * 0.48}" ry="${r * 0.7}" fill="${fill}" stroke="${shade(fill, 0.75)}" stroke-width="1.2"/>`,
  )}<circle r="${r * 0.32}" fill="#e2a83f"/></g>`
const marshMarigold =
  ground +
  `<path d="M50 96 Q46 76 38 62 M50 96 Q54 74 62 58" fill="none" stroke="#5e8a3a" stroke-width="2.4"/>` +
  [
    [32, 84, 12],
    [66, 82, 13],
    [50, 88, 11],
  ]
    .map(
      ([x, y, r]) =>
        `<circle cx="${x}" cy="${y}" r="${r}" fill="#5f9a4f" stroke="#3f6e34" stroke-width="1.6"/><path d="M${x} ${y} l0 ${-r + 2}" stroke="#3f6e34" stroke-width="1"/>`,
    )
    .join('') +
  `<g class="sway">${cupFlower(38, 58, '#ffd23f')}${cupFlower(62, 54, '#ffd23f', 10)}</g>`

const bogMyrtle =
  ground +
  `<path d="M50 96 L50 70 M50 80 L36 62 M50 76 L64 58 M50 70 L48 50" fill="none" stroke="#7a5a44" stroke-width="2.8" stroke-linecap="round"/>` +
  `<g class="sway">` +
  [
    [36, 60, -40],
    [30, 68, -70],
    [64, 56, 40],
    [70, 64, 70],
    [46, 48, -20],
    [54, 46, 20],
    [42, 72, -60],
    [58, 70, 60],
  ]
    .map(
      ([x, y, a]) =>
        `<path transform="translate(${x} ${y}) rotate(${a})" d="M0 0 C3 -4 3 -12 0 -15 C-3 -12 -3 -4 0 0 Z" fill="#9cb08a" stroke="#6a7e5a" stroke-width="1.2"/>`,
    )
    .join('') +
  [
    [40, 54],
    [60, 50],
    [50, 42],
  ]
    .map(
      ([x, y]) =>
        `<rect x="${x - 2}" y="${y - 5}" width="4" height="10" rx="2" fill="#d97a3a" stroke="#a8542a" stroke-width="0.8"/>`,
    )
    .join('') +
  `</g>`

const lilyFlower = (x: number, y: number, fill: string, size = 1) =>
  `<g transform="translate(${x} ${y}) scale(${size})">` +
  [-60, -30, 30, 60]
    .map(
      (a) =>
        `<path transform="rotate(${a})" d="M0 0 C-5 -6 -4 -16 0 -20 C4 -16 5 -6 0 0 Z" fill="${fill}" stroke="${shade(fill, 0.72)}" stroke-width="1.2"/>`,
    )
    .join('') +
  `<path d="M0 0 C-5 -7 -4 -18 0 -22 C4 -18 5 -7 0 0 Z" fill="${fill}" stroke="${shade(fill, 0.72)}" stroke-width="1.2"/>` +
  `<circle cy="-4" r="3" fill="#ffd23f"/></g>`
const waterLily =
  pool +
  pad(28, 90, 16) +
  pad(58, 93, 18, '#7fbf6a') +
  `<g class="sway">${lilyFlower(48, 86, '#f7c6d4', 1.15)}</g>`

const bogOrchid =
  ground +
  `<path d="M38 96 Q30 86 26 76 Q38 84 44 96 Z M62 96 Q70 86 74 76 Q62 84 56 96 Z" fill="#6fae5f" stroke="#4f8a4a" stroke-width="1.4"/>` +
  `<g class="sway"><path d="M50 96 Q48 70 52 34" fill="none" stroke="#6a8f4a" stroke-width="2.4"/>` +
  [
    [46, 70, -1],
    [56, 56, 1],
    [48, 42, -1],
  ]
    .map(
      ([x, y, s]) =>
        `<g transform="translate(${x} ${y}) scale(${s} 1)"><path d="M0 0 C-8 -10 -14 -2 -8 2 Z" fill="#d79ae6" stroke="#9a5aae" stroke-width="1.1"/><path d="M0 0 C-2 -10 6 -12 6 -4 Z" fill="#e8b8f2" stroke="#9a5aae" stroke-width="1.1"/><path d="M0 0 C-6 4 -4 10 2 8 C6 6 4 2 0 0 Z" fill="#b86ad0" stroke="#7a3a96" stroke-width="1.1"/><circle cx="-1" cy="1" r="1.2" fill="#ffe59e"/></g>`,
    )
    .join('') +
  `</g>`

const wispLily =
  pool +
  `<circle cx="50" cy="66" r="26" fill="#bfe8ff" opacity="0.35" class="sway"/>` +
  pad(30, 92, 14, '#5f9e7a') +
  `<g class="sway">${lilyFlower(50, 86, '#d9f2ff', 1.25)}</g>` +
  `<g fill="#ffffff"><circle cx="34" cy="54" r="1.6"/><circle cx="66" cy="50" r="1.4"/><circle cx="58" cy="40" r="1.2"/></g>`

// ---------------------------------------------------------------------------------------------
// Raw materials, refined goods, components, potions, trinkets

const duckweedPile =
  shadow +
  Array.from({ length: 16 }, (_, i) => {
    const x = 32 + ((i * 37) % 36)
    const y = 60 + ((i * 23) % 24)
    return `<ellipse cx="${x}" cy="${y}" rx="5" ry="3.4" fill="${i % 3 ? '#8fcf5f' : '#7fbf4f'}" stroke="#5e9a3a" stroke-width="1.2"/>`
  }).join('')

const reedBundle =
  shadow +
  [36, 42, 48, 54, 60, 66]
    .map(
      (x, i) =>
        `<path d="M${x} 88 L${x + (i - 2.5) * 3} 26" stroke="#a8b86a" stroke-width="4.4" stroke-linecap="round"/><path d="M${x} 88 L${x + (i - 2.5) * 3} 26" stroke="#7a9a4a" stroke-width="1.2"/>`,
    )
    .join('') +
  `<path d="M34 62 Q50 68 68 62" fill="none" stroke="#c97a3a" stroke-width="4" stroke-linecap="round"/>`

const cattailFluff =
  shadow +
  [
    [38, 66, 13],
    [60, 64, 14],
    [50, 76, 13],
    [48, 54, 10],
  ]
    .map(
      ([x, y, r]) =>
        `<circle cx="${x}" cy="${y}" r="${r}" fill="#efe2c8" stroke="#c9b08a" stroke-width="1.6"/>`,
    )
    .join('') +
  `<g fill="none" stroke="#c9b08a" stroke-width="1" stroke-linecap="round"><path d="M34 60 q4 -3 8 0 M56 58 q4 -3 8 0 M46 74 q4 -3 8 0"/></g>`

const wispPetal =
  `<circle cx="50" cy="60" r="28" fill="#bfe8ff" opacity="0.4"/>` +
  shadow +
  `<path d="M50 84 C34 70 36 42 50 30 C64 42 66 70 50 84 Z" fill="#e6f6ff" stroke="#8ec4e6" stroke-width="2"/>` +
  `<path d="M50 80 L50 38" stroke="#b5dcf2" stroke-width="1.6"/>` +
  `<g fill="#ffffff"><circle cx="34" cy="38" r="1.8"/><circle cx="68" cy="44" r="1.4"/><circle cx="62" cy="26" r="1.2"/></g>`

const lilyBalm =
  shadow +
  `<ellipse cx="50" cy="70" rx="30" ry="16" fill="#9fd3c0" stroke="#5e9a86" stroke-width="2.4"/>` +
  `<path d="M20 70 L20 62 Q50 48 80 62 L80 70" fill="#b8e3d2" stroke="#5e9a86" stroke-width="2.4"/>` +
  `<ellipse cx="50" cy="62" rx="30" ry="12" fill="#d9f2e8" stroke="#5e9a86" stroke-width="2.4"/>` +
  lilyFlower(50, 66, '#f7c6d4', 0.7) +
  `<path d="M28 74 Q30 80 36 82" fill="none" stroke="white" stroke-width="2.4" stroke-linecap="round" opacity="0.6"/>`

const bottleCap =
  shadow +
  `<g transform="translate(50 62)">` +
  ring(
    16,
    (a) =>
      `<path transform="rotate(${a})" d="M-3 -24 L3 -24 L2 -20 L-2 -20 Z" fill="#c23a4c" stroke="#8f2636" stroke-width="1"/>`,
  ) +
  `<circle r="21" fill="#e0485a" stroke="#8f2636" stroke-width="2.2"/><circle r="14" fill="none" stroke="#ffd94f" stroke-width="2"/>` +
  `<path d="M-6 -2 L6 -2 M-4 4 L4 4" stroke="#ffd94f" stroke-width="2" stroke-linecap="round"/></g>`

const fishingFly =
  shadow +
  `<path d="M50 30 L50 70 Q50 84 62 82 Q70 80 68 72" fill="none" stroke="#9c958a" stroke-width="3" stroke-linecap="round"/>` +
  `<path d="M68 72 l4 2 -5 2" fill="none" stroke="#9c958a" stroke-width="2"/>` +
  `<g transform="translate(50 40)"><path d="M0 0 C-14 -6 -20 4 -18 12 C-10 8 -4 6 0 0 Z" fill="#e2a83f" stroke="#a8742a" stroke-width="1.4"/><path d="M0 0 C14 -6 20 4 18 12 C10 8 4 6 0 0 Z" fill="#4a8ac2" stroke="#2e5e8a" stroke-width="1.4"/><ellipse cx="0" cy="6" rx="4" ry="9" fill="#5e3a1e" stroke="#3e2410" stroke-width="1.4"/><circle cy="-6" r="4" fill="#c23a4c"/></g>`

const tinyBell =
  shadow +
  `<path d="M50 20 Q56 20 56 26" fill="none" stroke="#c97a3a" stroke-width="2.4"/>` +
  `<path d="M30 74 Q30 36 50 30 Q70 36 70 74 Q50 80 30 74 Z" fill="#f2c94f" stroke="#a87e1a" stroke-width="2.4"/>` +
  `<path d="M26 74 Q50 84 74 74" fill="none" stroke="#a87e1a" stroke-width="3" stroke-linecap="round"/>` +
  `<circle cx="50" cy="82" r="5" fill="#e2a83f" stroke="#a87e1a" stroke-width="1.6"/>` +
  `<path d="M38 64 Q38 46 46 40" fill="none" stroke="#fff3b0" stroke-width="2.6" stroke-linecap="round" opacity="0.8"/>`

export const SWAMP_PLANT_ART: Record<string, string> = {
  'plant-duckweed': duckweed,
  'plant-reed': reed,
  'plant-cattail': cattail,
  'plant-marsh-marigold': marshMarigold,
  'plant-bog-myrtle': bogMyrtle,
  'plant-water-lily': waterLily,
  'plant-bog-orchid': bogOrchid,
  'plant-wisp-lily': wispLily,
}

export const SWAMP_ITEM_ART: Record<string, string> = {
  'raw-duckweed': duckweedPile,
  'raw-reed-stalks': reedBundle,
  'raw-cattail-fluff': cattailFluff,
  'raw-marigold-petals': petalPile('#ffd23f'),
  'raw-myrtle-leaves': leafPile('#9cb08a'),
  'raw-lily-petals': petalPile('#f7c6d4', false),
  'raw-orchid-petals': petalPile('#d79ae6', false),
  'raw-wisp-lily': wispPetal,

  'refined-reed-fiber': spool('#c9c07a'),
  'refined-lily-oil': bottle('#f2d07a', 'drop'),
  'refined-orchid-essence': bottle('#c58ad9', 'star', 'flask'),

  'component-lily-balm': lilyBalm,
  'potion-waterstride-philter': bottle('#5fb3c9', 'wing', 'tall'),

  'trinket-bottle-cap': bottleCap,
  'trinket-fishing-fly': fishingFly,
  'trinket-tiny-bell': tinyBell,
}

// ---------------------------------------------------------------------------------------------
// Toad Village folk

interface FolkLook {
  skin: string
  wear?: string
  top?: string
  front?: string
}

/** A toad: wide and round, big eyes on top of the head, a big friendly mouth. */
const toad = ({ skin, wear = '', top = '', front = '' }: FolkLook) => {
  const line = shade(skin, 0.66)
  return (
    shadow +
    `<ellipse cx="30" cy="88" rx="10" ry="5" fill="${skin}" stroke="${line}" stroke-width="1.8"/><ellipse cx="70" cy="88" rx="10" ry="5" fill="${skin}" stroke="${line}" stroke-width="1.8"/>` +
    `<path d="M18 80 C14 56 30 40 50 40 C70 40 86 56 82 80 Q50 92 18 80 Z" fill="${skin}" stroke="${line}" stroke-width="2.2"/>` +
    `<path d="M30 80 Q50 88 70 80 Q66 62 50 62 Q34 62 30 80 Z" fill="#f3ead0" opacity="0.8"/>` +
    [
      [30, 58],
      [70, 60],
      [40, 50],
      [62, 50],
    ]
      .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2" fill="${line}" opacity="0.35"/>`)
      .join('') +
    wear +
    `<circle cx="36" cy="38" r="10" fill="${skin}" stroke="${line}" stroke-width="2"/><circle cx="64" cy="38" r="10" fill="${skin}" stroke="${line}" stroke-width="2"/>` +
    `<circle cx="36" cy="38" r="6" fill="#fff8e0"/><circle cx="64" cy="38" r="6" fill="#fff8e0"/>` +
    `<circle cx="37" cy="39" r="3.4" fill="#2e2420"/><circle cx="65" cy="39" r="3.4" fill="#2e2420"/>` +
    `<circle cx="38" cy="37.6" r="1.2" fill="white"/><circle cx="66" cy="37.6" r="1.2" fill="white"/>` +
    `<path d="M32 56 Q50 66 68 56" fill="none" stroke="${line}" stroke-width="2.2" stroke-linecap="round"/>` +
    `<circle cx="28" cy="54" r="3" fill="#f7a6b8" opacity="0.5"/><circle cx="72" cy="54" r="3" fill="#f7a6b8" opacity="0.5"/>` +
    top +
    front
  )
}

/** A newt: slim and upright, with a curly tail and spots. */
const newt = ({ skin, wear = '', top = '', front = '' }: FolkLook) => {
  const line = shade(skin, 0.66)
  return (
    shadow +
    `<path d="M60 84 C80 86 88 74 82 66 C78 62 74 66 78 70" fill="none" stroke="${skin}" stroke-width="7" stroke-linecap="round"/>` +
    `<path d="M60 84 C80 86 88 74 82 66" fill="none" stroke="${line}" stroke-width="1.4"/>` +
    `<ellipse cx="50" cy="72" rx="14" ry="19" fill="${skin}" stroke="${line}" stroke-width="2"/>` +
    `<ellipse cx="50" cy="76" rx="8" ry="12" fill="#ffd27a" opacity="0.85"/>` +
    wear +
    `<ellipse cx="42" cy="91" rx="6" ry="3" fill="${skin}" stroke="${line}" stroke-width="1.6"/><ellipse cx="58" cy="91" rx="6" ry="3" fill="${skin}" stroke="${line}" stroke-width="1.6"/>` +
    `<ellipse cx="50" cy="44" rx="17" ry="14" fill="${skin}" stroke="${line}" stroke-width="2"/>` +
    `<circle cx="42" cy="40" r="4.4" fill="#2e2420"/><circle cx="58" cy="40" r="4.4" fill="#2e2420"/>` +
    `<circle cx="43.4" cy="38.6" r="1.4" fill="white"/><circle cx="59.4" cy="38.6" r="1.4" fill="white"/>` +
    `<path d="M44 50 Q50 54 56 50" fill="none" stroke="${line}" stroke-width="1.6" stroke-linecap="round"/>` +
    `<g fill="${line}" opacity="0.45"><circle cx="40" cy="66" r="1.8"/><circle cx="60" cy="70" r="1.6"/><circle cx="56" cy="60" r="1.4"/><circle cx="46" cy="32" r="1.4"/><circle cx="56" cy="31" r="1.2"/></g>` +
    top +
    front
  )
}

const topHat = `<g><rect x="38" y="10" width="24" height="20" rx="2" fill="#3d3550" stroke="#26203a" stroke-width="1.8"/><rect x="32" y="28" width="36" height="5" rx="2" fill="#3d3550" stroke="#26203a" stroke-width="1.6"/><rect x="38" y="22" width="24" height="4" fill="#c23a4c"/></g>`
const mayorChain = `<path d="M30 58 Q50 76 70 58" fill="none" stroke="#e2b94f" stroke-width="3" stroke-dasharray="3 2"/><circle cx="50" cy="70" r="6" fill="#f2c94f" stroke="#a87e1a" stroke-width="1.8"/><path d="M47 70 L53 70 M50 67 L50 73" stroke="#a87e1a" stroke-width="1.4"/>`
const nightcap = `<path d="M30 30 Q40 12 62 16 Q80 18 84 34 Q74 26 66 30 Q50 24 30 30 Z" fill="#9ab8d9" stroke="#6a88a9" stroke-width="1.6"/><circle cx="84" cy="36" r="4" fill="#ffffff" stroke="#c9ccd6" stroke-width="1"/>`
const reedShawl = `<path d="M24 66 Q50 52 76 66 L74 74 Q50 62 26 74 Z" fill="#d6c58a" stroke="#9a8a50" stroke-width="1.6"/><path d="M32 66 L34 72 M42 62 L43 68 M52 61 L52 67 M62 62 L61 68 M70 65 L68 71" stroke="#9a8a50" stroke-width="1"/>`
const lilyHat = `<path d="M30 30 Q50 20 70 30 Q50 34 30 30 Z" fill="#6fae5f" stroke="#4f8a4a" stroke-width="1.6"/><circle cx="58" cy="24" r="4" fill="#f7c6d4" stroke="#c97a8c" stroke-width="1"/>`
const reedPipe = `<g transform="translate(66 66) rotate(-30)">${[0, 5, 10, 15]
  .map(
    (x, i) =>
      `<rect x="${x - 2}" y="${-14 + i * 3}" width="4.4" height="${24 - i * 3}" rx="2" fill="#c9c07a" stroke="#8a8450" stroke-width="1.2"/>`,
  )
  .join('')}<path d="M-3 0 L19 0" stroke="#c97a3a" stroke-width="2"/></g>`
const musicNotes = `<g fill="#3d3550"><circle cx="78" cy="30" r="2.4"/><path d="M80.4 30 L80.4 20 L86 18" fill="none" stroke="#3d3550" stroke-width="1.4"/><circle cx="20" cy="40" r="2"/><path d="M22 40 L22 32" stroke="#3d3550" stroke-width="1.2"/></g>`

/** Puddle is a tadpole: a round head with a wiggly tail, hopping to help. */
const tadpole =
  shadow +
  `<path d="M58 70 C72 64 76 82 90 74" fill="none" stroke="#6f8f7a" stroke-width="9" stroke-linecap="round" class="sway"/>` +
  `<circle cx="44" cy="66" r="22" fill="#6f8f7a" stroke="#4a6655" stroke-width="2.2"/>` +
  `<ellipse cx="44" cy="74" rx="12" ry="9" fill="#cfe0c8" opacity="0.8"/>` +
  `<circle cx="36" cy="58" r="5" fill="#2e2420"/><circle cx="52" cy="58" r="5" fill="#2e2420"/><circle cx="37.4" cy="56.4" r="1.6" fill="white"/><circle cx="53.4" cy="56.4" r="1.6" fill="white"/>` +
  `<path d="M38 70 Q44 75 50 70" fill="none" stroke="#4a6655" stroke-width="1.8" stroke-linecap="round"/>`

export const SWAMP_PEOPLE_ART: Record<string, string> = {
  'char-gubbins': toad({ skin: '#8aa65a', top: topHat, wear: mayorChain }),
  'char-wren': newt({ skin: '#e2894a', front: reedPipe, top: musicNotes }),
  'villager-croaksworth': toad({ skin: '#7a9468', top: nightcap }),
  'villager-puddle': tadpole,
  'villager-lilywhite': toad({ skin: '#a3b878', wear: reedShawl, top: lilyHat }),
}

// ---------------------------------------------------------------------------------------------
// Spirit, creatures, pirates, mount

const mirebelle =
  `<ellipse cx="50" cy="90" rx="42" ry="8" fill="#7fb8b0" opacity="0.5"/>` +
  [40, 30, 20]
    .map(
      (rx, i) =>
        `<ellipse cx="50" cy="90" rx="${rx}" ry="${rx / 5}" fill="none" stroke="#d6f0ea" stroke-width="${1.4 + i * 0.4}" opacity="${0.5 + i * 0.15}"/>`,
    )
    .join('') +
  `<g class="sway"><path d="M30 90 C28 64 34 40 50 30 C66 40 72 64 70 90 Q50 96 30 90 Z" fill="#9fd3cc" stroke="#5e9a94" stroke-width="2" opacity="0.85"/>` +
  `<path d="M36 80 Q50 72 64 80 M38 66 Q50 58 62 66" fill="none" stroke="#e6f6f2" stroke-width="1.6" opacity="0.8"/>` +
  `<circle cx="50" cy="36" r="14" fill="#c8ece6" stroke="#5e9a94" stroke-width="2"/>` +
  `<path d="M44 37 Q46 35 48 37 M52 37 Q54 35 56 37" fill="none" stroke="#3e6e6a" stroke-width="1.8" stroke-linecap="round"/>` +
  `<path d="M47 43 Q50 45 53 43" fill="none" stroke="#3e6e6a" stroke-width="1.4" stroke-linecap="round"/>` +
  `<g transform="translate(50 22)">${[-14, -7, 0, 7, 14]
    .map(
      (x) =>
        `<g transform="translate(${x} ${Math.abs(x) * 0.25})"><path d="M0 0 C-3 -3 -2 -9 0 -10 C2 -9 3 -3 0 0 Z" fill="#f7c6d4" stroke="#c97a8c" stroke-width="0.8"/><circle cy="-1" r="1.2" fill="#ffd23f"/></g>`,
    )
    .join('')}</g></g>`

const heron =
  `<ellipse cx="50" cy="94" rx="30" ry="4" fill="#7fb8b0" opacity="0.6"/>` +
  `<path d="M44 94 L46 66 M56 94 L54 66" stroke="#c9a03a" stroke-width="2.4" stroke-linecap="round"/>` +
  `<path d="M28 60 C30 44 46 40 58 46 C68 50 70 62 62 68 Q46 74 28 60 Z" fill="#b9c2cc" stroke="#7a8696" stroke-width="2.2"/>` +
  `<path d="M30 60 Q22 64 18 72 Q30 68 38 64 Z" fill="#9aa4b0" stroke="#7a8696" stroke-width="1.6"/>` +
  `<path d="M40 54 Q48 50 56 54" fill="none" stroke="#9aa4b0" stroke-width="1.6"/>` +
  `<path d="M58 48 C64 38 58 30 60 20" fill="none" stroke="#dfe6ec" stroke-width="7" stroke-linecap="round"/>` +
  `<path d="M58 48 C64 38 58 30 60 20" fill="none" stroke="#7a8696" stroke-width="1.2"/>` +
  `<ellipse cx="62" cy="18" rx="7" ry="6" fill="#dfe6ec" stroke="#7a8696" stroke-width="1.8"/>` +
  `<path d="M57 14 Q50 12 46 16" fill="none" stroke="#3d3550" stroke-width="2.4" stroke-linecap="round"/>` +
  `<path d="M68 17 L86 21 L68 21 Z" fill="#e2a83f" stroke="#a8742a" stroke-width="1.2"/>` +
  `<circle cx="64" cy="17" r="1.8" fill="#ffd23f"/><circle cx="64.4" cy="17" r="0.9" fill="#2e2420"/>`

const slug =
  `<path d="M14 66 C14 50 30 44 46 46 C62 48 72 40 80 30 C88 32 90 44 84 54 C80 62 70 68 54 70 Q30 74 14 66 Z" fill="#c9a86a" stroke="#8a6e3a" stroke-width="3"/>` +
  `<path d="M24 62 Q40 58 56 60" fill="none" stroke="#e6cf9a" stroke-width="3" opacity="0.8" stroke-linecap="round"/>` +
  `<path d="M78 32 L74 14 M86 36 L90 18" stroke="#8a6e3a" stroke-width="2.6" stroke-linecap="round"/>` +
  `<circle cx="74" cy="13" r="3.6" fill="#2e2420"/><circle cx="90" cy="17" r="3.6" fill="#2e2420"/>` +
  `<path d="M74 52 Q78 56 82 52" fill="none" stroke="#5e4a2a" stroke-width="2" stroke-linecap="round"/>`

const buccaneers =
  shadow +
  // a leaf boat
  `<path d="M12 74 Q50 100 88 74 Q50 82 12 74 Z" fill="#6fae5f" stroke="#3f6e34" stroke-width="2.2"/>` +
  `<path d="M20 76 Q50 90 80 76" fill="none" stroke="#3f6e34" stroke-width="1.2"/>` +
  `<path d="M70 72 L70 30" stroke="#7a5a44" stroke-width="2.4"/><path d="M70 32 L88 48 L70 54 Z" fill="#f3ead0" stroke="#c9b08a" stroke-width="1.4"/><circle cx="76" cy="44" r="2.4" fill="#3d3550"/>` +
  `<ellipse cx="34" cy="34" rx="10" ry="6" transform="rotate(-25 34 34)" fill="#d9f2ea" stroke="#8fc7b4" stroke-width="1.4" opacity="0.9"/>` +
  `<path d="M38 58 Q48 54 58 58 L60 76 Q48 80 36 76 Z" fill="#3e6e6a" stroke="#264a46" stroke-width="1.6"/>` +
  `<path d="M38 62 L58 70" stroke="#e2b94f" stroke-width="2.4"/>` +
  `<circle cx="48" cy="44" r="11" fill="#f2c9a8" stroke="#d4a487" stroke-width="1.6"/>` +
  `<path d="M34 42 Q48 22 62 42 Q48 34 34 42 Z" fill="#3e6e6a" stroke="#264a46" stroke-width="1.4"/>` +
  `<path d="M58 32 C64 24 72 26 70 32" fill="none" stroke="#f7c6d4" stroke-width="2.4" stroke-linecap="round"/>` +
  `<circle cx="44" cy="45" r="1.6" fill="#3d3550"/><circle cx="52" cy="45" r="1.6" fill="#3d3550"/><path d="M44 50 Q48 52 52 50" fill="none" stroke="#a8604a" stroke-width="1.2"/>` +
  `<path d="M26 60 L18 50" stroke="#7a5a44" stroke-width="2.4" stroke-linecap="round"/><ellipse cx="16" cy="48" rx="4" ry="6" fill="#c9b08a" stroke="#8a7450"/>`

const leafBoatCamp =
  `<ellipse cx="50" cy="90" rx="44" ry="7" fill="#7fb8b0" opacity="0.7"/>` +
  `<path d="M10 82 Q50 102 90 82 Q50 90 10 82 Z" fill="#6fae5f" stroke="#3f6e34" stroke-width="2.4"/>` +
  `<path d="M22 84 C24 60 36 46 50 44 C64 46 76 60 78 84 Q50 90 22 84 Z" fill="#8fbf6a" stroke="#4f7a3a" stroke-width="2.2"/>` +
  `<path d="M50 44 Q48 64 50 86 M36 52 Q38 68 36 84 M64 52 Q62 68 64 84" fill="none" stroke="#4f7a3a" stroke-width="1.4"/>` +
  `<path d="M42 86 C42 72 46 66 50 66 C54 66 58 72 58 86 Z" fill="#2e4a3a"/>` +
  `<line x1="50" y1="44" x2="50" y2="12" stroke="#5e4428" stroke-width="2"/><path d="M50 12 L70 18 L50 24 Z" fill="#3e6e6a" stroke="#264a46" stroke-width="1.2"/><circle cx="58" cy="18" r="2.2" fill="#f3ead0"/>` +
  `<g fill="none" stroke="#d6f0ea" stroke-width="1.4"><path d="M14 92 q6 -2 12 0"/><path d="M74 93 q6 -2 12 0"/></g>`

const frog = (wild: boolean) =>
  `<ellipse cx="50" cy="90" rx="30" ry="5" fill="#3e5a52" opacity="0.16"/>` +
  (wild ? pad(18, 90, 32, '#7fbf6a') : '') +
  `<g class="${wild ? 'sway' : ''}">` +
  `<path d="M22 84 C10 82 12 66 26 66 L34 76 Z M78 84 C90 82 88 66 74 66 L66 76 Z" fill="#6fae4f" stroke="#3f7a2f" stroke-width="2"/>` +
  `<path d="M24 80 C20 54 34 40 50 40 C66 40 80 54 76 80 Q50 90 24 80 Z" fill="#7fc25a" stroke="#3f7a2f" stroke-width="2.4"/>` +
  `<path d="M34 80 Q50 88 66 80 Q62 64 50 64 Q38 64 34 80 Z" fill="#e6f2c8"/>` +
  `<circle cx="36" cy="40" r="10" fill="#7fc25a" stroke="#3f7a2f" stroke-width="2.2"/><circle cx="64" cy="40" r="10" fill="#7fc25a" stroke="#3f7a2f" stroke-width="2.2"/>` +
  `<circle cx="36" cy="40" r="6.4" fill="#fffbe6"/><circle cx="64" cy="40" r="6.4" fill="#fffbe6"/>` +
  `<circle cx="37" cy="41" r="3.8" fill="#2e2420"/><circle cx="65" cy="41" r="3.8" fill="#2e2420"/><circle cx="38.2" cy="39.4" r="1.3" fill="white"/><circle cx="66.2" cy="39.4" r="1.3" fill="white"/>` +
  `<path d="M34 58 Q50 68 66 58" fill="none" stroke="#3f7a2f" stroke-width="2.2" stroke-linecap="round"/>` +
  `<circle cx="30" cy="56" r="3.4" fill="#f7a6b8" opacity="0.6"/><circle cx="70" cy="56" r="3.4" fill="#f7a6b8" opacity="0.6"/>` +
  `</g>` +
  (wild
    ? ''
    : `<path d="M34 50 Q50 42 66 50 L64 58 Q50 52 36 58 Z" fill="#c97a3a" stroke="#8f5426" stroke-width="1.6"/><circle cx="50" cy="50" r="2.4" fill="#ffd94f"/>`)

// Curios (same frame as the Meadow and Forest ones)

const curio = (inner: string) =>
  `<circle cx="50" cy="50" r="44" fill="#e9ddff" opacity="0.5"/>` +
  `<circle cx="50" cy="50" r="36" fill="#fffaf0" stroke="#cdbbf5" stroke-width="3"/>` +
  inner

const mayorsChainCurio = curio(
  `<path d="M26 30 Q50 74 74 30" fill="none" stroke="#e2b94f" stroke-width="4" stroke-dasharray="5 3" stroke-linecap="round"/>` +
    `<circle cx="50" cy="60" r="13" fill="#f2c94f" stroke="#a87e1a" stroke-width="2.4"/>` +
    `<circle cx="50" cy="60" r="8" fill="none" stroke="#a87e1a" stroke-width="1.4"/>` +
    `<path d="M45 60 C45 54 55 54 55 60 Q50 64 45 60 Z" fill="#7fc25a" stroke="#3f7a2f" stroke-width="1"/>`,
)

const reedPipeCurio = curio(
  `<g transform="translate(50 52) rotate(-15)">${[-15, -9, -3, 3, 9, 15]
    .map(
      (x, i) =>
        `<rect x="${x - 2.8}" y="${-22 + i * 3}" width="5.6" height="${40 - i * 5}" rx="2.6" fill="#d6c58a" stroke="#8a8450" stroke-width="1.4"/>`,
    )
    .join('')}<path d="M-19 -4 L19 -4" stroke="#c97a3a" stroke-width="3"/></g>` +
    `<g fill="#9a86cf"><circle cx="74" cy="28" r="2.6"/><path d="M76.6 28 L76.6 18" stroke="#9a86cf" stroke-width="1.6"/></g>`,
)

const wispLantern = curio(
  `<circle cx="50" cy="56" r="18" fill="#bfe8ff" opacity="0.6"/>` +
    `<path d="M50 22 L50 30" stroke="#5e4428" stroke-width="2"/><path d="M42 22 Q50 16 58 22" fill="none" stroke="#5e4428" stroke-width="2"/>` +
    `<rect x="38" y="30" width="24" height="4" rx="1.6" fill="#5e4428"/>` +
    `<path d="M40 34 L60 34 L62 72 L38 72 Z" fill="#e6f6ff" stroke="#5e8aa8" stroke-width="2.2" opacity="0.9"/>` +
    `<rect x="36" y="72" width="28" height="5" rx="2" fill="#5e4428"/>` +
    `<circle cx="50" cy="54" r="7" fill="#d9f2ff" stroke="#8ec4e6" stroke-width="1.6"/><circle cx="50" cy="54" r="3" fill="#ffffff"/>`,
)

export const SWAMP_MISC_ART: Record<string, string> = {
  'spirit-mirebelle': mirebelle,
  'creature-heron': heron,
  'pest-slug': slug,
  'crew-bog-buccaneers': buccaneers,
  'camp-bog-buccaneers': leafBoatCamp,
  'mount-frog': frog(false),
  'mount-frog-wild': frog(true),
  'curio-mayors-chain': mayorsChainCurio,
  'curio-reed-pipe': reedPipeCurio,
  'curio-wisp-lantern': wispLantern,
}
