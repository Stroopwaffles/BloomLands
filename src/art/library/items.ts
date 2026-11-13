/**
 * Item icons (content doc → Asset List → Item Icons). Families share a template (bottle, jar,
 * pouch, ...) with their own colors and a small symbol, so the set looks consistent.
 */

/** A darker shade of a hex color, for outlines. */
const shade = (hex: string, amount = 0.7): string => {
  const n = parseInt(hex.slice(1), 16)
  const c = (shift: number) => Math.round(((n >> shift) & 255) * amount)
  return `rgb(${c(16)} ${c(8)} ${c(0)})`
}

const shadow = `<ellipse cx="50" cy="90" rx="26" ry="5" fill="#5a4352" opacity="0.12"/>`

// ---------------------------------------------------------------------------------------------
// Small symbols drawn on labels, centered on (0, 0), about 16 units across

const SYMBOLS: Record<string, (color: string) => string> = {
  sun: (c) =>
    `<circle r="5" fill="${c}"/>${[0, 45, 90, 135, 180, 225, 270, 315]
      .map(
        (a) =>
          `<line transform="rotate(${a})" x1="0" y1="-7" x2="0" y2="-9.5" stroke="${c}" stroke-width="1.8" stroke-linecap="round"/>`,
      )
      .join('')}`,
  clover: (c) =>
    [0, 120, 240]
      .map((a) => `<circle transform="rotate(${a})" cx="0" cy="-4.5" r="4" fill="${c}"/>`)
      .join(''),
  leaf: (c) => `<path d="M-7 5 C-7 -5 3 -8 7 -7 C8 2 0 8 -7 5 Z" fill="${c}"/>`,
  heart: (c) =>
    `<path d="M0 6 C-9 0 -8 -7 -3.5 -7 C-1.5 -7 0 -5 0 -4 C0 -5 1.5 -7 3.5 -7 C8 -7 9 0 0 6 Z" fill="${c}"/>`,
  star: (c) =>
    `<path d="M0 -8 L2.3 -2.4 8 -2.4 3.5 1.2 5.2 7 0 3.6 -5.2 7 -3.5 1.2 -8 -2.4 -2.3 -2.4 Z" fill="${c}"/>`,
  wing: (c) =>
    `<ellipse cx="-3" cy="-1" rx="6" ry="3.6" transform="rotate(-30 -3 -1)" fill="${c}"/><ellipse cx="3" cy="-1" rx="6" ry="3.6" transform="rotate(30 3 -1)" fill="${c}"/>`,
  drop: (c) => `<path d="M0 -8 C-6 0 -5 6 0 6 C5 6 6 0 0 -8 Z" fill="${c}"/>`,
  bag: (c) =>
    `<path d="M-6 -2 L6 -2 L7 7 L-7 7 Z" fill="${c}"/><path d="M-3 -2 Q0 -8 3 -2" fill="none" stroke="${c}" stroke-width="1.6"/>`,
  bug: (c) =>
    `<ellipse rx="5" ry="6" fill="${c}"/><line x1="0" y1="-6" x2="0" y2="6" stroke="white" stroke-width="1"/><line x1="-8" y1="0" x2="8" y2="0" stroke="${c}" stroke-width="1.4"/>`,
}

const symbol = (name: string, x: number, y: number, color: string, scale = 1) =>
  `<g transform="translate(${x} ${y}) scale(${scale})">${SYMBOLS[name](color)}</g>`

// ---------------------------------------------------------------------------------------------
// Raw materials: little piles of the plant's parts

const petalPile = (fill: string, rounded = true) =>
  shadow +
  [
    [36, 66, -30],
    [62, 64, 35],
    [50, 52, 0],
    [44, 74, -70],
    [58, 76, 70],
  ]
    .map(
      ([x, y, a]) =>
        `<path transform="translate(${x} ${y}) rotate(${a})" d="${
          rounded
            ? 'M0 12 C-10 4 -9 -12 0 -14 C9 -12 10 4 0 12 Z'
            : 'M0 12 C-8 2 -6 -12 0 -16 C6 -12 8 2 0 12 Z'
        }" fill="${fill}" stroke="${shade(fill, 0.8)}" stroke-width="1.8"/>`,
    )
    .join('')

