<script lang="ts">
  import Art from '../../art/Art.svelte'
  import { itemName } from '../../data/items'
  import { RECIPES, STATION_ORDER, STATIONS } from '../../data/recipes'
  import { formatDuration } from '../../engine/format'
  import { checkCraft, unlockedRecipes } from '../../engine/crafting'
  import CostList from '../components/CostList.svelte'
  import ProgressBar from '../components/ProgressBar.svelte'
  import { runtime } from '../game'
  import { BLOCKED_TEXT } from '../messages'

  const { game } = runtime

  const unlocked = $derived(unlockedRecipes($game))
  const recipesByStation = $derived(
    Object.fromEntries(
      STATION_ORDER.map((stationId) => [
        stationId,
        Object.values(RECIPES).filter((r) => r.station === stationId && unlocked.has(r.id)),
      ]),
    ),
  )
</script>

<div class="stations">
  {#each STATION_ORDER as stationId (stationId)}
    {@const station = $game.stations[stationId]}
    {@const recipes = recipesByStation[stationId]}
    <section class="panel">
      <header>
        <Art id={`station-${stationId}`} size={44} />
        <h3>{STATIONS[stationId].name}</h3>
        <span class="slots">{station.jobs.length}/{station.slots} in use</span>
      </header>

      {#each station.jobs as job, i (i)}
        <ProgressBar
          label={`${STATIONS[stationId].verb}ing ${itemName(RECIPES[job.id].output.itemId)}`}
          totalMs={job.totalMs}
          remainingMs={job.remainingMs}
        />
      {/each}

      {#if recipes.length === 0}
        <p class="hint">No recipes yet. Research unlocks them.</p>
      {:else}
        <ul class="recipes">
          {#each recipes as recipe (recipe.id)}
            {@const check = checkCraft($game, recipe.id)}
            <li>
              <div class="output">
                <Art id={recipe.output.itemId} size={36} />
                <div>
                  <strong>{itemName(recipe.output.itemId)}</strong>
                  {#if recipe.output.amount > 1}× {recipe.output.amount}{/if}
                  <span class="time">{formatDuration(recipe.durationMs)}</span>
                </div>
              </div>
              <CostList cost={recipe.inputs} stock={$game.inventory} />
              <button
                type="button"
                disabled={check !== 'ok'}
                title={check === 'ok' ? undefined : BLOCKED_TEXT[check]}
                onclick={() => runtime.dispatch({ type: 'craft/start', recipeId: recipe.id })}
              >
                {STATIONS[stationId].verb}
              </button>
            </li>
          {/each}
        </ul>
      {/if}
    </section>
  {/each}
</div>

<style>
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
    background: white;
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

  button {
    grid-column: 2;
    grid-row: 1 / span 2;
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
    background: #c9c2b8;
    cursor: not-allowed;
  }
</style>
