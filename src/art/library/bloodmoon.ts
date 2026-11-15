/**
 * Blood Moon art: the Crimson Vale's spooky plants, its pantry, the bats, Countess Nocturna, and
 * the outfits made at the Moonless Manor. Palette: blood red, black, bone, ghost green.
 */
import { ITEM_TEMPLATES } from './items'

const { shade, bowl, leafPile, petalPile, spool } = ITEM_TEMPLATES

const shadow = `<ellipse cx="50" cy="91" rx="26" ry="5" fill="#14060c" opacity="0.25"/>`
const ground = `<ellipse cx="50" cy="97" rx="18" ry="3" fill="#14060c" opacity="0.35"/>`
const halo = (x: number, y: number, r: number, color: string) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" opacity="0.3"/>`
const stem = (x: number, top: number, color = '#2a3a2a') =>
  `<path d="M${x} 97 Q${x - 2} ${(97 + top) / 2} ${x} ${top}" fill="none" stroke="${color}" stroke-width="2.4"/>`

// ---------------------------------------------------------------------------------------------
// Plants

const rose = (x: number, y: number, s: number) =>
  `<g transform="translate(${x} ${y}) scale(${s})"><circle r="9" fill="#9a1f3a" stroke="#4a0a1a" stroke-width="1.6"/><path d="M-6 0 Q0 -10 6 0 Q0 6 -6 0 Z M-3 -1 Q0 -5 3 -1" fill="#c8243a" stroke="#4a0a1a" stroke-width="1"/></g>`

const bloodrose =
  ground +
  `<g class="sway">${stem(50, 40)}` +
  `<path d="M50 70 L44 66 M50 58 L56 54 M50 80 L57 78" stroke="#2a3a2a" stroke-width="1.6"/>` +
  `<path d="M50 72 Q38 66 34 72 Q42 78 50 74" fill="#2a4a32" stroke="#14261a" stroke-width="1"/>` +
  rose(50, 36, 1.2) +
  rose(38, 54, 0.7) +
  `</g>`

const graveMoss =
  ground +
  `<path d="M34 90 L34 66 Q50 54 66 66 L66 90 Z" fill="#5a5060" stroke="#2a2430" stroke-width="2"/>` +
  `<path d="M42 72 L58 72 M50 66 L50 82" stroke="#2a2430" stroke-width="1.6"/>` +
  `<g class="sway" fill="#4a6a4a" stroke="#2a3a2a" stroke-width="1">` +
  `<ellipse cx="38" cy="88" rx="10" ry="5"/><ellipse cx="56" cy="90" rx="12" ry="5"/><ellipse cx="46" cy="66" rx="8" ry="4"/></g>`

const nightshade =
  ground +
  `<g class="sway">${stem(50, 46)}` +
  `<path d="M50 70 Q36 62 30 70 Q40 76 50 72 M50 60 Q64 52 70 60 Q60 66 50 62" fill="#2a4a3a" stroke="#14261a" stroke-width="1"/>` +
  [
    [44, 46],
    [52, 42],
    [58, 48],
    [48, 52],
  ]
    .map(
      ([x, y]) =>
        `<circle cx="${x}" cy="${y}" r="5" fill="#3a1a5a" stroke="#1a0a2a" stroke-width="1.2"/><circle cx="${x - 1.6}" cy="${y - 1.6}" r="1.2" fill="#c8a2f0"/>`,
    )
    .join('') +
  `</g>`

const ghostcap =
  ground +
  `<g class="sway">` +
  [
    [38, 92, 0.9],
    [60, 94, 1.1],
    [50, 80, 0.7],
  ]
    .map(
      ([x, y, s]) =>
        halo(x, y - 14 * s, 15 * s, '#9cf0b0') +
        `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-4 0 L-3 -14 L3 -14 L4 0 Z" fill="#e2efe2" stroke="#8ab49a" stroke-width="1.4"/><path d="M-16 -12 C-16 -30 16 -30 16 -12 Q0 -8 -16 -12 Z" fill="#c8f0d0" stroke="#5f9a6a" stroke-width="1.8" opacity="0.9"/><circle cx="-5" cy="-19" r="2" fill="#2a3a2a"/><circle cx="5" cy="-19" r="2" fill="#2a3a2a"/><path d="M-3 -14 Q0 -16 3 -14" fill="none" stroke="#2a3a2a" stroke-width="1"/></g>`,
    )
    .join('') +
  `</g>`

