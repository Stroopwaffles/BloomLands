<script lang="ts">
  import { onMount } from 'svelte'
  import Art from '../../art/Art.svelte'
  import SceneBackdrop from '../../art/SceneBackdrop.svelte'
  import { CREATURES, CREWS } from '../../data/challenges'
  import { itemName } from '../../data/items'
  import { DEFAULT_SCENE, SCENES } from '../../data/scenes'
  import { SPOTS } from '../../data/world'
  import type { GameEvent } from '../../engine/events'
  import { isNight } from '../../engine/environment'
  import { pestAt } from '../../engine/challenges'
  import { campBlocksSlot, satchelFull } from '../../engine/gathering'
  import {
    bloomLevel,
    hasWaterstride,
    satchelMountAway,
    satchelOverload,
  } from '../../engine/modifiers'
  import { wildMountAt } from '../../engine/mounts'
  import BloomMeter from '../components/BloomMeter.svelte'
  import Destinations from '../components/Destinations.svelte'
  import ScenePlant from '../components/ScenePlant.svelte'
  import SpellButtons from '../components/SpellButtons.svelte'
  import WildMount from '../components/WildMount.svelte'
  import { runtime } from '../game'

  const { game } = runtime

  const spotId = $derived($game.player.place)
  const spotDef = $derived(SPOTS[spotId])
  const spot = $derived($game.spots[spotId])
  const layout = $derived(SCENES[spotId] ?? DEFAULT_SCENE)
  const full = $derived(satchelFull($game))
  const over = $derived(satchelOverload($game))
  const mountAway = $derived(satchelMountAway($game))
  const creature = $derived($game.challenges.creatures[spotId])
  const campCrew = $derived($game.challenges.camps[spotId])
  const wildMount = $derived(wildMountAt($game, spotId))
  const night = $derived(isNight($game))
  const pest = $derived(pestAt(spotId))
  const watching = $derived(!!creature && CREATURES[creature.creatureId]?.behavior === 'watches')
  const sneaking = $derived($game.player.sneakMs > 0)
  /** The heron ignores a fairy who drank a Waterstride Philter. */
  const skimming = $derived(
    !!creature &&
      !!CREATURES[creature.creatureId]?.ignoresWaterstride &&
      hasWaterstride($game) &&
      !sneaking,
  )
  /** A watching creature (the owl, the heron) stops gathering here unless you get past it. */
  const blocked = $derived(watching && !sneaking && !skimming)
  /** "a rabbit", "an owl" */
  const aName = (name: string) => `${/^[aeiou]/i.test(name) ? 'An' : 'A'} ${name.toLowerCase()}`
  /** Low bloom looks faded and grey; full bloom is in full color (design doc 7.3). */
  const saturation = $derived(0.55 + bloomLevel($game, spotDef?.regionId ?? 'meadow') * 0.09)

  let creatureWiggle = $state(0)
  let message = $state('')
  let messageTimer: ReturnType<typeof setTimeout> | undefined

  function say(text: string) {
    message = text
    clearTimeout(messageTimer)
    messageTimer = setTimeout(() => (message = ''), 2500)
  }

  interface Popup {
    id: number
    slot: number
    text: string
    special: boolean
  }

  /** Little particle bursts: petals when a plant is harvested, sparkles on each tap. */
  interface Burst {
    id: number
    slot: number
    kind: 'petals' | 'sparkle'
    color: string
  }

  const PETAL_COLORS: Record<string, string> = {
    'plant-clover': '#8cc97f',
    'plant-four-leaf-clover': '#7fd17a',
    'plant-daisy': '#ffffff',
    'plant-buttercup': '#ffd94f',
    'plant-dandelion': '#ffffff',
    'plant-wild-strawberry': '#f05a6a',
    'plant-morning-dew': '#cdeeff',
    'plant-ringcap': '#f08a9e',
    'plant-moss': '#8fbf66',
    'plant-fern': '#6fae5f',
    'plant-bilberry': '#4a5ea8',
    'plant-button-mushroom': '#e9d6bd',
    'plant-acorn': '#c98a4a',
    'plant-red-cap': '#e0483e',
    'plant-golden-chanterelle': '#f2b23a',
    'plant-inkcap': '#3d3550',
    'plant-birch-catkin': '#e7dca6',
  }

  let bursts = $state<Burst[]>([])

  function burst(slot: number, kind: Burst['kind'], color: string) {
    const id = nextPopupId++
    bursts.push({ id, slot, kind, color })
    setTimeout(() => (bursts = bursts.filter((b) => b.id !== id)), kind === 'petals' ? 900 : 450)
  }

  let popups = $state<Popup[]>([])
  let wiggles = $state<Record<number, number>>({})
  let nextPopupId = 0

  function addPopup(slot: number, text: string, special = false) {
    const id = nextPopupId++
    popups.push({ id, slot, text, special })
    setTimeout(() => (popups = popups.filter((p) => p.id !== id)), 1100)
  }

  function onEvents(events: GameEvent[]) {
    for (const event of events) {
      if (event.type === 'hit' || event.type === 'pest-cleared') {
        wiggles[event.slot] = (wiggles[event.slot] ?? 0) + 1
        burst(event.slot, 'sparkle', '#fff3b0')
        if (event.type === 'pest-cleared') addPopup(event.slot, 'Shoo!')
      } else if (event.type === 'creature-tap') {
        creatureWiggle++
      } else if (event.type === 'creature-gone') {
        say(
          event.how === 'calmed'
            ? `The ${CREATURES[event.creatureId].name.toLowerCase()} yawns and wanders off.`
            : `The ${CREATURES[event.creatureId].name.toLowerCase()} hops away!`,
        )
      } else if (event.type === 'camp-cleared') {
        say(`${CREWS[event.crewId].name} pack up their camp and slip away.`)
      } else if (event.type === 'spell-cast' && event.spellId === 'spell-bugbane') {
        say(`The ${pest.name} scatter!`)
      } else if (event.type === 'spell-cast' && event.spellId === 'spell-hush-step') {
        say('You step as softly as a falling seed...')
      } else if (event.type === 'blocked' && event.reason === 'watching') {
        say('You are being watched. Calm it, or sneak with Hush Step.')
      } else if (event.type === 'harvest') {
        burst(event.slot, 'petals', PETAL_COLORS[event.plantId] ?? '#f7b7c8')
        for (const { itemId, amount } of event.items) {
          addPopup(event.slot, `+${amount} ${itemName(itemId)}${event.bonus ? '!' : ''}`)
        }
        if (event.trinketId) addPopup(event.slot, `Found a ${itemName(event.trinketId)}!`, true)
      }
    }
  }

  onMount(() => runtime.onEvents(onEvents))

  function tap(slot: number) {
    runtime.dispatch({ type: 'gather/tap', spotId, slot })
  }

  function shoo(event: PointerEvent) {
    event.preventDefault()
    runtime.dispatch({ type: 'creature/tap', spotId })
  }
