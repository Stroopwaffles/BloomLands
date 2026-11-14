/**
 * Sky Isles art (content doc → Region 7, and the Asset List). Same 100×100 storybook style.
 * Palette: pale sky blue, cloud white, sunrise peach, blue-jay blue.
 */
import { ITEM_TEMPLATES } from './items'

const { shade, bottle, bowl, leafPile, petalPile, spool, symbol } = ITEM_TEMPLATES

const shadow = `<ellipse cx="50" cy="91" rx="26" ry="5" fill="#5a7a9a" opacity="0.16"/>`
/** Sky plants grow from a little puff of cloud. */
const cloudBase = `<g fill="#ffffff" stroke="#c8daea" stroke-width="1.4"><circle cx="38" cy="92" r="8"/><circle cx="50" cy="90" r="10"/><circle cx="62" cy="92" r="8"/></g>`
const halo = (x: number, y: number, r: number, color: string) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" opacity="0.3"/>`
const sparkle = (x: number, y: number, s = 1, color = '#fff3b0') =>
  `<path transform="translate(${x} ${y}) scale(${s})" d="M0 -6 L1.5 -1.5 L6 0 L1.5 1.5 L0 6 L-1.5 1.5 L-6 0 L-1.5 -1.5 Z" fill="${color}"/>`
const stem = (x: number, top: number, color = '#6a9a7a') =>
  `<path d="M${x} 88 Q${x - 2} ${(88 + top) / 2} ${x} ${top}" fill="none" stroke="${color}" stroke-width="2.2"/>`

// ---------------------------------------------------------------------------------------------
// Plants

const bell = (x: number, y: number, c: string) =>
  `<path d="M${x - 7} ${y + 8} Q${x - 7} ${y - 6} ${x} ${y - 7} Q${x + 7} ${y - 6} ${x + 7} ${y + 8} Q${x + 3} ${y + 5} ${x} ${y + 9} Q${x - 3} ${y + 5} ${x - 7} ${y + 8} Z" fill="${c}" stroke="${shade(c, 0.65)}" stroke-width="1.4"/>`

const skybell =
  cloudBase +
  `<g class="sway"><path d="M50 88 Q48 60 56 36 Q64 30 70 34" fill="none" stroke="#6a9a7a" stroke-width="2.2"/>` +
  bell(42, 54, '#8ac4f0') +
  bell(58, 44, '#a6d4f8') +
  bell(70, 42, '#7ab4e8') +
  `</g>`

const rainbowMoss =
  cloudBase +
  `<g class="sway">` +
  ['#f28a8a', '#f2c45c', '#9ccc72', '#7ab4e8', '#b89ae8']
    .map(
      (c, i) =>
        `<ellipse cx="${30 + i * 10}" cy="${80 - (i % 2) * 4}" rx="7" ry="5" fill="${c}" stroke="${shade(c, 0.7)}" stroke-width="1.2"/>`,
    )
    .join('') +
  `</g>`

const cloudbloom =
  cloudBase +
  `<g class="sway">${stem(50, 50)}` +
  `<g fill="#ffffff" stroke="#c8daea" stroke-width="1.6"><circle cx="42" cy="44" r="10"/><circle cx="58" cy="44" r="10"/><circle cx="50" cy="34" r="11"/><circle cx="50" cy="48" r="9"/></g>` +
  `<circle cx="50" cy="42" r="4" fill="#f7c6a8"/>` +
  `</g>`

const sunpetal =
  cloudBase +
  `<g class="sway">${stem(50, 48)}` +
  halo(50, 42, 20, '#ffe59e') +
  [0, 45, 90, 135, 180, 225, 270, 315]
    .map(
      (a) =>
        `<ellipse cx="50" cy="30" rx="4.4" ry="10" fill="#f7a640" stroke="#c97a1a" stroke-width="1" transform="rotate(${a} 50 42)"/>`,
    )
    .join('') +
  `<circle cx="50" cy="42" r="7" fill="#f2c45c" stroke="#c98a1c" stroke-width="1.4"/>` +
  `</g>`

