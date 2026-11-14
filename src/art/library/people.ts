/**
 * Characters and creatures (content doc → Asset List → Characters, Creatures, Mounts).
 * Thimblewick's field mice share one template, each with their own fur and accessory.
 */

const shade = (hex: string, amount = 0.7): string => {
  const n = parseInt(hex.slice(1), 16)
  const c = (shift: number) => Math.round(((n >> shift) & 255) * amount)
  return `rgb(${c(16)} ${c(8)} ${c(0)})`
}

const shadow = `<ellipse cx="50" cy="93" rx="24" ry="4.5" fill="#5a4352" opacity="0.14"/>`

interface MouseLook {
  fur: string
  /** Extra drawing behind the body (cape, tail accessories). */
  behind?: string
  /** Clothing over the body. */
  wear?: string
  /** Things on or around the head. */
  top?: string
  /** Something held or carried in front. */
  front?: string
}

/** A field mouse: big round ears, pink nose, little whiskers. */
const mouse = ({ fur, behind = '', wear = '', top = '', front = '' }: MouseLook) => {
  const line = shade(fur, 0.68)
  return (
    shadow +
    `<path d="M66 80 Q84 82 86 70 Q88 62 82 60" fill="none" stroke="${line}" stroke-width="2.4" stroke-linecap="round"/>` +
    behind +
    `<ellipse cx="50" cy="74" rx="20" ry="19" fill="${fur}" stroke="${line}" stroke-width="2"/>` +
    `<ellipse cx="50" cy="78" rx="11" ry="12" fill="#fff3ea" opacity="0.7"/>` +
    wear +
    `<ellipse cx="42" cy="91" rx="6" ry="3.4" fill="${fur}" stroke="${line}" stroke-width="1.6"/>` +
    `<ellipse cx="58" cy="91" rx="6" ry="3.4" fill="${fur}" stroke="${line}" stroke-width="1.6"/>` +
    `<circle cx="30" cy="30" r="13" fill="${fur}" stroke="${line}" stroke-width="2"/><circle cx="30" cy="30" r="7.5" fill="#f7b7c8"/>` +
    `<circle cx="70" cy="30" r="13" fill="${fur}" stroke="${line}" stroke-width="2"/><circle cx="70" cy="30" r="7.5" fill="#f7b7c8"/>` +
    `<ellipse cx="50" cy="46" rx="21" ry="19" fill="${fur}" stroke="${line}" stroke-width="2"/>` +
    `<circle cx="42" cy="44" r="3" fill="#3d2f3a"/><circle cx="58" cy="44" r="3" fill="#3d2f3a"/>` +
    `<circle cx="43" cy="43" r="1" fill="white"/><circle cx="59" cy="43" r="1" fill="white"/>` +
    `<circle cx="37" cy="51" r="3" fill="#f7a6b8" opacity="0.55"/><circle cx="63" cy="51" r="3" fill="#f7a6b8" opacity="0.55"/>` +
    `<ellipse cx="50" cy="52" rx="3" ry="2.4" fill="#e67a92"/>` +
    `<path d="M47 56 Q50 58.5 53 56" fill="none" stroke="${line}" stroke-width="1.4" stroke-linecap="round"/>` +
    `<g stroke="${line}" stroke-width="1" stroke-linecap="round"><path d="M44 53 L32 51"/><path d="M44 55 L33 57"/><path d="M56 53 L68 51"/><path d="M56 55 L67 57"/></g>` +
    top +
    front
  )
}

const basket = `<g transform="translate(66 70)"><path d="M-12 0 L12 0 L9 14 L-9 14 Z" fill="#d9b68a" stroke="#a8875d" stroke-width="1.8"/><path d="M-9 0 Q0 -14 9 0" fill="none" stroke="#a8875d" stroke-width="2"/><circle cx="-4" cy="-2" r="3" fill="#ffd94f"/><circle cx="3" cy="-2" r="3" fill="#ffffff" stroke="#d9cfe0" stroke-width="0.8"/></g>`
const satchelStrap = `<path d="M36 62 L64 86" stroke="#a8875d" stroke-width="3"/><rect x="58" y="80" width="14" height="11" rx="3" fill="#c97a3a" stroke="#8f5426" stroke-width="1.6"/>`
const bandana = `<path d="M30 36 Q50 22 70 36 Q50 30 30 36 Z" fill="#c23a4c" stroke="#8f2636" stroke-width="1.6"/><path d="M70 36 L80 32 L78 42 Z" fill="#c23a4c" stroke="#8f2636" stroke-width="1.4"/><circle cx="44" cy="31" r="1.4" fill="white"/><circle cx="55" cy="30" r="1.4" fill="white"/>`

