import { CAMP_RULES } from '../data/challenges'
import { ITEMS } from '../data/items'
import { PLANTS, RARITY_WEIGHT } from '../data/plants'
import type { ItemStack } from '../data/types'
import { SPOTS } from '../data/world'
import { morningPlantsGrow, weatherIn } from './environment'
import type { GameEvent } from './events'
import {
  bloomLuck,
  bloomRegrowth,
  boostRegrowth,
  clickPower,
  hasQol,
  luck,
  satchelCapacity,
  storageCapacity,
  storageUsed,
  tagYieldBonus,
  trinketChanceMultiplier,
  weatherLuckMultiplier,
  mountRegionLuck,
} from './modifiers'
import { pickWeighted, type Random } from './rng'
import { plantEase, weatherCleared } from './modifiers'
import { addItems, countItems, type GameState, type SlotState, type SpotState } from './state'
import { playerWatched } from './regions'
import { rollScoutSecret } from './secrets'
import { startTravel } from './travel'

/** Chance a harvest gives one extra of each material. Starting value for balancing. */
export const BONUS_MATERIAL_CHANCE = 0.1
/** Chance a harvest turns up a trinket. Starting value for balancing. */
export const TRINKET_CHANCE = 0.02

/**
 * Picks a plant for a spot, weighted by rarity. Luck makes every non-common plant likelier.
 * Morning-only plants (like morning dew) are left out when `morningOk` is false.
 */
export function rollPlant(
  spotId: string,
  random: Random,
  luckMultiplier = 1,
  morningOk = true,
  tagBoost?: { tag: string; multiplier: number },
): string {
  const spot = SPOTS[spotId]
  const plants = spot.plants.filter((id) => morningOk || !PLANTS[id].morningOnly)
  return pickWeighted(
    plants.map((id) => {
      const { rarity, tags } = PLANTS[id]
      const weight =
        RARITY_WEIGHT[rarity] *
        (rarity === 'common' ? 1 : luckMultiplier) *
        (tagBoost && tags?.includes(tagBoost.tag) ? tagBoost.multiplier : 1)
      return [id, weight] as const
    }),
    random,
  )
}

/**
 * How likely each plant is to grow at a spot right now: rarity, then everything that shifts the
 * odds (luck potions, bloom, weather, curios), leaving out morning-only plants outside the morning.
 * Growing plants and supply helpers' searches both use these odds.
 */
export function plantWeights(state: GameState, spotId: string): [string, number][] {
  const regionId = SPOTS[spotId].regionId
  const morningOk = morningPlantsGrow(state, regionId)
  const weather = weatherIn(state, regionId)
  const luckMultiplier =
    luck(state) *
    bloomLuck(state, regionId) *
    (weatherCleared(state, weather.id) ? Math.max(1, weather.luck ?? 1) : (weather.luck ?? 1)) *
    weatherLuckMultiplier(state, weather.id) *
    mountRegionLuck(state, regionId)
  return SPOTS[spotId].plants
    .filter((id) => morningOk || !PLANTS[id].morningOnly)
    .map((id) => {
      const { rarity, tags } = PLANTS[id]
      const weight =
        RARITY_WEIGHT[rarity] *
        (rarity === 'common' ? 1 : luckMultiplier) *
        (weather.tagBoost && tags?.includes(weather.tagBoost.tag) ? weather.tagBoost.multiplier : 1)
      return [id, weight]
    })
}

function growSlot(state: GameState, slot: SlotState, spotId: string, random: Random): void {
  const plantId = pickWeighted(plantWeights(state, spotId), random)
  slot.plantId = plantId
  slot.hp = Math.max(1, PLANTS[plantId].toughness - plantEase(state))
  slot.regrowMs = 0
  slot.pests = 0
}

/** Slots a pirate camp has taken over (the last few in the spot). */
export function campBlocksSlot(state: GameState, spotId: string, slotIndex: number): boolean {
  if (!state.challenges.camps[spotId]) return false
  return slotIndex >= SPOTS[spotId].slots - CAMP_RULES.slotsTaken
}

