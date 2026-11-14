import { audioContext, musicOutput } from './engine'

/**
 * Background music, composed as it plays: soft pads, a walking bass and a music-box melody that
 * repeats little motifs so it sounds like a tune rather than random notes. Each region has its own
 * key, chords and pace, and a calmer night version.
 *
 * composeBar() is pure (given a random source) so it can be tested; MusicPlayer schedules the
 * notes on the Web Audio clock.
 */

export interface ThemeDef {
  id: string
  bpm: number
  /** MIDI note numbers of each chord's root (one chord per bar, looping). */
  chords: { root: number; tones: number[] }[]
  /** Melody notes to pick from (MIDI). */
  scale: number[]
  /** Chance of a melody note on each half-beat. */
  density: number
  /** Melody instrument. */
  lead: OscillatorType
  /** Brightness of the pad (lowpass cutoff, Hz). */
  padCutoff: number
  /** Chance of a high sparkle note per bar. */
  sparkle: number
}

const major = (root: number) => [root, root + 4, root + 7]
const minor = (root: number) => [root, root + 3, root + 7]

/** C major pentatonic across two octaves (C5 = 72). */
const C_PENTA = [67, 69, 72, 74, 76, 79, 81, 84]
/** D dorian pentatonic-ish (D F G A C): darker, woodier. */
const D_DORIAN = [62, 65, 67, 69, 72, 74, 77, 79]
/** F major pentatonic (F G A C D): warm, lazy, a little silly. */
const F_PENTA = [65, 67, 69, 72, 74, 77, 79, 81]

export const THEMES: Readonly<Record<string, ThemeDef>> = {
  meadow: {
    id: 'meadow',
    bpm: 84,
    chords: [
      { root: 48, tones: major(60) },
      { root: 45, tones: minor(57) },
      { root: 41, tones: major(53) },
      { root: 43, tones: major(55) },
    ],
    scale: C_PENTA,
    density: 0.55,
    lead: 'triangle',
    padCutoff: 1800,
    sparkle: 0.35,
  },
  'meadow-night': {
    id: 'meadow-night',
    bpm: 62,
    chords: [
      { root: 41, tones: major(53) },
      { root: 48, tones: major(60) },
      { root: 45, tones: minor(57) },
      { root: 43, tones: major(55) },
    ],
    scale: C_PENTA,
    density: 0.28,
    lead: 'sine',
    padCutoff: 1000,
    sparkle: 0.5,
  },
  forest: {
    id: 'forest',
    bpm: 72,
    chords: [
      { root: 38, tones: minor(50) },
      { root: 41, tones: major(53) },
      { root: 48, tones: major(48) },
      { root: 43, tones: major(55) },
    ],
    scale: D_DORIAN,
    density: 0.45,
    lead: 'triangle',
    padCutoff: 1200,
    sparkle: 0.2,
  },
  'forest-night': {
    id: 'forest-night',
    bpm: 56,
    chords: [
      { root: 38, tones: minor(50) },
      { root: 36, tones: major(48) },
      { root: 41, tones: major(53) },
      { root: 45, tones: minor(57) },
    ],
    scale: D_DORIAN,
    density: 0.22,
    lead: 'sine',
    padCutoff: 800,
    sparkle: 0.4,
  },
  swamp: {
    id: 'swamp',
    bpm: 66,
    chords: [
      { root: 41, tones: major(53) },
      { root: 38, tones: minor(50) },
      { root: 46, tones: major(58) },
      { root: 48, tones: major(60) },
    ],
    scale: F_PENTA,
    density: 0.4,
    lead: 'triangle',
    padCutoff: 1400,
    sparkle: 0.25,
  },
  'swamp-night': {
    id: 'swamp-night',
    bpm: 54,
    chords: [
      { root: 41, tones: major(53) },
      { root: 46, tones: major(58) },
      { root: 38, tones: minor(50) },
      { root: 48, tones: major(60) },
    ],
    scale: F_PENTA,
    density: 0.22,
    lead: 'sine',
    padCutoff: 850,
    sparkle: 0.45,
  },
}