const batwingFern =
  ground +
  `<g class="sway">${stem(50, 50, '#3a2a3a')}` +
  `<path d="M50 56 C40 40 22 40 14 50 C20 50 22 54 22 58 C28 54 32 56 34 60 C38 56 44 58 50 62 Z" fill="#3a2a44" stroke="#14061c" stroke-width="1.6"/>` +
  `<path d="M50 56 C60 40 78 40 86 50 C80 50 78 54 78 58 C72 54 68 56 66 60 C62 56 56 58 50 62 Z" fill="#3a2a44" stroke="#14061c" stroke-width="1.6"/>` +
  `<path d="M50 74 C42 64 30 66 26 72 C34 72 40 76 50 80 Z M50 74 C58 64 70 66 74 72 C66 72 60 76 50 80 Z" fill="#4a3a54" stroke="#14061c" stroke-width="1.2"/>` +
  `</g>`

const widowsLace =
  ground +
  `<g class="sway">${stem(50, 34, '#2a2a3a')}` +
  `<g fill="none" stroke="#e8e2f0" stroke-width="0.9" opacity="0.9">` +
  `<circle cx="50" cy="34" r="14"/><circle cx="50" cy="34" r="9"/><circle cx="50" cy="34" r="4"/>` +
  [0, 45, 90, 135].map((a) => `<path d="M36 34 L64 34" transform="rotate(${a} 50 34)"/>`).join('') +
  `</g>` +
  `<circle cx="58" cy="28" r="3" fill="#14060c"/><circle cx="58" cy="28" r="1" fill="#c8243a"/>` +
  `</g>`

const moonbloodLily =
  ground +
  `<g class="sway">${stem(50, 46, '#2a3a2a')}` +
  halo(50, 36, 24, '#ff4a5a') +
  `<path d="M50 46 C34 40 30 20 42 16 C44 26 46 34 50 46 Z M50 46 C66 40 70 20 58 16 C56 26 54 34 50 46 Z M50 46 C46 30 46 16 50 10 C54 16 54 30 50 46 Z" fill="#c8243a" stroke="#5a0a1a" stroke-width="1.6"/>` +
  `<circle cx="50" cy="36" r="3" fill="#ffd6dc"/>` +
  `</g>`

export const BLOODMOON_PLANT_ART: Record<string, string> = {
  'plant-bloodrose': bloodrose,
  'plant-grave-moss': graveMoss,
  'plant-nightshade': nightshade,
  'plant-ghostcap': ghostcap,
  'plant-batwing-fern': batwingFern,
  'plant-widows-lace': widowsLace,
  'plant-moonblood-lily': moonbloodLily,
}

// ---------------------------------------------------------------------------------------------
// Pantry items

const berryPile = (c: string) =>
  shadow +
  [
    [38, 74],
    [54, 76],
    [46, 64],
    [62, 66],
  ]
    .map(
      ([x, y]) =>
        `<circle cx="${x}" cy="${y}" r="9" fill="${c}" stroke="${shade(c, 0.6)}" stroke-width="1.8"/><circle cx="${x - 3}" cy="${y - 3}" r="2" fill="white" opacity="0.5"/>`,
    )
    .join('')

const capPile =
  shadow +
  `<g fill="#c8f0d0" stroke="#5f9a6a" stroke-width="1.8"><path d="M24 76 C24 58 46 58 46 76 Z"/><path d="M48 80 C48 60 74 60 74 80 Z"/><path d="M36 64 C36 50 56 50 56 64 Z"/></g>`

const bloodDrop =
  shadow +
  halo(50, 60, 24, '#ff4a5a') +
  `<path d="M50 30 C38 50 34 60 34 68 C34 78 42 86 50 86 C58 86 66 78 66 68 C66 60 62 50 50 30 Z" fill="#c8243a" stroke="#5a0a1a" stroke-width="2.4"/>` +
  `<path d="M42 64 Q42 56 46 52" fill="none" stroke="#ffd6dc" stroke-width="2.4" stroke-linecap="round"/>`

const candle =
  shadow +
  halo(50, 30, 16, '#9cf0b0') +
  `<rect x="38" y="40" width="24" height="44" rx="4" fill="#d8f0e0" stroke="#5f9a6a" stroke-width="2"/>` +
  `<path d="M38 48 Q44 54 46 46 Q50 56 54 46 Q58 54 62 48" fill="#c8f0d0" stroke="#5f9a6a" stroke-width="1.2"/>` +
  `<path d="M50 40 L50 34" stroke="#2a3a2a" stroke-width="2"/>` +
  `<path d="M50 34 Q44 26 50 16 Q56 26 50 34 Z" fill="#9cf0b0" stroke="#5f9a6a" stroke-width="1.2"/>`

