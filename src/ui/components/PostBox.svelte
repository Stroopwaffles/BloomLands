<script lang="ts">
  import Art from '../../art/Art.svelte'
  import { formatDuration, formatNumber } from '../../engine/format'
  import { hasQol } from '../../engine/modifiers'
  import { checkPost, postDelayMs, postFee } from '../../engine/post'
  import { countItems } from '../../engine/state'
  import { runtime } from '../game'
  import { BLOCKED_TEXT } from '../messages'

  /** The Acorn Post at a settlement: send the satchel home without flying there. */
  const { game } = runtime
  const owned = $derived(hasQol($game, 'post'))
  const items = $derived(countItems($game.player.satchel))
  const check = $derived(checkPost($game))
  const fee = $derived(postFee($game))
  const delay = $derived(postDelayMs($game, $game.player.place))
</script>

<section class="panel post">
  <h3>Acorn Post</h3>
  {#if !owned}
    <p class="note">
      Buy the Acorn Post (Upgrades → Comforts) to send your satchel home from here.
    </p>
  {:else}
    <p class="note">
      A courier squirrel carries your whole satchel home. It reaches storage in about
      {formatDuration(delay)}.
    </p>
    <div class="row">
      <span>{formatNumber(items)} items in your satchel</span>
      <button
        type="button"
        disabled={check !== 'ok'}
        title={check === 'ok'
          ? undefined
          : check === 'no-target'
            ? 'Your satchel is empty.'
            : BLOCKED_TEXT[check]}
        onclick={() => runtime.dispatch({ type: 'post/send' })}
      >
        Send home
        <span class="fee"><Art id="icon-glimmers" size={18} />{formatNumber(fee)}</span>
      </button>
    </div>
  {/if}
</section>

<style>
  .panel {
    max-width: 900px;
    margin: 0 auto 16px;
    background: var(--cream-deep);
    border: 2px solid var(--honey);
    border-radius: 20px;
    padding: 16px;
  }

  h3 {
    margin: 0;
  }

  .note {
    margin: 4px 0 12px;
    font-size: 0.9rem;
    opacity: 0.8;
  }

  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }

  button {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 48px;
    padding: 0 18px;
    border: none;
    border-radius: 14px;
    background: var(--leaf-deep);
    color: white;
    font: inherit;
    font-weight: 700;
    cursor: pointer;
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .fee {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    padding: 2px 8px;
    border-radius: 999px;
    background: rgb(255 255 255 / 0.25);
  }
</style>
