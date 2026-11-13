/**
 * Forest art (content doc → Region 2: Forest, and the Asset List). Same 100×100 storybook style
 * as the Meadow: rounded shapes, outlines in a darker shade of each fill, "sway" on moving parts.
 * Palette: deep greens, mossy browns, mushroom reds.
 */
import { ITEM_TEMPLATES } from './items'

const { shade, symbol, bowl, bottle, pouch, leafPile } = ITEM_TEMPLATES

const shadow = `<ellipse cx="50" cy="91" rx="26" ry="5" fill="#5a4352" opacity="0.12"/>`
const ground = `<ellipse cx="50" cy="97" rx="18" ry="3" fill="#6b4f3a" opacity="0.25"/>`

const ring = (count: number, draw: (angle: number, i: number) => string): string =>
  Array.from({ length: count }, (_, i) => draw((360 / count) * i, i)).join('')

// ---------------------------------------------------------------------------------------------
// Plants (stand on a baseline near y = 96)

const moss =
  ground +
  `<g class="sway">` +
  [
    [30, 84, 16, '#7fae5a'],
    [52, 80, 20, '#8fbf66'],
    [72, 86, 14, '#76a552'],
    [42, 70, 12, '#9ccc72'],
    [62, 68, 11, '#86b85e'],
  ]
    .map(
      ([x, y, r, c]) =>
        `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" stroke="${shade(c as string, 0.68)}" stroke-width="1.8"/>`,
    )
    .join('') +
  [
    [34, 78],
    [50, 74],
    [64, 80],
    [56, 64],
    [42, 66],
  ]
    .map(
      ([x, y]) =>
        `<path d="M${x} ${y} l0 -6" stroke="#c7e39a" stroke-width="1.6" stroke-linecap="round"/><circle cx="${x}" cy="${y - 7}" r="1.6" fill="#e9c46a"/>`,
    )
    .join('') +
  `</g>`

const frond = (angle: number, length: number) =>
  `<g transform="translate(50 94) rotate(${angle})"><path d="M0 0 Q2 ${-length / 2} 0 ${-length}" fill="none" stroke="#3f7a3c" stroke-width="2.4" stroke-linecap="round"/>${Array.from(
    { length: 7 },
    (_, i) => {
      const y = -length * (0.25 + i * 0.1)
      const w = 11 - i * 1.2
      return `<path d="M0 ${y} C${-w} ${y - 2} ${-w} ${y - 7} 0 ${y - 4} C${w} ${y - 7} ${w} ${y - 2} 0 ${y} Z" fill="#6fae5f" stroke="#3f7a3c" stroke-width="1.1"/>`
    },
  ).join('')}</g>`

const fern = ground + `<g class="sway">${frond(-32, 62)}${frond(30, 60)}${frond(-4, 74)}</g>`

const bilberry =
  ground +
  `<path d="M50 97 Q46 74 40 52 M50 97 Q56 76 64 56 M48 80 Q36 72 30 66" fill="none" stroke="#7a5a44" stroke-width="2.6" stroke-linecap="round"/>` +
  `<g class="sway">` +
  [
    [36, 54, -30],
    [58, 52, 30],
    [30, 66, -60],
    [68, 62, 50],
    [46, 44, 0],
  ]
    .map(
      ([x, y, a]) =>
        `<path transform="translate(${x} ${y}) rotate(${a})" d="M0 0 C5 -3 11 -3 14 0 C11 4 5 4 0 0 Z" fill="#7fbf6a" stroke="#4f8a4a" stroke-width="1.4"/>`,
    )
    .join('') +
  [
    [42, 62, 6],
    [52, 68, 6.5],
    [62, 64, 5.5],
    [36, 74, 5],
    [56, 56, 5],
  ]
    .map(
      ([x, y, r]) =>
        `<circle cx="${x}" cy="${y}" r="${r}" fill="#4a5ea8" stroke="#2e3c78" stroke-width="1.6"/><circle cx="${x - 2}" cy="${y - 2}" r="1.4" fill="#a9b8ec" opacity="0.8"/><path d="M${x - 1.5} ${y - r + 1} l1.5 1.5 1.5 -1.5" fill="none" stroke="#2e3c78" stroke-width="1"/>`,
    )
    .join('') +
  `</g>`

/** A mushroom: stem and cap, with optional spots and gills. */
const mushroom = (opts: {
  cap: string
  stem?: string
  width?: number
  height?: number
  spots?: string
  tall?: boolean
}) => {
  const { cap, stem = '#fbf1e2', width = 30, height = 22, spots, tall } = opts
  const top = tall ? 46 : 60
  const line = shade(cap, 0.65)
  return (
    ground +
    `<path d="M44 96 C45 ${top + 20} 45 ${top + 10} 46 ${top + 4} L55 ${top + 4} C56 ${top + 10} 56 ${top + 20} 57 96 Z" fill="${stem}" stroke="${shade(stem, 0.78)}" stroke-width="1.8"/>` +
    `<g class="sway"><path d="M${50 - width} ${top + 6} C${50 - width} ${top - height} ${50 + width} ${top - height} ${50 + width} ${top + 6} Q50 ${top + 12} ${50 - width} ${top + 6} Z" fill="${cap}" stroke="${line}" stroke-width="2"/>` +
    `<path d="M${50 - width + 8} ${top - 2} C${50 - width + 12} ${top - height + 6} 50 ${top - height + 2} ${50 + 8} ${top - height + 6}" fill="none" stroke="white" stroke-width="2.6" stroke-linecap="round" opacity="0.35"/>` +
    (spots ?? '') +
    `</g>`
  )
}

const buttonMushroom = mushroom({ cap: '#e9d6bd', width: 26, height: 20 })

const redCap = mushroom({
  cap: '#e0483e',
  width: 30,
  height: 26,
  tall: true,
  spots: [
    [36, 40, 3.6],
    [50, 32, 4.2],
    [64, 40, 3.4],
    [44, 46, 2.6],
    [58, 47, 2.4],
  ]
    .map(
      ([cx, cy, r]) =>
        `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#fff6f0" stroke="#e6b5ad" stroke-width="0.9"/>`,
    )
    .join(''),
})

