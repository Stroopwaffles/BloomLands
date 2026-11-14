/**
 * Blossom Orchard art (content doc → Region 4: Blossom Orchard, and the Asset List). Same 100×100
 * storybook style: rounded shapes, outlines in a darker shade of each fill, "sway" on moving
 * parts. Palette: blossom pink, honey gold, leaf green.
 */
import { ITEM_TEMPLATES } from './items'

const { shade, symbol, bowl, jar, petalPile, leafPile } = ITEM_TEMPLATES

const shadow = `<ellipse cx="50" cy="91" rx="26" ry="5" fill="#5a4352" opacity="0.12"/>`
const ground = `<ellipse cx="50" cy="97" rx="18" ry="3" fill="#6b4f3a" opacity="0.25"/>`

const ring = (count: number, draw: (angle: number, i: number) => string): string =>
  Array.from({ length: count }, (_, i) => draw((360 / count) * i, i)).join('')

/** A five-petal blossom centered at (x, y). */
const blossom = (x: number, y: number, fill: string, r = 7) =>
  `<g transform="translate(${x} ${y})">${ring(
    5,
    (a) =>
      `<ellipse transform="rotate(${a})" cx="0" cy="${-r * 0.62}" rx="${r * 0.5}" ry="${r * 0.62}" fill="${fill}" stroke="${shade(fill, 0.78)}" stroke-width="1"/>`,
  )}<circle r="${r * 0.28}" fill="#e2a83f"/></g>`

/** A blossoming twig: a brown branch with leaves and flowers. */
const blossomTwig = (fill: string, flowers: [number, number, number][]) =>
  ground +
  `<path d="M50 97 Q48 76 44 60 M47 74 Q36 64 30 52 M46 66 Q58 54 66 42" fill="none" stroke="#7a5a44" stroke-width="3" stroke-linecap="round"/>` +
  `<g class="sway">` +
  [
    [32, 62, -40],
    [64, 52, 40],
    [42, 80, -60],
  ]
    .map(
      ([x, y, a]) =>
        `<path transform="translate(${x} ${y}) rotate(${a})" d="M0 0 C4 -3 9 -3 12 0 C9 3 4 3 0 0 Z" fill="#8fbf66" stroke="#4f8a4a" stroke-width="1.2"/>`,
    )
    .join('') +
  flowers.map(([x, y, r]) => blossom(x, y, fill, r)).join('') +
  `</g>`

const appleBlossom = blossomTwig('#fbe3ea', [
  [30, 50, 8],
  [44, 42, 9],
  [66, 40, 8],
  [56, 58, 7],
])
const cherryBlossom = blossomTwig('#f7a6c0', [
  [28, 52, 8],
  [42, 44, 8],
  [60, 38, 9],
  [70, 52, 7],
  [50, 58, 7],
])
const quinceBlossom = blossomTwig('#f6c0a8', [
  [36, 48, 11],
  [62, 42, 12],
])

/** A chunk of fallen honeycomb resting on a leaf, honey pooling and dripping. */
const honeyDrip =
  ground +
  `<path d="M18 92 C26 76 74 74 84 90 C70 98 30 98 18 92 Z" fill="#8fbf66" stroke="#4f8a4a" stroke-width="1.6"/>` +
  `<path d="M24 90 Q50 82 78 90" fill="none" stroke="#4f8a4a" stroke-width="1"/>` +
  `<ellipse cx="50" cy="90" rx="22" ry="4" fill="#f2b23a" opacity="0.85"/>` +
  `<g class="sway">` +
  [
    [40, 70],
    [52, 70],
    [64, 70],
    [46, 60],
    [58, 60],
    [52, 50],
    [34, 80],
    [46, 80],
    [58, 80],
  ]
    .map(
      ([x, y]) =>
        `<polygon points="${x - 6},${y} ${x - 3},${y - 5.2} ${x + 3},${y - 5.2} ${x + 6},${y} ${x + 3},${y + 5.2} ${x - 3},${y + 5.2}" fill="#f6d36a" stroke="#a87e1a" stroke-width="1.4"/><polygon points="${x - 3},${y} ${x - 1.5},${y - 2.6} ${x + 1.5},${y - 2.6} ${x + 3},${y} ${x + 1.5},${y + 2.6} ${x - 1.5},${y + 2.6}" fill="#f2b23a" opacity="0.8"/>`,
    )
    .join('') +
  `<path d="M66 76 C70 80 70 86 68 88 C66 86 65 82 66 76 Z" fill="#f2b23a" stroke="#a87e1a" stroke-width="1"/>` +
  `<circle cx="46" cy="40" r="2" fill="#f2b23a"/>` +
  `</g>`

