<script lang="ts">
  import { onMount } from 'svelte'
  import Art from '../../art/Art.svelte'
  import { CREATURES, CREWS } from '../../data/challenges'
  import { itemName } from '../../data/items'
  import { SPOTS } from '../../data/world'
  import type { GameEvent } from '../../engine/events'
  import { isNight } from '../../engine/environment'
  import { campBlocksSlot, satchelFull } from '../../engine/gathering'
  import { bloomLevel } from '../../engine/modifiers'
  import BloomMeter from '../components/BloomMeter.svelte'
  import Destinations from '../components/Destinations.svelte'
  import PlantSlot from '../components/PlantSlot.svelte'
  import SpellButtons from '../components/SpellButtons.svelte'
  import WildMount from '../components/WildMount.svelte'
  import { runtime } from '../game'

  const { game } = runtime

  const spotId = $derived($game.player.place)
  const spotDef = $derived(SPOTS[spotId])
  const spot = $derived($game.spots[spotId])
  const full = $derived(satchelFull($game))
  const creature = $derived($game.challenges.creatures[spotId])
  const campCrew = $derived($game.challenges.camps[spotId])
  const night = $derived(isNight($game))
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
        say(`${CREWS[event.crewId].name} pack up their camp and drift away.`)
      } else if (event.type === 'spell-cast' && event.spellId === 'spell-bugbane') {
        say('The aphids scatter!')
      } else if (event.type === 'harvest') {
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
</script>

{#if spotDef && spot}
  <div class="spot" class:night>
    <header>
      <div class="me"><Art id="char-fairy" size={72} /></div>
      <div class="title">
        <h2>{spotDef.name}</h2>
        <p>{spotDef.description}</p>
        <div class="meter"><BloomMeter regionId={spotDef.regionId} compact /></div>
      </div>
      <Destinations />
    </header>

    {#if full}
      <p class="full" role="status">Your satchel is full! Fly home to put things in storage.</p>
    {/if}
    {#if message}<p class="message" role="status">{message}</p>{/if}

    {#if creature || campCrew}
      <div class="trouble">
        {#if creature}
          {@const def = CREATURES[creature.creatureId]}
          <section class="card">
            <button
              type="button"
              class="creature"
              aria-label={`Shoo the ${def.name.toLowerCase()}`}
              onpointerdown={(e) => {
                e.preventDefault()
                runtime.dispatch({ type: 'creature/tap', spotId })
              }}
            >
              {#key creatureWiggle}
                <span class:wiggle={creatureWiggle > 0}
                  ><Art id={`creature-${creature.creatureId}`} size={72} /></span
                >
              {/key}
            </button>
            <div class="about">
              <strong>A {def.name.toLowerCase()} is munching the plants!</strong>
              <span>Tap it to shoo it away ({creature.tapsLeft} more), or calm it.</span>
              <div class="bar">
                <div style:width="{(1 - creature.tapsLeft / def.taps) * 100}%"></div>
              </div>
            </div>
          </section>
        {/if}
        {#if campCrew}
          <section class="card">
            <Art id={`crew-${campCrew}`} size={64} />
            <div class="about">
              <strong>{CREWS[campCrew].name} have camped here.</strong>
              <span
                >They've taken over part of the spot, and helpers in the Meadow bring back less.</span
              >
            </div>
          </section>
        {/if}
      </div>
    {/if}

    <div class="magic"><SpellButtons targets={['pests', 'creature', 'camp', 'parley']} /></div>
    <div class="wild-mount"><WildMount {spotId} /></div>

    <div class="field" style:filter="saturate({saturation})">
      {#each spot.slots as slot, i (i)}
        <div class="cell">
          <PlantSlot
            {slot}
            wiggle={wiggles[i] ?? 0}
            disabled={full && !slot.pests}
            camp={campBlocksSlot($game, spotId, i)}
            onTap={() => tap(i)}
          />
          {#each popups.filter((p) => p.slot === i) as popup (popup.id)}
            <span class="popup" class:special={popup.special}>{popup.text}</span>
          {/each}
        </div>
      {/each}
    </div>
  </div>
{/if}

<style>
  .spot {
    min-height: calc(100vh - 70px);
    padding: 16px;
    background: linear-gradient(#fff3c4, #d8efc8);
  }

  header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    max-width: 1100px;
    margin: 0 auto 16px;
  }

  h2 {
    margin: 0;
  }

  header p {
    margin: 4px 0 0;
    opacity: 0.8;
  }

  .spot.night {
    background: linear-gradient(#2a2763, #3d4f7a);
    color: #f5f0ff;
  }

  .me {
    flex: none;
  }

  .title {
    flex: 1;
    min-width: 200px;
  }

  .meter {
    margin-top: 6px;
    max-width: 280px;
  }

  .message {
    max-width: 1100px;
    margin: 0 auto 12px;
    padding: 8px 16px;
    border-radius: 14px;
    background: #ede7ff;
    color: #4c3a99;
    font-weight: 700;
    text-align: center;
  }

  .trouble {
    max-width: 1100px;
    margin: 0 auto 12px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 12px;
  }

  .card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    border-radius: 18px;
    background: rgb(255 255 255 / 0.85);
    border: 2px solid #c97a8c;
    color: var(--ink);
  }

  .creature {
    flex: none;
    padding: 4px;
    border: none;
    border-radius: 16px;
    background: #fde3ec;
    cursor: pointer;
    touch-action: manipulation;
  }

  .creature .wiggle {
    display: inline-block;
    animation: hop 0.25s ease-out;
  }

  @keyframes hop {
    50% {
      transform: translateY(-8px) rotate(6deg);
    }
  }

  .about {
    display: flex;
    flex-direction: column;
    gap: 2px;
    font-size: 0.9rem;
  }

  .bar {
    height: 8px;
    margin-top: 4px;
    border-radius: 999px;
    background: rgb(0 0 0 / 0.08);
    overflow: hidden;
  }

  .bar div {
    height: 100%;
    background: var(--petal-deep);
  }

  .wild-mount {
    max-width: 1100px;
    margin: 0 auto 12px;
  }

  .magic {
    max-width: 1100px;
    margin: 0 auto 12px;
  }

  .full {
    max-width: 1100px;
    margin: 0 auto 16px;
    padding: 10px 16px;
    border-radius: 14px;
    background: var(--petal);
    font-weight: 700;
    text-align: center;
  }

  .field {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    max-width: 1100px;
    margin: 0 auto;
  }

  .cell {
    position: relative;
  }

  .cell :global(.slot) {
    width: 100%;
  }

  .popup {
    position: absolute;
    left: 50%;
    top: 30%;
    transform: translateX(-50%);
    pointer-events: none;
    white-space: nowrap;
    font-weight: 700;
    color: var(--leaf-deep);
    text-shadow: 0 1px 0 white;
    animation: float-up 1.1s ease-out forwards;
  }

  .popup.special {
    color: var(--petal-deep);
    top: 50%;
  }

  @keyframes float-up {
    from {
      opacity: 1;
      transform: translate(-50%, 0);
    }
    to {
      opacity: 0;
      transform: translate(-50%, -60px);
    }
  }

  @media (max-width: 600px) {
    .field {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>