const chanterelle =
  `<circle cx="50" cy="66" r="30" fill="#ffe59e" opacity="0.35"/>` +
  ground +
  `<g class="sway"><path d="M44 96 C44 84 40 74 30 64 C26 58 34 52 50 52 C66 52 74 58 70 64 C60 74 56 84 56 96 Z" fill="#f2b23a" stroke="#c48a1e" stroke-width="2"/>` +
  `<path d="M36 60 Q50 66 64 60" fill="none" stroke="#c48a1e" stroke-width="1.4"/>` +
  [42, 48, 54, 60]
    .map(
      (x) =>
        `<path d="M${x} 62 Q${(x + 50) / 2} 76 50 90" fill="none" stroke="#d99a2a" stroke-width="1"/>`,
    )
    .join('') +
  `<path d="M36 56 Q46 52 58 54" fill="none" stroke="#fff3b0" stroke-width="2.4" stroke-linecap="round" opacity="0.8"/></g>` +
  `<path d="M76 34 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 Z" fill="#ffe59e" stroke="#e2b94f" stroke-width="1"/>`

const inkcap =
  ground +
  `<path d="M46 96 L47 60 L54 60 L55 96 Z" fill="#f4f1ea" stroke="#c9c3b4" stroke-width="1.6"/>` +
  `<g class="sway"><path d="M36 64 C34 40 40 22 50 20 C60 22 66 40 64 64 Q50 70 36 64 Z" fill="#ece8de" stroke="#9c958a" stroke-width="2"/>` +
  `<path d="M36 62 Q38 72 34 78 M44 66 Q44 76 41 82 M56 66 Q56 76 59 82 M64 62 Q62 72 66 78" fill="none" stroke="#3d3550" stroke-width="3" stroke-linecap="round"/>` +
  `<path d="M42 34 L44 58 M50 26 L50 60 M58 34 L56 58" stroke="#c9c3b4" stroke-width="1.2"/>` +
  `<circle cx="34" cy="84" r="2" fill="#3d3550"/><circle cx="66" cy="84" r="2" fill="#3d3550"/></g>`

const birchCatkin =
  `<circle cx="50" cy="52" r="32" fill="#e8f1ff" opacity="0.45"/>` +
  ground +
  `<path d="M50 97 Q48 70 52 28" fill="none" stroke="#f3f1ea" stroke-width="5" stroke-linecap="round"/>` +
  `<path d="M50 97 Q48 70 52 28" fill="none" stroke="#9c958a" stroke-width="1" stroke-dasharray="2 9"/>` +
  `<g class="sway">${[
    [52, 34, 20],
    [50, 50, -24],
    [51, 64, 26],
  ]
    .map(
      ([x, y, a]) =>
        `<g transform="translate(${x} ${y}) rotate(${a})"><path d="M0 0 Q2 10 0 26" fill="none" stroke="#b8a46a" stroke-width="1.4"/><ellipse cx="1" cy="16" rx="4.4" ry="12" fill="#e7dca6" stroke="#b8a46a" stroke-width="1.4"/>${[
          8, 13, 18, 23,
        ]
          .map(
            (yy) =>
              `<path d="M-3 ${yy} Q1 ${yy + 2} 5 ${yy}" fill="none" stroke="#c9b26a" stroke-width="0.9"/>`,
          )
          .join('')}</g>`,
    )
    .join('')}` +
  `<path transform="translate(56 42) rotate(-30)" d="M0 0 C5 -3 11 -3 14 0 C11 4 5 4 0 0 Z" fill="#b6dc8a" stroke="#6e9a4a" stroke-width="1.2"/></g>` +
  `<path d="M74 26 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 Z" fill="#ffffff" stroke="#b8c4d8" stroke-width="1"/>`

const acornShape = (x: number, y: number, s: number) =>
  `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-11 -2 C-11 14 -4 20 0 22 C4 20 11 14 11 -2 Z" fill="#c98a4a" stroke="#8f5a2a" stroke-width="1.8"/>` +
  `<path d="M-4 4 Q-5 12 -1 17" fill="none" stroke="#e7b37a" stroke-width="2" stroke-linecap="round" opacity="0.8"/>` +
  `<path d="M-14 -2 C-14 -14 14 -14 14 -2 Q0 2 -14 -2 Z" fill="#8a6a44" stroke="#5e4428" stroke-width="1.8"/>` +
  `<path d="M-10 -6 L10 -6 M-12 -2 L12 -2 M-7 -10 L7 -10" stroke="#6e5234" stroke-width="1" stroke-dasharray="2 2"/>` +
  `<path d="M0 -12 Q1 -18 4 -19" fill="none" stroke="#5e4428" stroke-width="2" stroke-linecap="round"/></g>`

const acorn =
  ground +
  `<path d="M50 97 Q48 84 52 70" fill="none" stroke="#7a5a44" stroke-width="2.6" stroke-linecap="round"/>` +
  `<path transform="translate(30 56) rotate(-20)" d="M0 0 C4 -6 10 -2 14 -6 C16 0 22 0 24 4 C18 6 18 12 12 10 C8 14 2 10 0 0 Z" fill="#7fae5a" stroke="#4f7a3a" stroke-width="1.4"/>` +
  `<path transform="translate(54 56) rotate(10)" d="M0 0 C4 -6 10 -2 14 -6 C16 0 22 0 24 4 C18 6 18 12 12 10 C8 14 2 10 0 0 Z" fill="#8fbf66" stroke="#4f7a3a" stroke-width="1.4"/>` +
  `<g class="sway">${acornShape(42, 72, 1.1)}${acornShape(60, 76, 0.9)}</g>`

// ---------------------------------------------------------------------------------------------
// Raw materials and refined goods