const beeBalm =
  ground +
  `<path d="M50 97 L50 52 M42 97 Q40 76 36 64 M58 97 Q60 78 64 66" fill="none" stroke="#5e8a3a" stroke-width="2.4"/>` +
  `<g class="sway">` +
  [
    [50, 46, 12],
    [36, 60, 9],
    [64, 62, 9],
  ]
    .map(
      ([x, y, r]) =>
        ring(
          10,
          (a) =>
            `<path transform="translate(${x} ${y}) rotate(${a})" d="M0 0 L0 ${-r} " stroke="#d94f8a" stroke-width="2.4" stroke-linecap="round"/>`,
        ) + `<circle cx="${x}" cy="${y}" r="${r * 0.35}" fill="#b03a6e"/>`,
    )
    .join('') +
  `<path d="M44 74 C38 70 34 74 38 78 Z M56 72 C62 68 66 72 62 76 Z" fill="#6fae5f" stroke="#4f8a4a" stroke-width="1.2"/></g>`

const crabapple =
  ground +
  `<path d="M30 70 Q50 60 70 72" fill="none" stroke="#6fae5f" stroke-width="3"/>` +
  [
    [36, 80, 11],
    [58, 82, 12],
    [48, 66, 9],
  ]
    .map(
      ([x, y, r]) =>
        `<circle cx="${x}" cy="${y}" r="${r}" fill="#e0483e" stroke="#9a2a24" stroke-width="2"/><path d="M${x} ${y - r} l1 -5" stroke="#7a5a44" stroke-width="1.6" stroke-linecap="round"/><ellipse cx="${x - r * 0.35}" cy="${y - r * 0.35}" rx="${r * 0.25}" ry="${r * 0.15}" fill="#ffd0c8" opacity="0.8"/>`,
    )
    .join('')

const goldenPollen =
  ground +
  `<circle cx="50" cy="66" r="24" fill="#ffe59e" opacity="0.4" class="sway"/>` +
  `<path d="M50 97 L50 70" stroke="#6fae5f" stroke-width="2.4"/>` +
  `<g class="sway">${blossom(50, 62, '#ffd94f', 14)}` +
  [
    [32, 46],
    [68, 42],
    [60, 30],
    [38, 34],
  ]
    .map(
      ([x, y]) =>
        `<circle cx="${x}" cy="${y}" r="3" fill="#f2b23a"/><circle cx="${x}" cy="${y}" r="5.5" fill="#ffe59e" opacity="0.5"/>`,
    )
    .join('') +
  `</g>`

const royalJelly =
  ground +
  `<path d="M28 96 L28 64 L36 56 L50 60 L64 56 L72 64 L72 96 Z" fill="#f2c94f" stroke="#a87e1a" stroke-width="2"/>` +
  `<path d="M36 66 Q50 58 64 66 L64 86 Q50 92 36 86 Z" fill="#fff7e0" stroke="#e2b94f" stroke-width="1.6"/>` +
  `<g class="sway"><ellipse cx="50" cy="74" rx="10" ry="6" fill="#fffaf0"/><circle cx="46" cy="72" r="2" fill="white"/></g>` +
  `<path d="M40 58 L44 50 L50 56 L56 50 L60 58" fill="#ffd94f" stroke="#a87e1a" stroke-width="1.4"/>`

