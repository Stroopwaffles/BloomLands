import { describe, expect, it } from 'vitest'
import { applyAction } from '../src/engine/actions'
import { satchelCapacity, satchelMountAway, satchelOverload } from '../src/engine/modifiers'
import { createNewGame, type GameState } from '../src/engine/state'

const START = 1_700_000_000_000

/** Riding the bumblebee with a satchel filled using its Meadow bonus. */
function beeLoaded(): GameState {
  const state = createNewGame(START)
  state.unlockedRegions.push('forest')
  state.mounts.owned['mount-bumblebee'] = { level: 1 }
  state.mounts.riding = 'mount-bumblebee'
  state.player.satchel = { 'raw-clover-leaves': satchelCapacity(state) }
  return state
}

describe('an over-full satchel', () => {
  it('knows the satchel is smaller away from the bee’s Meadow', () => {
    const state = beeLoaded()
    const meadow = satchelCapacity(state)
    expect(satchelCapacity(state, 'fernshade-floor')).toBe(meadow - 10)
    expect(satchelMountAway(state)).toBeNull()
    expect(satchelMountAway(state, 'fernshade-floor')).toBe(
      'the bumblebee only carries extra in the Meadow',
    )
  })

  it('arriving in the Forest leaves the satchel over-full: nothing lost, no gathering', () => {
    const state = beeLoaded()
    const carried = state.player.satchel['raw-clover-leaves']
    state.player.place = 'fernshade-floor'
    state.spots['fernshade-floor'] = {
      slots: [{ plantId: 'plant-moss', hp: 1, regrowMs: 0 }],
    } as GameState['spots'][string]
    expect(satchelOverload(state)).toBe(10)
    expect(state.player.satchel['raw-clover-leaves']).toBe(carried)
    expect(applyAction(state, { type: 'gather/tap', spotId: 'fernshade-floor', slot: 0 })).toEqual([
      { type: 'blocked', reason: 'satchel-full' },
    ])
  })

  it('a Deep Pockets Draught wearing off can also leave it over-full', () => {
    const state = createNewGame(START)
    state.buffs.push({ potionId: 'potion-deep-pockets-draught', remainingMs: 1000 })
    state.player.satchel = { 'raw-clover-leaves': satchelCapacity(state) }
    state.buffs = []
    expect(satchelOverload(state)).toBe(10)
    expect(satchelMountAway(state)).toBeNull()
  })
})