const leafPile = (fill: string, clover = false) =>
  shadow +
  [
    [38, 62, -40],
    [62, 60, 40],
    [50, 74, 0],
  ]
    .map(([x, y, a]) =>
      clover
        ? `<g transform="translate(${x} ${y}) rotate(${a})">${[0, 120, 240]
            .map(
              (r) =>
                `<path transform="rotate(${r}) scale(0.7)" d="M0 0 C-11 -7 -16 -20 -7 -24 C-3 -26 0 -22 0 -19 C0 -22 3 -26 7 -24 C16 -20 11 -7 0 0 Z" fill="${fill}" stroke="${shade(fill)}" stroke-width="2"/>`,
            )
            .join('')}</g>`
        : `<path transform="translate(${x} ${y}) rotate(${a})" d="M0 14 C-12 4 -10 -14 0 -18 C10 -14 12 4 0 14 Z" fill="${fill}" stroke="${shade(fill)}" stroke-width="1.8"/><line transform="translate(${x} ${y}) rotate(${a})" x1="0" y1="12" x2="0" y2="-14" stroke="${shade(fill)}" stroke-width="1.2"/>`,
    )
    .join('')

const fluff =
  shadow +
  [
    [40, 60, 14],
    [60, 56, 15],
    [50, 72, 16],
  ]
    .map(
      ([x, y, r]) =>
        `<circle cx="${x}" cy="${y}" r="${r}" fill="#ffffff" stroke="#c9ccd6" stroke-width="1.8"/>${[
          0, 60, 120, 180, 240, 300,
        ]
          .map(
            (a) =>
              `<line transform="translate(${x} ${y}) rotate(${a})" x1="0" y1="0" x2="0" y2="${-r + 3}" stroke="#dadde5" stroke-width="1"/>`,
          )
          .join('')}`,
    )
    .join('')

const berries =
  shadow +
  [
    [38, 64],
    [60, 60],
    [50, 76],
  ]
    .map(
      ([x, y]) =>
        `<g transform="translate(${x} ${y}) scale(1.5)"><path d="M0 -8 C7 -8 9 2 0 10 C-9 2 -7 -8 0 -8 Z" fill="#f05a6a" stroke="#c23a4c" stroke-width="1.3"/><path d="M-5 -9 L0 -6 5 -9 2 -12 -2 -12 Z" fill="#7fbf6a" stroke="#4f8a4a" stroke-width="0.9"/><circle cx="-2" cy="-1" r="0.8" fill="#ffe59e"/><circle cx="2" cy="3" r="0.8" fill="#ffe59e"/></g>`,
    )
    .join('')

const dewdrops =
  shadow +
  [
    [38, 66, 1.3],
    [62, 60, 1.6],
    [52, 80, 1],
  ]
    .map(
      ([x, y, s]) =>
        `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 -14 C-10 0 -9 10 0 10 C9 10 10 0 0 -14 Z" fill="#cdeeff" stroke="#7fb8dc" stroke-width="1.6"/><ellipse cx="-3" cy="2" rx="2" ry="3.4" fill="white"/></g>`,
    )
    .join('')

const ringcaps =
  shadow +
  [
    [38, 74, 0.8],
    [60, 70, 1],
  ]
    .map(
      ([x, y, s]) =>
        `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-6 16 L-5 0 L5 0 L6 16 Z" fill="#fbf1e2" stroke="#d8bf9c" stroke-width="1.6"/><path d="M-18 2 C-18 -18 18 -18 18 2 Q0 6 -18 2 Z" fill="#f08a9e" stroke="#c45d74" stroke-width="2"/><circle cx="-7" cy="-6" r="2.6" fill="#fff6f0"/><circle cx="5" cy="-9" r="3" fill="#fff6f0"/></g>`,
    )
    .join('')

// ---------------------------------------------------------------------------------------------
// Containers

