<script lang="ts">
  import Art from '../../art/Art.svelte'
  import { PLANTS } from '../../data/plants'
  import type { Point } from '../../data/scenes'
  import { formatDuration } from '../../engine/format'
  import type { SlotState } from '../../engine/state'

  /** One plant standing in the scene. The whole plant (with a generous margin) is the tap target. */
  let {
    slot,
    at,
    wiggle,
    disabled,
    onTap,
  }: { slot: SlotState; at: Point; wiggle: number; disabled: boolean; onTap: () => void } = $props()

  const plant = $derived(slot.plantId ? PLANTS[slot.plantId] : null)
  const pests = $derived(slot.pests ?? 0)
  const hpFraction = $derived(plant ? slot.hp / plant.toughness : 0)

  function onPointerDown(event: PointerEvent) {
    // pointerdown (not click) so fast taps and several fingers at once all count.
    event.preventDefault()
    if (!disabled) onTap()
  }
</script>

<div class="plant-spot" style:left="{at.x}%" style:top="{at.y}%">
  {#if plant}
    <button
      type="button"
      class="plant"
      class:disabled
      aria-label={pests > 0 ? `Tap aphids off the ${plant.name}` : `Tap the ${plant.name}`}
      onpointerdown={onPointerDown}
      onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && !disabled && onTap()}
    >
      {#key wiggle}
        <span class="art" class:wiggle={wiggle > 0}><Art id={plant.id} size={120} /></span>
      {/key}
      {#if pests > 0}
        <span class="pests" aria-hidden="true">
          {#each Array.from({ length: pests }, (_, i) => i) as i (i)}
            <span class="aphid" style:--i={i}><Art id="pest-aphid" size={26} /></span>
          {/each}
        </span>
      {/if}
      {#if plant.toughness > 1 && hpFraction < 1}
        <span class="hp" aria-hidden="true"><span style:width="{hpFraction * 100}%"></span></span>
      {/if}
      <span class="label">{plant.name}</span>
    </button>
  {:else}
    <div class="regrowing" aria-label="Regrowing">
      <span class="art small"><Art id="plant-sprout" size={60} /></span>
      <span class="timer">{formatDuration(slot.regrowMs + 999)}</span>
    </div>
  {/if}
</div>

<style>
  .plant-spot {
    position: absolute;
    width: 18%;
    transform: translate(-50%, -96%);
    display: flex;
    justify-content: center;
  }

  .plant {
    position: relative;
    width: 100%;
    min-width: 48px;
    min-height: 48px;
    padding: 6% 6% 0;
    border: none;
    border-radius: 30%;
    background: transparent;
    cursor: pointer;
    touch-action: manipulation;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .plant:focus-visible {
    outline: 3px solid var(--leaf-deep);
  }

  .plant.disabled {
    cursor: not-allowed;
    opacity: 0.75;
  }

  .art :global(svg) {
    width: 100%;
    height: auto;
  }

  .art {
    display: block;
    width: 100%;
    filter: drop-shadow(0 3px 2px rgb(60 90 50 / 0.25));
  }

  .art.small {
    width: 55%;
  }

  .plant:active .art {
    transform: scale(0.95);
  }

  .wiggle {
    animation: wiggle 0.25s ease-out;
    transform-origin: 50% 95%;
  }

  @keyframes wiggle {
    30% {
      transform: rotate(-7deg) scale(0.95);
    }
    60% {
      transform: rotate(5deg) scale(1.03);
    }
  }

  .label {
    position: absolute;
    bottom: -1.4em;
    left: 50%;
    transform: translateX(-50%);
    white-space: nowrap;
    font-size: clamp(0.65rem, 1.3vw, 0.85rem);
    font-weight: 700;
    color: var(--ink);
    background: rgb(255 255 255 / 0.75);
    padding: 0 6px;
    border-radius: 999px;
    pointer-events: none;
  }

  .hp {
    position: absolute;
    bottom: 2%;
    left: 20%;
    width: 60%;
    height: 6px;
    border-radius: 999px;
    background: rgb(255 255 255 / 0.8);
    overflow: hidden;
  }

  .hp span {
    display: block;
    height: 100%;
    background: var(--petal-deep);
    transition: width 0.1s;
  }

  .pests {
    position: absolute;
    inset: 15% 10% 30%;
    pointer-events: none;
  }

  .aphid {
    position: absolute;
    left: calc(15% + var(--i) * 26%);
    top: calc(10% + var(--i) * 18%);
    width: 26%;
    animation: crawl 1.6s ease-in-out infinite alternate;
  }

  .aphid :global(svg) {
    width: 100%;
    height: auto;
  }

  @keyframes crawl {
    to {
      transform: translate(4px, -3px) rotate(8deg);
    }
  }

  .regrowing {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    opacity: 0.85;
  }

  .timer {
    font-size: clamp(0.6rem, 1.2vw, 0.8rem);
    font-weight: 700;
    background: rgb(255 255 255 / 0.7);
    padding: 0 6px;
    border-radius: 999px;
  }

  @media (prefers-reduced-motion: reduce) {
    .wiggle,
    .aphid {
      animation: none;
    }
  }
</style>