const windThistle =
  cloudBase +
  `<g class="sway">${stem(46, 46, '#7a9a8a')}${stem(58, 54, '#7a9a8a')}` +
  `<path d="M40 50 L46 46 L52 50 Q46 56 40 50 Z M52 58 L58 54 L64 58 Q58 64 52 58 Z" fill="#9a7ac8"/>` +
  `<g stroke="#eef2fb" stroke-width="1.2">` +
  [-30, -15, 0, 15, 30]
    .map(
      (a) =>
        `<path d="M46 46 L46 30" transform="rotate(${a} 46 46)"/><path d="M58 54 L58 40" transform="rotate(${a} 58 54)"/>`,
    )
    .join('') +
  `</g></g>`

const thunderLily =
  cloudBase +
  `<g class="sway">${stem(50, 46, '#4a6a7a')}` +
  halo(50, 36, 20, '#c8d8ff') +
  `<path d="M50 46 C36 40 32 20 44 18 C46 26 48 34 50 46 Z M50 46 C64 40 68 20 56 18 C54 26 52 34 50 46 Z M50 46 C46 30 46 18 50 12 C54 18 54 30 50 46 Z" fill="#6a78c8" stroke="#3a4a8a" stroke-width="1.6"/>` +
  `<path d="M54 22 L48 32 L53 32 L47 42" fill="none" stroke="#fff3b0" stroke-width="2" stroke-linejoin="round"/>` +
  `</g>`

const auroraBlossom =
  cloudBase +
  `<g class="sway">${stem(50, 48)}` +
  halo(50, 38, 24, '#c8f0e0') +
  ['#9cf0c4', '#8ac4f0', '#c8a2f0', '#f7a6c0', '#f2c45c']
    .map(
      (c, i) =>
        `<ellipse cx="50" cy="24" rx="6" ry="13" fill="${c}" stroke="${shade(c, 0.7)}" stroke-width="1" opacity="0.9" transform="rotate(${i * 72} 50 38)"/>`,
    )
    .join('') +
  `<circle cx="50" cy="38" r="5" fill="#fffaf0"/>` +
  `</g>`

const prismBlossom =
  cloudBase +
  `<g class="sway">${stem(50, 50)}` +
  halo(50, 36, 24, '#ffffff') +
  `<path d="M50 14 L66 36 L50 58 L34 36 Z" fill="#eef8ff" stroke="#8aa8d8" stroke-width="1.8"/>` +
  `<path d="M50 14 L50 58 M34 36 L66 36" stroke="#c8d8ff" stroke-width="1"/>` +
  `<path d="M58 30 L74 26 M58 36 L76 36 M58 42 L74 46" stroke-width="2" stroke-linecap="round" stroke="#f28a8a"/>` +
  `<path d="M58 36 L76 36" stroke="#9ccc72" stroke-width="2"/>` +
  sparkle(30, 22, 0.6) +
  `</g>`

const whisperleaf =
  cloudBase +
  `<g class="sway">${stem(50, 40, '#7a9a8a')}` +
  `<path d="M50 70 C34 66 30 50 40 44 C46 52 48 60 50 70 Z M50 56 C66 52 70 38 60 32 C54 40 52 48 50 56 Z" fill="#c8e8d8" stroke="#6a9a7a" stroke-width="1.6"/>` +
  `<path d="M62 22 q6 -2 10 2 M66 16 q6 -2 10 2" fill="none" stroke="#9ab4c8" stroke-width="1.2" stroke-linecap="round"/>` +
  `</g>`

export const SKY_PLANT_ART: Record<string, string> = {
  'plant-skybell': skybell,
  'plant-rainbow-moss': rainbowMoss,
  'plant-cloudbloom': cloudbloom,
  'plant-sunpetal': sunpetal,
  'plant-wind-thistle': windThistle,
  'plant-thunder-lily': thunderLily,
  'plant-aurora-blossom': auroraBlossom,
  'plant-prism-blossom': prismBlossom,
  'plant-whisperleaf': whisperleaf,
}

// ---------------------------------------------------------------------------------------------
// Items

