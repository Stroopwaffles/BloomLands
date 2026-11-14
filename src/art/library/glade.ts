/**
 * Moonlit Glade art (content doc → Region 6, and the Asset List). Same 100×100 storybook style.
 * Palette: midnight blue, silver, lavender, moonlight white, and the glowing magic style.
 */
import { ITEM_TEMPLATES } from './items'

const { shade, bottle, leafPile, petalPile, symbol } = ITEM_TEMPLATES

const shadow = `<ellipse cx="50" cy="91" rx="26" ry="5" fill="#2e2a4a" opacity="0.18"/>`
const ground = `<ellipse cx="50" cy="97" rx="18" ry="3" fill="#3a3550" opacity="0.3"/>`
const halo = (x: number, y: number, r: number, color: string) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" opacity="0.3"/>`
const sparkle = (x: number, y: number, s = 1, color = '#fff3b0') =>
  `<path transform="translate(${x} ${y}) scale(${s})" d="M0 -6 L1.5 -1.5 L6 0 L1.5 1.5 L0 6 L-1.5 1.5 L-6 0 L-1.5 -1.5 Z" fill="${color}"/>`
const stem = (x: number, top: number, color = '#5a7a8a') =>
  `<path d="M${x} 97 Q${x - 2} ${(97 + top) / 2} ${x} ${top}" fill="none" stroke="${color}" stroke-width="2.2"/>`

/** A five-petal night flower. */
const flower = (x: number, y: number, r: number, petal: string, centre: string, glow = false) =>
  (glow ? halo(x, y, r * 1.9, petal) : '') +
  [0, 72, 144, 216, 288]
    .map(
      (a) =>
        `<ellipse cx="${x}" cy="${y - r * 0.62}" rx="${r * 0.42}" ry="${r * 0.62}" fill="${petal}" stroke="${shade(petal, 0.7)}" stroke-width="1" transform="rotate(${a} ${x} ${y})"/>`,
    )
    .join('') +
  `<circle cx="${x}" cy="${y}" r="${r * 0.28}" fill="${centre}"/>`

// ---------------------------------------------------------------------------------------------
// Plants

const starmoss =
  ground +
  `<g class="sway">` +
  [
    [32, 88, 14],
    [52, 90, 18],
    [70, 88, 13],
  ]
    .map(
      ([x, y, r]) =>
        `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.55}" fill="#4f7a8a" stroke="#2e4e5e" stroke-width="1.6"/>`,
    )
    .join('') +
  sparkle(36, 82, 0.6) +
  sparkle(54, 80, 0.8, '#e8e4ff') +
  sparkle(68, 84, 0.5) +
  `</g>`

const nightJasmine =
  ground +
  `<g class="sway">${stem(50, 44, '#4f6e5e')}` +
  `<path d="M50 74 Q36 68 30 74 Q38 80 50 76 M50 62 Q64 56 70 62 Q62 68 50 64" fill="#5f8a6a" stroke="#3e5e4a" stroke-width="1.2"/>` +
  flower(42, 46, 8, '#fdfbff', '#f2e3a8', true) +
  flower(58, 38, 7, '#f4f0ff', '#f2e3a8', true) +
  flower(52, 56, 6, '#ffffff', '#f2e3a8') +
  `</g>`

const eveningPrimrose =
  ground +
  `<g class="sway">${stem(46, 50, '#5a7a5a')}${stem(58, 58, '#5a7a5a')}` +
  flower(46, 48, 11, '#f7e6a0', '#e2b94f') +
  flower(58, 58, 8, '#f9eeb8', '#e2b94f') +
  `</g>`

const moonpetal =
  ground +
  `<g class="sway">${stem(50, 46, '#6a7a9a')}` +
  halo(50, 42, 20, '#dfe4ff') +
  `<path d="M50 42 C36 34 34 18 50 14 C66 18 64 34 50 42 Z" fill="#eef0ff" stroke="#9aa4d8" stroke-width="1.4"/>` +
  `<path d="M50 42 C40 50 26 46 24 36 C34 30 44 34 50 42 Z M50 42 C60 50 74 46 76 36 C66 30 56 34 50 42 Z" fill="#e2e6ff" stroke="#9aa4d8" stroke-width="1.4"/>` +
  `<circle cx="50" cy="40" r="3" fill="#fff3b0"/>` +
  `</g>`