const truffle =
  `<ellipse cx="50" cy="94" rx="30" ry="5" fill="#6b4f3a" opacity="0.5"/>` +
  `<path d="M26 92 Q50 76 74 92 Z" fill="#8a6a44"/>` +
  `<g class="sway"><path d="M34 86 C30 70 42 58 52 62 C66 58 72 74 66 86 Q50 92 34 86 Z" fill="#4a3628" stroke="#2e2018" stroke-width="2"/>` +
  [
    [42, 72],
    [54, 68],
    [60, 78],
    [46, 82],
  ]
    .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.4" fill="#6e5234"/>`)
    .join('') +
  `</g>`

// ---------------------------------------------------------------------------------------------
// Items

const honeyJar = jar('#f2b23a', 'drop')
const crabapplePile =
  shadow +
  [
    [38, 70, 11],
    [62, 70, 11],
    [50, 56, 10],
  ]
    .map(
      ([x, y, r]) =>
        `<circle cx="${x}" cy="${y}" r="${r}" fill="#e0483e" stroke="#9a2a24" stroke-width="2"/><path d="M${x} ${y - r} l1 -5" stroke="#7a5a44" stroke-width="1.6"/>`,
    )
    .join('')
const pollenPile =
  shadow +
  `<circle cx="50" cy="66" r="24" fill="#ffe59e" opacity="0.5"/>` +
  Array.from({ length: 14 }, (_, i) => {
    const x = 36 + ((i * 29) % 28)
    const y = 56 + ((i * 17) % 22)
    return `<circle cx="${x}" cy="${y}" r="4" fill="#f2b23a" stroke="#c98a1a" stroke-width="1"/>`
  }).join('')
const royalJellyPot = jar('#fff7e0', 'star')
const truffleItem =
  shadow +
  `<path d="M28 80 C22 58 40 42 52 48 C72 42 80 64 72 80 Q50 90 28 80 Z" fill="#4a3628" stroke="#2e2018" stroke-width="2.4"/>` +
  [
    [40, 62],
    [56, 58],
    [62, 72],
    [44, 74],
  ]
    .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#6e5234"/>`)
    .join('')

const beeswaxCandle =
  shadow +
  `<rect x="34" y="40" width="32" height="48" rx="6" fill="#f2c94f" stroke="#a87e1a" stroke-width="2.4"/>` +
  ring(
    4,
    (_, i) =>
      `<path d="M34 ${50 + i * 10} L66 ${50 + i * 10}" stroke="#d9a83a" stroke-width="1.4" opacity="0.8"/>`,
  ) +
  `<path d="M50 40 L50 30" stroke="#5e4428" stroke-width="2"/>` +
  `<path d="M50 12 C42 22 44 30 50 32 C56 30 58 22 50 12 Z" fill="#ffb84f" stroke="#e2873a" stroke-width="1.4"/>` +
  `<path d="M50 20 C47 25 48 29 50 30 C52 29 53 25 50 20 Z" fill="#fff3b0"/>` +
  `<circle cx="50" cy="26" r="16" fill="#ffe59e" opacity="0.25"/>`

const copperCoin =
  shadow +
  `<circle cx="50" cy="62" r="24" fill="#d9884a" stroke="#8f5426" stroke-width="2.6"/>` +
  `<circle cx="50" cy="62" r="17" fill="none" stroke="#b86a32" stroke-width="1.6"/>` +
  symbol('star', 50, 62, '#f3c08a', 1.1)

const sewingNeedle =
  shadow +
  `<path d="M24 82 L76 30" stroke="#b8bcc8" stroke-width="5" stroke-linecap="round"/>` +
  `<path d="M24 82 L76 30" stroke="#e6e9f0" stroke-width="1.6" stroke-linecap="round"/>` +
  `<ellipse cx="70" cy="36" rx="4" ry="2" transform="rotate(-45 70 36)" fill="#fffaf0" stroke="#8f96a6" stroke-width="1.2"/>` +
  `<path d="M70 36 C82 44 80 60 64 62 C52 64 48 74 56 82" fill="none" stroke="#e0485a" stroke-width="2.4" stroke-linecap="round"/>`