const fluffPile = (c: string) =>
  shadow +
  `<g fill="${c}" stroke="${shade(c, 0.8)}" stroke-width="1.6"><circle cx="38" cy="74" r="12"/><circle cx="60" cy="74" r="13"/><circle cx="50" cy="62" r="13"/></g>`

const stormEssence =
  shadow +
  halo(50, 60, 26, '#c8d8ff') +
  `<circle cx="50" cy="60" r="20" fill="#6a78c8" stroke="#3a4a8a" stroke-width="2.4"/>` +
  `<path d="M54 44 L44 60 L52 60 L44 76" fill="none" stroke="#fff3b0" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>`

const windSilk =
  shadow +
  halo(50, 58, 28, '#e2f0ff') +
  `<path d="M22 70 Q36 40 50 58 Q64 76 78 46" fill="none" stroke="#8ac4f0" stroke-width="9" stroke-linecap="round"/>` +
  `<path d="M22 70 Q36 40 50 58 Q64 76 78 46" fill="none" stroke="#eef8ff" stroke-width="3" stroke-linecap="round"/>` +
  sparkle(70, 34, 0.7, '#ffffff')

const goldenFeather =
  shadow +
  `<g transform="rotate(30 50 56)"><path d="M50 18 C66 32 64 66 50 88 C38 66 36 32 50 18 Z" fill="#f2c45c" stroke="#a87e1a" stroke-width="2"/>` +
  `<path d="M50 22 L50 92" stroke="#a87e1a" stroke-width="1.6"/></g>`

const kiteString =
  shadow +
  `<ellipse cx="50" cy="66" rx="18" ry="16" fill="#f3e3cf" stroke="#c9a77f" stroke-width="2"/>` +
  `<path d="M34 60 Q50 54 66 62 M34 68 Q50 62 66 70 M36 74 Q50 70 64 76" fill="none" stroke="#f28a8a" stroke-width="2"/>` +
  `<path d="M66 60 Q78 44 74 26" fill="none" stroke="#f28a8a" stroke-width="1.6"/>`

const brassGear =
  shadow +
  `<g transform="translate(50 60)">` +
  Array.from(
    { length: 8 },
    (_, i) =>
      `<rect x="-4" y="-26" width="8" height="10" rx="1.5" fill="#d9b25a" stroke="#8a6a2a" stroke-width="1.6" transform="rotate(${i * 45})"/>`,
  ).join('') +
  `<circle r="18" fill="#d9b25a" stroke="#8a6a2a" stroke-width="2.2"/><circle r="6" fill="#f3e3cf" stroke="#8a6a2a" stroke-width="1.6"/></g>`

export const SKY_ITEM_ART: Record<string, string> = {
  'raw-skybell-petals': petalPile('#8ac4f0'),
  'raw-rainbow-moss': leafPile('#9ccc72'),
  'raw-cloud-fluff': fluffPile('#ffffff'),
  'raw-sunpetals': petalPile('#f7a640'),
  'raw-thistledown': fluffPile('#eef2fb'),
  'raw-storm-essence': stormEssence,
  'raw-aurora-petals': petalPile('#9cf0c4'),
  'raw-prism-petals': petalPile('#eef8ff'),
  'raw-whisperleaf': leafPile('#c8e8d8'),
  'refined-cloud-silk': spool('#eef8ff'),
  'refined-storm-vial': bottle('#6a78c8', 'star', 'tall'),
  'refined-aurora-dye': bowl('#9cf0c4', 'star'),
  'component-wind-silk': windSilk,
  'potion-featherfall': bottle('#cfe8fa', 'leaf', 'tall'),
  'trinket-golden-feather': goldenFeather,
  'trinket-kite-string': kiteString,
  'trinket-brass-gear': brassGear,
}

// ---------------------------------------------------------------------------------------------
// People: wind sprites

interface SpriteLook {
  body: string
  hair: string
  top?: string
  front?: string
  beard?: boolean
}

