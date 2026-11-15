<script lang="ts">
  /**
   * The Crimson Vale (160×100, drawn inside an svg). Spooky: a huge blood-red moon, black dead
   * trees, crooked gravestones, bats wheeling about and fog creeping along the ground. The
   * Moonless Manor gets a gothic hall.
   */
  let { spotId }: { spotId: string } = $props()

  const bats: [number, number, number][] = [
    [30, 18, 0],
    [62, 10, 1.3],
    [104, 22, 2.1],
    [138, 14, 0.7],
  ]
  const stars: [number, number][] = [
    [10, 8],
    [44, 14],
    [84, 6],
    [150, 24],
    [24, 30],
  ]
</script>

<defs>
  <linearGradient id="crimson-sky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#14060e" />
    <stop offset="0.6" stop-color="#3a0e1e" />
    <stop offset="1" stop-color="#5a1424" />
  </linearGradient>
  <radialGradient id="blood-glow">
    <stop offset="0" stop-color="#ff4a5a" stop-opacity="0.55" />
    <stop offset="1" stop-color="#ff4a5a" stop-opacity="0" />
  </radialGradient>
  <linearGradient id="crimson-ground" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#2a0e1a" />
    <stop offset="1" stop-color="#14060c" />
  </linearGradient>
</defs>

<rect width="160" height="100" fill="url(#crimson-sky)" />
{#each stars as [x, y] (x)}
  <circle cx={x} cy={y} r="0.6" fill="#ffd6dc" opacity="0.7" />
{/each}

<!-- The Blood Moon. -->
<circle cx="112" cy="26" r="30" fill="url(#blood-glow)" class="pulse" />
<circle cx="112" cy="26" r="15" fill="#c8243a" />
<circle cx="107" cy="22" r="3" fill="#a81a30" />
<circle cx="117" cy="30" r="2.2" fill="#a81a30" />
<circle cx="114" cy="19" r="1.4" fill="#a81a30" />

{#if spotId === 'moonless-manor'}
  <!-- A gothic manor on its hill. -->
  <path d="M0 70 Q80 58 160 70 L160 100 L0 100 Z" fill="url(#crimson-ground)" />
  <g fill="#0e0408" stroke="#3a0e1e" stroke-width="0.6">
    <path d="M30 70 L30 40 L36 30 L42 40 L42 70 Z" />
    <path d="M42 70 L42 48 L80 48 L80 70 Z" />
    <path d="M42 48 L61 34 L80 48 Z" />
    <path d="M80 70 L80 36 L86 24 L92 36 L92 70 Z" />
  </g>
  <g fill="#ff8a3a" class="flicker">
    <rect x="34" y="46" width="4" height="6" rx="2" />
    <rect x="50" y="54" width="4" height="7" rx="2" />
    <rect x="68" y="54" width="4" height="7" rx="2" />
    <rect x="84" y="42" width="4" height="6" rx="2" />
  </g>
{:else if spotId === 'thornwood-hollow'}
  <path d="M0 62 Q80 54 160 62 L160 100 L0 100 Z" fill="url(#crimson-ground)" />
  <g fill="none" stroke="#0e0408" stroke-width="2.2" stroke-linecap="round">
    {#each [10, 40, 120, 150] as x (x)}
      <path d="M{x} 64 Q{x - 4} 40 {x + 2} 20 M{x} 44 l-8 -6 M{x + 1} 34 l7 -8 M{x - 1} 52 l9 -4" />
    {/each}
  </g>
  <g fill="#ff3a4a">
    {#each [[36, 40], [44, 41], [128, 36], [136, 37]] as [x, y] (x)}
      <circle cx={x} cy={y} r="0.9" class="eyes" />
    {/each}
  </g>
{:else if spotId === 'bat-belfry'}
  <path d="M0 66 Q80 58 160 66 L160 100 L0 100 Z" fill="url(#crimson-ground)" />
  <g fill="#0e0408" stroke="#3a0e1e" stroke-width="0.6">
    <path d="M24 66 L24 30 L36 18 L48 30 L48 66 Z" />
    <path d="M30 30 L42 30 L42 40 Q36 34 30 40 Z" fill="#3a0e1e" />
  </g>
  <path d="M33 36 Q36 31 39 36 Z" fill="#8a6a3a" />
{:else}
  <!-- Graveblossom Garden: a forgotten graveyard. -->
  <path d="M0 60 Q80 52 160 60 L160 100 L0 100 Z" fill="url(#crimson-ground)" />
  <g fill="#3a2a34" stroke="#14060c" stroke-width="0.6">
    {#each [[14, 62, -6], [52, 58, 4], [100, 58, -3], [140, 62, 7]] as [x, y, t] (x)}
      <path
        d="M{x - 5} {y} L{x - 5} {y - 10} Q{x} {y - 16} {x + 5} {y - 10} L{x + 5} {y} Z"
        transform="rotate({t} {x} {y})"
      />
    {/each}
  </g>
  <path d="M76 58 L76 30 M70 38 L82 38" stroke="#14060c" stroke-width="2" />
{/if}

<!-- Bats wheeling under the moon. -->
<g class="bats" fill="#0a0206">
  {#each bats as [x, y, d] (x)}
    <path
      d="M{x} {y} q-3 -3 -6 -1 q2 0 2 2 q-2 -1 -3 1 q3 0 4 2 Z M{x} {y} q3 -3 6 -1 q-2 0 -2 2 q2 -1 3 1 q-3 0 -4 2 Z"
      style:--d="{d}s"
    />
  {/each}
</g>

<!-- Fog along the ground. -->
<g class="fog" fill="#c8a2b0" opacity="0.18">
  <ellipse cx="40" cy="84" rx="50" ry="6" />
  <ellipse cx="120" cy="88" rx="56" ry="7" />
</g>

<style>
  .pulse {
    animation: pulse 6s ease-in-out infinite;
  }

  @keyframes pulse {
    50% {
      opacity: 0.6;
    }
  }

  .bats path {
    animation: flap 2.6s ease-in-out infinite;
    animation-delay: var(--d);
  }

  @keyframes flap {
    50% {
      transform: translate(4px, -3px);
    }
  }

  .fog {
    animation: fog 14s ease-in-out infinite;
  }

  @keyframes fog {
    50% {
      transform: translateX(8px);
    }
  }

  .flicker {
    animation: flicker 2.2s steps(2) infinite;
  }

  @keyframes flicker {
    50% {
      opacity: 0.6;
    }
  }

  .eyes {
    animation: blink 4s steps(1) infinite;
  }

  @keyframes blink {
    90% {
      opacity: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .pulse,
    .bats path,
    .fog,
    .flicker,
    .eyes {
      animation: none;
    }
  }
</style>
