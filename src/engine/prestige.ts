import { HELPER_NAMES } from '../data/helpers'
import { PRESTIGE_RULES, RELIC_LIST, ROOT_UPGRADES, type BonusEffect } from '../data/prestige'
import { RESEARCH } from '../data/research'
import { UPGRADES } from '../data/upgrades'
import { REGION_ORDER, SPOTS } from '../data/world'
import type { GameEvent } from './events'
import { bonusEffects, courtRank } from './modifiers'
import { welcomeRegion } from './regions'
import { createNewGame, type GameState, type HelperState } from './state'

/**
 * Prestige (design doc 3.11). The Root Song Ritual gives the land Root Song and starts a new
 * run. What stays: the fairy and outfits, Comforts, supply and storage settings, stats, relics
 * and Root Song. Everything else starts over, softened by Root Song upgrades and relics.
 */

export interface RootSongPart {
  label: string
  amount: number
}

/** How much Root Song performing the ritual now would give, and where it comes from. */
export function rootSongPreview(state: GameState): { total: number; parts: RootSongPart[] } {
  const bloom = Object.values(state.bloom).reduce((sum, points) => sum + points, 0)
  const stories = Object.values(state.stories).filter((s) => s.complete).length
  const spirits = Object.values(state.spirits).filter((s) => s.awakened).length
  const crews = Object.values(state.crews).filter((c) => c.won).length
  const parts: RootSongPart[] = [
    { label: 'Bloom across the land', amount: Math.floor(bloom / PRESTIGE_RULES.bloomPerSong) },
    { label: 'Court rank', amount: courtRank(state) * PRESTIGE_RULES.perRank },
    { label: 'Stories finished', amount: stories * PRESTIGE_RULES.perStory },
    { label: 'Spirits awakened', amount: spirits * PRESTIGE_RULES.perSpirit },
    { label: 'Pirate crews won over', amount: crews * PRESTIGE_RULES.perCrew },
  ]
  return { total: parts.reduce((sum, p) => sum + p.amount, 0), parts }
}

function sumBonus(state: GameState, kind: BonusEffect['kind']): number {
  let total = 0
  for (const e of bonusEffects(state)) {
    if (e.kind === kind && 'amount' in e) total += e.amount
    if (e.kind === kind && 'regions' in e) total += e.regions
  }
  return total
}

/** Research a new run starts with: everything from the first `regions` regions (not this rite). */
function rememberedResearch(regions: number): string[] {
  const known = REGION_ORDER.slice(0, regions)
  return Object.values(RESEARCH)
    .filter((r) => r.id !== 'research-root-song' && known.includes(r.region ?? 'meadow'))
    .map((r) => r.id)
}

function addGatherers(state: GameState, count: number): void {
  for (let i = 0; i < count; i++) {
    const id = state.helpers.nextId++
    const helper: HelperState = {
      id,
      type: 'gatherer',
      name: HELPER_NAMES[(id - 1) % HELPER_NAMES.length],
      task: Object.keys(SPOTS)[0],
      phase: 'idle',
      remainingMs: 0,
      tripSpot: null,
      tripItem: null,
      bag: {},
    }
    state.helpers.list.push(helper)
  }
}

function learn(state: GameState, ids: string[]): void {
  for (const id of ids)
    if (!state.research.completed.includes(id)) state.research.completed.push(id)
}

/** A new run's gifts: Glimmers, bloom, old friends, remembered research, tamed mounts. */
export function startRun(state: GameState): void {
  state.resources.glimmers += sumBonus(state, 'startGlimmers')
  addGatherers(state, sumBonus(state, 'startHelpers'))
  learn(state, rememberedResearch(sumBonus(state, 'startResearch')))
  delete state.bloom.meadow
  for (const regionId of state.unlockedRegions) welcomeRegion(state, regionId)
}

