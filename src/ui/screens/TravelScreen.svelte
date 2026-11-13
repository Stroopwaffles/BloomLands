<script lang="ts">
  import Art from '../../art/Art.svelte'
  import { onMount } from 'svelte'
  import { CREWS, FLIGHT_EVENT_RULES } from '../../data/challenges'
  import { HOME, placeName } from '../../data/world'
  import { activeFlightEvent } from '../../engine/flightEvents'
  import { formatDuration } from '../../engine/format'
  import SpellButtons from '../components/SpellButtons.svelte'
  import { runtime } from '../game'

  const { game } = runtime
  const travel = $derived($game.player.travel)
  const progress = $derived(travel ? 1 - Math.max(0, travel.remainingMs) / travel.totalMs : 1)
  const event = $derived(activeFlightEvent($game))
  const gust = $derived(
    travel?.event?.kind === 'gust' && travel.event.resolved ? travel.event : null,
  )

  let result = $state('')
  onMount(() =>
    runtime.onEvents((events) => {
      for (const e of events) if (e.type === 'flight-event') result = e.result
    }),
  )

  function tapEvent(e: PointerEvent) {
    e.preventDefault()
    runtime.dispatch({ type: 'flight/tap' })
  }
</script>

{#if travel}
  <div class="travel">
    <div class="fairy"><Art id="char-fairy" size={110} /></div>
    <h2>{travel.to === HOME ? 'Flying home' : `Flying to ${placeName(travel.to)}`}…</h2>
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

    {#if event?.kind === 'ambush'}
      <section class="event ambush" role="alert">
        <strong
          >{CREWS[event.crewId ?? 'dandelion-drifters']?.name ?? 'Pirates'} swoop in to raid your satchel!</strong
        >
        <span
          >Tap to shoo them ({FLIGHT_EVENT_RULES.ambushTaps - event.taps} more) or cast Gust.</span
        >
        <button type="button" class="tap" onpointerdown={tapEvent}>
          <Art id={`crew-${event.crewId ?? 'dandelion-drifters'}`} size={64} />
          Shoo!
        </button>
        <SpellButtons targets={['ambush']} />
      </section>
    {:else if event?.kind === 'seeds'}
      <section class="event seeds">
        <strong>Dandelion seeds drift by!</strong>
        <span>Tap to catch them ({FLIGHT_EVENT_RULES.seedsMax - event.taps} left).</span>
        <button type="button" class="tap" onpointerdown={tapEvent}>
          <Art id="event-seeds" size={64} />
          Catch!
        </button>
      </section>
    {:else if event?.kind === 'traveler'}
      <section class="event traveler">
        <strong>A lost beetle asks you the way home.</strong>
        <button type="button" class="tap" onpointerdown={tapEvent}>
          <Art id="event-lost-beetle" size={64} />
          Show the way
        </button>
      </section>
    {:else if gust}
      <section class="event gust">
        <strong
          >{gust.tailwind ? 'A tailwind carries you along!' : 'A headwind slows you down.'}</strong
        >
      </section>
    {/if}
    {#if result}<p class="result" role="status">{result}</p>{/if}
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

  .event {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    width: min(460px, 92%);
    padding: 14px;
    border-radius: 20px;
    background: rgb(255 255 255 / 0.9);
    border: 2px solid var(--honey);
    text-align: center;
  }

  .event.ambush {
    border-color: #c97a8c;
  }

  .tap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    min-width: 140px;
    padding: 8px 18px;
    border: none;
    border-radius: 16px;
    background: var(--petal);
    color: var(--ink);
    font: inherit;
    font-weight: 700;
    cursor: pointer;
    touch-action: manipulation;
  }

  .tap:active {
    transform: scale(0.96);
  }

  .result {
    font-weight: 700;
    color: var(--leaf-deep);
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
    .event {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      width: min(460px, 92%);
      padding: 14px;
      border-radius: 20px;
      background: rgb(255 255 255 / 0.9);
      border: 2px solid var(--honey);
      text-align: center;
    }

    .event.ambush {
      border-color: #c97a8c;
    }

    .tap {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      min-width: 140px;
      padding: 8px 18px;
      border: none;
      border-radius: 16px;
      background: var(--petal);
      color: var(--ink);
      font: inherit;
      font-weight: 700;
      cursor: pointer;
      touch-action: manipulation;
    }

    .tap:active {
      transform: scale(0.96);
    }

    .result {
      font-weight: 700;
      color: var(--leaf-deep);
    }

    .fairy {
      animation: none;
    }
  }
</style>
