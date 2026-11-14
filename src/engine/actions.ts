import { drinkPotion } from './buffs'
import { equipPiece, finishCreating, recolorSlot, setLook } from './character'
import { startCraft } from './crafting'
import type { CharacterLook, OutfitSlot } from '../data/appearance'
import type { HelperType } from '../data/helpers'
import type { GameEvent } from './events'
import { depositSatchel, packSatchel, tapPlant } from './gathering'
import { tapCreature } from './challenges'
import { tapFlightEvent } from './flightEvents'
import { assignHelper, recruitHelper, setBrew, setMinimum } from './helpers'
import { castSpell, performRitual } from './magic'
import { sendParcel } from './post'
import { buyItems, sellItems } from './shop'
import { dismissVillagerRequest, fulfillVillagerRequest } from './settlements'
import { feedMount, levelUpMount, rideMount } from './mounts'
import { awakenSpirit } from './spirits'
import { advanceStory } from './stories'
import { startResearch } from './research'
import { stateRandom, type Random } from './rng'
import { addItems, type GameState } from './state'
import { simulate } from './tick'
import { dismissRequest, fulfillRequest } from './traders'
import { startTravel } from './travel'
import { buyUpgrade } from './upgrades'

/**
 * Everything the player (or the debug panel) can do to the game goes through an action.
 */
export type Action =
  | { type: 'travel/go'; to: string }
  | { type: 'gather/tap'; spotId: string; slot: number }
  | { type: 'satchel/deposit' }
  | { type: 'satchel/take'; itemId: string; amount: number }
  | { type: 'satchel/setLocked'; locked: boolean }
  | { type: 'craft/start'; recipeId: string; count?: number }
  | { type: 'research/start'; researchId: string }
  | { type: 'potion/drink'; potionId: string }
  | { type: 'trade/fulfill'; requestId: number }
  | { type: 'trade/dismiss'; requestId: number }
  | { type: 'upgrade/buy'; upgradeId: string }
  | { type: 'helpers/recruit'; helperType: HelperType }
  | { type: 'helpers/assign'; helperId: number; spotId: string | null }
  | { type: 'helpers/brew'; helperId: number; recipeId: string | null; keep?: number }
  | { type: 'supply/setMinimum'; itemId: string; amount: number }
  | { type: 'post/send' }
  | { type: 'shop/sell'; itemId: string; amount: number }
  | { type: 'shop/buy'; itemId: string; amount: number }
  | { type: 'creature/tap'; spotId: string }
  | { type: 'flight/tap' }
  | { type: 'spell/cast'; spellId: string }
  | { type: 'ritual/perform'; ritualId: string }
  | { type: 'villager/fulfill'; settlementId: string; requestId: number }
  | { type: 'villager/dismiss'; settlementId: string; requestId: number }
  | { type: 'story/advance'; storyId: string }
  | { type: 'spirit/awaken'; spiritId: string }
  | { type: 'mount/feed'; mountId: string }
  | { type: 'mount/ride'; mountId: string | null }
  | { type: 'mount/levelUp'; mountId: string }
  | { type: 'character/look'; patch: Partial<CharacterLook> }
  | { type: 'character/finish' }
  | { type: 'wardrobe/equip'; slot: OutfitSlot; pieceId: string | null }
  | { type: 'wardrobe/recolor'; slot: OutfitSlot; color: string }
  | { type: 'debug/addGlimmers'; amount: number }
  | { type: 'debug/addItem'; itemId: string; amount: number }
  | { type: 'debug/skipTime'; ms: number }
  | { type: 'debug/setClickPower'; value: number }
  | { type: 'debug/completeResearch' }
  | { type: 'debug/traderNow' }
  | { type: 'debug/challengesNow' }

/** Applies an action and returns what happened, for the screen to show. */
export function applyAction(
  state: GameState,
  action: Action,
  random: Random = stateRandom(state),
): GameEvent[] {
  switch (action.type) {
    case 'travel/go':
      return startTravel(state, action.to, false, random)
    case 'gather/tap':
      return tapPlant(state, action.spotId, action.slot, random)
    case 'satchel/deposit':
      return depositSatchel(state)
    case 'satchel/take':
      return packSatchel(state, action.itemId, action.amount)
    case 'satchel/setLocked':
      state.player.satchelLocked = action.locked
      return []
    case 'craft/start':
      return startCraft(state, action.recipeId, action.count ?? 1)
    case 'research/start':
      return startResearch(state, action.researchId)
    case 'potion/drink':
      return drinkPotion(state, action.potionId)
    case 'trade/fulfill':
      return fulfillRequest(state, action.requestId)
    case 'trade/dismiss':
      return dismissRequest(state, action.requestId)
    case 'upgrade/buy':
      return buyUpgrade(state, action.upgradeId)
    case 'helpers/recruit':
      return recruitHelper(state, action.helperType)
    case 'helpers/assign':
      return assignHelper(state, action.helperId, action.spotId)
    case 'helpers/brew':
      return setBrew(state, action.helperId, action.recipeId, action.keep)
    case 'supply/setMinimum':
      return setMinimum(state, action.itemId, action.amount)
    case 'post/send':
      return sendParcel(state)
    case 'shop/sell':
      return sellItems(state, action.itemId, action.amount)
    case 'shop/buy':
      return buyItems(state, action.itemId, action.amount)
    case 'creature/tap':
      return tapCreature(state, action.spotId)
    case 'flight/tap':
      return tapFlightEvent(state)
    case 'spell/cast':
      return castSpell(state, action.spellId)
    case 'ritual/perform':
      return performRitual(state, action.ritualId)
    case 'villager/fulfill':
      return fulfillVillagerRequest(state, action.settlementId, action.requestId)
    case 'villager/dismiss':
      return dismissVillagerRequest(state, action.settlementId, action.requestId)
    case 'story/advance':
      return advanceStory(state, action.storyId)
    case 'spirit/awaken':
      return awakenSpirit(state, action.spiritId)
    case 'mount/feed':
      return feedMount(state, action.mountId)
    case 'mount/ride':
      return rideMount(state, action.mountId)
    case 'mount/levelUp':
      return levelUpMount(state, action.mountId)
    case 'character/look':
      return setLook(state, action.patch)
    case 'character/finish':
      return finishCreating(state)
    case 'wardrobe/equip':
      return equipPiece(state, action.slot, action.pieceId)
    case 'wardrobe/recolor':
      return recolorSlot(state, action.slot, action.color)

    case 'debug/addGlimmers':
      state.resources.glimmers = Math.max(0, state.resources.glimmers + action.amount)
      return []
    case 'debug/addItem':
      addItems(state.inventory, action.itemId, action.amount)
      return []
    case 'debug/skipTime':
      // Fast-forward game time as if the player kept playing (no offline cap).
      if (action.ms > 0) simulate(state, action.ms, { offline: false })
      return []
    case 'debug/setClickPower':
      state.player.clickPower = Math.max(1, Math.floor(action.value))
      return []
    case 'debug/completeResearch':
      if (state.research.current) {
        state.research.completed.push(state.research.current.id)
        state.research.current = null
      }
      return []
    case 'debug/traderNow':
      state.traders.nextArrivalMs = 0
      return []
    case 'debug/challengesNow':
      state.challenges.nextCreatureMs = 0
      state.challenges.nextCampMs = 0
      for (const spot of Object.values(state.spots)) spot.pestCheckMs = 0
      return []
  }
}