const ladle = `<g transform="translate(68 70) rotate(20)"><path d="M0 -18 L0 4" stroke="#a8875d" stroke-width="2.6" stroke-linecap="round"/><path d="M-7 4 Q0 14 7 4 Z" fill="#c9cdd6" stroke="#8f96a6" stroke-width="1.6"/></g>`
const goggles = `<path d="M28 38 Q50 30 72 38" fill="none" stroke="#7a5a44" stroke-width="3"/><g stroke="#8f5426" stroke-width="2"><circle cx="41" cy="36" r="6.5" fill="#bfe8ff"/><circle cx="59" cy="36" r="6.5" fill="#bfe8ff"/></g><path d="M38 33 l3 -2 M56 33 l3 -2" stroke="white" stroke-width="1.6" stroke-linecap="round"/>`
const peddlerCap = `<path d="M32 34 Q50 18 68 34 Z" fill="#6e8f4a" stroke="#4a6630" stroke-width="1.6"/><path d="M66 33 L78 36 L66 37 Z" fill="#4a6630"/><circle cx="50" cy="22" r="2.6" fill="#f2c94f"/>`
const coinPurse = `<g transform="translate(66 74)"><path d="M-9 -4 Q-12 10 0 12 Q12 10 9 -4 Z" fill="#c97a3a" stroke="#8f5426" stroke-width="1.6"/><path d="M-9 -4 Q0 -9 9 -4" fill="none" stroke="#8f5426" stroke-width="2"/><circle cx="-4" cy="-10" r="4" fill="#f2c94f" stroke="#a87e1a" stroke-width="1.2"/><circle cx="4" cy="-12" r="3.4" fill="#f2c94f" stroke="#a87e1a" stroke-width="1.2"/></g>`
const glasses = `<g fill="none" stroke="#8f6a3a" stroke-width="1.6"><circle cx="42" cy="44" r="5.5"/><circle cx="58" cy="44" r="5.5"/><path d="M47.5 44 L52.5 44"/></g>`
const scroll = `<g transform="translate(70 76) rotate(-20)"><rect x="-6" y="-12" width="12" height="24" rx="3" fill="#fbf1e2" stroke="#c9a77f" stroke-width="1.6"/><path d="M-3 -6 L3 -6 M-3 0 L3 0 M-3 6 L1 6" stroke="#c9a77f" stroke-width="1.2"/></g>`
const apron = `<path d="M38 66 L62 66 L64 88 Q50 92 36 88 Z" fill="#ffffff" stroke="#d9cfe0" stroke-width="1.6"/><circle cx="50" cy="76" r="3" fill="#f05a6a"/>`
const chefHat = `<g fill="#ffffff" stroke="#d9cfe0" stroke-width="1.6"><rect x="38" y="22" width="24" height="8" rx="2"/><circle cx="42" cy="18" r="7"/><circle cx="50" cy="15" r="8"/><circle cx="58" cy="18" r="7"/></g>`
const thimbleHat = `<path d="M38 30 L41 14 Q50 8 59 14 L62 30 Z" fill="#d9dde6" stroke="#8f96a6" stroke-width="1.6"/><g fill="#a3a9b8"><circle cx="46" cy="20" r="1"/><circle cx="52" cy="18" r="1"/><circle cx="55" cy="24" r="1"/><circle cx="45" cy="26" r="1"/></g>`
const flowerTuck = `<g transform="translate(66 26)">${[0, 72, 144, 216, 288].map((a) => `<circle transform="rotate(${a})" cx="0" cy="-4" r="3.4" fill="#cdbbf5" stroke="#9a86cf" stroke-width="1"/>`).join('')}<circle r="2.2" fill="#ffe59e"/></g>`
const elderBits = `<path d="M40 56 Q50 72 60 56 Q56 66 50 68 Q44 66 40 56 Z" fill="#f3f0f7" stroke="#c9c3d4" stroke-width="1.4"/><path d="M76 92 L70 58 Q68 52 74 52" fill="none" stroke="#8f6a3a" stroke-width="3" stroke-linecap="round"/>`

// ---------------------------------------------------------------------------------------------