const capPile = (cap: string, spots = false) =>
  shadow +
  [
    [36, 72, 0.8],
    [62, 70, 0.9],
    [50, 82, 0.75],
  ]
    .map(
      ([x, y, s]) =>
        `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-6 14 L-5 0 L5 0 L6 14 Z" fill="#fbf1e2" stroke="#d8bf9c" stroke-width="1.6"/><path d="M-18 2 C-18 -18 18 -18 18 2 Q0 6 -18 2 Z" fill="${cap}" stroke="${shade(cap, 0.65)}" stroke-width="2"/>${
          spots
            ? `<circle cx="-7" cy="-6" r="2.6" fill="#fff6f0"/><circle cx="5" cy="-9" r="3" fill="#fff6f0"/>`
            : ''
        }</g>`,
    )
    .join('')

const goldenCaps =
  `<circle cx="50" cy="66" r="28" fill="#ffe59e" opacity="0.35"/>` +
  shadow +
  [
    [40, 72, 0.9],
    [62, 70, 1],
  ]
    .map(
      ([x, y, s]) =>
        `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-5 16 C-5 8 -9 2 -16 -4 C-18 -10 -8 -12 0 -12 C8 -12 18 -10 16 -4 C9 2 5 8 5 16 Z" fill="#f2b23a" stroke="#c48a1e" stroke-width="1.8"/><path d="M-10 -6 Q0 -2 10 -6" fill="none" stroke="#c48a1e" stroke-width="1"/></g>`,
    )
    .join('')

const inkcaps =
  shadow +
  [
    [40, 72, 0.8],
    [62, 70, 0.9],
  ]
    .map(
      ([x, y, s]) =>
        `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-12 8 C-14 -12 -6 -24 0 -24 C6 -24 14 -12 12 8 Q0 12 -12 8 Z" fill="#ece8de" stroke="#9c958a" stroke-width="1.8"/><path d="M-12 6 Q-12 14 -15 18 M12 6 Q12 14 15 18 M0 10 Q0 16 -1 20" fill="none" stroke="#3d3550" stroke-width="2.6" stroke-linecap="round"/></g>`,
    )
    .join('')

const catkins =
  shadow +
  [
    [38, 66, -30],
    [58, 62, 20],
    [50, 76, 70],
  ]
    .map(
      ([x, y, a]) =>
        `<g transform="translate(${x} ${y}) rotate(${a})"><ellipse cx="0" cy="0" rx="5" ry="15" fill="#e7dca6" stroke="#b8a46a" stroke-width="1.6"/>${[
          -8, -3, 2, 7,
        ]
          .map(
            (yy) =>
              `<path d="M-4 ${yy} Q0 ${yy + 2} 4 ${yy}" fill="none" stroke="#c9b26a" stroke-width="1"/>`,
          )
          .join('')}</g>`,
    )
    .join('')

const bilberries =
  shadow +
  [
    [38, 66, 8],
    [58, 62, 9],
    [48, 78, 8.5],
    [64, 78, 7],
  ]
    .map(
      ([x, y, r]) =>
        `<circle cx="${x}" cy="${y}" r="${r}" fill="#4a5ea8" stroke="#2e3c78" stroke-width="1.8"/><circle cx="${x - 2.5}" cy="${y - 2.5}" r="2" fill="#a9b8ec" opacity="0.8"/><path d="M${x - 2} ${y - r + 1.5} l2 2 2 -2" fill="none" stroke="#2e3c78" stroke-width="1.2"/>`,
    )
    .join('')

const acorns = shadow + acornShape(38, 64, 1) + acornShape(62, 62, 1.05) + acornShape(50, 76, 0.9)

const mossTufts =
  shadow +
  [
    [38, 72, 14, '#7fae5a'],
    [60, 70, 16, '#8fbf66'],
    [50, 60, 12, '#9ccc72'],
  ]
    .map(
      ([x, y, r, c]) =>
        `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" stroke="${shade(c as string, 0.68)}" stroke-width="1.8"/><path d="M${(x as number) - 4} ${(y as number) - 2} l2 -4 M${(x as number) + 3} ${y} l1 -5" stroke="#c7e39a" stroke-width="1.4" stroke-linecap="round"/>`,
    )
    .join('')

/** A sack of flour or a little loam pot. */
const sack = (fill: string, sym: string) =>
  shadow +
  `<path d="M30 40 Q24 66 28 82 Q32 90 50 90 Q68 90 72 82 Q76 66 70 40 Z" fill="${fill}" stroke="${shade(fill, 0.7)}" stroke-width="2.4"/>` +
  `<path d="M30 40 Q36 28 44 30 Q50 22 56 30 Q64 28 70 40 Q50 46 30 40 Z" fill="${shade(fill, 0.92)}" stroke="${shade(fill, 0.7)}" stroke-width="2"/>` +
  `<path d="M34 42 Q50 48 66 42" fill="none" stroke="#a8875d" stroke-width="2.4"/>` +
  symbol(sym, 50, 66, shade(fill, 0.6), 1.2)

const earthLoam =
  shadow +
  `<path d="M24 50 Q24 88 50 88 Q76 88 76 50 Z" fill="#b07a4a" stroke="#7a4f2a" stroke-width="2.4"/>` +
  `<ellipse cx="50" cy="50" rx="26" ry="8" fill="#5e4428" stroke="#3e2c18" stroke-width="2"/>` +
  `<path d="M40 48 Q46 38 50 46 Q54 36 60 46" fill="none" stroke="#7fae5a" stroke-width="2.4" stroke-linecap="round"/>` +
  `<path d="M50 44 C46 34 54 30 56 36 C57 40 53 44 50 44 Z" fill="#9ccc72" stroke="#4f7a3a" stroke-width="1.4"/>` +
  `<path d="M28 62 Q50 70 72 62" fill="none" stroke="#d9a878" stroke-width="2" opacity="0.6"/>` +
  [
    [38, 74],
    [62, 76],
    [50, 80],
  ]
    .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.4" fill="#e7c49a" opacity="0.7"/>`)
    .join('')

// Trinkets

