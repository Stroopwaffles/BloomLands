<script lang="ts">
  import Art from './Art.svelte'

  /**
   * The player's court at home (design doc 7.4: a living court scene). It grows with the court
   * rank: a leaf lean-to for a Wanderer, then a stump cottage. Helpers gather around.
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
