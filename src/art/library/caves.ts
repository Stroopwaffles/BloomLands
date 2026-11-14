/**
 * Caves art (content doc → Region 5: Caves, and the Asset List). Same 100×100 storybook style.
 * Palette: deep indigo, crystal cyan, glowing fungus green. Glowing things get a soft halo.
 */
import { ITEM_TEMPLATES } from './items'

const { shade, bowl, bottle, leafPile, petalPile } = ITEM_TEMPLATES

const shadow = `<ellipse cx="50" cy="91" rx="26" ry="5" fill="#2e2a4a" opacity="0.18"/>`
const ground = `<ellipse cx="50" cy="97" rx="18" ry="3" fill="#3a3550" opacity="0.35"/>`
const halo = (x: number, y: number, r: number, color: string) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" opacity="0.28"/>`

/** A crystal: a tall six-sided gem with a light facet. */
const gem = (x: number, y: number, w: number, h: number, fill: string, tilt = 0) =>
  `<g transform="translate(${x} ${y}) rotate(${tilt})"><path d="M0 ${-h} L${w / 2} ${-h * 0.7} L${w / 2} 0 L0 ${h * 0.12} L${-w / 2} 0 L${-w / 2} ${-h * 0.7} Z" fill="${fill}" stroke="${shade(fill, 0.6)}" stroke-width="1.6"/><path d="M0 ${-h} L0 ${h * 0.12} M${-w / 2} ${-h * 0.7} L0 ${-h * 0.5} L${w / 2} ${-h * 0.7}" fill="none" stroke="${shade(fill, 0.75)}" stroke-width="0.8"/><path d="M${-w / 4} ${-h * 0.62} L${-w / 4} ${-h * 0.2}" stroke="white" stroke-width="1.4" opacity="0.7" stroke-linecap="round"/></g>`

/** A mushroom, optionally glowing. */
const shroom = (x: number, y: number, s: number, cap: string, glow = false) =>
  (glow ? halo(x, y - 14 * s, 16 * s, cap) : '') +
  `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-4 0 L-3 -14 L3 -14 L4 0 Z" fill="#e6e2f0" stroke="#a8a2c0" stroke-width="1.4"/><path d="M-16 -12 C-16 -30 16 -30 16 -12 Q0 -8 -16 -12 Z" fill="${cap}" stroke="${shade(cap, 0.65)}" stroke-width="1.8"/><circle cx="-6" cy="-20" r="2" fill="white" opacity="0.6"/><circle cx="5" cy="-23" r="1.6" fill="white" opacity="0.6"/></g>`

// ---------------------------------------------------------------------------------------------
// Plants

const caveMoss =
  ground +
  `<g class="sway">` +
  [
    [32, 86, 14],
    [52, 82, 18],
    [70, 88, 12],
    [44, 72, 10],
  ]
    .map(
      ([x, y, r]) =>
        `<circle cx="${x}" cy="${y}" r="${r}" fill="#5f8f7a" stroke="#3a6455" stroke-width="1.8"/>`,
    )
    .join('') +
  [
    [36, 78],
    [54, 72],
    [64, 82],
  ]
    .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.6" fill="#b8f2c8"/>`)
    .join('') +
  `</g>`

const paleRoot =
  ground +
  `<g class="sway"><path d="M50 30 C46 46 54 58 48 72 C44 82 52 90 50 97" fill="none" stroke="#e9e0c8" stroke-width="5" stroke-linecap="round"/>` +
  `<path d="M50 30 C46 46 54 58 48 72 C44 82 52 90 50 97" fill="none" stroke="#b8ab8a" stroke-width="1.4"/>` +
  `<path d="M49 52 C38 56 34 66 30 70 M51 64 C62 66 66 74 70 78 M48 78 C40 82 38 88 36 92" fill="none" stroke="#e9e0c8" stroke-width="2.6" stroke-linecap="round"/>` +
  `<path d="M42 22 Q50 30 58 22" fill="none" stroke="#7a6a54" stroke-width="3" stroke-linecap="round"/></g>`

const glowcap =
  ground +
  `<g class="sway">${shroom(38, 92, 0.9, '#7fe0b0', true)}${shroom(60, 94, 1.1, '#6fd4a4', true)}${shroom(50, 80, 0.7, '#9cf0c4', true)}</g>`

