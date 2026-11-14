<script lang="ts">
  import Art from '../../art/Art.svelte'
  import { formatDuration, formatNumber } from '../../engine/format'
  import { satchelCapacity, satchelMountAway, satchelOverload } from '../../engine/modifiers'
  import { countItems } from '../../engine/state'
  import { runtime } from '../game'
  import ItemList from './ItemList.svelte'
  import SatchelLock from './SatchelLock.svelte'

  /** The satchel counter in the header. Tap it to peek inside, wherever you are. */
  const { game } = runtime
  const count = $derived(countItems($game.player.satchel))
  const capacity = $derived(satchelCapacity($game))
  const over = $derived(satchelOverload($game))
  const mountAway = $derived(satchelMountAway($game))

  let open = $state(false)
  let root: HTMLDivElement | undefined = $state()
  /** On narrow screens the popup spans the screen just below the button. */
  let top = $state(0)

  function toggle() {
    open = !open
    if (open && root) top = root.getBoundingClientRect().bottom + 8
  }

  function onWindowPointer(e: PointerEvent) {
    if (open && root && !root.contains(e.target as Node)) open = false
  }

  function onKey(e: KeyboardEvent) {
    if (open && e.key === 'Escape') open = false
  }
</script>

<svelte:window onpointerdown={onWindowPointer} onkeydown={onKey} />

<div class="satchel" bind:this={root}>
  <button
    type="button"
    class="counter"
    class:over={over > 0}
    aria-label={`Satchel: ${count} of ${capacity}. Show what's inside`}
    aria-expanded={open}
    onclick={toggle}
  >
    <Art id="icon-satchel" size={28} />
    <span>{formatNumber(count)} / {formatNumber(capacity)}</span>
    {#if over > 0}<span class="over-tag">over-full!</span>{/if}
    {#if $game.player.satchelLocked}<span class="locked-tag">locked</span>{/if}
  </button>

  {#if open}
    <div class="popup" role="dialog" aria-label="Satchel contents" style:--top="{top}px">
      <header>
        <h2>Satchel</h2>
        <span class="space">{formatNumber(count)} / {formatNumber(capacity)} space</span>
        <button type="button" class="close" aria-label="Close" onclick={() => (open = false)}
          >✕</button
        >
      </header>
      <div class="items">
        <ItemList items={$game.player.satchel} empty="Your satchel is empty." />
      </div>
      {#each $game.post.parcels as parcel (parcel.id)}
        <p class="parcel">
          📦 A parcel of {formatNumber(countItems(parcel.items))} items is
          {parcel.remainingMs > 0
            ? `on its way home (${formatDuration(parcel.remainingMs + 999)})`
            : 'waiting at home for storage space'}.
        </p>
      {/each}
      {#if over > 0}
        <p class="note">
          Over-full by {formatNumber(over)}: {mountAway ?? 'your Deep Pockets Draught wore off'}.
          Nothing is lost, but you can't gather more until you unpack, sell or send some home{mountAway
            ? ', or fly back'
            : ''}.
        </p>
      {:else if count >= capacity}
        <p class="note">Full! Fly home to put things in storage.</p>
      {/if}
      <SatchelLock />
    </div>
  {/if}
</div>

<style>
  .counter.over {
    border-color: #c0392b;
    color: #b03a2e;
  }

  .over-tag {
    padding: 1px 6px;
    border-radius: 999px;
    background: #c0392b;
    color: white;
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .satchel {
    position: relative;
  }

  .counter {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 44px;
    padding: 2px 10px;
    border: 2px solid transparent;
    border-radius: 14px;
    background: none;
    color: inherit;
    font: inherit;
    font-size: 1.2rem;
    font-weight: 700;
    white-space: nowrap;
    cursor: pointer;
  }

  .counter:hover,
  .counter[aria-expanded='true'] {
    background: rgb(var(--surface-rgb) / 0.6);
    border-color: var(--honey);
  }

  .locked-tag {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    opacity: 0.7;
  }

  .popup {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    z-index: 40;
    width: min(340px, calc(100vw - 32px));
    padding: 14px;
    border-radius: 20px;
    background: var(--cream);
    border: 2px solid var(--honey);
    box-shadow: 0 8px 24px rgb(90 67 82 / 0.2);
  }

  @media (max-width: 600px) {
    .popup {
      position: fixed;
      top: var(--top);
      left: 16px;
      right: 16px;
      width: auto;
    }
  }

  .popup header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
  }

  h2 {
    margin: 0;
    font-size: 1.2rem;
  }

  .space {
    flex: 1;
    font-size: 0.85rem;
    opacity: 0.75;
  }

  .close {
    width: 44px;
    height: 44px;
    border: none;
    border-radius: 12px;
    background: rgb(0 0 0 / 0.05);
    color: var(--ink);
    font-size: 1.1rem;
    cursor: pointer;
  }

  .items {
    max-height: 50vh;
    overflow: auto;
    margin-bottom: 10px;
  }

  .parcel {
    margin: 0 0 10px;
    font-size: 0.85rem;
  }

  .note {
    margin: 0 0 10px;
    font-weight: 700;
    color: #b8607a;
  }
</style>
