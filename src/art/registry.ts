import type { Component } from 'svelte'
import {
  FOREST_ITEM_ART,
  FOREST_MISC_ART,
  FOREST_PEOPLE_ART,
  FOREST_PLANT_ART,
} from './library/forest'
import { CAVES_ITEM_ART, CAVES_MISC_ART, CAVES_PEOPLE_ART, CAVES_PLANT_ART } from './library/caves'
import { ITEM_ART } from './library/items'
import {
  ORCHARD_ITEM_ART,
  ORCHARD_MISC_ART,
  ORCHARD_PEOPLE_ART,
  ORCHARD_PLANT_ART,
} from './library/orchard'
import { SWAMP_ITEM_ART, SWAMP_MISC_ART, SWAMP_PEOPLE_ART, SWAMP_PLANT_ART } from './library/swamp'
import { MISC_ART } from './library/misc'
import { PRESTIGE_ART } from './library/prestige'
import { BLOODMOON_ITEM_ART, BLOODMOON_MISC_ART, BLOODMOON_PLANT_ART } from './library/bloodmoon'
import { SKY_ITEM_ART, SKY_MISC_ART, SKY_PEOPLE_ART, SKY_PLANT_ART } from './library/sky'
import { GLADE_ITEM_ART, GLADE_MISC_ART, GLADE_PEOPLE_ART, GLADE_PLANT_ART } from './library/glade'
import { PLANT_ART } from './library/plants'
import { PEOPLE_ART } from './library/people'

/**
 * Real art, looked up by stable asset ID (content doc → Asset List → Conventions).
 * Until an ID has art, the game draws a placeholder for it automatically.
 * Adding finished art is just adding an entry: no game code changes.
 */

/** Art drawn by a Svelte component (for art that reacts to game state, like the player's fairy). */
export const ART: Record<string, Component<{ size: number }>> = {}

/**
 * Art drawn from SVG markup (the inside of a 100×100 viewBox). Most art lives here: it's plain
 * data written in this repo, so it's safe to render directly.
 */
export const ART_SVG: Record<string, string> = {
  ...PLANT_ART,
  ...ITEM_ART,
  ...PEOPLE_ART,
  ...MISC_ART,
  ...FOREST_PLANT_ART,
  ...FOREST_ITEM_ART,
  ...FOREST_PEOPLE_ART,
  ...FOREST_MISC_ART,
  ...SWAMP_PLANT_ART,
  ...SWAMP_ITEM_ART,
  ...SWAMP_PEOPLE_ART,
  ...SWAMP_MISC_ART,
  ...ORCHARD_PLANT_ART,
  ...ORCHARD_ITEM_ART,
  ...ORCHARD_PEOPLE_ART,
  ...ORCHARD_MISC_ART,
  ...CAVES_PLANT_ART,
  ...CAVES_ITEM_ART,
  ...CAVES_PEOPLE_ART,
  ...CAVES_MISC_ART,
  ...GLADE_PLANT_ART,
  ...GLADE_ITEM_ART,
  ...GLADE_PEOPLE_ART,
  ...GLADE_MISC_ART,
  ...SKY_PLANT_ART,
  ...SKY_ITEM_ART,
  ...SKY_PEOPLE_ART,
  ...SKY_MISC_ART,
  ...BLOODMOON_PLANT_ART,
  ...BLOODMOON_ITEM_ART,
  ...BLOODMOON_MISC_ART,
  ...PRESTIGE_ART,
}

/** Families of assets that share one drawing (e.g. every lodging upgrade uses the lodging icon). */
const ALIASES: [prefix: string, artId: string][] = [
  ['lodging-', 'icon-lodging'],
  ['gear-gloves', 'icon-gloves'],
  ['gear-satchel', 'icon-satchel'],
  ['gear-wings', 'icon-wings'],
  ['qol-', 'icon-comfort'],
]

/** The art ID to draw for an asset ID, following aliases. */
export function resolveArtId(id: string): string {
  if (ART[id] || ART_SVG[id]) return id
  for (const [prefix, artId] of ALIASES) if (id.startsWith(prefix)) return artId
  return id
}

export function getArt(id: string): Component<{ size: number }> | null {
  return ART[resolveArtId(id)] ?? null
}

export function getSvgArt(id: string): string | null {
  return ART_SVG[resolveArtId(id)] ?? null
}

/** Stable color for a placeholder, so the same asset always looks the same. */
export function placeholderHue(id: string): number {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0
  return Math.abs(hash) % 360
}

export type PlaceholderShape = 'circle' | 'figure' | 'oval' | 'square'

/** Picks a placeholder shape from the asset ID's category prefix. */
export function placeholderShape(id: string): PlaceholderShape {
  const category = id.split('-')[0]
  if (category === 'plant') return 'circle'
  if (category === 'char' || category === 'npc' || category === 'spirit') return 'figure'
  if (category === 'mount' || category === 'creature') return 'oval'
  return 'square'
}
