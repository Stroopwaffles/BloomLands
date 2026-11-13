import type { ItemStack } from '../data/types'

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
  | { type: 'blocked'; reason: 'satchel-full' | 'not-here' | 'flying' | 'no-plant' }
  | { type: 'depart'; to: string; totalMs: number }
  | { type: 'deposit'; items: ItemStack[] }
