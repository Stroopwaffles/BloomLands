<script lang="ts">
  import Art from '../../art/Art.svelte'
  import CrimsonBackdrop from '../../art/CrimsonBackdrop.svelte'
  import { OUTFIT_SETS } from '../../data/appearance'
  import { EVENT_BASES, EVENT_RECIPES, EVENTS } from '../../data/events'
  import { formatDuration } from '../../engine/format'
  import { checkEventRecipe, eventStore } from '../../engine/specialEvents'
  import CostList from '../components/CostList.svelte'
  import Destinations from '../components/Destinations.svelte'
  import ItemList from '../components/ItemList.svelte'
  import { runtime } from '../game'
  import { BLOCKED_TEXT } from '../messages'

  /**
   * A special event's mini base (the Moonless Manor). Its pantry holds everything gathered in the
   * event's region, and its workshop makes the event's own things from them. None of it reaches
   * the main game's storage or recipes.
   */
  const { game } = runtime
  const base = $derived(EVENT_BASES[$game.player.place])
  const event = $derived(base ? EVENTS[base.eventId] : null)
  const store = $derived(base ? eventStore($game, base.eventId) : {})
  const recipes = $derived(base ? EVENT_RECIPES.filter((r) => r.eventId === base.eventId) : [])
  const outfitRecipes = $derived(recipes.filter((r) => 'outfitId' in r.output))
  const owned = $derived(
    outfitRecipes.filter((r) => 'outfitId' in r.output && $game.outfits.includes(r.output.outfitId))
      .length,
  )
  const remaining = $derived($game.specialEvents.active?.remainingMs ?? 0)
</script>

{#if base && event}
  <div class="base">
    <header>
      <div>
        <h2>{base.name}</h2>
        <p>{base.description}</p>
        <p class="clock">The {event.name} sets in {formatDuration(remaining)}.</p>
      </div>
      <Destinations />
    </header>

    <section class="hall">
      <svg
        class="backdrop"
        viewBox="0 0 160 100"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <CrimsonBackdrop spotId={base.id} />
      </svg>
      <div class="host">
        <Art id={base.host.id} size={150} />
      </div>
      <div class="speech">
        <strong>{base.host.name}</strong>
        <span class="title">{base.host.title}</span>
        {#each base.host.greeting as line, i (i)}
          <p>{line}</p>
        {/each}
      </div>
    </section>

    <div class="columns">
      <section class="panel">
        <h3>The pantry</h3>
        <p class="note">
          Everything you gather in the {event.name === 'Blood Moon' ? 'Crimson Vale' : 'event'} comes
          straight here. It keeps until the next {event.name}, too.
        </p>
        <ItemList items={store} empty="Empty. Gather in the vale's gardens and woods." />
      </section>

      <section class="panel">
        <h3>{base.workshop}</h3>
        <p class="note">
          Outfits made here are yours forever ({owned} of {outfitRecipes.length} made).
        </p>
        <ul class="recipes">
          {#each recipes as recipe (recipe.id)}
            {@const check = checkEventRecipe($game, recipe.id)}
            <li class:done={check === 'already-done'}>
              <span class="art">
                <Art
                  id={'itemId' in recipe.output
                    ? recipe.output.itemId
                    : (OUTFIT_SETS[recipe.output.outfitId]?.pieces[0] ?? recipe.id)}
                  size={44}
                />
              </span>
              <div class="info">
                <strong>{recipe.name}</strong>
                <span class="desc">{recipe.description}</span>
                <CostList cost={recipe.inputs} stock={store} />
              </div>
              {#if check === 'already-done'}
                <span class="badge">Owned</span>
              {:else}
                <button
                  type="button"
                  disabled={check !== 'ok'}
                  title={check === 'ok' ? undefined : BLOCKED_TEXT[check]}
                  onclick={() => runtime.dispatch({ type: 'event/craft', recipeId: recipe.id })}
                >
                  Make
                </button>
              {/if}
            </li>
          {/each}
        </ul>
      </section>
    </div>
  </div>
{/if}

<style>
  .base {
    min-height: calc(100vh - 70px);
    padding: 16px;
    background: linear-gradient(#1a0a14, #2a0e1e 60%, #160812);
    color: #f2e6ea;
  }

  header,
  .hall,
  .columns {
    max-width: 1100px;
    margin: 0 auto 16px;
  }

  header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  h2,
  h3 {
    margin: 0;
  }

  header p {
    margin: 4px 0 0;
    opacity: 0.85;
  }

  .clock {
    font-weight: 700;
    color: #ff8a9a;
  }

  .hall {
    position: relative;
    display: flex;
    align-items: flex-end;
    gap: 16px;
    min-height: 240px;
    padding: 16px;
    border-radius: 24px;
    overflow: hidden;
    border: 2px solid #7a1a2e;
  }

  .backdrop {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  .host,
  .speech {
    position: relative;
  }

  .host {
    filter: drop-shadow(0 0 16px rgb(255 60 90 / 0.45));
  }

  .speech {
    flex: 1;
    max-width: 560px;
    padding: 12px 16px;
    border-radius: 16px;
    background: rgb(20 6 14 / 0.82);
    border: 1px solid #7a1a2e;
  }

  .speech .title {
    display: block;
    font-size: 0.85rem;
    opacity: 0.75;
  }

  .speech p {
    margin: 6px 0 0;
    font-style: italic;
  }

  .columns {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 16px;
    align-items: start;
  }

  .panel {
    padding: 16px;
    border-radius: 20px;
    background: #2a1220;
    border: 2px solid #7a1a2e;
    color: #f2e6ea;
  }

  .note {
    margin: 4px 0 10px;
    font-size: 0.9rem;
    opacity: 0.8;
  }

  .recipes {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .recipes li {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    border-radius: 14px;
    background: #3a1a2a;
  }

  .recipes li.done {
    opacity: 0.7;
  }

  .info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .desc {
    font-size: 0.85rem;
    opacity: 0.85;
  }

  button {
    min-height: 44px;
    padding: 0 16px;
    border: none;
    border-radius: 12px;
    background: #b0243e;
    color: white;
    font: inherit;
    font-weight: 700;
    cursor: pointer;
  }

  button:disabled {
    background: #5a3a48;
    cursor: not-allowed;
  }

  .badge {
    padding: 4px 10px;
    border-radius: 999px;
    background: #6a8a5a;
    color: white;
    font-weight: 700;
    font-size: 0.85rem;
  }
</style>
