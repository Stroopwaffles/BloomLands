import { TAG_NAMES } from '../src/data/items'
import { STATIONS } from '../src/data/recipes'
import { SPELLS } from '../src/data/magic'
import { TRADERS } from '../src/data/economy'
import { REGION_FLIGHT_EVENTS } from '../src/data/challenges'
import { RELIC_LIST } from '../src/data/prestige'
import { EVENT_BASES, EVENT_RECIPES } from '../src/data/events'
import { OUTFIT_SETS } from '../src/data/appearance'
import { describe, expect, it } from 'vitest'
import { CURIOS, VILLAGERS } from '../src/data/bloom'
import { CREATURES, CREWS, PESTS } from '../src/data/challenges'
import { HELPER_TYPES } from '../src/data/helpers'
import { ITEMS } from '../src/data/items'
import { MOUNTS } from '../src/data/mounts'
import { PLANTS } from '../src/data/plants'
import { SPIRITS } from '../src/data/spirits'
import { CHARACTERS } from '../src/data/stories'
import {
  ART_SVG,
  getArt,
  getSvgArt,
  placeholderHue,
  placeholderShape,
  resolveArtId,
} from '../src/art/registry'

describe('art registry', () => {
  it('returns null for art that is not made yet', () => {
    expect(getArt('plant-clover')).toBeNull()
    expect(getSvgArt('something-without-art')).toBeNull()
  })

  it('has art for every plant and item', () => {
    for (const id of Object.keys(PLANTS)) expect(ART_SVG[id], id).toBeTruthy()
    for (const id of Object.keys(ITEMS)) expect(ART_SVG[id], id).toBeTruthy()
  })

  it('has art for every character, creature, crew, mount, curio and helper', () => {
    const ids = [
      ...Object.keys(CHARACTERS),
      ...Object.values(VILLAGERS).flatMap((list) => list.map((v) => v.id)),
      ...Object.keys(SPIRITS),
      ...Object.keys(CREATURES).map((id) => `creature-${id}`),
      ...Object.values(PESTS).map((p) => `pest-${p.id}`),
      ...Object.keys(CREWS).flatMap((id) => [`crew-${id}`, `camp-${id}`]),
      ...Object.keys(MOUNTS).flatMap((id) => [id, `${id}-wild`]),
      ...Object.keys(CURIOS),
      ...Object.keys(HELPER_TYPES).map((type) => `helper-${type}`),
    ]
    for (const id of ids) expect(ART_SVG[id], id).toBeTruthy()
  })

  it('draws everything else the screens show: tags, stations, spells, traders, events, relics, tabs', () => {
    const ids = [
      ...Object.keys(TAG_NAMES).map((t) => `tag-${t}`),
      ...Object.keys(STATIONS).map((s) => `station-${s}`),
      ...Object.keys(SPELLS),
      ...TRADERS.map((t) => t.id),
      ...Object.values(REGION_FLIGHT_EVENTS).flatMap((e) => [e.windfall.art, e.traveler.art]),
      'event-snag',
      'event-wisp',
      ...RELIC_LIST.map((r) => r.id),
      'relic-unknown',
      ...Object.values(EVENT_BASES).map((b) => b.host.id),
      ...EVENT_RECIPES.map((r) =>
        'itemId' in r.output ? r.output.itemId : OUTFIT_SETS[r.output.outfitId].pieces[0],
      ),
      'char-captain-mallow',
      'icon-court',
      'icon-research',
      'icon-wardrobe',
      'icon-root-song',
      'icon-lodging',
      'feature-ritual-circle',
    ]
    for (const id of ids) expect(ART_SVG[resolveArtId(id)], id).toBeTruthy()
  })

  it('follows family aliases', () => {
    expect(resolveArtId('lodging-press')).toBe('icon-lodging')
    expect(resolveArtId('gear-gloves-2')).toBe('icon-gloves')
    expect(resolveArtId('plant-clover')).toBe('plant-clover')
  })

  it('gives each ID a stable placeholder color', () => {
    expect(placeholderHue('plant-clover')).toBe(placeholderHue('plant-clover'))
    expect(placeholderHue('plant-clover')).toBeGreaterThanOrEqual(0)
    expect(placeholderHue('plant-clover')).toBeLessThan(360)
  })

  it('picks a placeholder shape by category', () => {
    expect(placeholderShape('plant-daisy')).toBe('circle')
    expect(placeholderShape('char-fairy')).toBe('figure')
    expect(placeholderShape('mount-frog')).toBe('oval')
    expect(placeholderShape('icon-glimmers')).toBe('square')
  })
})