const marble =
  shadow +
  `<circle cx="50" cy="58" r="26" fill="#8fd3e8" stroke="#3f8aa6" stroke-width="2.4" opacity="0.95"/>` +
  `<path d="M30 62 C40 48 52 74 70 52" fill="none" stroke="#f05a6a" stroke-width="4" stroke-linecap="round"/>` +
  `<path d="M34 70 C46 60 56 78 68 64" fill="none" stroke="#ffd94f" stroke-width="3" stroke-linecap="round"/>` +
  `<circle cx="40" cy="46" r="6" fill="white" opacity="0.8"/>`

const brassKey =
  shadow +
  `<g transform="rotate(-30 50 58)"><circle cx="34" cy="58" r="13" fill="none" stroke="#c99a24" stroke-width="6"/><circle cx="34" cy="58" r="13" fill="none" stroke="#ffd94f" stroke-width="2.4"/>` +
  `<rect x="46" y="55" width="34" height="6" rx="2" fill="#e2b94f" stroke="#a87e1a" stroke-width="1.6"/>` +
  `<path d="M70 61 L70 70 L75 70 L75 66 L80 66 L80 61" fill="#e2b94f" stroke="#a87e1a" stroke-width="1.6"/></g>`

const ribbonScrap =
  shadow +
  `<path d="M20 60 C30 40 44 72 56 52 C64 40 74 56 82 46 L84 58 C76 68 66 52 58 64 C46 84 32 52 24 72 Z" fill="#6aa8e0" stroke="#3a74a8" stroke-width="2"/>` +
  `<path d="M30 58 C38 50 44 64 52 58" fill="none" stroke="#bfe0ff" stroke-width="2" stroke-linecap="round" opacity="0.8"/>`

export const FOREST_PLANT_ART: Record<string, string> = {
  'plant-moss': moss,
  'plant-fern': fern,
  'plant-bilberry': bilberry,
  'plant-button-mushroom': buttonMushroom,
  'plant-acorn': acorn,
  'plant-red-cap': redCap,
  'plant-golden-chanterelle': chanterelle,
  'plant-inkcap': inkcap,
  'plant-birch-catkin': birchCatkin,
}

export const FOREST_ITEM_ART: Record<string, string> = {
  'raw-moss-tufts': mossTufts,
  'raw-fern-fronds': leafPile('#6fae5f'),
  'raw-bilberries': bilberries,
  'raw-mushroom-caps': capPile('#e9d6bd'),
  'raw-acorns': acorns,
  'raw-red-caps': capPile('#e0483e', true),
  'raw-golden-caps': goldenCaps,
  'raw-inkcap': inkcaps,
  'raw-birch-catkins': catkins,

  'refined-spore-dust': bowl('#c9a98a', 'drop'),
  'refined-acorn-flour': sack('#f3e3cf', 'leaf'),
  'refined-golden-spore': pouch('#f2b23a', 'star'),

  'component-earth-loam': earthLoam,
  'potion-swiftroot-elixir': bottle('#8a6a44', 'leaf', 'tall'),

  'trinket-glass-marble': marble,
  'trinket-brass-key': brassKey,
  'trinket-ribbon-scrap': ribbonScrap,
}

// ---------------------------------------------------------------------------------------------
// Folk of Acornhollow: squirrels and hedgehogs

interface FolkLook {
  fur: string
  wear?: string
  top?: string
  front?: string
}

/** A red squirrel: tufted ears and a big curled tail. */
const squirrel = ({ fur, wear = '', top = '', front = '' }: FolkLook) => {
  const line = shade(fur, 0.65)
  return (
    shadow +
    `<path d="M66 86 C92 84 94 54 82 40 C74 30 84 18 90 24 C98 34 98 64 86 80" fill="${fur}" stroke="${line}" stroke-width="2.2"/>` +
    `<path d="M70 82 C86 78 88 56 80 44" fill="none" stroke="${shade(fur, 1.15)}" stroke-width="3" stroke-linecap="round" opacity="0.6"/>` +
    `<ellipse cx="48" cy="74" rx="19" ry="18" fill="${fur}" stroke="${line}" stroke-width="2"/>` +
    `<ellipse cx="48" cy="78" rx="10" ry="12" fill="#fff3ea" opacity="0.8"/>` +
    wear +
    `<ellipse cx="40" cy="91" rx="6" ry="3.4" fill="${fur}" stroke="${line}" stroke-width="1.6"/>` +
    `<ellipse cx="56" cy="91" rx="6" ry="3.4" fill="${fur}" stroke="${line}" stroke-width="1.6"/>` +
    `<path d="M30 34 L28 16 L40 28 Z" fill="${fur}" stroke="${line}" stroke-width="2" stroke-linejoin="round"/><path d="M28 16 l-2 -5 M28 16 l2 -6" stroke="${line}" stroke-width="1.6" stroke-linecap="round"/>` +
    `<path d="M66 34 L70 16 L58 28 Z" fill="${fur}" stroke="${line}" stroke-width="2" stroke-linejoin="round"/><path d="M70 16 l-2 -6 M70 16 l3 -5" stroke="${line}" stroke-width="1.6" stroke-linecap="round"/>` +
    `<ellipse cx="48" cy="44" rx="20" ry="18" fill="${fur}" stroke="${line}" stroke-width="2"/>` +
    `<ellipse cx="48" cy="52" rx="10" ry="7" fill="#fff3ea" opacity="0.85"/>` +
    `<circle cx="40" cy="42" r="3.2" fill="#3d2f3a"/><circle cx="56" cy="42" r="3.2" fill="#3d2f3a"/>` +
    `<circle cx="41" cy="41" r="1.1" fill="white"/><circle cx="57" cy="41" r="1.1" fill="white"/>` +
    `<circle cx="35" cy="50" r="3" fill="#f7a6b8" opacity="0.55"/><circle cx="61" cy="50" r="3" fill="#f7a6b8" opacity="0.55"/>` +
    `<ellipse cx="48" cy="50" rx="2.6" ry="2" fill="#5a3a3a"/>` +
    `<path d="M45 54 Q48 56.5 51 54" fill="none" stroke="${line}" stroke-width="1.4" stroke-linecap="round"/>` +
    top +
    front
  )
}

