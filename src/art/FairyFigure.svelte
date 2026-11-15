<script lang="ts">
  import type { CharacterLook, Wardrobe } from '../data/appearance'

  /**
   * The player's fairy, built in layers (design doc 3.13): wings, hair, body, face and outfit
   * pieces are separate shapes, colored from the player's choices. Outlines are a darker shade of
   * each shape's own color, never black (design doc 7.1).
   */
  let {
    look,
    wardrobe,
    size = 120,
    animate = true,
  }: { look: CharacterLook; wardrobe: Wardrobe; size?: number; animate?: boolean } = $props()

  /** A darker shade of a color, for outlines. */
  function shade(hex: string, amount = 0.72): string {
    const n = parseInt(hex.slice(1), 16)
    const r = Math.round(((n >> 16) & 255) * amount)
    const g = Math.round(((n >> 8) & 255) * amount)
    const b = Math.round((n & 255) * amount)
    return `rgb(${r} ${g} ${b})`
  }

  const male = $derived(look.body === 'male')
  /** Male fairies are a touch broader through the shoulders. */
  const w = $derived(male ? 3 : 0)
  const outfit = $derived(wardrobe.outfit.pieceId)
  const outfitColor = $derived(wardrobe.outfit.pieceId ? wardrobe.outfit.color : '#f3eee6')
</script>

<svg
  class="fairy"
  class:animate
  width={size}
  height={size * 1.2}
  viewBox="0 0 100 120"
  role="img"
  aria-label="Your fairy"
