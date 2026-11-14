/**
 * Prestige art (content doc → Asset List: Root Song icon, Harmony Blend, relics). Relics share
 * a spirit-themed frame (one color per spirit) and an emblem for their place in the set:
 * I a seed, II a token, III a key, IV a charm, V a heart.
 */
import { RELIC_LIST } from '../../data/prestige'
import { ITEM_TEMPLATES } from './items'

const { shade } = ITEM_TEMPLATES

const glow = (color: string, r = 44) =>
  `<circle cx="50" cy="50" r="${r}" fill="${color}" opacity="0.22"/>`

/** The Root Song: a sprout whose roots curl into a song. */
const rootSong =
  glow('#f2c45c') +
  `<path d="M50 54 C50 66 40 70 34 80 M50 56 C52 68 62 72 66 82 M50 58 L50 84" fill="none" stroke="#8a5a2a" stroke-width="4" stroke-linecap="round"/>` +
  `<path d="M34 80 Q30 86 36 88 M66 82 Q72 86 66 90" fill="none" stroke="#8a5a2a" stroke-width="3" stroke-linecap="round"/>` +
  `<path d="M50 56 L50 34" stroke="#5f9a3e" stroke-width="4" stroke-linecap="round"/>` +
  `<path d="M50 40 C40 30 30 34 28 42 C38 46 46 44 50 40 Z" fill="#8fd16a" stroke="#4f8a32" stroke-width="2"/>` +
  `<path d="M50 34 C58 22 70 24 72 32 C64 38 56 38 50 34 Z" fill="#a6e07a" stroke="#4f8a32" stroke-width="2"/>` +
  `<path d="M70 50 L70 34 L80 31 L80 46" fill="none" stroke="#c98a1c" stroke-width="2.6" stroke-linecap="round"/>` +
  `<ellipse cx="67" cy="51" rx="4" ry="3" fill="#c98a1c"/><ellipse cx="77" cy="47" rx="4" ry="3" fill="#c98a1c"/>`

/** Harmony Blend: five regions' magic in bands, swirling in one flask. */
const harmonyBlend = (() => {
  const bands = ['#f2c45c', '#8a6a3a', '#6fb8b0', '#f0b860', '#7fe0d0']
  const body = `M42 26 L58 26 L58 40 Q76 46 76 64 Q76 90 50 90 Q24 90 24 64 Q24 46 42 40 Z`
  return (
    glow('#fff3c4', 46) +
    `<ellipse cx="50" cy="92" rx="24" ry="4" fill="#3a3550" opacity="0.18"/>` +
    `<defs><clipPath id="harmony-clip"><path d="${body}"/></clipPath></defs>` +
    `<path d="${body}" fill="#eef6ff"/>` +
    `<g clip-path="url(#harmony-clip)">` +
    bands
      .map(
        (c, i) =>
          `<path d="M20 ${52 + i * 8} Q50 ${46 + i * 8} 80 ${54 + i * 8} L80 ${62 + i * 8} L20 ${62 + i * 8} Z" fill="${c}"/>`,
      )
      .join('') +
    `</g>` +
    `<path d="${body}" fill="none" stroke="#7a6aa0" stroke-width="2.4"/>` +
    `<rect x="40" y="18" width="20" height="10" rx="3" fill="#b88a5a" stroke="#7a5a3a" stroke-width="2"/>` +
    `<path d="M34 56 Q36 48 42 46" fill="none" stroke="white" stroke-width="2.6" stroke-linecap="round" opacity="0.8"/>` +
    `<circle cx="64" cy="34" r="2" fill="#fff3b0"/><circle cx="30" cy="38" r="1.6" fill="#fff3b0"/>`
  )
})()

/** Each spirit's frame color. */
const SPIRIT_COLORS: Record<string, string> = {
  'spirit-sorrel': '#e8b94a',
  'spirit-bramblebeard': '#6f9f4a',
  'spirit-mirebelle': '#4fa8a0',
  'spirit-pome': '#e87fa0',
  'spirit-quartz': '#8a78d8',
  'spirit-selenne': '#7a8ad8',
  'spirit-aeris': '#5aa8e0',
}