const ghostOrchid =
  ground +
  `<g class="sway"><path d="M50 97 Q48 72 52 40" fill="none" stroke="#a8b4c8" stroke-width="2"/>` +
  [
    [46, 66, -1],
    [56, 52, 1],
    [48, 40, -1],
  ]
    .map(
      ([x, y, s]) =>
        `<g transform="translate(${x} ${y}) scale(${s} 1)"><path d="M0 0 C-10 -8 -16 4 -6 6 Z" fill="#f2f4fb" stroke="#a8b4c8" stroke-width="1.1"/><path d="M0 0 C-2 -10 6 -14 7 -4 Z" fill="#ffffff" stroke="#a8b4c8" stroke-width="1.1"/><path d="M0 0 C-6 4 -3 12 3 9 C7 6 4 2 0 0 Z" fill="#e2e8f6" stroke="#8a96b0" stroke-width="1.1"/></g>`,
    )
    .join('') +
  halo(50, 52, 18, '#dfe8ff') +
  `</g>`

const crystalShard =
  ground +
  `<g class="sway">${gem(40, 94, 12, 34, '#8ee0f0', -12)}${gem(58, 96, 14, 44, '#7ad0e8', 8)}${gem(50, 96, 9, 22, '#b8f0fa', 0)}</g>`

const starfungus =
  ground +
  halo(50, 70, 22, '#fff3b0') +
  `<g class="sway">${shroom(50, 94, 1.2, '#9a86cf')}` +
  [
    [40, 66],
    [58, 64],
    [50, 56],
  ]
    .map(
      ([x, y]) =>
        `<path transform="translate(${x} ${y}) scale(0.5)" d="M0 -8 L2.3 -2.4 8 -2.4 3.5 1.2 5.2 7 0 3.6 -5.2 7 -3.5 1.2 -8 -2.4 -2.3 -2.4 Z" fill="#fff3b0"/>`,
    )
    .join('') +
  `</g>`

const geode =
  ground +
  `<path d="M22 92 C18 66 34 52 50 52 C68 52 82 66 78 92 Z" fill="#8a7a6a" stroke="#5e5248" stroke-width="2.4"/>` +
  `<path d="M30 90 C28 72 40 62 50 62 C62 62 72 72 70 90 Z" fill="#5a3e8a" stroke="#3e2a64" stroke-width="1.6"/>` +
  `<g class="sway">${gem(40, 90, 8, 18, '#c8a2f0', -15)}${gem(50, 90, 10, 24, '#b88ae8', 0)}${gem(60, 90, 8, 18, '#d8b8f8', 15)}</g>`

const starCrystal =
  ground +
  halo(50, 66, 26, '#fff3b0') +
  `<g class="sway">${gem(50, 96, 18, 56, '#fff3d6', 0)}${gem(36, 96, 10, 28, '#ffe59e', -18)}${gem(64, 96, 10, 28, '#ffe59e', 18)}</g>` +
  `<path d="M50 30 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 Z" fill="#ffffff"/>`

const sunshaftFern =
  ground +
  `<path d="M38 0 L62 0 L72 97 L28 97 Z" fill="#fff3b0" opacity="0.25"/>` +
  `<g class="sway">` +
  [-28, 0, 26]
    .map(
      (a) =>
        `<g transform="translate(50 94) rotate(${a})"><path d="M0 0 Q2 -34 0 -66" fill="none" stroke="#4f8a3a" stroke-width="2.4"/>${[
          0.3, 0.45, 0.6, 0.75, 0.9,
        ]
          .map(
            (f) =>
              `<path d="M0 ${-66 * f} C-10 ${-66 * f - 2} -10 ${-66 * f - 8} 0 ${-66 * f - 5} C10 ${-66 * f - 8} 10 ${-66 * f - 2} 0 ${-66 * f} Z" fill="#c8e86a" stroke="#6a9a3a" stroke-width="1"/>`,
          )
          .join('')}</g>`,
    )
    .join('') +
  `</g>`

// ---------------------------------------------------------------------------------------------
// Items

const sporePile = (color: string) =>
  shadow +
  halo(50, 66, 24, color) +
  Array.from({ length: 14 }, (_, i) => {
    const x = 36 + ((i * 29) % 28)
    const y = 56 + ((i * 17) % 22)
    return `<circle cx="${x}" cy="${y}" r="3.6" fill="${color}" stroke="${shade(color, 0.7)}" stroke-width="1"/>`
  }).join('')

