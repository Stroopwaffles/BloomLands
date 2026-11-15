<script lang="ts">
  import { REGIONS, SETTLEMENTS } from '../data/world'
  import SceneBackdrop from './SceneBackdrop.svelte'

  /**
   * A village banner (content doc → Scenes: settlements). The region's own scenery, with the
   * village built on top in its folk's style: mouse cottages, squirrel dreys, toad stilt-huts,
   * honeycomb houses, mole burrows, firefly lanterns in a willow, and cloud houses on floating rocks.
   */
  let {
    settlementId,
    night = false,
    weather,
  }: { settlementId: string; night?: boolean; weather?: string } = $props()

  const regionId = $derived(SETTLEMENTS[settlementId]?.regionId ?? 'meadow')
  const sceneSpot = $derived(REGIONS[regionId]?.sceneSpot ?? 'buttercup-rise')
</script>

<div class="village" class:night aria-hidden="true">
  <SceneBackdrop spotId={sceneSpot} {night} {weather} bottom />
  <svg class="houses" viewBox="0 0 160 100" preserveAspectRatio="xMidYMax slice">
    <g transform="translate(0 8)">
      {#if settlementId === 'thimblewick'}
        <!-- Field-mouse cottages with thatched roofs and round doors. -->
        {#each [[30, 74, 1], [80, 70, 1.2], [128, 76, 0.9]] as [x, y, s] (x)}
          <g transform="translate({x} {y}) scale({s})">
            <ellipse
              cx="0"
              cy="0"
              rx="14"
              ry="10"
              fill="#e8d2b0"
              stroke="#a8875d"
              stroke-width="0.8"
            />
            <path
              d="M-17 -2 Q0 -24 17 -2 Q0 -8 -17 -2 Z"
              fill="#d9b25a"
              stroke="#a8875d"
              stroke-width="0.8"
            />
            <path d="M-3 9 L-3 2 Q0 -2 3 2 L3 9 Z" fill="#8a5a3a" />
            <circle cx="8" cy="0" r="2" fill="#ffe59e" stroke="#a8875d" stroke-width="0.4" />
          </g>
        {/each}
        <path d="M44 66 Q56 70 68 64" fill="none" stroke="#a8875d" stroke-width="0.4" />
        {#each [48, 54, 60, 65] as x, i (x)}
          <rect
            {x}
            y={66 + (i % 2)}
            width="3"
            height="4"
            fill={['#f7b7c8', '#cdbbf5', '#ffd94f', '#ffffff'][i]}
          />
        {/each}
      {:else if settlementId === 'acornhollow'}
        <!-- Squirrel dreys up an old oak, joined by rope bridges. -->
        <path
          d="M74 100 L76 20 L88 20 L90 100 Z"
          fill="#8a5a3a"
          stroke="#5e3e24"
          stroke-width="0.8"
        />
        <ellipse cx="82" cy="18" rx="44" ry="16" fill="#6fa05a" opacity="0.9" />
        {#each [[64, 52], [100, 48], [70, 72], [98, 68]] as [x, y] (`${x}-${y}`)}
          <ellipse cx={x} cy={y} rx="9" ry="7" fill="#b88a5a" stroke="#7a5a3a" stroke-width="0.8" />
          <circle cx={x} cy={y + 1} r="2.4" fill="#4a3020" />
        {/each}
        <path
          d="M73 52 Q82 58 91 48 M79 72 Q84 76 89 68"
          fill="none"
          stroke="#a8875d"
          stroke-width="0.8"
          stroke-dasharray="2 1"
        />
      {:else if settlementId === 'toad-village'}
        <!-- Toad huts on stilts over the water, with lily-pad roofs. -->
        {#each [[34, 66], [82, 62], [128, 68]] as [x, y] (x)}
          <path
            d="M{x - 6} {y + 6} L{x - 6} {y + 18} M{x + 6} {y + 6} L{x + 6} {y + 18}"
            stroke="#6a5a3a"
            stroke-width="1.4"
          />
          <rect
            x={x - 9}
            y={y - 6}
            width="18"
            height="12"
            rx="2"
            fill="#b8a27a"
            stroke="#7a6a4a"
            stroke-width="0.8"
          />
          <ellipse
            cx={x}
            cy={y - 7}
            rx="13"
            ry="4"
            fill="#5f9a5a"
            stroke="#3e6a3e"
            stroke-width="0.8"
          />
          <rect x={x - 2} y={y - 1} width="4" height="7" rx="1.5" fill="#5e4428" />
        {/each}
      {:else if settlementId === 'combhaven'}
        <!-- Honeycomb houses stacked up a tree, and a big hive. -->
        {#each [[60, 70], [72, 70], [66, 60], [96, 72], [108, 72], [102, 62]] as [x, y] (`${x}-${y}`)}
          <path
            d="M{x} {y - 6} L{x + 5} {y - 3} L{x + 5} {y + 3} L{x} {y + 6} L{x - 5} {y + 3} L{x -
              5} {y - 3} Z"
            fill="#f2c45c"
            stroke="#a87e1a"
            stroke-width="0.8"
          />
          <circle cx={x} cy={y} r="1.6" fill="#7a5a1a" />
        {/each}
        <path
          d="M20 80 Q20 56 34 54 Q48 56 48 80 Z"
          fill="#e8b450"
          stroke="#a87e1a"
          stroke-width="1"
        />
        <path d="M22 66 L46 66 M21 73 L47 73 M24 59 L44 59" stroke="#a87e1a" stroke-width="0.6" />
        <ellipse cx="34" cy="78" rx="3" ry="2" fill="#5e4428" />
      {:else if settlementId === 'glimmerdeep'}
        <!-- Mole burrows with lanterns, and a little rail cart. -->
        {#each [[32, 72], [80, 68], [126, 74]] as [x, y] (x)}
          <path
            d="M{x - 12} {y + 6} Q{x} {y - 16} {x + 12} {y + 6} Z"
            fill="#5a4a6a"
            stroke="#3a2a4a"
            stroke-width="0.8"
          />
          <path d="M{x - 6} {y + 6} Q{x} {y - 6} {x + 6} {y + 6} Z" fill="#1e1a30" />
          <circle cx={x + 10} cy={y - 6} r="2" fill="#ffe59e" />
          <circle cx={x + 10} cy={y - 6} r="5" fill="#ffe59e" opacity="0.25" />
        {/each}
        <path d="M40 86 L120 86 M40 89 L120 89" stroke="#8a8fa0" stroke-width="0.8" />
        <rect
          x="92"
          y="79"
          width="12"
          height="7"
          rx="1"
          fill="#8a6a44"
          stroke="#5e4428"
          stroke-width="0.6"
        />
        <circle cx="95" cy="87" r="1.6" fill="#3a3550" />
        <circle cx="101" cy="87" r="1.6" fill="#3a3550" />
      {:else if settlementId === 'emberglow'}
        <!-- A weeping willow hung with firefly lanterns. -->
        <path d="M78 100 L80 34 L86 34 L88 100 Z" fill="#4a5a4a" />
        <path
          d="M40 60 Q60 10 83 22 Q106 10 126 60"
          fill="none"
          stroke="#5f8a6a"
          stroke-width="2"
        />
        {#each Array.from({ length: 14 }, (_, i) => i) as i (i)}
          {@const x = 44 + i * 6}
          <path
            d="M{x} {28 + Math.abs(7 - i) * 2} Q{x - 2} 50 {x} 66"
            fill="none"
            stroke="#6f9a6a"
            stroke-width="0.8"
          />
          {#if i % 2 === 0}
            <circle
              cx={x}
              cy={50 + (i % 4) * 4}
              r="2.6"
              fill="#fff3b0"
              opacity="0.35"
              class="flicker"
            />
            <circle cx={x} cy={50 + (i % 4) * 4} r="1.2" fill="#ffd36a" />
          {/if}
        {/each}
      {:else if settlementId === 'nimbusrest'}
        <!-- Cloud houses tethered to floating rocks. -->
        {#each [[38, 60], [86, 52], [130, 62]] as [x, y] (x)}
          <path
            d="M{x - 12} {y + 10} L{x + 12} {y + 10} L{x + 6} {y + 20} L{x - 6} {y + 20} Z"
            fill="#a89a88"
            stroke="#7a6a5a"
            stroke-width="0.6"
          />
          <g fill="#ffffff" stroke="#c8daea" stroke-width="0.6">
            <circle cx={x - 6} cy={y + 4} r="7" />
            <circle cx={x + 2} cy={y} r="9" />
            <circle cx={x + 9} cy={y + 5} r="6" />
          </g>
          <rect x={x - 1} y={y + 2} width="4" height="7" rx="2" fill="#7ab4e8" />
          <path
            d="M{x} {y + 20} L{x - 2} 96"
            stroke="#c9a77f"
            stroke-width="0.4"
            stroke-dasharray="1.5 1"
          />
        {/each}
      {/if}
    </g>
  </svg>
</div>

<style>
  .village {
    position: relative;
    aspect-ratio: 3 / 1;
    /* The same width as the village's panels, and centered like them. */
    max-width: 900px;
    margin: 0 auto 16px;
    border-radius: 22px;
    overflow: hidden;
    border: 2px solid var(--honey);
  }

  .village.night .houses {
    filter: brightness(0.75);
  }

  .houses {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  .flicker {
    animation: flicker 2.6s ease-in-out infinite;
  }

  @keyframes flicker {
    50% {
      opacity: 0.15;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .flicker {
      animation: none;
    }
  }
</style>
