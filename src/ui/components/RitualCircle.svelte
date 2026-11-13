<script lang="ts">
  import Art from '../../art/Art.svelte'
  import { RITUALS } from '../../data/magic'
  import { payingStock } from '../../engine/costs'
  import { checkRitual, knownRituals } from '../../engine/magic'
  import { hasFeature } from '../../engine/modifiers'
  import CostList from './CostList.svelte'
  import { runtime } from '../game'
  import { BLOCKED_TEXT } from '../messages'

  const { game } = runtime
  const built = $derived(hasFeature($game, 'ritual-circle'))
  const rituals = $derived(knownRituals($game))
</script>

<section class="panel">
  <header>
    <Art id="feature-ritual-circle" size={44} />
    <h3>Ritual Circle</h3>
  </header>
  {#if !built}
    <p class="hint">Not built yet. Build it from the Upgrades tab.</p>
  {:else if rituals.length === 0}
    <p class="hint">No rites known yet. Research them in the Rites branch.</p>
  {:else}
    <ul>
      {#each rituals as ritualId (ritualId)}
        {@const ritual = RITUALS[ritualId]}
        {@const check = checkRitual($game, ritualId)}
        <li>
          <div>
            <strong>{ritual.name}</strong>
            <span class="desc">{ritual.description}</span>
            <CostList cost={ritual.cost} stock={payingStock($game)} />
          </div>
          <button
            type="button"
            disabled={check !== 'ok'}
            title={check === 'ok' ? undefined : BLOCKED_TEXT[check]}
            onclick={() => runtime.dispatch({ type: 'ritual/perform', ritualId })}
          >
            Perform
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</section>

<style>
  .panel {
    display: flex;
    flex-direction: column;
    gap: 10px;
    background: #f1ecff;
    border: 2px solid #a78bfa;
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
  }

  .hint {
    margin: 0;
    opacity: 0.7;
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  li {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    background: white;
    border-radius: 14px;
  }

  li div {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .desc {
    font-size: 0.9rem;
  }

  button {
    min-height: 44px;
    padding: 0 16px;
    border: none;
    border-radius: 12px;
    background: #7c5cff;
    color: white;
    font: inherit;
    font-weight: 700;
    cursor: pointer;
  }

  button:disabled {
    background: #c9c2d8;
    cursor: not-allowed;
  }
</style>
