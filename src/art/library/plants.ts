/**
 * Plant art (content doc → Asset List → Plants). Each entry is the inside of a 100×100 viewBox;
 * plants stand on a baseline near y = 96. Soft storybook style: rounded shapes, outlines in a
 * darker shade of each fill (design doc 7.1). Parts with class "sway" rock gently.
 */

const ring = (count: number, draw: (angle: number, i: number) => string): string =>
  Array.from({ length: count }, (_, i) => draw((360 / count) * i, i)).join('')

const stem = (top: number, color = '#5f9a55') =>
  `<path d="M50 97 Q48 ${(97 + top) / 2} 50 ${top}" fill="none" stroke="${color}" stroke-width="3.2" stroke-linecap="round"/>`

const leaf = (x: number, y: number, angle: number, fill = '#9dd28f', stroke = '#5f9a55') =>
  `<path transform="translate(${x} ${y}) rotate(${angle})" d="M0 0 C6 -4 16 -4 20 0 C16 5 6 5 0 0 Z" fill="${fill}" stroke="${stroke}" stroke-width="1.6"/>`

/** A heart-shaped clover leaflet pointing up from the origin. */
const leaflet = (angle: number, fill: string, stroke: string, scale = 1) =>
  `<path transform="rotate(${angle}) scale(${scale})" d="M0 0 C-11 -7 -16 -20 -7 -24 C-3 -26 0 -22 0 -19 C0 -22 3 -26 7 -24 C16 -20 11 -7 0 0 Z" fill="${fill}" stroke="${stroke}" stroke-width="1.8" stroke-linejoin="round"/>`

const clover =
  stem(52) +
  leaf(50, 82, 200) +
  `<g class="sway" transform="translate(50 50)">${[0, 120, 240]
    .map((a) => leaflet(a, '#8cc97f', '#4f8a4a'))
    .join('')}<circle r="2.4" fill="#4f8a4a"/></g>`

const fourLeafClover =
  stem(50) +
  `<circle cx="50" cy="48" r="30" fill="#fff3b0" opacity="0.45"/>` +
  `<g class="sway" transform="translate(50 48)">${[45, 135, 225, 315]
    .map((a) => leaflet(a, '#7fd17a', '#3f7f3c', 1.05))
    .join('')}<circle r="2.6" fill="#3f7f3c"/></g>` +
  `<path d="M78 22 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 Z" fill="#ffe59e" stroke="#e2b94f" stroke-width="1"/>`

const daisy =
  stem(46) +
  leaf(50, 80, 200) +
  leaf(50, 70, -20) +
  `<g class="sway" transform="translate(50 42)">${ring(
    12,
    (a) =>
      `<ellipse transform="rotate(${a})" cx="0" cy="-15" rx="5" ry="11" fill="#ffffff" stroke="#d9cfe0" stroke-width="1.4"/>`,
  )}<circle r="9" fill="#ffd25e" stroke="#e2a83f" stroke-width="1.6"/><circle cx="-2.5" cy="-2.5" r="3" fill="#ffe9a6"/></g>`

const buttercup =
  stem(48) +
  leaf(50, 82, 205) +
  leaf(50, 74, -25) +
  `<g class="sway" transform="translate(50 44)">${ring(
    5,
    (a) =>
      `<path transform="rotate(${a})" d="M0 0 C-11 -4 -12 -20 0 -22 C12 -20 11 -4 0 0 Z" fill="#ffd94f" stroke="#e0a92a" stroke-width="1.6"/>`,
  )}<circle r="6" fill="#f2b23a" stroke="#d08f1e" stroke-width="1.4"/>${ring(
    5,
    (a) =>
      `<circle transform="rotate(${a + 36})" cx="0" cy="-12" r="2" fill="#fff6c8" opacity="0.8"/>`,
  )}</g>`

const dandelion =
  stem(46, '#7aa85f') +
  leaf(50, 86, 200, '#a7cf86', '#6f9a52') +
  leaf(50, 82, -20, '#a7cf86', '#6f9a52') +
  `<g class="sway" transform="translate(50 36)"><circle r="22" fill="#ffffff" opacity="0.55" stroke="#d6d9e2" stroke-width="1.2"/>${ring(
    18,
    (a) =>
      `<g transform="rotate(${a})"><line x1="0" y1="-3" x2="0" y2="-19" stroke="#c9ccd6" stroke-width="1"/><circle cx="0" cy="-20" r="2.6" fill="#ffffff" stroke="#c9ccd6" stroke-width="1"/></g>`,
  )}<circle r="4" fill="#d8c08a" stroke="#b39a62" stroke-width="1.2"/></g>`

