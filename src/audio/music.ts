import { audioContext, musicOutput } from './engine'
import { TRACKS, type TrackDef } from './tracks'

/**
 * Background music: each region's composed track (see tracks.ts), played exactly as written on
 * the Web Audio clock and looped. A soft pad holds the chords, a bass and a light accompaniment
 * keep time, and a music-box lead plays the tune. Nothing is random, so a track always sounds
 * the same. Changing tracks crossfades.
 *
 * trackNotes() is pure, so the arrangement can be tested; MusicPlayer schedules it.
 */

/** The track for a region, by day or night (falls back to the Meadow). */
export function themeFor(regionId: string, night: boolean): string {
  const id = night ? `${regionId}-night` : regionId
  if (TRACKS[id]) return id
  // A region with one track plays it day and night (the Crimson Vale).
  if (TRACKS[regionId]) return regionId
  return night ? 'meadow-night' : 'meadow'
}

const NOTE_CLASS: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }

/** "Bb4" → MIDI note number (C4 = 60). */
export function parseNote(name: string): number {
  const match = /^([A-G])([b#]?)(-?\d)$/.exec(name)
  if (!match) throw new Error(`Bad note: ${name}`)
  const [, letter, accidental, octave] = match
  const shift = accidental === '#' ? 1 : accidental === 'b' ? -1 : 0
  return 12 * (Number(octave) + 1) + NOTE_CLASS[letter] + shift
}

/** "Am" → { root pitch class, triad intervals }. */
export function parseChord(symbol: string): { root: number; tones: number[] } {
  const match = /^([A-G])([b#]?)(m?)$/.exec(symbol)
  if (!match) throw new Error(`Bad chord: ${symbol}`)
  const [, letter, accidental, minor] = match
  const shift = accidental === '#' ? 1 : accidental === 'b' ? -1 : 0
  const root = (NOTE_CLASS[letter] + shift + 12) % 12
  return { root, tones: minor ? [0, 3, 7] : [0, 4, 7] }
}

/** A chord's notes, kept in a comfortable middle range (G3 to G4) under the tune. */
function voicing(symbol: string): number[] {
  const { root, tones } = parseChord(symbol)
  return tones
    .map((interval) => {
      let midi = 48 + root + interval
      while (midi < 55) midi += 12
      while (midi > 67) midi -= 12
      return midi
    })
    .sort((a, b) => a - b)
}

function bassNote(symbol: string): number {
  const { root } = parseChord(symbol)
  const midi = 36 + root
  return midi > 43 ? midi - 12 : midi
}

export type Voice = 'pad' | 'bass' | 'arp' | 'lead'

export interface Note {
  /** In beats from the start of the loop. */
  beat: number
  /** In beats. */
  length: number
  midi: number
  voice: Voice
}

/** Every note of a track's loop, in order. */
export function trackNotes(track: TrackDef): { notes: Note[]; loopBeats: number } {
  const notes: Note[] = []
  const per = track.beatsPerBar
  track.chords.forEach((bar, i) => {
    const start = i * per
    const symbols = bar.split(/\s+/)
    const span = per / symbols.length
    symbols.forEach((symbol, j) => {
      const at = start + j * span
      const chord = voicing(symbol)
      const bass = bassNote(symbol)
      for (const midi of chord) notes.push({ beat: at, length: span, midi, voice: 'pad' })
      switch (track.accompaniment) {
        case 'arpeggio': {
          // Bass on the beat, then a gentle broken chord, one note per beat.
          notes.push({ beat: at, length: Math.min(2, span), midi: bass, voice: 'bass' })
          if (span >= 4) notes.push({ beat: at + 2, length: 2, midi: bass + 7, voice: 'bass' })
          const pattern = [chord[0], chord[1], chord[2], chord[1]]
          for (let b = 0; b < span; b++) {
            notes.push({ beat: at + b, length: 1, midi: pattern[b % 4] + 12, voice: 'arp' })
          }
          break
        }
        case 'waltz':
          // Oom-pah-pah: bass on one, soft chords on two and three.
          notes.push({ beat: at, length: 1, midi: bass, voice: 'bass' })
          for (let b = 1; b < span; b++) {
            for (const midi of chord) {
              notes.push({ beat: at + b, length: 0.8, midi, voice: 'arp' })
            }
          }
          break
        case 'bounce':
          // A lazy two-step: bass on one and three, chord hops on the off-beats.
          for (let b = 0; b < span; b += 2) {
            notes.push({ beat: at + b, length: 1, midi: b === 0 ? bass : bass + 7, voice: 'bass' })
            for (const midi of chord) {
              notes.push({ beat: at + b + 1, length: 0.5, midi, voice: 'arp' })
            }
          }
          break
      }
    })
  })
  track.melody.forEach((bar, i) => {
    let at = i * per
    for (const token of bar.split(/\s+/)) {
      const [name, beats] = token.split(':')
      const length = Number(beats)
      if (name !== 'r') notes.push({ beat: at, length, midi: parseNote(name), voice: 'lead' })
      at += length
    }
  })
  notes.sort((a, b) => a.beat - b.beat)
  return { notes, loopBeats: track.chords.length * per }
}

const midiToHz = (midi: number) => 440 * 2 ** ((midi - 69) / 12)

/** Plays tracks on the Web Audio clock, looping, crossfading when the track changes. */
export class MusicPlayer {
  private track: TrackDef | null = null
  private notes: Note[] = []
  private loopBeats = 0
  private out: { gain: GainNode; echo: DelayNode } | null = null
  /** When the current loop started (audio clock), and the next note to schedule. */
  private loopStart = 0
  private cursor = 0
  private timer: ReturnType<typeof setInterval> | null = null
  private wanted: string | null = null

  /** Asks for a track; plays once audio is unlocked. Null stops the music. */
  play(trackId: string | null): void {
    this.wanted = trackId
    const ctx = audioContext()
    const out = musicOutput()
    if (!ctx || !out) return
    if (this.track?.id === trackId && this.out) return
    this.fadeOut()
    if (!trackId || !TRACKS[trackId]) {
      this.track = null
      return
    }
    this.track = TRACKS[trackId]
    const { notes, loopBeats } = trackNotes(this.track)
    this.notes = notes
    this.loopBeats = loopBeats
    this.out = this.makeOutput(ctx, out)
    this.loopStart = ctx.currentTime + 0.3
    this.cursor = 0
    if (!this.timer) this.timer = setInterval(() => this.schedule(), 200)
    this.schedule()
  }

  /** Call when audio becomes available, to start whatever was asked for. */
  resume(): void {
    if (this.wanted) {
      const wanted = this.wanted
      this.track = null
      this.play(wanted)
    }
  }

  private makeOutput(ctx: AudioContext, out: AudioNode) {
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.0001, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(1, ctx.currentTime + 2)
    gain.connect(out)
    // A gentle echo on the tune only.
    const echo = ctx.createDelay(1)
    const feedback = ctx.createGain()
    feedback.gain.value = 0.18
    const wet = ctx.createGain()
    wet.gain.value = 0.2
    echo.connect(feedback).connect(echo)
    echo.connect(wet).connect(gain)
    return { gain, echo }
  }

  private fadeOut(): void {
    const ctx = audioContext()
    if (!ctx || !this.out) return
    const { gain } = this.out
    gain.gain.cancelScheduledValues(ctx.currentTime)
    gain.gain.setValueAtTime(Math.max(0.0001, gain.gain.value), ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.5)
    setTimeout(() => gain.disconnect(), 2000)
    this.out = null
  }

  private schedule(): void {
    const ctx = audioContext()
    if (!ctx || !this.track || !this.out || this.notes.length === 0) return
    const beat = 60 / this.track.bpm
    const loopSeconds = this.loopBeats * beat
    this.out.echo.delayTime.value = beat * 0.75
    // After the tab slept, pick up where the music would be now instead of piling up notes.
    if (ctx.currentTime > this.loopStart + loopSeconds) {
      const loops = Math.floor((ctx.currentTime - this.loopStart) / loopSeconds)
      this.loopStart += loops * loopSeconds
      this.cursor = this.notes.findIndex((n) => this.loopStart + n.beat * beat >= ctx.currentTime)
      if (this.cursor < 0) {
        this.cursor = 0
        this.loopStart += loopSeconds
      }
    }
    const horizon = ctx.currentTime + 1
    for (let guard = 0; guard < 2000; guard++) {
      const note = this.notes[this.cursor]
      const at = this.loopStart + note.beat * beat
      if (at >= horizon) return
      if (at >= ctx.currentTime - 0.05) this.playNote(ctx, note, at, note.length * beat)
      this.cursor++
      if (this.cursor >= this.notes.length) {
        this.cursor = 0
        this.loopStart += loopSeconds
      }
    }
  }

  private playNote(ctx: AudioContext, note: Note, at: number, length: number): void {
    if (!this.out || !this.track) return
    const gain = ctx.createGain()
    const osc = ctx.createOscillator()
    osc.frequency.value = midiToHz(note.midi)
    let end = at + length
    switch (note.voice) {
      case 'pad': {
        const filter = ctx.createBiquadFilter()
        filter.type = 'lowpass'
        filter.frequency.value = this.track.padCutoff
        osc.type = 'sawtooth'
        gain.gain.setValueAtTime(0.0001, at)
        gain.gain.linearRampToValueAtTime(0.022, at + Math.min(0.6, length * 0.3))
        gain.gain.setValueAtTime(0.022, at + length * 0.8)
        gain.gain.linearRampToValueAtTime(0.0001, at + length + 0.3)
        end += 0.3
        osc.connect(filter).connect(gain)
        break
      }
      case 'bass':
        osc.type = 'sine'
        gain.gain.setValueAtTime(0.0001, at)
        gain.gain.exponentialRampToValueAtTime(0.13, at + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.0001, at + length * 0.95)
        osc.connect(gain)
        break
      case 'arp':
        osc.type = 'triangle'
        gain.gain.setValueAtTime(0.0001, at)
        gain.gain.exponentialRampToValueAtTime(0.035, at + 0.01)
        gain.gain.exponentialRampToValueAtTime(0.0001, at + Math.min(0.5, length))
        end = at + Math.min(0.5, length)
        osc.connect(gain)
        break
      case 'lead': {
        osc.type = this.track.lead
        const ring = Math.max(0.4, length + 0.25)
        gain.gain.setValueAtTime(0.0001, at)
        gain.gain.exponentialRampToValueAtTime(0.09, at + 0.012)
        gain.gain.exponentialRampToValueAtTime(0.0001, at + ring)
        end = at + ring
        osc.connect(gain)
        gain.connect(this.out.echo)
        break
      }
    }
    gain.connect(this.out.gain)
    osc.start(at)
    osc.stop(end + 0.05)
  }
}

export const music = new MusicPlayer()