/** A hedgehog: round, with a coat of soft spines and a pointed nose. */
const hedgehog = ({ fur, wear = '', top = '', front = '' }: FolkLook) => {
  const spines = '#8a6a50'
  return (
    shadow +
    `<g fill="${spines}" stroke="${shade(spines, 0.7)}" stroke-width="1.4" stroke-linejoin="round">${ring(
      18,
      (a) => `<path transform="translate(50 60) rotate(${a})" d="M-6 -24 L0 -40 L6 -24 Z"/>`,
    )}</g>` +
    `<circle cx="50" cy="60" r="30" fill="${spines}" stroke="${shade(spines, 0.7)}" stroke-width="2"/>` +
    `<ellipse cx="50" cy="74" rx="18" ry="17" fill="${fur}" stroke="${shade(fur, 0.7)}" stroke-width="2"/>` +
    wear +
    `<ellipse cx="42" cy="91" rx="6" ry="3.4" fill="${fur}" stroke="${shade(fur, 0.7)}" stroke-width="1.6"/>` +
    `<ellipse cx="58" cy="91" rx="6" ry="3.4" fill="${fur}" stroke="${shade(fur, 0.7)}" stroke-width="1.6"/>` +
    `<path d="M32 50 C32 36 68 36 68 50 C68 58 58 62 50 66 C42 62 32 58 32 50 Z" fill="${fur}" stroke="${shade(fur, 0.7)}" stroke-width="2"/>` +
    `<circle cx="34" cy="38" r="5" fill="${fur}" stroke="${shade(fur, 0.7)}" stroke-width="1.6"/><circle cx="66" cy="38" r="5" fill="${fur}" stroke="${shade(fur, 0.7)}" stroke-width="1.6"/>` +
    `<circle cx="42" cy="48" r="3" fill="#3d2f3a"/><circle cx="58" cy="48" r="3" fill="#3d2f3a"/>` +
    `<circle cx="43" cy="47" r="1" fill="white"/><circle cx="59" cy="47" r="1" fill="white"/>` +
    `<circle cx="37" cy="55" r="3" fill="#f7a6b8" opacity="0.55"/><circle cx="63" cy="55" r="3" fill="#f7a6b8" opacity="0.55"/>` +
    `<circle cx="50" cy="60" r="3.2" fill="#3d2f3a"/>` +
    top +
    front
  )
}

const courierCap = `<path d="M34 30 Q48 14 62 30 Z" fill="#3a74a8" stroke="#244e78" stroke-width="1.6"/><path d="M60 29 L72 31 L60 33 Z" fill="#244e78"/><circle cx="48" cy="20" r="2.4" fill="#ffd94f"/>`
const mailbag = `<path d="M30 62 L66 84" stroke="#8f5426" stroke-width="3"/><rect x="58" y="78" width="16" height="12" rx="3" fill="#c97a3a" stroke="#8f5426" stroke-width="1.6"/><path d="M58 82 L74 82" stroke="#8f5426" stroke-width="1.2"/>`
const glassesHog = `<g fill="none" stroke="#8f6a3a" stroke-width="1.6"><circle cx="42" cy="48" r="5.5"/><circle cx="58" cy="48" r="5.5"/><path d="M47.5 48 L52.5 48"/></g>`
const herbBundle = `<g transform="translate(70 76) rotate(15)"><path d="M0 12 L0 -6" stroke="#7a5a44" stroke-width="2"/><path d="M0 -4 C-8 -10 -6 -18 0 -14 C6 -18 8 -10 0 -4 Z" fill="#8fbf66" stroke="#4f7a3a" stroke-width="1.2"/><circle cx="-4" cy="-12" r="3" fill="#e0483e"/><path d="M-4 4 L4 4" stroke="#c9a77f" stroke-width="2.4"/></g>`
const lantern = `<g transform="translate(72 70)"><path d="M0 -14 L0 -8" stroke="#5e4428" stroke-width="1.6"/><rect x="-7" y="-8" width="14" height="18" rx="3" fill="#ffe59e" stroke="#a87e1a" stroke-width="1.6"/><circle cx="0" cy="1" r="4" fill="#ffb84f"/><rect x="-8" y="-10" width="16" height="3" rx="1" fill="#5e4428"/></g>`
const heldAcorn = `<g transform="translate(48 74) scale(0.7)"><path d="M-11 -2 C-11 14 -4 20 0 22 C4 20 11 14 11 -2 Z" fill="#c98a4a" stroke="#8f5a2a" stroke-width="2"/><path d="M-14 -2 C-14 -14 14 -14 14 -2 Q0 2 -14 -2 Z" fill="#8a6a44" stroke="#5e4428" stroke-width="2"/></g>`
const bakerApron = `<path d="M36 70 L64 70 L65 88 Q50 92 35 88 Z" fill="#ffffff" stroke="#d9cfe0" stroke-width="1.6"/><path d="M44 78 Q50 74 56 78" fill="none" stroke="#c98a4a" stroke-width="2"/>`
const bonnet = `<path d="M34 40 Q34 24 50 22 Q66 24 66 40 Q58 32 50 32 Q42 32 34 40 Z" fill="#f7b7c8" stroke="#c97a8c" stroke-width="1.6"/><circle cx="50" cy="24" r="3" fill="#ffffff" stroke="#d9cfe0" stroke-width="1"/>`

export const FOREST_PEOPLE_ART: Record<string, string> = {
  'char-hazel': squirrel({ fur: '#d0763a', top: courierCap, wear: mailbag }),
  'char-burdock': hedgehog({ fur: '#e8d2b4', top: glassesHog, front: herbBundle }),
  'villager-bristle': hedgehog({ fur: '#ecd8bc', front: lantern }),
  'villager-chestnut': squirrel({ fur: '#b8642e', front: heldAcorn }),
  'villager-thornbury': hedgehog({ fur: '#f0dcc2', wear: bakerApron, top: bonnet }),
}

