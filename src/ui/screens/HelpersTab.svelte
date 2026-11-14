<script lang="ts">
  import Art from '../../art/Art.svelte'
  import { BREWER_KEEP, gathersAtSpot, HELPER_RULES, HELPER_TYPES } from '../../data/helpers'
  import { itemName } from '../../data/items'
  import { RECIPES, STATIONS } from '../../data/recipes'
  import { unlockedRecipes } from '../../engine/crafting'
  import { placeName, REGION_ORDER, REGIONS } from '../../data/world'
  import { placeOpen } from '../../engine/regions'
  import { formatDuration, formatNumber } from '../../engine/format'
  import { brewCheck, helperFlightMs, supplyableItems, supplyHaul } from '../../engine/helpers'
  import { helperCapacity } from '../../engine/modifiers'
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
          ? HELPER_RULES.gatherMs
          : helper.tripSpot
            ? helperFlightMs($game, helper, helper.tripSpot)
            : 1
    if (helper.phase === 'idle' || helper.phase === 'unloading') return 0
    return 1 - helper.remainingMs / total
  }

  function setMinimum(itemId: string, amount: number) {
    runtime.dispatch({ type: 'supply/setMinimum', itemId, amount })
  }
</script>

<div class="helpers">
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
    <h3>Minimum stock</h3>
    {#if hasSupply}
      <p class="note">
        Supply helpers fetch anything that falls below its minimum. Set a minimum to 0 to ignore an
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
              {formatNumber(stock)} in storage · {formatNumber(supplyHaul(itemId))} per trip
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
    align-items: flex-start;
    gap: 10px;
    padding: 10px;
    background: var(--surface);
    border-radius: 14px;
  }

  .info {
    flex: 1;
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
</style>
