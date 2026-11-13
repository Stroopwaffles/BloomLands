import type { ItemStack } from '../data/types'

export type BlockedReason =
  | 'satchel-full'
  | 'not-here'
  | 'not-home'
  | 'flying'
  | 'no-plant'
  | 'locked'
  | 'station-busy'
  | 'research-busy'
  | 'missing-items'
  | 'already-done'

/**
 * Things that just happened, returned by actions so the screen can react (floating numbers,
 * wiggles, messages). Events are not saved.
 */
export type GameEvent =
  | { type: 'hit'; spotId: string; slot: number; damage: number; hpLeft: number }
  | {
      type: 'harvest'
      spotId: string
      slot: number
      plantId: string
      items: ItemStack[]
      bonus: boolean
      trinketId: string | null
    }
  | { type: 'blocked'; reason: BlockedReason }
  | { type: 'depart'; to: string; totalMs: number }
  | { type: 'deposit'; items: ItemStack[] }
  | { type: 'craft-start'; recipeId: string }
  | { type: 'research-start'; researchId: string }
  | { type: 'drink'; potionId: string }
