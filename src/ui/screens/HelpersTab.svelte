<script lang="ts">
  import { PRESET_SLOTS, type HelperPreset } from '../../engine/comforts'
  import Art from '../../art/Art.svelte'
  import {
    BREWER_KEEP,
    gathersAtSpot,
    HELPER_RULES,
    HELPER_TYPES,
    PEDDLER_RULES,
  } from '../../data/helpers'
  import { itemName } from '../../data/items'
  import { RECIPES, STATIONS } from '../../data/recipes'
  import { unlockedRecipes } from '../../engine/crafting'
  import { isSpot, placeName, REGION_ORDER, REGIONS } from '../../data/world'
  import { placeOpen } from '../../engine/regions'
  import { formatDuration, formatNumber } from '../../engine/format'
  import {
    brewCheck,
    helperFlightMs,
    nearestMarket,
    supplyableItems,
    supplyHaul,
    supplyStatus,
    surplus,
  } from '../../engine/helpers'
  import { sellPrice } from '../../engine/shop'
  import { hasQol, helperCapacity } from '../../engine/modifiers'
  import type { HelperState } from '../../engine/state'
  import ItemList from '../components/ItemList.svelte'
  import { runtime } from '../game'

  const { game } = runtime
  const spots = $derived(
    REGION_ORDER.flatMap((id) => REGIONS[id].spots).filter((id) => placeOpen($game, id)),
  )
  const supplyItems = $derived(supplyableItems($game))
  /** Recipes a brewer can be set to make (anything researched). */
  const brewable = $derived(
    Object.values(RECIPES).filter((recipe) => unlockedRecipes($game).has(recipe.id)),
  )

  const BREW_WAIT: Record<string, string> = {
    'no-recipe': 'Resting: choose something to brew',
    'not-built': 'Waiting: that station isn’t built yet',
    enough: 'Resting: you have enough of it',
    'station-busy': 'Waiting for a free station slot',
    'missing-items': 'Waiting for ingredients',
  }

  function setBrew(helper: HelperState, recipeId: string | null, keep?: number) {
    runtime.dispatch({ type: 'helpers/brew', helperId: helper.id, recipeId, keep })
  }

  const hasSupply = $derived(helperCapacity($game, 'supply') > 0)
  const hasPeddler = $derived(helperCapacity($game, 'peddler') > 0)
  /** Items that can have a storage limit: anything stored, or already limited. */
  const limitItems = $derived(
    [...new Set([...Object.keys($game.inventory), ...Object.keys($game.supply.maximums)])]
      .filter((id) => sellPrice(id) > 0)
      .sort((a, b) => itemName(a).localeCompare(itemName(b))),
  )
  const market = $derived(nearestMarket($game))

  /** What a supplier can expect for an item, in words. */
  function expectation(itemId: string): string {
    switch (supplyStatus($game, itemId)) {
      case 'too-rare':
        return 'Too rare to search for yet (build a Seed Catalogue)'
      case 'not-now':
        return "Can't be found right now (out of season or blocked)"
      default: {
        const haul = supplyHaul($game, itemId)
        if (haul >= 1) return `about ${formatNumber(Math.round(haul))} per trip`
        return `about 1 every ${Math.round(1 / haul)} trips`
      }
    }
  }

  function setMaximum(itemId: string, amount: number) {
    runtime.dispatch({ type: 'storage/setMaximum', itemId, amount })
  }

  function status(helper: HelperState): string {
    const where = helper.tripSpot ? placeName(helper.tripSpot) : ''
    const fetching = helper.tripItem ? ` for ${itemName(helper.tripItem)}` : ''
    if (helper.type === 'brewer') {
      if (helper.phase === 'gathering' && helper.tripItem) {
        const recipe = RECIPES[helper.tripItem]
        return `${STATIONS[recipe.station].verb}ing ${itemName(recipe.output.itemId)}`
      }
      return BREW_WAIT[brewCheck($game, helper)] ?? 'Getting ready'
    }
    if (helper.type === 'peddler') {
      const load = Object.entries(helper.bag)
        .map(([id, n]) => `${n} ${itemName(id)}`)
        .join(', ')
      switch (helper.phase) {
        case 'idle':
          return 'Resting: nothing is over its storage limit'
        case 'outbound':
          return `Taking ${load} to ${where}`
        case 'gathering':
          return `Selling at ${where}`
        default:
          return `Bringing home ${helper.purse ?? 0} Glimmers`
      }
    }
    switch (helper.phase) {
      case 'idle':
        if (gathersAtSpot(helper.type)) return helper.task ? 'Getting ready' : 'Resting at home'
        return 'Resting: all stock is above its minimum'
      case 'outbound':
        return `Flying to ${where}${fetching}`
      case 'gathering':
        return helper.type === 'scout'
          ? `Searching ${where} for trinkets`
          : `Gathering at ${where}${fetching}`
      case 'returning':
        return `Flying home from ${where}`
      case 'unloading':
        return 'Waiting at home: storage is full'
    }
  }

  /** How far through the current phase, 0 to 1. */
  function progress(helper: HelperState): number {
    const total =
      helper.type === 'brewer'
        ? (RECIPES[helper.tripItem ?? '']?.durationMs ?? 1)
        : helper.phase === 'gathering'
          ? helper.type === 'peddler'
            ? PEDDLER_RULES.sellMs
            : HELPER_RULES.gatherMs
          : helper.tripSpot
            ? helperFlightMs($game, helper, helper.tripSpot)
            : 1
    if (helper.phase === 'idle' || helper.phase === 'unloading') return 0
    return 1 - helper.remainingMs / total
  }

  function setMinimum(itemId: string, amount: number) {
    runtime.dispatch({ type: 'supply/setMinimum', itemId, amount })
  }

  /** "3 gathering: Buttercup Rise, Fernshade Floor…" */
  function presetSummary(preset: HelperPreset): string {
    const places = preset.jobs.flatMap((j) => (j.task && isSpot(j.task) ? [placeName(j.task)] : []))
    const unique = [...new Set(places)]
    return `${preset.jobs.length} helpers${unique.length ? `: ${unique.slice(0, 3).join(', ')}${unique.length > 3 ? '…' : ''}` : ''}`
  }
