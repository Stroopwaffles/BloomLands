import { setMix } from '../audio/engine'
import { setNumberStyle } from '../engine/format'
import { runtime } from './game'
import { parseSettings, SETTINGS_KEY, type Settings } from './settingsData'

function load(): Settings {
  try {
    return parseSettings(localStorage.getItem(SETTINGS_KEY))
  } catch {
    return parseSettings(null)
  }
}

/** The player's settings, reactive. Change them with updateSettings(). */
export const settings: Settings = $state(load())

export function updateSettings(patch: Partial<Settings>): void {
  Object.assign(settings, patch)
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch {
    // Storage blocked: settings still apply for this visit.
  }
  applySettings()
}

/** Applies settings to the page and the game. Called on start and after every change. */
export function applySettings(): void {
  const root = document.documentElement
  root.classList.toggle('reduce-motion', settings.reducedMotion === 'on')
  root.classList.toggle('no-particles', !settings.particles)
  root.style.setProperty('--ui-scale', String(settings.uiScale / 100))
  setNumberStyle(settings.numberStyle)
  runtime.setAutosaveMs(settings.autosaveSeconds * 1000)
  setMix({
    music: settings.musicVolume / 100,
    sfx: settings.soundVolume / 100,
    muted: settings.muted,
  })
}
