<script lang="ts">
  import Art from '../../art/Art.svelte'
  import { itemName } from '../../data/items'
  import { RECIPES, STATION_ORDER, STATIONS } from '../../data/recipes'
  import { formatDuration } from '../../engine/format'
  import { payingStock } from '../../engine/costs'
  import { batchSizes, checkCraft, stationInUse, unlockedRecipes } from '../../engine/crafting'
  import { hasQol, stationBuilt, stationSlots } from '../../engine/modifiers'
  import CostList from '../components/CostList.svelte'
  import ProgressBar from '../components/ProgressBar.svelte'
  import RitualCircle from '../components/RitualCircle.svelte'
  import SatchelLock from '../components/SatchelLock.svelte'
  import { runtime } from '../game'
  import { BLOCKED_TEXT } from '../messages'

  const { game } = runtime

  const unlocked = $derived(unlockedRecipes($game))
  /** The Recipe Book: search by name, favorites first. */
  const book = $derived(hasQol($game, 'recipe-book'))
  let query = $state('')
  const favorites = $derived($game.preferences.favorites)
  const recipesByStation = $derived(
    Object.fromEntries(
      STATION_ORDER.map((stationId) => [
        stationId,
        Object.values(RECIPES)
          .filter((r) => r.station === stationId && unlocked.has(r.id))
          .filter(
            (r) =>
              !book ||
              !query.trim() ||
              itemName(r.output.itemId).toLowerCase().includes(query.trim().toLowerCase()),
          )
          .sort((a, b) =>
            book ? Number(favorites.includes(b.id)) - Number(favorites.includes(a.id)) : 0,
          ),
      ]),
    ),
  )
</script>

<div class="lock-bar">
  {#if book}
    <label class="search">
      <span>Recipe Book</span>
      <input type="search" placeholder="Search recipes…" bind:value={query} />
    </label>
  {/if}
  <SatchelLock />
</div>

<div class="stations">
  {#each STATION_ORDER as stationId (stationId)}
    {@const station = $game.stations[stationId]}
    {@const recipes = recipesByStation[stationId]}
    <section class="panel">
      <header>
        <Art id={`station-${stationId}`} size={44} />
        <h3>{STATIONS[stationId].name}</h3>
        {#if stationBuilt($game, stationId)}
          <span class="slots"
            >{stationInUse($game, stationId)}/{stationSlots($game, stationId)} in use</span
          >
        {/if}
      </header>

      {#each $game.helpers.list.filter((h) => h.type === 'brewer' && h.phase === 'gathering' && h.tripItem && RECIPES[h.tripItem]?.station === stationId) as brewer (brewer.id)}
        <ProgressBar
          label={`${brewer.name} is ${STATIONS[stationId].verb.toLowerCase()}ing ${itemName(RECIPES[brewer.tripItem!].output.itemId)}`}
          totalMs={RECIPES[brewer.tripItem!].durationMs}
          remainingMs={brewer.remainingMs}
        />
      {/each}
      {#each station.jobs as job, i (i)}
        <ProgressBar
          label={`${STATIONS[stationId].verb}ing ${itemName(RECIPES[job.id].output.itemId)}${
            (job.count ?? 1) > 1 ? ` ×${job.count}` : ''
          }`}
          totalMs={job.totalMs}
          remainingMs={job.remainingMs}
        />
      {/each}

      {#if !stationBuilt($game, stationId)}
        <p class="hint">Not built yet. Build it from the Upgrades tab.</p>
      {:else if recipes.length === 0}
        <p class="hint">
          {book && query.trim()
            ? 'No recipes here match your search.'
            : 'No recipes yet. Research unlocks them.'}
        </p>
      {:else}
        <ul class="recipes">
          {#each recipes as recipe (recipe.id)}
            <li>
              <div class="output">
                <Art id={recipe.output.itemId} size={36} />
                <div>
                  {#if book}
                    <button
                      type="button"
                      class="star"
                      class:on={favorites.includes(recipe.id)}
                      aria-pressed={favorites.includes(recipe.id)}
                      aria-label={`${favorites.includes(recipe.id) ? 'Unstar' : 'Star'} ${itemName(recipe.output.itemId)}`}
                      onclick={() =>
                        runtime.dispatch({ type: 'recipe/favorite', recipeId: recipe.id })}
                      >{favorites.includes(recipe.id) ? '★' : '☆'}</button
                    >
                  {/if}
                  <strong>{itemName(recipe.output.itemId)}</strong>
                  {#if recipe.output.amount > 1}× {recipe.output.amount}{/if}
                  <span class="time">{formatDuration(recipe.durationMs)}</span>
                </div>
              </div>
              <CostList cost={recipe.inputs} stock={payingStock($game)} />
              <div class="buttons">
                {#each batchSizes($game) as count (count)}
                  {@const check = checkCraft($game, recipe.id, count)}
                  <button
                    type="button"
                    disabled={check !== 'ok'}
                    title={check === 'ok' ? undefined : BLOCKED_TEXT[check]}
                    onclick={() =>
                      runtime.dispatch({ type: 'craft/start', recipeId: recipe.id, count })}
                  >
                    {count === 1 ? STATIONS[stationId].verb : `×${count}`}
                  </button>
                {/each}
              </div>
            </li>
          {/each}
        </ul>
      {/if}
    </section>
  {/each}
</div>

<div class="rituals"><RitualCircle /></div>

<style>
  .rituals {
    margin-top: 16px;
  }

  .lock-bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 16px;
    margin-bottom: 12px;
    padding: 6px 14px;
    background: var(--cream-deep);
    border: 2px solid var(--honey);
    border-radius: 16px;
    width: fit-content;
  }

  .stations {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 16px;
  }

  .panel {
    display: flex;
    flex-direction: column;
    gap: 10px;
    background: var(--cream-deep);
    border: 2px solid var(--honey);
    border-radius: 20px;
    padding: 16px;
  }

  header {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  h3 {
    margin: 0;
    flex: 1;
  }

  .slots {
    font-size: 0.85rem;
    opacity: 0.7;
  }

  .hint {
    margin: 0;
    opacity: 0.7;
  }

  .recipes {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  li {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 6px 10px;
    align-items: center;
    padding: 8px 10px;
    background: var(--surface);
    border-radius: 14px;
  }

  .output {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .time {
    display: block;
    font-size: 0.8rem;
    opacity: 0.7;
  }

  li :global(ul) {
    grid-column: 1;
  }

  .buttons {
    grid-column: 2;
    grid-row: 1 / span 2;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  button {
    min-height: 44px;
    min-width: 80px;
    padding: 0 14px;
    border: none;
    border-radius: 12px;
    background: var(--leaf-deep);
    color: white;
    font: inherit;
    font-weight: 700;
    cursor: pointer;
  }

  button:disabled {
    background: var(--disabled, #c9c2b8);
    cursor: not-allowed;
  }

  .search {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 700;
    font-size: 0.9rem;
  }

  .search input {
    min-height: 40px;
    min-width: 220px;
    padding: 0 12px;
    border: 2px solid var(--honey);
    border-radius: 12px;
    background: var(--surface);
    color: var(--ink);
    font: inherit;
  }

  .star {
    min-height: 0 !important;
    padding: 0 4px !important;
    border: none !important;
    background: none !important;
    color: #c9a24a !important;
    font-size: 1.2rem;
    line-height: 1;
    cursor: pointer;
  }

  .star.on {
    color: #f2b23a !important;
  }
</style>