const snail =
  shadow +
  `<path d="M14 86 Q14 76 26 76 L70 76 Q84 76 84 86 Z" fill="#cfe6b8" stroke="#8fae74" stroke-width="2"/>` +
  `<path d="M20 78 Q16 60 24 50 Q30 44 34 52 Q36 62 30 78" fill="#cfe6b8" stroke="#8fae74" stroke-width="2"/>` +
  `<path d="M24 50 L20 38 M30 50 L32 38" stroke="#8fae74" stroke-width="2" stroke-linecap="round"/><circle cx="20" cy="37" r="2.4" fill="#3d2f3a"/><circle cx="32" cy="37" r="2.4" fill="#3d2f3a"/>` +
  `<circle cx="27" cy="60" r="1.6" fill="#3d2f3a"/><path d="M24 66 Q27 68 30 66" fill="none" stroke="#6f8a58" stroke-width="1.2"/>` +
  `<circle cx="60" cy="56" r="22" fill="#f2c08a" stroke="#c48a4a" stroke-width="2.4"/><path d="M60 56 m0 -14 a14 14 0 1 1 -12 7 a9 9 0 1 1 8 -5" fill="none" stroke="#c48a4a" stroke-width="2"/>` +
  `<rect x="54" y="20" width="26" height="16" rx="3" fill="#c97a3a" stroke="#8f5426" stroke-width="1.8"/><path d="M54 26 L80 26" stroke="#8f5426" stroke-width="1.2"/><circle cx="60" cy="18" r="3" fill="#ffd94f"/><circle cx="68" cy="16" r="3" fill="#f7b7c8"/><circle cx="75" cy="18" r="3" fill="#8fd3ff"/>`

const sorrel =
  `<circle cx="50" cy="50" r="40" fill="#fff3b0" opacity="0.35"/>` +
  `<circle cx="50" cy="50" r="26" fill="#ffe59e" opacity="0.45"/>` +
  `<path d="M50 50 m0 -6 a6 6 0 1 1 -5 3 a12 12 0 1 1 10 -10 a20 20 0 1 1 -22 6" fill="none" stroke="#e2b94f" stroke-width="3" stroke-linecap="round"/>` +
  [
    [20, 32],
    [76, 26],
    [82, 62],
    [28, 74],
    [56, 82],
    [40, 18],
  ]
    .map(
      ([x, y]) =>
        `<ellipse cx="${x}" cy="${y}" rx="2.4" ry="4" transform="rotate(30 ${x} ${y})" fill="#d9b68a" stroke="#a8875d" stroke-width="0.8"/>`,
    )
    .join('') +
  `<circle cx="44" cy="46" r="2" fill="#a8875d"/><circle cx="56" cy="46" r="2" fill="#a8875d"/><path d="M45 54 Q50 57 55 54" fill="none" stroke="#a8875d" stroke-width="1.6" stroke-linecap="round"/>`

const rabbit =
  shadow +
  `<ellipse cx="54" cy="74" rx="26" ry="18" fill="#efe6dc" stroke="#b8a898" stroke-width="2"/>` +
  `<circle cx="78" cy="72" r="6" fill="#ffffff" stroke="#b8a898" stroke-width="1.6"/>` +
  `<ellipse cx="30" cy="20" rx="6" ry="18" transform="rotate(-12 30 20)" fill="#efe6dc" stroke="#b8a898" stroke-width="2"/><ellipse cx="30" cy="22" rx="2.6" ry="12" transform="rotate(-12 30 22)" fill="#f7c4d0"/>` +
  `<ellipse cx="44" cy="20" rx="6" ry="18" transform="rotate(10 44 20)" fill="#efe6dc" stroke="#b8a898" stroke-width="2"/><ellipse cx="44" cy="22" rx="2.6" ry="12" transform="rotate(10 44 22)" fill="#f7c4d0"/>` +
  `<circle cx="36" cy="50" r="17" fill="#efe6dc" stroke="#b8a898" stroke-width="2"/>` +
  `<circle cx="30" cy="47" r="2.6" fill="#3d2f3a"/><circle cx="31" cy="46" r="0.9" fill="white"/><ellipse cx="22" cy="54" rx="2.2" ry="1.8" fill="#e67a92"/>` +
  `<path d="M24 58 Q22 62 18 60" fill="none" stroke="#5f9a55" stroke-width="2"/><path d="M18 60 C12 58 10 64 16 64 C20 64 20 60 18 60 Z" fill="#8cc97f" stroke="#4f8a4a" stroke-width="1.2"/>` +
  `<ellipse cx="40" cy="90" rx="8" ry="4" fill="#efe6dc" stroke="#b8a898" stroke-width="1.6"/>`

