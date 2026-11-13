import { describe, expect, it } from 'vitest'
import { DEFAULT_SETTINGS, parseSettings } from '../src/ui/settingsData'

describe('settings', () => {
  it('fall back to defaults when nothing is stored or it is broken', () => {
    expect(parseSettings(null)).toEqual(DEFAULT_SETTINGS)
    expect(parseSettings('{oops')).toEqual(DEFAULT_SETTINGS)
  })

  it('keep valid values and ignore invalid ones', () => {
    const stored = JSON.stringify({ uiScale: 125, autosaveSeconds: 7, particles: false, extra: 1 })
    expect(parseSettings(stored)).toEqual({ ...DEFAULT_SETTINGS, uiScale: 125, particles: false })
  })
})