/** The music for a region, by day or night (falls back to the Meadow). */
export function themeFor(regionId: string, night: boolean): string {
  const id = night ? `${regionId}-night` : regionId
  if (THEMES[id]) return id
  return night ? 'meadow-night' : 'meadow'
}

export type Voice = 'pad' | 'bass' | 'lead' | 'sparkle'

export interface Note {
  /** In beats from the start of the bar. */
  beat: number
  /** In beats. */
  length: number
  midi: number
  voice: Voice
}

/** A short melody (scale indexes per half-beat, -1 = rest) reused across a phrase. */
export type Motif = number[]

export function makeMotif(theme: ThemeDef, random: () => number): Motif {
  const motif: Motif = []
  let index = Math.floor(theme.scale.length / 2)
  for (let i = 0; i < 16; i++) {
    if (random() > theme.density) {
      motif.push(-1)
      continue
    }
    // Mostly small steps, sometimes a leap: tunes that sing.
    const r = random()
    const step = r < 0.35 ? -1 : r < 0.7 ? 1 : r < 0.85 ? 0 : r < 0.93 ? 2 : -2
    index = Math.min(theme.scale.length - 1, Math.max(0, index + step))
    motif.push(index)
  }
  return motif
}

/**
 * The notes of one bar. Bars come in 4-bar phrases: the motif plays twice, then a variation,
 * then it settles on a chord tone.
 */
export function composeBar(
  theme: ThemeDef,
  bar: number,
  motif: Motif,
  random: () => number,
): Note[] {
  const chord = theme.chords[bar % theme.chords.length]
  const notes: Note[] = []

  for (const midi of chord.tones) notes.push({ beat: 0, length: 4, midi, voice: 'pad' })
  notes.push({ beat: 0, length: 1.5, midi: chord.root, voice: 'bass' })
  notes.push({ beat: 2, length: 1.5, midi: chord.root + (bar % 2 === 0 ? 7 : 12), voice: 'bass' })

  const inPhrase = bar % 4
  const half = (inPhrase % 2) * 8
  for (let i = 0; i < 8; i++) {
    let index = motif[half + i]
    if (inPhrase === 2 && index >= 0 && random() < 0.3) {
      index = Math.min(theme.scale.length - 1, Math.max(0, index + (random() < 0.5 ? 1 : -1)))
    }
    if (inPhrase === 3 && i >= 4) index = -1
    if (index < 0) continue
    notes.push({ beat: i / 2, length: 0.5, midi: theme.scale[index], voice: 'lead' })
  }
  if (inPhrase === 3) {
    // Land on the chord's root, an octave up.
    notes.push({ beat: 2, length: 2, midi: chord.tones[0] + 12, voice: 'lead' })
  }
  if (random() < theme.sparkle) {
    notes.push({
      beat: Math.floor(random() * 8) / 2,
      length: 1,
      midi: theme.scale[Math.floor(random() * theme.scale.length)] + 12,
      voice: 'sparkle',
    })
  }
  return notes
}

const midiToHz = (midi: number) => 440 * 2 ** ((midi - 69) / 12)

/** Plays themes on the Web Audio clock, crossfading when the theme changes. */
export class MusicPlayer {
  private theme: ThemeDef | null = null
  private track: { gain: GainNode; echo: DelayNode } | null = null
  private bar = 0
  private motif: Motif = []
  private nextBarAt = 0
  private timer: ReturnType<typeof setInterval> | null = null
  private wanted: string | null = null

  /** Asks for a theme; plays once audio is unlocked. Null stops the music. */
  play(themeId: string | null): void {
    this.wanted = themeId
    const ctx = audioContext()
    const out = musicOutput()
    if (!ctx || !out) return
    if (this.theme?.id === themeId && this.track) return
    this.fadeOut()
    if (!themeId || !THEMES[themeId]) {
      this.theme = null
      return
    }
    this.theme = THEMES[themeId]
    this.track = this.makeTrack(ctx, out)
    this.bar = 0
    this.motif = makeMotif(this.theme, Math.random)
    this.nextBarAt = ctx.currentTime + 0.3
    if (!this.timer) this.timer = setInterval(() => this.schedule(), 200)
    this.schedule()
  }

