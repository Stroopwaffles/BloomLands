/**
 * Icons, stations, spell sigils and curios (content doc → Asset List → UI, Home, Item Icons).
 */

const shadow = `<ellipse cx="50" cy="91" rx="26" ry="5" fill="#5a4352" opacity="0.12"/>`

// ---------------------------------------------------------------------------------------------
// UI icons

const glimmers =
  `<path d="M50 8 L64 40 L50 92 L36 40 Z" fill="#8fe0f5" stroke="#3fa6c4" stroke-width="3" stroke-linejoin="round"/>` +
  `<path d="M36 40 L64 40" stroke="#3fa6c4" stroke-width="2.4"/><path d="M50 8 L44 40 L50 92" fill="#c8f2fb" opacity="0.8"/>` +
  `<path d="M80 18 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3 Z" fill="#fff3b0" stroke="#e2b94f" stroke-width="1.2"/>`

const trinkets =
  `<circle cx="38" cy="58" r="22" fill="#7fa8d6" stroke="#4f78a6" stroke-width="3"/>` +
  [
    [33, 53],
    [43, 53],
    [33, 63],
    [43, 63],
  ]
    .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#3d5f8a"/>`)
    .join('') +
  `<circle cx="68" cy="40" r="18" fill="#b9a3e8" stroke="#7c5cff" stroke-width="3"/><circle cx="62" cy="34" r="5" fill="white" opacity="0.8"/>`

const satchel =
  `<path d="M26 28 Q50 6 74 28" fill="none" stroke="#8f5426" stroke-width="5"/>` +
  `<rect x="18" y="32" width="64" height="54" rx="14" fill="#d68a46" stroke="#8f5426" stroke-width="3"/>` +
  `<path d="M18 46 Q50 60 82 46 L82 40 Q50 52 18 40 Z" fill="#c97a3a" stroke="#8f5426" stroke-width="2.4"/>` +
  `<circle cx="50" cy="56" r="6" fill="#ffe59e" stroke="#c99a24" stroke-width="2"/>`

const lodging =
  shadow +
  `<path d="M22 88 L24 44 Q50 24 76 44 L78 88 Z" fill="#c99a6a" stroke="#8f6a3a" stroke-width="2.6"/>` +
  [52, 62, 72]
    .map(
      (y) =>
        `<path d="M24 ${y} Q50 ${y + 4} 77 ${y}" fill="none" stroke="#a9805a" stroke-width="1.4"/>`,
    )
    .join('') +
  `<path d="M14 46 Q50 6 86 46 Q50 30 14 46 Z" fill="#8cc97f" stroke="#4f8a4a" stroke-width="2.6"/>` +
  `<path d="M42 88 L42 66 Q50 58 58 66 L58 88 Z" fill="#6b4a32" stroke="#4a3220" stroke-width="2"/>` +
  `<circle cx="64" cy="54" r="5" fill="#ffe59e" stroke="#c99a24" stroke-width="1.6"/>`

const gloves =
  `<path d="M30 86 L28 50 Q28 40 34 40 L34 26 Q34 20 39 20 Q44 20 44 26 L44 22 Q44 16 49 16 Q54 16 54 22 L54 26 Q54 20 59 20 Q64 20 64 26 L64 52 Q72 46 76 52 Q78 58 70 66 L60 86 Z" fill="#9dd28f" stroke="#4f8a4a" stroke-width="2.6" stroke-linejoin="round"/>` +
  `<path d="M30 76 L62 76" stroke="#4f8a4a" stroke-width="2"/>` +
  `<path d="M40 50 Q46 56 52 50" fill="none" stroke="#4f8a4a" stroke-width="1.6"/>`

const wings =
  `<ellipse cx="32" cy="38" rx="22" ry="14" transform="rotate(-30 32 38)" fill="#e9ddff" stroke="#9a86cf" stroke-width="2.4"/>` +
  `<ellipse cx="68" cy="38" rx="22" ry="14" transform="rotate(30 68 38)" fill="#e9ddff" stroke="#9a86cf" stroke-width="2.4"/>` +
  `<ellipse cx="36" cy="66" rx="14" ry="9" transform="rotate(25 36 66)" fill="#f5edff" stroke="#9a86cf" stroke-width="2.2"/>` +
  `<ellipse cx="64" cy="66" rx="14" ry="9" transform="rotate(-25 64 66)" fill="#f5edff" stroke="#9a86cf" stroke-width="2.2"/>` +
  `<path d="M14 82 Q30 76 40 84 M60 84 Q72 76 88 82" fill="none" stroke="#8fd3ff" stroke-width="2.4" stroke-linecap="round"/>`

