import { describe, expect, it } from 'vitest'
import {
  BACKUP_KEY,
  deserialize,
  exportSave,
  importSave,
  loadFromStorage,
  SaveError,
  saveToStorage,
  serialize,
  STORAGE_KEY,
} from '../src/engine/save'
import { createNewGame } from '../src/engine/state'
import { SAVE_VERSION } from '../src/engine/version'

const NOW = 1_700_000_000_000

/** A tiny in-memory stand-in for localStorage. */
function memoryStorage(): Storage {
  const data = new Map<string, string>()
  return {
    get length() {
      return data.size
    },
    clear: () => data.clear(),
    getItem: (key) => data.get(key) ?? null,
    key: (index) => [...data.keys()][index] ?? null,
    removeItem: (key) => void data.delete(key),
    setItem: (key, value) => void data.set(key, String(value)),
  }
}

function sampleGame() {
  const state = createNewGame(NOW)
  state.resources.glimmers = 1234
  state.inventory['raw-daisy-petals'] = 7
  state.stats.activePlayMs = 5000
  return state
}

describe('serialize / deserialize', () => {
  it('round-trips a game', () => {
    const state = sampleGame()
    const loaded = deserialize(serialize(state, NOW))
    expect(loaded.resources.glimmers).toBe(1234)
    expect(loaded.inventory).toEqual({ 'raw-daisy-petals': 7 })
    expect(loaded.stats.activePlayMs).toBe(5000)
    expect(loaded.meta.saveVersion).toBe(SAVE_VERSION)
  })

  it('fills in fields missing from older saves', () => {
    const text = JSON.stringify({
      saveVersion: SAVE_VERSION,
      savedAt: NOW,
      state: { resources: { glimmers: 42 } },
    })
    const loaded = deserialize(text)
    expect(loaded.resources.glimmers).toBe(42)
    expect(loaded.upgrades).toEqual([])
    expect(loaded.inventory).toEqual({})
    expect(loaded.bonuses.offlineCapMs).toBe(0)
  })

  it('replaces values of the wrong type with defaults', () => {
    const text = JSON.stringify({
      saveVersion: SAVE_VERSION,
      savedAt: NOW,
      state: { resources: { glimmers: 'lots' } },
    })
    expect(deserialize(text).resources.glimmers).toBe(0)
  })

  it('rejects garbage', () => {
    expect(() => deserialize('not json')).toThrow(SaveError)
    expect(() => deserialize('{"hello": 1}')).toThrow(SaveError)
  })

  it('rejects saves from a newer version', () => {
    const text = JSON.stringify({ saveVersion: SAVE_VERSION + 1, savedAt: NOW, state: {} })
    expect(() => deserialize(text)).toThrow(/newer version/)
  })
})

describe('storage', () => {
  it('saves and loads', () => {
    const storage = memoryStorage()
    expect(saveToStorage(storage, sampleGame(), NOW)).toBe(true)
    const loaded = loadFromStorage(storage)
    expect(loaded?.resources.glimmers).toBe(1234)
    expect(loaded?.meta.lastSavedAt).toBe(NOW)
  })

  it('keeps the previous save as a backup and uses it if the main save is damaged', () => {
    const storage = memoryStorage()
    const first = sampleGame()
    saveToStorage(storage, first, NOW)
    const second = sampleGame()
    second.resources.glimmers = 99
    saveToStorage(storage, second, NOW + 1000)

    storage.setItem(STORAGE_KEY, '{broken')
    expect(storage.getItem(BACKUP_KEY)).not.toBeNull()
    expect(loadFromStorage(storage)?.resources.glimmers).toBe(1234)
  })

  it('returns null when there is no save or no storage', () => {
    expect(loadFromStorage(memoryStorage())).toBeNull()
    expect(loadFromStorage(null)).toBeNull()
    expect(saveToStorage(null, sampleGame(), NOW)).toBe(false)
  })
})

describe('export / import', () => {
  it('round-trips through the text format', () => {
    const text = exportSave(sampleGame(), NOW)
    expect(text.startsWith('BLOOM1:')).toBe(true)
    expect(importSave(`  ${text}\n`).resources.glimmers).toBe(1234)
  })

  it('handles non-English text inside the save', () => {
    const state = sampleGame()
    state.inventory['raw-fée-✨'] = 1
    expect(importSave(exportSave(state, NOW)).inventory['raw-fée-✨']).toBe(1)
  })

  it('gives readable errors for bad input', () => {
    expect(() => importSave('hello')).toThrow('That is not a Bloom Lands save.')
    expect(() => importSave('BLOOM1:%%%')).toThrow(SaveError)
  })
})
