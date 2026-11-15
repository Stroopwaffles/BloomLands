/**
 * The balance simulator's player: a headless bot that plays the real engine like an eager,
 * sensible player, so we can measure how long things take (design doc: balancing).
 *
 * Each day it plays for a while (gathering, crafting, researching, building, helping villagers,
 * waking spirits), then the rest of the day passes as time away (with the offline cap). It works
 * backward from its goals (the next region's rite, spirit offerings, stories, the blue jay, the
 * Root Song) to the raw plants it needs, and gathers those.
 */
import { CREATURES } from '../data/challenges'
import { COURT_RANKS } from '../data/economy'
import { ITEMS } from '../data/items'
import { RITUALS } from '../data/magic'
import { MOUNTS } from '../data/mounts'
import { PLANTS } from '../data/plants'
import { ROOT_UPGRADE_LIST } from '../data/prestige'
import { RECIPES } from '../data/recipes'
import { RESEARCH, RESEARCH_ORDER } from '../data/research'
import { SPIRITS } from '../data/spirits'
import { CHARACTERS, STORIES } from '../data/stories'
import type { CostEntry } from '../data/types'
import { UPGRADE_ORDER, UPGRADES } from '../data/upgrades'
import { HOME, isSettlement, REGION_ORDER, REGIONS, SPOTS } from '../data/world'
import { applyAction, type Action } from '../engine/actions'
import { checkCraft, unlockedRecipes } from '../engine/crafting'
import { isMorning } from '../engine/environment'
import { checkRecruit, recruitCost } from '../engine/helpers'
import { checkRitual, checkSpell, knownRituals, knownSpells } from '../engine/magic'
import {
  bloomLevel,
  courtPoints as courtPointsOf,
  courtRank,
  helperCapacity,
  storageCapacity,
  storageUsed,
} from '../engine/modifiers'
import { checkFeed, ownsMount, wildMountAt } from '../engine/mounts'
import { checkRootUpgrade, rootSongPreview } from '../engine/prestige'
import { placeOpen, regionUnlocked } from '../engine/regions'
import { checkResearch, researchCost, researchStatus } from '../engine/research'
import { checkSell, sellPrice } from '../engine/shop'
import { checkVillagerRequest } from '../engine/settlements'
import { checkSpirit, spiritAwake, spiritRequirements } from '../engine/spirits'
import { createNewGame, type GameState } from '../engine/state'
import { taskReady } from '../engine/stories'
import { checkTrade } from '../engine/traders'
import { checkUpgrade } from '../engine/upgrades'
import { offlineCapMs, simulate } from '../engine/tick'

export interface SimOptions {
  /** Minutes of active play each day. */
  activeMinutesPerDay: number
  /** How fast the player taps. */
  tapsPerSecond: number
  /** Give up after this many days. */
  maxDays: number
  /** How many runs (Root Song Rituals) to play. */
  runs: number
  /** Called with each milestone as it happens. */
  onMilestone?: (m: Milestone) => void
}

export const DEFAULT_SIM: SimOptions = {
  activeMinutesPerDay: 90,
  tapsPerSecond: 3,
  maxDays: 60,
  runs: 1,
}

export interface Milestone {
  run: number
  label: string
  /** Active play time so far this run, in minutes. */
  activeMinutes: number
  /** Which day of the run (1 = the first day). */
  day: number
}

const HOUR = 60 * 60_000
const DAY = 24 * HOUR

/** Raw materials still needed, by item ID. */
type Needs = Record<string, number>

export class Bot {
  state: GameState
  opts: SimOptions
  milestones: Milestone[] = []
  /** One line per day: what the court looked like at the end of the session. */
  days: string[] = []
  run = 1
  runActiveMs = 0
  runDay = 1
  private seen = new Set<string>()
  private now: number

  constructor(opts: Partial<SimOptions> = {}, seed = 1_700_000_000_000) {
    this.opts = { ...DEFAULT_SIM, ...opts }
    this.now = seed
    this.state = createNewGame(seed)
    this.state.character.created = true
  }

  // -------------------------------------------------------------------------------------------
  // Time and actions

  /** Glimmers earned today, by where they came from (for the report). */
  income: Record<string, number> = {}

  private earn(source: string, before: number) {
    const gained = this.state.resources.glimmers - before
    if (gained > 0) this.income[source] = (this.income[source] ?? 0) + gained
  }

