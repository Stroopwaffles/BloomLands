<script lang="ts">
  import { DAY_MS, PHASE_STARTS } from '../../data/time'
  import {
    dayPhase,
    DAYTIME_MS,
    describeWeather,
    nextPhase,
    NIGHTTIME_MS,
    regionOf,
    untilDayChange,
    weatherIn,
  } from '../../engine/environment'
  import { formatDuration } from '../../engine/format'
  import { hasQol } from '../../engine/modifiers'
  import { runtime } from '../game'

  /** Time of day and the weather where the player is. The Dandelion Clock adds a countdown. */
  const { game } = runtime
  const phase = $derived(dayPhase($game))
  const phaseName = $derived(PHASE_STARTS.find((p) => p.phase === phase)?.name ?? '')
  const weather = $derived(
    describeWeather(
      weatherIn($game, regionOf($game.player.travel?.to ?? $game.player.place)),
      phase,
    ),
  )
  const clock = $derived(hasQol($game, 'clock'))
  const next = $derived(nextPhase($game))
  const change = $derived(untilDayChange($game))

  /** Rounds up to the minute for the badge, so it doesn't tick every second. */
  const roughly = (ms: number) => (ms < 60_000 ? '<1m' : `${Math.ceil(ms / 60_000)}m`)

  let open = $state(false)

  /** The day as coloured stretches, for the clock's timeline. */
  const segments = PHASE_STARTS.map((p, i) => ({
    ...p,
    width: ((PHASE_STARTS[i + 1]?.at ?? 1) - p.at) * 100,
  }))
  const marker = $derived(($game.time.dayMs / DAY_MS) * 100)
</script>

{#if clock}
  <div class="wrap">
    <button
      type="button"
      class="sky"
      class:night={phase === 'night'}
      title={weather.description}
      aria-expanded={open}
      onclick={() => (open = !open)}
    >
      <span class="dot" aria-hidden="true"></span>
      <span>{phaseName}</span>
      <span class="sep">·</span>
      <span>{weather.name}</span>
      <span class="sep">·</span>
      <span class="count">{next.name} in {roughly(next.inMs)}</span>
    </button>
    {#if open}
      <div class="clock" role="dialog" aria-label="Dandelion Clock">
        <div class="timeline" aria-hidden="true">
          {#each segments as s (s.phase)}
            <span class="seg {s.phase}" style:width="{s.width}%" title={s.name}></span>
          {/each}
          <span class="marker" style:left="{marker}%"></span>
        </div>
        <div class="labels">
          <span style:width="{(DAYTIME_MS / DAY_MS) * 100}%"
            >Day · {formatDuration(DAYTIME_MS)}</span
          >
          <span style:width="{(NIGHTTIME_MS / DAY_MS) * 100}%"
            >Night · {formatDuration(NIGHTTIME_MS)}</span
          >
        </div>
        <p>
          <strong
            >{change.to === 'night' ? 'Nightfall' : 'Dawn'} in {formatDuration(change.inMs)}</strong
          >
          {#if next.phase !== 'dawn' && next.phase !== 'night'}
            <br />
            {next.name} begins in {formatDuration(next.inMs)}.
          {/if}
        </p>
        <p class="lengths">A full day lasts {formatDuration(DAY_MS)}.</p>
        <p class="weather"><strong>{weather.name}:</strong> {weather.description}</p>
      </div>
    {/if}
  </div>
{:else}
  <div class="sky" class:night={phase === 'night'} title={weather.description}>
    <span class="dot" aria-hidden="true"></span>
    <span>{phaseName}</span>
    <span class="sep">·</span>
    <span>{weather.name}</span>
  </div>
{/if}

<style>
  .wrap {
    position: relative;
  }

  .sky {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 12px;
    border-radius: 999px;
    background: #fff3c4;
    border: 2px solid var(--honey);
    color: var(--ink);
    font: inherit;
    font-size: 0.85rem;
    font-weight: 700;
    white-space: nowrap;
  }

  button.sky {
    min-height: 36px;
    cursor: pointer;
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

  .count {
    font-weight: 600;
    opacity: 0.85;
  }

  .clock {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    z-index: 30;
    width: min(320px, 90vw);
    padding: 14px;
    border-radius: 18px;
    background: var(--cream, #fffaf0);
    border: 2px solid var(--honey);
    box-shadow: 0 8px 24px rgb(90 67 82 / 0.2);
    font-size: 0.88rem;
    white-space: normal;
  }

  .timeline {
    position: relative;
    display: flex;
    height: 14px;
    border-radius: 999px;
    overflow: hidden;
  }

  .seg.dawn {
    background: #f7c6a3;
  }
  .seg.morning {
    background: #ffe59e;
  }
  .seg.afternoon {
    background: #ffd27a;
  }
  .seg.dusk {
    background: #e79a8a;
  }
  .seg.night {
    background: #3a3670;
  }

  .marker {
    position: absolute;
    top: -2px;
    bottom: -2px;
    width: 4px;
    margin-left: -2px;
    border-radius: 2px;
    background: white;
    box-shadow: 0 0 0 1.5px var(--ink);
  }

  .labels {
    display: flex;
    margin-top: 4px;
    font-size: 0.72rem;
    opacity: 0.75;
  }

  .labels span {
    white-space: nowrap;
  }

  p {
    margin: 10px 0 0;
  }

  .lengths,
  .weather {
    opacity: 0.85;
  }
</style>
