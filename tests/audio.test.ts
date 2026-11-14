import { describe, expect, it } from 'vitest'
import { parseChord, parseNote, themeFor, trackNotes } from '../src/audio/music'
import { TRACKS } from '../src/audio/tracks'
import { parseSettings } from '../src/ui/settingsData'

describe('music', () => {
  it('picks a track per region and time of day, falling back to the Meadow', () => {
    expect(themeFor('meadow', false)).toBe('meadow')
    expect(themeFor('forest', true)).toBe('forest-night')
    expect(themeFor('swamp', false)).toBe('swamp')
    expect(themeFor('nowhere', true)).toBe('meadow-night')
  })

  it('has a day and a night track for every region so far', () => {
    for (const region of ['meadow', 'forest', 'swamp', 'orchard', 'caves', 'glade', 'sky']) {
      expect(TRACKS[region]).toBeDefined()
      expect(TRACKS[`${region}-night`]).toBeDefined()
    }
  })

  it('reads notes and chords', () => {
    expect(parseNote('C4')).toBe(60)
    expect(parseNote('A4')).toBe(69)
    expect(parseNote('Bb5')).toBe(82)
    expect(parseChord('Am')).toEqual({ root: 9, tones: [0, 3, 7] })
    expect(parseChord('Bb')).toEqual({ root: 10, tones: [0, 4, 7] })
  })

  it('every bar of every track adds up to a whole bar, with a chord for each', () => {
    for (const track of Object.values(TRACKS)) {
      expect(track.melody.length, track.id).toBe(track.chords.length)
      track.melody.forEach((bar, i) => {
        const beats = bar.split(/\s+/).reduce((sum, token) => sum + Number(token.split(':')[1]), 0)
        expect(beats, `${track.id} bar ${i + 1}`).toBe(track.beatsPerBar)
      })
      for (const chord of track.chords.flatMap((bar) => bar.split(/\s+/))) {
        expect(() => parseChord(chord), `${track.id} ${chord}`).not.toThrow()
      }
    }
  })

  it('plays the same notes every time, all inside the loop and in a friendly range', () => {
    for (const track of Object.values(TRACKS)) {
      const a = trackNotes(track)
      expect(trackNotes(track)).toEqual(a)
      expect(a.loopBeats).toBe(track.chords.length * track.beatsPerBar)
      for (const n of a.notes) {
        expect(n.beat).toBeGreaterThanOrEqual(0)
        expect(n.beat).toBeLessThan(a.loopBeats)
        expect(n.midi).toBeGreaterThanOrEqual(31)
        expect(n.midi).toBeLessThanOrEqual(88)
      }
      expect(a.notes.some((n) => n.voice === 'lead')).toBe(true)
    }
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