  /** Call when audio becomes available, to start whatever was asked for. */
  resume(): void {
    if (this.wanted) {
      const wanted = this.wanted
      this.theme = null
      this.play(wanted)
    }
  }

  private makeTrack(ctx: AudioContext, out: AudioNode) {
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.0001, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(1, ctx.currentTime + 2)
    gain.connect(out)
    // A soft echo for the music-box lead.
    const echo = ctx.createDelay(1)
    const feedback = ctx.createGain()
    feedback.gain.value = 0.28
    const wet = ctx.createGain()
    wet.gain.value = 0.35
    echo.connect(feedback).connect(echo)
    echo.connect(wet).connect(gain)
    return { gain, echo }
  }

  private fadeOut(): void {
    const ctx = audioContext()
    if (!ctx || !this.track) return
    const { gain } = this.track
    gain.gain.cancelScheduledValues(ctx.currentTime)
    gain.gain.setValueAtTime(Math.max(0.0001, gain.gain.value), ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.5)
    setTimeout(() => gain.disconnect(), 2000)
    this.track = null
  }

  private schedule(): void {
    const ctx = audioContext()
    if (!ctx || !this.theme || !this.track) return
    // Don't pile up notes while the tab was asleep.
    if (this.nextBarAt < ctx.currentTime) this.nextBarAt = ctx.currentTime + 0.1
    const beat = 60 / this.theme.bpm
    this.track.echo.delayTime.value = beat * 0.75
    while (this.nextBarAt < ctx.currentTime + 1) {
      if (this.bar % 8 === 0 && this.bar > 0) this.motif = makeMotif(this.theme, Math.random)
      for (const note of composeBar(this.theme, this.bar, this.motif, Math.random)) {
        this.playNote(ctx, note, this.nextBarAt + note.beat * beat, note.length * beat)
      }
      this.bar++
      this.nextBarAt += beat * 4
    }
  }

  private playNote(ctx: AudioContext, note: Note, at: number, length: number): void {
    if (!this.track || !this.theme) return
    const freq = midiToHz(note.midi)
    const gain = ctx.createGain()
    const osc = ctx.createOscillator()
    let end = at + length
    switch (note.voice) {
      case 'pad': {
        const filter = ctx.createBiquadFilter()
        filter.type = 'lowpass'
        filter.frequency.value = this.theme.padCutoff
        osc.type = 'sawtooth'
        osc.detune.value = (Math.random() - 0.5) * 12
        gain.gain.setValueAtTime(0.0001, at)
        gain.gain.linearRampToValueAtTime(0.035, at + length * 0.35)
        gain.gain.linearRampToValueAtTime(0.0001, at + length + 0.4)
        end += 0.4
        osc.connect(filter).connect(gain)
        break
      }
      case 'bass':
        osc.type = 'sine'
        gain.gain.setValueAtTime(0.0001, at)
        gain.gain.exponentialRampToValueAtTime(0.16, at + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.0001, at + length)
        osc.connect(gain)
        break
      case 'lead':
        osc.type = this.theme.lead
        gain.gain.setValueAtTime(0.0001, at)
        gain.gain.exponentialRampToValueAtTime(0.1, at + 0.01)
        gain.gain.exponentialRampToValueAtTime(0.0001, at + Math.max(0.35, length * 1.4))
        end = at + Math.max(0.35, length * 1.4)
        osc.connect(gain)
        gain.connect(this.track.echo)
        break
      case 'sparkle':
        osc.type = 'sine'
        gain.gain.setValueAtTime(0.0001, at)
        gain.gain.exponentialRampToValueAtTime(0.04, at + 0.01)
        gain.gain.exponentialRampToValueAtTime(0.0001, at + 1.2)
        end = at + 1.2
        osc.connect(gain)
        gain.connect(this.track.echo)
        break
    }
    osc.frequency.value = freq
    gain.connect(this.track.gain)
    osc.start(at)
    osc.stop(end + 0.05)
  }
}

export const music = new MusicPlayer()
