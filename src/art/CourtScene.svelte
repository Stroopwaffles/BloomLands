<script lang="ts">
  import Art from './Art.svelte'

  /**
   * The player's court at home (design doc 7.4: a living court scene), in seven stages, one per
   * court rank: a leaf lean-to, a stump cottage, a hedge and chimney, a mushroom-roofed second
   * room, a blossom tree and bunting, a moon tower with lanterns, and at last a Grand Court with
   * golden banners. Helpers gather around.
   */
  let {
    rank,
    helperTypes,
    size = 260,
    captain = false,
  }: { rank: number; helperTypes: string[]; size?: number; captain?: boolean } = $props()

  const shown = $derived(helperTypes.slice(0, 5))
</script>

<div class="court" style:width="{size}px">
  <svg class="backdrop" viewBox="0 0 120 90" aria-hidden="true">
    <defs>
      <linearGradient id="court-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#fde7ef" />
        <stop offset="1" stop-color="#fff7e8" />
      </linearGradient>
    </defs>
    <rect width="120" height="90" rx="14" fill="url(#court-sky)" />
    <path d="M0 66 Q60 56 120 66 L120 90 L0 90 Z" fill="#b6e09c" />
    {#if rank >= 6}
      <!-- Grand Court: a warm glow over everything. -->
      <circle cx="92" cy="30" r="40" fill="#fff3b0" opacity="0.35" />
    {/if}
    {#if rank >= 4}
      <!-- Blossom Court: a blossoming tree behind the court. -->
      <path d="M56 66 L56 34" stroke="#8a5a3a" stroke-width="2.6" />
      <g fill="#f7b7c8" stroke="#d98aa4" stroke-width="0.8">
        <circle cx="48" cy="30" r="9" />
        <circle cx="60" cy="24" r="10" />
        <circle cx="64" cy="36" r="8" />
        <circle cx="50" cy="40" r="7" />
      </g>
      <g fill="#ffffff">
        <circle cx="52" cy="28" r="1" />
        <circle cx="62" cy="30" r="1" />
        <circle cx="56" cy="38" r="1" />
      </g>
    {/if}
    {#if rank >= 5}
      <!-- Moon Court: a slender tower with a moon window. -->
      <path
        d="M100 66 L100 14 L112 14 L112 66 Z"
        fill="#b8a2d8"
        stroke="#7a68a8"
        stroke-width="1.2"
      />
      <path d="M98 14 L106 2 L114 14 Z" fill="#7a68a8" stroke="#5a4a88" stroke-width="1" />
      <path d="M107 22 a4 4 0 1 0 0 8 a3 3 0 1 1 0 -8 Z" fill="#fff3b0" />
    {/if}
    {#if rank >= 6}
      <!-- Grand Court: a second tower and golden banners. -->
      <path d="M62 66 L62 26 L70 26 L70 66 Z" fill="#e2c8a8" stroke="#a8875d" stroke-width="1" />
      <path d="M60 26 L66 16 L72 26 Z" fill="#c98a1c" stroke="#8a6a2a" stroke-width="1" />
      <path d="M66 16 L66 8 L74 11 L66 14" fill="#f7b7c8" stroke="#c97a8c" stroke-width="0.6" />
      <path d="M106 2 L106 -4 L114 -1 L106 2" fill="#f2c45c" stroke="#a87e1a" stroke-width="0.6" />
    {/if}
    {#if rank >= 3}
      <!-- Bramble Court: a second room, under its own mushroom roof. -->
      <path
        d="M60 68 L61 50 Q68 45 75 50 L76 68 Z"
        fill="#b8865a"
        stroke="#8f6a3a"
        stroke-width="1.2"
      />
      <path
        d="M56 52 Q68 38 80 52 Q68 47 56 52 Z"
        fill="#e2564a"
        stroke="#a83a2e"
        stroke-width="1.2"
      />
      <g fill="#ffffff"><circle cx="64" cy="46" r="1.4" /><circle cx="71" cy="44" r="1.2" /></g>
      <rect
        x="65"
        y="56"
        width="5"
        height="5"
        rx="1"
        fill="#ffe59e"
        stroke="#c99a24"
        stroke-width="0.6"
      />
    {/if}
    {#if rank === 0}
      <!-- A wanderer's leaf lean-to -->
      <path d="M70 66 L92 30 L110 66 Z" fill="#9dd28f" stroke="#5f9a55" stroke-width="1.4" />
      <path d="M92 30 L92 66" stroke="#5f9a55" stroke-width="1" />
      <path d="M84 66 L92 50 L100 66 Z" fill="#6b8f5a" />
    {:else}
      <!-- A stump cottage -->
      <path
        d="M72 68 L73 36 Q91 26 109 36 L110 68 Z"
        fill="#c99a6a"
        stroke="#8f6a3a"
        stroke-width="1.4"
      />
      <path
        d="M66 38 Q91 12 116 38 Q91 28 66 38 Z"
        fill="#8cc97f"
        stroke="#4f8a4a"
        stroke-width="1.4"
      />
      <path
        d="M86 68 L86 54 Q91 49 96 54 L96 68 Z"
        fill="#6b4a32"
        stroke="#4a3220"
        stroke-width="1"
      />
      <circle cx="102" cy="46" r="3.2" fill="#ffe59e" stroke="#c99a24" stroke-width="1" />
      {#if rank >= 2}
        <path
          d="M108 30 L108 18 L114 18 L114 34"
          fill="#a9805a"
          stroke="#8f6a3a"
          stroke-width="1"
        />
        <circle cx="111" cy="12" r="3" fill="#ffffff" opacity="0.7" />
      {/if}
      {#if rank >= 4}
        <!-- Bunting across the front. -->
        <path d="M72 40 Q91 48 110 40" fill="none" stroke="#a8875d" stroke-width="0.6" />
        {#each [76, 82, 88, 94, 100, 106] as x, i (x)}
          <path
            d="M{x - 2} {41 + Math.sin((i / 5) * Math.PI) * 4} l2 4 l2 -4 Z"
            fill={['#f7b7c8', '#ffd94f', '#cdbbf5'][i % 3]}
          />
        {/each}
      {/if}
      {#if rank >= 5}
        <!-- Lanterns glowing along the path. -->
        {#each [74, 88, 102] as x (x)}
          <circle cx={x} cy="70" r="2.6" fill="#fff3b0" opacity="0.5" />
          <circle cx={x} cy="70" r="1.2" fill="#ffb84f" />
        {/each}
      {/if}
      {#if rank >= 6}
        <!-- A golden arch over the door. -->
        <path
          d="M83 68 L83 52 Q91 42 99 52 L99 68"
          fill="none"
          stroke="#e2b94f"
          stroke-width="1.6"
        />
      {/if}
    {/if}
    {#if rank >= 2}
      <!-- Hedge Court: a flowering hedge along the front. -->
      <g fill="#6fa05a" stroke="#4f7a3e" stroke-width="0.8">
        <ellipse cx="68" cy="72" rx="6" ry="4" />
        <ellipse cx="79" cy="73" rx="6" ry="4" />
        <ellipse cx="104" cy="73" rx="6" ry="4" />
        <ellipse cx="115" cy="72" rx="6" ry="4" />
      </g>
      <g fill="#f7b7c8">
        <circle cx="66" cy="70" r="1.1" />
        <circle cx="80" cy="71" r="1.1" />
        <circle cx="106" cy="71" r="1.1" />
        <circle cx="114" cy="70" r="1.1" />
      </g>
    {/if}
    {#each [[10, 70, '#f7b7c8'], [24, 74, '#ffffff'], [56, 72, '#ffd94f'], [116, 74, '#cdbbf5']] as [x, y, c] (x)}
      <circle cx={x} cy={y} r="1.8" fill={c as string} stroke="#d9a7b4" stroke-width="0.4" />
    {/each}
  </svg>

  <div class="fairy"><Art id="char-fairy" size={size * 0.5} /></div>
  {#if captain}
    <!-- Captain Mallow, at home at your court. -->
    <div class="captain"><Art id="char-captain-mallow" size={size * 0.3} /></div>
  {/if}
  <div class="helpers">
    {#each shown as type, i (i)}
      <span class="helper" style:--i={i}><Art id={`helper-${type}`} size={size * 0.14} /></span>
    {/each}
  </div>
</div>

<style>
  /* At night the court is in moonlight. */
  :global([data-theme='night']) .court {
    filter: brightness(0.62) saturate(0.8) hue-rotate(-12deg);
  }

  .court {
    position: relative;
    aspect-ratio: 4 / 3;
  }

  .backdrop {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  .fairy {
    position: absolute;
    left: 6%;
    bottom: 6%;
    width: 50%;
  }

  .fairy :global(svg) {
    width: 100%;
    height: auto;
  }

  .captain {
    position: absolute;
    right: 2%;
    bottom: 22%;
    width: 30%;
  }

  .captain :global(svg) {
    width: 100%;
    height: auto;
  }

  .helpers {
    position: absolute;
    left: 46%;
    right: 2%;
    bottom: 6%;
    height: 20%;
  }

  .helper {
    position: absolute;
    bottom: 0;
    left: calc(var(--i) * 16%);
    animation: bob 2.4s ease-in-out infinite;
    animation-delay: calc(var(--i) * 0.3s);
  }

  @keyframes bob {
    50% {
      transform: translateY(-3px);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .helper {
      animation: none;
    }
  }
</style>