const aphid =
  `<ellipse cx="50" cy="56" rx="22" ry="18" fill="#9fdc7c" stroke="#5f9a45" stroke-width="3"/>` +
  `<circle cx="30" cy="48" r="11" fill="#9fdc7c" stroke="#5f9a45" stroke-width="3"/>` +
  `<circle cx="26" cy="45" r="2.6" fill="#3d2f3a"/>` +
  `<g stroke="#5f9a45" stroke-width="2.4" stroke-linecap="round"><path d="M24 38 L16 26"/><path d="M30 37 L30 24"/><path d="M40 72 L36 82"/><path d="M52 74 L52 84"/><path d="M64 70 L70 80"/></g>` +
  `<ellipse cx="54" cy="48" rx="10" ry="5" fill="#d8f5c4" opacity="0.7"/>`

const drifters =
  shadow +
  `<line x1="50" y1="60" x2="50" y2="92" stroke="#b8bcc8" stroke-width="2"/>` +
  `<circle cx="50" cy="60" r="20" fill="#ffffff" stroke="#c9ccd6" stroke-width="2" opacity="0.9"/>` +
  [0, 45, 90, 135, 180, 225, 270, 315]
    .map(
      (a) =>
        `<line transform="translate(50 60) rotate(${a})" x1="0" y1="0" x2="0" y2="-18" stroke="#dadde5" stroke-width="1.2"/>`,
    )
    .join('') +
  `<ellipse cx="38" cy="30" rx="10" ry="6" transform="rotate(-25 38 30)" fill="#e0e4ec" stroke="#a8aec0" stroke-width="1.4" opacity="0.9"/><ellipse cx="62" cy="30" rx="10" ry="6" transform="rotate(25 62 30)" fill="#e0e4ec" stroke="#a8aec0" stroke-width="1.4" opacity="0.9"/>` +
  `<path d="M42 50 Q50 46 58 50 L60 64 Q50 68 40 64 Z" fill="#5a4352" stroke="#3d2f3a" stroke-width="1.6"/>` +
  `<circle cx="50" cy="36" r="11" fill="#f9d4bb" stroke="#d4a487" stroke-width="1.6"/>` +
  `<path d="M38 34 Q50 20 62 34 Q50 28 38 34 Z" fill="#c23a4c" stroke="#8f2636" stroke-width="1.4"/><path d="M62 33 L70 30 L68 38 Z" fill="#c23a4c" stroke="#8f2636" stroke-width="1"/>` +
  `<circle cx="46" cy="37" r="1.6" fill="#3d2f3a"/><path d="M52 35 L58 39 M52 39 L58 35" stroke="#3d2f3a" stroke-width="1.2"/><path d="M46 42 Q50 44 54 41" fill="none" stroke="#a8604a" stroke-width="1.2"/>`

const camp =
  `<ellipse cx="50" cy="90" rx="40" ry="6" fill="#5a4352" opacity="0.14"/>` +
  `<path d="M14 88 L50 30 L86 88 Z" fill="#9dd28f" stroke="#5f9a55" stroke-width="2.4"/>` +
  `<path d="M50 30 L50 88" stroke="#5f9a55" stroke-width="1.6"/>` +
  `<path d="M40 88 L50 58 L60 88 Z" fill="#4f6b3f"/>` +
  [26, 38, 62, 74]
    .map(
      (x) =>
        `<path d="M${x} ${88 - Math.abs(50 - x) * 0.4} q-4 -12 0 -24" fill="none" stroke="#7fbf6a" stroke-width="1.6"/>`,
    )
    .join('') +
  `<line x1="50" y1="30" x2="50" y2="8" stroke="#8f6a3a" stroke-width="2"/><path d="M50 8 L68 13 L50 18 Z" fill="#c23a4c" stroke="#8f2636" stroke-width="1.2"/>` +
  `<circle cx="78" cy="78" r="7" fill="#ffffff" stroke="#c9ccd6" stroke-width="1.4" opacity="0.9"/><line x1="78" y1="78" x2="78" y2="90" stroke="#b8bcc8" stroke-width="1.4"/>`