  private act(action: Action) {
    const before = this.state.resources.glimmers
    const events = applyAction(this.state, action)
    this.earn(action.type, before)
    return events
  }

  /** Lets time pass while the player is active (flights, taps, waiting). */
  private wait(ms: number) {
    if (ms <= 0) return
    const before = this.state.resources.glimmers
    simulate(this.state, ms, { offline: false })
    this.earn('helpers (live)', before)
    this.now += ms
    this.state.meta.lastTickAt = this.now
    this.runActiveMs += ms
    this.state.inbox = []
  }

  /** The rest of the day passes while the player is away (offline, capped). */
  private away(ms: number) {
    const capped = Math.min(ms, offlineCapMs(this.state))
    const before = this.state.resources.glimmers
    simulate(this.state, capped, { offline: true })
    this.earn('helpers (away)', before)
    this.now += ms
    this.state.meta.lastTickAt = this.now
    this.state.inbox = []
  }

  private mark(label: string) {
    const key = `${this.run}:${label}`
    if (this.seen.has(key)) return
    this.seen.add(key)
    const m: Milestone = {
      run: this.run,
      label,
      activeMinutes: Math.round(this.runActiveMs / 60_000),
      day: this.runDay,
    }
    this.milestones.push(m)
    this.opts.onMilestone?.(m)
  }

  private fly(to: string) {
    if (this.state.player.place === to) return true
    const events = this.act({ type: 'travel/go', to })
    if (events.some((e) => e.type === 'blocked')) return false
    const travel = this.state.player.travel
    if (travel) this.wait(travel.remainingMs + 50)
    // A mid-flight snag or ambush can hold things up a moment: wait it out.
    for (let i = 0; i < 20 && this.state.player.travel; i++) {
      this.act({ type: 'flight/tap' })
      this.wait(1000)
    }
    return this.state.player.place === to
  }

  // -------------------------------------------------------------------------------------------
  // Stock and needs

  private have(itemId: string): number {
    return (this.state.inventory[itemId] ?? 0) + (this.state.player.satchel[itemId] ?? 0)
  }

  private haveTag(tag: string): number {
    let n = 0
    for (const [id, amount] of Object.entries({
      ...this.state.inventory,
      ...this.state.player.satchel,
    })) {
      if (ITEMS[id]?.tags?.includes(tag)) n += amount
    }
    return n
  }

  private recipeFor(itemId: string) {
    const unlocked = unlockedRecipes(this.state)
    return Object.values(RECIPES).find((r) => r.output.itemId === itemId && unlocked.has(r.id))
  }

  /** A raw item with this tag that grows somewhere open, the commonest first. */
  private rawForTag(tag: string): string | null {
    const order = { common: 0, uncommon: 1, rare: 2 } as Record<string, number>
    const plants = this.openSpots()
      .flatMap((s) => SPOTS[s].plants)
      .map((p) => PLANTS[p])
      .sort((a, b) => (order[a.rarity] ?? 3) - (order[b.rarity] ?? 3))
    for (const plant of plants) {
      for (const y of plant.yields) if (ITEMS[y.itemId]?.tags?.includes(tag)) return y.itemId
    }
    return null
  }

  /** Adds what it takes to make `cost` into `needs` (raw materials only), minus what we have. */
  private expand(cost: readonly CostEntry[], needs: Needs, reserved: Needs, depth = 0) {
    if (depth > 6) return
    for (const entry of cost) {
      if ('tag' in entry) {
        const short =
          entry.amount - Math.max(0, this.haveTag(entry.tag) - (reserved[`#${entry.tag}`] ?? 0))
        reserved[`#${entry.tag}`] = (reserved[`#${entry.tag}`] ?? 0) + entry.amount
        if (short <= 0) continue
        const raw = this.rawForTag(entry.tag)
        if (raw) needs[raw] = (needs[raw] ?? 0) + short
        continue
      }
      const free = Math.max(0, this.have(entry.itemId) - (reserved[entry.itemId] ?? 0))
      reserved[entry.itemId] = (reserved[entry.itemId] ?? 0) + entry.amount
      const short = entry.amount - free
      if (short <= 0) continue
      const recipe = this.recipeFor(entry.itemId)
      if (recipe) {
        const batches = Math.ceil(short / recipe.output.amount)
        this.expand(
          recipe.inputs.map((i) => ({ ...i, amount: i.amount * batches })),
          needs,
          reserved,
          depth + 1,
        )
      } else if (ITEMS[entry.itemId]?.category === 'raw') {
        needs[entry.itemId] = (needs[entry.itemId] ?? 0) + short
      }
    }
  }