const moonbeam =
  `<path d="M40 0 L60 0 L66 96 L34 96 Z" fill="#eef0ff" opacity="0.35"/>` +
  `<path d="M46 0 L54 0 L58 96 L42 96 Z" fill="#ffffff" opacity="0.45"/>` +
  `<g class="sway">${sparkle(50, 40, 1.4, '#ffffff')}${sparkle(44, 64, 0.8)}${sparkle(57, 80, 0.7)}</g>`

const silverleafFern =
  ground +
  `<g class="sway">` +
  [
    [36, -24],
    [50, 0],
    [64, 24],
  ]
    .map(
      ([x, tilt]) =>
        `<g transform="rotate(${tilt} ${x} 96)"><path d="M${x} 96 Q${x - 2} 60 ${x} 28" fill="none" stroke="#7a8aa8" stroke-width="2"/>` +
        Array.from({ length: 6 }, (_, i) => {
          const y = 86 - i * 10
          const w = 12 - i * 1.4
          return `<path d="M${x} ${y} Q${x - w} ${y - 4} ${x - w - 2} ${y - 10} M${x} ${y} Q${x + w} ${y - 4} ${x + w + 2} ${y - 10}" fill="none" stroke="#c9d4ea" stroke-width="3" stroke-linecap="round"/>`
        }).join('') +
        `</g>`,
    )
    .join('') +
  `</g>`

const midnightRose =
  ground +
  `<g class="sway">${stem(50, 42, '#3e5a4a')}` +
  `<path d="M50 72 Q38 66 34 72 Q42 78 50 74" fill="#3e6a4e" stroke="#2a4a36" stroke-width="1.2"/>` +
  halo(50, 36, 18, '#8a6ad8') +
  `<circle cx="50" cy="36" r="13" fill="#3a2a7a" stroke="#1e1450" stroke-width="2"/>` +
  `<path d="M42 36 Q50 26 58 36 Q50 44 42 36 Z M46 34 Q50 30 54 34" fill="#5a3aa8" stroke="#2a1a68" stroke-width="1.2"/>` +
  sparkle(60, 28, 0.6) +
  `</g>`

const stardustBloom =
  ground +
  `<g class="sway">${stem(50, 46, '#6a7a9a')}` +
  halo(50, 40, 24, '#fff3b0') +
  `<path d="M50 20 L55 35 L70 36 L58 45 L62 60 L50 51 L38 60 L42 45 L30 36 L45 35 Z" fill="#fff3c4" stroke="#d9a441" stroke-width="1.6"/>` +
  sparkle(30, 26, 0.7) +
  sparkle(72, 30, 0.8) +
  sparkle(66, 58, 0.5) +
  `</g>`

const sleepyPoppy =
  ground +
  `<g class="sway">${stem(48, 48, '#5a6e5a')}` +
  `<path d="M48 50 Q30 46 30 34 Q36 24 48 32 Q60 24 66 34 Q66 46 48 50 Z" fill="#c78ad8" stroke="#8a4aa0" stroke-width="1.6"/>` +
  `<circle cx="48" cy="40" r="4" fill="#3a2a4a"/>` +
  `<text x="64" y="26" font-size="10" font-family="sans-serif" font-weight="700" fill="#cfd8f5">z</text>` +
  `<text x="70" y="18" font-size="7" font-family="sans-serif" font-weight="700" fill="#cfd8f5">z</text>` +
  `</g>`

export const GLADE_PLANT_ART: Record<string, string> = {
  'plant-starmoss': starmoss,
  'plant-night-jasmine': nightJasmine,
  'plant-evening-primrose': eveningPrimrose,
  'plant-moonpetal': moonpetal,
  'plant-moonbeam': moonbeam,
  'plant-silverleaf-fern': silverleafFern,
  'plant-midnight-rose': midnightRose,
  'plant-stardust-bloom': stardustBloom,
  'plant-sleepy-poppy': sleepyPoppy,
}