const rootBundle =
  shadow +
  [36, 44, 52, 60, 68]
    .map(
      (x, i) =>
        `<path d="M${x} 86 C${x - 6} 66 ${x + 6} 50 ${x + (i - 2) * 3} 26" fill="none" stroke="#e9e0c8" stroke-width="4" stroke-linecap="round"/>`,
    )
    .join('') +
  `<path d="M34 60 Q52 66 70 60" fill="none" stroke="#7a6a54" stroke-width="4" stroke-linecap="round"/>`

const shardPile = shadow + gem(40, 86, 14, 40, '#8ee0f0', -14) + gem(60, 88, 16, 48, '#7ad0e8', 10)
const geodeHalf =
  shadow +
  `<path d="M20 80 C18 52 34 36 50 36 C66 36 82 52 80 80 Q50 90 20 80 Z" fill="#8a7a6a" stroke="#5e5248" stroke-width="2.6"/>` +
  `<path d="M28 78 C28 58 40 46 50 46 C60 46 72 58 72 78 Q50 84 28 78 Z" fill="#5a3e8a"/>` +
  gem(42, 78, 8, 18, '#c8a2f0', -15) +
  gem(52, 78, 10, 26, '#b88ae8', 0) +
  gem(62, 78, 8, 18, '#d8b8f8', 15)
const starCrystalItem = shadow + halo(50, 58, 26, '#fff3b0') + gem(50, 88, 20, 60, '#fff3d6', 0)
const fernFrond =
  shadow +
  `<path d="M30 86 Q48 56 72 24" fill="none" stroke="#4f8a3a" stroke-width="3"/>` +
  [0.2, 0.35, 0.5, 0.65, 0.8]
    .map((f) => {
      const x = 30 + 42 * f
      const y = 86 - 62 * f
      return `<path d="M${x} ${y} C${x - 12} ${y - 2} ${x - 12} ${y - 10} ${x} ${y - 6} Z" fill="#c8e86a" stroke="#6a9a3a" stroke-width="1"/><path d="M${x} ${y} C${x + 4} ${y + 10} ${x + 12} ${y + 8} ${x + 6} ${y} Z" fill="#c8e86a" stroke="#6a9a3a" stroke-width="1"/>`
    })
    .join('')

const glowInk =
  shadow +
  halo(50, 62, 30, '#7fe0b0') +
  `<path d="M34 46 Q34 36 42 36 L58 36 Q66 36 66 46 L66 82 Q66 90 58 90 L42 90 Q34 90 34 82 Z" fill="#1e2a3a" stroke="#0e1620" stroke-width="2.4"/>` +
  `<rect x="40" y="28" width="20" height="10" rx="3" fill="#c9a77f" stroke="#9a7a55" stroke-width="2"/>` +
  `<path d="M38 56 Q50 50 62 56 L62 82 Q50 88 38 82 Z" fill="#7fe0b0" opacity="0.85"/>` +
  `<path d="M44 70 q4 -6 8 0 q4 6 8 0" fill="none" stroke="#e6fff2" stroke-width="2"/>`

const crystalFocus =
  shadow +
  halo(50, 54, 30, '#8ee0f0') +
  `<circle cx="50" cy="54" r="22" fill="#d8f6fc" stroke="#5ab0c8" stroke-width="3"/>` +
  `<circle cx="50" cy="54" r="14" fill="none" stroke="#8ee0f0" stroke-width="2"/>` +
  `<path d="M40 44 Q46 38 54 40" fill="none" stroke="white" stroke-width="3" stroke-linecap="round"/>` +
  `<path d="M50 76 L50 88 M40 88 L60 88" stroke="#7a6a54" stroke-width="3" stroke-linecap="round"/>`

const heartNectar =
  shadow +
  `<path d="M50 88 C20 66 24 40 38 38 C44 37 50 42 50 46 C50 42 56 37 62 38 C76 40 80 66 50 88 Z" fill="#f2b23a" stroke="#a87e1a" stroke-width="2.6"/>` +
  `<path d="M50 80 C34 66 36 50 42 48" fill="none" stroke="#ffe59e" stroke-width="3" stroke-linecap="round"/>` +
  `<circle cx="58" cy="54" r="4" fill="#f7a6c0"/>`

