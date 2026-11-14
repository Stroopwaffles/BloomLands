<script lang="ts">
  import { onMount } from 'svelte'
  import { MAP_ISLANDS } from '../../data/map'
  import { RITUALS, type RitualDef } from '../../data/magic'
  import { REGIONS } from '../../data/world'
  import { runtime } from '../game'

  /**
   * Rites are big moments: performing one fills the screen with a glowing circle that draws
   * itself, rising sparkles, and the rite's name and what it did. Opening a region gets the
   * longest show, in that region's colors. Tap anywhere to skip.
   */
  interface Showing {
    id: number
    name: string
    line: string
    /** The glow color. */
    color: string
    /** Unlocking rites linger longer. */
    grand: boolean
  }

  let showing = $state<Showing | null>(null)
  let nextId = 1
  let timer: ReturnType<typeof setTimeout> | undefined

  function describe(ritual: RitualDef): { line: string; color: string; grand: boolean } {
    switch (ritual.effect) {
      case 'unlock-region': {
        const region = ritual.region ?? 'meadow'
        return {
          line: `The way to the ${REGIONS[region]?.name ?? region} is open!`,
          color: MAP_ISLANDS[region]?.color ?? '#cdbbf5',
          grand: true,
        }
      }
      case 'open-fairy-ring':
        return {
          line: 'A ring of mushrooms rises in the Meadow…',
          color: '#f7b7c8',
          grand: true,
        }
      case 'open-secret':
        return {
          line: 'The full moon bows low, and a hidden hollow opens beneath it…',
          color: '#c8b8f0',
          grand: true,
        }
      case 'turn-to-day':
        return { line: 'The sky turns to dawn.', color: '#ffe59e', grand: false }
      case 'turn-to-night':
        return { line: 'Dusk falls over the land.', color: '#9a86cf', grand: false }
      case 'root-song':
        return {
          line: 'Roots hum beneath the whole land… it remembers you. A new run begins.',
          color: '#f2c45c',
          grand: true,
        }
      case 'renewal':
        return {
          line: 'Everbloom pours into the land: it blooms brighter!',
          color: '#9ccc72',
          grand: false,
        }
      case 'bloomcall':
        return {
          line: 'A soft bell rings: rare plants stir beneath the ground.',
          color: '#f2c45c',
          grand: false,
        }
      case 'clear-skies':
        return { line: 'The sky listens, and the weather turns.', color: '#8ac4f0', grand: false }
      case 'plenty':
        return {
          line: 'Every plant stirs: growth quickens for ten minutes.',
          color: '#9ccc72',
          grand: false,
        }
    }
  }

  function close() {
    clearTimeout(timer)
    showing = null
  }

  onMount(() =>
    runtime.onEvents((events) => {
      for (const event of events) {
        if (event.type !== 'ritual-performed') continue
        const ritual = RITUALS[event.ritualId]
        if (!ritual) continue
        const { line, color, grand } = describe(ritual)
        showing = { id: nextId++, name: ritual.name, line, color, grand }
        clearTimeout(timer)
        timer = setTimeout(close, grand ? 5200 : 3200)
      }
    }),
  )

  const sparkles = Array.from({ length: 22 }, (_, i) => ({
    left: (i * 41) % 100,
    delay: (i * 0.23) % 2.2,
    size: 4 + (i % 4) * 2,
  }))
  const runes = Array.from({ length: 12 }, (_, i) => (i * 360) / 12)
</script>