// ---------------------------------------------------------------------------------------------
// Spirit, creatures, pirates, mount

const bramblebeard =
  `<ellipse cx="50" cy="94" rx="40" ry="5" fill="#5a4352" opacity="0.14"/>` +
  `<path d="M18 96 C22 70 20 40 26 18 Q50 6 74 18 C80 40 78 70 82 96 Z" fill="#8a6a50" stroke="#5e4428" stroke-width="2.4"/>` +
  `<path d="M30 30 Q34 60 30 92 M70 30 Q66 60 70 92 M50 16 Q48 30 52 40" fill="none" stroke="#6e5234" stroke-width="1.8" opacity="0.7"/>` +
  `<path d="M28 22 C20 10 34 0 44 8 C50 0 62 2 64 10 C74 4 84 14 74 24 Z" fill="#7fae5a" stroke="#4f7a3a" stroke-width="2"/>` +
  `<path d="M36 42 Q40 38 44 42 M56 42 Q60 38 64 42" fill="none" stroke="#3e2c18" stroke-width="3" stroke-linecap="round"/>` +
  `<ellipse cx="40" cy="46" rx="3.4" ry="2" fill="#ffe59e" opacity="0.9"/><ellipse cx="60" cy="46" rx="3.4" ry="2" fill="#ffe59e" opacity="0.9"/>` +
  `<path d="M46 52 Q50 56 54 52" fill="none" stroke="#3e2c18" stroke-width="2" stroke-linecap="round"/>` +
  `<g class="sway"><path d="M32 56 C30 74 40 92 50 96 C60 92 70 74 68 56 Q58 64 50 62 Q42 64 32 56 Z" fill="#8fbf66" stroke="#4f7a3a" stroke-width="2"/>` +
  `<path d="M40 64 Q42 78 46 88 M50 64 L50 92 M60 64 Q58 78 54 88" fill="none" stroke="#5e8f44" stroke-width="1.6"/>` +
  `<path d="M36 66 L30 72 M64 66 L72 70" stroke="#6e5234" stroke-width="2" stroke-linecap="round"/><circle cx="44" cy="76" r="2.2" fill="#e0483e"/><circle cx="58" cy="82" r="2" fill="#4a5ea8"/></g>`

const owl =
  `<ellipse cx="50" cy="94" rx="24" ry="4" fill="#5a4352" opacity="0.14"/>` +
  `<path d="M24 92 Q46 86 76 92" stroke="#6e5234" stroke-width="6" stroke-linecap="round"/>` +
  `<path d="M28 52 C26 30 36 18 50 18 C64 18 74 30 72 52 C72 76 62 88 50 88 C38 88 28 76 28 52 Z" fill="#a8825c" stroke="#6e5234" stroke-width="2.4"/>` +
  `<path d="M30 22 L36 32 L42 24 Z M70 22 L64 32 L58 24 Z" fill="#a8825c" stroke="#6e5234" stroke-width="2" stroke-linejoin="round"/>` +
  `<path d="M38 60 Q50 54 62 60 Q62 80 50 84 Q38 80 38 60 Z" fill="#e7d3b4" stroke="#c9a77f" stroke-width="1.6"/>` +
  [62, 68, 74, 80]
    .map(
      (y) =>
        `<path d="M42 ${y} q2 2 4 0 M48 ${y} q2 2 4 0 M54 ${y} q2 2 4 0" fill="none" stroke="#a8825c" stroke-width="1.2"/>`,
    )
    .join('') +
  `<circle cx="40" cy="40" r="10" fill="#f3e3cf" stroke="#c9a77f" stroke-width="1.8"/><circle cx="60" cy="40" r="10" fill="#f3e3cf" stroke="#c9a77f" stroke-width="1.8"/>` +
  `<circle cx="40" cy="40" r="6" fill="#ffc94f"/><circle cx="60" cy="40" r="6" fill="#ffc94f"/>` +
  `<circle cx="41" cy="40" r="3.4" fill="#2e2420"/><circle cx="61" cy="40" r="3.4" fill="#2e2420"/>` +
  `<circle cx="42" cy="39" r="1.1" fill="white"/><circle cx="62" cy="39" r="1.1" fill="white"/>` +
  `<path d="M47 48 L50 54 L53 48 Z" fill="#e2a83f" stroke="#a87e1a" stroke-width="1.2"/>` +
  `<path d="M28 54 C20 62 22 76 30 82" fill="#94704c" stroke="#6e5234" stroke-width="2"/><path d="M72 54 C80 62 78 76 70 82" fill="#94704c" stroke="#6e5234" stroke-width="2"/>` +
  `<path d="M42 88 l-2 4 M46 88 l0 5 M54 88 l0 5 M58 88 l2 4" stroke="#e2a83f" stroke-width="2" stroke-linecap="round"/>`

const beetle =
  `<ellipse cx="50" cy="58" rx="22" ry="24" fill="#3a6e5a" stroke="#1e4a3a" stroke-width="3"/>` +
  `<path d="M50 34 L50 82" stroke="#1e4a3a" stroke-width="2.4"/>` +
  `<ellipse cx="42" cy="50" rx="5" ry="8" fill="#7fc9a8" opacity="0.5"/>` +
  `<circle cx="50" cy="32" r="11" fill="#2a4a3e" stroke="#1e4a3a" stroke-width="3"/>` +
  `<circle cx="45" cy="30" r="2.2" fill="#ffffff"/><circle cx="55" cy="30" r="2.2" fill="#ffffff"/>` +
  `<g stroke="#1e4a3a" stroke-width="2.6" stroke-linecap="round" fill="none"><path d="M44 22 Q40 12 34 12"/><path d="M56 22 Q60 12 66 12"/><path d="M28 50 L18 44"/><path d="M28 62 L16 64"/><path d="M30 74 L20 82"/><path d="M72 50 L82 44"/><path d="M72 62 L84 64"/><path d="M70 74 L80 82"/></g>`

