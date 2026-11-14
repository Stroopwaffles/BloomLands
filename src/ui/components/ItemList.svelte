<script lang="ts">
  import Art from '../../art/Art.svelte'
  import { itemName } from '../../data/items'
  import type { Snippet } from 'svelte'
  import { formatNumber } from '../../engine/format'

  let {
    items,
    empty = 'Nothing here yet.',
    action,
  }: {
    items: Record<string, number>
    empty?: string
    /** Optional controls shown at the end of each item's row. */
    action?: Snippet<[string, number]>
  } = $props()

  const entries = $derived(Object.entries(items).sort(([a], [b]) => a.localeCompare(b)))
</script>

{#if entries.length === 0}
  <p class="empty">{empty}</p>
{:else}
  <ul class:with-action={!!action}>
    {#each entries as [itemId, amount] (itemId)}
      <li>
        <Art id={itemId} size={36} />
        <span class="name">{itemName(itemId)}</span>
        <span class="amount">{formatNumber(amount)}</span>
        {#if action}{@render action(itemId, amount)}{/if}
      </li>
    {/each}
  </ul>
{/if}

<style>
  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 8px;
  }

  /* Rows with buttons need more room. */
  ul.with-action {
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 270px), 1fr));
  }

  li {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    background: var(--surface);
    border-radius: 12px;
  }

  .name {
    flex: 1;
  }

  .amount {
    font-weight: 700;
  }

  .empty {
    margin: 0;
    opacity: 0.7;
  }
</style>
