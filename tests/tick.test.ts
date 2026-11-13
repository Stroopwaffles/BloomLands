import { describe, expect, it } from 'vitest'
import { applyAction } from '../src/engine/actions'
import { createNewGame } from '../src/engine/state'
import type { System } from '../src/engine/systems'
import { advance, BASE_OFFLINE_CAP_MS, LIVE_GAP_MS, OFFLINE_STEP_MS } from '../src/engine/tick'

const START = 1_700_000_000_000
const HOUR = 3_600_000

describe('advance', () => {
  it('counts short gaps as live play', () => {
    const state = createNewGame(START)
    const report = advance(state, START + 100)
    expect(report).toEqual({ elapsedMs: 100, simulatedMs: 100, offline: false, capped: false })
    expect(state.stats.activePlayMs).toBe(100)
    expect(state.stats.offlineMs).toBe(0)
    expect(state.meta.lastTickAt).toBe(START + 100)
  })

  it('treats long gaps as offline progress', () => {
    const state = createNewGame(START)
    const report = advance(state, START + HOUR)
    expect(report.offline).toBe(true)
    expect(report.capped).toBe(false)
    expect(state.stats.offlineMs).toBe(HOUR)
  })

  it('caps offline progress at 4 hours', () => {
    const state = createNewGame(START)
    const report = advance(state, START + 10 * HOUR)
    expect(report.elapsedMs).toBe(10 * HOUR)
    expect(report.simulatedMs).toBe(BASE_OFFLINE_CAP_MS)
    expect(report.capped).toBe(true)
    expect(state.stats.offlineMs).toBe(BASE_OFFLINE_CAP_MS)
  })

  it('lets bonuses raise the offline cap', () => {
    const state = createNewGame(START)
    state.bonuses.offlineCapMs = 2 * HOUR
    const report = advance(state, START + 10 * HOUR)
    expect(report.simulatedMs).toBe(6 * HOUR)
  })

  it('ignores the clock moving backwards', () => {
    const state = createNewGame(START)
    const report = advance(state, START - 5000)
    expect(report.simulatedMs).toBe(0)
    expect(state.stats.activePlayMs).toBe(0)
    expect(state.meta.lastTickAt).toBe(START - 5000)
  })

  it('feeds systems offline time in slices no larger than one step', () => {
    const state = createNewGame(START)
    const slices: number[] = []
    const probe: System = { id: 'probe', update: (_s, dt) => void slices.push(dt) }
    advance(state, START + 150_000, [probe])
    expect(slices).toEqual([OFFLINE_STEP_MS, OFFLINE_STEP_MS, 30_000])
  })

  it('switches to offline mode just past the live gap', () => {
    const state = createNewGame(START)
    expect(advance(state, START + LIVE_GAP_MS).offline).toBe(false)
    expect(advance(state, START + LIVE_GAP_MS + LIVE_GAP_MS + 1).offline).toBe(true)
  })
})

describe('debug actions', () => {
  it('skips time as live play without a cap', () => {
    const state = createNewGame(START)
    applyAction(state, { type: 'debug/skipTime', ms: 6 * HOUR })
    expect(state.stats.activePlayMs).toBe(6 * HOUR)
  })

  it('adds glimmers but never below zero', () => {
    const state = createNewGame(START)
    applyAction(state, { type: 'debug/addGlimmers', amount: 50 })
    applyAction(state, { type: 'debug/addGlimmers', amount: -80 })
    expect(state.resources.glimmers).toBe(0)
  })

  it('adds and removes items', () => {
    const state = createNewGame(START)
    applyAction(state, { type: 'debug/addItem', itemId: 'raw-clover-leaves', amount: 3 })
    expect(state.inventory['raw-clover-leaves']).toBe(3)
    applyAction(state, { type: 'debug/addItem', itemId: 'raw-clover-leaves', amount: -3 })
    expect(state.inventory).not.toHaveProperty('raw-clover-leaves')
  })
})