const ironKey =
  shadow +
  `<circle cx="34" cy="44" r="13" fill="none" stroke="#5a5f6e" stroke-width="5"/>` +
  `<path d="M44 52 L76 82 M66 72 L72 66 M72 78 L78 72" stroke="#5a5f6e" stroke-width="5" stroke-linecap="round"/>` +
  `<circle cx="34" cy="44" r="13" fill="none" stroke="#8a8fa0" stroke-width="1.4"/>`

const glassLens =
  shadow +
  `<circle cx="50" cy="56" r="26" fill="#e6f6ff" stroke="#8a8fa0" stroke-width="4" opacity="0.95"/>` +
  `<path d="M36 46 Q42 38 52 38" fill="none" stroke="white" stroke-width="4" stroke-linecap="round"/>`

const silverRing =
  shadow +
  `<ellipse cx="50" cy="64" rx="24" ry="14" fill="none" stroke="#c9ccd6" stroke-width="6"/>` +
  `<ellipse cx="50" cy="64" rx="24" ry="14" fill="none" stroke="#8a8fa0" stroke-width="1.4"/>` +
  gem(50, 54, 12, 16, '#8ee0f0', 0)

export const CAVES_PLANT_ART: Record<string, string> = {
  'plant-cave-moss': caveMoss,
  'plant-pale-root': paleRoot,
  'plant-glowcap': glowcap,
  'plant-ghost-orchid': ghostOrchid,
  'plant-crystal-shard': crystalShard,
  'plant-starfungus': starfungus,
  'plant-geode': geode,
  'plant-star-crystal': starCrystal,
  'plant-sunshaft-fern': sunshaftFern,
}

export const CAVES_ITEM_ART: Record<string, string> = {
  'raw-cave-moss': leafPile('#5f8f7a'),
  'raw-root-fibers': rootBundle,
  'raw-glowcap-spores': sporePile('#7fe0b0'),
  'raw-ghost-petals': petalPile('#eef2fb'),
  'raw-crystal-shards': shardPile,
  'raw-star-spores': sporePile('#c8b8f0'),
  'raw-geode-crystals': geodeHalf,
  'raw-star-crystal': starCrystalItem,
  'raw-sunshaft-fern': fernFrond,
  'refined-glow-spores': bowl('#7fe0b0', 'star'),
  'refined-crystal-powder': bowl('#b8f0fa', 'star'),
  'component-glow-ink': glowInk,
  'component-crystal-focus': crystalFocus,
  'component-heart-nectar': heartNectar,
  'potion-glowlight': bottle('#ffe59e', 'sun', 'round'),
  'trinket-iron-key': ironKey,
  'trinket-glass-lens': glassLens,
  'trinket-silver-ring': silverRing,
}

// ---------------------------------------------------------------------------------------------
// Glimmerdeep folk: moles (and Lumen, a little glowworm)

interface MoleLook {
  fur: string
  wear?: string
  top?: string
  front?: string
}

const mole = ({ fur, wear = '', top = '', front = '' }: MoleLook) => {
  const line = shade(fur, 0.62)
  return (
    shadow +
    `<ellipse cx="50" cy="72" rx="22" ry="20" fill="${fur}" stroke="${line}" stroke-width="2"/>` +
    `<ellipse cx="50" cy="78" rx="12" ry="11" fill="${shade(fur, 1.25)}" opacity="0.5"/>` +
    wear +
    `<path d="M30 84 l-6 4 M32 88 l-4 6 M70 84 l6 4 M68 88 l4 6" stroke="#f7a6b8" stroke-width="3" stroke-linecap="round"/>` +
    `<ellipse cx="50" cy="46" rx="20" ry="18" fill="${fur}" stroke="${line}" stroke-width="2"/>` +
    `<path d="M42 44 Q44 42 46 44 M54 44 Q56 42 58 44" fill="none" stroke="#2e2420" stroke-width="2" stroke-linecap="round"/>` +
    `<ellipse cx="50" cy="56" rx="6" ry="4.4" fill="#f7a6b8" stroke="#c97a8c" stroke-width="1.2"/>` +
    `<path d="M44 58 L32 56 M44 60 L33 62 M56 58 L68 56 M56 60 L67 62" stroke="${line}" stroke-width="0.9"/>` +
    top +
    front
  )
}

