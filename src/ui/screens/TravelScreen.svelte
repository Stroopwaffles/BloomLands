<script lang="ts">
  import Art from '../../art/Art.svelte'
  import { placeName } from '../../data/world'
  import { formatDuration } from '../../engine/format'
  import { runtime } from '../game'

  const { game } = runtime
  const travel = $derived($game.player.travel)
  const progress = $derived(travel ? 1 - Math.max(0, travel.remainingMs) / travel.totalMs : 1)
</script>

{#if travel}
  <div class="travel">
    <div class="fairy"><Art id="char-fairy" size={110} /></div>
    <h2>Flying to {placeName(travel.to)}…</h2>
    <div
      class="bar"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
    >
      <div class="fill" style:width="{progress * 100}%"></div>
    </div>
    <p>{formatDuration(Math.max(0, travel.remainingMs) + 999)} left</p>
  </div>
{/if}

<style>
  .travel {
    min-height: calc(100vh - 70px);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 16px;
    background: linear-gradient(#cfe9ff, var(--cream));
  }

  .fairy {
    animation: bob 1.6s ease-in-out infinite;
  }

  h2 {
    margin: 0;
  }

  .bar {
    width: min(420px, 90%);
    height: 16px;
    border-radius: 999px;
    background: white;
    border: 2px solid var(--leaf);
    overflow: hidden;
  }

  .fill {
    height: 100%;
    background: var(--leaf);
    transition: width 0.1s linear;
  }

  p {
    margin: 0;
    opacity: 0.8;
  }

  @keyframes bob {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-12px);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .fairy {
      animation: none;
    }
  }
</style>
