import type { ItemStack } from '../data/types'

export type BlockedReason =
  | 'satchel-full'
  | 'storage-full'
  | 'not-here'
  | 'not-home'
  | 'flying'
  | 'no-plant'
  | 'locked'
  | 'not-built'
  | 'station-busy'
  | 'research-busy'
  | 'missing-items'
  | 'missing-glimmers'
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
  | { type: 'depart'; to: string; totalMs: number; auto: boolean }
  | { type: 'deposit'; items: ItemStack[]; leftOver: number }
  | { type: 'craft-start'; recipeId: string; count: number }
  | { type: 'research-start'; researchId: string }
  | { type: 'drink'; potionId: string }
  | { type: 'trade-filled'; requestId: number; glimmers: number; trinketId: string | null }
  | { type: 'upgrade-bought'; upgradeId: string; rankUp: boolean }