/** Creates a spot's state the first time it's visited, with every slot in bloom. */
export function ensureSpot(state: GameState, spotId: string, random: Random): SpotState {
  const existing = state.spots[spotId]
  if (existing) return existing
  const def = SPOTS[spotId]
  const spot: SpotState = { slots: [] }
  for (let i = 0; i < def.slots; i++) {
    const slot: SlotState = { plantId: null, hp: 0, regrowMs: 0 }
    growSlot(state, slot, spotId, random)
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
  if (campBlocksSlot(state, spotId, slotIndex)) return [{ type: 'blocked', reason: 'camp' }]
  if (playerWatched(state, spotId)) return [{ type: 'blocked', reason: 'watching' }]

  // Pests come off first, one per tap. Clearing them is tending, so it works with a full satchel.
  if ((slot.pests ?? 0) > 0) {
    state.stats.taps++
    slot.pests = (slot.pests ?? 0) - 1
    state.stats.pestsCleared++
    return [{ type: 'pest-cleared', spotId, slot: slotIndex, pestsLeft: slot.pests }]
  }

  if (satchelFull(state)) return [{ type: 'blocked', reason: 'satchel-full' }]

  state.stats.taps++
  const damage = clickPower(state)
  slot.hp -= damage
  if (slot.hp > 0) return [{ type: 'hit', spotId, slot: slotIndex, damage, hpLeft: slot.hp }]

  // Harvest
  const plantId = slot.plantId
  const bonus = random() < BONUS_MATERIAL_CHANCE
  // A blossom wind (and the like) blows in an extra of some kinds of plant.
  const weatherYield = weatherIn(state, SPOTS[spotId].regionId).tagYield
  const windfall =
    weatherYield && PLANTS[plantId].tags?.includes(weatherYield.tag) ? weatherYield.amount : 0
  const extra = (bonus ? 1 : 0) + tagYieldBonus(state, PLANTS[plantId].tags) + windfall
  const items: ItemStack[] = PLANTS[plantId].yields.map(({ itemId, amount }) => ({
    itemId,
    amount: amount + extra,
  }))
  for (const { itemId, amount } of items) addItems(player.satchel, itemId, amount)

  let trinketId: string | null = null
  const trinkets = SPOTS[spotId].trinkets
  if (trinkets.length > 0 && random() < TRINKET_CHANCE * trinketChanceMultiplier(state)) {
    trinketId = trinkets[Math.floor(random() * trinkets.length)]
    addItems(player.satchel, trinketId, 1)
  }

  slot.plantId = null
  slot.hp = 0
  slot.pests = 0
  slot.regrowMs = SPOTS[spotId].regrowMs
  state.stats.plantsHarvested++

  const events: GameEvent[] = [
    { type: 'harvest', spotId, slot: slotIndex, plantId, items, bonus, trinketId },
    // A rare plant very occasionally reveals a hidden passage that scouts usually find.
    ...(PLANTS[plantId].rarity === 'rare'
      ? rollScoutSecret(state, SPOTS[spotId].regionId, random, 0.1)
      : []),
  ]
  // Homing Instinct: head home as soon as the satchel fills up.
  if (satchelFull(state) && hasQol(state, 'auto-return')) {
    events.push(...startTravel(state, 'home', true))
  }
  return events
}

/** How many of a stored item fit in the satchel right now. */
export function packRoom(state: GameState, itemId: string): number {
  const space = Math.max(0, satchelCapacity(state) - countItems(state.player.satchel))
  return Math.min(space, state.inventory[itemId] ?? 0)
}

/**
 * Takes items from home storage back into the satchel (to sell at a shop, or carry to someone).
 * Only works at home, and only as much as the satchel can hold.
 */
export function packSatchel(state: GameState, itemId: string, amount: number): GameEvent[] {
  const { player } = state
  if (player.travel) return [{ type: 'blocked', reason: 'flying' }]
  if (player.place !== 'home') return [{ type: 'blocked', reason: 'not-home' }]
  if (amount < 1 || (state.inventory[itemId] ?? 0) < amount) {
    return [{ type: 'blocked', reason: 'missing-items' }]
  }
  if (countItems(player.satchel) + amount > satchelCapacity(state)) {
    return [{ type: 'blocked', reason: 'satchel-full' }]
  }
  addItems(state.inventory, itemId, -amount)
  addItems(player.satchel, itemId, amount)
  return [{ type: 'packed', itemId, amount }]
}

/**
 * Moves some of one item from the satchel into storage, as much as fits (trinkets always fit).
 * Only works at home.
 */
export function storeItems(state: GameState, itemId: string, amount: number): GameEvent[] {
  const { player } = state
  if (player.travel) return [{ type: 'blocked', reason: 'flying' }]
  if (player.place !== 'home') return [{ type: 'blocked', reason: 'not-home' }]
  const have = player.satchel[itemId] ?? 0
  if (amount < 1 || have < 1) return [{ type: 'blocked', reason: 'missing-items' }]
  const isTrinket = ITEMS[itemId]?.category === 'trinket'
  const free = Math.max(0, storageCapacity(state) - storageUsed(state))
  const take = Math.min(amount, have, isTrinket ? amount : free)
  if (take <= 0) return [{ type: 'blocked', reason: 'storage-full' }]
  addItems(player.satchel, itemId, -take)
  addItems(state.inventory, itemId, take)
  return [
    {
      type: 'deposit',
      items: [{ itemId, amount: take }],
      leftOver: countItems(player.satchel),
    },
  ]
}

/**
 * Moves the satchel into home storage, as much as fits. Trinkets take no space. Whatever
 * doesn't fit stays in the satchel. Only works at home.
 */
export function depositSatchel(state: GameState): GameEvent[] {
  const { player } = state
  if (player.travel) return [{ type: 'blocked', reason: 'flying' }]
  if (player.place !== 'home') return [{ type: 'blocked', reason: 'not-here' }]
  if (countItems(player.satchel) === 0) return []

  let free = Math.max(0, storageCapacity(state) - storageUsed(state))
  const moved: ItemStack[] = []
  for (const [itemId, amount] of Object.entries(player.satchel)) {
    const isTrinket = ITEMS[itemId]?.category === 'trinket'
    const take = isTrinket ? amount : Math.min(amount, free)
    if (take <= 0) continue
    if (!isTrinket) free -= take
    addItems(state.inventory, itemId, take)
    addItems(player.satchel, itemId, -take)
    moved.push({ itemId, amount: take })
  }
  if (moved.length === 0) return [{ type: 'blocked', reason: 'storage-full' }]
  return [{ type: 'deposit', items: moved, leftOver: countItems(player.satchel) }]
}

/**
 * Advances regrowth in every visited spot (also while the player is away or offline).
 * Sunshine makes plants regrow faster.
 */
export function regrowSpots(state: GameState, dtMs: number, random: Random): void {
  for (const [spotId, spot] of Object.entries(state.spots)) {
    if (!SPOTS[spotId]) continue
    const regionId = SPOTS[spotId].regionId
    const growth =
      dtMs *
      weatherIn(state, regionId).regrowth *
      bloomRegrowth(state, regionId) *
      boostRegrowth(state)
    for (const slot of spot.slots) {
      if (slot.plantId) continue
      slot.regrowMs -= growth
      if (slot.regrowMs <= 0) growSlot(state, slot, spotId, random)
    }
  }
}

/** Tidies a spot: removes plants a creature ate (they regrow as usual). */
export function eatPlant(state: GameState, spotId: string, random: Random): number | null {
  const spot = state.spots[spotId]
  if (!spot) return null
  const growing = spot.slots
    .map((slot, i) => [slot, i] as const)
    .filter(([slot, i]) => slot.plantId && !campBlocksSlot(state, spotId, i))
  if (growing.length === 0) return null
  const [slot, index] = growing[Math.floor(random() * growing.length)]
  slot.plantId = null
  slot.hp = 0
  slot.pests = 0
  slot.regrowMs = SPOTS[spotId].regrowMs
  return index
}