const frame = (color: string) =>
  glow(color, 46) +
  `<circle cx="50" cy="50" r="38" fill="#fffaf0" stroke="${color}" stroke-width="4"/>` +
  `<circle cx="50" cy="50" r="32" fill="none" stroke="${shade(color, 0.8)}" stroke-width="1.2" stroke-dasharray="3 4"/>`

const EMBLEMS: Record<number, (c: string) => string> = {
  // I: a seed of the land
  1: (c) =>
    `<path d="M50 30 C64 40 64 62 50 70 C36 62 36 40 50 30 Z" fill="${c}" stroke="${shade(c, 0.6)}" stroke-width="2.2"/>` +
    `<path d="M50 34 L50 66" stroke="${shade(c, 0.7)}" stroke-width="1.4"/>` +
    `<path d="M44 42 Q46 38 49 37" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"/>`,
  // II: a token of truce (a feather)
  2: (c) =>
    `<path d="M62 28 C40 36 34 56 38 72 C54 66 66 50 62 28 Z" fill="${c}" stroke="${shade(c, 0.6)}" stroke-width="2.2"/>` +
    `<path d="M62 28 L36 76" stroke="${shade(c, 0.55)}" stroke-width="1.8" stroke-linecap="round"/>` +
    `<path d="M54 40 L46 44 M52 50 L42 52 M48 60 L40 61" stroke="white" stroke-width="1.4" opacity="0.8"/>`,
  // III: a key of kinship
  3: (c) =>
    `<circle cx="42" cy="42" r="10" fill="none" stroke="${c}" stroke-width="5"/>` +
    `<path d="M49 49 L66 66 M58 58 L54 62 M63 63 L59 67" stroke="${c}" stroke-width="5" stroke-linecap="round"/>` +
    `<circle cx="42" cy="42" r="10" fill="none" stroke="${shade(c, 0.6)}" stroke-width="1.2"/>`,
  // IV: a charm (a cut gem)
  4: (c) =>
    `<path d="M50 28 L68 44 L50 72 L32 44 Z" fill="${c}" stroke="${shade(c, 0.6)}" stroke-width="2.2"/>` +
    `<path d="M32 44 L68 44 M50 28 L44 44 L50 72 L56 44 Z" fill="none" stroke="${shade(c, 0.75)}" stroke-width="1.2"/>` +
    `<path d="M40 40 L46 33" stroke="white" stroke-width="2" stroke-linecap="round"/>`,
  // V: the spirit's heart
  5: (c) =>
    `<path d="M50 72 C28 58 30 36 42 34 C47 33 50 38 50 41 C50 38 53 33 58 34 C70 36 72 58 50 72 Z" fill="${c}" stroke="${shade(c, 0.55)}" stroke-width="2.4"/>` +
    `<path d="M40 42 Q44 38 48 40" fill="none" stroke="white" stroke-width="2.4" stroke-linecap="round"/>` +
    `<circle cx="62" cy="30" r="2.4" fill="#fff3b0"/><circle cx="34" cy="62" r="1.8" fill="#fff3b0"/>`,
}

const relicArt = Object.fromEntries(
  RELIC_LIST.map((r) => {
    const color = SPIRIT_COLORS[r.spiritId] ?? '#d9a441'
    return [r.id, frame(color) + EMBLEMS[r.index](color)]
  }),
)

const unknownRelic =
  `<circle cx="50" cy="50" r="38" fill="#eee8f6" stroke="#b8aed0" stroke-width="4" stroke-dasharray="6 5"/>` +
  `<text x="50" y="62" text-anchor="middle" font-size="34" font-family="sans-serif" font-weight="700" fill="#9a90b8">?</text>`

export const PRESTIGE_ART: Record<string, string> = {
  'icon-root-song': rootSong,
  'component-harmony-blend': harmonyBlend,
  'relic-unknown': unknownRelic,
  ...relicArt,
}
