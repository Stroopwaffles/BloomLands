<script lang="ts">
  /**
   * Moonlit Glade backdrops (160×100, drawn inside SceneBackdrop's svg). Always twilight: a deep
   * blue sky whose moon follows the Glade's moon cycle, silver flowers and drifting fireflies.
   */
  let { spotId, weather = 'waxing-moon' }: { spotId: string; weather?: string } = $props()

  const stars: [number, number, number][] = [
    [12, 8, 0.8],
    [30, 18, 0.6],
    [52, 6, 0.9],
    [70, 22, 0.5],
    [96, 10, 0.7],
    [112, 26, 0.6],
    [140, 8, 0.8],
    [150, 30, 0.5],
    [22, 32, 0.5],
    [84, 34, 0.4],
  ]
  const fireflies: [number, number, number][] = [
    [20, 56, 0],
    [44, 48, 1.1],
    [70, 60, 2.2],
    [98, 50, 0.6],
    [122, 58, 1.7],
    [144, 46, 2.8],
  ]
  /** How much of the moon's face is dark, for each phase (and which side). */
  const shadow = $derived(
    weather === 'full-moon'
      ? null
      : weather === 'new-moon'
        ? { dx: 0, r: 10.4 }
        : weather === 'waning-moon'
          ? { dx: 5, r: 9 }
          : { dx: -5, r: 9 },
  )
</script>

<defs>
  <linearGradient id="glade-sky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#1b1f4a" />
    <stop offset="0.6" stop-color="#34306e" />
    <stop offset="1" stop-color="#4a3f80" />
  </linearGradient>
  <linearGradient id="glade-field" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#3e4a7a" />
    <stop offset="1" stop-color="#2a3058" />
  </linearGradient>
  <radialGradient id="moon-glow">
    <stop offset="0" stop-color="#f4f2ff" stop-opacity="0.55" />
    <stop offset="1" stop-color="#f4f2ff" stop-opacity="0" />
  </radialGradient>
  <linearGradient id="brook" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#5a6ab8" />
    <stop offset="0.5" stop-color="#9aa8e8" />
    <stop offset="1" stop-color="#5a6ab8" />
  </linearGradient>
</defs>

