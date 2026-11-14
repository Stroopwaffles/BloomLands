<script lang="ts" module>
  /** Whether the map is open, shared by every screen for the whole visit. */
  let mapOpen = $state(true)
</script>

<script lang="ts">
  import { onMount } from 'svelte'
  import Art from '../../art/Art.svelte'
  import { CREATURES, CREWS } from '../../data/challenges'
  import { COURT_RANKS } from '../../data/economy'
  import { RITUALS } from '../../data/magic'
  import { MAP_ISLANDS } from '../../data/map'
  import {
    HOME,
    isSettlement,
    isSpiritPlace,
    placeName,
    placeRegion,
    REGION_ORDER,
    REGIONS,
    SPOTS,
  } from '../../data/world'
  import { dayPhase, describeWeather, weatherIn } from '../../engine/environment'
  import { formatDuration } from '../../engine/format'
  import { knownRituals } from '../../engine/magic'
  import { courtRank, satchelCapacity, satchelMountAway } from '../../engine/modifiers'
  import { countItems } from '../../engine/state'
  import { placeOpen, regionReachable } from '../../engine/regions'
  import { flightBreakdown, pathNodes } from '../../engine/route'
  import { playSound } from '../../audio/sfx'
  import { runtime } from '../game'

  /**
   * The world map (replaces the old list of flights). Regions are islands in a chain; tap a place
   * to see how long the flight takes and why, then fly. Tapping the chosen place again flies too.
   */
  const { game } = runtime
  const here = $derived($game.player.place)
  const phase = $derived(dayPhase($game))

  /** Open regions, then the next closed one (drawn in fog). */
  const nextLocked = $derived(REGION_ORDER.find((id) => !regionReachable($game, id)) ?? null)
  const islands = $derived(
    REGION_ORDER.filter(
      (id) => (regionReachable($game, id) || id === nextLocked) && MAP_ISLANDS[id],
    ),
  )
  const total = $derived(islands.length * 100)

  /** A place's position on the whole map, in map units (100 per island). */
  function pos(placeId: string): { x: number; y: number } | null {
    const regionId = placeRegion(placeId)
    const index = islands.indexOf(regionId)
    const spot = MAP_ISLANDS[regionId]?.places[placeId]
    if (index < 0 || !spot) return null
    return { x: index * 100 + spot.x, y: spot.y }
  }

  function placesOn(regionId: string): string[] {
    if (!regionReachable($game, regionId)) return []
    return Object.keys(MAP_ISLANDS[regionId].places).filter((id) => placeOpen($game, id))
  }

  type Kind = 'home' | 'settlement' | 'spirit' | 'secret' | 'spot'
  function kindOf(placeId: string): Kind {
    if (placeId === HOME) return 'home'
    if (isSettlement(placeId)) return 'settlement'
    if (isSpiritPlace(placeId)) return 'spirit'
    if (SPOTS[placeId]?.secret) return 'secret'
    return 'spot'
  }
  const KIND_NAME: Record<Kind, string> = {
    home: 'Your home',
    settlement: 'Village',
    spirit: "Spirit's resting place",
    secret: 'Secret place',
    spot: 'Harvesting spot',
  }

  /** Spirit Path lines: from home to every awakened spirit's resting place. */
  const paths = $derived(
    pathNodes($game)
      .filter((id) => id !== HOME)
      .map((id) => ({ a: pos(HOME), b: pos(id) }))
      .filter((p) => p.a && p.b) as { a: { x: number; y: number }; b: { x: number; y: number } }[],
  )

  let selected = $state<string | null>(null)
  const breakdown = $derived(
    selected && selected !== here && !selected.startsWith('locked:')
      ? flightBreakdown($game, here, selected)
      : null,
  )

  function fly(placeId: string) {
    runtime.dispatch({ type: 'travel/go', to: placeId })
    selected = null
  }

  /**
   * A place is chosen the moment it's pressed. Waiting for a full click lost taps: if the pointer
   * ended up over something else by the time it was released (a wobble, a neighbour's label), the
   * browser dropped the click and nothing was selected. Choosing never flies by itself; the card's
   * Fly button does that.
   */
  function choose(placeId: string) {
    if (selected !== placeId) playSound('select')
    selected = placeId
  }

  function onPress(e: PointerEvent, placeId: string) {
    if (e.button !== 0) return
    choose(placeId)
  }

  /** Keyboard (Enter/Space) activates with a click but no press. */
  function onKeyClick(e: MouseEvent, placeId: string) {
    if (e.detail === 0) choose(placeId)
  }

  function quick(placeId: string): string {
    const b = flightBreakdown($game, here, placeId)
    return b ? formatDuration(b.totalMs) : ''
  }

  const knowsRite = (ritualId: string) => knownRituals($game).includes(ritualId)
  const pct = (n: number) => `${(n / total) * 100}%`
  const times = (f: number) => `×${Number(f.toFixed(2))}`

  let scroller: HTMLDivElement | undefined = $state()
  onMount(() => {
    // Start with the island you're on in view.
    const index = islands.indexOf(placeRegion(here))
    if (scroller && index > 0) {
      scroller.scrollLeft = (scroller.scrollWidth / islands.length) * index - 40
    }
  })
