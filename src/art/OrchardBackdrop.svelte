<script lang="ts">
  /**
   * Blossom Orchard backdrops (160×100, drawn inside SceneBackdrop's svg). Rows of pink and white
   * fruit trees in a warm spring light, petals drifting down; a honeycomb hall and an earthy
   * tunnel for the secret places.
   */
  let { spotId }: { spotId: string } = $props()

  /** A round blossoming tree: trunk, crown and a few flowers. */
  const trees: [number, number, number, string][] = [
    [14, 44, 16, '#f7c6d4'],
    [46, 40, 15, '#fbe3ea'],
    [80, 44, 17, '#f7a6c0'],
    [114, 40, 15, '#fbe3ea'],
    [146, 44, 16, '#f7c6d4'],
  ]
  const petals = Array.from({ length: 14 }, (_, i) => ({
    x: (i * 37) % 160,
    y: (i * 23) % 70,
    c: i % 2 ? '#f7a6c0' : '#fbe3ea',
    d: `${(i * 0.6) % 6}s`,
  }))
</script>

<defs>
  <linearGradient id="orchard-sky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#cfe9ff" />
    <stop offset="1" stop-color="#fff1e6" />
  </linearGradient>
  <linearGradient id="orchard-grass" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#b8e09c" />
    <stop offset="1" stop-color="#93c97a" />
  </linearGradient>
  <linearGradient id="comb-wall" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#f6d36a" />
    <stop offset="1" stop-color="#e2a83f" />
  </linearGradient>
  <linearGradient id="tunnel-earth" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#5e4428" />
    <stop offset="1" stop-color="#8a6a44" />
  </linearGradient>
</defs>

{#if spotId === 'royal-cell'}
  <!-- The heart of the hive: golden hexagon walls and a glowing throne cell. -->
  <rect width="160" height="100" fill="url(#comb-wall)" />
  {#each Array.from({ length: 8 }, (_, row) => row) as row (row)}
    {#each Array.from({ length: 12 }, (_, col) => col) as col (col)}
      {@const x = col * 14 + (row % 2) * 7}
      {@const y = row * 12}
      <polygon
        points="{x},{y + 3} {x + 7},{y - 1} {x + 14},{y + 3} {x + 14},{y + 10} {x + 7},{y +
          14} {x},{y + 10}"
        fill="#f2c94f"
        stroke="#c99a2a"
        stroke-width="0.6"
        opacity="0.8"
      />
    {/each}
  {/each}
  <ellipse cx="80" cy="34" rx="22" ry="16" fill="#fff3b0" opacity="0.55" class="glow" />
  <path d="M0 64 Q80 56 160 64 L160 100 L0 100 Z" fill="#e8b84a" />
  <path d="M0 64 Q80 56 160 64" fill="none" stroke="#a87e1a" stroke-width="1" />
{:else if spotId === 'badgers-tunnel'}
  <!-- A cool earthy tunnel, roots hanging from the ceiling, a lantern glow. -->
  <rect width="160" height="100" fill="url(#tunnel-earth)" />
  <path d="M0 0 Q80 36 160 0 L160 14 Q80 48 0 14 Z" fill="#3e2c18" opacity="0.7" />
  {#each [[24, 18], [52, 24], [92, 26], [124, 20], [146, 14]] as [x, h] (x)}
    <path d="M{x} 6 q-2 {h / 2} 1 {h}" stroke="#a8875d" stroke-width="1" fill="none" />
  {/each}
  <ellipse cx="120" cy="40" rx="18" ry="12" fill="#ffe59e" opacity="0.25" class="glow" />
  <rect
    x="117"
    y="34"
    width="6"
    height="9"
    rx="1.5"
    fill="#ffe59e"
    stroke="#a87e1a"
    stroke-width="0.6"
  />
  <path d="M0 66 Q80 58 160 66 L160 100 L0 100 Z" fill="#6e5234" />
  {#each [[20, 76], [70, 82], [130, 78]] as [x, y] (x)}
    <ellipse cx={x} cy={y} rx="7" ry="2" fill="#5e4428" opacity="0.7" />
  {/each}
{:else}
  <rect width="160" height="100" fill="url(#orchard-sky)" />
  <path d="M0 52 Q40 44 80 50 Q120 44 160 52 L160 100 L0 100 Z" fill="url(#orchard-grass)" />
  {#if spotId === 'old-pear'}
    <!-- One huge old pear tree, honeycomb hanging from its boughs. -->
    <path
      d="M74 100 Q70 76 66 60 Q62 46 52 38 M74 70 Q90 52 108 44"
      fill="none"
      stroke="#6e5234"
      stroke-width="7"
      stroke-linecap="round"
    />
    <path d="M78 100 Q80 80 80 64" fill="none" stroke="#6e5234" stroke-width="9" />
    <ellipse cx="80" cy="28" rx="58" ry="26" fill="#a8cc8a" stroke="#6f9a5b" stroke-width="0.6" />
    {#each [[44, 22], [62, 14], [96, 16], [114, 26], [80, 34], [56, 36]] as [x, y] (x)}
      <circle cx={x} cy={y} r="2" fill="#fbe3ea" />
    {/each}
    {#each [[54, 46], [104, 50]] as [x, y] (x)}
      <path d="M{x} {y - 6} l0 6" stroke="#6e5234" stroke-width="0.8" />
      <ellipse cx={x} cy={y + 4} rx="5" ry="7" fill="#f2c94f" stroke="#a87e1a" stroke-width="0.6" />
    {/each}
    {#each [[30, 88], [130, 90], [96, 94]] as [x, y] (x)}
      <circle cx={x} cy={y} r="2.4" fill="#c9d86a" stroke="#8a9a3a" stroke-width="0.4" />
    {/each}
  {:else}
    <!-- Rows of blossoming trees, a path running between them. -->
    <path d="M70 100 Q78 70 80 52 Q82 70 90 100 Z" fill="#e9d6bd" opacity="0.8" />
    {#each trees as [x, y, r, c] (x)}
      <path d="M{x} {y + r} L{x} {y + r + 14}" stroke="#7a5a44" stroke-width="3" />
      <circle cx={x} cy={y} {r} fill={c} stroke="#d48aa6" stroke-width="0.6" />
      <circle cx={x - r * 0.4} cy={y - r * 0.3} r={r * 0.35} fill="#ffffff" opacity="0.4" />
    {/each}
  {/if}
  <g class="petals">
    {#each petals as p, i (i)}
      <ellipse cx={p.x} cy={p.y} rx="1.4" ry="0.9" fill={p.c} style:--d={p.d} />
    {/each}
  </g>
{/if}

<style>
  .petals ellipse {
    animation: petal-fall 7s linear infinite;
    animation-delay: var(--d);
  }

  @keyframes petal-fall {
    from {
      transform: translate(0, -6px) rotate(0deg);
      opacity: 0;
    }
    15% {
      opacity: 1;
    }
    to {
      transform: translate(-12px, 40px) rotate(160deg);
      opacity: 0;
    }
  }

  .glow {
    animation: glow 4s ease-in-out infinite;
  }

  @keyframes glow {
    50% {
      opacity: 0.25;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .petals ellipse,
    .glow {
      animation: none;
    }
  }
</style>
