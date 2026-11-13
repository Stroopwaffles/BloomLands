import { PLANTS, RARITY_WEIGHT } from '../data/plants'
import type { ItemStack } from '../data/types'
import { SPOTS } from '../data/world'
import type { GameEvent } from './events'
import { pickWeighted, type Random } from './rng'
import { clickPower, luck, satchelCapacity } from './buffs'
import { addItems, countItems, type GameState, type SlotState, type SpotState } from './state'

/** Chance a harvest gives one extra of each material. Starting value for balancing. */
export const BONUS_MATERIAL_CHANCE = 0.1
/** Chance a harvest turns up a trinket. Starting value for balancing. */
export const TRINKET_CHANCE = 0.02

/** Picks a plant for a spot, weighted by rarity. Luck makes every non-common plant likelier. */
export function rollPlant(spotId: string, random: Random, luckMultiplier = 1): string {
  const spot = SPOTS[spotId]
  return pickWeighted(
    spot.plants.map((id) => {
      const { rarity } = PLANTS[id]
      const weight = RARITY_WEIGHT[rarity] * (rarity === 'common' ? 1 : luckMultiplier)
      return [id, weight] as const
    }),
    random,
  )
}

function growSlot(slot: SlotState, spotId: string, random: Random, luckMultiplier = 1): void {
  const plantId = rollPlant(spotId, random, luckMultiplier)
  slot.plantId = plantId
  slot.hp = PLANTS[plantId].toughness
  slot.regrowMs = 0
}

/** Creates a spot's state the first time it's visited, with every slot in bloom. */
export function ensureSpot(state: GameState, spotId: string, random: Random): SpotState {
  const existing = state.spots[spotId]
  if (existing) return existing
  const def = SPOTS[spotId]
  const spot: SpotState = { slots: [] }
  for (let i = 0; i < def.slots; i++) {
    const slot: SlotState = { plantId: null, hp: 0, regrowMs: 0 }
    growSlot(slot, spotId, random, luck(state))
    spot.slots.push(slot)
  }
  state.spots[spotId] = spot
  return spot
}

export function satchelFull(state: GameState): boolean {
  return countItems(state.player.satchel) >= satchelCapacity(state)
}

/**
 * One tap on a plant. Each tap deals the player's click power; when a plant runs out of hp it's
 * harvested into the satchel. Tapping is blocked once the satchel is full (the harvest that
 * fills it may go slightly over, so nothing is ever lost).
 */
export function tapPlant(
  state: GameState,
  spotId: string,
  slotIndex: number,
  random: Random,
): GameEvent[] {
  const { player } = state
  if (player.travel) return [{ type: 'blocked', reason: 'flying' }]
  if (player.place !== spotId) return [{ type: 'blocked', reason: 'not-here' }]

  const slot = state.spots[spotId]?.slots[slotIndex]
  if (!slot?.plantId) return [{ type: 'blocked', reason: 'no-plant' }]
  if (satchelFull(state)) return [{ type: 'blocked', reason: 'satchel-full' }]

  state.stats.taps++
  const damage = clickPower(state)
  slot.hp -= damage
  if (slot.hp > 0) return [{ type: 'hit', spotId, slot: slotIndex, damage, hpLeft: slot.hp }]

  // Harvest
  const plantId = slot.plantId
  const bonus = random() < BONUS_MATERIAL_CHANCE
  const items: ItemStack[] = PLANTS[plantId].yields.map(({ itemId, amount }) => ({
    itemId,
    amount: amount + (bonus ? 1 : 0),
  }))
  for (const { itemId, amount } of items) addItems(player.satchel, itemId, amount)

  let trinketId: string | null = null
  const trinkets = SPOTS[spotId].trinkets
  if (trinkets.length > 0 && random() < TRINKET_CHANCE) {
    trinketId = trinkets[Math.floor(random() * trinkets.length)]
    addItems(player.satchel, trinketId, 1)
  }

  slot.plantId = null
  slot.hp = 0
  slot.regrowMs = SPOTS[spotId].regrowMs
  state.stats.plantsHarvested++

  return [{ type: 'harvest', spotId, slot: slotIndex, plantId, items, bonus, trinketId }]
}

/** Moves everything in the satchel into home storage. Only works at home. */
export function depositSatchel(state: GameState): GameEvent[] {
  const { player } = state
  if (player.travel) return [{ type: 'blocked', reason: 'flying' }]
  if (player.place !== 'home') return [{ type: 'blocked', reason: 'not-here' }]

  const items: ItemStack[] = Object.entries(player.satchel).map(([itemId, amount]) => ({
    itemId,
    amount,
  }))
  for (const { itemId, amount } of items) addItems(state.inventory, itemId, amount)
  player.satchel = {}
  return items.length > 0 ? [{ type: 'deposit', items }] : []
}

/** Advances regrowth in every visited spot (also while the player is away or offline). */
export function regrowSpots(state: GameState, dtMs: number, random: Random): void {
  for (const [spotId, spot] of Object.entries(state.spots)) {
    if (!SPOTS[spotId]) continue
    for (const slot of spot.slots) {
      if (slot.plantId) continue
      slot.regrowMs -= dtMs
      if (slot.regrowMs <= 0) growSlot(slot, spotId, random, luck(state))
    }
  }
}