const comfort =
  `<path d="M50 86 C14 62 18 30 36 28 C44 28 48 34 50 38 C52 34 56 28 64 28 C82 30 86 62 50 86 Z" fill="#f7b7c8" stroke="#c97a8c" stroke-width="3"/>` +
  `<path d="M50 38 C56 22 70 16 78 20 C74 30 62 36 50 38 Z" fill="#9dd28f" stroke="#4f8a4a" stroke-width="2"/>`

// ---------------------------------------------------------------------------------------------
// Home stations

const mortar =
  shadow +
  `<path d="M18 48 L82 48 Q80 86 50 88 Q20 86 18 48 Z" fill="#c8c3d4" stroke="#8a8396" stroke-width="2.6"/>` +
  `<ellipse cx="50" cy="48" rx="32" ry="8" fill="#a39cb2" stroke="#8a8396" stroke-width="2.4"/>` +
  `<ellipse cx="50" cy="48" rx="24" ry="5" fill="#f7b7c8"/>` +
  `<rect x="56" y="10" width="11" height="42" rx="5" transform="rotate(28 61 31)" fill="#d9b68a" stroke="#a8875d" stroke-width="2.4"/>`

const press =
  shadow +
  `<rect x="20" y="64" width="60" height="24" rx="5" fill="#c99a6a" stroke="#8f6a3a" stroke-width="2.4"/>` +
  `<rect x="24" y="12" width="8" height="56" rx="3" fill="#a9805a" stroke="#8f6a3a" stroke-width="2"/><rect x="68" y="12" width="8" height="56" rx="3" fill="#a9805a" stroke="#8f6a3a" stroke-width="2"/>` +
  `<rect x="20" y="10" width="60" height="9" rx="3" fill="#a9805a" stroke="#8f6a3a" stroke-width="2"/>` +
  `<rect x="46" y="18" width="8" height="26" fill="#8f96a6" stroke="#6f7686" stroke-width="1.6"/><rect x="32" y="44" width="36" height="10" rx="3" fill="#d9b68a" stroke="#a8875d" stroke-width="2"/>` +
  `<path d="M44 64 C40 72 42 78 46 78 C50 78 51 72 44 64 Z" fill="#f05a6a" opacity="0.85"/>`

const dryingRack =
  shadow +
  `<path d="M24 90 L36 12 M76 90 L64 12" stroke="#a9805a" stroke-width="4" stroke-linecap="round"/>` +
  [30, 54]
    .map(
      (y) =>
        `<line x1="${28 + (y - 30) * 0.05}" y1="${y}" x2="${72 - (y - 30) * 0.05}" y2="${y}" stroke="#8f6a3a" stroke-width="2.4"/>`,
    )
    .join('') +
  [
    [38, 30],
    [52, 30],
    [64, 30],
    [42, 54],
    [58, 54],
  ]
    .map(
      ([x, y]) =>
        `<path d="M${x} ${y} C${x - 7} ${y + 8} ${x - 4} ${y + 18} ${x} ${y + 20} C${x + 4} ${y + 18} ${x + 7} ${y + 8} ${x} ${y} Z" fill="#9dd28f" stroke="#4f8a4a" stroke-width="1.6"/>`,
    )
    .join('')

const spinningWheel =
  shadow +
  `<circle cx="44" cy="46" r="30" fill="none" stroke="#a9805a" stroke-width="4"/>` +
  [0, 45, 90, 135]
    .map(
      (a) =>
        `<line transform="rotate(${a} 44 46)" x1="44" y1="18" x2="44" y2="74" stroke="#c99a6a" stroke-width="2.4"/>`,
    )
    .join('') +
  `<circle cx="44" cy="46" r="5" fill="#d9b68a" stroke="#8f6a3a" stroke-width="2"/>` +
  `<path d="M30 88 L44 52 L58 88 M72 88 L76 40" stroke="#8f6a3a" stroke-width="3" stroke-linecap="round"/>` +
  `<ellipse cx="78" cy="34" rx="7" ry="10" fill="#ffffff" stroke="#c9ccd6" stroke-width="2"/>`