const corsairs =
  shadow +
  `<g fill="#6e8f4a" stroke="#3e5a28" stroke-width="1.6">${[
    [20, 80, -30],
    [80, 80, 30],
    [26, 66, -60],
    [74, 64, 60],
  ]
    .map(
      ([x, y, a]) =>
        `<path transform="translate(${x} ${y}) rotate(${a})" d="M0 0 C4 -8 8 -14 0 -22 C-8 -14 -4 -8 0 0 Z"/>`,
    )
    .join('')}</g>` +
  `<path d="M16 88 Q30 70 26 56 M84 88 Q70 70 74 56" fill="none" stroke="#5e4428" stroke-width="2.4"/>` +
  [
    [24, 62],
    [76, 60],
    [20, 80],
    [80, 78],
  ]
    .map(
      ([x, y]) =>
        `<path d="M${x} ${y} l-3 -3 M${x} ${y} l3 -3" stroke="#5e4428" stroke-width="1.6"/>`,
    )
    .join('') +
  `<ellipse cx="38" cy="30" rx="10" ry="6" transform="rotate(-25 38 30)" fill="#e7f0d8" stroke="#9cb87a" stroke-width="1.4" opacity="0.9"/><ellipse cx="62" cy="30" rx="10" ry="6" transform="rotate(25 62 30)" fill="#e7f0d8" stroke="#9cb87a" stroke-width="1.4" opacity="0.9"/>` +
  `<path d="M40 50 Q50 46 60 50 L62 74 Q50 78 38 74 Z" fill="#4f6b3f" stroke="#2e4424" stroke-width="1.6"/>` +
  `<path d="M42 56 L58 64" stroke="#c9a77f" stroke-width="2.4"/>` +
  `<path d="M66 60 L80 44" stroke="#9c958a" stroke-width="2.4" stroke-linecap="round"/><path d="M78 42 l4 -2 -1 4 Z" fill="#9c958a"/>` +
  `<circle cx="50" cy="36" r="11" fill="#f2c9a8" stroke="#d4a487" stroke-width="1.6"/>` +
  `<path d="M36 34 Q50 16 64 34 Q50 26 36 34 Z" fill="#2e4424" stroke="#1e2e18" stroke-width="1.4"/><path d="M40 26 Q50 18 60 26" fill="none" stroke="#7fae5a" stroke-width="2"/>` +
  `<path d="M58 22 Q66 14 70 18" fill="none" stroke="#e0483e" stroke-width="2.4" stroke-linecap="round"/>` +
  `<circle cx="46" cy="37" r="1.6" fill="#3d2f3a"/><path d="M52 34 Q55 32 58 34 L58 40 Q55 42 52 40 Z" fill="#2e2420"/><path d="M46 42 Q50 44 54 41" fill="none" stroke="#a8604a" stroke-width="1.2"/>`

const thornCamp =
  `<ellipse cx="50" cy="90" rx="40" ry="6" fill="#5a4352" opacity="0.14"/>` +
  `<path d="M12 88 C14 58 30 40 50 38 C70 40 86 58 88 88 Z" fill="#5e7a3e" stroke="#3e5228" stroke-width="2.4"/>` +
  `<path d="M38 88 C38 70 44 62 50 62 C56 62 62 70 62 88 Z" fill="#2e3a22"/>` +
  [
    [18, 76],
    [26, 58],
    [40, 44],
    [60, 44],
    [74, 58],
    [82, 76],
  ]
    .map(
      ([x, y]) =>
        `<path d="M${x} ${y} l-5 -4 M${x} ${y} l5 -5 M${x} ${y} l0 -6" stroke="#2e3a22" stroke-width="2" stroke-linecap="round"/>`,
    )
    .join('') +
  `<circle cx="30" cy="70" r="2.6" fill="#e0483e"/><circle cx="68" cy="66" r="2.6" fill="#e0483e"/><circle cx="50" cy="48" r="2.4" fill="#e0483e"/>` +
  `<line x1="50" y1="38" x2="50" y2="10" stroke="#5e4428" stroke-width="2"/><path d="M50 10 L68 15 L50 20 Z" fill="#2e4424" stroke="#1e2e18" stroke-width="1.2"/><circle cx="57" cy="15" r="2" fill="#e7f0d8"/>`

const flyingSquirrel = (wild: boolean) =>
  `<g class="${wild ? 'sway' : ''}">` +
  `<path d="M14 52 C20 36 36 32 50 34 C64 32 80 36 86 52 C76 50 70 60 62 62 L38 62 C30 60 24 50 14 52 Z" fill="#c4a07c" stroke="#8a6a4a" stroke-width="2.2"/>` +
  `<path d="M18 52 Q34 46 50 50 Q66 46 82 52" fill="none" stroke="#e7d3b4" stroke-width="2" opacity="0.8"/>` +
  `</g>` +
  `<path d="M60 70 C78 74 92 70 94 82 C90 76 80 80 66 80" fill="#b08c68" stroke="#8a6a4a" stroke-width="2"/>` +
  `<ellipse cx="50" cy="62" rx="16" ry="18" fill="#c4a07c" stroke="#8a6a4a" stroke-width="2.2"/>` +
  `<ellipse cx="50" cy="66" rx="9" ry="11" fill="#f3e6d4"/>` +
  `<path d="M36 34 L34 22 L44 30 Z M64 34 L66 22 L56 30 Z" fill="#c4a07c" stroke="#8a6a4a" stroke-width="1.8" stroke-linejoin="round"/>` +
  `<ellipse cx="50" cy="40" rx="15" ry="13" fill="#c4a07c" stroke="#8a6a4a" stroke-width="2.2"/>` +
  `<circle cx="43" cy="38" r="4.6" fill="#2e2420"/><circle cx="57" cy="38" r="4.6" fill="#2e2420"/>` +
  `<circle cx="44.5" cy="36.5" r="1.6" fill="white"/><circle cx="58.5" cy="36.5" r="1.6" fill="white"/>` +
  `<ellipse cx="50" cy="45" rx="2.2" ry="1.6" fill="#5a3a3a"/>` +
  `<circle cx="39" cy="46" r="2.6" fill="#f7a6b8" opacity="0.6"/><circle cx="61" cy="46" r="2.6" fill="#f7a6b8" opacity="0.6"/>` +
  (wild
    ? ''
    : `<path d="M38 52 Q50 46 62 52 L60 58 Q50 54 40 58 Z" fill="#c97a3a" stroke="#8f5426" stroke-width="1.6"/>`)