const bowl = (fill: string, sym: string) =>
  shadow +
  `<path d="M20 52 Q50 50 80 52 Q78 86 50 88 Q22 86 20 52 Z" fill="#f3e3cf" stroke="#c9a77f" stroke-width="2.2"/>` +
  `<ellipse cx="50" cy="52" rx="30" ry="8" fill="${fill}" stroke="${shade(fill)}" stroke-width="2"/>` +
  `<path d="M34 50 Q42 46 50 50" fill="none" stroke="white" stroke-width="2" opacity="0.6" stroke-linecap="round"/>` +
  symbol(sym, 50, 72, '#c9a77f', 1.1)

const bottle = (liquid: string, sym: string, shape: 'round' | 'tall' | 'flask' = 'round') => {
  const glass = '#eef6ff'
  const outline = shade(liquid, 0.65)
  const body =
    shape === 'tall'
      ? `<path d="M40 30 L60 30 L62 40 Q68 46 68 58 L68 82 Q68 90 58 90 L42 90 Q32 90 32 82 L32 58 Q32 46 38 40 Z"`
      : shape === 'flask'
        ? `<path d="M42 28 L58 28 L58 46 L74 82 Q76 90 66 90 L34 90 Q24 90 26 82 L42 46 Z"`
        : `<path d="M42 28 L58 28 L58 42 Q76 48 76 66 Q76 90 50 90 Q24 90 24 66 Q24 48 42 42 Z"`
  const fillTop = shape === 'flask' ? 62 : 58
  return (
    shadow +
    `<defs><clipPath id="clip-${shape}-${liquid.slice(1)}">${body}/></clipPath></defs>` +
    `${body} fill="${glass}" stroke="${outline}" stroke-width="2.4"/>` +
    `<rect x="20" y="${fillTop}" width="60" height="40" fill="${liquid}" clip-path="url(#clip-${shape}-${liquid.slice(1)})" opacity="0.9"/>` +
    `${body} fill="none" stroke="${outline}" stroke-width="2.4"/>` +
    `<rect x="40" y="18" width="20" height="11" rx="3" fill="#c9a77f" stroke="#9a7a55" stroke-width="2"/>` +
    `<path d="M34 54 Q32 66 36 76" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" opacity="0.7"/>` +
    symbol(sym, 52, 74, 'white', 1.1)
  )
}

const jar = (fill: string, sym: string) =>
  shadow +
  `<rect x="26" y="34" width="48" height="54" rx="12" fill="${fill}" stroke="${shade(fill)}" stroke-width="2.4"/>` +
  `<rect x="30" y="24" width="40" height="12" rx="4" fill="#f3e3cf" stroke="#c9a77f" stroke-width="2"/>` +
  `<path d="M30 30 L70 30" stroke="#c9a77f" stroke-width="1.4"/>` +
  `<rect x="34" y="52" width="32" height="24" rx="6" fill="#fffaf0" stroke="${shade(fill, 0.8)}" stroke-width="1.6"/>` +
  symbol(sym, 50, 64, shade(fill, 0.85), 1) +
  `<path d="M32 42 L32 80" stroke="white" stroke-width="3" stroke-linecap="round" opacity="0.5"/>`

const pouch = (fill: string, sym: string) =>
  shadow +
  `<path d="M30 40 Q22 64 26 80 Q30 90 50 90 Q70 90 74 80 Q78 64 70 40 Z" fill="${fill}" stroke="${shade(fill)}" stroke-width="2.4"/>` +
  `<path d="M30 40 Q50 32 70 40 Q66 30 58 28 L42 28 Q34 30 30 40 Z" fill="${shade(fill, 0.9)}" stroke="${shade(fill)}" stroke-width="2"/>` +
  `<path d="M32 42 Q50 48 68 42" fill="none" stroke="#c9a77f" stroke-width="2.4"/>` +
  symbol(sym, 50, 66, '#fffaf0', 1.2) +
  [0, 1, 2]
    .map((i) => `<circle cx="${40 + i * 10}" cy="${22 - (i % 2) * 4}" r="1.6" fill="#fff3b0"/>`)
    .join('')

