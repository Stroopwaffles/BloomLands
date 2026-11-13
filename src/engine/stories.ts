import { BLOOM_REWARDS } from '../data/bloom'
import { CHARACTERS, STORIES, type StoryTask } from '../data/stories'
import { SETTLEMENTS } from '../data/world'
import { addBloom, giveCurio } from './bloom'
import { canPay, payCost } from './costs'
import type { GameEvent } from './events'
import type { GameState } from './state'

/**
 * Character storylines (design doc 3.7). Each chapter asks for something; finishing a chapter
 * raises the region's bloom, and finishing the story gives the character's curio.
 */

export type StoryStatus = 'new' | 'active' | 'complete'

export function storyStatus(state: GameState, storyId: string): StoryStatus {
  const story = state.stories[storyId]
  if (!story) return 'new'
  return story.complete ? 'complete' : 'active'
}

/** How far along the current chapter's task is: [done, needed]. */
export function taskProgress(state: GameState, storyId: string): [number, number] {
  const progress = state.stories[storyId]
  const def = STORIES[storyId]
  const chapter = progress && !progress.complete ? def.chapters[progress.chapter] : null
  if (!chapter) return [0, 0]
  const task: StoryTask = chapter.task
  if (task.kind === 'stat') {
    return [Math.min(task.amount, state.stats[task.stat] - progress.statStart), task.amount]
  }
  return canPay(state, task.items) ? [1, 1] : [0, 1]
}

export function taskReady(state: GameState, storyId: string): boolean {
  const [done, needed] = taskProgress(state, storyId)
  return needed > 0 && done >= needed
}

function regionOfStory(storyId: string): string {
  const character = CHARACTERS[STORIES[storyId].characterId]
  return SETTLEMENTS[character.settlement]?.regionId ?? 'meadow'
}

function beginChapter(state: GameState, storyId: string, chapter: number): void {
  const task = STORIES[storyId].chapters[chapter].task
  state.stories[storyId] = {
    chapter,
    statStart: task.kind === 'stat' ? state.stats[task.stat] : 0,
    complete: false,
  }
}

/**
 * Talking to a character: starts their story, or (once the current task is done) hands things
 * over and moves to the next chapter. Must be done in person, in their settlement.
 */
export function advanceStory(state: GameState, storyId: string): GameEvent[] {
  const def = STORIES[storyId]
  if (!def) return [{ type: 'blocked', reason: 'locked' }]
  const character = CHARACTERS[def.characterId]
  if (state.player.travel || state.player.place !== character.settlement) {
    return [{ type: 'blocked', reason: 'not-here' }]
  }

  const progress = state.stories[storyId]
  if (!progress) {
    beginChapter(state, storyId, 0)
    return [{ type: 'story', text: `${character.name} asks for your help.`, complete: false }]
  }
  if (progress.complete) return [{ type: 'blocked', reason: 'already-done' }]
  if (!taskReady(state, storyId)) return [{ type: 'blocked', reason: 'missing-items' }]

  const task = def.chapters[progress.chapter].task
  if (task.kind === 'bring') payCost(state, task.items)
  const region = regionOfStory(storyId)
  const next = progress.chapter + 1

  if (next < def.chapters.length) {
    beginChapter(state, storyId, next)
    return [
      { type: 'story', text: `${character.name}: chapter ${next} done!`, complete: false },
      ...addBloom(state, region, BLOOM_REWARDS.storyChapter),
    ]
  }

  progress.complete = true
  return [
    { type: 'story', text: `${character.name}'s story is complete!`, complete: true },
    ...addBloom(state, region, BLOOM_REWARDS.storyComplete),
    ...giveCurio(state, def.curioId),
  ]
}

/** Stories told in a settlement, in order. */
export function storiesIn(settlementId: string): string[] {
  return Object.values(STORIES)
    .filter((story) => CHARACTERS[story.characterId].settlement === settlementId)
    .map((story) => story.id)
}
