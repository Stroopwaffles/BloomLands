import { audioContext, sfxOutput } from './engine'

/**
 * Sound effects, synthesized: soft plucks, chimes and whooshes in a music-box style, all in the
 * same key as the music (C major pentatonic) so they never clash.
 */

export type SoundId =
  | 'tap'
  | 'harvest'
  | 'rare'
  | 'trinket'
  | 'deposit'
  | 'click'
  | 'blocked'
  | 'craft'
  | 'coins'
  | 'spell'
  | 'ritual'
  | 'fanfare'
  | 'depart'
  | 'boing'
  | 'shoo'
  | 'pop'

/** C major pentatonic, two octaves up from middle C. Taps climb through it. */
const PENTATONIC = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.51]

interface ToneOptions {
  freq: number
  type?: OscillatorType
  start?: number
  attack?: number
  decay?: number
  volume?: number
  /** Slide to this frequency over the decay. */
  slideTo?: number
  /** Adds a soft second partial an octave (or so) up, for a bell-like tone. */
  bell?: boolean
}

function tone(ctx: AudioContext, out: AudioNode, o: ToneOptions): void {
  const t = ctx.currentTime + (o.start ?? 0)
  const attack = o.attack ?? 0.005
  const decay = o.decay ?? 0.25
  const volume = o.volume ?? 0.3
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.exponentialRampToValueAtTime(volume, t + attack)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay)
  gain.connect(out)
  const osc = ctx.createOscillator()
  osc.type = o.type ?? 'sine'
  osc.frequency.setValueAtTime(o.freq, t)
  if (o.slideTo) osc.frequency.exponentialRampToValueAtTime(o.slideTo, t + attack + decay)
  osc.connect(gain)
  osc.start(t)
  osc.stop(t + attack + decay + 0.05)
  if (o.bell) {
    const g2 = ctx.createGain()
    g2.gain.setValueAtTime(0.0001, t)
    g2.gain.exponentialRampToValueAtTime(volume * 0.35, t + attack)
    g2.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay * 0.6)
    g2.connect(out)
    const o2 = ctx.createOscillator()
    o2.frequency.setValueAtTime(o.freq * 2.76, t)
    o2.connect(g2)
    o2.start(t)
    o2.stop(t + attack + decay)
  }
}

/** A filtered noise burst (wind, rustles). */
function noise(
  ctx: AudioContext,
  out: AudioNode,
  o: { start?: number; duration: number; from: number; to: number; volume: number; q?: number },
): void {
  const t = ctx.currentTime + (o.start ?? 0)
  const length = Math.ceil(ctx.sampleRate * o.duration)
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1
  const src = ctx.createBufferSource()
  src.buffer = buffer
  const filter = ctx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.Q.value = o.q ?? 1.2
  filter.frequency.setValueAtTime(o.from, t)
  filter.frequency.exponentialRampToValueAtTime(o.to, t + o.duration)
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.exponentialRampToValueAtTime(o.volume, t + o.duration * 0.3)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + o.duration)
  src.connect(filter).connect(gain).connect(out)
  src.start(t)
  src.stop(t + o.duration)
}

let tapStep = 0
let tapResetAt = 0