const goggles = `<path d="M30 40 Q50 30 70 40" fill="none" stroke="#5e4428" stroke-width="3"/><g stroke="#8f5426" stroke-width="2"><circle cx="42" cy="36" r="6" fill="#bfe8ff"/><circle cx="58" cy="36" r="6" fill="#bfe8ff"/></g>`
const wrench = `<g transform="translate(68 76) rotate(30)"><rect x="-2" y="-12" width="4" height="22" fill="#8a8fa0"/><path d="M-6 -16 L-2 -12 L2 -12 L6 -16 L6 -20 L2 -18 L-2 -18 L-6 -20 Z" fill="#8a8fa0" stroke="#5a5f6e" stroke-width="1"/></g>`
const lampHat = `<path d="M32 36 Q50 22 68 36 Z" fill="#f2c94f" stroke="#a87e1a" stroke-width="1.6"/><circle cx="50" cy="30" r="4" fill="#fff3b0" stroke="#a87e1a" stroke-width="1"/><circle cx="50" cy="30" r="9" fill="#fff3b0" opacity="0.3"/>`
const lantern = `<g transform="translate(70 70)"><path d="M0 -14 L0 -8" stroke="#5e4428" stroke-width="1.6"/><rect x="-7" y="-8" width="14" height="18" rx="3" fill="#ffe59e" stroke="#a87e1a" stroke-width="1.6"/><circle cx="0" cy="1" r="4" fill="#ffb84f"/></g>`
const pickaxe = `<g transform="translate(68 72) rotate(-20)"><path d="M0 -16 L0 14" stroke="#7a5a44" stroke-width="3"/><path d="M-12 -14 Q0 -22 12 -14" fill="none" stroke="#8a8fa0" stroke-width="4" stroke-linecap="round"/></g>`
const shawl = `<path d="M28 62 Q50 50 72 62 L70 72 Q50 62 30 72 Z" fill="#c97a8c" stroke="#8f4a5e" stroke-width="1.6"/>`
const pie = `<g transform="translate(70 76)"><ellipse rx="10" ry="4" fill="#c98a4a" stroke="#8f5a2a" stroke-width="1.4"/><path d="M-10 0 Q0 -8 10 0" fill="#e2b06a" stroke="#8f5a2a" stroke-width="1.4"/></g>`

/** Lumen: a little glowworm with a bright tail and big shy eyes. */
const lumen =
  shadow +
  halo(66, 80, 18, '#c8f06a') +
  `<path d="M24 84 C30 70 46 70 52 78 C58 86 68 86 72 78" fill="none" stroke="#9ab45a" stroke-width="16" stroke-linecap="round"/>` +
  `<path d="M24 84 C30 70 46 70 52 78 C58 86 68 86 72 78" fill="none" stroke="#b8d06a" stroke-width="10" stroke-linecap="round"/>` +
  `<circle cx="74" cy="78" r="9" fill="#e6ff8a" stroke="#9ab45a" stroke-width="2"/>` +
  `<circle cx="30" cy="62" r="16" fill="#b8d06a" stroke="#7a9440" stroke-width="2"/>` +
  `<circle cx="24" cy="58" r="5" fill="#2e2420"/><circle cx="36" cy="58" r="5" fill="#2e2420"/>` +
  `<circle cx="25.5" cy="56.5" r="1.8" fill="white"/><circle cx="37.5" cy="56.5" r="1.8" fill="white"/>` +
  `<path d="M26 70 Q30 68 34 70" fill="none" stroke="#5e7a2a" stroke-width="1.6" stroke-linecap="round"/>` +
  `<path d="M24 48 Q20 38 16 38 M36 48 Q40 38 44 38" fill="none" stroke="#7a9440" stroke-width="2" stroke-linecap="round"/>`

export const CAVES_PEOPLE_ART: Record<string, string> = {
  'char-digby': mole({ fur: '#6e5e70', top: goggles, front: wrench }),
  'char-lumen': lumen,
  'villager-nibs': mole({ fur: '#7a6a74', top: lampHat, front: lantern }),
  'villager-pickworth': mole({ fur: '#5e5468', top: lampHat, front: pickaxe }),
  'villager-granny-burrow': mole({ fur: '#8a7e86', wear: shawl, front: pie }),
}

// ---------------------------------------------------------------------------------------------
// Spirit, creatures, pirates, mount, curios, spell

