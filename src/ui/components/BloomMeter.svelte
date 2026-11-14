<script lang="ts">
  import { BLOOM_LEVELS } from '../../data/bloom'
  import { REGIONS } from '../../data/world'
  import { bloomLevel } from '../../engine/modifiers'
  import { runtime } from '../game'

  /** A region's bloom: its level name and progress to the next level. */
  let { regionId, compact = false }: { regionId: string; compact?: boolean } = $props()

  const { game } = runtime
  const points = $derived($game.bloom[regionId] ?? 0)
  const level = $derived(bloomLevel($game, regionId))
  const next = $derived(BLOOM_LEVELS[level + 1])
  const from = $derived(BLOOM_LEVELS[level].points)
  const fraction = $derived(next ? (points - from) / (next.points - from) : 1)
</script>

<div class="bloom" class:compact>
  <div class="label">
    <span class="flower" aria-hidden="true"></span>
    <strong>{REGIONS[regionId]?.name} bloom:</strong>
    <span>{BLOOM_LEVELS[level].name}</span>
  </div>
  <div
    class="bar"
    role="progressbar"
    aria-label={`${REGIONS[regionId]?.name} bloom`}
    aria-valuemin={0}
    aria-valuemax={100}
    aria-valuenow={Math.round(fraction * 100)}
  >
    <div style:width="{fraction * 100}%"></div>
  </div>
  {#if !compact}
    <span class="hint">
      {#if next}
        {points - from} / {next.points - from} to {next.name}
      {:else}
        Fully flourishing!
      {/if}
    </span>
  {/if}
</div>

<style>
  .bloom {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 200px;
  }

  .label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.9rem;
  }

  .flower {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: radial-gradient(circle, #ffe59e 35%, var(--petal) 36%);
    border: 1px solid var(--petal-deep);
  }

  .bar {
    height: 10px;
    border-radius: 999px;
    background: var(--surface);
    border: 2px solid var(--petal);
    overflow: hidden;
  }

  .bar div {
    height: 100%;
    background: linear-gradient(90deg, var(--petal), #f2b45c);
    transition: width 0.3s;
  }

  .hint {
    font-size: 0.8rem;
    opacity: 0.75;
  }

  .compact .label {
    font-size: 0.8rem;
  }
</style>