const sprite = ({ body, hair, top = '', front = '', beard = false }: SpriteLook) =>
  shadow +
  `<path d="M34 92 Q30 70 50 58 Q70 70 66 92 Q58 84 50 92 Q42 84 34 92 Z" fill="${body}" stroke="${shade(body, 0.7)}" stroke-width="2"/>` +
  `<path d="M30 78 q-10 -2 -16 4 M70 78 q10 -2 16 4" fill="none" stroke="${shade(body, 0.7)}" stroke-width="2" stroke-linecap="round"/>` +
  `<circle cx="50" cy="42" r="16" fill="#fbe9dc" stroke="#d8a88a" stroke-width="2"/>` +
  `<path d="M34 40 Q34 22 50 22 Q66 22 66 40 Q62 30 56 30 Q60 24 50 26 Q42 26 38 34 Z" fill="${hair}" stroke="${shade(hair, 0.7)}" stroke-width="1.4"/>` +
  `<path d="M66 34 q8 -6 14 -2 q-6 4 -12 6" fill="${hair}" stroke="${shade(hair, 0.7)}" stroke-width="1.2"/>` +
  `<circle cx="44" cy="44" r="2.6" fill="#2e2420"/><circle cx="56" cy="44" r="2.6" fill="#2e2420"/>` +
  `<circle cx="40" cy="50" r="3" fill="#f7a6b8" opacity="0.5"/><circle cx="60" cy="50" r="3" fill="#f7a6b8" opacity="0.5"/>` +
  (beard
    ? `<path d="M40 50 Q50 70 60 50 Q56 56 50 56 Q44 56 40 50 Z" fill="#ffffff" stroke="#c8daea" stroke-width="1.4"/>`
    : `<path d="M46 52 Q50 55 54 52" fill="none" stroke="#2e2420" stroke-width="1.6" stroke-linecap="round"/>`) +
  top +
  front

const spectacles = `<g fill="none" stroke="#5e4428" stroke-width="1.4"><circle cx="44" cy="44" r="5"/><circle cx="56" cy="44" r="5"/><path d="M49 44 L51 44"/></g>`
const starScroll = `<g transform="translate(72 72) rotate(-15)"><rect x="-8" y="-12" width="16" height="22" rx="2" fill="#eef2fb" stroke="#8a9ad8" stroke-width="1.4"/>${symbol('star', 0, -1, '#f2c45c', 0.7)}</g>`
const sailRoll = `<g transform="translate(72 74)"><path d="M-8 -14 L8 -14 L8 12 Q0 6 -8 12 Z" fill="#eef8ff" stroke="#8ac4f0" stroke-width="1.6"/><path d="M-8 -14 L-8 14" stroke="#a87e5a" stroke-width="2"/></g>`
const vaneHat = `<path d="M38 26 L62 26 L58 20 L42 20 Z" fill="#7ab4e8" stroke="#3a6a9a" stroke-width="1.2"/><path d="M50 20 L50 8 M44 10 L56 10 L52 6" fill="none" stroke="#a87e1a" stroke-width="1.6"/>`
const kite = `<g transform="translate(74 64)"><path d="M0 -14 L10 0 L0 14 L-10 0 Z" fill="#f28a8a" stroke="#a84a4a" stroke-width="1.4"/><path d="M0 14 Q4 20 0 26" fill="none" stroke="#a84a4a" stroke-width="1"/></g>`
const puff = `<g transform="translate(74 70)" fill="#ffffff" stroke="#c8daea" stroke-width="1.2"><circle cx="-4" cy="0" r="6"/><circle cx="4" cy="-2" r="7"/><circle cx="2" cy="4" r="5"/></g>`

