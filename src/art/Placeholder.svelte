<script lang="ts">
  import { placeholderHue, placeholderShape } from './registry'

  let { id, size = 64 }: { id: string; size?: number } = $props()

  const hue = $derived(placeholderHue(id))
  const shape = $derived(placeholderShape(id))
  const label = $derived(id.split('-').slice(1).join(' ') || id)
  const fill = $derived(`hsl(${hue} 70% 85%)`)
  const stroke = $derived(`hsl(${hue} 45% 55%)`)
</script>

<svg
  class="placeholder"
  width={size}
  height={size}
  viewBox="0 0 100 100"
  role="img"
  aria-label={`Placeholder: ${label}`}
  data-asset-id={id}
>
  {#if shape === 'circle'}
    <circle cx="50" cy="50" r="44" {fill} {stroke} stroke-width="4" />
  {:else if shape === 'figure'}
    <ellipse cx="50" cy="68" rx="26" ry="28" {fill} {stroke} stroke-width="4" />
    <circle cx="50" cy="30" r="22" {fill} {stroke} stroke-width="4" />
  {:else if shape === 'oval'}
    <ellipse cx="50" cy="55" rx="44" ry="30" {fill} {stroke} stroke-width="4" />
  {:else}
    <rect x="8" y="8" width="84" height="84" rx="18" {fill} {stroke} stroke-width="4" />
  {/if}
  {#if size >= 48}
    <text x="50" y="55" text-anchor="middle" font-size="12" fill={stroke}>{label}</text>
  {/if}
</svg>

<style>
  .placeholder {
    display: block;
    font-family: var(--font-body);
  }
</style>
