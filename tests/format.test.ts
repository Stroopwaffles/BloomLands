import { describe, expect, it } from 'vitest'
import { formatDuration, formatNumber } from '../src/engine/format'

describe('formatNumber', () => {
  it.each([
    [0, '0'],
    [7, '7'],
    [999, '999'],
    [999.9, '999'],
    [1000, '1K'],
    [1234, '1.2K'],
    [12_345, '12.3K'],
    [3_400_000, '3.4M'],
    [5_600_000_000, '5.6B'],
    [999_960, '999.9K'],
    [-1500, '-1.5K'],
    [Number.NaN, '0'],
  ])('formats %d as %s', (value, expected) => {
    expect(formatNumber(value)).toBe(expected)
  })

  it('never shows "1000K"', () => {
    expect(formatNumber(999_999)).toBe('999.9K')
    expect(formatNumber(999_999_999)).toBe('999.9M')
  })
})

describe('formatDuration', () => {
  it.each([
    [0, '0s'],
    [45_000, '45s'],
    [65_000, '1m 5s'],
    [3_600_000, '1h'],
    [3_660_000, '1h 1m'],
    [2 * 86_400_000 + 3 * 3_600_000 + 5 * 60_000, '2d 3h'],
    [-5000, '0s'],
  ])('formats %d ms as %s', (ms, expected) => {
    expect(formatDuration(ms)).toBe(expected)
  })
})

describe('scientific number style', () => {
  it.each([
    [999, '999'],
    [1234, '1.2E3'],
    [5_600_000_000, '5.6E9'],
    [99_999, '9.9E4'],
    [-1500, '-1.5E3'],
  ])('formats %d as %s', (value, expected) => {
    expect(formatNumber(value, 'scientific')).toBe(expected)
  })
})