const SOUNDS: Record<SoundId, (ctx: AudioContext, out: AudioNode) => void> = {
  // Each tap on a plant climbs a step up the scale, so a run of taps plays a little tune.
  tap(ctx, out) {
    const now = ctx.currentTime
    if (now > tapResetAt) tapStep = 0
    tapResetAt = now + 0.8
    const freq = PENTATONIC[tapStep % 5]
    tapStep++
    tone(ctx, out, { freq, type: 'triangle', decay: 0.12, volume: 0.22 })
  },
  harvest(ctx, out) {
    ;[0, 2, 4].forEach((n, i) =>
      tone(ctx, out, {
        freq: PENTATONIC[n],
        start: i * 0.06,
        decay: 0.35,
        volume: 0.22,
        bell: true,
      }),
    )
    noise(ctx, out, { duration: 0.18, from: 2500, to: 5000, volume: 0.05 })
  },
  rare(ctx, out) {
    ;[2, 4, 5, 7].forEach((n, i) =>
      tone(ctx, out, { freq: PENTATONIC[n], start: i * 0.07, decay: 0.6, volume: 0.2, bell: true }),
    )
  },
  trinket(ctx, out) {
    ;[7, 5, 7].forEach((n, i) =>
      tone(ctx, out, {
        freq: PENTATONIC[n] * 1.5,
        start: 0.1 + i * 0.09,
        decay: 0.5,
        volume: 0.16,
        bell: true,
      }),
    )
  },
  deposit(ctx, out) {
    tone(ctx, out, { freq: 392, type: 'triangle', decay: 0.18, volume: 0.25 })
    tone(ctx, out, { freq: 523.25, type: 'triangle', start: 0.08, decay: 0.3, volume: 0.22 })
  },
  click(ctx, out) {
    tone(ctx, out, { freq: 880, type: 'triangle', decay: 0.06, volume: 0.22, slideTo: 660 })
  },
  blocked(ctx, out) {
    tone(ctx, out, { freq: 220, type: 'triangle', decay: 0.18, volume: 0.18, slideTo: 180 })
  },
  craft(ctx, out) {
    for (let i = 0; i < 4; i++) {
      tone(ctx, out, {
        freq: 300 + Math.random() * 300,
        start: i * 0.05,
        decay: 0.08,
        volume: 0.12,
        slideTo: 700 + Math.random() * 300,
      })
    }
  },
  coins(ctx, out) {
    ;[1318.51, 1567.98, 2093].forEach((f, i) =>
      tone(ctx, out, { freq: f, start: i * 0.06, decay: 0.25, volume: 0.12, bell: true }),
    )
  },
  spell(ctx, out) {
    noise(ctx, out, { duration: 0.6, from: 800, to: 6000, volume: 0.08, q: 4 })
    ;[0, 3, 5, 7].forEach((n, i) =>
      tone(ctx, out, { freq: PENTATONIC[n], start: i * 0.05, decay: 0.4, volume: 0.12 }),
    )
  },
  ritual(ctx, out) {
    ;[261.63, 329.63, 392, 523.25].forEach((f) =>
      tone(ctx, out, { freq: f, attack: 0.3, decay: 1.6, volume: 0.1 }),
    )
    tone(ctx, out, { freq: 1046.5, start: 0.4, decay: 1, volume: 0.1, bell: true })
  },
  fanfare(ctx, out) {
    ;[0, 2, 4, 5].forEach((n, i) =>
      tone(ctx, out, {
        freq: PENTATONIC[n],
        type: 'triangle',
        start: i * 0.12,
        decay: i === 3 ? 0.9 : 0.2,
        volume: 0.2,
      }),
    )
    ;[523.25, 659.25, 783.99].forEach((f) =>
      tone(ctx, out, { freq: f, start: 0.36, attack: 0.02, decay: 1, volume: 0.08 }),
    )
  },
  depart(ctx, out) {
    noise(ctx, out, { duration: 0.5, from: 400, to: 2400, volume: 0.12 })
    tone(ctx, out, { freq: 440, decay: 0.3, volume: 0.08, slideTo: 880 })
  },
  boing(ctx, out) {
    tone(ctx, out, { freq: 180, type: 'triangle', decay: 0.2, volume: 0.25, slideTo: 360 })
  },
  shoo(ctx, out) {
    noise(ctx, out, { duration: 0.25, from: 3000, to: 900, volume: 0.1 })
  },
  pop(ctx, out) {
    tone(ctx, out, { freq: 900, decay: 0.06, volume: 0.15, slideTo: 1500 })
  },
}

/** Don't play the same sound more often than this (offline catch-up can bring many at once). */
const MIN_GAP_S = 0.035
const lastPlayed = new Map<SoundId, number>()

export function playSound(id: SoundId): void {
  const ctx = audioContext()
  const out = sfxOutput()
  if (!ctx || !out || ctx.state !== 'running') return
  const last = lastPlayed.get(id) ?? -1
  if (ctx.currentTime - last < MIN_GAP_S) return
  lastPlayed.set(id, ctx.currentTime)
  SOUNDS[id](ctx, out)
}
