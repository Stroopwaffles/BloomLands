import { describe, expect, it } from 'vitest'
import { composeBar, makeMotif, THEMES, themeFor } from '../src/audio/music'
import { parseSettings } from '../src/ui/settingsData'

/** A repeatable random source for tests. */
function seeded(seed = 1) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

describe('music', () => {
  it('picks a theme per region and time of day, falling back to the Meadow', () => {
    expect(themeFor('meadow', false)).toBe('meadow')
    expect(themeFor('forest', true)).toBe('forest-night')
    expect(themeFor('swamp', false)).toBe('meadow')
    expect(themeFor('swamp', true)).toBe('meadow-night')
  })

  it('composes bars with pads, bass and melody notes from the theme', () => {
    for (const theme of Object.values(THEMES)) {
      const random = seeded(7)
      const motif = makeMotif(theme, random)
      expect(motif).toHaveLength(16)
      for (let bar = 0; bar < 8; bar++) {
        const notes = composeBar(theme, bar, motif, random)
        expect(notes.filter((n) => n.voice === 'pad')).toHaveLength(3)
        expect(notes.filter((n) => n.voice === 'bass')).toHaveLength(2)
        for (const n of notes) {
          expect(n.beat).toBeGreaterThanOrEqual(0)
          expect(n.beat).toBeLessThan(4)
          if (n.voice === 'lead' && bar % 4 !== 3) expect(theme.scale).toContain(n.midi)
        }
      }
    }
  })

  it('repeats its motif, so the tune is recognizable', () => {
    const theme = THEMES.meadow
    const motif = makeMotif(theme, seeded(3))
    const lead = (bar: number) =>
      composeBar(theme, bar, motif, seeded(9))
        .filter((n) => n.voice === 'lead')
        .map((n) => `${n.beat}:${n.midi}`)
    expect(lead(4)).toEqual(lead(0))
  })
})

describe('sound settings', () => {
  it('default to music at 50%, sounds at 75%, not muted', () => {
    const s = parseSettings(null)
    expect([s.musicVolume, s.soundVolume, s.muted]).toEqual([50, 75, false])
  })

  it('keep valid volumes and drop invalid ones', () => {
    const s = parseSettings(JSON.stringify({ musicVolume: 25, soundVolume: 33, muted: true }))
    expect([s.musicVolume, s.soundVolume, s.muted]).toEqual([25, 75, true])
  })
})
