import { describe, expect, it } from 'vitest'
import { CREWS } from '../src/data/challenges'
import { CAPTAIN_LETTERS } from '../src/data/ending'
import { applyAction } from '../src/engine/actions'
import {
  advanceFinale,
  captainJoined,
  captainLetters,
  recordCrewWon,
  unreadLetters,
} from '../src/engine/ending'
import { checkRitual } from '../src/engine/magic'
import { courtPoints } from '../src/engine/modifiers'
import { createNewGame, type GameState, type HelperState } from '../src/engine/state'

const START = 1_700_000_000_000

function readyToSing(run: number): GameState {
  const state = createNewGame(START)
  state.character.created = true
  state.prestige.run = run
  state.upgrades.push('lodging-ritual-circle')
  state.research.completed.push('research-root-song')
  state.inventory['component-harmony-blend'] = 1
  state.unlockedRegions.push('sky')
  for (let id = 1; id <= 44; id++) {
    state.helpers.list.push({ id, type: 'gatherer', name: 'H', task: null } as HelperState)
  }
  return state
}

const sing = (state: GameState) =>
  applyAction(state, { type: 'ritual/perform', ritualId: 'ritual-root-song' })

describe('Captain Mallow', () => {
  it('writes a letter for each crew ever won over, and joins after the seventh', () => {
    const state = createNewGame(START)
    expect(Object.keys(CREWS)).toHaveLength(CAPTAIN_LETTERS.length)
    expect(recordCrewWon(state, 'dandelion-drifters')).toEqual([
      { type: 'captain-letter', index: 0 },
    ])
    // Winning the same crew again (in a later run) doesn't send another letter.
    expect(recordCrewWon(state, 'dandelion-drifters')).toEqual([])
    expect(unreadLetters(state)).toBe(1)
    applyAction(state, { type: 'captain/read' })
    expect(unreadLetters(state)).toBe(0)
    const points = courtPoints(state)
    const others = Object.keys(CREWS).filter((id) => id !== 'dandelion-drifters')
    let last: ReturnType<typeof recordCrewWon> = []
    for (const id of others) last = recordCrewWon(state, id)
    expect(last).toContainEqual({ type: 'captain-joined' })
    expect(captainJoined(state)).toBe(true)
    expect(captainLetters(state)).toHaveLength(7)
    expect(courtPoints(state)).toBe(points + 5)
  })

  it('her letters and her place at court last through the Root Song', () => {
    const state = readyToSing(1)
    for (const id of Object.keys(CREWS)) recordCrewWon(state, id)
    sing(state)
    expect(state.prestige.run).toBe(2)
    expect(captainJoined(state)).toBe(true)
  })
})

describe('the ending', () => {
  it('the fifth Root Song plays the ending and starts the bonus run', () => {
    const fourth = readyToSing(4)
    expect(sing(fourth).some((e) => e.type === 'ending')).toBe(false)
    const fifth = readyToSing(5)
    const events = sing(fifth)
    expect(events.find((e) => e.type === 'ending')).toMatchObject({ rank: 5 })
    expect(fifth.prestige.run).toBe(6)
    expect(fifth.prestige.endingSeen).toBe(true)
  })

  it('no more Root Song in the bonus run', () => {
    const state = readyToSing(6)
    state.prestige.endingSeen = true
    expect(checkRitual(state, 'ritual-root-song')).toBe('bonus-run')
  })

  it('the bonus run ends at the Grand Court with the final screen', () => {
    const state = readyToSing(6)
    advanceFinale(state)
    expect(state.prestige.finale).toBeUndefined()
    state.prestige.endingSeen = true
    advanceFinale(state)
    expect(state.prestige.finale).toBeUndefined()
    for (let id = 100; id < 160; id++) {
      state.helpers.list.push({ id, type: 'gatherer', name: 'H', task: null } as HelperState)
    }
    advanceFinale(state)
    expect(state.prestige.finale).toBe(true)
    expect(state.inbox).toContainEqual({ type: 'finale' })
    state.inbox = []
    advanceFinale(state)
    expect(state.inbox).toEqual([])
  })
})