const bumblebee = (wild: boolean) =>
  `<ellipse cx="38" cy="30" rx="16" ry="10" transform="rotate(-25 38 30)" fill="#e9f5ff" stroke="#9fc6e0" stroke-width="2" opacity="0.9" class="${wild ? 'sway' : ''}"/>` +
  `<ellipse cx="60" cy="28" rx="16" ry="10" transform="rotate(20 60 28)" fill="#e9f5ff" stroke="#9fc6e0" stroke-width="2" opacity="0.9"/>` +
  `<ellipse cx="54" cy="60" rx="30" ry="24" fill="#ffd94f" stroke="#c99a24" stroke-width="2.6"/>` +
  `<path d="M42 38 Q36 60 42 82" fill="none" stroke="#4a3a2a" stroke-width="7"/><path d="M62 37 Q56 60 62 83" fill="none" stroke="#4a3a2a" stroke-width="7"/>` +
  `<path d="M84 60 L92 62 L84 64 Z" fill="#4a3a2a"/>` +
  `<circle cx="28" cy="58" r="16" fill="#4a3a2a" stroke="#2e2420" stroke-width="2"/>` +
  `<circle cx="22" cy="54" r="4" fill="white"/><circle cx="21" cy="54" r="2.4" fill="#2e2420"/>` +
  `<circle cx="20" cy="63" r="3" fill="#f7a6b8" opacity="0.7"/>` +
  `<path d="M24 44 Q20 32 14 30 M32 43 Q32 32 28 26" fill="none" stroke="#2e2420" stroke-width="2" stroke-linecap="round"/><circle cx="14" cy="30" r="2.4" fill="#2e2420"/><circle cx="28" cy="26" r="2.4" fill="#2e2420"/>` +
  (wild
    ? ''
    : `<path d="M44 38 Q54 32 66 38 L64 46 Q54 42 46 46 Z" fill="#c97a3a" stroke="#8f5426" stroke-width="1.6"/>`)

const seeds = [
  [30, 40, 1],
  [60, 26, 1.2],
  [70, 60, 0.9],
  [40, 72, 1.1],
]
  .map(
    ([x, y, s]) =>
      `<g transform="translate(${x} ${y}) scale(${s})"><line x1="0" y1="0" x2="0" y2="14" stroke="#b8bcc8" stroke-width="1.4"/><ellipse cx="0" cy="16" rx="1.6" ry="3" fill="#c8a76a"/>${[
        0, 40, 80, 120, 160, 200, 240, 280, 320,
      ]
        .map(
          (a) =>
            `<line transform="rotate(${a})" x1="0" y1="0" x2="0" y2="-9" stroke="#d6d9e2" stroke-width="1"/>`,
        )
        .join('')}<circle r="2" fill="white" stroke="#c9ccd6" stroke-width="0.8"/></g>`,
  )
  .join('')

const beetle =
  shadow +
  `<ellipse cx="54" cy="62" rx="26" ry="22" fill="#5aa0c8" stroke="#2f6f96" stroke-width="2.4"/>` +
  `<path d="M54 40 L54 84" stroke="#2f6f96" stroke-width="2"/>` +
  `<circle cx="44" cy="56" r="3" fill="#bfe2f5"/><circle cx="64" cy="66" r="3" fill="#bfe2f5"/>` +
  `<circle cx="30" cy="54" r="12" fill="#3d5f8a" stroke="#2a4466" stroke-width="2"/>` +
  `<circle cx="26" cy="51" r="3" fill="white"/><circle cx="25" cy="51" r="1.8" fill="#2e2430"/>` +
  `<path d="M24 44 Q18 34 12 34 M32 43 Q34 32 30 28" fill="none" stroke="#2a4466" stroke-width="1.8" stroke-linecap="round"/>` +
  `<text x="70" y="30" font-size="22" font-family="Fredoka, sans-serif" fill="#7c5cff">?</text>`

export const PEOPLE_ART: Record<string, string> = {
  // Helpers (field mice from Thimblewick, each with their job's accessory)
  'helper-gatherer': mouse({ fur: '#c9a27e', front: basket }),
  'helper-supply': mouse({ fur: '#b8926e', wear: satchelStrap }),
  'helper-pirate': mouse({ fur: '#a9a3b8', top: bandana }),
  'helper-brewer': mouse({ fur: '#d2ae88', wear: apron, front: ladle }),
  'helper-scout': mouse({ fur: '#b49a7c', top: goggles }),
  'helper-peddler': mouse({ fur: '#c7a07a', top: peddlerCap, front: coinPurse }),

  // Thimblewick folk
  'char-pip': mouse({ fur: '#b9b2ad', top: glasses, front: scroll }),
  'char-marigold': mouse({ fur: '#e6c49c', wear: apron, top: chefHat }),
  'villager-hob': mouse({ fur: '#c09a76', top: thimbleHat }),
  'villager-wisteria': mouse({ fur: '#d8b896', top: flowerTuck }),
  'villager-tumbleweed': mouse({ fur: '#a89c94', wear: elderBits }),

  // Traders, spirits, creatures
  'trader-snail-peddler': snail,
  'spirit-sorrel': sorrel,
  'creature-rabbit': rabbit,
  'pest-aphid': aphid,
  'crew-dandelion-drifters': drifters,
  'camp-dandelion-drifters': camp,
  'mount-bumblebee': bumblebee(false),
  'mount-bumblebee-wild': bumblebee(true),
  'event-seeds': seeds,
  'event-lost-beetle': beetle,
}