const berry = (x: number, y: number) =>
  `<g transform="translate(${x} ${y})"><path d="M0 -8 C7 -8 9 2 0 10 C-9 2 -7 -8 0 -8 Z" fill="#f05a6a" stroke="#c23a4c" stroke-width="1.5"/><path d="M-5 -9 L0 -6 5 -9 2 -12 -2 -12 Z" fill="#7fbf6a" stroke="#4f8a4a" stroke-width="1"/>${[
    [-2, -2],
    [2, 1],
    [-1, 4],
    [3, -4],
  ]
    .map(([sx, sy]) => `<circle cx="${sx}" cy="${sy}" r="0.8" fill="#ffe59e"/>`)
    .join('')}</g>`

const wildStrawberry =
  `<g fill="#86c278" stroke="#4f8a4a" stroke-width="1.6">${[-28, -8, 12]
    .map(
      (dx) =>
        `<path d="M${50 + dx} 92 C${44 + dx} 74 ${58 + dx} 66 ${62 + dx} 74 C${66 + dx} 84 ${58 + dx} 92 ${50 + dx} 92 Z"/>`,
    )
    .join('')}</g>` +
  `<path d="M40 86 Q44 64 54 58 M58 86 Q60 70 66 66" fill="none" stroke="#5f9a55" stroke-width="2"/>` +
  `<g class="sway">${berry(54, 64)}${berry(68, 72)}</g>` +
  `<g transform="translate(36 60)">${ring(
    5,
    (a) =>
      `<circle transform="rotate(${a})" cx="0" cy="-5" r="4" fill="#ffffff" stroke="#e0d6e8" stroke-width="1"/>`,
  )}<circle r="2.4" fill="#ffd25e"/></g>`

const morningDew =
  `<g fill="#a6d98f" stroke="#5f9a55" stroke-width="1.6" stroke-linejoin="round">
    <path d="M38 97 Q34 70 26 50 Q40 66 44 97 Z"/>
    <path d="M48 97 Q50 62 46 34 Q58 60 54 97 Z"/>
    <path d="M58 97 Q64 74 74 56 Q66 78 64 97 Z"/>
  </g>` +
  `<g class="sway"><path d="M46 30 C38 42 40 52 47 52 C54 52 55 42 46 30 Z" fill="#cdeeff" stroke="#7fb8dc" stroke-width="1.6"/><ellipse cx="44" cy="45" rx="2" ry="3.5" fill="white" opacity="0.9"/>
  <path d="M27 48 C23 54 24 58 27 58 C30 58 31 54 27 48 Z" fill="#cdeeff" stroke="#7fb8dc" stroke-width="1.2"/>
  <path d="M73 54 C70 59 71 62 73 62 C76 62 76 59 73 54 Z" fill="#cdeeff" stroke="#7fb8dc" stroke-width="1.2"/></g>`

const ringcap =
  `<path d="M42 96 C43 80 44 70 46 62 L56 62 C58 70 58 82 60 96 Z" fill="#fbf1e2" stroke="#d8bf9c" stroke-width="1.8"/>` +
  `<path d="M44 74 Q51 78 58 74" fill="none" stroke="#d8bf9c" stroke-width="1.6"/>` +
  `<g class="sway"><path d="M22 64 C22 38 80 38 80 64 Q51 72 22 64 Z" fill="#f08a9e" stroke="#c45d74" stroke-width="2"/>
  <path d="M30 56 C34 44 52 40 62 44" fill="none" stroke="#ffc2cf" stroke-width="3" stroke-linecap="round" opacity="0.8"/>
  ${[
    [34, 54, 3.4],
    [46, 48, 4],
    [60, 50, 3.6],
    [70, 58, 2.8],
    [52, 60, 2.6],
  ]
    .map(
      ([cx, cy, r]) =>
        `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#fff6f0" stroke="#e7b5c0" stroke-width="1"/>`,
    )
    .join('')}</g>`

const sprout =
  `<path d="M50 96 Q50 84 50 76" fill="none" stroke="#5f9a55" stroke-width="3" stroke-linecap="round"/>` +
  `<path d="M50 78 C40 66 30 72 32 78 C36 84 46 82 50 78 Z" fill="#a6d98f" stroke="#5f9a55" stroke-width="1.6"/>` +
  `<path d="M50 74 C58 60 70 64 68 72 C64 80 54 78 50 74 Z" fill="#b8e6a2" stroke="#5f9a55" stroke-width="1.6"/>` +
  `<ellipse cx="50" cy="97" rx="14" ry="3" fill="#8a6a4a" opacity="0.25"/>`

export const PLANT_ART: Record<string, string> = {
  'plant-clover': clover,
  'plant-four-leaf-clover': fourLeafClover,
  'plant-daisy': daisy,
  'plant-buttercup': buttercup,
  'plant-dandelion': dandelion,
  'plant-wild-strawberry': wildStrawberry,
  'plant-morning-dew': morningDew,
  'plant-ringcap': ringcap,
  'plant-sprout': sprout,
}