const seedPacket =
  shadow +
  `<path d="M30 30 L70 30 L72 88 L28 88 Z" fill="#fbf1e2" stroke="#c9a77f" stroke-width="2.4"/>` +
  `<path d="M30 30 L36 24 L64 24 L70 30" fill="#e9d6bd" stroke="#c9a77f" stroke-width="2"/>` +
  blossom(50, 54, '#f7a6c0', 9) +
  `<path d="M38 74 L62 74 M40 80 L58 80" stroke="#c9a77f" stroke-width="2"/>`

export const ORCHARD_PLANT_ART: Record<string, string> = {
  'plant-honey-drip': honeyDrip,
  'plant-apple-blossom': appleBlossom,
  'plant-cherry-blossom': cherryBlossom,
  'plant-bee-balm': beeBalm,
  'plant-crabapple': crabapple,
  'plant-golden-pollen': goldenPollen,
  'plant-quince-blossom': quinceBlossom,
  'plant-royal-jelly': royalJelly,
  'plant-truffle': truffle,
}

export const ORCHARD_ITEM_ART: Record<string, string> = {
  'raw-honey': honeyJar,
  'raw-apple-petals': petalPile('#fbe3ea'),
  'raw-cherry-petals': petalPile('#f7a6c0'),
  'raw-bee-balm-leaves': leafPile('#7fae6a'),
  'raw-crabapples': crabapplePile,
  'raw-golden-pollen': pollenPile,
  'raw-quince-petals': petalPile('#f6c0a8', false),
  'raw-royal-jelly': royalJellyPot,
  'raw-truffle': truffleItem,
  'refined-honey-syrup': bowl('#f2b23a', 'drop'),
  'refined-pollen-gold': bowl('#ffd94f', 'star'),
  'component-beeswax-candle': beeswaxCandle,
  'trinket-copper-coin': copperCoin,
  'trinket-sewing-needle': sewingNeedle,
  'trinket-seed-packet': seedPacket,
}

// ---------------------------------------------------------------------------------------------
// Combhaven's bees

interface BeeLook {
  /** Body stripe color (honeybees are golden, bumblebees rounder and fuzzier). */
  body: string
  round?: boolean
  wear?: string
  top?: string
  front?: string
}

const bee = ({ body, round = false, wear = '', top = '', front = '' }: BeeLook) => {
  const line = shade(body, 0.62)
  const rx = round ? 22 : 18
  return (
    shadow +
    `<g class="sway"><ellipse cx="34" cy="50" rx="13" ry="8" transform="rotate(-25 34 50)" fill="#e9f2ff" stroke="#9ab4d6" stroke-width="1.4" opacity="0.9"/><ellipse cx="66" cy="50" rx="13" ry="8" transform="rotate(25 66 50)" fill="#e9f2ff" stroke="#9ab4d6" stroke-width="1.4" opacity="0.9"/></g>` +
    `<ellipse cx="50" cy="72" rx="${rx}" ry="20" fill="${body}" stroke="${line}" stroke-width="2"/>` +
    `<path d="M${50 - rx + 3} 68 Q50 72 ${50 + rx - 3} 68 M${50 - rx + 2} 78 Q50 82 ${50 + rx - 2} 78" fill="none" stroke="#3d2f2a" stroke-width="4" stroke-linecap="round"/>` +
    wear +
    `<ellipse cx="42" cy="91" rx="5" ry="3" fill="#3d2f2a"/><ellipse cx="58" cy="91" rx="5" ry="3" fill="#3d2f2a"/>` +
    `<path d="M42 30 Q36 18 30 18 M58 30 Q64 18 70 18" fill="none" stroke="#3d2f2a" stroke-width="2" stroke-linecap="round"/><circle cx="30" cy="18" r="2.6" fill="#3d2f2a"/><circle cx="70" cy="18" r="2.6" fill="#3d2f2a"/>` +
    `<circle cx="50" cy="42" r="16" fill="${body}" stroke="${line}" stroke-width="2"/>` +
    `<circle cx="44" cy="41" r="3.2" fill="#2e2420"/><circle cx="56" cy="41" r="3.2" fill="#2e2420"/>` +
    `<circle cx="45" cy="40" r="1.1" fill="white"/><circle cx="57" cy="40" r="1.1" fill="white"/>` +
    `<path d="M45 48 Q50 52 55 48" fill="none" stroke="${line}" stroke-width="1.6" stroke-linecap="round"/>` +
    `<circle cx="39" cy="47" r="2.6" fill="#f7a6b8" opacity="0.6"/><circle cx="61" cy="47" r="2.6" fill="#f7a6b8" opacity="0.6"/>` +
    top +
    front
  )
}