const spool = (thread: string) =>
  shadow +
  `<rect x="28" y="24" width="44" height="10" rx="4" fill="#d9b68a" stroke="#a8875d" stroke-width="2"/>` +
  `<rect x="28" y="78" width="44" height="10" rx="4" fill="#d9b68a" stroke="#a8875d" stroke-width="2"/>` +
  `<rect x="32" y="33" width="36" height="46" fill="${thread}" stroke="${shade(thread, 0.75)}" stroke-width="2"/>` +
  [40, 48, 56, 64, 72]
    .map(
      (y) =>
        `<path d="M32 ${y} Q50 ${y - 4} 68 ${y}" fill="none" stroke="${shade(thread, 0.8)}" stroke-width="1.2"/>`,
    )
    .join('') +
  `<path d="M68 60 Q80 66 76 80" fill="none" stroke="${shade(thread, 0.8)}" stroke-width="1.6"/>`

const cup = (liquid: string, sym: string) =>
  shadow +
  `<path d="M24 46 L76 46 Q74 84 50 86 Q26 84 24 46 Z" fill="#fffaf0" stroke="#c9a77f" stroke-width="2.4"/>` +
  `<path d="M76 54 Q90 56 86 68 Q82 76 72 72" fill="none" stroke="#c9a77f" stroke-width="3"/>` +
  `<ellipse cx="50" cy="47" rx="25" ry="6" fill="${liquid}" stroke="${shade(liquid)}" stroke-width="1.6"/>` +
  `<g fill="none" stroke="#d6cbe8" stroke-width="2.2" stroke-linecap="round" opacity="0.8"><path d="M40 38 q-4 -6 0 -12 q4 -6 0 -12"/><path d="M56 36 q-4 -6 0 -12 q4 -6 0 -12"/></g>` +
  symbol(sym, 50, 68, '#c9a77f', 1)

const twine = (fill: string) =>
  shadow +
  [0, 1, 2, 3]
    .map(
      (i) =>
        `<ellipse cx="50" cy="${44 + i * 10}" rx="${26 - i}" ry="9" fill="${i === 0 ? fill : 'none'}" stroke="${shade(fill)}" stroke-width="3"/>`,
    )
    .join('') +
  `<path d="M24 46 Q14 70 30 84" fill="none" stroke="${shade(fill)}" stroke-width="3" stroke-linecap="round"/>` +
  `<path d="M76 74 Q86 80 82 90" fill="none" stroke="${shade(fill)}" stroke-width="3" stroke-linecap="round"/>`

const smudge =
  shadow +
  `<g transform="rotate(-20 50 60)"><rect x="40" y="30" width="20" height="54" rx="9" fill="#a9c79a" stroke="#6e8f60" stroke-width="2.2"/>` +
  [40, 52, 64, 76]
    .map(
      (y) =>
        `<path d="M40 ${y} Q50 ${y + 5} 60 ${y}" fill="none" stroke="#c97a8c" stroke-width="2"/>`,
    )
    .join('') +
  `</g><g fill="none" stroke="#c8c3d4" stroke-width="2.4" stroke-linecap="round" opacity="0.85"><path d="M38 28 q-6 -6 0 -12 q6 -6 0 -12"/><path d="M48 24 q-5 -5 0 -10"/></g>`

const candy =
  shadow +
  `<path d="M26 60 L12 48 L14 72 Z" fill="#f7b7c8" stroke="#c97a8c" stroke-width="2"/>` +
  `<path d="M74 60 L88 48 L86 72 Z" fill="#f7b7c8" stroke="#c97a8c" stroke-width="2"/>` +
  `<ellipse cx="50" cy="60" rx="26" ry="18" fill="#f05a6a" stroke="#c23a4c" stroke-width="2.4"/>` +
  `<path d="M36 52 Q50 44 64 52" fill="none" stroke="#ffd2d8" stroke-width="3" stroke-linecap="round"/>` +
  symbol('heart', 50, 62, '#ffe0e6', 1)

// ---------------------------------------------------------------------------------------------
// Trinkets

const button =
  shadow +
  `<circle cx="50" cy="56" r="28" fill="#7fa8d6" stroke="#4f78a6" stroke-width="2.6"/>` +
  `<circle cx="50" cy="56" r="20" fill="none" stroke="#a9c8ec" stroke-width="2"/>` +
  [
    [43, 49],
    [57, 49],
    [43, 63],
    [57, 63],
  ]
    .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.6" fill="#3d5f8a"/>`)
    .join('') +
  `<path d="M43 49 L57 63 M57 49 L43 63" stroke="#f3e3cf" stroke-width="1.6"/>`

