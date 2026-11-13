<script lang="ts">
  /**
   * Forest backdrops (160×100, drawn inside SceneBackdrop's svg). Deep greens, mossy browns and
   * mushroom reds; tall trunks, a leafy canopy and shafts of light.
   */
  let { spotId }: { spotId: string } = $props()

  const trunks: [number, number, string][] = [
    [6, 9, '#6e5234'],
    [34, 6, '#7a5c3e'],
    [118, 7, '#6e5234'],
    [148, 10, '#7a5c3e'],
  ]
  const birches: [number, number][] = [
    [14, 4],
    [40, 3.4],
    [112, 3.6],
    [140, 4.4],
  ]
</script>

<defs>
  <linearGradient id="forest-sky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#9fc79a" />
    <stop offset="1" stop-color="#dcebc4" />
  </linearGradient>
  <linearGradient id="forest-floor" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#7a9a52" />
    <stop offset="1" stop-color="#5e7a3e" />
  </linearGradient>
  <linearGradient id="log-inside" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#5e4428" />
    <stop offset="1" stop-color="#8a6a44" />
  </linearGradient>
  <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#fffbe0" stop-opacity="0.75" />
    <stop offset="1" stop-color="#fffbe0" stop-opacity="0" />
  </linearGradient>
  <linearGradient id="grove-sky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#d9e8f5" />
    <stop offset="1" stop-color="#f3f5e6" />
  </linearGradient>
</defs>