// ---------------------------------------------------------------------------------------------
// Items

const moonlightJar =
  shadow +
  `<rect x="30" y="30" width="40" height="56" rx="10" fill="#eef6ff" stroke="#8a9ad8" stroke-width="2.4"/>` +
  `<rect x="34" y="22" width="32" height="10" rx="3" fill="#c9d4ea" stroke="#8a9ad8" stroke-width="2"/>` +
  halo(50, 60, 16, '#ffffff') +
  `<path d="M56 50 A12 12 0 1 0 56 72 A9 9 0 1 1 56 50 Z" fill="#fff3c4"/>` +
  sparkle(40, 44, 0.5)

const stardustPile =
  shadow +
  halo(50, 74, 22, '#fff3b0') +
  `<path d="M24 86 Q50 60 76 86 Z" fill="#f2e3a8" stroke="#c9a24a" stroke-width="2"/>` +
  sparkle(40, 72, 0.7) +
  sparkle(56, 66, 0.9, '#ffffff') +
  sparkle(64, 78, 0.6)

const starLens =
  shadow +
  halo(50, 54, 30, '#c8d8ff') +
  `<circle cx="50" cy="54" r="22" fill="#dfe8ff" stroke="#6a7ab8" stroke-width="3"/>` +
  `<circle cx="50" cy="54" r="15" fill="#eef4ff" stroke="#9aa4d8" stroke-width="1.4"/>` +
  `<path d="M50 42 L52.5 51 L62 54 L52.5 57 L50 66 L47.5 57 L38 54 L47.5 51 Z" fill="#fff3b0"/>` +
  `<path d="M40 44 Q44 40 49 40" fill="none" stroke="white" stroke-width="2.4" stroke-linecap="round"/>`

const pearl =
  shadow +
  `<circle cx="50" cy="62" r="20" fill="#f6f4fb" stroke="#b8b2cc" stroke-width="2.4"/>` +
  `<circle cx="43" cy="55" r="6" fill="white" opacity="0.9"/>` +
  `<circle cx="56" cy="70" r="5" fill="#e2dcf0" opacity="0.8"/>`

const silverSpoon =
  shadow +
  `<g transform="rotate(-35 50 60)"><ellipse cx="50" cy="38" rx="11" ry="15" fill="#e2e6f0" stroke="#8a90a8" stroke-width="2.2"/>` +
  `<rect x="47" y="52" width="6" height="36" rx="3" fill="#e2e6f0" stroke="#8a90a8" stroke-width="2"/>` +
  `<path d="M45 32 Q47 28 51 28" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"/></g>`

const musicBoxKey =
  shadow +
  `<g transform="rotate(-20 50 60)"><path d="M38 34 C30 26 30 18 38 18 C42 18 46 22 50 30 C54 22 58 18 62 18 C70 18 70 26 62 34 Z" fill="#d9b25a" stroke="#8a6a2a" stroke-width="2.2"/>` +
  `<rect x="47" y="32" width="6" height="40" fill="#d9b25a" stroke="#8a6a2a" stroke-width="2"/>` +
  `<path d="M53 60 L60 60 M53 68 L58 68" stroke="#8a6a2a" stroke-width="3"/></g>`

