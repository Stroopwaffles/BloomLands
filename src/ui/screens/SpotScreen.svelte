<script lang="ts">
  import { onMount } from 'svelte'
  import { itemName } from '../../data/items'
  import { SPOTS } from '../../data/world'
  import type { GameEvent } from '../../engine/events'
  import { satchelFull } from '../../engine/gathering'
  import Destinations from '../components/Destinations.svelte'
  import PlantSlot from '../components/PlantSlot.svelte'
  import { runtime } from '../game'

  const { game } = runtime

  const spotId = $derived($game.player.place)
  const spotDef = $derived(SPOTS[spotId])
  const spot = $derived($game.spots[spotId])
  const full = $derived(satchelFull($game))

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
      if (event.type === 'hit') {
        wiggles[event.slot] = (wiggles[event.slot] ?? 0) + 1
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
  <div class="spot">
    <header>
      <div>
        <h2>{spotDef.name}</h2>
        <p>{spotDef.description}</p>
      </div>
      <Destinations />
    </header>

    {#if full}
      <p class="full" role="status">Your satchel is full! Fly home to put things in storage.</p>
    {/if}

    <div class="field">
      {#each spot.slots as slot, i (i)}
        <div class="cell">
          <PlantSlot {slot} wiggle={wiggles[i] ?? 0} disabled={full} onTap={() => tap(i)} />
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