const hardHat = `<path d="M34 34 Q50 16 66 34 Z" fill="#f2c94f" stroke="#a87e1a" stroke-width="1.6"/><rect x="31" y="32" width="38" height="4" rx="2" fill="#e2a83f"/>`
const toolBelt = `<path d="M33 76 L67 76" stroke="#8f5426" stroke-width="4"/><rect x="58" y="74" width="7" height="9" rx="1.6" fill="#c97a3a"/>`
const helmet = `<path d="M34 38 Q34 22 50 22 Q66 22 66 38 L62 38 L62 32 L38 32 L38 38 Z" fill="#c9cdd6" stroke="#7a808e" stroke-width="1.8"/><path d="M50 22 C46 12 56 8 58 14" fill="none" stroke="#c23a4c" stroke-width="3" stroke-linecap="round"/>`
const quill = `<g transform="translate(68 74) rotate(25)"><path d="M0 12 L0 -10" stroke="#5e4428" stroke-width="1.6"/><path d="M0 -12 C-6 -4 -5 6 0 10 C5 6 6 -4 0 -12 Z" fill="#fffaf0" stroke="#c9ccd6" stroke-width="1"/></g>`
const pollenBasket = `<g transform="translate(68 76)"><path d="M-8 0 L8 0 L6 10 L-6 10 Z" fill="#d9b68a" stroke="#a8875d" stroke-width="1.4"/><circle cx="-3" cy="-2" r="3" fill="#f2b23a"/><circle cx="3" cy="-2" r="3" fill="#f2b23a"/></g>`
const ruler = `<g transform="translate(66 72) rotate(-20)"><rect x="-2" y="-14" width="5" height="26" fill="#e2b94f" stroke="#a87e1a" stroke-width="1"/><path d="M-2 -8 l3 0 M-2 -2 l3 0 M-2 4 l3 0" stroke="#a87e1a" stroke-width="1"/></g>`
const ladleHoney = `<g transform="translate(68 70) rotate(20)"><path d="M0 -16 L0 6" stroke="#a8875d" stroke-width="2.4" stroke-linecap="round"/><path d="M-7 6 Q0 16 7 6 Z" fill="#f2b23a" stroke="#a87e1a" stroke-width="1.4"/></g>`
const kerchief = `<path d="M38 30 Q50 22 62 30 Q50 34 38 30 Z" fill="#f7b7c8" stroke="#c97a8c" stroke-width="1.4"/>`

export const ORCHARD_PEOPLE_ART: Record<string, string> = {
  'char-waxwick': bee({ body: '#f2c94f', top: hardHat, wear: toolBelt }),
  'char-bumbleton': bee({ body: '#e9b83f', round: true, top: helmet, front: quill }),
  'villager-pollyanna': bee({ body: '#f6d36a', front: pollenBasket }),
  'villager-hexley': bee({ body: '#eec24a', front: ruler }),
  'villager-mother-comb': bee({ body: '#e8b84a', round: true, top: kerchief, front: ladleHoney }),
}

// ---------------------------------------------------------------------------------------------
// Spirit, creatures, pirates, mount, curios