const quartz =
  `<ellipse cx="50" cy="92" rx="38" ry="6" fill="#3a5a8a" opacity="0.4"/>` +
  halo(50, 54, 40, '#8ee0f0') +
  `<g class="sway">${gem(50, 92, 30, 76, '#c8f0fa', 0)}${gem(28, 92, 16, 40, '#9ad8ec', -14)}${gem(72, 92, 16, 40, '#9ad8ec', 14)}</g>` +
  `<path d="M44 48 Q46 46 48 48 M52 48 Q54 46 56 48" fill="none" stroke="#2e4a6a" stroke-width="1.8" stroke-linecap="round"/>` +
  `<path d="M46 56 Q50 58 54 56" fill="none" stroke="#2e4a6a" stroke-width="1.6" stroke-linecap="round"/>` +
  `<g fill="none" stroke="#c8f0fa" stroke-width="1.2" opacity="0.7"><path d="M14 40 q-4 6 0 12"/><path d="M8 36 q-6 10 0 20"/><path d="M86 40 q4 6 0 12"/><path d="M92 36 q6 10 0 20"/></g>`

const spider =
  `<g stroke="#d6dcec" stroke-width="0.8" fill="none" opacity="0.8">` +
  [0, 30, 60, 90, 120, 150]
    .map((a) => `<path transform="rotate(${a} 50 50)" d="M50 4 L50 96"/>`)
    .join('') +
  [14, 26, 38].map((r) => `<circle cx="50" cy="50" r="${r}"/>`).join('') +
  `</g>` +
  `<g stroke="#2e2a3a" stroke-width="3" stroke-linecap="round" fill="none"><path d="M42 50 Q28 40 22 46 M42 54 Q26 54 20 62 M44 58 Q32 66 28 74 M58 50 Q72 40 78 46 M58 54 Q74 54 80 62 M56 58 Q68 66 72 74"/></g>` +
  `<ellipse cx="50" cy="58" rx="12" ry="14" fill="#3a3550" stroke="#1e1a2a" stroke-width="2"/>` +
  `<circle cx="50" cy="42" r="9" fill="#4a4566" stroke="#1e1a2a" stroke-width="2"/>` +
  `<circle cx="46" cy="41" r="2.4" fill="#e0485a"/><circle cx="54" cy="41" r="2.4" fill="#e0485a"/><circle cx="48" cy="37" r="1.4" fill="#e0485a"/><circle cx="52" cy="37" r="1.4" fill="#e0485a"/>`

const rockfall =
  `<ellipse cx="50" cy="92" rx="40" ry="6" fill="#2e2a4a" opacity="0.25"/>` +
  [
    [30, 80, 16, '#8a8494'],
    [56, 76, 20, '#7a7486'],
    [76, 84, 13, '#948ea0'],
    [42, 60, 13, '#9a94a6'],
    [64, 56, 10, '#8a8494'],
  ]
    .map(
      ([x, y, r, c]) =>
        `<path d="M${(x as number) - (r as number)} ${y} L${(x as number) - (r as number) * 0.6} ${(y as number) - (r as number) * 0.8} L${(x as number) + (r as number) * 0.5} ${(y as number) - (r as number)} L${(x as number) + (r as number)} ${(y as number) - (r as number) * 0.2} L${(x as number) + (r as number) * 0.7} ${(y as number) + (r as number) * 0.6} L${(x as number) - (r as number) * 0.6} ${(y as number) + (r as number) * 0.6} Z" fill="${c}" stroke="#4e4a5a" stroke-width="2"/>`,
    )
    .join('') +
  `<g fill="#b8b2c4"><circle cx="20" cy="40" r="2"/><circle cx="80" cy="34" r="1.6"/><circle cx="60" cy="24" r="1.4"/></g>`

const silverfish =
  `<path d="M14 60 C30 46 60 44 80 54 C70 64 40 70 14 60 Z" fill="#b8bcc8" stroke="#6e7280" stroke-width="2.6"/>` +
  [28, 40, 52, 64]
    .map((x) => `<path d="M${x} 50 L${x - 2} 66" stroke="#8a8fa0" stroke-width="1.6"/>`)
    .join('') +
  `<path d="M80 54 L94 46 M80 56 L94 60 M14 60 L4 54 M14 60 L4 66" stroke="#6e7280" stroke-width="2" stroke-linecap="round"/>` +
  `<circle cx="74" cy="52" r="2.4" fill="#2e2420"/>`