  /** Everything the bot is working toward right now, as costs. */
  private goals(): CostEntry[][] {
    const goals = this.baseGoals()
    const research = this.nextResearch(false)
    if (research) goals.push(researchCost(this.state, research))
    return goals
  }

  /** Goals other than research (research planning looks at these). */
  private baseGoals(): CostEntry[][] {
    const s = this.state
    const goals: CostEntry[][] = []
    // The next region's rite.
    const next = REGION_ORDER.find((id) => !regionUnlocked(s, id))
    const unlock = next ? REGIONS[next].unlock : null
    if (unlock?.ritualId && knownRituals(s).includes(unlock.ritualId)) {
      goals.push(RITUALS[unlock.ritualId].cost)
    }
    // The blue jay, once the Glade is open.
    if (regionUnlocked(s, 'glade') && !ownsMount(s, 'mount-blue-jay')) {
      goals.push([MOUNTS['mount-blue-jay'].food])
      if (knownSpells(s).includes('spell-kindred-call')) {
        goals.push(MOUNTS['mount-blue-jay'].tameCost ?? [])
      }
    }
    // Spirit offerings and the stories they ask for.
    for (const spirit of Object.values(SPIRITS)) {
      if (!regionUnlocked(s, spirit.regionId) || spiritAwake(s, spirit.id)) continue
      for (const req of spiritRequirements(s, spirit.id)) {
        if (req.kind === 'offering') goals.push(req.items)
      }
    }
    for (const story of Object.values(STORIES)) {
      const progress = s.stories[story.id]
      if (!progress || progress.complete) continue
      const task = story.chapters[progress.chapter].task
      if (task.kind === 'bring') goals.push(task.items)
    }
    // The Root Song.
    if (knownRituals(s).includes('ritual-root-song')) goals.push(RITUALS['ritual-root-song'].cost)
    // The next few upgrades' materials.
    for (const id of this.wantedUpgrades().slice(0, 3)) goals.push(UPGRADES[id].items)
    return goals
  }

  private needs(): Needs {
    const needs: Needs = {}
    const reserved: Needs = {}
    for (const cost of this.goals()) this.expand(cost, needs, reserved)
    return needs
  }

  // -------------------------------------------------------------------------------------------
  // Choices

  private openSpots(): string[] {
    return REGION_ORDER.filter((id) => regionUnlocked(this.state, id)).flatMap((id) =>
      [...REGIONS[id].spots, ...REGIONS[id].secretSpots].filter((spot) =>
        placeOpen(this.state, spot),
      ),
    )
  }

  /** Research the bot is aiming for: rites, the Root Song, Kindred Call, missing recipes. */
  private researchTargets(): string[] {
    const s = this.state
    const find = (test: (id: string) => boolean) =>
      RESEARCH_ORDER.filter((id) => researchStatus(s, id) !== 'done' && test(id))
    const next = REGION_ORDER.find((id) => !regionUnlocked(s, id))
    const rite = next ? REGIONS[next].unlock?.ritualId : undefined
    const targets: string[] = []
    if (rite) targets.push(...find((id) => !!RESEARCH[id].rituals?.includes(rite)))
    targets.push(...find((id) => !!RESEARCH[id].rituals?.includes('ritual-root-song')))
    if (regionUnlocked(s, 'glade')) {
      targets.push(...find((id) => !!RESEARCH[id].spells?.includes('spell-kindred-call')))
    }
    // Recipes the goals (and those targets) need that we can't make yet.
    const costs = [...this.baseGoals(), ...targets.map((id) => RESEARCH[id].cost)]
    const missing = new Set<string>()
    const scan = (cost: readonly CostEntry[], depth = 0) => {
      if (depth > 6) return
      for (const entry of cost) {
        if (!('itemId' in entry)) continue
        if (this.have(entry.itemId) >= entry.amount) continue
        if (ITEMS[entry.itemId]?.category === 'raw' || ITEMS[entry.itemId]?.category === 'trinket')
          continue
        const recipe = this.recipeFor(entry.itemId)
        if (recipe) scan(recipe.inputs, depth + 1)
        else missing.add(entry.itemId)
      }
    }
    for (const cost of costs) scan(cost)
    for (const itemId of missing) {
      targets.push(
        ...find((id) => RESEARCH[id].unlocks.some((r) => RECIPES[r]?.output.itemId === itemId)),
      )
    }
    return targets
  }