const pome =
  `<ellipse cx="50" cy="94" rx="36" ry="5" fill="#5a4352" opacity="0.14"/>` +
  `<path d="M40 94 Q42 70 46 58 L54 58 Q58 70 60 94 Z" fill="#8a6a44" stroke="#5e4428" stroke-width="2"/>` +
  `<g class="sway"><circle cx="50" cy="38" r="30" fill="#9cc46a" stroke="#5e8a3a" stroke-width="2.2"/>` +
  [
    [34, 30, '#e0483e'],
    [62, 26, '#f2c94f'],
    [48, 50, '#e0483e'],
    [68, 46, '#c9d86a'],
    [36, 48, '#f6c0a8'],
  ]
    .map(
      ([x, y, c]) =>
        `<circle cx="${x}" cy="${y}" r="5" fill="${c}" stroke="${shade(c as string, 0.7)}" stroke-width="1.2"/>`,
    )
    .join('') +
  blossom(50, 20, '#fbe3ea', 6) +
  blossom(26, 40, '#f7a6c0', 5) +
  blossom(74, 34, '#fbe3ea', 5) +
  `</g>` +
  `<path d="M44 66 Q46 64 48 66 M52 66 Q54 64 56 66" fill="none" stroke="#3e2c18" stroke-width="1.8" stroke-linecap="round"/>` +
  `<path d="M45 72 Q50 76 55 72" fill="none" stroke="#3e2c18" stroke-width="1.6" stroke-linecap="round"/>` +
  `<circle cx="42" cy="70" r="2.4" fill="#f7a6b8" opacity="0.7"/><circle cx="58" cy="70" r="2.4" fill="#f7a6b8" opacity="0.7"/>`

const badger =
  `<ellipse cx="50" cy="92" rx="34" ry="5" fill="#5a4352" opacity="0.16"/>` +
  `<path d="M14 88 Q20 66 44 62 Q76 60 86 82 Q86 92 70 92 L28 92 Q14 92 14 88 Z" fill="#8a8e96" stroke="#55585e" stroke-width="2.4"/>` +
  `<path d="M24 92 l2 -6 M34 92 l1 -5 M66 92 l-1 -5 M78 92 l-2 -6" stroke="#3d3f44" stroke-width="3" stroke-linecap="round"/>` +
  `<path d="M60 52 C60 40 72 34 82 40 C92 46 92 60 84 66 Q72 72 62 66 Z" fill="#f3f1ea" stroke="#9a9ca4" stroke-width="2"/>` +
  `<path d="M70 38 C66 48 66 58 70 68 M80 40 C84 48 84 58 80 66" stroke="#2e2f33" stroke-width="5" fill="none"/>` +
  `<circle cx="70" cy="52" r="2.2" fill="#2e2420"/><circle cx="80" cy="52" r="2.2" fill="#2e2420"/>` +
  `<path d="M66 47 L72 50 M84 47 L78 50" stroke="#2e2420" stroke-width="2" stroke-linecap="round"/>` +
  `<ellipse cx="88" cy="60" rx="3.4" ry="2.6" fill="#2e2420"/>` +
  `<path d="M72 62 Q76 60 80 62" fill="none" stroke="#2e2420" stroke-width="1.6" stroke-linecap="round"/>` +
  `<path d="M18 84 Q10 80 12 88 Q16 92 24 90" fill="#8a6a44" stroke="#5e4428" stroke-width="1.4"/>`

const caterpillar =
  [
    [22, 66],
    [34, 58],
    [46, 56],
    [58, 58],
    [70, 64],
  ]
    .map(
      ([x, y], i) =>
        `<circle cx="${x}" cy="${y}" r="${9 - i * 0.4}" fill="${i % 2 ? '#8fcf5f' : '#a8dc72'}" stroke="#4f8a3a" stroke-width="2.4"/>`,
    )
    .join('') +
  `<circle cx="80" cy="56" r="11" fill="#a8dc72" stroke="#4f8a3a" stroke-width="2.6"/>` +
  `<circle cx="78" cy="53" r="2.4" fill="#2e2420"/><circle cx="86" cy="53" r="2.4" fill="#2e2420"/>` +
  `<path d="M78 44 L74 34 M86 44 L90 34" stroke="#4f8a3a" stroke-width="2.4" stroke-linecap="round"/><circle cx="74" cy="33" r="2.6" fill="#e0483e"/><circle cx="90" cy="33" r="2.6" fill="#e0483e"/>` +
  `<path d="M80 62 Q83 64 86 61" fill="none" stroke="#2e2420" stroke-width="1.6" stroke-linecap="round"/>`