const smugglers =
  shadow +
  `<path d="M30 6 L36 30 L42 6 Z M58 6 L64 26 L70 6 Z" fill="#8a8494" stroke="#4e4a5a" stroke-width="1.4"/>` +
  `<path d="M50 6 L50 26" stroke="#c9ccd6" stroke-width="1" stroke-dasharray="2 2"/>` +
  `<ellipse cx="36" cy="44" rx="10" ry="6" transform="rotate(-25 36 44)" fill="#e6e9f0" stroke="#9aa2b4" stroke-width="1.4" opacity="0.9"/><ellipse cx="64" cy="44" rx="10" ry="6" transform="rotate(25 64 44)" fill="#e6e9f0" stroke="#9aa2b4" stroke-width="1.4" opacity="0.9"/>` +
  `<path d="M40 62 Q50 58 60 62 L62 82 Q50 86 38 82 Z" fill="#3a3550" stroke="#1e1a2a" stroke-width="1.6"/>` +
  `<path d="M40 68 L60 76" stroke="#8ee0f0" stroke-width="2.4"/>` +
  `<circle cx="50" cy="48" r="11" fill="#e8c9a8" stroke="#c4a487" stroke-width="1.6"/>` +
  `<path d="M38 46 Q50 30 62 46 Q50 40 38 46 Z" fill="#3a3550" stroke="#1e1a2a" stroke-width="1.4"/>` +
  `<path d="M42 48 L58 48" stroke="#1e1a2a" stroke-width="4"/><circle cx="46" cy="48" r="1.8" fill="#8ee0f0"/><circle cx="54" cy="48" r="1.8" fill="#8ee0f0"/>` +
  `<path d="M46 54 Q50 56 54 54" fill="none" stroke="#a8604a" stroke-width="1.2"/>` +
  `<path d="M60 64 L76 54" stroke="#9c958a" stroke-width="2.4" stroke-linecap="round"/>`

const stalactiteCamp =
  `<ellipse cx="50" cy="90" rx="40" ry="6" fill="#2e2a4a" opacity="0.25"/>` +
  `<path d="M14 0 L86 0 L80 14 L74 34 L68 14 L60 40 L52 14 L44 46 L36 14 L28 30 L22 10 Z" fill="#7a7486" stroke="#4e4a5a" stroke-width="2"/>` +
  `<path d="M30 52 Q50 44 70 52 L66 88 Q50 92 34 88 Z" fill="#3a3550" stroke="#1e1a2a" stroke-width="2.2"/>` +
  `<path d="M44 88 C44 76 47 70 50 70 C53 70 56 76 56 88 Z" fill="#14121e"/>` +
  `<circle cx="38" cy="64" r="2.4" fill="#8ee0f0"/><circle cx="62" cy="62" r="2.4" fill="#8ee0f0"/>` +
  `<path d="M50 52 L50 30 M50 30 L64 34 L50 38" fill="#3a3550" stroke="#1e1a2a" stroke-width="1.4"/>`

const glowworm = (wild: boolean) =>
  `<ellipse cx="50" cy="90" rx="30" ry="5" fill="#2e2a4a" opacity="0.2"/>` +
  halo(76, 70, 22, '#c8f06a') +
  `<g class="${wild ? 'sway' : ''}">` +
  `<path d="M18 80 C26 60 46 60 54 70 C62 80 72 80 78 70" fill="none" stroke="#9ab45a" stroke-width="20" stroke-linecap="round"/>` +
  `<path d="M18 80 C26 60 46 60 54 70 C62 80 72 80 78 70" fill="none" stroke="#b8d06a" stroke-width="13" stroke-linecap="round"/>` +
  `<circle cx="80" cy="70" r="11" fill="#e6ff8a" stroke="#9ab45a" stroke-width="2"/>` +
  `</g>` +
  `<circle cx="22" cy="54" r="18" fill="#b8d06a" stroke="#7a9440" stroke-width="2.2"/>` +
  `<circle cx="16" cy="50" r="5" fill="#2e2420"/><circle cx="28" cy="50" r="5" fill="#2e2420"/>` +
  `<circle cx="17.5" cy="48.5" r="1.8" fill="white"/><circle cx="29.5" cy="48.5" r="1.8" fill="white"/>` +
  `<path d="M17 62 Q22 66 27 62" fill="none" stroke="#5e7a2a" stroke-width="1.8" stroke-linecap="round"/>` +
  (wild
    ? ''
    : `<path d="M40 60 Q50 54 60 62 L58 68 Q50 62 42 66 Z" fill="#c97a3a" stroke="#8f5426" stroke-width="1.4"/>`)