const bead =
  shadow +
  `<circle cx="50" cy="56" r="26" fill="#b9a3e8" stroke="#7c5cff" stroke-width="2.4" opacity="0.92"/>` +
  `<ellipse cx="50" cy="56" rx="6" ry="26" fill="#d9cdf7" opacity="0.7"/>` +
  `<circle cx="40" cy="44" r="6" fill="white" opacity="0.8"/>` +
  `<path d="M70 26 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 Z" fill="#fff3b0" stroke="#e2b94f" stroke-width="1"/>`

const thimble =
  shadow +
  `<path d="M30 86 L34 40 Q36 24 50 24 Q64 24 66 40 L70 86 Z" fill="#d9dde6" stroke="#8f96a6" stroke-width="2.4"/>` +
  `<rect x="28" y="80" width="44" height="8" rx="3" fill="#c3c8d4" stroke="#8f96a6" stroke-width="2"/>` +
  [36, 46, 56, 66]
    .flatMap((y) =>
      [40, 48, 56, 62].map(
        (x) => `<circle cx="${x - (y > 60 ? 2 : 0)}" cy="${y}" r="1.4" fill="#a3a9b8"/>`,
      ),
    )
    .join('') +
  `<path d="M38 34 Q36 56 38 76" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" opacity="0.7"/>`

const lucky =
  shadow +
  `<circle cx="50" cy="56" r="28" fill="#fff3b0" opacity="0.5"/>` +
  `<g transform="translate(50 58) scale(1.2)">${[45, 135, 225, 315]
    .map(
      (a) =>
        `<path transform="rotate(${a}) scale(0.8)" d="M0 0 C-11 -7 -16 -20 -7 -24 C-3 -26 0 -22 0 -19 C0 -22 3 -26 7 -24 C16 -20 11 -7 0 0 Z" fill="#7fd17a" stroke="#3f7f3c" stroke-width="2"/>`,
    )
    .join('')}</g>`

// ---------------------------------------------------------------------------------------------

export const ITEM_ART: Record<string, string> = {
  // Raw materials
  'raw-clover-leaves': leafPile('#8cc97f', true),
  'raw-daisy-petals': petalPile('#ffffff'),
  'raw-buttercup-petals': petalPile('#ffd94f'),
  'raw-dandelion-fluff': fluff,
  'raw-wild-berries': berries,
  'raw-dewdrops': dewdrops,
  'raw-lucky-leaf': lucky,
  'raw-ringcap': ringcaps,

  // Material tags (for "any petals" etc.)
  'tag-petals': petalPile('#f7b7c8'),
  'tag-leaves': leafPile('#9dd28f'),
  'tag-fluff': fluff,
  'tag-fruit': berries,
  'tag-caps': ringcaps,
  'tag-trinket': bead,

  // Refined materials
  'refined-petal-paste': bowl('#f7b7c8', 'heart'),
  'refined-leaf-tea': cup('#a6d98f', 'leaf'),
  'refined-berry-juice': bottle('#f05a6a', 'heart', 'tall'),
  'refined-fluff-thread': spool('#ffffff'),
  'refined-dew-water': bottle('#9fd2f5', 'drop', 'tall'),
  'refined-lucky-essence': bottle('#8fe08a', 'clover', 'flask'),

  // Components
  'component-sun-salve': jar('#ffd94f', 'sun'),
  'component-lucky-charm-dust': pouch('#5fae6a', 'clover'),
  'component-thistle-twine': twine('#cdbbf5'),
  'component-calming-tea': cup('#cdbbf5', 'heart'),
  'component-sweet-bait': candy,
  'component-pest-smudge': smudge,

  // Potions
  'potion-greenthumb-brew': bottle('#6fcf6a', 'leaf'),
  'potion-quickwing-tonic': bottle('#8fd3ff', 'wing'),
  'potion-deep-pockets-draught': bottle('#f2b45c', 'bag'),
  'potion-lucky-dew': bottle('#ffe066', 'star'),

  // Trinkets
  'trinket-lost-button': button,
  'trinket-glass-bead': bead,
  'trinket-thimble': thimble,
}