/** Captain Mallow Brambleshanks: patched petal coat, an enormous feathered hat. */
const captainMallow =
  shadow +
  `<path d="M28 58 Q14 44 20 30 Q30 42 34 54 Z M72 58 Q86 44 80 30 Q70 42 66 54 Z" fill="#f7c6d4" opacity="0.8" stroke="#c97a8c" stroke-width="1.2"/>` +
  `<path d="M30 92 Q28 60 50 52 Q72 60 70 92 Z" fill="#c9506a" stroke="#7a2a3e" stroke-width="2"/>` +
  `<path d="M36 70 l8 0 0 8 -8 0 Z" fill="#f2c45c" stroke="#a87e1a" stroke-width="1"/>` +
  `<path d="M58 80 l9 -2 1 8 -9 2 Z" fill="#9ccc72" stroke="#5f8a3e" stroke-width="1"/>` +
  `<path d="M50 54 L50 92" stroke="#7a2a3e" stroke-width="1.4"/>` +
  `<circle cx="46" cy="64" r="1.6" fill="#f2c45c"/><circle cx="46" cy="72" r="1.6" fill="#f2c45c"/>` +
  `<circle cx="50" cy="42" r="13" fill="#fbe0cc" stroke="#d8a88a" stroke-width="2"/>` +
  `<path d="M38 40 Q36 50 40 54 M62 40 Q64 50 60 54" fill="none" stroke="#8a4a2a" stroke-width="3" stroke-linecap="round"/>` +
  `<circle cx="45" cy="43" r="2" fill="#2e2420"/>` +
  `<path d="M52 40 L60 40 L58 46 L53 45 Z" fill="#2e2420"/><path d="M38 38 L62 40" stroke="#2e2420" stroke-width="1"/>` +
  `<path d="M45 49 Q50 52 55 48" fill="none" stroke="#2e2420" stroke-width="1.6" stroke-linecap="round"/>` +
  `<path d="M20 32 Q50 14 80 32 Q66 30 50 30 Q34 30 20 32 Z" fill="#3a2a4a" stroke="#1e1430" stroke-width="2"/>` +
  `<path d="M32 30 Q34 14 50 12 Q66 14 68 30 Z" fill="#3a2a4a" stroke="#1e1430" stroke-width="2"/>` +
  `<path d="M60 16 Q76 0 92 6 Q80 8 74 14 Q86 10 94 18 Q78 18 66 22 Z" fill="#f7a6c0" stroke="#c97a8c" stroke-width="1.4"/>` +
  `<path d="M62 20 Q78 8 92 10" fill="none" stroke="#c97a8c" stroke-width="1"/>` +
  `<circle cx="50" cy="22" r="3" fill="#f2c45c" stroke="#a87e1a" stroke-width="1"/>`

export const SKY_PEOPLE_ART: Record<string, string> = {
  'char-captain-mallow': captainMallow,
  'char-cumulus': sprite({
    body: '#9ab4d8',
    hair: '#ffffff',
    top: spectacles,
    front: starScroll,
    beard: true,
  }),
  'char-twill': sprite({ body: '#8ac4f0', hair: '#f2c45c', front: sailRoll }),
  'villager-zephyrine': sprite({ body: '#a6d4f8', hair: '#c8a2f0', top: vaneHat }),
  'villager-gusty': sprite({ body: '#f7c6a8', hair: '#8a6a44', front: kite }),
  'villager-nimbletuft': sprite({ body: '#c8daea', hair: '#f7a6c0', front: puff }),
}

// ---------------------------------------------------------------------------------------------
// Spirit, creatures, pirates, curios, spell

const aeris =
  halo(50, 50, 40, '#e2f0ff') +
  `<path d="M14 70 C24 30 70 20 80 40 C88 56 66 70 52 60 C40 52 50 36 62 42" fill="none" stroke="#8ac4f0" stroke-width="10" stroke-linecap="round"/>` +
  `<path d="M14 70 C24 30 70 20 80 40 C88 56 66 70 52 60 C40 52 50 36 62 42" fill="none" stroke="#eef8ff" stroke-width="4" stroke-linecap="round"/>` +
  `<circle cx="74" cy="34" r="12" fill="#eef8ff" stroke="#7ab4e8" stroke-width="2"/>` +
  `<circle cx="70" cy="32" r="2" fill="#3a6a9a"/><circle cx="78" cy="32" r="2" fill="#3a6a9a"/>` +
  `<path d="M70 38 Q74 42 78 38" fill="none" stroke="#3a6a9a" stroke-width="1.6" stroke-linecap="round"/>` +
  `<path d="M20 84 q10 -4 20 0 M60 86 q10 -4 20 0" fill="none" stroke="#c8daea" stroke-width="2" stroke-linecap="round"/>` +
  sparkle(30, 22, 0.8, '#ffffff') +
  sparkle(88, 64, 0.6, '#fff3b0')