const cauldron =
  shadow +
  `<path d="M16 42 L84 42 Q86 86 50 88 Q14 86 16 42 Z" fill="#5a4c6e" stroke="#3a2f4a" stroke-width="2.8"/>` +
  `<ellipse cx="50" cy="42" rx="35" ry="9" fill="#7c5cff" stroke="#3a2f4a" stroke-width="2.6"/>` +
  `<ellipse cx="50" cy="42" rx="27" ry="6" fill="#a78bfa"/>` +
  `<circle cx="40" cy="38" r="4" fill="#d8ccff" stroke="#7c5cff" stroke-width="1"/><circle cx="58" cy="34" r="3" fill="#d8ccff" stroke="#7c5cff" stroke-width="1"/><circle cx="50" cy="26" r="2.4" fill="#d8ccff"/>` +
  `<path d="M24 86 L20 94 M76 86 L80 94" stroke="#3a2f4a" stroke-width="3" stroke-linecap="round"/>` +
  `<path d="M26 54 Q22 66 28 76" fill="none" stroke="#8a7aa8" stroke-width="3" stroke-linecap="round"/>`

const ritualCircle =
  `<circle cx="50" cy="56" r="34" fill="#fff3b0" opacity="0.3"/>` +
  `<ellipse cx="50" cy="62" rx="36" ry="20" fill="none" stroke="#cdbbf5" stroke-width="2" stroke-dasharray="4 4"/>` +
  Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2
    const x = 50 + Math.cos(a) * 36
    const y = 62 + Math.sin(a) * 20
    return `<ellipse cx="${x.toFixed(1)}" cy="${(y - 4).toFixed(1)}" rx="6" ry="7" fill="#d4d0dc" stroke="#9a94a6" stroke-width="1.8"/>`
  }).join('') +
  `<path d="M50 44 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3 Z" fill="#ffe59e" stroke="#e2b94f" stroke-width="1.4"/>`

// ---------------------------------------------------------------------------------------------
// Spell sigils: a glowing round badge with a symbol

const sigil = (symbol: string, glow = '#a78bfa') =>
  `<circle cx="50" cy="50" r="44" fill="${glow}" opacity="0.25"/>` +
  `<circle cx="50" cy="50" r="36" fill="#f1ecff" stroke="${glow}" stroke-width="4"/>` +
  `<circle cx="50" cy="50" r="28" fill="none" stroke="${glow}" stroke-width="1.6" stroke-dasharray="3 5"/>` +
  `<g transform="translate(50 50)">${symbol}</g>`

const SPELL_SYMBOLS = {
  bugbane: `<path d="M-14 -10 Q0 -22 14 -10 M-16 0 Q0 -10 16 0 M-14 10 Q0 0 14 10" fill="none" stroke="#7c5cff" stroke-width="3.4" stroke-linecap="round"/>`,
  lullaby: `<path d="M-6 12 L-6 -12 L12 -16 L12 8" fill="none" stroke="#7c5cff" stroke-width="3.4" stroke-linejoin="round"/><ellipse cx="-10" cy="12" rx="5" ry="4" fill="#7c5cff"/><ellipse cx="8" cy="8" rx="5" ry="4" fill="#7c5cff"/>`,
  gust: `<path d="M-18 -6 H6 Q14 -6 14 -13 Q14 -19 8 -19 M-18 4 H12 Q20 4 20 11 Q20 17 14 17 M-12 13 H0" fill="none" stroke="#7c5cff" stroke-width="3.4" stroke-linecap="round"/>`,
  tanglevine: `<path d="M-16 16 C-16 0 0 6 0 -6 C0 -16 14 -14 14 -4 C14 6 2 4 4 16" fill="none" stroke="#4f8a4a" stroke-width="3.4" stroke-linecap="round"/><path d="M-6 0 C-12 -4 -14 -10 -8 -10 C-4 -10 -4 -4 -6 0 Z" fill="#9dd28f" stroke="#4f8a4a" stroke-width="1.4"/>`,
  kindred: `<path d="M0 16 C-20 2 -16 -16 -6 -16 C-2 -16 0 -12 0 -10 C0 -12 2 -16 6 -16 C16 -16 20 2 0 16 Z" fill="#f7b7c8" stroke="#7c5cff" stroke-width="2.6"/><circle cx="-14" cy="-18" r="2" fill="#7c5cff"/><circle cx="14" cy="-18" r="2" fill="#7c5cff"/>`,
  parley: `<path d="M-18 -12 H8 Q14 -12 14 -6 V2 Q14 8 8 8 H-6 L-14 15 V8 H-18 Q-22 8 -22 2 V-6 Q-22 -12 -18 -12 Z" fill="#ffffff" stroke="#7c5cff" stroke-width="2.6"/><path d="M-12 -4 H4 M-12 1 H0" stroke="#7c5cff" stroke-width="2.2" stroke-linecap="round"/><path d="M14 10 C10 16 14 20 18 18 C22 16 20 10 14 10 Z" fill="#f05a6a"/>`,
}