export const GLADE_ITEM_ART: Record<string, string> = {
  'raw-starmoss': leafPile('#4f7a8a'),
  'raw-jasmine-blossoms': petalPile('#fdfbff'),
  'raw-primrose-petals': petalPile('#f7e6a0'),
  'raw-moonpetals': petalPile('#e2e6ff'),
  'raw-moonlight': moonlightJar,
  'raw-silver-fronds': leafPile('#c9d4ea'),
  'raw-midnight-petals': petalPile('#4a2a9a'),
  'raw-stardust': stardustPile,
  'raw-poppy-petals': petalPile('#c78ad8'),
  'refined-moonpetal-oil': bottle('#e2e6ff', 'drop', 'round'),
  'refined-moonlight-tincture': bottle('#fff3c4', 'star', 'tall'),
  'component-moon-draught': bottle('#8a9ad8', 'star', 'flask'),
  'component-starlight-lens': starLens,
  'component-everbloom-essence': halo(50, 64, 28, '#c8f0b0') + bottle('#9ccc72', 'leaf', 'flask'),
  'potion-moonsight': bottle('#b8c4f0', 'star', 'round'),
  'trinket-pearl': pearl,
  'trinket-silver-spoon': silverSpoon,
  'trinket-music-box-key': musicBoxKey,
}

// ---------------------------------------------------------------------------------------------
// People: fireflies and a moth poet

interface FireflyLook {
  body: string
  glow?: string
  top?: string
  front?: string
  beard?: boolean
}

const firefly = ({ body, glow = '#fff3b0', top = '', front = '', beard = false }: FireflyLook) =>
  shadow +
  halo(50, 78, 18, glow) +
  `<ellipse cx="30" cy="54" rx="14" ry="8" fill="#eef4ff" stroke="#9aa4c8" stroke-width="1.4" opacity="0.85" transform="rotate(-25 30 54)"/>` +
  `<ellipse cx="70" cy="54" rx="14" ry="8" fill="#eef4ff" stroke="#9aa4c8" stroke-width="1.4" opacity="0.85" transform="rotate(25 70 54)"/>` +
  `<ellipse cx="50" cy="78" rx="13" ry="12" fill="${glow}" stroke="#d9a441" stroke-width="1.8"/>` +
  `<ellipse cx="50" cy="62" rx="15" ry="12" fill="${body}" stroke="${shade(body, 0.6)}" stroke-width="2"/>` +
  `<circle cx="50" cy="40" r="15" fill="${body}" stroke="${shade(body, 0.6)}" stroke-width="2"/>` +
  `<path d="M44 26 Q40 16 34 14 M56 26 Q60 16 66 14" fill="none" stroke="${shade(body, 0.6)}" stroke-width="1.6"/>` +
  `<circle cx="34" cy="14" r="2.4" fill="${glow}"/><circle cx="66" cy="14" r="2.4" fill="${glow}"/>` +
  `<circle cx="44" cy="40" r="4" fill="#2e2420"/><circle cx="56" cy="40" r="4" fill="#2e2420"/>` +
  `<circle cx="45" cy="38.6" r="1.4" fill="white"/><circle cx="57" cy="38.6" r="1.4" fill="white"/>` +
  (beard
    ? `<path d="M40 46 Q50 64 60 46 Q56 50 50 50 Q44 50 40 46 Z" fill="#eef0f6" stroke="#a8acc0" stroke-width="1.2"/>`
    : `<path d="M46 47 Q50 50 54 47" fill="none" stroke="#2e2420" stroke-width="1.6" stroke-linecap="round"/>`) +
  top +
  front

const lampCane = `<g transform="translate(72 60)"><path d="M0 -24 L0 26" stroke="#7a5a3a" stroke-width="2.4"/><path d="M0 -24 Q8 -26 8 -18" fill="none" stroke="#7a5a3a" stroke-width="2"/><rect x="4" y="-18" width="8" height="10" rx="2" fill="#ffe59e" stroke="#a87e1a" stroke-width="1.4"/></g>`
const nightcapTop = `<path d="M36 30 Q50 14 66 26 Q74 18 80 24" fill="#5a4a9a" stroke="#3a2a6a" stroke-width="1.6"/><circle cx="80" cy="24" r="3" fill="#eef0ff"/>`
const lanternFront = `<g transform="translate(70 72)"><path d="M0 -14 L0 -8" stroke="#5e4428" stroke-width="1.6"/><rect x="-7" y="-8" width="14" height="16" rx="3" fill="#ffe59e" stroke="#a87e1a" stroke-width="1.6"/><circle cx="0" cy="0" r="3.5" fill="#ffb84f"/></g>`
const ribbonHat = `<path d="M36 30 Q50 22 64 30 L60 24 Q50 18 40 24 Z" fill="#f7a6c0" stroke="#c97a8c" stroke-width="1.4"/>`
const yarn = `<g transform="translate(70 76)"><circle r="7" fill="#9a86cf" stroke="#5a4a9a" stroke-width="1.4"/><path d="M-5 -3 Q0 2 5 -3 M-5 2 Q0 6 5 2" fill="none" stroke="#5a4a9a" stroke-width="1"/></g>`
const taper = `<g transform="translate(72 66)"><rect x="-2" y="-6" width="4" height="18" fill="#fdfbff" stroke="#c9c2d8" stroke-width="1"/><path d="M0 -6 Q-3 -11 0 -15 Q3 -11 0 -6 Z" fill="#ffb84f"/></g>`

