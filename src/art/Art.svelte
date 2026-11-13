<script lang="ts">
  import Placeholder from './Placeholder.svelte'
  import { getArt, getSvgArt } from './registry'

  /** Draws the asset with this ID, or a placeholder if its art isn't made yet. */
  let { id, size = 64 }: { id: string; size?: number } = $props()

  const Real = $derived(getArt(id))
  const svg = $derived(Real ? null : getSvgArt(id))
</script>

{#if Real}
  <Real {size} />
{:else if svg}
  <svg
    class="art"
    width={size}
    height={size}
    viewBox="0 0 100 100"
    role="img"
    aria-hidden="true"
    data-asset-id={id}
  >
    <!-- Art markup is static data from src/art/library, never player input. -->
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html svg}
  </svg>
{:else}
  <Placeholder {id} {size} />
{/if}

<style>
  .art {
    display: block;
    overflow: visible;
  }
</style>