>
  <!-- Wings -->
  <g
    class="wings"
    fill={look.wingColor}
    stroke={shade(look.wingColor, 0.78)}
    stroke-width="1.2"
    opacity="0.9"
  >
    {#each [1, -1] as side (side)}
      <g transform={side === -1 ? 'translate(100 0) scale(-1 1)' : undefined}>
        {#if look.wings === 'butterfly'}
          <!-- Forewing tips reach up and out; hindwings droop below. Roots meet at the back. -->
          <ellipse cx="30" cy="54" rx="20" ry="14" transform="rotate(30 30 54)" />
          <ellipse cx="34" cy="76" rx="12" ry="9" transform="rotate(-25 34 76)" />
        {:else if look.wings === 'dragonfly'}
          <ellipse cx="27" cy="57" rx="24" ry="6" transform="rotate(18 27 57)" />
          <ellipse cx="29" cy="69" rx="20" ry="5" transform="rotate(-14 29 69)" />
        {:else if look.wings === 'moth'}
          <path d="M50 62 Q20 30 10 54 Q14 72 50 68 Z" />
          <path d="M50 68 Q24 78 30 92 Q44 90 50 72 Z" />
        {:else}
          <path d="M50 62 C30 36 14 48 20 60 C25 70 40 70 50 62 Z" />
          <path d="M50 67 C36 74 28 88 37 90 C45 90 48 78 50 67 Z" />
        {/if}
      </g>
    {/each}
  </g>

  <!-- Hair behind the head -->
  <g fill={look.hairColor} stroke={shade(look.hairColor)} stroke-width="1.2">
    {#if look.hair === 'long'}
      <path d="M29 46 Q28 70 34 82 Q50 86 66 82 Q72 70 71 46 Z" />
    {:else if look.hair === 'pigtails'}
      <ellipse cx="25" cy="56" rx="7" ry="11" />
      <ellipse cx="75" cy="56" rx="7" ry="11" />
    {/if}
  </g>

  <!-- A cloak hangs behind the body -->
  {#if outfit === 'piece-leaf-cloak'}
    <g fill={outfitColor} stroke={shade(outfitColor)} stroke-width="1.2" stroke-linejoin="round">
      {#each [[-1, 0], [1, 0], [0, 4]] as [side, drop] (`${side}${drop}`)}
        <path
          d={`M50 ${64 + drop} C${50 + side * 22 - (side === 0 ? 14 : 0)} ${72 + drop} ${50 + side * 26} ${96 + drop} ${50 + side * 12} ${106 + drop} C${50 + side * 4} ${96 + drop} ${50 + side * 2} ${80 + drop} 50 ${64 + drop} Z`}
        />
      {/each}
    </g>
  {:else if outfit === 'piece-dewdrop-cloak'}
    <path
      d={`M${37 - w} 64 Q50 60 ${63 + w} 64 L${73 + w} 102 Q50 108 ${27 - w} 102 Z`}
      fill={outfitColor}
      stroke={shade(outfitColor)}
      stroke-width="1.2"
    />
  {:else if outfit === 'piece-lantern-bug-cloak'}
    <path
      d={`M${36 - w} 64 Q50 60 ${64 + w} 64 L${76 + w} 104 Q64 100 50 106 Q36 100 ${24 - w} 104 Z`}
      fill={outfitColor}
      stroke={shade(outfitColor)}
      stroke-width="1.2"
    />
    <g fill="#e9ff9a" class="glow">
      {#each [[30, 96], [38, 84], [64, 88], [70, 98], [56, 100]] as [cx, cy] (cx)}
        <circle {cx} {cy} r="1.8" />
      {/each}
    </g>
  {/if}

  <!-- Legs and shoes -->
  <g fill={look.skin} stroke={shade(look.skin)} stroke-width="1">
    <rect x="43" y="94" width="6" height="15" rx="3" />
    <rect x="51" y="94" width="6" height="15" rx="3" />
  </g>
  {#if wardrobe.shoes.pieceId}
    <g fill={wardrobe.shoes.color} stroke={shade(wardrobe.shoes.color)} stroke-width="1">
      <path d="M40 108 Q46 104 50 109 Q46 113 40 108 Z" />
      <path d="M60 108 Q54 104 50 109 Q54 113 60 108 Z" />
    </g>
  {/if}

  <!-- Arms -->
  <g fill={look.skin} stroke={shade(look.skin)} stroke-width="1">
    <ellipse cx={35 - w} cy="80" rx="4" ry="9" transform={`rotate(12 ${35 - w} 80)`} />
    <ellipse cx={65 + w} cy="80" rx="4" ry="9" transform={`rotate(-12 ${65 + w} 80)`} />
  </g>

  <!-- Outfit -->
  <g fill={outfitColor} stroke={shade(outfitColor)} stroke-width="1.2" stroke-linejoin="round">
    {#if outfit === 'piece-petal-dress'}
      <path d={`M${40 - w} 66 Q50 62 ${60 + w} 66 L68 97 Q50 103 32 97 Z`} />
      {#each [36, 43, 50, 57, 64] as x (x)}
        <circle cx={x} cy={99 - Math.abs(x - 50) * 0.08} r="3.4" />
      {/each}
    {:else if outfit === 'piece-dewdrop-gown'}
      <path d={`M${40 - w} 66 Q50 62 ${60 + w} 66 L70 104 Q50 110 30 104 Z`} />
      <g fill="white" stroke="none" opacity="0.75">
        <circle cx="44" cy="84" r="1.6" />
        <circle cx="55" cy="92" r="1.6" />
        <circle cx="48" cy="99" r="1.3" />
        <circle cx="60" cy="80" r="1.2" />
      </g>
    {:else if outfit === 'piece-moss-robe'}
      <path d={`M${39 - w} 66 Q50 62 ${61 + w} 66 L69 106 Q50 111 31 106 Z`} />
      <path d="M50 66 L50 108" fill="none" />
      <g fill="#9ccc72" stroke="none" opacity="0.8">
        <circle cx="38" cy="102" r="2.4" />
        <circle cx="45" cy="105" r="2" />
        <circle cx="58" cy="104" r="2.4" />
        <circle cx="64" cy="100" r="2" />
      </g>
      <rect x="53" y="76" width="7" height="9" rx="1" fill="#c23a4c" stroke="#8f2636" />
    {:else if outfit === 'piece-leaf-cloak'}
      <path
        d={`M${41 - w} 67 Q50 64 ${59 + w} 67 L62 94 Q50 98 38 94 Z`}
        fill="#8fbf66"
        stroke={shade('#8fbf66')}
      />
      <circle cx="50" cy="69" r="2.4" fill="#8a6a44" />
    {:else if outfit === 'piece-dewdrop-cloak'}
      <path
        d={`M${41 - w} 67 Q50 64 ${59 + w} 67 L62 94 Q50 98 38 94 Z`}
        fill="#f3f7fb"
        stroke={shade('#f3f7fb')}
      />
      <circle cx="50" cy="69" r="2.4" />
    {:else if outfit === 'piece-honeycomb-gown'}
      <path d={`M${40 - w} 66 Q50 62 ${60 + w} 66 L71 104 Q50 110 29 104 Z`} />
      <g fill="none" stroke={shade(outfitColor, 0.8)} stroke-width="0.9" opacity="0.9">
        {#each [[42, 78], [50, 82], [58, 78], [38, 92], [46, 96], [54, 96], [62, 92]] as [cx, cy] (`${cx}-${cy}`)}
          <polygon
            points={`${cx - 3},${cy} ${cx - 1.5},${cy - 2.6} ${cx + 1.5},${cy - 2.6} ${cx + 3},${cy} ${cx + 1.5},${cy + 2.6} ${cx - 1.5},${cy + 2.6}`}
          />
        {/each}
      </g>
      <path d="M40 70 Q50 74 60 70" fill="none" stroke="#a87e1a" stroke-width="1.6" />
    {:else if outfit === 'piece-honeycomb-doublet'}
      <path d={`M${39 - w} 66 Q50 62 ${61 + w} 66 L64 96 Q50 100 36 96 Z`} />
      <path d="M50 66 L50 96" fill="none" stroke="#a87e1a" stroke-width="1.4" />
      <g fill="#a87e1a" stroke="none">
        <circle cx="50" cy="74" r="1.3" /><circle cx="50" cy="82" r="1.3" /><circle
          cx="50"
          cy="90"
          r="1.3"
        />
      </g>
      <g fill="none" stroke={shade(outfitColor, 0.8)} stroke-width="0.9">
        {#each [[42, 76], [58, 76], [42, 88], [58, 88]] as [cx, cy] (`${cx}-${cy}`)}
          <polygon
            points={`${cx - 3},${cy} ${cx - 1.5},${cy - 2.6} ${cx + 1.5},${cy - 2.6} ${cx + 3},${cy} ${cx + 1.5},${cy + 2.6} ${cx - 1.5},${cy + 2.6}`}
          />
        {/each}
      </g>
    {:else if outfit === 'piece-geode-mantle'}
      <path d={`M${39 - w} 66 Q50 62 ${61 + w} 66 L70 104 Q50 110 30 104 Z`} />
      <path
        d={`M${36 - w} 66 Q50 74 ${64 + w} 66 L${66 + w} 72 Q50 82 ${34 - w} 72 Z`}
        fill="#c8a2f0"
        stroke="#7a5aa8"
      />
      <g stroke="#3e2a64" stroke-width="0.6">
        {#each [[40, 90, '#c8a2f0'], [50, 96, '#fff3d6'], [60, 90, '#b88ae8']] as [x, y, c] (`${x}-${y}`)}
          <path
            d={`M${x} ${(y as number) - 6} L${(x as number) + 3} ${y} L${x} ${(y as number) + 3} L${(x as number) - 3} ${y} Z`}
            fill={c as string}
          />
        {/each}
      </g>
    {:else if outfit === 'piece-miners-overalls'}
      <path
        d={`M${40 - w} 66 Q50 62 ${60 + w} 66 L62 80 L38 80 Z`}
        fill="#f3eee6"
        stroke={shade('#f3eee6')}
      />
      <path d="M38 76 L62 76 L64 96 Q50 100 36 96 Z" />
      <path d="M42 66 L44 78 M58 66 L56 78" fill="none" stroke-width="2" />
      <rect x="45" y="80" width="10" height="7" rx="1.5" fill={shade(outfitColor, 0.85)} />
      <circle cx="44" cy="78" r="1.4" fill="#f2c94f" stroke="none" />
      <circle cx="56" cy="78" r="1.4" fill="#f2c94f" stroke="none" />
    {:else if outfit === 'piece-starlit-cloak'}
      <path d={`M${36 - w} 64 Q50 60 ${64 + w} 64 L74 106 Q50 112 26 106 Z`} />
      <path
        d={`M${38 - w} 64 Q50 70 ${62 + w} 64`}
        fill="none"
        stroke={shade(outfitColor, 1.6)}
        stroke-width="1.6"
      />
      <g fill="#fff3b0" stroke="none">
        {#each [[36, 80], [56, 76], [46, 92], [64, 96], [32, 100]] as [x, y] (`${x}-${y}`)}
          <path
            d={`M${x} ${(y as number) - 2.6} L${(x as number) + 0.8} ${(y as number) - 0.8} L${(x as number) + 2.6} ${y} L${(x as number) + 0.8} ${(y as number) + 0.8} L${x} ${(y as number) + 2.6} L${(x as number) - 0.8} ${(y as number) + 0.8} L${(x as number) - 2.6} ${y} L${(x as number) - 0.8} ${(y as number) - 0.8} Z`}
          />
        {/each}
      </g>
    {:else if outfit === 'piece-nightgown' || outfit === 'piece-nightshirt'}
      <path
        d={outfit === 'piece-nightgown'
          ? `M${40 - w} 66 Q50 62 ${60 + w} 66 L68 104 Q50 108 32 104 Z`
          : `M${40 - w} 66 Q50 62 ${60 + w} 66 L63 96 Q50 99 37 96 Z`}
      />
      <path
        d="M44 66 Q50 72 56 66"
        fill="none"
        stroke={shade(outfitColor, 0.75)}
        stroke-width="1.2"
      />
      <g fill={shade(outfitColor, 0.8)} stroke="none">
        <circle cx="50" cy="76" r="1.2" />
        <circle cx="50" cy="83" r="1.2" />
        <circle cx="50" cy="90" r="1.2" />
      </g>
      <path
        d="M40 86 a2.4 2.4 0 1 0 2 4 a1.8 1.8 0 1 1 -2 -4 Z M58 96 a2.4 2.4 0 1 0 2 4 a1.8 1.8 0 1 1 -2 -4 Z"
        fill="#fff3b0"
        stroke="none"
      />
    {:else if outfit === 'piece-sunrise-gown'}
      <path d={`M${38 - w} 64 Q50 60 ${62 + w} 64 L74 108 Q50 114 26 108 Z`} />
      <path
        d={`M${36 - w} 64 Q50 72 ${64 + w} 64 L${66 + w} 70 Q50 80 ${34 - w} 70 Z`}
        fill="#f2c45c"
        stroke="#a87e1a"
      />
      <g fill="none" stroke-width="1.4">
        <path d="M30 96 Q50 90 70 96" stroke="#f2c45c" />
        <path d="M28 102 Q50 96 72 102" stroke="#f7e6a0" />
      </g>
      {#each [[40, 84], [50, 80], [60, 84]] as [x, y] (x)}
        <circle cx={x} cy={y} r="2" fill="#fff3b0" stroke="#a87e1a" stroke-width="0.6" />
      {/each}
    {:else if outfit === 'piece-sky-scholar-robes'}
      <path d={`M${39 - w} 65 Q50 61 ${61 + w} 65 L68 104 Q50 108 32 104 Z`} />
      <path d="M50 66 L50 104" stroke={shade(outfitColor, 0.7)} stroke-width="1.2" fill="none" />
      <path
        d={`M${39 - w} 65 L46 66 L44 100 L33 102 Z`}
        fill={shade(outfitColor, 1.25)}
        stroke={shade(outfitColor, 0.75)}
      />
      <g fill="#eef8ff" stroke="none">
        <circle cx="58" cy="78" r="1.4" />
        <circle cx="62" cy="86" r="1" />
        <circle cx="56" cy="94" r="1.2" />
      </g>
    {:else if outfit === 'piece-bloodrose-gown'}
      <path d={`M${39 - w} 64 Q50 60 ${61 + w} 64 L72 106 Q50 112 28 106 Z`} />
      <path
        d="M30 98 Q36 92 42 98 Q48 92 54 98 Q60 92 66 98 Q70 94 72 100"
        fill="none"
        stroke="#2a1a2a"
        stroke-width="1.6"
      />
      <g stroke="#4a0a1a" stroke-width="0.8">
        {#each [[42, 74], [58, 82], [46, 90]] as [x, y] (x)}
          <circle cx={x} cy={y} r="3.2" fill="#c8243a" />
        {/each}
      </g>
      <path d="M44 64 L50 70 L56 64" fill="none" stroke="#2a1a2a" stroke-width="1.6" />
    {:else if outfit === 'piece-gravewalker-coat'}
      <path d={`M${38 - w} 64 Q50 60 ${62 + w} 64 L68 106 L54 102 L50 72 L46 102 L32 106 Z`} />
      <path
        d="M38 64 L46 72 L50 64 L54 72 L62 64"
        fill="none"
        stroke={shade(outfitColor, 1.5)}
        stroke-width="1.4"
      />
      <g fill="#9cf0b0" stroke="none">
        <circle cx="44" cy="80" r="1.4" />
        <circle cx="44" cy="88" r="1.4" />
        <circle cx="56" cy="80" r="1.4" />
        <circle cx="56" cy="88" r="1.4" />
      </g>
    {:else if outfit === 'piece-vampire-cape'}
      <path d={`M${30 - w} 58 Q50 54 ${70 + w} 58 L78 108 Q50 104 22 108 Z`} />
      <path d={`M${30 - w} 58 L24 44 L38 56 M${70 + w} 58 L76 44 L62 56`} fill={outfitColor} />
      <path
        d={`M${33 - w} 60 Q50 66 ${67 + w} 60 L64 104 Q50 100 36 104 Z`}
        fill="#9a1f3a"
        stroke="#4a0a1a"
      />
      <path d="M42 66 L58 66 L56 96 Q50 98 44 96 Z" fill="#2a1a2a" stroke="#14060c" />
    {:else if outfit === 'piece-burrowers-waistcoat'}
      <path
        d={`M${40 - w} 66 Q50 62 ${60 + w} 66 L63 94 Q50 98 37 94 Z`}
        fill="#e9d6bd"
        stroke={shade('#e9d6bd')}
      />
      <path d={`M${40 - w} 66 L46 66 L48 94 L37 94 Z`} />
      <path d={`M${60 + w} 66 L54 66 L52 94 L63 94 Z`} />
      <circle cx="44" cy="76" r="1.2" fill="#f2c94f" stroke="none" />
      <circle cx="44" cy="84" r="1.2" fill="#f2c94f" stroke="none" />
      <path d="M54 80 Q58 82 60 78" fill="none" stroke="#a87e1a" stroke-width="1" />
    {:else if outfit === 'piece-lantern-bug-cloak'}
      <path
        d={`M${41 - w} 67 Q50 64 ${59 + w} 67 L62 94 Q50 98 38 94 Z`}
        fill="#cfe0c8"
        stroke={shade('#cfe0c8')}
      />
      <circle cx="50" cy="70" r="3" fill="#e9ff9a" stroke="#9ab84a" />
    {:else}
      <path d={`M${40 - w} 66 Q50 62 ${60 + w} 66 L63 94 Q50 98 37 94 Z`} />
      <path d="M38.5 82 Q50 85 61.5 82" fill="none" />
    {/if}
  </g>

  <!-- Accessory -->
  {#if wardrobe.accessory.pieceId === 'piece-small-satchel'}
    <g stroke={shade(wardrobe.accessory.color)} stroke-width="1.2">
      <path d={`M${41 - w} 66 L61 86`} fill="none" stroke-width="2" />
      <rect x="57" y="83" width="11" height="9" rx="2.5" fill={wardrobe.accessory.color} />
    </g>
  {/if}

  <!-- Head and face -->
  <circle cx="50" cy="46" r="20" fill={look.skin} stroke={shade(look.skin)} stroke-width="1.2" />
  <g fill={look.eyeColor} stroke="none">
    {#each [43, 57] as x (x)}
      {#if look.eyes === 'sleepy'}
        <path
          d={`M${x - 3.2} 48 Q${x} 51.5 ${x + 3.2} 48`}
          fill="none"
          stroke={look.eyeColor}
          stroke-width="1.8"
          stroke-linecap="round"
        />
      {:else}
        <ellipse
          cx={x}
          cy="48"
          rx={look.eyes === 'sparkle' ? 3.6 : 3}
          ry={look.eyes === 'sparkle' ? 4.4 : 4}
        />
        <circle cx={x + 1} cy="46.4" r={look.eyes === 'sparkle' ? 1.6 : 1.2} fill="white" />
        {#if look.eyes === 'sparkle'}<circle cx={x - 1.3} cy="50" r="0.7" fill="white" />{/if}
      {/if}
    {/each}
  </g>
  {#if !male && look.eyes !== 'sleepy'}
    <g stroke={look.eyeColor} stroke-width="0.9" stroke-linecap="round">
      <path d="M39.6 45.5 L38.4 44.3" />
      <path d="M60.4 45.5 L61.6 44.3" />
    </g>
  {/if}
  <g fill="#f7a6b8" opacity="0.55">
    <circle cx="37.5" cy="54" r="2.8" />
    <circle cx="62.5" cy="54" r="2.8" />
  </g>
  <path
    d="M47 55.5 Q50 58.5 53 55.5"
    fill="none"
    stroke={shade(look.skin, 0.55)}
    stroke-width="1.2"
    stroke-linecap="round"
  />

  <!-- Hair -->
  <g
    fill={look.hairColor}
    stroke={shade(look.hairColor)}
    stroke-width="1.2"
    stroke-linejoin="round"
  >
    {#if look.hair === 'tufts'}
      <path
        d="M30 44 L32 30 L39 35 L43 24 L50 32 L57 24 L61 35 L68 30 L70 44 Q60 35 50 36 Q40 35 30 44 Z"
      />
    {:else if look.hair === 'curls'}
      {#each [[32, 41, 7], [37, 32, 7], [46, 27, 8], [56, 27, 8], [64, 32, 7], [69, 41, 6]] as [cx, cy, r] (cx)}
        <circle {cx} {cy} {r} />
      {/each}
    {:else}
      <path d="M29 50 Q28 25 50 24 Q72 25 71 50 Q66 37 56 35 Q50 40 42 36 Q34 39 29 50 Z" />
      {#if look.hair === 'bun'}
        <circle cx="50" cy="21" r="8" />
      {:else if look.hair === 'pigtails'}
        <circle cx="29" cy="45" r="2.6" fill={wardrobe.headpiece.color} />
        <circle cx="71" cy="45" r="2.6" fill={wardrobe.headpiece.color} />
      {/if}
    {/if}
  </g>

  {#if wardrobe.accessory.pieceId === 'piece-reading-glasses'}
    <g fill="#ffffff" fill-opacity="0.25" stroke={wardrobe.accessory.color} stroke-width="1.3">
      <circle cx="43" cy="48" r="5" />
      <circle cx="57" cy="48" r="5" />
      <path d="M48 48 L52 48 M38 47 L31 45 M62 47 L69 45" fill="none" />
    </g>
  {/if}

  <!-- Headpiece -->
  {#if wardrobe.headpiece.pieceId === 'piece-flower-crown'}
    <g fill={wardrobe.headpiece.color} stroke={shade(wardrobe.headpiece.color)} stroke-width="1">
      {#each [[35, 33], [42, 28], [50, 26], [58, 28], [65, 33]] as [cx, cy] (cx)}
        <circle {cx} {cy} r="3.6" />
        <circle {cx} {cy} r="1.3" fill="#ffe59e" stroke="none" />
      {/each}
    </g>
  {:else if wardrobe.headpiece.pieceId === 'piece-acorn-cap'}
    <g stroke={shade(wardrobe.headpiece.color)} stroke-width="1.2">
      <path d="M28 40 Q28 20 50 18 Q72 20 72 40 Q50 34 28 40 Z" fill={wardrobe.headpiece.color} />
      <path d="M34 34 L66 34 M31 38 L69 38 M38 28 L62 28" stroke-dasharray="2 2" fill="none" />
      <path d="M50 18 Q51 12 55 10" fill="none" stroke-width="2.2" stroke-linecap="round" />
    </g>
  {:else if wardrobe.headpiece.pieceId === 'piece-crystal-diadem'}
    <g stroke={shade(wardrobe.headpiece.color, 0.6)} stroke-width="0.9" stroke-linejoin="round">
      <path d="M32 34 Q50 26 68 34" fill="none" stroke-width="1.6" />
      {#each [[38, 30, 5], [50, 26, 8], [62, 30, 5]] as [x, y, h] (x)}
        <path
          d={`M${x} ${y - h} L${x + 2.6} ${y - h * 0.4} L${x} ${y + 1} L${x - 2.6} ${y - h * 0.4} Z`}
          fill={wardrobe.headpiece.color}
        />
      {/each}
    </g>
  {:else if wardrobe.headpiece.pieceId === 'piece-lamp-helmet'}
    <g stroke={shade(wardrobe.headpiece.color)} stroke-width="1.2">
      <path d="M28 38 Q28 18 50 17 Q72 18 72 38 Z" fill={wardrobe.headpiece.color} />
      <path d="M25 38 L75 38" stroke-width="3" stroke-linecap="round" />
      <circle cx="50" cy="26" r="5" fill="#fff3b0" />
      <circle cx="50" cy="26" r="10" fill="#fff3b0" opacity="0.3" stroke="none" />
    </g>
  {:else if wardrobe.headpiece.pieceId === 'piece-midnight-veil'}
    <g stroke={shade(wardrobe.headpiece.color, 0.7)} stroke-width="1">
      <path
        d="M28 40 Q28 18 50 16 Q72 18 72 40 L76 66 Q70 58 66 46 Q50 36 34 46 Q30 58 24 66 Z"
        fill={wardrobe.headpiece.color}
        opacity="0.82"
      />
      <path d="M44 22 a4 4 0 1 0 4 6 a3 3 0 1 1 -4 -6 Z" fill="#fff3b0" stroke="none" />
    </g>
  {:else if wardrobe.headpiece.pieceId === 'piece-nightcap'}
    <g stroke={shade(wardrobe.headpiece.color)} stroke-width="1.2">
      <path
        d="M28 38 Q30 18 52 16 Q70 18 84 34 Q74 30 70 32 Q72 36 72 38 Z"
        fill={wardrobe.headpiece.color}
      />
      <path d="M28 38 Q50 32 72 38" fill="none" stroke-width="3" stroke="#eef0ff" />
      <circle cx="84" cy="34" r="4" fill="#eef0ff" />
    </g>
  {:else if wardrobe.headpiece.pieceId === 'piece-sunrise-crown'}
    <g stroke={shade(wardrobe.headpiece.color, 0.6)} stroke-width="1" stroke-linejoin="round">
      {#each [-40, -20, 0, 20, 40] as a (a)}
        <path d="M50 30 L48 14 L50 10 L52 14 Z" fill="#fff3b0" transform={`rotate(${a} 50 34)`} />
      {/each}
      <path d="M32 34 Q50 24 68 34 L66 38 Q50 30 34 38 Z" fill={wardrobe.headpiece.color} />
      <circle cx="50" cy="30" r="2.6" fill="#f7a68a" />
    </g>
  {:else if wardrobe.headpiece.pieceId === 'piece-star-circlet'}
    <g stroke={shade(wardrobe.headpiece.color, 0.6)} stroke-width="1">
      <path d="M32 34 Q50 26 68 34" fill="none" stroke-width="1.8" />
      <path
        d="M50 22 L52 27 L57 27 L53 30 L54.6 35 L50 32 L45.4 35 L47 30 L43 27 L48 27 Z"
        fill="#fff3b0"
      />
    </g>
  {:else if wardrobe.headpiece.pieceId === 'piece-thorn-crown'}
    <g fill="none" stroke={wardrobe.headpiece.color} stroke-width="2" stroke-linecap="round">
      <path d="M32 34 Q50 26 68 34" />
      {#each [36, 43, 50, 57, 64] as x, i (x)}
        <path d={`M${x} ${32 - (i % 2) * 2} L${x + (i % 2 ? 2 : -2)} ${24 - (i % 2) * 2}`} />
      {/each}
    </g>
    <circle cx="50" cy="28" r="2.6" fill="#c8243a" />
  {:else if wardrobe.headpiece.pieceId === 'piece-raven-hat'}
    <g stroke={shade(wardrobe.headpiece.color, 1.6)} stroke-width="1">
      <path d="M24 36 Q50 30 76 36 Q50 40 24 36 Z" fill={wardrobe.headpiece.color} />
      <path d="M34 34 Q36 14 50 12 Q64 14 66 34 Z" fill={wardrobe.headpiece.color} />
      <path d="M64 24 Q78 14 86 18 Q76 20 70 28 Z" fill="#14101c" />
    </g>
  {:else if wardrobe.headpiece.pieceId === 'piece-batwing-circlet'}
    <g stroke={shade(wardrobe.headpiece.color, 0.6)} stroke-width="1">
      <path d="M32 34 Q50 28 68 34" fill="none" stroke-width="1.8" />
      <path
        d="M40 30 C34 22 26 22 20 28 C24 28 26 30 26 32 C30 30 34 31 36 33 Z M60 30 C66 22 74 22 80 28 C76 28 74 30 74 32 C70 30 66 31 64 33 Z"
        fill={wardrobe.headpiece.color}
      />
      <circle cx="50" cy="30" r="2.6" fill="#c8243a" />
    </g>
  {:else if wardrobe.headpiece.pieceId === 'piece-honeycomb-crown'}
    <g
      fill={wardrobe.headpiece.color}
      stroke={shade(wardrobe.headpiece.color)}
      stroke-width="1"
      stroke-linejoin="round"
    >
      {#each [36, 43, 50, 57, 64] as x (x)}
        {@const y = x === 50 ? 20 : x === 43 || x === 57 ? 23 : 27}
        <polygon
          points={`${x - 3.6},${y} ${x - 1.8},${y - 3.2} ${x + 1.8},${y - 3.2} ${x + 3.6},${y} ${x + 1.8},${y + 3.2} ${x - 1.8},${y + 3.2}`}
        />
      {/each}
      <circle cx="50" cy="20" r="1.4" fill="#fff3b0" stroke="none" />
    </g>
  {:else if wardrobe.headpiece.pieceId === 'piece-lily-pad-hat'}
    <g stroke={shade(wardrobe.headpiece.color)} stroke-width="1.2">
      <path
        d="M24 32 Q50 18 76 32 Q50 40 24 32 Z"
        fill={wardrobe.headpiece.color}
        stroke-linejoin="round"
      />
      <path d="M50 30 L62 24" fill="none" />
      <circle cx="40" cy="27" r="3.4" fill="#f7c6d4" stroke="#c97a8c" stroke-width="0.8" />
      <circle cx="40" cy="27" r="1.2" fill="#ffd23f" stroke="none" />
    </g>
  {:else if wardrobe.headpiece.pieceId === 'piece-dewdrop-circlet'}
    <g fill={wardrobe.headpiece.color} stroke={shade(wardrobe.headpiece.color)} stroke-width="1">
      <path d="M33 34 Q50 24 67 34" fill="none" stroke-width="1.6" />
      {#each [40, 50, 60] as x (x)}
        <path d={`M${x} ${x === 50 ? 27 : 30} q-2.6 4 0 5.4 q2.6 -1.4 0 -5.4 Z`} />
      {/each}
    </g>
  {/if}
</svg>

<style>
  .fairy {
    display: block;
    overflow: visible;
  }

  .animate {
    animation: float 3.2s ease-in-out infinite;
  }

  .animate .wings {
    transform-origin: 50px 64px;
    animation: flutter 0.9s ease-in-out infinite;
  }

  @keyframes float {
    50% {
      transform: translateY(-3px);
    }
  }

  @keyframes flutter {
    50% {
      transform: scaleX(0.86);
    }
  }

  .glow {
    animation: glow 2.4s ease-in-out infinite;
  }

  @keyframes glow {
    50% {
      opacity: 0.4;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .animate,
    .animate .wings,
    .glow {
      animation: none;
    }
  }
</style>
