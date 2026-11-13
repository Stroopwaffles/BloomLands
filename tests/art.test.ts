import { describe, expect, it } from 'vitest'
import { getArt, placeholderHue, placeholderShape } from '../src/art/registry'

describe('art registry', () => {
  it('returns null for art that is not made yet', () => {
    expect(getArt('plant-clover')).toBeNull()
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