const vesper =
  shadow +
  `<path d="M50 52 C26 30 10 44 18 64 C24 76 40 70 50 62 Z" fill="#c9b8e8" stroke="#7a68a8" stroke-width="1.8"/>` +
  `<path d="M50 52 C74 30 90 44 82 64 C76 76 60 70 50 62 Z" fill="#c9b8e8" stroke="#7a68a8" stroke-width="1.8"/>` +
  `<circle cx="28" cy="54" r="5" fill="#8a76c0" opacity="0.6"/><circle cx="72" cy="54" r="5" fill="#8a76c0" opacity="0.6"/>` +
  `<ellipse cx="50" cy="68" rx="10" ry="18" fill="#e9e2f6" stroke="#9a8ac0" stroke-width="1.8"/>` +
  `<circle cx="50" cy="40" r="13" fill="#e9e2f6" stroke="#9a8ac0" stroke-width="1.8"/>` +
  `<path d="M45 28 Q38 14 28 14 Q36 20 40 30 M55 28 Q62 14 72 14 Q64 20 60 30" fill="#d8ccf0" stroke="#9a8ac0" stroke-width="1.2"/>` +
  `<path d="M43 40 Q45 38 47 40 M53 40 Q55 38 57 40" fill="none" stroke="#2e2420" stroke-width="1.8" stroke-linecap="round"/>` +
  `<path d="M38 30 Q50 22 62 30 L56 26 Q50 24 44 26 Z" fill="#5a4a9a" stroke="#3a2a6a" stroke-width="1.2"/>` +
  `<g transform="translate(66 74) rotate(30)"><path d="M0 -16 C8 -10 6 4 0 10 C-2 2 -4 -8 0 -16 Z" fill="#fdfbff" stroke="#9a8ac0" stroke-width="1.2"/><path d="M0 -14 L0 14" stroke="#7a68a8" stroke-width="1"/></g>`

export const GLADE_PEOPLE_ART: Record<string, string> = {
  'char-nox': firefly({
    body: '#5a5f7a',
    glow: '#f2c45c',
    top: nightcapTop,
    front: lampCane,
    beard: true,
  }),
  'char-vesper': vesper,
  'villager-flicker': firefly({ body: '#4a5a8a', front: lanternFront, top: ribbonHat }),
  'villager-ember': firefly({ body: '#6a5a8a', glow: '#ffd08a', front: yarn }),
  'villager-pipwick': firefly({ body: '#3e5a8a', glow: '#fff3c4', front: taper }),
}

// ---------------------------------------------------------------------------------------------
// Spirit, creatures, pirates, mounts, curios, spell