const nabbers =
  shadow +
  `<ellipse cx="34" cy="34" rx="12" ry="7" transform="rotate(-25 34 34)" fill="#fff3d6" stroke="#e2b94f" stroke-width="1.4" opacity="0.9"/><ellipse cx="66" cy="34" rx="12" ry="7" transform="rotate(25 66 34)" fill="#fff3d6" stroke="#e2b94f" stroke-width="1.4" opacity="0.9"/>` +
  `<path d="M38 58 Q50 54 62 58 L64 78 Q50 82 36 78 Z" fill="#c9832f" stroke="#8f5426" stroke-width="1.6"/>` +
  `<path d="M38 64 L62 64 M38 72 L62 72" stroke="#3d2f2a" stroke-width="3"/>` +
  `<circle cx="50" cy="44" r="11" fill="#f2c9a8" stroke="#d4a487" stroke-width="1.6"/>` +
  `<path d="M38 40 Q50 26 62 40 Q50 34 38 40 Z" fill="#f2b23a" stroke="#a87e1a" stroke-width="1.4"/>` +
  `<path d="M40 44 L60 44" stroke="#2e2420" stroke-width="4"/><circle cx="45" cy="44" r="2" fill="#fffaf0"/><circle cx="55" cy="44" r="2" fill="#fffaf0"/>` +
  `<path d="M46 50 Q50 52 54 50" fill="none" stroke="#a8604a" stroke-width="1.2"/>` +
  `<g transform="translate(72 74)"><path d="M-8 -6 Q-10 8 0 10 Q10 8 8 -6 Z" fill="#f2c94f" stroke="#a87e1a" stroke-width="1.6"/><path d="M-6 -6 Q0 -10 6 -6" fill="none" stroke="#a87e1a" stroke-width="1.6"/></g>`

const hiveCamp =
  `<ellipse cx="50" cy="90" rx="40" ry="6" fill="#5a4352" opacity="0.14"/>` +
  `<path d="M22 88 Q20 50 50 34 Q80 50 78 88 Z" fill="#e8b84a" stroke="#a87e1a" stroke-width="2.4"/>` +
  [44, 56, 68, 80]
    .map(
      (y) =>
        `<path d="M${26 + (88 - y) * 0.1} ${y} Q50 ${y + 4} ${74 - (88 - y) * 0.1} ${y}" fill="none" stroke="#a87e1a" stroke-width="1.6"/>`,
    )
    .join('') +
  `<path d="M42 88 C42 76 46 70 50 70 C54 70 58 76 58 88 Z" fill="#3d2f2a"/>` +
  `<line x1="50" y1="34" x2="50" y2="10" stroke="#5e4428" stroke-width="2"/><path d="M50 10 L68 15 L50 20 Z" fill="#2e2420"/><path d="M56 13 l3 3 m0 -3 l-3 3" stroke="#f2c94f" stroke-width="1.4"/>`

const hummingbird = (wild: boolean) =>
  `<ellipse cx="50" cy="90" rx="22" ry="4" fill="#5a4352" opacity="0.14"/>` +
  `<g class="${wild ? 'sway' : ''}">` +
  `<path d="M42 54 C28 36 18 34 12 40 C22 44 32 52 40 60 Z" fill="#7fd0c0" stroke="#3f8a80" stroke-width="1.6" opacity="0.9"/>` +
  `<path d="M56 54 C70 34 82 30 88 36 C78 42 68 50 60 60 Z" fill="#7fd0c0" stroke="#3f8a80" stroke-width="1.6" opacity="0.9"/>` +
  `</g>` +
  `<path d="M40 70 C30 80 26 88 30 90 C36 86 42 80 46 74 Z" fill="#3f8a80" stroke="#2e6a62" stroke-width="1.4"/>` +
  `<ellipse cx="50" cy="62" rx="14" ry="12" fill="#4fb3a0" stroke="#2e6a62" stroke-width="2"/>` +
  `<ellipse cx="52" cy="66" rx="8" ry="6" fill="#e0485a" opacity="0.85"/>` +
  `<circle cx="58" cy="50" r="10" fill="#4fb3a0" stroke="#2e6a62" stroke-width="2"/>` +
  `<path d="M66 50 L90 46" stroke="#3d2f2a" stroke-width="2.4" stroke-linecap="round"/>` +
  `<circle cx="61" cy="48" r="2.6" fill="#2e2420"/><circle cx="62" cy="47" r="0.9" fill="white"/>` +
  (wild
    ? ''
    : `<path d="M44 58 Q50 54 58 58 L56 62 Q50 60 46 62 Z" fill="#c97a3a" stroke="#8f5426" stroke-width="1.2"/>`)