export const BLOODMOON_ITEM_ART: Record<string, string> = {
  'event-bloodrose-petals': petalPile('#9a1f3a'),
  'event-grave-moss': leafPile('#4a6a4a'),
  'event-nightshade': berryPile('#3a1a5a'),
  'event-ghostcap': capPile,
  'event-batwing-fronds': leafPile('#3a2a44'),
  'event-widows-lace': spool('#e8e2f0'),
  'event-moonblood': bloodDrop,
  'event-bloodrose-essence': bowl('#c8243a', 'heart'),
  'event-shadow-silk': spool('#2a1a34'),
  'event-ghostlight-wax': candle,
}

// ---------------------------------------------------------------------------------------------
// The Countess, the bats, and the outfits

const countess =
  shadow +
  `<path d="M24 56 Q8 40 12 22 Q26 34 34 50 Z M76 56 Q92 40 88 22 Q74 34 66 50 Z" fill="#3a1a2a" stroke="#14060c" stroke-width="1.6"/>` +
  `<path d="M24 56 L14 46 M76 56 L86 46" stroke="#14060c" stroke-width="1.2"/>` +
  `<path d="M28 92 Q26 60 50 52 Q74 60 72 92 Z" fill="#1e1424" stroke="#0a040c" stroke-width="2"/>` +
  `<path d="M34 54 L30 40 L42 50 Z M66 54 L70 40 L58 50 Z" fill="#9a1f3a" stroke="#4a0a1a" stroke-width="1.2"/>` +
  `<path d="M44 56 L50 74 L56 56 Z" fill="#9a1f3a"/>` +
  `<circle cx="50" cy="40" r="13" fill="#eae2f0" stroke="#a89ab8" stroke-width="2"/>` +
  `<path d="M36 38 Q36 22 50 22 Q64 22 64 38 Q58 30 50 34 Q42 30 36 38 Z" fill="#14060c"/>` +
  `<path d="M50 22 L50 30" stroke="#14060c" stroke-width="3"/>` +
  `<circle cx="45" cy="40" r="2.2" fill="#c8243a"/><circle cx="55" cy="40" r="2.2" fill="#c8243a"/>` +
  `<path d="M45 47 Q50 50 55 47" fill="none" stroke="#5a0a1a" stroke-width="1.6" stroke-linecap="round"/>` +
  `<path d="M47 47.6 L48 50 L49 47.9 M51 47.9 L52 50 L53 47.6" fill="white" stroke="white" stroke-width="0.6"/>`

const bat = (x: number, y: number, s: number) =>
  `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0 C-6 -8 -14 -8 -20 -2 C-16 -2 -14 0 -14 3 C-10 0 -7 2 -6 4 C-4 2 -2 3 0 5 C2 3 4 2 6 4 C7 2 10 0 14 3 C14 0 16 -2 20 -2 C14 -8 6 -8 0 0 Z" fill="#1e1424" stroke="#0a040c" stroke-width="1"/><circle cx="-2" cy="0" r="0.9" fill="#ff4a5a"/><circle cx="2" cy="0" r="0.9" fill="#ff4a5a"/></g>`

const batSwarm =
  shadow +
  halo(50, 52, 30, '#ff4a5a') +
  bat(34, 40, 1) +
  bat(64, 32, 0.9) +
  bat(50, 58, 1.2) +
  bat(26, 64, 0.8) +
  bat(72, 62, 0.9)

const outfitIcon = (body: string, trim: string) =>
  `<circle cx="50" cy="50" r="44" fill="#3a0e1e" opacity="0.5"/>` +
  `<path d="M36 26 Q50 20 64 26 L72 84 Q50 92 28 84 Z" fill="${body}" stroke="${shade(body, 0.6)}" stroke-width="2.4"/>` +
  `<path d="M36 26 L44 40 L50 30 L56 40 L64 26" fill="none" stroke="${trim}" stroke-width="2.4"/>` +
  `<path d="M34 76 Q50 70 66 76" fill="none" stroke="${trim}" stroke-width="2"/>`

export const BLOODMOON_MISC_ART: Record<string, string> = {
  'char-countess-nocturna': countess,
  'creature-bat-swarm': batSwarm,
  'piece-bloodrose-gown': outfitIcon('#9a1f3a', '#2a1a2a'),
  'piece-gravewalker-coat': outfitIcon('#3a4a3e', '#9cf0b0'),
  'piece-vampire-cape': outfitIcon('#1e1424', '#c8243a'),
}
