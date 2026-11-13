<script lang="ts">
  import { WEATHER } from '../../data/challenges'
  import { PHASE_STARTS } from '../../data/time'
  import { dayPhase, regionOf } from '../../engine/environment'
  import { runtime } from '../game'

  /** Time of day and the weather where the player is. */
  const { game } = runtime
  const phase = $derived(dayPhase($game))
  const phaseName = $derived(PHASE_STARTS.find((p) => p.phase === phase)?.name ?? '')
  const weather = $derived(
    WEATHER[
      $game.weather[regionOf($game.player.travel?.to ?? $game.player.place)]?.kind ?? 'sunshine'
    ],
  )
</script>

<div class="sky" class:night={phase === 'night'} title={weather.description}>
  <span class="dot" aria-hidden="true"></span>
  <span>{phaseName}</span>
  <span class="sep">·</span>
  <span>{weather.name}</span>
</div>

<style>
  .sky {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 12px;
    border-radius: 999px;
    background: #fff3c4;
    border: 2px solid var(--honey);
    font-size: 0.85rem;
    font-weight: 700;
    white-space: nowrap;
  }

  .sky.night {
    background: #2a2763;
    border-color: #4c3a99;
    color: #f5f0ff;
  }

  .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #f2b45c;
  }

  .night .dot {
    background: #fff3b0;
    box-shadow: 0 0 6px #fff3b0;
  }

  .sep {
    opacity: 0.5;
  }
</style>
