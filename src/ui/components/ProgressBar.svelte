<script lang="ts">
  import { formatDuration } from '../../engine/format'

  let { totalMs, remainingMs, label }: { totalMs: number; remainingMs: number; label: string } =
    $props()

  const fraction = $derived(totalMs > 0 ? 1 - Math.max(0, remainingMs) / totalMs : 1)
</script>

<div class="wrap">
  <div class="text">
    <span>{label}</span>
    <span class="time">{formatDuration(Math.max(0, remainingMs) + 999)}</span>
  </div>
  <div
    class="bar"
    role="progressbar"
    aria-label={label}
    aria-valuemin={0}
    aria-valuemax={100}
    aria-valuenow={Math.round(fraction * 100)}
  >
    <div class="fill" style:width="{fraction * 100}%"></div>
  </div>
</div>

<style>
  .text {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    font-size: 0.9rem;
    font-weight: 700;
  }

  .time {
    font-weight: 400;
  }

  .bar {
    margin-top: 4px;
    height: 12px;
    border-radius: 999px;
    background: var(--surface);
    border: 2px solid var(--leaf);
    overflow: hidden;
  }

  .fill {
    height: 100%;
    background: var(--leaf);
    transition: width 0.1s linear;
  }
</style>