  /** Research, in the order a sensible player would pick it. */
  private nextResearch(mustAfford: boolean): string | null {
    const s = this.state
    const ordered: string[] = []
    // A target's prerequisites come first: walk down to research that's available now.
    const visit = (id: string, depth = 0) => {
      if (depth > 12 || ordered.includes(id)) return
      const status = researchStatus(s, id)
      if (status === 'done' || status === 'in-progress') return
      if (status === 'available') {
        ordered.push(id)
        return
      }
      for (const req of RESEARCH[id].requires) visit(req, depth + 1)
    }
    for (const target of this.researchTargets()) visit(target)
    // Then anything else, cheapest first.
    const rest = RESEARCH_ORDER.filter(
      (id) => researchStatus(s, id) === 'available' && !ordered.includes(id),
    ).sort((a, b) => costSize(RESEARCH[a].cost) - costSize(RESEARCH[b].cost))
    for (const id of [...ordered, ...rest]) {
      if (!mustAfford || checkResearch(s, id) === 'ok') return id
    }
    return null
  }

  /**
   * Upgrades worth buying, the most important first (then the cheapest): room in storage when it's
   * filling up, a peddler, the rank the next region needs, helper rooms and stations, then gear,
   * and Comforts last.
   */
  private wantedUpgrades(): string[] {
    const s = this.state
    const next = REGION_ORDER.find((id) => !regionUnlocked(s, id))
    const needRank = next ? (REGIONS[next].unlock?.rank ?? 0) > courtRank(s) : false
    const full = storageUsed(s) > storageCapacity(s) * 0.75
    const priority = (id: string) => {
      const u = UPGRADES[id]
      const e = u.effect
      if (e.kind === 'storage' && full) return 0
      if (e.kind === 'helpers' && e.helper === 'peddler') return 0
      if (e.kind === 'feature' || e.kind === 'station') return 1
      if (needRank && u.courtPoints > 0) return 1
      if (e.kind === 'helpers' && e.helper === 'gatherer') return 2
      if (e.kind === 'stable' && regionUnlocked(s, 'glade')) return 2
      if (u.category === 'gear') return 3
      if (u.category === 'lodging') return 3
      return 4
    }
    return UPGRADE_ORDER.filter(
      (id) =>
        !s.upgrades.includes(id) && UPGRADES[id].requires.every((r) => s.upgrades.includes(r)),
    ).sort((a, b) => priority(a) - priority(b) || UPGRADES[a].glimmers - UPGRADES[b].glimmers)
  }

  /** The best spot to gather: the most of what we need, else the newest region's spots. */
  private bestSpot(needs: Needs): string {
    const s = this.state
    let best = ''
    let bestScore = -1
    for (const spotId of this.openSpots()) {
      if (s.challenges.creatures[spotId] && CREATURE_BLOCKS(s, spotId)) continue
      let score = 0
      for (const plantId of SPOTS[spotId].plants) {
        for (const y of PLANTS[plantId].yields) {
          if (needs[y.itemId]) score += Math.min(needs[y.itemId], 20) / PLANTS[plantId].toughness
        }
      }
      // With nothing needed, gather where things are worth the most.
      if (score === 0) score = 0.001 * REGION_ORDER.indexOf(SPOTS[spotId].regionId)
      if (score > bestScore) {
        best = spotId
        bestScore = score
      }
    }
    return best || 'buttercup-rise'
  }

  // -------------------------------------------------------------------------------------------
  // Chores

