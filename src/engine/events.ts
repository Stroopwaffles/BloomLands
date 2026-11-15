import type { HelperType } from '../data/helpers'
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
  | 'no-room'
  | 'camp'
  | 'no-target'
  | 'no-circle'
  | 'not-ready'
  | 'not-morning'
  | 'watching'
  | 'needs-rank'
  | 'calm-only'
  | 'maxed'
  | 'missing-root-song'
  | 'not-full-moon'
  | 'no-stars'
  | 'cooling-down'
  | 'storm'
  | 'bonus-run'

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
  | { type: 'packed'; itemId: string; amount: number }
  | { type: 'craft-start'; recipeId: string; count: number }
  | { type: 'research-start'; researchId: string }
  /** Research finished (from a tick). */
  | { type: 'research-done'; researchId: string }
  /** A workshop job finished: its results are in storage (from a tick). */
  | { type: 'craft-done'; recipeId: string; itemId: string; amount: number }
  | { type: 'drink'; potionId: string }
  | { type: 'trade-filled'; requestId: number; glimmers: number; trinketId: string | null }
  | { type: 'upgrade-bought'; upgradeId: string; rankUp: boolean }
  | { type: 'recruited'; helperId: number; helperType: HelperType }
  | { type: 'pest-cleared'; spotId: string; slot: number; pestsLeft: number }
  | { type: 'creature-tap'; spotId: string; tapsLeft: number }
  | { type: 'creature-gone'; spotId: string; creatureId: string; how: 'shooed' | 'calmed' }
  | { type: 'camp-cleared'; spotId: string; crewId: string }
  | { type: 'flight-event'; result: string }
  | { type: 'spell-cast'; spellId: string }
  | { type: 'ritual-performed'; ritualId: string; regionId?: string }
  | { type: 'bloom'; regionId: string; amount: number; levelUp: boolean }
  | { type: 'curio'; curioId: string }
  | { type: 'villager-helped'; settlementId: string; glimmers: number }
  | { type: 'story'; text: string; complete: boolean }
  | { type: 'mount-fed'; mountId: string; feedings: number }
  | { type: 'mount-tamed'; mountId: string }
  | { type: 'mount-level'; mountId: string; level: number }
  | { type: 'secret'; spotId: string; found: 'unlocked' | 'visited' }
  | { type: 'outfit'; outfitId: string }
  | { type: 'crew-won'; crewId: string }
  | { type: 'region-unlocked'; regionId: string }
  | { type: 'prestige'; run: number; rootSong: number }
  | { type: 'captain-letter'; index: number }
  | { type: 'event-started'; eventId: string }
  | { type: 'event-ended'; eventId: string; sentHome: boolean }
  | { type: 'event-crafted'; recipeId: string }
  | { type: 'captain-joined' }
  /** The ending plays: it shows the court as it was when the last Root Song was sung. */
  | { type: 'ending'; rank: number; helpers: string[] }
  | { type: 'finale' }
  | { type: 'star-caught'; glimmers: number; itemId: string | null }
  | { type: 'moon-chosen'; phase: string }
  | { type: 'relic'; relicId: string }
  | { type: 'root-upgrade'; upgradeId: string; tier: number }
  | { type: 'shop-sold'; itemId: string; amount: number; glimmers: number }
  | { type: 'shop-bought'; itemId: string; amount: number; glimmers: number }
  | { type: 'parcel-sent'; count: number; fee: number; arrivesInMs: number }
  | { type: 'parcel-arrived'; count: number; waiting: number }
