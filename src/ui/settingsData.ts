/**
 * Player settings. Kept in their own browser-storage key, separate from the save, so they survive
 * starting a new game. Plain functions here so they can be tested.
 */

export type NumberStyle = 'short' | 'scientific'

export interface Settings {
  /** 'system' follows the device; 'on' always reduces motion. */
  reducedMotion: 'system' | 'on'
  /** Whole-interface size, in percent. */
  uiScale: 90 | 100 | 110 | 125
  /** Seconds between autosaves. */
  autosaveSeconds: 15 | 30 | 60 | 120
  numberStyle: NumberStyle
  /** Petal bursts, sparkles and weather particles. */
  particles: boolean
  /** Background music volume, in percent. */
  musicVolume: 0 | 25 | 50 | 75 | 100
  /** Sound effects volume, in percent. */
  soundVolume: 0 | 25 | 50 | 75 | 100
  /** Quick mute (the speaker button in the header). */
  muted: boolean
  /** 'auto' switches the interface to soft night colors while it's night in the game. */
  nightTheme: 'auto' | 'off'
  /** A notice when research or a workshop job finishes. */
  workNotices: boolean
  /** Also a desktop notification for those while the game is in the background. */
  desktopAlerts: boolean
}

export const DEFAULT_SETTINGS: Settings = {
  reducedMotion: 'system',
  uiScale: 100,
  autosaveSeconds: 30,
  numberStyle: 'short',
  particles: true,
  musicVolume: 50,
  soundVolume: 75,
  muted: false,
  nightTheme: 'auto',
  workNotices: true,
  desktopAlerts: false,
}

export const SETTINGS_KEY = 'bloomlands.settings'

export const SETTING_CHOICES = {
  reducedMotion: ['system', 'on'],
  uiScale: [90, 100, 110, 125],
  autosaveSeconds: [15, 30, 60, 120],
  numberStyle: ['short', 'scientific'],
  particles: [true, false],
  musicVolume: [0, 25, 50, 75, 100],
  soundVolume: [0, 25, 50, 75, 100],
  muted: [true, false],
  nightTheme: ['auto', 'off'],
  workNotices: [true, false],
  desktopAlerts: [true, false],
} as const satisfies { [K in keyof Settings]: readonly Settings[K][] }

/** Reads settings from stored text, keeping only valid values and filling in defaults. */
export function parseSettings(text: string | null): Settings {
  const settings: Settings = { ...DEFAULT_SETTINGS }
  if (!text) return settings
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    return settings
  }
  if (typeof raw !== 'object' || raw === null) return settings
  for (const key of Object.keys(DEFAULT_SETTINGS) as (keyof Settings)[]) {
    const value = (raw as Record<string, unknown>)[key]
    if ((SETTING_CHOICES[key] as readonly unknown[]).includes(value)) {
      ;(settings as unknown as Record<string, unknown>)[key] = value
    }
  }
  return settings
}
