import { describe, expect, it } from 'vitest'
import { WEATHER } from '../src/data/challenges'
import { DAY_MS, NIGHTFALL_MS, PHASE_STARTS } from '../src/data/time'
import {
  DAYTIME_MS,
  describeWeather,
  nextPhase,
  NIGHTTIME_MS,
  untilDayChange,
} from '../src/engine/environment'
import { createNewGame } from '../src/engine/state'

describe('weather names follow the time of day', () => {
  it('never calls a night sky sunny', () => {
    expect(describeWeather(WEATHER.sunshine, 'afternoon').name).toBe('Sunny')
    expect(describeWeather(WEATHER.sunshine, 'dusk').name).toBe('Clear skies')
    expect(describeWeather(WEATHER.sunshine, 'night').name).toBe('Starry skies')
    expect(describeWeather(WEATHER.sunshine, 'night').description).not.toMatch(/sun/i)
  })

  it('has no weather name that only fits the morning or the daytime', () => {
    for (const weather of Object.values(WEATHER)) {
      for (const { phase } of PHASE_STARTS) {
        const { name } = describeWeather(weather, phase)
        if (phase !== 'dawn' && phase !== 'morning') expect(name).not.toMatch(/morning/i)
        if (phase === 'night' || phase === 'dusk') expect(name).not.toMatch(/sun/i)
        if (phase === 'night') {
          expect(describeWeather(weather, phase).description).not.toMatch(/all day|sun\b/i)
        }
      }
    }
  })
})

describe('the clock', () => {
  it('knows how long day and night last', () => {
    expect(DAYTIME_MS + NIGHTTIME_MS).toBe(DAY_MS)
    expect(DAYTIME_MS).toBe(NIGHTFALL_MS)
  })

  it('counts down to the next part of the day and to nightfall or dawn', () => {
    const state = createNewGame(0)
    state.time.dayMs = 0.5 * DAY_MS
    expect(nextPhase(state).phase).toBe('dusk')
    expect(nextPhase(state).inMs).toBeCloseTo(0.05 * DAY_MS)
    expect(untilDayChange(state)).toEqual({ to: 'night', inMs: NIGHTFALL_MS - 0.5 * DAY_MS })
    state.time.dayMs = 0.9 * DAY_MS
    expect(nextPhase(state).phase).toBe('dawn')
    expect(nextPhase(state).inMs).toBeCloseTo(0.1 * DAY_MS)
    expect(untilDayChange(state).to).toBe('day')
  })
})
