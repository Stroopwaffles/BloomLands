<script lang="ts">
  /**
   * Caves backdrops (160×100, drawn inside SceneBackdrop's svg). Always dark: deep indigo rock,
   * stalactites, glowing fungi and crystal light. The Surface Lift has a shaft of sunshine.
   */
  let { spotId }: { spotId: string } = $props()

  const stalactites: [number, number][] = [
    [8, 14],
    [22, 22],
    [40, 10],
    [62, 18],
    [84, 12],
    [104, 24],
    [126, 14],
    [148, 20],
  ]
  const glows: [number, number, string][] = [
    [18, 58, '#7fe0b0'],
    [46, 50, '#9cf0c4'],
    [112, 54, '#7fe0b0'],
    [142, 60, '#c8b8f0'],
  ]
</script>

<defs>
  <linearGradient id="cave-rock" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#1d1a36" />
    <stop offset="1" stop-color="#2e2a52" />
  </linearGradient>
  <linearGradient id="cave-floor" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#3a3560" />
    <stop offset="1" stop-color="#2a2648" />
  </linearGradient>
  <radialGradient id="cave-glow">
    <stop offset="0" stop-color="#ffffff" stop-opacity="0.5" />
    <stop offset="1" stop-color="#ffffff" stop-opacity="0" />
  </radialGradient>
  <linearGradient id="sunshaft" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#fff3b0" stop-opacity="0.85" />
    <stop offset="1" stop-color="#fff3b0" stop-opacity="0.1" />
  </linearGradient>
</defs>

<rect width="160" height="100" fill="url(#cave-rock)" />
{#each stalactites as [x, h] (x)}
  <path d="M{x - 4} 0 L{x} {h} L{x + 4} 0 Z" fill="#3a3560" stroke="#4e4a7a" stroke-width="0.4" />
{/each}

{#if spotId === 'crystal-seam' || spotId === 'sunken-geode'}
  <!-- Walls of crystal catching a cold light. -->
  {#each Array.from({ length: 14 }, (_, i) => i) as i (i)}
    {@const x = 6 + i * 11.5}
    {@const h = 10 + ((i * 7) % 14)}
    {@const c =
      spotId === 'sunken-geode'
        ? ['#c8a2f0', '#b88ae8', '#fff3d6'][i % 3]
        : ['#8ee0f0', '#7ad0e8', '#b8f0fa'][i % 3]}
    <path
      d="M{x - 3} 56 L{x - 2} {56 - h} L{x} {54 - h - 3} L{x + 2} {56 - h} L{x + 3} 56 Z"
      fill={c}
      stroke="#3a5a8a"
      stroke-width="0.4"
      opacity="0.85"
    />
  {/each}
  <ellipse cx="80" cy="40" rx="60" ry="22" fill="url(#cave-glow)" class="glow" />
{:else if spotId === 'surface-lift'}
  <!-- Digby's lift: a sunbeam pours down the shaft. -->
  <path d="M62 0 L98 0 L116 100 L44 100 Z" fill="url(#sunshaft)" class="glow" />
  <path d="M60 0 L60 70 M100 0 L100 70" stroke="#7a5a44" stroke-width="1.4" />
  <rect
    x="66"
    y="36"
    width="28"
    height="14"
    rx="1.5"
    fill="#8a6a44"
    stroke="#5e4428"
    stroke-width="0.6"
  />
  <path d="M70 36 L70 0 M90 36 L90 0" stroke="#c9ccd6" stroke-width="0.5" />
{:else}
  <!-- The Fungus Gallery: glowing mushrooms all along the cavern walls. -->
  {#each glows as [x, y, c] (x)}
    <circle cx={x} cy={y} r="14" fill="url(#cave-glow)" class="glow" />
    <path d="M{x - 3} {y + 4} Q{x} {y - 6} {x + 3} {y + 4} Z" fill={c} />
    <rect x={x - 0.6} y={y + 4} width="1.2" height="4" fill="#e6e2f0" />
  {/each}
{/if}

<path d="M0 62 Q40 54 80 60 Q120 54 160 62 L160 100 L0 100 Z" fill="url(#cave-floor)" />
<path d="M0 62 Q40 54 80 60 Q120 54 160 62" fill="none" stroke="#4e4a7a" stroke-width="0.8" />
{#each [[24, 80], [70, 90], [118, 82], [146, 92]] as [x, y] (x)}
  <ellipse cx={x} cy={y} rx="6" ry="1.6" fill="#7fe0b0" opacity="0.25" />
{/each}
<g class="drips" fill="#8ee0f0">
  {#each [[30, 0.2], [92, 1.4], [134, 2.6]] as [x, d] (x)}
    <circle cx={x} cy="20" r="0.8" style:--d="{d}s" />
  {/each}
</g>

<style>
  .glow {
    animation: glow 5s ease-in-out infinite;
  }

  @keyframes glow {
    50% {
      opacity: 0.55;
    }
  }

  .drips circle {
    animation: drip 3.2s ease-in infinite;
    animation-delay: var(--d);
  }

  @keyframes drip {
    from {
      transform: translateY(0);
      opacity: 0;
    }
    10% {
      opacity: 1;
    }
    to {
      transform: translateY(44px);
      opacity: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .glow,
    .drips circle {
      animation: none;
    }
  }
</style>