const hawk =
  `<path d="M50 50 C36 30 14 28 4 40 C18 40 28 46 34 56 Z M50 50 C64 30 86 28 96 40 C82 40 72 46 66 56 Z" fill="#a8784a" stroke="#5e3e1e" stroke-width="2"/>` +
  `<path d="M12 40 L18 44 M20 38 L24 44 M88 40 L82 44 M80 38 L76 44" stroke="#5e3e1e" stroke-width="1.4"/>` +
  `<ellipse cx="50" cy="58" rx="12" ry="16" fill="#c8945a" stroke="#5e3e1e" stroke-width="2"/>` +
  `<path d="M42 72 L50 86 L58 72 Z" fill="#a8784a" stroke="#5e3e1e" stroke-width="1.6"/>` +
  `<circle cx="50" cy="42" r="9" fill="#c8945a" stroke="#5e3e1e" stroke-width="2"/>` +
  `<circle cx="47" cy="40" r="2" fill="#2e2420"/><circle cx="53" cy="40" r="2" fill="#2e2420"/>` +
  `<path d="M48 46 L50 51 L52 46 Z" fill="#f2c45c" stroke="#a87e1a" stroke-width="1"/>`

const gnat = (x: number, y: number) =>
  `<g transform="translate(${x} ${y})"><ellipse rx="3" ry="2" fill="#3a3550"/><ellipse cx="-2" cy="-3" rx="2.4" ry="1.4" fill="#e2f0ff" opacity="0.8"/><ellipse cx="2" cy="-3" rx="2.4" ry="1.4" fill="#e2f0ff" opacity="0.8"/></g>`
const gnats =
  gnat(38, 40) + gnat(56, 34) + gnat(48, 56) + gnat(64, 52) + gnat(32, 62) + gnat(56, 70)

const stormchasers =
  shadow +
  `<path d="M24 58 Q10 44 18 30 Q30 42 34 54 Z M76 58 Q90 44 82 30 Q70 42 66 54 Z" fill="#c8daea" opacity="0.8" stroke="#6a7a9a" stroke-width="1.2"/>` +
  `<path d="M32 90 Q30 56 50 48 Q70 56 68 90 Z" fill="#4a5a7a" stroke="#2a3a5a" stroke-width="2"/>` +
  `<path d="M40 64 L60 64 L54 74 L60 74 L46 88" fill="none" stroke="#f2c45c" stroke-width="2.4" stroke-linejoin="round"/>` +
  `<circle cx="50" cy="40" r="13" fill="#fbe9dc" stroke="#d8a88a" stroke-width="2"/>` +
  `<path d="M38 40 Q50 36 62 40 L62 44 Q50 40 38 44 Z" fill="#2a3a5a"/>` +
  `<circle cx="45" cy="42" r="1.8" fill="#fff3b0"/><circle cx="55" cy="42" r="1.8" fill="#fff3b0"/>` +
  `<path d="M30 30 Q50 14 70 30 Q50 26 30 30 Z" fill="#2a3a5a" stroke="#14123a" stroke-width="1.4"/>` +
  `<path d="M60 22 Q74 10 84 20" fill="none" stroke="#f7a6c0" stroke-width="3" stroke-linecap="round"/>`

const stormCamp =
  `<ellipse cx="50" cy="90" rx="40" ry="6" fill="#2a3a5a" opacity="0.25"/>` +
  `<g fill="#9aa8c0" stroke="#5a6a8a" stroke-width="2"><circle cx="30" cy="22" r="12"/><circle cx="48" cy="16" r="14"/><circle cx="68" cy="22" r="12"/></g>` +
  `<path d="M44 30 L38 44 L46 44 L40 58" fill="none" stroke="#f2c45c" stroke-width="3" stroke-linejoin="round"/>` +
  `<path d="M18 88 L50 50 L82 88 Z" fill="#4a5a7a" stroke="#2a3a5a" stroke-width="2.4"/>` +
  `<path d="M44 88 L50 66 L56 88 Z" fill="#2a3a5a"/>`