/** Performs the reset. The ritual's own checks (rank, Harmony Blend) happen before this. */
export function performPrestige(state: GameState): GameEvent[] {
  const { total } = rootSongPreview(state)
  const finishedRun = state.prestige.run
  const fresh = createNewGame(state.meta.lastTickAt)
  fresh.meta = { ...state.meta }
  fresh.rng = state.rng
  fresh.time = state.time
  fresh.character = state.character
  fresh.outfits = state.outfits
  fresh.stats = state.stats
  fresh.supply = state.supply
  // Comforts are quality-of-life upgrades: once bought, they're kept forever.
  fresh.upgrades = state.upgrades.filter((id) => UPGRADES[id]?.category === 'comfort')
  fresh.prestige = {
    ...state.prestige,
    run: finishedRun + 1,
    rootSong: state.prestige.rootSong + total,
    rootSongEarned: state.prestige.rootSongEarned + total,
    giftedThisRun: [],
    freshRun: true,
  }
  for (const key of Object.keys(state) as (keyof GameState)[]) delete state[key]
  Object.assign(state, fresh)
  startRun(state)
  return [{ type: 'prestige', run: state.prestige.run, rootSong: total }]
}

export type RootUpgradeCheck = 'ok' | 'locked' | 'maxed' | 'missing-root-song'

export function rootUpgradeTier(state: GameState, id: string): number {
  return state.prestige.upgrades[id] ?? 0
}

/** Root Song for the next tier, or null when it's maxed. */
export function rootUpgradeCost(state: GameState, id: string): number | null {
  const def = ROOT_UPGRADES[id]
  if (!def) return null
  return def.costs[rootUpgradeTier(state, id)] ?? null
}

export function checkRootUpgrade(state: GameState, id: string): RootUpgradeCheck {
  if (!ROOT_UPGRADES[id]) return 'locked'
  const cost = rootUpgradeCost(state, id)
  if (cost === null) return 'maxed'
  if (state.prestige.rootSong < cost) return 'missing-root-song'
  return 'ok'
}

/**
 * Buys the next tier. Start-of-run gifts bought before leaving home on a new run's first
 * morning still count for this run.
 */
export function buyRootUpgrade(state: GameState, id: string): GameEvent[] {
  const check = checkRootUpgrade(state, id)
  if (check !== 'ok') return [{ type: 'blocked', reason: check }]
  const cost = rootUpgradeCost(state, id)!
  const before = { ...state.prestige.upgrades }
  state.prestige.rootSong -= cost
  const tier = rootUpgradeTier(state, id) + 1
  state.prestige.upgrades[id] = tier
  if (state.prestige.freshRun) {
    const def = ROOT_UPGRADES[id]
    const gained = (kind: BonusEffect['kind']) => {
      const now = sumBonus(state, kind)
      const was = sumBonus({ ...state, prestige: { ...state.prestige, upgrades: before } }, kind)
      return now - was
    }
    if (def.nextRun) {
      state.resources.glimmers += gained('startGlimmers')
      addGatherers(state, gained('startHelpers'))
      learn(state, rememberedResearch(sumBonus(state, 'startResearch')))
      const bloom = gained('startBloom')
      for (const regionId of state.unlockedRegions) {
        state.bloom[regionId] = (state.bloom[regionId] ?? 0) + bloom
      }
    }
  }
  return [{ type: 'root-upgrade', upgradeId: id, tier }]
}

/** The relic a spirit gives next (in order), or null once all of its relics are given. */
export function nextRelic(state: GameState, spiritId: string) {
  return (
    RELIC_LIST.filter((r) => r.spiritId === spiritId).find(
      (r) => !state.prestige.relics.includes(r.id),
    ) ?? null
  )
}

/** How many relics a spirit gave in earlier runs (its requirements grow with this). */
export function spiritGiftsBefore(state: GameState, spiritId: string): number {
  const given = RELIC_LIST.filter(
    (r) => r.spiritId === spiritId && state.prestige.relics.includes(r.id),
  ).length
  return given - (state.prestige.giftedThisRun.includes(spiritId) ? 1 : 0)
}

/** A waking spirit gives its next relic, once per run. */
export function giveRelic(state: GameState, spiritId: string): GameEvent[] {
  if (state.prestige.giftedThisRun.includes(spiritId)) return []
  const relic = nextRelic(state, spiritId)
  if (!relic) return []
  state.prestige.relics.push(relic.id)
  state.prestige.giftedThisRun.push(spiritId)
  // A relic that tames a mount or warms a region works at once if its region is open.
  for (const regionId of state.unlockedRegions) welcomeRegion(state, regionId)
  return [{ type: 'relic', relicId: relic.id }]
}
