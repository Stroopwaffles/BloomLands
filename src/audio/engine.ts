/**
 * The audio engine: one shared AudioContext with separate volume controls for sound effects and
 * music. Every sound is synthesized (no audio files), so the game stays small and self-made.
 *
 * Browsers only allow audio after the player interacts with the page, so the context is created
 * on the first tap or key press (see unlockAudio).
 */

export interface AudioMix {
  /** 0–1 */
  sfx: number
  /** 0–1 */
  music: number
  muted: boolean
}

let context: AudioContext | null = null
let master: GainNode | null = null
let sfxBus: GainNode | null = null
let musicBus: GainNode | null = null
let mix: AudioMix = { sfx: 0.75, music: 0.5, muted: false }
const readyListeners = new Set<() => void>()

/** The context, or null until the player has interacted (or if the browser has no Web Audio). */
export function audioContext(): AudioContext | null {
  return context
}

export function sfxOutput(): GainNode | null {
  return sfxBus
}

export function musicOutput(): GainNode | null {
  return musicBus
}

/** Called once audio can play (right away if it already can). */
export function onAudioReady(listener: () => void): () => void {
  readyListeners.add(listener)
  if (context) listener()
  return () => readyListeners.delete(listener)
}

/** Creates (or resumes) the audio context. Call from a user gesture. */
export function unlockAudio(): void {
  if (context) {
    if (context.state === 'suspended') void context.resume()
    return
  }
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return
  context = new Ctor()
  master = context.createGain()
  master.connect(context.destination)
  // A gentle limiter so many sounds at once never clip.
  const limiter = context.createDynamicsCompressor()
  limiter.threshold.value = -12
  limiter.ratio.value = 6
  limiter.connect(master)
  sfxBus = context.createGain()
  sfxBus.connect(limiter)
  musicBus = context.createGain()
  musicBus.connect(limiter)
  applyMix()
  for (const listener of readyListeners) listener()
}

/** Volume curve: sliders feel more even when squared. */
const curve = (v: number) => v * v

export function setMix(next: AudioMix): void {
  mix = next
  applyMix()
}

function applyMix(): void {
  if (!context || !master || !sfxBus || !musicBus) return
  const now = context.currentTime
  master.gain.setTargetAtTime(mix.muted ? 0 : 1, now, 0.05)
  sfxBus.gain.setTargetAtTime(curve(mix.sfx), now, 0.05)
  musicBus.gain.setTargetAtTime(curve(mix.music) * 1.1, now, 0.2)
}

export function currentMix(): AudioMix {
  return mix
}

/** Pauses all audio while the tab is hidden, so nothing plays in the background. */
export function setHidden(hidden: boolean): void {
  if (!context) return
  if (hidden) void context.suspend()
  else void context.resume()
}
