import { createNewGame, type GameState } from './state'
import { GAME_VERSION, SAVE_VERSION } from './version'

export const STORAGE_KEY = 'bloomlands.save'
export const BACKUP_KEY = 'bloomlands.save.backup'
const EXPORT_PREFIX = 'BLOOM1:'

/** What is actually written to storage. */
interface SaveFile {
  saveVersion: number
  savedAt: number
  state: unknown
}

export class SaveError extends Error {}

/**
 * Upgrades old saves. Key N converts a save from version N to N + 1.
 * When the save shape changes: bump SAVE_VERSION and add a migration here.
 */
type Migration = (state: Record<string, unknown>) => Record<string, unknown>
export const MIGRATIONS: Record<number, Migration> = {}

export function serialize(state: GameState, now: number): string {
  const file: SaveFile = { saveVersion: SAVE_VERSION, savedAt: now, state }
  return JSON.stringify(file)
}

export function deserialize(text: string): GameState {
  let file: SaveFile
  try {
    file = JSON.parse(text)
  } catch {
    throw new SaveError('Save data is not valid.')
  }
  if (!isRecord(file) || typeof file.saveVersion !== 'number' || !isRecord(file.state)) {
    throw new SaveError('Save data is not valid.')
  }
  if (file.saveVersion > SAVE_VERSION) {
    throw new SaveError('This save is from a newer version of the game.')
  }

  let raw = file.state as Record<string, unknown>
  for (let v = file.saveVersion; v < SAVE_VERSION; v++) {
    const migrate = MIGRATIONS[v]
    if (!migrate) throw new SaveError(`No way to upgrade a version ${v} save.`)
    raw = migrate(raw)
  }

  const state = fillDefaults(raw, createNewGame(Date.now())) as GameState
  state.meta.saveVersion = SAVE_VERSION
  state.meta.gameVersion = GAME_VERSION
  return state
}

// ---------------------------------------------------------------------------------------------
// Browser storage

/** Returns localStorage, or null where it's unavailable (private windows, blocked storage). */
export function getStorage(): Storage | null {
  try {
    const storage = globalThis.localStorage
    const probe = '__bloomlands_probe__'
    storage.setItem(probe, probe)
    storage.removeItem(probe)
    return storage
  } catch {
    return null
  }
}

/** Saves the game, keeping the previous save as a backup. Returns false if saving failed. */
export function saveToStorage(storage: Storage | null, state: GameState, now: number): boolean {
  if (!storage) return false
  try {
    const previous = storage.getItem(STORAGE_KEY)
    if (previous) storage.setItem(BACKUP_KEY, previous)
    state.meta.lastSavedAt = now
    storage.setItem(STORAGE_KEY, serialize(state, now))
    return true
  } catch {
    return false
  }
}

/** Loads the save, falling back to the backup if the main save is damaged. Null if neither works. */
export function loadFromStorage(storage: Storage | null): GameState | null {
  if (!storage) return null
  for (const key of [STORAGE_KEY, BACKUP_KEY]) {
    try {
      const text = storage.getItem(key)
      if (text) return deserialize(text)
    } catch {
      // Try the next one.
    }
  }
  return null
}

export function clearStorage(storage: Storage | null): void {
  if (!storage) return
  try {
    storage.removeItem(STORAGE_KEY)
    storage.removeItem(BACKUP_KEY)
  } catch {
    // Nothing else to do.
  }
}

// ---------------------------------------------------------------------------------------------
// Export / import (a text string players can copy to back up or move their save)

export function exportSave(state: GameState, now: number): string {
  return EXPORT_PREFIX + toBase64(serialize(state, now))
}

export function importSave(text: string): GameState {
  const trimmed = text.trim()
  if (!trimmed.startsWith(EXPORT_PREFIX)) throw new SaveError('That is not a Bloom Lands save.')
  let json: string
  try {
    json = fromBase64(trimmed.slice(EXPORT_PREFIX.length))
  } catch {
    throw new SaveError('That save text is damaged or incomplete.')
  }
  return deserialize(json)
}

function toBase64(text: string): string {
  const bytes = new TextEncoder().encode(text)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

function fromBase64(encoded: string): string {
  const binary = atob(encoded)
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
}

// ---------------------------------------------------------------------------------------------
// Helpers

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Fills anything missing from a loaded save with defaults from a new game, so saves made before
 * a new field existed still load. Values of the wrong type are replaced by the default.
 * Records whose default is empty (like inventory) are kept as loaded.
 */
function fillDefaults(loaded: unknown, defaults: unknown): unknown {
  if (isRecord(defaults)) {
    if (!isRecord(loaded)) return defaults
    if (Object.keys(defaults).length === 0) return loaded
    const result: Record<string, unknown> = { ...loaded }
    for (const [key, value] of Object.entries(defaults)) {
      result[key] = fillDefaults(loaded[key], value)
    }
    return result
  }
  // Fields that default to null (like an in-progress flight) keep whatever was saved.
  if (defaults === null) return loaded === undefined ? null : loaded
  return typeof loaded === typeof defaults ? loaded : defaults
}