<rect width="160" height="100" fill="url(#glade-sky)" />
{#each stars as [x, y, r] (x)}
  <circle cx={x} cy={y} {r} fill="#fff3b0" class="twinkle" style:--d="{(x % 7) * 0.4}s" />
{/each}

<!-- The moon, following the Glade's moon cycle. -->
<circle cx="128" cy="20" r="22" fill="url(#moon-glow)" opacity={weather === 'new-moon' ? 0.2 : 1} />
<circle
  cx="128"
  cy="20"
  r="10"
  fill={weather === 'new-moon' ? '#2a2850' : '#f4f2ff'}
  stroke="#b8bce8"
  stroke-width="0.6"
/>
{#if shadow}
  <circle cx={128 + shadow.dx} cy="20" r={shadow.r} fill="#1f2350" />
{/if}

{#if weather === 'starfall'}
  <g class="shooting" stroke="#fff3b0" stroke-linecap="round">
    {#each [[30, 4, 0], [80, 0, 1.3], [110, 6, 2.6]] as [x, y, d] (x)}
      <path d="M{x} {y} l14 10" stroke-width="0.8" style:--d="{d}s" />
    {/each}
  </g>
{/if}

{#if spotId === 'silverbrook'}
  <path d="M0 58 Q40 50 80 56 Q120 50 160 58 L160 100 L0 100 Z" fill="url(#glade-field)" />
  <path
    d="M0 74 Q40 66 80 76 Q120 86 160 74 L160 86 Q120 96 80 88 Q40 78 0 86 Z"
    fill="url(#brook)"
  />
  <path
    d="M20 78 q6 -2 12 0 M76 82 q8 -2 16 0 M126 80 q6 -2 12 0"
    stroke="#e8ecff"
    stroke-width="0.6"
    fill="none"
    class="shimmer"
  />
  {#each [12, 40, 104, 148] as x (x)}
    <path
      d="M{x} 62 q-6 -14 -2 -24 M{x} 62 q6 -12 3 -22"
      stroke="#9aa8c8"
      stroke-width="1.2"
      fill="none"
    />
  {/each}
{:else if spotId === 'starwell'}
  <ellipse cx="80" cy="74" rx="46" ry="16" fill="#14123a" stroke="#5a5f9a" stroke-width="1.4" />
  <ellipse cx="80" cy="72" rx="40" ry="12" fill="#0e0c2a" />
  {#each [[64, 70], [80, 74], [96, 68], [72, 76], [90, 76]] as [x, y] (x)}
    <circle cx={x} cy={y} r="1" fill="#fff3b0" class="twinkle" style:--d="{(x % 5) * 0.5}s" />
  {/each}
  <path
    d="M0 64 Q30 58 50 64 L34 100 L0 100 Z M160 64 Q130 58 110 64 L126 100 L160 100 Z"
    fill="url(#glade-field)"
  />
{:else if spotId === 'dream-hollow'}
  <path d="M0 50 Q80 30 160 50 L160 100 L0 100 Z" fill="#33405e" />
  <path d="M0 62 Q80 50 160 62 L160 100 L0 100 Z" fill="url(#glade-field)" />
  <ellipse cx="80" cy="84" rx="40" ry="9" fill="#4a5a6a" opacity="0.7" />
  {#each [[36, 52], [120, 50]] as [x, y] (x)}
    <text {x} {y} font-size="5" fill="#cfd8f5" class="drift-z" style:--d="{x % 3}s">z</text>
  {/each}
{:else}
  <!-- Moonpetal Meadow: a silver field of night flowers. -->
  <path d="M0 56 Q40 46 80 54 Q120 46 160 56 L160 100 L0 100 Z" fill="url(#glade-field)" />
  {#each Array.from({ length: 16 }, (_, i) => i) as i (i)}
    {@const x = 6 + i * 10}
    {@const y = 62 + ((i * 7) % 9)}
    <circle cx={x} cy={y} r="0.9" fill="#e2e6ff" opacity="0.65" />
  {/each}
{/if}

<!-- A weeping willow edge on every spot, and fireflies drifting about. -->
<path
  d="M0 0 Q14 18 6 46 M10 0 Q20 22 16 40 M150 0 Q140 20 148 44"
  stroke="#3e5a5a"
  stroke-width="1.4"
  fill="none"
  opacity="0.7"
/>
<g class="fireflies">
  {#each fireflies as [x, y, d] (x)}
    <circle cx={x} cy={y} r="1.1" fill="#fff3b0" style:--d="{d}s" />
  {/each}
</g>

<style>
  .twinkle {
    animation: twinkle 3s ease-in-out infinite;
    animation-delay: var(--d);
  }

  @keyframes twinkle {
    50% {
      opacity: 0.3;
    }
  }

  .fireflies circle {
    animation: firefly 5s ease-in-out infinite;
    animation-delay: var(--d);
  }

  @keyframes firefly {
    25% {
      transform: translate(3px, -4px);
      opacity: 0.4;
    }
    60% {
      transform: translate(-2px, -6px);
      opacity: 1;
    }
  }

  .shooting path {
    opacity: 0;
    animation: shoot 3.9s ease-in infinite;
    animation-delay: var(--d);
  }

  @keyframes shoot {
    0% {
      opacity: 0;
      transform: translate(0, 0);
    }
    10% {
      opacity: 1;
    }
    35% {
      opacity: 0;
      transform: translate(24px, 18px);
    }
    100% {
      opacity: 0;
    }
  }

  .shimmer {
    animation: shimmer 3s ease-in-out infinite;
  }

  @keyframes shimmer {
    50% {
      opacity: 0.3;
    }
  }

  .drift-z {
    animation: drift-z 4s ease-in-out infinite;
    animation-delay: var(--d);
  }

  @keyframes drift-z {
    50% {
      transform: translate(3px, -4px);
      opacity: 0.4;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .twinkle,
    .fireflies circle,
    .shooting path,
    .shimmer,
    .drift-z {
      animation: none;
    }
  }
</style>