// Spell sigil and curios (same frames as the Meadow ones)

const hushStep =
  `<circle cx="50" cy="50" r="44" fill="#8fbf9a" opacity="0.25"/>` +
  `<circle cx="50" cy="50" r="36" fill="#f1ecff" stroke="#8fbf9a" stroke-width="4"/>` +
  `<circle cx="50" cy="50" r="28" fill="none" stroke="#8fbf9a" stroke-width="1.6" stroke-dasharray="3 5"/>` +
  `<g transform="translate(50 50)"><path d="M-12 8 C-14 0 -10 -8 -6 -8 C-2 -8 -2 0 -4 8 Q-8 12 -12 8 Z" fill="#7c5cff" opacity="0.8"/><path d="M4 0 C2 -8 6 -16 10 -16 C14 -16 14 -8 12 0 Q8 4 4 0 Z" fill="#7c5cff" opacity="0.5"/><path d="M-18 16 Q0 10 18 16" fill="none" stroke="#7c5cff" stroke-width="2" stroke-dasharray="2 3"/></g>`

const curio = (inner: string) =>
  `<circle cx="50" cy="50" r="44" fill="#e9ddff" opacity="0.5"/>` +
  `<circle cx="50" cy="50" r="36" fill="#fffaf0" stroke="#cdbbf5" stroke-width="3"/>` +
  inner

const forgottenAcorn = curio(
  `<circle cx="50" cy="54" r="20" fill="#ffe59e" opacity="0.5"/>` +
    `<g transform="translate(50 56) scale(1.25)"><path d="M-11 -2 C-11 14 -4 20 0 22 C4 20 11 14 11 -2 Z" fill="#c98a4a" stroke="#8f5a2a" stroke-width="1.8"/><path d="M-14 -2 C-14 -14 14 -14 14 -2 Q0 2 -14 -2 Z" fill="#8a6a44" stroke="#5e4428" stroke-width="1.8"/><path d="M0 -12 Q1 -18 4 -19" fill="none" stroke="#5e4428" stroke-width="2"/></g>` +
    `<path d="M70 30 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 Z" fill="#ffe59e" stroke="#e2b94f" stroke-width="1"/>`,
)

const fieldGuide = curio(
  `<path d="M26 34 L50 38 L74 34 L74 72 L50 76 L26 72 Z" fill="#7a9a5a" stroke="#4f6b3a" stroke-width="2.4"/>` +
    `<path d="M50 38 L50 76" stroke="#4f6b3a" stroke-width="2"/>` +
    `<path d="M30 38 L48 41 L48 72 L30 69 Z" fill="#fbf1e2"/><path d="M52 41 L70 38 L70 69 L52 72 Z" fill="#fbf1e2"/>` +
    `<path d="M33 58 C33 48 45 48 45 58 Q39 60 33 58 Z" fill="#e0483e"/><path d="M38 58 L38 66 L40 66 L40 58" fill="#fbf1e2" stroke="#d8bf9c" stroke-width="0.8"/>` +
    `<path d="M55 48 L67 46 M55 54 L67 52 M55 60 L64 58" stroke="#c9a77f" stroke-width="1.6"/>`,
)

const bookmark = curio(
  `<rect x="38" y="20" width="24" height="60" rx="3" fill="#f3e3cf" stroke="#c9a77f" stroke-width="2"/>` +
    `<path d="M38 80 L50 70 L62 80" fill="#f3e3cf" stroke="#c9a77f" stroke-width="2"/>` +
    `<path d="M50 58 L50 34" stroke="#7fae5a" stroke-width="1.6"/>` +
    ring(
      5,
      (a) =>
        `<ellipse transform="translate(50 36) rotate(${a})" cx="0" cy="-5" rx="3" ry="5" fill="#cdbbf5" stroke="#9a86cf" stroke-width="1"/>`,
    ) +
    `<circle cx="50" cy="36" r="2.4" fill="#ffe59e"/>` +
    `<path d="M50 50 C44 46 42 52 50 54 M50 46 C56 42 58 48 50 50" fill="#9ccc72" stroke="#4f7a3a" stroke-width="1"/>`,
)

const heartwood = curio(
  `<path d="M50 78 C24 60 26 34 40 32 C46 31 50 36 50 40 C50 36 54 31 60 32 C74 34 76 60 50 78 Z" fill="#b07a4a" stroke="#7a4f2a" stroke-width="2.6"/>` +
    `<path d="M50 70 C36 58 38 42 44 40 M50 70 C64 58 62 42 56 40" fill="none" stroke="#d9a878" stroke-width="1.8"/>` +
    `<path d="M50 74 L50 46" stroke="#7a4f2a" stroke-width="1.4"/>` +
    `<path d="M50 32 C46 22 54 18 58 22 C60 26 54 30 50 32 Z" fill="#9ccc72" stroke="#4f7a3a" stroke-width="1.4"/>`,
)

export const FOREST_MISC_ART: Record<string, string> = {
  'spirit-bramblebeard': bramblebeard,
  'creature-owl': owl,
  'pest-beetle': beetle,
  'crew-bramble-corsairs': corsairs,
  'camp-bramble-corsairs': thornCamp,
  'mount-flying-squirrel': flyingSquirrel(false),
  'mount-flying-squirrel-wild': flyingSquirrel(true),
  'spell-hush-step': hushStep,
  'curio-forgotten-acorn': forgottenAcorn,
  'curio-burdocks-field-guide': fieldGuide,
  'curio-pressed-flower-bookmark': bookmark,
  'curio-heartwood-charm': heartwood,
}