{#if spotId === 'hollow-log-library'}
  <!-- Inside a fallen log: curved wooden walls lined with mossy shelves of tiny books. -->
  <rect width="160" height="100" fill="url(#log-inside)" />
  <path d="M0 0 Q80 26 160 0 L160 8 Q80 34 0 8 Z" fill="#3e2c18" opacity="0.6" />
  {#each [24, 44] as y (y)}
    <rect x="6" {y} width="148" height="2.6" rx="1" fill="#a8875d" />
    <path
      d="M6 {y} q10 -2 20 0 q14 -3 28 0 q16 -2 30 0"
      fill="none"
      stroke="#7fae5a"
      stroke-width="1.4"
    />
    {#each Array.from({ length: 22 }, (_, i) => i) as i (i)}
      <rect
        x={10 + i * 6.4}
        y={y - 9 + (i % 3)}
        width="4.6"
        height={9 - (i % 3)}
        rx="0.6"
        fill={['#c23a4c', '#3a74a8', '#6e8f4a', '#e2b94f', '#9a86cf'][i % 5]}
        stroke="#3e2c18"
        stroke-width="0.3"
      />
    {/each}
  {/each}
  <ellipse cx="128" cy="16" rx="10" ry="6" fill="#fff3b0" opacity="0.35" />
  <path d="M0 60 Q80 50 160 60 L160 100 L0 100 Z" fill="#7a9a52" />
  <path d="M0 60 Q80 50 160 60" fill="none" stroke="#5e7a3e" stroke-width="1.2" />
  <g fill="#fffbe0" opacity="0.8">
    <circle cx="30" cy="34" r="0.8" /><circle cx="90" cy="30" r="0.7" /><circle
      cx="140"
      cy="36"
      r="0.8"
    />
  </g>
{:else if spotId === 'lost-grove'}
  <!-- A silver-birch glade: pale trunks, soft blue light, falling catkin fluff. -->
  <rect width="160" height="100" fill="url(#grove-sky)" />
  {#each birches as [x, w] (x)}
    <rect
      x={x - w / 2}
      y="0"
      width={w}
      height="70"
      fill="#f3f1ea"
      stroke="#c9c3b4"
      stroke-width="0.4"
    />
    {#each [12, 26, 40, 54] as y (y)}
      <path d="M{x - w / 2} {y + (x % 5)} l{w * 0.6} 0.6" stroke="#3d3550" stroke-width="0.8" />
    {/each}
  {/each}
  <g fill="#cfe3b0" stroke="#9cb87a" stroke-width="0.4">
    <ellipse cx="20" cy="8" rx="26" ry="12" />
    <ellipse cx="140" cy="8" rx="28" ry="12" />
  </g>
  <path d="M0 58 Q80 48 160 58 L160 100 L0 100 Z" fill="#a8cc8a" />
  <ellipse cx="80" cy="76" rx="50" ry="14" fill="#c7e3a8" opacity="0.7" />
  <g class="sparkle" fill="#ffffff">
    {#each [[30, 30], [62, 18], [96, 36], [126, 26], [76, 44]] as [x, y] (x)}
      <circle cx={x} cy={y} r="0.9" />
    {/each}
  </g>
{:else}
  <rect width="160" height="100" fill="url(#forest-sky)" />
  <!-- far trees -->
  <g fill="#7fa56a" opacity="0.8">
    {#each [12, 44, 76, 108, 140] as x (x)}
      <rect x={x - 3} y="10" width="6" height="50" />
    {/each}
  </g>
  <g fill="#6f9a5b" stroke="#4f7a3a" stroke-width="0.5">
    <ellipse cx="20" cy="4" rx="34" ry="14" />
    <ellipse cx="80" cy="0" rx="38" ry="12" />
    <ellipse cx="140" cy="4" rx="34" ry="14" />
  </g>
  {#if spotId === 'mossy-stump-ring'}
    <path d="M62 0 L98 0 L118 70 L42 70 Z" fill="url(#beam)" class="beam" />
  {:else}
    <path d="M40 0 L56 0 L72 70 L30 70 Z" fill="url(#beam)" class="beam" opacity="0.6" />
    <path d="M108 0 L120 0 L132 70 L100 70 Z" fill="url(#beam)" class="beam" opacity="0.5" />
  {/if}
  <!-- near trunks -->
  {#each trunks as [x, w, c] (x)}
    <rect x={x - w / 2} y="0" width={w} height="66" fill={c} stroke="#4e3820" stroke-width="0.5" />
    <path
      d="M{x - w / 4} 10 q1 14 -1 30 M{x + w / 5} 22 q-1 12 1 26"
      fill="none"
      stroke="#4e3820"
      stroke-width="0.5"
      opacity="0.6"
    />
  {/each}
  <path d="M0 54 Q40 46 80 52 Q120 46 160 54 L160 100 L0 100 Z" fill="url(#forest-floor)" />

  {#if spotId === 'mossy-stump-ring'}
    <ellipse cx="80" cy="72" rx="42" ry="16" fill="#8fb06a" opacity="0.8" />
    {#each [[34, 64, 6], [56, 58, 5], [104, 58, 5], [126, 64, 6]] as [x, y, r] (x)}
      <g>
        <rect
          x={x - r}
          y={y - 5}
          width={r * 2}
          height="7"
          fill="#8a6a44"
          stroke="#5e4428"
          stroke-width="0.5"
        />
        <ellipse
          cx={x}
          cy={y - 5}
          rx={r}
          ry="2"
          fill="#d9b68a"
          stroke="#5e4428"
          stroke-width="0.5"
        />
        <ellipse
          cx={x}
          cy={y - 5}
          rx={r * 0.5}
          ry="1"
          fill="none"
          stroke="#a8875d"
          stroke-width="0.4"
        />
        <path
          d="M{x - r} {y - 4} q{r} -2 {r * 2} 0"
          fill="none"
          stroke="#7fae5a"
          stroke-width="1.2"
        />
      </g>
    {/each}
  {:else}
    <!-- fern clumps and toadstools along the floor -->
    {#each [[10, 74], [150, 72], [44, 92], [118, 94]] as [x, y] (x)}
      <g fill="#5f9a4f" stroke="#3f7a3c" stroke-width="0.4">
        <path d="M{x} {y} q-8 -6 -12 -14 q6 4 12 14 Z" />
        <path d="M{x} {y} q8 -6 12 -14 q-6 4 -12 14 Z" />
        <path d="M{x} {y} q-1 -10 2 -18 q1 8 -2 18 Z" />
      </g>
    {/each}
    {#each [[26, 86, '#e0483e'], [136, 84, '#e9d6bd'], [96, 96, '#e0483e']] as [x, y, c] (x)}
      <g>
        <rect
          x={(x as number) - 0.6}
          y={(y as number) - 2.4}
          width="1.2"
          height="2.4"
          fill="#fbf1e2"
        />
        <path
          d="M{(x as number) - 2.4} {(y as number) - 2.2} Q{x} {(y as number) -
            5.4} {(x as number) + 2.4} {(y as number) - 2.2} Z"
          fill={c as string}
          stroke="#8a3a2a"
          stroke-width="0.3"
        />
      </g>
    {/each}
  {/if}
  <!-- moss tufts -->
  {#each [[20, 62], [70, 60], [100, 66], [146, 60]] as [x, y] (x)}
    <ellipse cx={x} cy={y} rx="6" ry="2" fill="#8fbf66" opacity="0.8" />
  {/each}
{/if}

<style>
  .beam {
    animation: beam 7s ease-in-out infinite;
  }

  @keyframes beam {
    50% {
      opacity: 0.35;
    }
  }

  .sparkle {
    animation: beam 3s ease-in-out infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    .beam,
    .sparkle {
      animation: none;
    }
  }
</style>
