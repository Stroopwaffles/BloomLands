<script lang="ts">
  import Art from '../../art/Art.svelte'
  import { itemName, TAG_NAMES } from '../../data/items'
  import type { CostEntry } from '../../data/types'
  import { available } from '../../engine/costs'
  import { formatNumber } from '../../engine/format'

  /** Shows what something costs, and how much of each the player has. */
  let { cost, stock }: { cost: readonly CostEntry[]; stock: Record<string, number> } = $props()
</script>

<ul>
  {#each cost as entry, i (i)}
    {@const have = available(stock, entry)}
    <li class:short={have < entry.amount}>
      {#if 'itemId' in entry}
        <Art id={entry.itemId} size={22} />
        <span>{itemName(entry.itemId)}</span>
      {:else}
        <Art id={`tag-${entry.tag}`} size={22} />
        <span>Any {TAG_NAMES[entry.tag] ?? entry.tag}</span>
      {/if}
      <span class="count">{formatNumber(have)}/{formatNumber(entry.amount)}</span>
    </li>
  {/each}
</ul>

<style>
  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 4px 12px;
    font-size: 0.9rem;
  }

  li {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .count {
    font-weight: 700;
    color: var(--leaf-deep);
  }

  .short .count {
    color: #b0413e;
  }
</style>