const curio = (inner: string) =>
  `<circle cx="50" cy="50" r="44" fill="#e9ddff" opacity="0.5"/>` +
  `<circle cx="50" cy="50" r="36" fill="#fffaf0" stroke="#cdbbf5" stroke-width="3"/>` +
  inner

const hex = (x: number, y: number, r: number, fill: string) =>
  `<polygon points="${ring(6, (a) => {
    const rad = ((a + 30) * Math.PI) / 180
    return `${(x + r * Math.cos(rad)).toFixed(1)},${(y + r * Math.sin(rad)).toFixed(1)} `
  }).trim()}" fill="${fill}" stroke="${shade(fill, 0.7)}" stroke-width="1.6"/>`

const brooch = curio(
  hex(50, 50, 13, '#f2c94f') +
    hex(36, 42, 9, '#f6d36a') +
    hex(64, 42, 9, '#f6d36a') +
    hex(36, 58, 9, '#f6d36a') +
    hex(64, 58, 9, '#f6d36a') +
    `<circle cx="50" cy="50" r="5" fill="#ffd94f" stroke="#a87e1a" stroke-width="1.2"/>`,
)

const pennant = curio(
  `<path d="M34 24 L34 80" stroke="#7a5a44" stroke-width="3" stroke-linecap="round"/>` +
    `<path d="M36 26 L74 36 L36 48 Z" fill="#c23a4c" stroke="#8f2636" stroke-width="2"/>` +
    `<path d="M44 34 l3 3 m0 -3 l-3 3" stroke="#f2c94f" stroke-width="1.8"/>` +
    `<circle cx="34" cy="22" r="3" fill="#f2c94f" stroke="#a87e1a" stroke-width="1"/>`,
)

const queensSeal = curio(
  `<circle cx="50" cy="54" r="20" fill="#c23a4c" stroke="#8f2636" stroke-width="2.4"/>` +
    `<path d="M40 50 L44 42 L50 48 L56 42 L60 50 L58 60 L42 60 Z" fill="#f2c94f" stroke="#a87e1a" stroke-width="1.4"/>` +
    `<path d="M50 24 Q46 30 50 34 Q54 30 50 24 Z" fill="#c23a4c"/>`,
)

const pocketWatch = curio(
  `<path d="M50 18 L50 26" stroke="#a87e1a" stroke-width="3"/><circle cx="50" cy="16" r="4" fill="none" stroke="#a87e1a" stroke-width="2"/>` +
    `<circle cx="50" cy="54" r="24" fill="#f2c94f" stroke="#a87e1a" stroke-width="2.6"/>` +
    `<circle cx="50" cy="54" r="18" fill="#fffaf0" stroke="#d9a83a" stroke-width="1.4"/>` +
    `<path d="M50 54 L50 42 M50 54 L58 58" stroke="#3d2f2a" stroke-width="2" stroke-linecap="round"/>` +
    `<circle cx="50" cy="54" r="2" fill="#3d2f2a"/>`,
)

export const ORCHARD_MISC_ART: Record<string, string> = {
  'spirit-pome': pome,
  'creature-badger': badger,
  'pest-caterpillar': caterpillar,
  'crew-nectar-nabbers': nabbers,
  'camp-nectar-nabbers': hiveCamp,
  'mount-hummingbird': hummingbird(false),
  'mount-hummingbird-wild': hummingbird(true),
  'curio-honeycomb-brooch': brooch,
  'curio-knights-pennant': pennant,
  'curio-queens-seal': queensSeal,
  'curio-badgers-pocket-watch': pocketWatch,
}
