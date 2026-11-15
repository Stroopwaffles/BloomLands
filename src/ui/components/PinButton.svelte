<script lang="ts">
  import { hasQol } from '../../engine/modifiers'
  import { runtime } from '../game'

  /** Pins a request to the Request Board (once the Comfort is built). */
  let {
    kind,
    requestId,
    settlementId,
  }: { kind: 'trader' | 'villager'; requestId: number; settlementId?: string } = $props()
  const { game } = runtime
  const pinned = $derived(
    $game.tracked.some(
      (t) => t.kind === kind && t.requestId === requestId && t.settlementId === settlementId,
    ),
  )
</script>

{#if hasQol($game, 'request-tracker')}
  <button
    type="button"
    class="pin"
    class:on={pinned}
    aria-pressed={pinned}
    title={pinned ? 'Unpin from the Request Board' : 'Pin to the Request Board'}
    onclick={() => runtime.dispatch({ type: 'request/track', kind, requestId, settlementId })}
  >
    📌 {pinned ? 'Pinned' : 'Pin'}
  </button>
{/if}

<style>
  .pin {
    min-height: 44px;
    padding: 0 12px;
    border: 2px solid var(--honey);
    border-radius: 12px;
    background: var(--surface);
    color: var(--ink);
    font: inherit;
    font-weight: 700;
    cursor: pointer;
    opacity: 0.8;
  }

  .pin.on {
    opacity: 1;
    background: var(--cream-deep);
    border-color: var(--petal-deep);
  }
</style>