const selenne =
  `<ellipse cx="50" cy="74" rx="44" ry="18" fill="#2e3a7a" stroke="#1a2250" stroke-width="2"/>` +
  `<ellipse cx="50" cy="72" rx="38" ry="13" fill="#3e4a9a"/>` +
  halo(50, 44, 34, '#e8ecff') +
  `<circle cx="50" cy="44" r="24" fill="#f4f2ff" stroke="#b8bce8" stroke-width="2"/>` +
  `<circle cx="42" cy="36" r="4" fill="#dcdcf4"/><circle cx="60" cy="52" r="5" fill="#dcdcf4"/>` +
  `<path d="M40 44 Q43 41 46 44 M54 44 Q57 41 60 44" fill="none" stroke="#5a5f9a" stroke-width="1.8" stroke-linecap="round"/>` +
  `<path d="M45 52 Q50 55 55 52" fill="none" stroke="#5a5f9a" stroke-width="1.6" stroke-linecap="round"/>` +
  `<ellipse cx="50" cy="74" rx="16" ry="4" fill="#f4f2ff" opacity="0.5"/>` +
  sparkle(18, 22, 0.8) +
  sparkle(82, 26, 0.6) +
  sparkle(76, 64, 0.5)

const moth = (x: number, y: number, s: number, c = '#d8ccb0') =>
  `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0 C-12 -12 -20 -2 -14 6 C-8 10 -2 6 0 2 Z M0 0 C12 -12 20 -2 14 6 C8 10 2 6 0 2 Z" fill="${c}" stroke="${shade(c, 0.6)}" stroke-width="1.4"/><ellipse cx="0" cy="3" rx="2.4" ry="6" fill="${shade(c, 0.7)}"/><path d="M-1 -3 L-5 -9 M1 -3 L5 -9" stroke="${shade(c, 0.6)}" stroke-width="1"/></g>`

const mothSwarm =
  shadow +
  halo(50, 54, 30, '#e8ecff') +
  moth(34, 40, 1, '#d8ccb0') +
  moth(62, 34, 0.9, '#c9bca0') +
  moth(50, 58, 1.2, '#e2d6bc') +
  moth(26, 66, 0.8, '#c9bca0') +
  moth(72, 64, 0.9, '#d8ccb0')

const earwig =
  `<ellipse cx="50" cy="56" rx="10" ry="22" fill="#8a5a3a" stroke="#4e2e1a" stroke-width="2"/>` +
  `<path d="M42 50 L50 48 L58 50 M42 60 L50 58 L58 60" stroke="#4e2e1a" stroke-width="1.2" fill="none"/>` +
  `<path d="M46 78 Q40 90 46 94 M54 78 Q60 90 54 94" fill="none" stroke="#4e2e1a" stroke-width="3" stroke-linecap="round"/>` +
  `<circle cx="50" cy="34" r="8" fill="#6a3e24" stroke="#4e2e1a" stroke-width="1.6"/>` +
  `<path d="M46 28 Q40 18 34 16 M54 28 Q60 18 66 16" fill="none" stroke="#4e2e1a" stroke-width="1.4"/>` +
  `<path d="M40 50 L30 46 M40 58 L30 60 M60 50 L70 46 M60 58 L70 60" stroke="#4e2e1a" stroke-width="1.6"/>`

const moonshadowCrew =
  shadow +
  `<path d="M24 60 Q14 46 20 36 Q30 44 34 56 Z M76 60 Q86 46 80 36 Q70 44 66 56 Z" fill="#5a5f9a" opacity="0.7" stroke="#2e2a5a" stroke-width="1.2"/>` +
  `<path d="M32 90 Q30 56 50 48 Q70 56 68 90 Z" fill="#2a2850" stroke="#14123a" stroke-width="2"/>` +
  `<circle cx="50" cy="42" r="14" fill="#2a2850" stroke="#14123a" stroke-width="2"/>` +
  `<ellipse cx="50" cy="44" rx="9" ry="7" fill="#1a183a"/>` +
  `<circle cx="46" cy="44" r="2" fill="#fff3b0"/><circle cx="54" cy="44" r="2" fill="#fff3b0"/>` +
  `<path d="M38 30 Q50 20 62 30 L58 32 Q50 28 42 32 Z" fill="#14123a"/>` +
  `<path d="M56 24 A5 5 0 1 0 60 30 A4 4 0 1 1 56 24 Z" fill="#e8ecff"/>`

