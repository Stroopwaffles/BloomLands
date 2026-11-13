<script lang="ts">
  import { onMount } from 'svelte'
  import { BLOOM_LEVELS, CURIOS } from '../../data/bloom'
  import { REGIONS } from '../../data/world'
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
    background: white;
    border: 2px solid var(--petal);
    font-weight: 700;
    box-shadow: 0 4px 12px rgb(90 67 82 / 0.15);
    animation: rise 0.3s ease-out;
  }

  p.big {
    padding: 10px 22px;
    font-family: var(--font-heading);
    font-size: 1.15rem;
    background: linear-gradient(#fff7e8, #fde3ec);
    border-color: var(--petal-deep);
  }

  @keyframes rise {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
  }
</style>
