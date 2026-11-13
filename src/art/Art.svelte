<script lang="ts">
  import Placeholder from './Placeholder.svelte'
  import { getArt } from './registry'

  /** Draws the asset with this ID, or a placeholder if its art isn't made yet. */
  let { id, size = 64 }: { id: string; size?: number } = $props()

  const Real = $derived(getArt(id))
</script>

{#if Real}
  <Real {size} />
{:else}
  <Placeholder {id} {size} />
{/if}
