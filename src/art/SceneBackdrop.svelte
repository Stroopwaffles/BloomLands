<script lang="ts">
  import { SPOTS } from '../data/world'
  import ForestBackdrop from './ForestBackdrop.svelte'
  import CavesBackdrop from './CavesBackdrop.svelte'
  import GladeBackdrop from './GladeBackdrop.svelte'
  import OrchardBackdrop from './OrchardBackdrop.svelte'
  import SwampBackdrop from './SwampBackdrop.svelte'

  /**
   * Painted backdrops for harvesting spots. Wide (160×100) and cropped to fill the scene.
   * Night is a tinted overlay with stars, added by the scene itself.
   */
  let {
    spotId,
    night = false,
    weather = 'sunshine',
  }: { spotId: string; night?: boolean; weather?: string } = $props()

  const region = $derived(SPOTS[spotId]?.regionId ?? 'meadow')

  const tufts = (points: [number, number][], color: string) =>
    points.map(([x, y]) => ({ x, y, color }))
</script>

<svg class="backdrop" viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <defs>
    <linearGradient id="sky-day" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#bfe4ff" />
      <stop offset="1" stop-color="#fff3d6" />
    </linearGradient>
    <linearGradient id="sky-glade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#cfe9d0" />
      <stop offset="1" stop-color="#f3f7dc" />
    </linearGradient>
    <linearGradient id="hill-near" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#b6e09c" />
      <stop offset="1" stop-color="#8cc97a" />
    </linearGradient>
    <radialGradient id="glade-light" cx="0.5" cy="0.2" r="0.6">
      <stop offset="0" stop-color="#fffbe0" stop-opacity="0.9" />
      <stop offset="1" stop-color="#fffbe0" stop-opacity="0" />
    </radialGradient>
  </defs>

  {#if region === 'forest'}
    <ForestBackdrop {spotId} />
  {:else if region === 'swamp'}
    <SwampBackdrop {spotId} />
  {:else if region === 'orchard'}
    <OrchardBackdrop {spotId} />
  {:else if region === 'caves'}
    <CavesBackdrop {spotId} />
  {:else if region === 'glade'}
    <GladeBackdrop {spotId} {weather} />
  {:else if spotId === 'fairy-ring'}
    <rect width="160" height="100" fill="url(#sky-glade)" />
    <g fill="#7fae74" stroke="#5f8f58" stroke-width="0.6">
      <circle cx="12" cy="30" r="20" />
      <circle cx="30" cy="20" r="18" />
      <circle cx="132" cy="22" r="19" />
      <circle cx="150" cy="34" r="18" />
    </g>
    <path d="M0 46 Q80 34 160 46 L160 100 L0 100 Z" fill="url(#hill-near)" />
    <rect width="160" height="70" fill="url(#glade-light)" />
    <ellipse cx="80" cy="69" rx="38" ry="18" fill="none" stroke="#9fd38c" stroke-width="2.4" />
    {#each Array.from({ length: 14 }, (_, i) => i) as i (i)}
      {@const a = (i / 14) * Math.PI * 2}
      {@const x = 80 + Math.cos(a) * 40}
      {@const y = 69 + Math.sin(a) * 19}
      <g transform="translate({x} {y})">
        <rect x="-0.8" y="-2.4" width="1.6" height="2.6" fill="#fbf1e2" />
        <path
          d="M-2.6 -2.2 Q0 -5.4 2.6 -2.2 Z"
          fill="#f08a9e"
          stroke="#c45d74"
          stroke-width="0.4"
        />
      </g>
    {/each}
  {:else}
    <rect width="160" height="100" fill="url(#sky-day)" />
    {#if !night && weather === 'sunshine'}
      <circle cx="132" cy="18" r="9" fill="#ffe59e" stroke="#f2c65c" stroke-width="0.8" />
      <g stroke="#ffe59e" stroke-width="1" stroke-linecap="round" class="rays">
        {#each [0, 45, 90, 135, 180, 225, 270, 315] as a (a)}
          <line x1="132" y1="5" x2="132" y2="2" transform="rotate({a} 132 18)" />
        {/each}
      </g>
    {/if}
    {#if weather === 'light-rain'}
      <rect width="160" height="100" fill="#9fb3c8" opacity="0.18" />
      <g fill="#e8eef5" opacity="0.95">
        <ellipse cx="40" cy="14" rx="20" ry="7" />
        <ellipse cx="56" cy="11" rx="14" ry="6" />
        <ellipse cx="118" cy="16" rx="22" ry="7" />
      </g>
    {/if}
    <g fill="white" opacity="0.85">
      <ellipse cx="34" cy="16" rx="12" ry="4" />
      <ellipse cx="42" cy="14" rx="8" ry="4" />
      <ellipse cx="96" cy="24" rx="10" ry="3" />
    </g>
    <path d="M0 52 Q30 38 64 48 Q100 36 160 46 L160 100 L0 100 Z" fill="#cfeab8" />

    {#if spotId === 'dandelion-drift'}
      <path
        d="M0 50 Q30 52 54 74 Q80 92 108 74 Q132 54 160 50 L160 100 L0 100 Z"
        fill="url(#hill-near)"
      />
      <path d="M40 80 Q80 102 122 80" fill="none" stroke="#9fd38c" stroke-width="1.2" />
      <g class="drift" fill="white" stroke="#c9ccd6" stroke-width="0.3">
        {#each [[28, 30], [70, 18], [104, 34], [140, 26], [52, 44], [120, 12]] as [x, y] (x)}
          <g transform="translate({x} {y})">
            <line x1="0" y1="0" x2="0" y2="3" stroke="#b8bcc8" stroke-width="0.4" />
            <circle r="1.6" />
          </g>
        {/each}
      </g>
    {:else}
      <path d="M0 76 Q60 72 100 54 Q130 42 160 40 L160 100 L0 100 Z" fill="url(#hill-near)" />
    {/if}

    {#each tufts([[8, 88], [38, 94], [70, 88], [104, 92], [140, 84], [22, 70], [150, 60]], '#6fae62') as t (t.x)}
      <path
        d="M{t.x - 2} {t.y} l1 -4 1 3 1 -5 1 4 1 -3 1 5 Z"
        fill={t.color}
        stroke="#4f8a4a"
        stroke-width="0.3"
      />
    {/each}
    {#each [[16, 82, '#f7b7c8'], [58, 90, '#ffffff'], [92, 82, '#ffd94f'], [128, 92, '#cdbbf5'], [146, 72, '#ffffff']] as [x, y, c] (x)}
      <circle cx={x} cy={y} r="1.4" fill={c as string} stroke="#d9a7b4" stroke-width="0.3" />
    {/each}
  {/if}

  {#if weather === 'rain'}
    <rect width="160" height="100" fill="#6f8aa0" opacity="0.2" />
  {/if}
  {#if weather === 'light-rain' || weather === 'rain' || weather === 'drizzle'}
    <g class="rain" stroke="#8fb3d6" stroke-width="0.5" stroke-linecap="round" opacity="0.8">
      {#each Array.from({ length: weather === 'rain' ? 60 : weather === 'drizzle' ? 22 : 34 }, (_, i) => i) as i (i)}
        <line
          x1={(i * 47) % 160}
          y1={(i * 29) % 90}
          x2={((i * 47) % 160) - 1.2}
          y2={((i * 29) % 90) + 4}
        />
      {/each}
    </g>
  {:else if weather === 'mist'}
    <g class="mist" fill="#ffffff">
      <rect x="-12" width="184" height="100" opacity="0.1" />
      <ellipse cx="40" cy="70" rx="60" ry="8" opacity="0.5" />
      <ellipse cx="120" cy="56" rx="56" ry="7" opacity="0.45" />
      <ellipse cx="80" cy="88" rx="70" ry="9" opacity="0.4" />
    </g>
  {:else if weather === 'fog'}
    <g class="mist" fill="#e6f2ee">
      <rect x="-12" width="184" height="100" opacity="0.28" />
      <ellipse cx="30" cy="62" rx="70" ry="10" opacity="0.6" />
      <ellipse cx="130" cy="50" rx="60" ry="9" opacity="0.55" />
      <ellipse cx="80" cy="84" rx="80" ry="11" opacity="0.5" />
    </g>
  {:else if weather === 'muggy'}
    <rect width="160" height="100" fill="#f2d98a" opacity="0.16" />
    <g class="shimmer" fill="none" stroke="#fff3c8" stroke-width="0.6" opacity="0.6">
      <path d="M10 40 q10 -2 20 0 q10 2 20 0" />
      <path d="M90 34 q10 -2 20 0 q10 2 20 0" />
      <path d="M50 56 q8 -2 16 0 q8 2 16 0" />
    </g>
  {:else if weather === 'falling-leaves'}
    <g class="leaves">
      {#each [[20, 10, '#e2a83f'], [52, 26, '#c9622f'], [84, 6, '#e2b94f'], [110, 30, '#b8642e'], [140, 14, '#e2a83f'], [66, 46, '#c9622f'], [128, 52, '#e2b94f']] as [x, y, c], i (i)}
        <path
          d="M{x} {y} c2 -2 5 -2 6 0 c-1 2 -4 3 -6 0 Z"
          fill={c as string}
          stroke="#8a4a1e"
          stroke-width="0.3"
          style:--d="{i * 0.7}s"
        />
      {/each}
    </g>
  {:else if weather === 'breeze'}
    <g
      class="breeze"
      fill="none"
      stroke="white"
      stroke-width="0.7"
      stroke-linecap="round"
      opacity="0.8"
    >
      <path d="M10 30 q12 -4 24 0 q6 2 10 -1" />
      <path d="M90 40 q14 -4 28 0 q6 2 10 -1" />
      <path d="M40 56 q10 -3 20 0" />
    </g>
  {/if}

  <!-- The Glade has its own twilight sky and moon. -->
  {#if night && region !== 'glade'}
    <rect width="160" height="100" fill="#1e1b4b" opacity="0.5" />
    <circle cx="130" cy="16" r="6" fill="#fff3b0" />
    <circle cx="133" cy="14" r="5.5" fill="#3a3670" />
    {#each [[20, 10], [48, 20], [76, 8], [104, 18], [150, 30], [62, 30], [10, 32]] as [x, y] (x)}
      <circle cx={x} cy={y} r="0.7" fill="#fff3b0" />
    {/each}
  {/if}
</svg>

<style>
  .backdrop {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  .drift {
    animation: drift 9s ease-in-out infinite;
  }

  .rain {
    animation: rain 0.7s linear infinite;
  }

  @keyframes rain {
    to {
      transform: translate(-3px, 8px);
    }
  }

  .mist {
    animation: breeze-slow 12s ease-in-out infinite;
  }

  .shimmer {
    animation: shimmer 3s ease-in-out infinite;
  }

  @keyframes shimmer {
    50% {
      transform: translateY(-2px);
      opacity: 0.2;
    }
  }

  @keyframes breeze-slow {
    50% {
      transform: translateX(8px);
    }
  }

  .leaves path {
    animation: fall 6s linear infinite;
    animation-delay: var(--d);
  }

  @keyframes fall {
    from {
      transform: translate(0, -10px) rotate(0deg);
      opacity: 0;
    }
    15% {
      opacity: 1;
    }
    to {
      transform: translate(-14px, 60px) rotate(220deg);
      opacity: 0;
    }
  }

  .breeze {
    animation: breeze 4s ease-in-out infinite;
  }

  @keyframes breeze {
    0%,
    100% {
      transform: translateX(-6px);
      opacity: 0;
    }
    50% {
      transform: translateX(6px);
      opacity: 0.8;
    }
  }

  .rays {
    transform-origin: 132px 18px;
    animation: spin 30s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes drift {
    50% {
      transform: translate(4px, -3px);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .drift,
    .rain,
    .breeze,
    .mist,
    .shimmer,
    .leaves path,
    .rays {
      animation: none;
    }
  }
</style>