  private homeChores() {
    const s = this.state
    this.act({ type: 'satchel/deposit' })
    // Rites: open the next region (and sing the Root Song when it's time).
    for (const ritualId of knownRituals(s)) {
      const ritual = RITUALS[ritualId]
      if (ritual.effect !== 'unlock-region' && ritual.effect !== 'root-song') continue
      if (checkRitual(s, ritualId) !== 'ok') continue
      if (ritual.effect === 'root-song') return this.prestige()
      this.act({ type: 'ritual/perform', ritualId })
    }
    // Research.
    if (!s.research.current) {
      const id = this.nextResearch(true)
      if (id) this.act({ type: 'research/start', researchId: id })
    }
    // Upgrades: the most important first. Save up for it, buying only small things meanwhile.
    for (let i = 0; i < 12; i++) {
      const wanted = this.wantedUpgrades()
      const top = wanted[0]
      if (!top) break
      if (applyCheckUpgrade(this, top) === 'ok') {
        this.act({ type: 'upgrade/buy', upgradeId: top })
        continue
      }
      const budget = s.resources.glimmers - UPGRADES[top].glimmers
      const small = wanted.find(
        (u) => applyCheckUpgrade(this, u) === 'ok' && UPGRADES[u].glimmers <= Math.max(0, budget),
      )
      if (!small) break
      this.act({ type: 'upgrade/buy', upgradeId: small })
    }
    this.craft()
    for (const request of [...s.traders.requests]) {
      if (checkTrade(s, request.id) === 'ok')
        this.act({ type: 'trade/fulfill', requestId: request.id })
    }
    this.assignHelpers()
  }

  /** Keeps the workshop busy making what the goals need. */
  private craft() {
    const s = this.state
    const reserved: Needs = {}
    const wanted: Needs = {}
    // Walk the goals: any craftable shortfall is worth making.
    const visit = (cost: readonly CostEntry[], depth = 0) => {
      if (depth > 6) return
      for (const entry of cost) {
        if (!('itemId' in entry)) continue
        const free = Math.max(0, this.have(entry.itemId) - (reserved[entry.itemId] ?? 0))
        reserved[entry.itemId] = (reserved[entry.itemId] ?? 0) + entry.amount
        const short = entry.amount - free
        if (short <= 0) continue
        const recipe = this.recipeFor(entry.itemId)
        if (!recipe) continue
        wanted[recipe.id] = (wanted[recipe.id] ?? 0) + Math.ceil(short / recipe.output.amount)
        visit(
          recipe.inputs.map((i) => ({
            ...i,
            amount: i.amount * Math.ceil(short / recipe.output.amount),
          })),
          depth + 1,
        )
      }
    }
    for (const cost of this.goals()) visit(cost)
    // Deepest first is fine: try every wanted recipe until nothing more can start.
    for (let pass = 0; pass < 4; pass++) {
      let started = false
      for (const [recipeId, count] of Object.entries(wanted)) {
        if (count <= 0) continue
        if (checkCraft(s, recipeId, 1) !== 'ok') continue
        this.act({ type: 'craft/start', recipeId, count: 1 })
        wanted[recipeId] = count - 1
        started = true
      }
      if (!started) break
    }
  }

  /**
   * Sends gatherers where the goals need materials (spread over the best few spots). With nothing
   * needed they rest, unless a peddler can turn their hauls into Glimmers.
   */
  private assignHelpers() {
    const s = this.state
    const needs = this.needs()
    const ranked = this.rankSpots(needs).filter(([, score]) => score > 0.01)
    const peddler = s.helpers.list.some((h) => h.type === 'peddler')
    const gatherers = s.helpers.list.filter((h) => h.type === 'gatherer' || h.type === 'pirate')
    gatherers.forEach((helper, i) => {
      const spotId =
        ranked.length > 0
          ? ranked[i % Math.min(2, ranked.length)][0]
          : peddler
            ? this.bestSpot({})
            : null
      if (helper.task !== spotId) this.act({ type: 'helpers/assign', helperId: helper.id, spotId })
    })
    // A peddler sells anything above these limits.
    if (peddler) {
      const reserved: Needs = {}
      for (const cost of this.goals()) this.expand(cost, {}, reserved)
      for (const itemId of Object.keys(s.inventory)) {
        if (ITEMS[itemId]?.category === 'trinket') continue
        const limit = (reserved[itemId] ?? 0) + 30
        if (s.supply.maximums[itemId] !== limit) {
          this.act({ type: 'storage/setMaximum', itemId, amount: limit })
        }
      }
    }
  }