</script>

<div class="destinations">
  <div class="toolbar">
    {#if here !== HOME}
      <button type="button" class="home" onclick={() => fly(HOME)}>
        <span class="name">Fly home</span>
        <span class="time">{quick(HOME)}</span>
      </button>
    {/if}
    <button
      type="button"
      class="toggle"
      aria-expanded={mapOpen}
      onclick={() => (mapOpen = !mapOpen)}
    >
      {mapOpen ? 'Hide map' : 'Show map'}
    </button>
  </div>

  {#if mapOpen}
    <div class="scroller" bind:this={scroller}>
      <div class="map" style:--islands={islands.length}>
        <svg class="sea" viewBox="0 0 {total} 100" preserveAspectRatio="none" aria-hidden="true">
          {#each islands as regionId, i (regionId)}
            {#if i > 0}
              <path
                d="M{i * 100 - 18} 52 L{i * 100 + 18} 52"
                class="crossing"
                vector-effect="non-scaling-stroke"
              />
            {/if}
            <ellipse
              cx={i * 100 + 50}
              cy="54"
              rx="46"
              ry="42"
              fill={MAP_ISLANDS[regionId].color}
              stroke={MAP_ISLANDS[regionId].edge}
              class:fog={!regionReachable($game, regionId)}
              vector-effect="non-scaling-stroke"
            />
          {/each}
          {#each paths as p, i (i)}
            <path
              d="M{p.a.x} {p.a.y} Q{(p.a.x + p.b.x) / 2} {Math.min(p.a.y, p.b.y) - 30} {p.b.x} {p.b
                .y}"
              class="spirit-path"
              vector-effect="non-scaling-stroke"
            />
          {/each}
        </svg>

        {#each islands as regionId, i (regionId)}
          {@const open = regionReachable($game, regionId)}
          <div class="island-label" style:left={pct(i * 100 + 50)}>
            {#if open}
              <strong>{REGIONS[regionId].name}</strong>
              <span>{describeWeather(weatherIn($game, regionId), phase).name}</span>
            {:else}
              <button
                type="button"
                class="locked-island"
                aria-pressed={selected === `locked:${regionId}`}
                onclick={() => (selected = `locked:${regionId}`)}
              >
                🔒 The {REGIONS[regionId].name}
              </button>
            {/if}
          </div>

          {#each placesOn(regionId) as placeId (placeId)}
            {@const p = pos(placeId)!}
            {@const kind = kindOf(placeId)}
            {@const creature = $game.challenges.creatures[placeId]}
            {@const camp = $game.challenges.camps[placeId]}
            {@const working = $game.helpers.list.filter(
              (h) => h.tripSpot === placeId && h.phase === 'gathering',
            ).length}
            <button
              type="button"
              class="node {kind}"
              data-silent
              class:here={placeId === here}
              class:selected={selected === placeId}
              style:left={pct(p.x)}
              style:top="{p.y}%"
              aria-label={`${placeName(placeId)}${placeId === here ? ' (you are here)' : `, ${quick(placeId)}`}`}
              onpointerdown={(e) => onPress(e, placeId)}
              onclick={(e) => onKeyClick(e, placeId)}
            >
              <span class="pin" aria-hidden="true">
                {#if kind === 'home'}⌂{:else if kind === 'settlement'}⌂⌂{:else if kind === 'spirit'}✦{:else if kind === 'secret'}✧{:else}❦{/if}
              </span>
              {#if placeId === here}
                <span class="you" aria-hidden="true"><Art id="char-fairy" size={26} /></span>
              {/if}
              {#if creature || camp || working}
                <span class="badges" aria-hidden="true">
                  {#if creature}<span
                      class="badge warn"
                      title={`${CREATURES[creature.creatureId]?.name} here`}>!</span
                    >{/if}
                  {#if camp}<span class="badge warn" title={CREWS[camp]?.name}>⚑</span>{/if}
                  {#if working}<span class="badge helpers" title="Helpers working here"
                      >{working}</span
                    >{/if}
                </span>
              {/if}
              <span class="label">{placeName(placeId)}</span>
            </button>
          {/each}
        {/each}
      </div>
    </div>

    <div class="card" aria-live="polite">
      {#if !selected}
        <p class="hint">Tap a place on the map to see the way there, then press Fly.</p>
      {:else if selected.startsWith('locked:')}
        {@const regionId = selected.slice(7)}
        {@const unlock = REGIONS[regionId].unlock}
        <strong>The {REGIONS[regionId].name} is still closed</strong>
        {#if unlock}
          {@const rankOk = courtRank($game) >= unlock.rank}
          <ul class="checklist">
            <li class:done={rankOk}>
              {rankOk ? '✓' : '○'} A {COURT_RANKS[unlock.rank].name} court
            </li>
            <li class:done={knowsRite(unlock.ritualId)}>
              {knowsRite(unlock.ritualId) ? '✓' : '○'} Research the {RITUALS[unlock.ritualId].name}
            </li>
            <li>○ Perform it at your Ritual Circle</li>
          </ul>
          {#if REGIONS[regionId].needsLight}
            <p class="status">
              It's dark down there: until the rite, a Glowlight Potion (or a glowing mount) lights
              your way for a visit.
            </p>
          {/if}
        {/if}
      {:else}
        {@const regionId = placeRegion(selected)}
        {@const creature = $game.challenges.creatures[selected]}
        {@const camp = $game.challenges.camps[selected]}
        <div class="card-head">
          <div>
            <strong>{placeName(selected)}</strong>
            <span class="sub">{KIND_NAME[kindOf(selected)]} · {REGIONS[regionId]?.name}</span>
          </div>
          {#if selected === here}
            <span class="sub">You are here.</span>
          {:else if breakdown}
            <button type="button" class="fly" onclick={() => fly(selected!)}>
              Fly · {formatDuration(breakdown.totalMs)}
            </button>
          {/if}
        </div>
        {#if creature}
          <p class="status warn">
            {CREATURES[creature.creatureId]?.name}
            {CREATURES[creature.creatureId]?.behavior === 'watches'
              ? 'is watching it'
              : 'is eating the plants'}.
          </p>
        {/if}
        {#if camp}<p class="status warn">{CREWS[camp]?.name} have camped here.</p>{/if}
        {#if breakdown}
          {#if breakdown.via}<p class="via">{breakdown.via}</p>{/if}
          {@const carrying = countItems($game.player.satchel)}
          {@const roomThere = satchelCapacity($game, selected)}
          {#if carrying > roomThere && roomThere < satchelCapacity($game)}
            <p class="status warn">
              Your satchel will be over-full there ({carrying} / {roomThere}): {satchelMountAway(
                $game,
                selected,
              )}. You won't be able to gather until you make room.
            </p>
          {/if}
          <ul class="legs">
            {#each breakdown.legs as leg, i (i)}
              <li>
                <span class="leg-name">{leg.name}</span>
                <span>{formatDuration(leg.baseMs)}</span>
                {#each leg.effects as e (e.label)}
                  <span class="effect" class:slow={e.factor > 1} class:fast={e.factor < 1}
                    >{e.label} {times(e.factor)}</span
                  >
                {/each}
              </li>
            {/each}
            {#if breakdown.wingSpeed !== 1}
              <li>
                <span class="leg-name">Your wings</span>
                <span class="effect fast">{breakdown.wingSpeed.toFixed(2)}× as fast</span>
              </li>
            {/if}
            {#if breakdown.curios !== 1}
              <li>
                <span class="leg-name">Curios</span>
                <span class="effect fast">{times(breakdown.curios)}</span>
              </li>
            {/if}
          </ul>
        {/if}
      {/if}
    </div>
  {/if}
</div>

<style>
  .destinations {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
    min-width: 0;
  }

  .toolbar {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .toolbar button {
    min-height: 48px;
    padding: 4px 16px;
    border: 2px solid var(--leaf);
    border-radius: 14px;
    background: var(--surface);
    color: var(--ink);
    font: inherit;
    cursor: pointer;
  }

  .home {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .name {
    font-weight: 700;
  }

  .time {
    font-size: 0.85rem;
    opacity: 0.75;
  }

  .toggle {
    margin-left: auto;
    font-weight: 700;
  }

  .scroller {
    /* The map is wider than the screen; it scrolls inside, never stretching the page. */
    contain: inline-size;
    overflow-x: auto;
    border-radius: 18px;
    background: linear-gradient(#bfe4f2, #9fd0e6);
    border: 2px solid #7fb8cf;
  }

  .map {
    position: relative;
    height: 230px;
    width: max(100%, calc(var(--islands) * 250px));
  }

  /* At night the sea darkens and the islands dim, so the light labels stay easy to read. */
  :global([data-theme='night']) .scroller {
    background: linear-gradient(#2a3866, #1f2b52);
    border-color: #4a4f8a;
  }

  :global([data-theme='night']) .pin {
    filter: brightness(0.82);
  }

  :global([data-theme='night']) .sea {
    filter: brightness(0.62) saturate(0.85);
  }

  .sea {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  .sea ellipse {
    stroke-width: 2;
  }

  .sea ellipse.fog {
    fill: #dfe3e8;
    stroke: #aab3bd;
    stroke-dasharray: 6 4;
    opacity: 0.8;
  }

  .crossing {
    stroke: white;
    stroke-width: 3;
    stroke-dasharray: 4 6;
    opacity: 0.8;
  }

  .spirit-path {
    fill: none;
    stroke: #ffe59e;
    stroke-width: 3;
    stroke-dasharray: 2 5;
    stroke-linecap: round;
    filter: drop-shadow(0 0 3px #fff3b0);
  }

  .island-label {
    position: absolute;
    top: 6px;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 0.75rem;
    line-height: 1.2;
    pointer-events: none;
  }

  .island-label strong {
    font-family: var(--font-heading);
    font-size: 0.95rem;
  }

  .island-label span {
    opacity: 0.75;
  }

  .locked-island {
    pointer-events: auto;
    margin-top: 80px;
    min-height: 40px;
    padding: 4px 12px;
    border: 2px dashed #8a95a3;
    border-radius: 12px;
    background: rgb(var(--surface-rgb) / 0.8);
    color: var(--ink);
    font: inherit;
    font-weight: 700;
    cursor: pointer;
  }

  .node {
    position: absolute;
    transform: translate(-50%, -50%);
    transition: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1px;
    min-width: 44px;
    min-height: 44px;
    padding: 0;
    border: none;
    background: none;
    color: var(--ink);
    font: inherit;
    cursor: pointer;
  }

  .pin {
    display: grid;
    place-items: center;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: var(--surface);
    border: 2px solid var(--leaf);
    font-size: 0.85rem;
    line-height: 1;
    box-shadow: 0 2px 4px rgb(0 0 0 / 0.15);
  }

  .home .pin {
    border-color: #c97a8c;
    background: #fde7ef;
  }

  .settlement .pin {
    border-color: #c9832f;
    background: #fff3d6;
    font-size: 0.65rem;
  }

  .spirit .pin {
    border-color: #9a86cf;
    background: #f1ecff;
  }

  .secret .pin {
    border-color: #7c5cff;
    background: #ede6ff;
  }

  /* Hovered and chosen places sit above their neighbours, so overlapping labels can't steal taps. */
  .node:hover,
  .node:focus-visible {
    z-index: 2;
  }

  .node.selected {
    z-index: 3;
  }

  /* Pins stay perfectly still: the usual button press-in would knock them off their spot. */
  .node:not(:disabled):active {
    translate: none;
    scale: none;
  }

  .node:hover .pin {
    box-shadow:
      0 0 0 3px #fff3c4,
      0 2px 4px rgb(0 0 0 / 0.15);
  }

  .node.selected .pin {
    box-shadow:
      0 0 0 3px #e2b94f,
      0 0 10px 3px #ffe59e;
  }

  .node.selected .label {
    background: #e2b94f;
    color: #3d2a10;
  }

  .node.here .pin {
    box-shadow: 0 0 0 3px white;
  }

  .label {
    max-width: 92px;
    padding: 0 5px;
    border-radius: 8px;
    background: rgb(var(--surface-rgb) / 0.85);
    font-size: 0.68rem;
    font-weight: 700;
    line-height: 1.3;
    text-align: center;
  }

  .you {
    position: absolute;
    top: -24px;
    left: -10px;
  }

  .badges {
    position: absolute;
    top: -6px;
    right: -6px;
    display: flex;
    gap: 2px;
  }

  .badge {
    min-width: 16px;
    height: 16px;
    padding: 0 3px;
    border-radius: 999px;
    font-size: 0.65rem;
    font-weight: 700;
    line-height: 16px;
    color: white;
  }

  .badge.warn {
    background: #c0392b;
  }

  .badge.helpers {
    background: var(--leaf-deep);
  }

  .card {
    padding: 10px 14px;
    border-radius: 16px;
    background: var(--surface);
    border: 2px solid var(--honey);
    font-size: 0.9rem;
  }

  .hint {
    margin: 0;
    opacity: 0.7;
  }

  .card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    flex-wrap: wrap;
  }

  .card-head > div {
    display: flex;
    flex-direction: column;
  }

  .sub {
    font-size: 0.8rem;
    opacity: 0.75;
  }

  .fly {
    min-height: 48px;
    padding: 0 20px;
    border: none;
    border-radius: 14px;
    background: var(--leaf-deep);
    color: white;
    font: inherit;
    font-weight: 700;
    cursor: pointer;
  }

  .status,
  .via {
    margin: 6px 0 0;
  }

  .status.warn {
    color: #a52a1f;
    font-weight: 700;
  }

  .via {
    font-style: italic;
  }

  .legs {
    list-style: none;
    margin: 6px 0 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 3px;
    font-size: 0.82rem;
  }

  .legs li {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
  }

  .leg-name {
    font-weight: 700;
    min-width: 76px;
  }

  .effect {
    padding: 0 6px;
    border-radius: 999px;
    background: rgb(0 0 0 / 0.06);
  }

  .effect.slow {
    background: #fde2dd;
  }

  .effect.fast {
    background: #e2f3d8;
  }

  .checklist {
    margin: 6px 0 0;
    padding: 0;
    list-style: none;
  }

  .checklist li.done {
    color: var(--leaf-deep);
    font-weight: 700;
  }

  /* Night: the light pastel chips and pins dim to match the night theme. */
  :global([data-theme='night']) .effect {
    background: rgb(255 255 255 / 0.08);
  }

  :global([data-theme='night']) .effect.slow {
    background: #5a2e44;
  }

  :global([data-theme='night']) .effect.fast {
    background: #2e4a3a;
  }

  :global([data-theme='night']) .status.warn {
    color: #f29a8e;
  }

  :global([data-theme='night']) .home .pin {
    background: #4a2e48;
  }

  :global([data-theme='night']) .settlement .pin {
    background: #4a3a2a;
  }

  :global([data-theme='night']) .spirit .pin,
  :global([data-theme='night']) .secret .pin {
    background: #3a3070;
  }
</style>
