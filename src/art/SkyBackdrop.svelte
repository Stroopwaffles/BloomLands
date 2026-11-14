<script lang="ts">
  /**
   * Sky Isles backdrops (160×100, drawn inside SceneBackdrop's svg). Floating islands of cloud
   * and stone high above the world. The sky follows the weather: a storm darkens it, a rainbow
   * arches across, and an updraft streams wind lines upward.
   */
  let { spotId, weather = 'updraft' }: { spotId: string; weather?: string } = $props()

  const storm = $derived(weather === 'storm')
  const clouds: [number, number, number][] = [
    [20, 30, 1],
    [70, 18, 1.3],
    [128, 34, 1.1],
  ]
</script>

<defs>
  <linearGradient id="isle-sky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color={storm ? '#5a6a8a' : '#8ac4f0'} />
    <stop offset="0.7" stop-color={storm ? '#8a96b0' : '#cfe8fa'} />
    <stop offset="1" stop-color={storm ? '#a8b0c4' : '#fde3d0'} />
  </linearGradient>
  <linearGradient id="isle-rock" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#b8a894" />
    <stop offset="1" stop-color="#7a6a5a" />
  </linearGradient>
</defs>

<rect width="160" height="100" fill="url(#isle-sky)" />

{#if weather === 'rainbow'}
  <g fill="none" stroke-width="2.6" opacity="0.55">
    {#each ['#f28a8a', '#f2c45c', '#9ccc72', '#7ab4e8', '#b89ae8'] as c, i (c)}
      <path d="M{10 + i * 3} 70 A{70 - i * 3} {58 - i * 3} 0 0 1 {150 - i * 3} 70" stroke={c} />
    {/each}
  </g>
{/if}

<!-- Far-off floating isles. -->
<g opacity="0.6">
  <path d="M8 46 L36 46 L28 58 L16 58 Z" fill="#a89a88" />
  <path d="M8 46 Q22 40 36 46 Z" fill="#9ccc72" />
  <path d="M120 40 L150 40 L142 54 L128 54 Z" fill="#a89a88" />
  <path d="M120 40 Q135 34 150 40 Z" fill="#9ccc72" />
</g>

{#each clouds as [x, y, s] (x)}
  <g
    class="cloud"
    transform="translate({x} {y}) scale({s})"
    fill={storm ? '#8a96b0' : '#ffffff'}
    opacity="0.9"
  >
    <circle cx="-8" cy="0" r="6" />
    <circle cx="0" cy="-3" r="8" />
    <circle cx="9" cy="0" r="6" />
  </g>
{/each}

{#if spotId === 'windharp-cliffs'}
  <path
    d="M0 52 L30 48 L44 60 L60 50 L90 56 L120 46 L160 54 L160 100 L0 100 Z"
    fill="url(#isle-rock)"
  />
  <path
    d="M0 52 L30 48 L44 60 L60 50 L90 56 L120 46 L160 54"
    fill="none"
    stroke="#5e4e3e"
    stroke-width="0.8"
  />
  {#each [24, 64, 104, 140] as x (x)}
    <path
      d="M{x} 70 l0 18 M{x + 4} 68 l0 22 M{x + 8} 72 l0 14"
      stroke="#5e4e3e"
      stroke-width="0.6"
    />
  {/each}
{:else if spotId === 'aurora-garden'}
  <g opacity="0.55" class="aurora">
    <path d="M0 20 Q40 4 80 18 Q120 32 160 14 L160 30 Q120 46 80 32 Q40 18 0 36 Z" fill="#9cf0c4" />
    <path
      d="M0 30 Q40 16 80 28 Q120 40 160 24 L160 36 Q120 50 80 40 Q40 28 0 42 Z"
      fill="#c8a2f0"
    />
  </g>
  <path d="M10 62 Q80 48 150 62 L140 100 L20 100 Z" fill="#fde3d0" />
  <path d="M10 62 Q80 48 150 62" fill="none" stroke="#f7a68a" stroke-width="1" />
{:else if spotId === 'cloud-archive'}
  <path d="M0 62 Q80 50 160 62 L160 100 L0 100 Z" fill="#eef4fa" />
  {#each [[30, 44], [80, 36], [128, 46]] as [x, y] (x)}
    <g class="cloud" transform="translate({x} {y})">
      <rect
        x="-9"
        y="-6"
        width="18"
        height="12"
        rx="3"
        fill="#fffaf0"
        stroke="#9ab4c8"
        stroke-width="0.6"
      />
      <path d="M-6 -2 L6 -2 M-6 1 L4 1" stroke="#9ab4c8" stroke-width="0.6" />
    </g>
  {/each}
{:else}
  <!-- Cloudbloom Terraces: gardens stepped down a cloud. -->
  <g fill="#ffffff" stroke="#c8daea" stroke-width="0.6">
    <path d="M0 58 Q40 50 80 56 Q120 50 160 58 L160 70 L0 70 Z" />
    <path d="M0 70 Q40 64 80 72 Q120 66 160 72 L160 84 L0 84 Z" fill="#f4f8fc" />
    <path d="M0 84 Q40 78 80 86 Q120 80 160 86 L160 100 L0 100 Z" fill="#eaf2f8" />
  </g>
{/if}

{#if weather === 'updraft'}
  <g class="updraft" stroke="#ffffff" stroke-width="0.6" stroke-linecap="round" opacity="0.7">
    {#each [[20, 0], [54, 0.8], [96, 1.6], [136, 2.4]] as [x, d] (x)}
      <path d="M{x} 90 q-3 -10 0 -20 q3 -10 0 -20" fill="none" style:--d="{d}s" />
    {/each}
  </g>
{:else if storm}
  <g class="flash">
    <path d="M110 6 L102 24 L110 24 L100 44" fill="none" stroke="#fff3b0" stroke-width="1.4" />
  </g>
  <g stroke="#c8d4e8" stroke-width="0.5" opacity="0.6">
    {#each Array.from({ length: 30 }, (_, i) => i) as i (i)}
      <path d="M{(i * 37) % 160} {(i * 23) % 70} l-4 9" class="storm-rain" />
    {/each}
  </g>
{/if}

<style>
  .cloud {
    animation: cloud-drift 14s ease-in-out infinite;
  }

  @keyframes cloud-drift {
    50% {
      translate: 4px 0;
    }
  }

  .updraft path {
    animation: rise 3s linear infinite;
    animation-delay: var(--d);
    opacity: 0;
  }

  @keyframes rise {
    0% {
      transform: translateY(10px);
      opacity: 0;
    }
    40% {
      opacity: 0.8;
    }
    100% {
      transform: translateY(-20px);
      opacity: 0;
    }
  }

  .flash {
    animation: flash 4s steps(1) infinite;
    opacity: 0;
  }

  @keyframes flash {
    0%,
    100% {
      opacity: 0;
    }
    4% {
      opacity: 1;
    }
    8% {
      opacity: 0;
    }
  }

  .storm-rain {
    animation: storm-rain 0.6s linear infinite;
  }

  @keyframes storm-rain {
    to {
      transform: translate(-3px, 8px);
    }
  }

  .aurora {
    animation: aurora 8s ease-in-out infinite;
  }

  @keyframes aurora {
    50% {
      opacity: 0.3;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .cloud,
    .updraft path,
    .flash,
    .storm-rain,
    .aurora {
      animation: none;
    }
  }
</style>
