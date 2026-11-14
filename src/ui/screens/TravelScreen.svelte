<script lang="ts">
  import { onMount } from 'svelte'
  import { fade } from 'svelte/transition'
  import Art from '../../art/Art.svelte'
  import SceneBackdrop from '../../art/SceneBackdrop.svelte'
  import { CREWS, FLIGHT_EVENT_RULES } from '../../data/challenges'
  import { HOME, placeName, placeRegion, REGIONS } from '../../data/world'
  import { isNight } from '../../engine/environment'
  import { activeFlightEvent, eventFlavor } from '../../engine/flightEvents'
  import { formatDuration } from '../../engine/format'
  import { legAt, legName, SPIRIT_PATH } from '../../engine/route'
  import SpellButtons from '../components/SpellButtons.svelte'
  import { runtime } from '../game'

  /**
   * In flight: a route strip of the regions you pass over, the scenery of the region below, and
   * whatever happens along the way.
   */
  const { game } = runtime
  const travel = $derived($game.player.travel)
  const progress = $derived(travel ? 1 - Math.max(0, travel.remainingMs) / travel.totalMs : 1)
  const event = $derived(activeFlightEvent($game))
  const flavor = $derived(eventFlavor(event?.regionId))
  const gust = $derived(
    travel?.event?.kind === 'gust' && travel.event.resolved ? travel.event : null,
  )
  /** Older flights (from before routes) count as one leg over the destination's region. */
  const legs = $derived(
    travel?.legs?.length ? travel.legs : [{ regionId: placeRegion(travel?.to ?? HOME), share: 1 }],
  )
  const legIndex = $derived(legAt(legs, progress))
  const below = $derived(legs[legIndex]?.regionId ?? 'meadow')
  const onPath = $derived(below === SPIRIT_PATH)
  const night = $derived(isNight($game))

  let result = $state('')
  /** A short note when you cross into a new region. */
  let crossing = $state('')
  let lastLeg = -1
  let crossingTimer: ReturnType<typeof setTimeout> | undefined
  $effect(() => {
    const index = legIndex
    if (lastLeg >= 0 && index !== lastLeg) {
      crossing = onPath ? 'Onto the Spirit Path' : `Crossing into the ${legName(below)}`
      clearTimeout(crossingTimer)
      crossingTimer = setTimeout(() => (crossing = ''), 2500)
    }
    lastLeg = index
  })

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
    {#key below}
      <div class="backdrop" transition:fade={{ duration: 900 }} aria-hidden="true">
        {#if onPath}
          <div class="spirit-sky"></div>
        {:else}
          <SceneBackdrop
            spotId={REGIONS[below]?.sceneSpot ?? 'buttercup-rise'}
            {night}
            weather={$game.weather[below]?.kind ?? 'sunshine'}
          />
        {/if}
      </div>
    {/key}

    <div class="content">
      <div class="fairy"><Art id="char-fairy" size={110} /></div>
      <h2>{travel.to === HOME ? 'Flying home' : `Flying to ${placeName(travel.to)}`}…</h2>

      <div class="route" aria-label="Your route">
        <div class="strip">
          {#each legs as leg, i (i)}
            <span
              class="leg"
              class:now={i === legIndex}
              class:done={i < legIndex}
              class:path={leg.regionId === SPIRIT_PATH}
              style:flex-grow={leg.share}
            >
              {legName(leg.regionId)}
            </span>
          {/each}
          <span class="marker" style:left="{progress * 100}%" aria-hidden="true">
            <Art id="char-fairy" size={28} />
          </span>
        </div>
        <p class="over">
          {onPath ? 'Gliding along the Spirit Path' : `Over the ${legName(below)}`} ·
          {formatDuration(Math.max(0, travel.remainingMs) + 999)} left
        </p>
      </div>

      {#if crossing}<p class="crossing" role="status">{crossing}</p>{/if}

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
      {:else if event?.kind === 'windfall'}
        <section class="event">
          <strong>{flavor.windfall.text}</strong>
          <span>Tap to catch them ({flavor.windfall.max - event.taps} left).</span>
          <button type="button" class="tap" onpointerdown={tapEvent}>
            <Art id={flavor.windfall.art} size={64} />
            Catch!
          </button>
        </section>
      {:else if event?.kind === 'traveler'}
        <section class="event">
          <strong>{flavor.traveler.text}</strong>
          <button type="button" class="tap" onpointerdown={tapEvent}>
            <Art id={flavor.traveler.art} size={64} />
            Show the way
          </button>
        </section>
      {:else if event?.kind === 'snag'}
        <section class="event ambush" role="alert">
          <strong>A bramble snags your wing!</strong>
          <span
            >You're flying at half speed. Tap to pull free ({FLIGHT_EVENT_RULES.snagTaps -
              event.taps} more).</span
          >
          <button type="button" class="tap" onpointerdown={tapEvent}>
            <Art id="event-snag" size={64} />
            Pull free!
          </button>
        </section>
      {:else if event?.kind === 'wisp'}
        <section class="event">
          <strong>A will-o'-wisp bobs ahead, beckoning.</strong>
          <span>Follow it for a shortcut, or keep to your course.</span>
          <button type="button" class="tap" onpointerdown={tapEvent}>
            <Art id="event-wisp" size={64} />
            Follow it
          </button>
        </section>
      {:else if gust}
        <section class="event">
          <strong
            >{gust.tailwind
              ? 'A tailwind carries you along!'
              : 'A headwind slows you down.'}</strong
          >
        </section>
      {/if}
      {#if result}<p class="result" role="status">{result}</p>{/if}
    </div>
  </div>
{/if}

<style>
  .travel {
    position: relative;
    min-height: calc(100vh - 70px);
    overflow: hidden;
  }

  .backdrop {
    position: absolute;
    inset: 0;
    opacity: 0.85;
  }

  .spirit-sky {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 30% 30%, rgb(255 243 176 / 0.6), transparent 40%),
      radial-gradient(circle at 70% 60%, rgb(205 187 245 / 0.6), transparent 45%),
      linear-gradient(#3d3a7a, #8a7ac9);
  }

  .content {
    position: relative;
    min-height: calc(100vh - 70px);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 16px;
  }

  h2 {
    margin: 0;
    padding: 2px 14px;
    border-radius: 12px;
    background: rgb(var(--cream-rgb) / 0.85);
  }

  .route {
    width: min(520px, 94%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }

  .strip {
    position: relative;
    display: flex;
    width: 100%;
    gap: 3px;
  }

  .leg {
    flex-basis: 0;
    min-width: 0;
    padding: 6px 4px;
    border-radius: 10px;
    background: rgb(var(--surface-rgb) / 0.65);
    border: 2px solid rgb(var(--surface-rgb) / 0.9);
    font-size: 0.8rem;
    font-weight: 700;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .leg.done {
    opacity: 0.55;
  }

  .leg.now {
    background: var(--leaf);
    border-color: var(--leaf-deep);
    color: white;
  }

  .leg.path {
    background: #e9ddff;
    border-color: #cdbbf5;
  }

  .leg.path.now {
    background: #9a86cf;
    color: white;
  }

  .marker {
    position: absolute;
    top: -26px;
    transform: translateX(-50%);
    transition: left 0.2s linear;
  }

  .over {
    margin: 0;
    padding: 2px 12px;
    border-radius: 10px;
    background: rgb(var(--cream-rgb) / 0.85);
    font-weight: 700;
  }

  .crossing {
    margin: 0;
    padding: 6px 16px;
    border-radius: 999px;
    background: #fff3c4;
    border: 2px solid var(--honey);
    font-weight: 700;
    animation: pop-in 0.4s ease-out;
  }

  .event {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    width: min(460px, 92%);
    padding: 14px;
    border-radius: 20px;
    background: rgb(var(--surface-rgb) / 0.92);
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
    margin: 0;
    padding: 2px 12px;
    border-radius: 10px;
    background: rgb(var(--cream-rgb) / 0.9);
    font-weight: 700;
    color: var(--leaf-deep);
  }

  .fairy {
    animation: bob 1.6s ease-in-out infinite;
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

  @keyframes pop-in {
    from {
      transform: scale(0.8);
      opacity: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .fairy,
    .crossing {
      animation: none;
    }

    .marker {
      transition: none;
    }
  }

  /* Night: the crossing note and Spirit Path legs dim to match the night theme. */
  :global([data-theme='night']) .crossing {
    background: var(--surface);
  }

  :global([data-theme='night']) .leg.path {
    background: #3a3070;
    border-color: #6a5aa8;
  }

  :global([data-theme='night']) .leg.path.now {
    background: #6a5aa8;
  }
</style>