const moonshadowCamp =
  `<ellipse cx="50" cy="90" rx="40" ry="6" fill="#14123a" opacity="0.3"/>` +
  `<path d="M14 88 L50 22 L86 88 Z" fill="#2a2850" stroke="#14123a" stroke-width="2.4"/>` +
  `<path d="M42 88 L50 56 L58 88 Z" fill="#14123a"/>` +
  `<path d="M50 22 L50 8" stroke="#5a5f9a" stroke-width="2"/>` +
  `<path d="M50 8 L64 12 L50 16 Z" fill="#5a5f9a"/>` +
  `<path d="M60 40 A6 6 0 1 0 64 48 A4.6 4.6 0 1 1 60 40 Z" fill="#e8ecff" opacity="0.8"/>`

const lunaMoth = (wild: boolean) =>
  `<ellipse cx="50" cy="90" rx="30" ry="5" fill="#2e2a4a" opacity="0.18"/>` +
  halo(50, 48, 34, '#e2ffe8') +
  `<g class="${wild ? 'sway' : ''}">` +
  `<path d="M50 44 C30 18 10 28 16 48 C20 58 36 56 50 50 Z M50 44 C70 18 90 28 84 48 C80 58 64 56 50 50 Z" fill="#c8f0d0" stroke="#5f9a6a" stroke-width="2"/>` +
  `<path d="M50 52 C38 60 30 74 34 88 C40 82 46 70 50 58 Z M50 52 C62 60 70 74 66 88 C60 82 54 70 50 58 Z" fill="#b8e8c4" stroke="#5f9a6a" stroke-width="1.8"/>` +
  `<circle cx="30" cy="40" r="5" fill="#f2e3a8" stroke="#a8946a" stroke-width="1.2"/><circle cx="70" cy="40" r="5" fill="#f2e3a8" stroke="#a8946a" stroke-width="1.2"/>` +
  `<ellipse cx="50" cy="50" rx="5" ry="14" fill="#f4f8ee" stroke="#a8b49a" stroke-width="1.4"/>` +
  `<path d="M48 38 Q42 26 36 24 M52 38 Q58 26 64 24" fill="none" stroke="#a8946a" stroke-width="1.4"/>` +
  `</g>`

const blueJay = (wild: boolean) =>
  `<ellipse cx="50" cy="90" rx="28" ry="5" fill="#2e2a4a" opacity="0.18"/>` +
  `<g class="${wild ? 'sway' : ''}">` +
  `<path d="M30 70 L14 86 L22 88 L36 76 Z" fill="#3a6ad8" stroke="#1e3e8a" stroke-width="1.6"/>` +
  `<ellipse cx="48" cy="62" rx="22" ry="17" fill="#4a7ae8" stroke="#1e3e8a" stroke-width="2"/>` +
  `<path d="M40 70 Q50 82 64 70 Q58 62 48 64 Z" fill="#eef2fb" stroke="#9aa4c8" stroke-width="1.2"/>` +
  `<path d="M34 56 Q46 48 58 60 Q48 64 34 56 Z" fill="#2a5ac8" stroke="#1e3e8a" stroke-width="1.4"/>` +
  `<path d="M38 58 L44 58 M42 54 L48 56 M46 60 L52 60" stroke="#14123a" stroke-width="1.6"/>` +
  `<circle cx="64" cy="42" r="13" fill="#4a7ae8" stroke="#1e3e8a" stroke-width="2"/>` +
  `<path d="M58 30 L60 18 L66 30 L70 22 L70 32 Z" fill="#3a6ad8" stroke="#1e3e8a" stroke-width="1.4"/>` +
  `<path d="M60 48 Q66 54 74 48" fill="none" stroke="#14123a" stroke-width="2"/>` +
  `<path d="M76 42 L88 45 L76 48 Z" fill="#2e2420"/>` +
  `<circle cx="68" cy="40" r="3" fill="#14123a"/><circle cx="69" cy="39" r="1" fill="white"/>` +
  `</g>`

