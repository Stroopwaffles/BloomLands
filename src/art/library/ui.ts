/**
 * Interface icons (content doc → Asset List → UI: navigation icons) and the last material tags.
 */
import { CAVES_ITEM_ART } from './caves'
import { GLADE_ITEM_ART } from './glade'
import { SWAMP_ITEM_ART } from './swamp'

const shadow = `<ellipse cx="50" cy="91" rx="26" ry="5" fill="#5a4352" opacity="0.15"/>`

/** The court: a little leafy crown. */
const court =
  shadow +
  `<path d="M22 70 L26 34 L40 50 L50 26 L60 50 L74 34 L78 70 Z" fill="#f2c45c" stroke="#a87e1a" stroke-width="2.4" stroke-linejoin="round"/>` +
  `<rect x="22" y="68" width="56" height="12" rx="3" fill="#e2b94f" stroke="#a87e1a" stroke-width="2.2"/>` +
  `<circle cx="50" cy="74" r="3.4" fill="#f7a6c0" stroke="#c97a8c" stroke-width="1"/>` +
  `<circle cx="34" cy="74" r="2.4" fill="#9ccc72"/><circle cx="66" cy="74" r="2.4" fill="#9ccc72"/>` +
  `<circle cx="26" cy="34" r="3" fill="#fff3b0"/><circle cx="50" cy="26" r="3" fill="#fff3b0"/><circle cx="74" cy="34" r="3" fill="#fff3b0"/>`

/** Research: an open book with a leaf bookmark. */
const research =
  shadow +
  `<path d="M14 34 Q32 28 50 36 Q68 28 86 34 L86 78 Q68 72 50 80 Q32 72 14 78 Z" fill="#fffaf0" stroke="#a8875d" stroke-width="2.4"/>` +
  `<path d="M50 36 L50 80" stroke="#a8875d" stroke-width="2"/>` +
  `<path d="M22 44 Q32 41 42 44 M22 52 Q32 49 42 52 M22 60 Q32 57 42 60 M58 44 Q68 41 78 44 M58 52 Q68 49 78 52" fill="none" stroke="#c9b8a0" stroke-width="1.6" stroke-linecap="round"/>` +
  `<path d="M70 32 L70 18 Q76 14 80 20 Q78 26 70 32 Z" fill="#9ccc72" stroke="#5f8a4a" stroke-width="1.4"/>`

/** The wardrobe: a dress on a hanger. */
const wardrobe =
  shadow +
  `<path d="M50 14 Q56 14 56 20 Q56 24 50 26" fill="none" stroke="#8a8fa0" stroke-width="2.4" stroke-linecap="round"/>` +
  `<path d="M24 36 L50 26 L76 36" fill="none" stroke="#8a8fa0" stroke-width="2.4" stroke-linecap="round"/>` +
  `<path d="M38 34 L44 30 Q50 36 56 30 L62 34 L58 50 L72 84 Q50 92 28 84 L42 50 Z" fill="#cdbbf5" stroke="#7a68a8" stroke-width="2.2" stroke-linejoin="round"/>` +
  `<path d="M42 50 Q50 54 58 50" fill="none" stroke="#7a68a8" stroke-width="1.6"/>` +
  `<circle cx="44" cy="68" r="2" fill="#f7a6c0"/><circle cx="56" cy="74" r="2" fill="#f7a6c0"/><circle cx="50" cy="62" r="2" fill="#f7a6c0"/>`

export const UI_ART: Record<string, string> = {
  'icon-court': court,
  'icon-research': research,
  'icon-wardrobe': wardrobe,
  // Material tags that share their commonest item's drawing.
  'tag-stalks': SWAMP_ITEM_ART['raw-reed-stalks'],
  'tag-crystals': CAVES_ITEM_ART['raw-crystal-shards'],
  'tag-moonflowers': GLADE_ITEM_ART['raw-moonpetals'],
}
