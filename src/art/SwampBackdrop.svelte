<script lang="ts">
  /**
   * Swamp backdrops (160×100, drawn inside SceneBackdrop's svg). Teal water, olive banks, reeds,
   * lily pads and a soft purple haze; warm, misty and a little silly.
   */
  let { spotId }: { spotId: string } = $props()

  const reeds: [number, number, number][] = [
    [4, 46, -2],
    [10, 40, 1],
    [16, 50, -1],
    [142, 44, 2],
    [150, 38, -1],
    [156, 48, 1],
  ]
  const pads: [number, number, number][] = [
    [30, 74, 9],
    [62, 84, 11],
    [104, 76, 10],
    [130, 90, 12],
    [16, 92, 10],
  ]
</script>

<defs>
  <linearGradient id="swamp-sky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#b9d9cf" />
    <stop offset="1" stop-color="#eef0d2" />
  </linearGradient>
  <linearGradient id="swamp-water" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#8cc2b6" />
    <stop offset="1" stop-color="#5e9a8e" />
  </linearGradient>
  <linearGradient id="wisp-sky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#3d4a6e" />
    <stop offset="1" stop-color="#6e7aa0" />
  </linearGradient>
  <linearGradient id="wisp-water" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#4f6e8e" />
    <stop offset="1" stop-color="#3a5070" />
  </linearGradient>
</defs>

{#if spotId === 'wisp-hollow'}
  <!-- A hidden pool at dusk, lit by drifting will-o'-wisps. -->
  <rect width="160" height="100" fill="url(#wisp-sky)" />
  <g fill="#2e3a52" opacity="0.8">
    <path d="M0 50 Q20 20 40 46 Q56 28 74 44 L74 60 L0 60 Z" />
    <path d="M90 46 Q110 24 128 44 Q142 30 160 42 L160 60 L90 60 Z" />
  </g>
  <path d="M0 56 Q80 50 160 56 L160 100 L0 100 Z" fill="url(#wisp-water)" />
  <ellipse cx="80" cy="76" rx="56" ry="12" fill="#8fb8d9" opacity="0.25" />
  {#each pads as [x, y, r] (x)}
    <ellipse
      cx={x}
      cy={y}
      rx={r}
      ry={r * 0.35}
      fill="#4f7a5e"
      stroke="#2e5a42"
      stroke-width="0.5"
    />
  {/each}
  <g class="wisps">
    {#each [[24, 40], [56, 30], [88, 46], [118, 34], [142, 50], [72, 60]] as [x, y], i (i)}
      <g style:--d="{i * 0.8}s">
        <circle cx={x} cy={y} r="4" fill="#bfe8ff" opacity="0.35" />
        <circle cx={x} cy={y} r="1.4" fill="#ffffff" />
      </g>
    {/each}
  </g>
{:else}
  <rect width="160" height="100" fill="url(#swamp-sky)" />
  <!-- willows far off -->
  <g fill="#8fae8a" opacity="0.7">
    <ellipse cx="24" cy="30" rx="26" ry="18" />
    <ellipse cx="132" cy="28" rx="30" ry="20" />
  </g>
  <g stroke="#7fa07a" stroke-width="0.8" fill="none" opacity="0.7">
    {#each [8, 16, 24, 32, 40, 116, 124, 132, 140, 148] as x (x)}
      <path d="M{x} 24 q-1 14 1 26" />
    {/each}
  </g>
  <path d="M0 50 Q40 44 80 48 Q120 42 160 48 L160 100 L0 100 Z" fill="url(#swamp-water)" />
  <g stroke="#d6f0ea" stroke-width="0.6" fill="none" opacity="0.7">
    <path d="M20 60 q8 -2 16 0" /><path d="M90 58 q10 -2 20 0" /><path d="M54 70 q6 -1.6 12 0" />
  </g>

  {#if spotId === 'reeds-hollow'}
    <!-- a muddy bank thick with reeds and cattails -->
    <path d="M0 64 Q50 56 100 66 Q130 72 160 62 L160 100 L0 100 Z" fill="#8a9a5a" />
    <path d="M0 64 Q50 56 100 66 Q130 72 160 62" fill="none" stroke="#6a7a3e" stroke-width="1" />
    <g class="sway-reeds">
      {#each Array.from({ length: 18 }, (_, i) => i) as i (i)}
        {@const x = 4 + i * 9}
        <path
          d="M{x} 70 q{(i % 3) - 1} -16 {(i % 5) - 2} -{24 + (i % 4) * 4}"
          stroke="#6f8f42"
          stroke-width="1.2"
          fill="none"
        />
        {#if i % 3 === 0}
          <rect
            x={x + (i % 5) - 3.2}
            y={46 - (i % 4) * 4}
            width="2.4"
            height="6"
            rx="1.2"
            fill="#8a5a34"
          />
        {/if}
      {/each}
    </g>
    <path d="M0 80 Q80 74 160 82 L160 100 L0 100 Z" fill="#7a8a4e" opacity="0.6" />
  {:else}
    <!-- open pools: lily pads and a reed fringe -->
    {#each pads as [x, y, r] (x)}
      <ellipse
        cx={x}
        cy={y}
        rx={r}
        ry={r * 0.35}
        fill="#6fae5f"
        stroke="#4f8a4a"
        stroke-width="0.5"
      />
      <path d="M{x} {y} L{x + r} {y - 0.6}" stroke="#4f8a4a" stroke-width="0.5" />
    {/each}
    {#each [[62, 81, '#f7c6d4'], [104, 73, '#ffffff']] as [x, y, c] (x)}
      <g transform="translate({x} {y})">
        <path d="M-2.4 0 Q0 -5 2.4 0 Z" fill={c as string} stroke="#c97a8c" stroke-width="0.3" />
      </g>
    {/each}
    <g class="sway-reeds">
      {#each reeds as [x, h, lean] (x)}
        <path
          d="M{x} 60 q{lean} -{h / 2} {lean * 2} -{h}"
          stroke="#6f8f42"
          stroke-width="1.2"
          fill="none"
        />
      {/each}
    </g>
  {/if}
  <!-- dragonflies -->
  <g class="flit" fill="#bfe8ff" stroke="#5e8aa8" stroke-width="0.3">
    <ellipse cx="70" cy="34" rx="2.4" ry="0.8" />
    <ellipse cx="72" cy="34" rx="2.4" ry="0.8" />
    <path d="M71 34 l6 0.6" stroke="#3e6e9a" stroke-width="0.8" />
  </g>
{/if}

<style>
  .sway-reeds {
    animation: reeds 6s ease-in-out infinite;
    transform-origin: 80px 70px;
  }

  @keyframes reeds {
    50% {
      transform: skewX(-2deg);
    }
  }

  .wisps g {
    animation: wisp 5s ease-in-out infinite;
    animation-delay: var(--d);
  }

  @keyframes wisp {
    50% {
      transform: translate(3px, -4px);
      opacity: 0.6;
    }
  }

  .flit {
    animation: flit 9s ease-in-out infinite;
  }

  @keyframes flit {
    25% {
      transform: translate(30px, -6px);
    }
    50% {
      transform: translate(54px, 4px);
    }
    75% {
      transform: translate(20px, 8px);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .sway-reeds,
    .wisps g,
    .flit {
      animation: none;
    }
  }
</style>