// ---------------------------------------------------------------------------------------------
// Curios: a keepsake in a soft glowing frame

const curio = (inner: string) =>
  `<circle cx="50" cy="50" r="44" fill="#e9ddff" opacity="0.5"/>` +
  `<circle cx="50" cy="50" r="36" fill="#fffaf0" stroke="#cdbbf5" stroke-width="3"/>` +
  inner

const compass = curio(
  `<circle cx="50" cy="50" r="22" fill="#e6c48a" stroke="#a8875d" stroke-width="3"/><circle cx="50" cy="50" r="16" fill="#fffaf0" stroke="#c9a77f" stroke-width="1.6"/>` +
    `<path d="M50 36 L55 50 L50 64 L45 50 Z" fill="#f05a6a"/><path d="M50 50 L55 50 L50 64 L45 50 Z" fill="#7fa8d6"/><circle cx="50" cy="50" r="2.4" fill="#a8875d"/>` +
    `<rect x="46" y="22" width="8" height="6" rx="2" fill="#e6c48a" stroke="#a8875d" stroke-width="1.6"/>`,
)

const ribbon = curio(
  `<path d="M50 50 L36 82 L44 78 L48 86 L52 54 Z" fill="#f05a6a" stroke="#c23a4c" stroke-width="2"/><path d="M50 50 L64 82 L56 78 L52 86 L48 54 Z" fill="#f7b7c8" stroke="#c97a8c" stroke-width="2"/>` +
    `<circle cx="50" cy="44" r="14" fill="#ffd94f" stroke="#c99a24" stroke-width="2.4"/>${[
      0, 45, 90, 135, 180, 225, 270, 315,
    ]
      .map(
        (a) =>
          `<circle transform="rotate(${a} 50 44)" cx="50" cy="28" r="3.4" fill="#ffd94f" stroke="#c99a24" stroke-width="1.2"/>`,
      )
      .join('')}<circle cx="50" cy="44" r="5" fill="#fff6c8"/>`,
)

const sundial = curio(
  `<circle cx="50" cy="56" r="22" fill="#d9dde6" stroke="#8f96a6" stroke-width="3"/>` +
    [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330]
      .map(
        (a) =>
          `<line transform="rotate(${a} 50 56)" x1="50" y1="37" x2="50" y2="41" stroke="#8f96a6" stroke-width="1.6"/>`,
      )
      .join('') +
    `<path d="M50 56 L50 36 L64 56 Z" fill="#f2b45c" stroke="#c48a2a" stroke-width="2"/>` +
    `<circle cx="72" cy="30" r="6" fill="#ffe59e" stroke="#e2b94f" stroke-width="1.4"/>`,
)

export const MISC_ART: Record<string, string> = {
  'icon-glimmers': glimmers,
  'icon-trinkets': trinkets,
  'icon-satchel': satchel,
  'icon-lodging': lodging,
  'icon-gloves': gloves,
  'icon-wings': wings,
  'icon-comfort': comfort,

  'station-mortar': mortar,
  'station-press': press,
  'station-drying-rack': dryingRack,
  'station-spinning-wheel': spinningWheel,
  'station-cauldron': cauldron,
  'feature-ritual-circle': ritualCircle,

  'spell-bugbane': sigil(SPELL_SYMBOLS.bugbane),
  'spell-lullaby': sigil(SPELL_SYMBOLS.lullaby),
  'spell-gust': sigil(SPELL_SYMBOLS.gust),
  'spell-tanglevine': sigil(SPELL_SYMBOLS.tanglevine, '#7fbf6a'),
  'spell-kindred-call': sigil(SPELL_SYMBOLS.kindred, '#f7b7c8'),
  'spell-parley': sigil(SPELL_SYMBOLS.parley),

  'curio-pips-compass': compass,
  'curio-festival-ribbon': ribbon,
  'curio-pocket-sundial': sundial,
}
