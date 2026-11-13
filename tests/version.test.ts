import { describe, expect, it } from 'vitest'
import { GAME_VERSION, SAVE_VERSION } from '../src/engine/version'

describe('version', () => {
  it('uses a semantic version string', () => {
    expect(GAME_VERSION).toMatch(/^\d+\.\d+\.\d+$/)
  })

  it('starts the save format at a positive integer', () => {
    expect(Number.isInteger(SAVE_VERSION)).toBe(true)
    expect(SAVE_VERSION).toBeGreaterThan(0)
  })
})
