<script lang="ts">
  /** A row of color choices. */
  let {
    colors,
    value,
    label,
    onPick,
  }: { colors: readonly string[]; value: string; label: string; onPick: (color: string) => void } =
    $props()
</script>

<div class="swatches" role="radiogroup" aria-label={label}>
  {#each colors as color (color)}
    <button
      type="button"
      role="radio"
      aria-checked={color === value}
      aria-label={color}
      class:selected={color === value}
      style:background={color}
      onclick={() => onPick(color)}
    ></button>
  {/each}
</div>

<style>
  .swatches {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  button {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: 2px solid rgb(90 67 82 / 0.25);
    cursor: pointer;
  }

  button.selected {
    border: 3px solid var(--ink);
    box-shadow: 0 0 0 3px white inset;
  }
</style>
