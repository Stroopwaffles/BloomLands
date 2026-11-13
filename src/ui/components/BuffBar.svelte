<script lang="ts">
  import Art from '../../art/Art.svelte'
  import { itemName } from '../../data/items'
  import { POTIONS } from '../../data/recipes'
  import { formatDuration } from '../../engine/format'
  import { runtime } from '../game'

  const { game } = runtime
</script>

{#if $game.buffs.length > 0}
  <ul aria-label="Active potions">
    {#each $game.buffs as buff (buff.potionId)}
      <li title={POTIONS[buff.potionId]?.description}>
        <Art id={buff.potionId} size={22} />
        <span>{itemName(buff.potionId)}</span>
        <span class="time">{formatDuration(buff.remainingMs + 999)}</span>
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
    flex-wrap: wrap;
    gap: 6px;
  }

  li {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 2px 10px 2px 4px;
    background: white;
    border: 2px solid var(--petal);
    border-radius: 999px;
    font-size: 0.85rem;
    font-weight: 700;
  }

  .time {
    font-weight: 400;
  }
</style>