  /** Spots by how much of what's needed they grow (per tap). */
  private rankSpots(needs: Needs): [string, number][] {
    const s = this.state
    return this.openSpots()
      .filter((spotId) => !(s.challenges.creatures[spotId] && CREATURE_BLOCKS(s, spotId)))
      .map((spotId): [string, number] => {
        let score = 0
        for (const plantId of SPOTS[spotId].plants) {
          for (const y of PLANTS[plantId].yields) {
            if (needs[y.itemId]) score += Math.min(needs[y.itemId], 20) / PLANTS[plantId].toughness
          }
        }
        return [spotId, score]
      })
      .sort((a, b) => b[1] - a[1])
  }

  private settlementChores() {
    const s = this.state
    const here = s.player.place
    // Recruit gatherers while there's room and Glimmers.
    for (let i = 0; i < 6; i++) {
      if (checkRecruit(s, 'gatherer') !== 'ok') break
      this.act({ type: 'helpers/recruit', helperType: 'gatherer' })
    }
    for (const type of ['scout', 'peddler', 'brewer', 'supply'] as const) {
      if (checkRecruit(s, type) === 'ok' && s.resources.glimmers > recruitCost(s, type) * 3) {
        this.act({ type: 'helpers/recruit', helperType: type })
      }
    }
    // Villagers.
    for (const request of [...(s.settlements[here]?.requests ?? [])]) {
      if (checkVillagerRequest(s, here, request.id) === 'ok') {
        this.act({ type: 'villager/fulfill', settlementId: here, requestId: request.id })
      }
    }
    // Stories: start them, and hand things over when ready.
    for (const story of Object.values(STORIES)) {
      if (storyHome(story.characterId) !== here) continue
      if (s.stories[story.id]?.complete) continue
      if (!s.stories[story.id] || taskReady(s, story.id)) {
        this.act({ type: 'story/advance', storyId: story.id })
      }
    }
    // Sell what we have far too much of, when Glimmers are holding us back.
    if (this.wantsGlimmers()) {
      for (const [itemId, amount] of Object.entries(s.player.satchel)) {
        if (checkSell(s, itemId, amount) === 'ok') this.act({ type: 'shop/sell', itemId, amount })
      }
    }
  }

  private wantsGlimmers(): boolean {
    const s = this.state
    const next = this.wantedUpgrades()[0]
    const short = !!next && s.resources.glimmers < UPGRADES[next].glimmers
    // A filling storeroom is worth thinning out too.
    return short || storageUsed(s) > storageCapacity(s) * 0.6
  }

  private hasSurplus(): boolean {
    const reserved: Needs = {}
    for (const cost of this.goals()) this.expand(cost, {}, reserved)
    return Object.entries(this.state.inventory).some(
      ([id, n]) => ITEMS[id]?.category !== 'trinket' && n - (reserved[id] ?? 0) - 20 > 5,
    )
  }

  /** Packs surplus (more than the goals need, above a buffer) into the satchel to sell. */
  private packSurplus() {
    const s = this.state
    const reserved: Needs = {}
    for (const cost of this.goals()) this.expand(cost, {}, reserved)
    const spares = Object.entries(s.inventory)
      .filter(([itemId]) => ITEMS[itemId]?.category !== 'trinket')
      .map(([itemId, amount]): [string, number] => [itemId, amount - (reserved[itemId] ?? 0) - 20])
      .filter(([, spare]) => spare > 5)
      .sort((a, b) => sellPrice(b[0]) - sellPrice(a[0]))
    for (const [itemId, spare] of spares) this.act({ type: 'satchel/take', itemId, amount: spare })
  }

  /** Gathers at the current spot until the satchel is full or nothing's left to pick. */
  private gatherHere() {
    const s = this.state
    const spotId = s.player.place
    const tapMs = 1000 / this.opts.tapsPerSecond
    for (let guard = 0; guard < 400; guard++) {
      const creature = s.challenges.creatures[spotId]
      if (creature) {
        if (CREATURE_BLOCKS(s, spotId)) return
        if (creature.tapsLeft > 0) {
          this.act({ type: 'creature/tap', spotId })
          this.wait(tapMs)
          continue
        }
      }
      const slots = s.spots[spotId]?.slots ?? []
      const slot = slots.findIndex((sl) => !!sl.plantId)
      if (slot < 0) return
      const events = this.act({ type: 'gather/tap', spotId, slot })
      this.wait(tapMs)
      if (events.some((e) => e.type === 'blocked')) {
        const reason = events.find((e) => e.type === 'blocked')
        if (reason && 'reason' in reason && reason.reason === 'satchel-full') return
        // A blocked slot (camp, pests): try the others by waiting a beat.
        if (slots.filter((sl) => sl.plantId).length <= 1) return
        this.wait(1000)
      }
    }
  }