const curio = (inner: string) =>
  `<circle cx="50" cy="50" r="44" fill="#e2f0ff" opacity="0.55"/>` +
  `<circle cx="50" cy="50" r="36" fill="#fffaf0" stroke="#8ac4f0" stroke-width="3"/>` +
  inner

const starChart = curio(
  `<rect x="30" y="28" width="40" height="44" rx="3" fill="#2e3a7a" stroke="#14123a" stroke-width="2"/>` +
    `<path d="M38 40 L50 36 L60 46 L44 58 L56 64" fill="none" stroke="#c8d8ff" stroke-width="1"/>` +
    [
      [38, 40],
      [50, 36],
      [60, 46],
      [44, 58],
      [56, 64],
    ]
      .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2" fill="#fff3b0"/>`)
      .join(''),
)

const windwovenShawl = curio(
  `<path d="M26 40 Q50 30 74 40 L66 70 Q50 64 34 70 Z" fill="#a6d4f8" stroke="#3a6a9a" stroke-width="2"/>` +
    `<path d="M30 48 Q50 40 70 48 M32 58 Q50 50 68 58" fill="none" stroke="#eef8ff" stroke-width="2"/>` +
    `<path d="M34 70 L32 78 M42 68 L41 76 M58 68 L59 76 M66 70 L68 78" stroke="#3a6a9a" stroke-width="1.4"/>`,
)

const auroraPrism = curio(
  halo(50, 50, 22, '#c8f0e0') +
    `<path d="M50 24 L70 64 L30 64 Z" fill="#eef8ff" stroke="#8aa8d8" stroke-width="2.2"/>` +
    `<path d="M62 48 L80 42 M64 52 L82 52 M62 56 L80 62" stroke-width="2.4" stroke-linecap="round" stroke="#9cf0c4"/>` +
    `<path d="M64 52 L82 52" stroke="#c8a2f0" stroke-width="2.4" stroke-linecap="round"/>`,
)

const windboundTome = curio(
  `<path d="M28 34 Q40 30 50 36 Q60 30 72 34 L72 70 Q60 66 50 72 Q40 66 28 70 Z" fill="#7aa8d8" stroke="#3a6a9a" stroke-width="2"/>` +
    `<path d="M50 36 L50 72" stroke="#3a6a9a" stroke-width="1.6"/>` +
    `<path d="M34 46 Q40 42 46 46 M54 46 Q60 42 66 46 M34 56 Q40 52 46 56" fill="none" stroke="#eef8ff" stroke-width="1.4"/>` +
    `<path d="M70 26 q6 -2 10 2" fill="none" stroke="#9ab4c8" stroke-width="1.4" stroke-linecap="round"/>`,
)

const stormward =
  halo(50, 50, 36, '#e2f0ff') +
  `<g fill="#9aa8c0" stroke="#5a6a8a" stroke-width="2"><circle cx="34" cy="38" r="12"/><circle cx="52" cy="32" r="14"/><circle cx="70" cy="38" r="12"/></g>` +
  `<path d="M52 46 L46 58 L54 58 L48 70" fill="none" stroke="#f2c45c" stroke-width="3" stroke-linejoin="round"/>` +
  `<path d="M24 72 Q50 54 76 72 Q50 66 24 72 Z" fill="#8ac4f0" stroke="#3a6a9a" stroke-width="2"/>`

export const SKY_MISC_ART: Record<string, string> = {
  'spirit-aeris': aeris,
  'creature-hawk': hawk,
  'pest-gnat': gnats,
  'crew-stormchasers': stormchasers,
  'camp-stormchasers': stormCamp,
  'curio-star-chart': starChart,
  'curio-windwoven-shawl': windwovenShawl,
  'curio-aurora-prism': auroraPrism,
  'curio-windbound-tome': windboundTome,
  'spell-stormward': stormward,
}
