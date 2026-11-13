<script lang="ts">
  import Art from '../../art/Art.svelte'
  import { PLANTS } from '../../data/plants'
  import { formatDuration } from '../../engine/format'
  import type { SlotState } from '../../engine/state'

  let {
    slot,
    wiggle,
    disabled,
    onTap,
  }: { slot: SlotState; wiggle: number; disabled: boolean; onTap: () => void } = $props()

  const plant = $derived(slot.plantId ? PLANTS[slot.plantId] : null)
  const hpFraction = $derived(plant ? slot.hp / plant.toughness : 0)

  function onPointerDown(event: PointerEvent) {
    // pointerdown (not click) so fast taps and several fingers at once all count.
    event.preventDefault()
    if (!disabled) onTap()
  }
</script>

{#if plant}
  <button
    type="button"
    class="slot"
    class:disabled
    aria-label={`Tap ${plant.name}`}
    onpointerdown={onPointerDown}
    onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && !disabled && onTap()}
  >
    {#key wiggle}
      <span class="plant" class:wiggle={wiggle > 0}><Art id={plant.id} size={84} /></span>
    {/key}
    <span class="name">{plant.name}</span>
    {#if plant.toughness > 1}
      <span class="hp" aria-hidden="true"><span style:width="{hpFraction * 100}%"></span></span>
    {/if}
  </button>
{:else}
  <div class="slot empty" aria-label="Regrowing">
    <Art id="plant-sprout" size={56} />
    <span class="name">Regrowing · {formatDuration(slot.regrowMs + 999)}</span>
  </div>
{/if}

<style>
  .slot {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    min-height: 150px;
    padding: 10px;
    border: 2px solid var(--leaf);
    border-radius: 20px;
    background: rgb(255 255 255 / 0.7);
    color: var(--ink);
    font: inherit;
    cursor: pointer;
    touch-action: manipulation;
  }

  .slot:active:not(.empty) {
    transform: scale(0.97);
  }

  .slot.disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  .empty {
    border-style: dashed;
    cursor: default;
    opacity: 0.7;
  }

  .name {
    font-weight: 700;
    font-size: 0.95rem;
  }

  .hp {
    width: 70%;
    height: 8px;
    border-radius: 999px;
    background: rgb(0 0 0 / 0.08);
    overflow: hidden;
  }

  .hp span {
    display: block;
    height: 100%;
    background: var(--petal-deep);
    transition: width 0.1s;
  }

  .plant.wiggle {
    display: inline-block;
    animation: wiggle 0.25s ease-out;
  }

  @keyframes wiggle {
    0% {
      transform: rotate(0) scale(1);
    }
    30% {
      transform: rotate(-8deg) scale(0.94);
    }
    60% {
      transform: rotate(6deg) scale(1.03);
    }
    100% {
      transform: rotate(0) scale(1);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .plant.wiggle {
      animation: none;
    }
  }
</style>