  /** The blue jay: feed it at dawn, then call it with Kindred Call. */
  private tendJay(): boolean {
    const s = this.state
    const jay = 'mount-blue-jay'
    if (!regionUnlocked(s, 'glade') || ownsMount(s, jay) || !isMorning(s)) return false
    const home = MOUNTS[jay].homeSpot
    const canFeed = s.mounts.friendship[jay]?.cooldownMs ?? 0
    const tameReady =
      knownSpells(s).includes('spell-kindred-call') &&
      (s.mounts.friendship[jay]?.feedings ?? 0) >= MOUNTS[jay].feedingsToBefriend
    if (
      !tameReady &&
      (canFeed > 0 || this.have(MOUNTS[jay].food.itemId) < MOUNTS[jay].food.amount)
    ) {
      return false
    }
    // The jay wants its own Kindred Call (Moon Draught and a Starlight Lens).
    const tameCost = MOUNTS[jay].tameCost ?? []
    if (tameReady && !tameCost.every((c) => this.have(c.itemId) >= c.amount)) return false
    // Bring what's needed along in the satchel (costs can come from storage too).
    if (!this.fly(home)) return false
    if (wildMountAt(s, home) !== jay) return true
    if (checkFeed(s, jay) === 'ok') this.act({ type: 'mount/feed', mountId: jay })
    if (checkSpell(s, 'spell-kindred-call') === 'ok') {
      this.act({ type: 'spell/cast', spellId: 'spell-kindred-call' })
    }
    return true
  }

  // -------------------------------------------------------------------------------------------
  // The day

  /** One trip: from home, somewhere useful, and back. */
  private trip() {
    const s = this.state
    if (s.player.place !== HOME) this.fly(HOME)
    this.homeChores()
    if (this.state.prestige.run !== this.run) return

    // Spirits ready to wake.
    for (const spirit of Object.values(SPIRITS)) {
      if (!regionUnlocked(s, spirit.regionId) || spiritAwake(s, spirit.id)) continue
      const ready = spiritRequirements(s, spirit.id).every((req) =>
        req.kind === 'offering'
          ? req.items.every((c) => 'itemId' in c && this.have(c.itemId) >= c.amount)
          : req.kind === 'bloom'
            ? bloomLevel(s, spirit.regionId) >= req.level
            : s.stories[req.storyId]?.complete === true,
      )
      if (ready && this.fly(spirit.place)) {
        if (checkSpirit(s, spirit.id) === 'ok')
          this.act({ type: 'spirit/awaken', spiritId: spirit.id })
        this.mark(`Woke ${spirit.name.split(',')[0]}`)
        return
      }
    }

    if (this.tendJay()) return

    // A village: recruit, help villagers, stories, sell.
    const village = this.villageWorthVisiting()
    if (village) {
      if (this.wantsGlimmers()) this.packSurplus()
      if (this.fly(village)) this.settlementChores()
      return
    }

    // Otherwise, gather.
    const spot = this.bestSpot(this.needs())
    if (this.fly(spot)) this.gatherHere()
  }

  /** A village with something to do: recruiting, a request we can fill, a story step. */
  private villageWorthVisiting(): string | null {
    const s = this.state
    const villages = REGION_ORDER.filter((id) => regionUnlocked(s, id)).map(
      (id) => REGIONS[id].settlement,
    )
    const roomFor =
      s.helpers.list.filter((h) => h.type === 'gatherer').length < helperCapacity(s, 'gatherer')
    for (const village of villages) {
      if (!isSettlement(village)) continue
      if (roomFor && s.resources.glimmers >= recruitCost(s, 'gatherer')) return village
      const requests = s.settlements[village]?.requests ?? []
      if (requests.some((r) => r.wants.every((w) => this.have(w.itemId) >= w.amount))) {
        return village
      }
      for (const story of Object.values(STORIES)) {
        if (storyHome(story.characterId) !== village) continue
        const progress = s.stories[story.id]
        if (progress?.complete) continue
        if (!progress || taskReady(s, story.id)) return village
      }
    }
    // Selling, when Glimmers are short or storage is getting full.
    if (this.wantsGlimmers() && this.hasSurplus()) return villages[0]
    return null
  }

