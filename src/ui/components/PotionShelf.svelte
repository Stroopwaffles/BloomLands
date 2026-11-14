<script lang="ts">
  import Art from '../../art/Art.svelte'
  import { itemName } from '../../data/items'
  import { POTIONS } from '../../data/recipes'
  import { formatDuration, formatNumber } from '../../engine/format'
  import { runtime } from '../game'

  const { game } = runtime

  const owned = $derived(
    Object.keys(POTIONS).filter((potionId) => ($game.inventory[potionId] ?? 0) > 0),
  )
</script>

{#if owned.length === 0}
  <p class="hint">No potions yet. Research brewing, then brew them in the cauldron.</p>
{:else}
  <ul>
    {#each owned as potionId (potionId)}
      <li>
        <Art id={potionId} size={40} />
        <div class="info">
          <strong>{itemName(potionId)} × {formatNumber($game.inventory[potionId])}</strong>
          <span>
            {POTIONS[potionId].description} for {formatDuration(POTIONS[potionId].durationMs)}
          </span>
        </div>
        <button type="button" onclick={() => runtime.dispatch({ type: 'potion/drink', potionId })}>
          Drink
        </button>
      </li>
    {/each}
  </ul>
{/if}

<style>
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
    padding: 8px 10px;
    background: var(--surface);
    border-radius: 14px;
  }

  .info {
    flex: 1;
    display: flex;
    flex-direction: column;
    font-size: 0.9rem;
  }

  .hint {
    margin: 0;
    opacity: 0.7;
  }

  button {
    min-height: 44px;
    padding: 0 16px;
    border: none;
    border-radius: 12px;
    background: var(--petal-deep);
    color: white;
    font: inherit;
    font-weight: 700;
    cursor: pointer;
  }
</style>