const curio = (inner: string) =>
  `<circle cx="50" cy="50" r="44" fill="#e9ddff" opacity="0.5"/>` +
  `<circle cx="50" cy="50" r="36" fill="#fffaf0" stroke="#cdbbf5" stroke-width="3"/>` +
  inner

const spyglass = curio(
  `<g transform="rotate(-30 50 50)"><rect x="22" y="44" width="22" height="12" rx="3" fill="#c9a24a" stroke="#8a6a2a" stroke-width="2"/><rect x="42" y="42" width="20" height="16" rx="3" fill="#d9b25a" stroke="#8a6a2a" stroke-width="2"/><rect x="60" y="40" width="16" height="20" rx="3" fill="#e2c26a" stroke="#8a6a2a" stroke-width="2"/><circle cx="76" cy="50" r="8" fill="#bfe8ff" stroke="#8a6a2a" stroke-width="2"/></g>`,
)

const nightlightJar = curio(
  halo(50, 56, 22, '#c8f06a') +
    `<rect x="36" y="36" width="28" height="36" rx="8" fill="#eef8ff" stroke="#8ab0c8" stroke-width="2.4" opacity="0.95"/>` +
    `<rect x="38" y="30" width="24" height="8" rx="3" fill="#c9a77f" stroke="#9a7a55" stroke-width="1.6"/>` +
    `<circle cx="50" cy="56" r="7" fill="#e6ff8a"/>`,
)

const heartstone = curio(
  halo(50, 52, 22, '#f7a6c0') +
    `<path d="M50 74 C28 58 30 36 42 34 C47 33 50 38 50 41 C50 38 53 33 58 34 C70 36 72 58 50 74 Z" fill="#e0607e" stroke="#9a3a52" stroke-width="2.4"/>` +
    `<path d="M50 41 L50 72 M36 46 L64 46" stroke="#f7a6c0" stroke-width="1.2" opacity="0.8"/>` +
    `<path d="M40 42 Q44 38 48 40" fill="none" stroke="white" stroke-width="2.4" stroke-linecap="round"/>`,
)

const minersLamp = curio(
  halo(50, 50, 22, '#ffe59e') +
    `<path d="M50 20 L50 28 M44 22 Q50 16 56 22" fill="none" stroke="#5e4428" stroke-width="2"/>` +
    `<rect x="38" y="28" width="24" height="5" rx="2" fill="#5e4428"/>` +
    `<path d="M40 33 L60 33 L62 70 L38 70 Z" fill="#ffe59e" stroke="#a87e1a" stroke-width="2.2"/>` +
    `<circle cx="50" cy="52" r="7" fill="#ffb84f"/>` +
    `<rect x="36" y="70" width="28" height="5" rx="2" fill="#5e4428"/>`,
)

const webUnweave =
  `<circle cx="50" cy="50" r="44" fill="#7fe0b0" opacity="0.25"/>` +
  `<circle cx="50" cy="50" r="36" fill="#f1ecff" stroke="#7fe0b0" stroke-width="4"/>` +
  `<g stroke="#5a8a9a" stroke-width="1.4" fill="none">${[0, 45, 90, 135]
    .map((a) => `<path transform="rotate(${a} 50 50)" d="M50 24 L50 76"/>`)
    .join(
      '',
    )}<circle cx="50" cy="50" r="10"/><circle cx="50" cy="50" r="18" stroke-dasharray="4 4"/></g>` +
  `<path d="M60 36 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 Z" fill="#7fe0b0"/>`

export const CAVES_MISC_ART: Record<string, string> = {
  'spirit-quartz': quartz,
  'creature-spider': spider,
  'creature-rockfall': rockfall,
  'pest-silverfish': silverfish,
  'crew-stalactite-smugglers': smugglers,
  'camp-stalactite-smugglers': stalactiteCamp,
  'mount-glowworm': glowworm(false),
  'mount-glowworm-wild': glowworm(true),
  'curio-brass-spyglass': spyglass,
  'curio-nightlight-jar': nightlightJar,
  'curio-heartstone': heartstone,
  'curio-miners-lamp': minersLamp,
  'spell-web-unweave': webUnweave,
}