  private prestige() {
    const s = this.state
    this.mark(`Root Song (+${rootSongPreview(s).total})`)
    this.act({ type: 'ritual/perform', ritualId: 'ritual-root-song' })
    this.run = s.prestige.run
    this.runActiveMs = 0
    this.runDay = 1
    // Spend the Root Song, cheapest tiers first.
    for (let i = 0; i < 60; i++) {
      const upgrade = ROOT_UPGRADE_LIST.filter((u) => checkRootUpgrade(s, u.id) === 'ok').sort(
        (a, b) => a.costs[s.prestige.upgrades[a.id] ?? 0] - b.costs[s.prestige.upgrades[b.id] ?? 0],
      )[0]
      if (!upgrade) break
      this.act({ type: 'rootsong/buy', upgradeId: upgrade.id })
    }
  }

  private checkMilestones() {
    const s = this.state
    const rank = courtRank(s)
    for (let r = 1; r <= rank; r++) this.mark(`Rank: ${COURT_RANKS[r].name}`)
    for (const id of REGION_ORDER)
      if (regionUnlocked(s, id) && id !== 'meadow') this.mark(`Region: ${REGIONS[id].name}`)
    if (ownsMount(s, 'mount-blue-jay')) this.mark('Tamed the blue jay')
  }

  private daySummary(): string {
    const s = this.state
    const next = this.wantedUpgrades()
      .slice(0, 3)
      .map((id) => `${id.replace('lodging-', '')}(${checkUpgrade(s, id)}:${UPGRADES[id].glimmers})`)
      .join(' ')
    return [
      `run ${this.run} day ${String(this.runDay).padStart(2)}`,
      `${Math.round(this.runActiveMs / 60_000)}min`,
      `G${Math.round(s.resources.glimmers)}`,
      `pts ${courtPointsOf(s)}`,
      `helpers ${s.helpers.list.length}`,
      `regions ${s.unlockedRegions.length}`,
      `res ${s.research.current?.id ?? '-'}`,
      `store ${storageUsed(s)}/${storageCapacity(s)}`,
      `next: ${next}`,
      `income: ${Object.entries(this.income)
        .map(([k, v]) => `${k} ${Math.round(v)}`)
        .join(', ')}`,
    ].join(' | ')
  }

  /** Plays until the requested number of runs is done (or the day limit). */
  play(): Milestone[] {
    const targetRun = this.opts.runs + 1
    for (let day = 1; day <= this.opts.maxDays * this.opts.runs; day++) {
      const sessionEnd = this.runActiveMs + this.opts.activeMinutesPerDay * 60_000
      const dayStart = this.now
      let idle = 0
      const sessionRun = this.run
      while (this.runActiveMs < sessionEnd && this.run === sessionRun) {
        const before = this.runActiveMs
        this.trip()
        this.checkMilestones()
        if (this.state.prestige.run >= targetRun) return this.milestones
        // Nothing took any time: wait a little for things to grow.
        if (this.runActiveMs === before) {
          this.wait(30_000)
          if (++idle > 400) break
        }
      }
      this.days.push(this.daySummary())
      this.income = {}
      this.away(DAY - (this.now - dayStart))
      if (this.run === sessionRun) this.runDay++
    }
    return this.milestones
  }
}

/** A creature the bot can't get past by tapping (a watcher, or the badger who must be calmed). */
function CREATURE_BLOCKS(state: GameState, spotId: string): boolean {
  const creature = state.challenges.creatures[spotId]
  if (!creature) return false
  const def = CREATURES[creature.creatureId]
  return def?.behavior === 'watches' || def?.calmOnly === true
}

function costSize(cost: readonly CostEntry[]): number {
  return cost.reduce((sum, c) => sum + c.amount, 0)
}

function storyHome(characterId: string): string | null {
  return CHARACTERS[characterId]?.settlement ?? null
}

function applyCheckUpgrade(bot: Bot, id: string) {
  return checkUpgrade(bot.state, id)
}