</script>

{#if spotDef && spot}
  <div class="spot" class:night>
    <header>
      <div class="me"><Art id="char-fairy" size={64} /></div>
      <div class="title">
        <h2>{spotDef.name}</h2>
        <div class="meter"><BloomMeter regionId={spotDef.regionId} compact /></div>
      </div>
      <Destinations />
    </header>

    <div class="scene" class:night style:--saturation={saturation}>
      <SceneBackdrop {spotId} {night} weather={$game.weather[spotDef.regionId]?.kind} />

      {#if campCrew}
        <div class="camp" style:left="{layout.camp.x}%" style:top="{layout.camp.y}%">
          <Art id={`camp-${campCrew}`} size={160} />
        </div>
      {/if}

      {#each spot.slots as slot, i (i)}
        {#if !campBlocksSlot($game, spotId, i)}
          <ScenePlant
            {slot}
            at={layout.slots[i]}
            wiggle={wiggles[i] ?? 0}
            disabled={blocked || (full && !slot.pests)}
            onTap={() => tap(i)}
            {pest}
          />
        {/if}
        {#each bursts.filter((b) => b.slot === i) as b (b.id)}
          <span
            class="burst {b.kind}"
            style:left="{layout.slots[i].x}%"
            style:top="{layout.slots[i].y - 10}%"
            aria-hidden="true"
          >
            {#each Array.from({ length: b.kind === 'petals' ? 8 : 4 }, (_, k) => k) as k (k)}
              <span style:--a="{k * (b.kind === 'petals' ? 45 : 90) + 20}deg" style:--c={b.color}
              ></span>
            {/each}
          </span>
        {/each}
        {#each popups.filter((p) => p.slot === i) as popup (popup.id)}
          <span
            class="popup"
            class:special={popup.special}
            style:left="{layout.slots[i].x}%"
            style:top="{layout.slots[i].y - 18}%">{popup.text}</span
          >
        {/each}
      {/each}

      {#if wildMount}
        <div class="mount" style:left="{layout.mount.x}%" style:top="{layout.mount.y}%">
          <Art id={`${wildMount}-wild`} size={90} />
        </div>
      {/if}

      {#if creature}
        {@const def = CREATURES[creature.creatureId]}
        {#if def.behavior === 'watches'}
          <div
            class="creature watcher"
            class:sneaking={sneaking || skimming}
            style:left="{layout.creature.x}%"
            style:top="{layout.creature.y}%"
            role="img"
            aria-label={`A ${def.name.toLowerCase()} is watching`}
          >
            <span class="art"><Art id={`creature-${creature.creatureId}`} size={120} /></span>
          </div>
        {:else}
          <button
            type="button"
            class="creature"
            style:left="{layout.creature.x}%"
            style:top="{layout.creature.y}%"
            aria-label={`Shoo the ${def.name.toLowerCase()} (${creature.tapsLeft} more taps)`}
            onpointerdown={shoo}
          >
            {#key creatureWiggle}
              <span class="art" class:hop={creatureWiggle > 0}
                ><Art id={`creature-${creature.creatureId}`} size={120} /></span
              >
            {/key}
            <span class="taps" aria-hidden="true">
              <span style:width="{(1 - creature.tapsLeft / def.taps) * 100}%"></span>
            </span>
          </button>
        {/if}
      {/if}
    </div>

    <div class="below">
      {#if over > 0}
        <p class="note full" role="status">
          Your satchel is over-full by {over}: {mountAway ?? 'your Deep Pockets Draught wore off'}.
          Nothing is lost, but you can't gather until you unpack, sell, or send some home{mountAway
            ? ', or fly back'
            : ''}.
        </p>
      {:else if full}
        <p class="note full" role="status">
          Your satchel is full! Fly home to put things in storage.
        </p>
      {/if}
      {#if message}<p class="note message" role="status">{message}</p>{/if}
      {#if creature && watching}
        <p class="note trouble">
          {#if sneaking}
            Sneaking past the {CREATURES[creature.creatureId].name.toLowerCase()}... gather quietly
            ({Math.ceil($game.player.sneakMs / 1000)}s left).
          {:else if skimming}
            You skim the water so smoothly that the {CREATURES[
              creature.creatureId
            ].name.toLowerCase()} pays you no mind. Gather away! (Helpers still stay home.)
          {:else}
            {aName(CREATURES[creature.creatureId].name)} is watching this spot. Nobody can gather here
            (helpers stay home) until you calm it, or sneak past with Hush Step{CREATURES[
              creature.creatureId
            ].ignoresWaterstride
              ? ' (or drink a Waterstride Philter)'
              : ''}.
          {/if}
        </p>
      {:else if creature}
        <p class="note trouble">
          {aName(CREATURES[creature.creatureId].name)} is munching the plants! Tap it to shoo it away
          ({creature.tapsLeft} more), or calm it.
        </p>
      {/if}
      {#if campCrew}
        <p class="note trouble">
          {CREWS[campCrew].name} have camped here, taking over part of the spot. Helpers in the region
          bring back less until they leave.
        </p>
      {/if}
      <SpellButtons targets={['pests', 'creature', 'sneak', 'camp', 'parley']} />
      <WildMount {spotId} />
    </div>
  </div>
{/if}

<style>
  .watcher {
    pointer-events: none;
    transition: opacity 0.4s;
  }

  .watcher .art {
    display: block;
    animation: owl-look 4s ease-in-out infinite;
  }

  .watcher.sneaking {
    opacity: 0.55;
  }

  @keyframes owl-look {
    0%,
    40%,
    100% {
      transform: rotate(0deg);
    }
    50%,
    70% {
      transform: rotate(-8deg);
    }
    80% {
      transform: rotate(6deg);
    }
  }

  .spot {
    min-height: calc(100vh - 70px);
    padding: 12px 16px 24px;
    background: var(--screen-bg, linear-gradient(#f3f9e8, #e4f1d6));
  }

  header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
    max-width: 1100px;
    margin: 0 auto 10px;
  }

  .me {
    flex: none;
  }

  .title {
    flex: 1;
    min-width: 180px;
  }

  h2 {
    margin: 0;
  }

  .meter {
    margin-top: 4px;
    max-width: 280px;
  }

  .scene {
    position: relative;
    /* Fill the width, but never so tall that the controls below fall off a tablet screen. */
    width: min(100%, 1100px, calc((100vh - 200px) * 1.6));
    margin: 0 auto;
    aspect-ratio: 16 / 10;
    border-radius: 28px;
    overflow: hidden;
    border: 3px solid #cfe3b8;
    box-shadow: 0 8px 24px rgb(80 110 60 / 0.18);
    filter: saturate(var(--saturation));
    touch-action: manipulation;
  }

  .scene.night {
    border-color: #4c3a99;
  }

  .scene.night :global(.plant-spot) {
    filter: brightness(0.8) saturate(0.9);
  }

  .camp {
    position: absolute;
    width: 30%;
    transform: translate(-50%, -80%);
    pointer-events: none;
  }

  .camp :global(svg),
  .mount :global(svg),
  .creature :global(svg) {
    width: 100%;
    height: auto;
  }

  .mount {
    position: absolute;
    width: 11%;
    transform: translate(-50%, -50%);
    animation: hover 2.4s ease-in-out infinite;
    pointer-events: none;
  }

  @keyframes hover {
    50% {
      transform: translate(-50%, -62%);
    }
  }

  .creature {
    position: absolute;
    width: 15%;
    min-width: 56px;
    padding: 0;
    transform: translate(-50%, -92%);
    border: none;
    background: transparent;
    cursor: pointer;
    touch-action: manipulation;
  }

  /* The creature stays put when tapped; its own hop is the feedback. */
  .creature:not(:disabled):active {
    translate: none;
    scale: none;
  }

  .creature .art {
    display: block;
    filter: drop-shadow(0 3px 2px rgb(60 60 40 / 0.25));
  }

  .hop {
    animation: hop 0.25s ease-out;
  }

  @keyframes hop {
    50% {
      transform: translateY(-10%) rotate(5deg);
    }
  }

  .taps {
    display: block;
    height: 6px;
    margin: 2px 15% 0;
    border-radius: 999px;
    background: rgb(var(--surface-rgb) / 0.85);
    overflow: hidden;
  }

  .taps span {
    display: block;
    height: 100%;
    background: var(--petal-deep);
  }

  .burst {
    position: absolute;
    width: 0;
    height: 0;
    pointer-events: none;
    z-index: 2;
  }

  .burst span {
    position: absolute;
    left: -5px;
    top: -5px;
    width: 10px;
    height: 14px;
    border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
    background: var(--c);
    border: 1px solid rgb(90 67 82 / 0.25);
    animation: fly 0.9s ease-out forwards;
  }

  .burst.sparkle span {
    width: 8px;
    height: 8px;
    border: none;
    clip-path: polygon(50% 0, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0 50%, 38% 38%);
    animation-duration: 0.45s;
  }

  @keyframes fly {
    from {
      opacity: 1;
      transform: rotate(var(--a)) translateY(0) scale(1);
    }
    to {
      opacity: 0;
      transform: rotate(var(--a)) translateY(-46px) scale(0.6);
    }
  }

  .popup {
    position: absolute;
    transform: translateX(-50%);
    pointer-events: none;
    white-space: nowrap;
    font-weight: 700;
    color: var(--leaf-deep);
    text-shadow:
      0 1px 0 white,
      0 0 6px white;
    animation: float-up 1.1s ease-out forwards;
    z-index: 2;
  }

  .popup.special {
    color: var(--petal-deep);
  }

  @keyframes float-up {
    from {
      opacity: 1;
      transform: translate(-50%, 0);
    }
    to {
      opacity: 0;
      transform: translate(-50%, -50px);
    }
  }

  .below {
    max-width: 1100px;
    margin: 12px auto 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .note {
    margin: 0;
    padding: 8px 14px;
    border-radius: 14px;
    font-weight: 700;
    color: var(--ink);
  }

  .full {
    background: var(--petal);
    text-align: center;
  }

  .message {
    background: #ede7ff;
    color: #4c3a99;
    text-align: center;
  }

  .trouble {
    background: rgb(var(--surface-rgb) / 0.85);
    border: 2px solid #c97a8c;
    font-weight: 400;
  }

  @media (prefers-reduced-motion: reduce) {
    .mount,
    .hop,
    .popup {
      animation: none;
    }

    .burst {
      display: none;
    }
  }
</style>
