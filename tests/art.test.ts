import { describe, expect, it } from 'vitest'
import { ITEMS } from '../src/data/items'
import { PLANTS } from '../src/data/plants'
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
