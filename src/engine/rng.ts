import type { GameState } from './state'

/** A random number source returning values in [0, 1). */
export type Random = () => number

/** Random numbers from the save's own seed (mulberry32), so results are reproducible. */
export function stateRandom(state: GameState): Random {
  return () => {
    state.rng = (state.rng + 0x6d2b79f5) >>> 0
    let t = state.rng
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Picks one entry, with chance proportional to its weight. */
export function pickWeighted<T>(entries: readonly (readonly [T, number])[], random: Random): T {
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0)
  let roll = random() * total
  for (const [value, weight] of entries) {
    roll -= weight
    if (roll < 0) return value
  }
  return entries[entries.length - 1][0]
}
