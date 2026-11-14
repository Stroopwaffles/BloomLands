<script lang="ts">
  /** A row of labeled choices (shapes, styles). */
  let {
    options,
    value,
    label,
    onPick,
  }: {
    options: readonly { id: string; name: string }[]
    value: string | null
    label: string
    onPick: (id: string) => void
  } = $props()
</script>

<div class="choices" role="radiogroup" aria-label={label}>
  {#each options as option (option.id)}
    <button
      type="button"
      role="radio"
      aria-checked={option.id === value}
      class:selected={option.id === value}
      onclick={() => onPick(option.id)}
    >
      {option.name}
    </button>
  {/each}
</div>

<style>
  .choices {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  button {
    min-height: 44px;
    padding: 0 14px;
    border: 2px solid var(--honey);
    border-radius: 12px;
    background: var(--surface);
    color: var(--ink);
    font: inherit;
    cursor: pointer;
  }

  button.selected {
    background: var(--honey);
    font-weight: 700;
  }
</style>