{#if showing}
  {#key showing.id}
    <button
      type="button"
      class="rite"
      class:grand={showing.grand}
      style:--glow={showing.color}
      aria-label={`${showing.name}. ${showing.line} Tap to continue.`}
      data-silent
      onclick={close}
    >
      <span class="veil" aria-hidden="true"></span>
      <svg class="circle" viewBox="0 0 200 200" aria-hidden="true">
        <circle class="ring outer" cx="100" cy="100" r="88" />
        <circle class="ring inner" cx="100" cy="100" r="64" />
        <g class="runes">
          {#each runes as angle (angle)}
            <g transform="rotate({angle} 100 100)">
              <path d="M100 20 l4 7 -4 7 -4 -7 Z" />
            </g>
          {/each}
        </g>
        <path
          class="star"
          d="M100 46 L113 86 L154 86 L121 110 L133 150 L100 126 L67 150 L79 110 L46 86 L87 86 Z"
        />
        <circle class="core" cx="100" cy="100" r="14" />
      </svg>
      <span class="sparkles" aria-hidden="true">
        {#each sparkles as s, i (i)}
          <span
            style:left="{s.left}%"
            style:animation-delay="{s.delay}s"
            style:width="{s.size}px"
            style:height="{s.size}px"
          ></span>
        {/each}
      </span>
      <span class="words">
        <span class="name">{showing.name}</span>
        <span class="line">{showing.line}</span>
      </span>
      <span class="skip" aria-hidden="true">Tap to continue</span>
    </button>
  {/key}
{/if}

<style>
  .rite {
    position: fixed;
    inset: 0;
    z-index: 80;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 18px;
    padding: 24px;
    border: none;
    background: none;
    color: #fffaf0;
    font: inherit;
    cursor: pointer;
    overflow: hidden;
    animation: fade-in 0.6s ease-out both;
  }

  .veil {
    position: absolute;
    inset: 0;
    background-color: #161233;
    background-image:
      radial-gradient(
        circle at 50% 45%,
        color-mix(in srgb, var(--glow) 40%, transparent),
        transparent 60%
      ),
      radial-gradient(circle at 50% 50%, #2a2160, #120f2b 75%);
  }

  .circle {
    position: relative;
    width: min(62vw, 340px);
    height: auto;
    filter: drop-shadow(0 0 18px var(--glow));
  }

  .ring {
    fill: none;
    stroke: var(--glow);
    stroke-width: 2.4;
    stroke-dasharray: 600;
    stroke-dashoffset: 600;
    animation: draw 1.4s ease-out forwards;
  }

  .ring.inner {
    stroke-width: 1.4;
    stroke-dasharray: 420;
    stroke-dashoffset: 420;
    animation-delay: 0.3s;
  }

  .runes {
    fill: var(--glow);
    transform-origin: 100px 100px;
    opacity: 0;
    animation:
      appear 0.6s ease-out 0.8s forwards,
      spin 14s linear 0.8s infinite;
  }

  .star {
    fill: none;
    stroke: #fffaf0;
    stroke-width: 1.6;
    stroke-linejoin: round;
    stroke-dasharray: 520;
    stroke-dashoffset: 520;
    animation: draw 1.2s ease-in-out 0.9s forwards;
  }

  .core {
    fill: #fffaf0;
    transform-origin: 100px 100px;
    transform: scale(0);
    animation: burst 0.9s ease-out 1.8s forwards;
  }

  .sparkles span {
    position: absolute;
    bottom: -10px;
    border-radius: 50%;
    background: #fffaf0;
    box-shadow: 0 0 8px var(--glow);
    opacity: 0;
    animation: rise 3s ease-out infinite;
  }

  .words {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    text-align: center;
    opacity: 0;
    animation: words 0.8s ease-out 1.6s forwards;
  }

  .name {
    font-family: var(--font-heading);
    font-size: clamp(1.6rem, 5vw, 2.6rem);
    text-shadow: 0 0 16px var(--glow);
  }

  .line {
    font-size: clamp(1rem, 2.6vw, 1.3rem);
    opacity: 0.9;
  }

  .grand .name {
    font-size: clamp(2rem, 6.5vw, 3.4rem);
  }

  .skip {
    position: absolute;
    bottom: 20px;
    font-size: 0.8rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    opacity: 0.6;
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
  }

  @keyframes draw {
    to {
      stroke-dashoffset: 0;
    }
  }

  @keyframes appear {
    to {
      opacity: 1;
    }
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes burst {
    60% {
      transform: scale(1.6);
      opacity: 1;
    }
    to {
      transform: scale(1);
      opacity: 0.85;
    }
  }

  @keyframes rise {
    0% {
      transform: translateY(0) scale(0.6);
      opacity: 0;
    }
    20% {
      opacity: 1;
    }
    100% {
      transform: translateY(-105vh) scale(1);
      opacity: 0;
    }
  }

  @keyframes words {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .ring,
    .star {
      animation: none;
      stroke-dashoffset: 0;
    }

    .runes,
    .core,
    .words {
      animation: none;
      opacity: 1;
      transform: none;
    }

    .sparkles {
      display: none;
    }
  }
</style>
