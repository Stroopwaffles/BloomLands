import { describe, expect, it } from 'vitest'
import { BLOOM_REWARDS } from '../src/data/bloom'
import { ITEMS } from '../src/data/items'
import { STORIES } from '../src/data/stories'
import { applyAction } from '../src/engine/actions'
import { storyStatus, taskProgress, taskReady } from '../src/engine/stories'
import { createNewGame, type GameState } from '../src/engine/state'

const START = 1_700_000_000_000

function inVillage(): GameState {
  const state = createNewGame(START)
  state.player.place = 'thimblewick'
  return state
}

const talk = (state: GameState, storyId: string) =>
  applyAction(state, { type: 'story/advance', storyId })

describe('story data', () => {
  it('only asks for items that exist', () => {
    for (const story of Object.values(STORIES)) {
      for (const chapter of story.chapters) {
        if (chapter.task.kind !== 'bring') continue
        for (const entry of chapter.task.items) {
          if ('itemId' in entry) expect(ITEMS[entry.itemId], story.id).toBeDefined()
        }
      }
    }
  })
})

describe("Pip's story", () => {
  it('runs chapter by chapter to the curio', () => {
    const state = inVillage()
    expect(storyStatus(state, 'story-pip')).toBe('new')
    talk(state, 'story-pip')
    expect(storyStatus(state, 'story-pip')).toBe('active')

    // Chapter 1: gather 20 plants (counted from when it began).
    state.stats.plantsHarvested = 5
    expect(taskProgress(state, 'story-pip')).toEqual([5, 20])
    expect(talk(state, 'story-pip')).toEqual([{ type: 'blocked', reason: 'missing-items' }])
    state.stats.plantsHarvested = 20
    expect(taskReady(state, 'story-pip')).toBe(true)
    const events = talk(state, 'story-pip')
    expect(events.map((e) => e.type)).toEqual(['story', 'bloom'])
    expect(state.bloom.meadow).toBe(BLOOM_REWARDS.storyChapter)

    // Chapter 2: bring Leaf Tea (from the satchel or storage).
    state.player.satchel = { 'refined-leaf-tea': 2 }
    talk(state, 'story-pip')
    expect(state.player.satchel).toEqual({})

    // Chapter 3: shoo a rabbit.
    state.stats.creaturesShooed++
    talk(state, 'story-pip')

    // Chapter 4: bring fluff; the story ends with the compass.
    state.inventory = { 'raw-dandelion-fluff': 6 }
    const ending = talk(state, 'story-pip')
    expect(ending.map((e) => e.type)).toEqual(['story', 'bloom', 'curio'])
    expect(state.curios).toContain('curio-pips-compass')
    expect(storyStatus(state, 'story-pip')).toBe('complete')
    expect(state.bloom.meadow).toBe(3 * BLOOM_REWARDS.storyChapter + BLOOM_REWARDS.storyComplete)
    expect(talk(state, 'story-pip')).toEqual([{ type: 'blocked', reason: 'already-done' }])
  })

  it('only counts progress made after the chapter began', () => {
    const state = inVillage()
    state.stats.plantsHarvested = 100
    talk(state, 'story-pip')
    expect(taskProgress(state, 'story-pip')).toEqual([0, 20])
  })

  it('needs you to visit Pip in Thimblewick', () => {
    const state = createNewGame(START)
    expect(talk(state, 'story-pip')).toEqual([{ type: 'blocked', reason: 'not-here' }])
  })
})

describe("Marigold's story", () => {
  it('counts villagers helped', () => {
    const state = inVillage()
    talk(state, 'story-marigold')
    state.inventory = { 'raw-wild-berries': 8, 'refined-petal-paste': 2 }
    talk(state, 'story-marigold')
    talk(state, 'story-marigold')
    expect(taskProgress(state, 'story-marigold')).toEqual([0, 2])
    state.stats.villagersHelped += 2
    talk(state, 'story-marigold')
    state.inventory = { 'component-sun-salve': 1 }
    talk(state, 'story-marigold')
    expect(state.curios).toContain('curio-festival-ribbon')
  })
})