</script>

<div class="helpers">
  {#if hasQol($game, 'helper-presets') && $game.helpers.list.length > 0}
    <section class="panel ledger">
      <h3>Helper Ledger</h3>
      <p class="note">Save everyone's jobs, and put them back in one tap.</p>
      <div class="slots">
        {#each Array.from({ length: PRESET_SLOTS }, (_, i) => i) as slot (slot)}
          {@const preset = $game.preferences.helperPresets[slot]}
          <div class="slot">
            <strong>Set {slot + 1}</strong>
            <span class="summary">
              {preset ? presetSummary(preset) : 'Empty'}
            </span>
            <div class="slot-buttons">
              <button
                type="button"
                onclick={() => runtime.dispatch({ type: 'helpers/savePreset', slot })}
              >
                Save
              </button>
              <button
                type="button"
                disabled={!preset}
                onclick={() => runtime.dispatch({ type: 'helpers/applyPreset', slot })}
              >
                Use
              </button>
            </div>
          </div>
        {/each}
      </div>
    </section>
  {/if}

  <section class="panel">
    <h3>Your helpers</h3>
    {#if $game.helpers.list.length === 0}
      <p class="note">
        No helpers yet. Build Mouse Bunks (Upgrades tab), then fly to Thimblewick to recruit field
        mice.
      </p>
    {:else}
      <ul class="list">
        {#each $game.helpers.list as helper (helper.id)}
          <li>
            <Art id={`helper-${helper.type}`} size={52} />
            <div class="info">
              <strong>{helper.name}</strong>
              <span class="type">{HELPER_TYPES[helper.type].name}</span>
              <span>{status(helper)}</span>
              {#if helper.phase !== 'idle' && helper.phase !== 'unloading'}
                <div class="bar">
                  <div style:width="{progress(helper) * 100}%"></div>
                </div>
                <span class="time">{formatDuration(helper.remainingMs + 999)}</span>
              {/if}
              {#if Object.keys(helper.bag).length > 0}
                <div class="bag"><ItemList items={helper.bag} /></div>
              {/if}
            </div>
            {#if helper.type === 'brewer'}
              <div class="task">
                <label class="task">
                  <span>Brews</span>
                  <select
                    value={helper.task ?? ''}
                    onchange={(e) => setBrew(helper, e.currentTarget.value || null)}
                  >
                    <option value="">Nothing (rest)</option>
                    {#each brewable as recipe (recipe.id)}
                      <option value={recipe.id}>
                        {itemName(recipe.output.itemId)} ({STATIONS[recipe.station].name})
                      </option>
                    {/each}
                  </select>
                </label>
                <label class="task">
                  <span>Keep in storage</span>
                  <select
                    value={helper.keep ?? BREWER_KEEP.default}
                    onchange={(e) => setBrew(helper, helper.task, Number(e.currentTarget.value))}
                  >
                    {#each BREWER_KEEP.choices as amount (amount)}
                      <option value={amount}>{amount}</option>
                    {/each}
                  </select>
                </label>
              </div>
            {:else if gathersAtSpot(helper.type)}
              <label class="task">
                <span>{helper.type === 'scout' ? 'Searches' : 'Works at'}</span>
                <select
                  value={helper.task ?? ''}
                  onchange={(e) =>
                    runtime.dispatch({
                      type: 'helpers/assign',
                      helperId: helper.id,
                      spotId: e.currentTarget.value || null,
                    })}
                >
                  {#each spots as spotId (spotId)}
                    <option value={spotId}>{placeName(spotId)}</option>
                  {/each}
                  <option value="">Rest at home</option>
                </select>
              </label>
            {/if}
          </li>
        {/each}
      </ul>
    {/if}
  </section>

  <section class="panel">
    <h3>Storage limits</h3>
    {#if hasPeddler}
      <p class="note">
        Peddlers sell anything above its limit at {market
          ? placeName(market)
          : 'the nearest village'},
        {PEDDLER_RULES.haul} at a time, and bring the Glimmers home. 0 means no limit.
      </p>
    {:else}
      <p class="note">
        Build a Market Stall (Upgrades tab) and recruit a peddler to sell what you have too much of.
        You can set limits already. 0 means no limit.
      </p>
    {/if}
    {#if limitItems.length === 0}
      <p class="note">Nothing in storage yet.</p>
    {/if}
    <ul class="minimums">
      {#each limitItems as itemId (itemId)}
        {@const maximum = $game.supply.maximums[itemId] ?? 0}
        {@const stock = $game.inventory[itemId] ?? 0}
        {@const over = surplus($game, itemId)}
        <li class:low={over > 0}>
          <Art id={itemId} size={30} />
          <div class="item">
            <strong>{itemName(itemId)}</strong>
            <span>
              {formatNumber(stock)} in storage{over > 0 ? ` · ${formatNumber(over)} to sell` : ''}
            </span>
          </div>
          <div class="stepper">
            <button
              type="button"
              aria-label={`Lower limit for ${itemName(itemId)}`}
              disabled={maximum === 0}
              onclick={() => setMaximum(itemId, Math.max(0, maximum - 10))}>−</button
            >
            <input
              type="number"
              min="0"
              step="10"
              value={maximum}
              aria-label={`Storage limit for ${itemName(itemId)}`}
              onchange={(e) => setMaximum(itemId, Number(e.currentTarget.value))}
            />
            <button
              type="button"
              aria-label={`Raise limit for ${itemName(itemId)}`}
              onclick={() => setMaximum(itemId, maximum + 10)}>+</button
            >
          </div>
        </li>
      {/each}
    </ul>
  </section>

  <section class="panel">
    <h3>Minimum stock</h3>
    {#if hasSupply}
      <p class="note">
        Supply helpers search for anything that falls below its minimum, with the same luck you
        have: plenty of common plants, fewer of the rarer ones. Set a minimum to 0 to ignore an
        item.
      </p>
    {:else}
      <p class="note">
        Build a Supply Nook (Upgrades tab) and recruit a supply helper to use these. You can set
        them up already.
      </p>
    {/if}
    <ul class="minimums">
      {#each supplyItems as itemId (itemId)}
        {@const minimum = $game.supply.minimums[itemId] ?? 0}
        {@const stock = $game.inventory[itemId] ?? 0}
        <li class:low={minimum > 0 && stock < minimum}>
          <Art id={itemId} size={30} />
          <div class="item">
            <strong>{itemName(itemId)}</strong>
            <span>
              {formatNumber(stock)} in storage · {expectation(itemId)}
            </span>
          </div>
          <div class="stepper">
            <button
              type="button"
              aria-label={`Lower minimum for ${itemName(itemId)}`}
              disabled={minimum === 0}
              onclick={() => setMinimum(itemId, minimum - 5)}>−</button
            >
            <input
              type="number"
              min="0"
              step="5"
              value={minimum}
              aria-label={`Minimum ${itemName(itemId)}`}
              onchange={(e) => setMinimum(itemId, Number(e.currentTarget.value))}
            />
            <button
              type="button"
              aria-label={`Raise minimum for ${itemName(itemId)}`}
              disabled={supplyStatus($game, itemId) === 'too-rare'}
              onclick={() => setMinimum(itemId, minimum + 5)}>+</button
            >
          </div>
        </li>
      {/each}
    </ul>
  </section>
</div>

<style>
  .helpers {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
    gap: 16px;
    align-items: start;
  }

  .panel {
    min-width: 0;
    background: var(--cream-deep);
    border: 2px solid var(--honey);
    border-radius: 20px;
    padding: 16px;
  }

  h3 {
    margin: 0;
  }

  .note {
    margin: 4px 0 12px;
    font-size: 0.9rem;
    opacity: 0.8;
  }

  ul {
    list-style: none;
    margin: 12px 0 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .list li {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    gap: 10px;
    padding: 10px;
    background: var(--surface);
    border-radius: 14px;
  }

  .info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
    font-size: 0.9rem;
  }

  .type {
    color: var(--leaf-deep);
    font-weight: 700;
    font-size: 0.8rem;
  }

  .bar {
    height: 8px;
    margin-top: 4px;
    border-radius: 999px;
    background: rgb(0 0 0 / 0.07);
    overflow: hidden;
  }

  .bar div {
    height: 100%;
    background: var(--leaf);
  }

  .time {
    font-size: 0.8rem;
    opacity: 0.7;
  }

  .bag {
    margin-top: 6px;
  }

  .task {
    display: flex;
    flex-direction: column;
    gap: 2px;
    font-size: 0.8rem;
    min-width: 0;
  }

  /* A helper's job picker gets its own full-width row, so long place names never spill out. */
  .list li > .task {
    flex-basis: 100%;
  }

  .task select {
    width: 100%;
  }

  select {
    min-height: 44px;
    padding: 0 8px;
    border: 2px solid var(--leaf);
    border-radius: 10px;
    background: var(--surface);
    font: inherit;
    font-size: 0.9rem;
  }

  .minimums li {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    background: var(--surface);
    border-radius: 14px;
    border: 2px solid transparent;
  }

  .minimums li.low {
    border-color: var(--petal);
  }

  .item {
    flex: 1;
    display: flex;
    flex-direction: column;
    font-size: 0.85rem;
  }

  .stepper {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .stepper button {
    width: 44px;
    height: 44px;
    border: 2px solid var(--leaf);
    border-radius: 10px;
    background: var(--surface);
    color: var(--ink);
    font-size: 1.3rem;
    cursor: pointer;
  }

  .stepper button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  input {
    width: 64px;
    height: 44px;
    border: 2px solid var(--honey);
    border-radius: 10px;
    text-align: center;
    font: inherit;
    font-weight: 700;
    user-select: text;
  }

  .ledger {
    grid-column: 1 / -1;
  }

  .slots {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 8px;
  }

  .slot {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 10px;
    border-radius: 14px;
    background: var(--surface);
  }

  .summary {
    font-size: 0.85rem;
    opacity: 0.8;
  }

  .slot-buttons {
    display: flex;
    gap: 6px;
  }

  .slot-buttons button {
    min-height: 40px;
    padding: 0 14px;
    border: 2px solid var(--leaf);
    border-radius: 10px;
    background: var(--surface);
    color: var(--ink);
    font: inherit;
    font-weight: 700;
    cursor: pointer;
  }

  .slot-buttons button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
