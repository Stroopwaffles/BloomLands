<script lang="ts">
  import { onMount } from 'svelte'
  import { BLOOM_LEVELS, CURIOS } from '../../data/bloom'
  import { placeName, REGIONS, SPOTS } from '../../data/world'
  import type { GameEvent } from '../../engine/events'
  import { bloomLevel } from '../../engine/modifiers'
  import { runtime } from '../game'

  /** Small pop-up notes for good news: bloom, curios, stories. */
  interface Notice {
    id: number
    text: string
    big: boolean
  }

  const { game } = runtime
  let notices = $state<Notice[]>([])
  let nextId = 0

  function show(text: string, big = false) {
    const id = nextId++
    notices.push({ id, text, big })
    setTimeout(() => (notices = notices.filter((n) => n.id !== id)), big ? 5000 : 2600)
  }

  function describe(event: GameEvent): [string, boolean] | null {
    switch (event.type) {
      case 'bloom': {
        const name = REGIONS[event.regionId]?.name ?? event.regionId
        if (event.levelUp) {
          const level = BLOOM_LEVELS[bloomLevel($game, event.regionId)].name
          return [`The ${name} is ${level.toLowerCase()}!`, true]
        }
        return [`+${event.amount} ${name} bloom`, false]
      }
      case 'curio':
        return [`You found a curio: ${CURIOS[event.curioId]?.name}!`, true]
      case 'story':
        return [event.text, event.complete]
      case 'secret':
        return event.found === 'unlocked'
          ? [
              `Something stirs in the ${REGIONS[SPOTS[event.spotId]?.regionId]?.name ?? 'land'}... a secret place has opened!`,
              true,
            ]
          : [`You found ${placeName(event.spotId)}!`, true]
      case 'region-unlocked':
        return [`The way to the ${REGIONS[event.regionId]?.name} is open!`, true]
      case 'crew-won':
        return ['The pirates are your friends now!', true]
      case 'outfit':
        return ['A new outfit for your wardrobe!', false]
      case 'mount-tamed':
        return ['A new friend joins your court!', true]
      case 'mount-level':
        return [`Your mount reached level ${event.level}!`, false]
      case 'parcel-sent':
        return [
          `Your satchel is on its way home (${event.count} items, ${event.fee} Glimmers).`,
          false,
        ]
      case 'parcel-arrived':
        return [
          event.waiting > 0
            ? `A parcel arrived: ${event.count} items stored, ${event.waiting} wait for storage space.`
            : `A parcel arrived home: ${event.count} items stored.`,
          false,
        ]
      default:
        return null
    }
  }

  onMount(() =>
    runtime.onEvents((events) => {
      for (const event of events) {
        const notice = describe(event)
        if (notice) show(...notice)
      }
    }),
  )
</script>

<div class="notices" aria-live="polite">
  {#each notices as notice (notice.id)}
    <p class:big={notice.big}>{notice.text}</p>
  {/each}
</div>

<style>
  .notices {
    position: fixed;
    left: 50%;
    bottom: 20px;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    z-index: 25;
    pointer-events: none;
  }

  p {
    margin: 0;
    padding: 6px 16px;
    border-radius: 999px;
    background: var(--surface);
    border: 2px solid var(--petal);
    font-weight: 700;
    box-shadow: 0 4px 12px rgb(90 67 82 / 0.15);
    animation: rise 0.3s ease-out;
  }

  p.big {
    padding: 10px 22px;
    font-family: var(--font-heading);
    font-size: 1.15rem;
    background: var(--screen-bg, linear-gradient(#fff7e8, #fde3ec));
    border-color: var(--petal-deep);
  }

  @keyframes rise {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
  }
</style>