const curio = (inner: string) =>
  `<circle cx="50" cy="50" r="44" fill="#dfe4ff" opacity="0.5"/>` +
  `<circle cx="50" cy="50" r="36" fill="#fffaf0" stroke="#9aa4d8" stroke-width="3"/>` +
  inner

const lamplightersWick = curio(
  halo(50, 36, 14, '#ffe59e') +
    `<rect x="42" y="44" width="16" height="30" rx="3" fill="#fdfbff" stroke="#c9c2d8" stroke-width="2"/>` +
    `<path d="M50 44 L50 36" stroke="#3a3550" stroke-width="2"/>` +
    `<path d="M50 36 Q44 28 50 18 Q56 28 50 36 Z" fill="#ffb84f" stroke="#e08a2a" stroke-width="1.2"/>` +
    `<path d="M34 76 Q50 70 66 76" fill="none" stroke="#a87e1a" stroke-width="3" stroke-linecap="round"/>`,
)

const mothWingQuill = curio(
  `<g transform="rotate(25 50 50)"><path d="M50 18 C64 30 62 60 50 80 C40 60 38 30 50 18 Z" fill="#d8ccf0" stroke="#7a68a8" stroke-width="2"/>` +
    `<path d="M50 20 L50 86" stroke="#5a4a9a" stroke-width="1.6"/>` +
    `<circle cx="50" cy="44" r="4" fill="#8a76c0" opacity="0.6"/></g>`,
)

const fallenStar = curio(
  halo(50, 50, 22, '#fff3b0') +
    `<path d="M50 24 L57 42 L76 43 L61 55 L66 74 L50 63 L34 74 L39 55 L24 43 L43 42 Z" fill="#fff3c4" stroke="#d9a441" stroke-width="2.2"/>` +
    sparkle(30, 30, 0.6) +
    sparkle(72, 70, 0.5),
)

const dreamcatcher = curio(
  `<circle cx="50" cy="44" r="18" fill="none" stroke="#a87e5a" stroke-width="3"/>` +
    `<path d="M50 26 L62 50 L38 50 Z M36 38 L64 38 L50 62 Z" fill="none" stroke="#c9b8e8" stroke-width="1.2"/>` +
    `<circle cx="50" cy="44" r="3" fill="#8a9ad8"/>` +
    `<path d="M40 62 L38 76 M50 62 L50 80 M60 62 L62 76" stroke="#a87e5a" stroke-width="1.4"/>` +
    `<ellipse cx="38" cy="78" rx="3" ry="6" fill="#c9b8e8"/><ellipse cx="50" cy="82" rx="3" ry="6" fill="#8a9ad8"/><ellipse cx="62" cy="78" rx="3" ry="6" fill="#c9b8e8"/>`,
)

const shadowlight =
  halo(50, 50, 34, '#e8ecff') +
  `<path d="M60 22 A28 28 0 1 0 60 78 A22 22 0 1 1 60 22 Z" fill="#e8ecff" stroke="#8a9ad8" stroke-width="2"/>` +
  [0, 45, 90, 135, 180, 225, 270, 315]
    .map(
      (a) =>
        `<path d="M50 8 L50 16" stroke="#fff3b0" stroke-width="3" stroke-linecap="round" transform="rotate(${a} 50 50)"/>`,
    )
    .join('') +
  symbol('star', 64, 50, '#fff3b0', 0.8)

export const GLADE_MISC_ART: Record<string, string> = {
  'spirit-selenne': selenne,
  'creature-moth-swarm': mothSwarm,
  'pest-earwig': earwig,
  'crew-moonshadow-crew': moonshadowCrew,
  'camp-moonshadow-crew': moonshadowCamp,
  'mount-luna-moth': lunaMoth(false),
  'mount-luna-moth-wild': lunaMoth(true),
  'mount-blue-jay': blueJay(false),
  'mount-blue-jay-wild': blueJay(true),
  'curio-lamplighters-wick': lamplightersWick,
  'curio-moth-wing-quill': mothWingQuill,
  'curio-fallen-star': fallenStar,
  'curio-dreamcatcher': dreamcatcher,
  'spell-shadowlight': shadowlight,
}
