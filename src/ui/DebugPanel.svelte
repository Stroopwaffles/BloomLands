<script lang="ts">
  import { formatDuration, formatNumber } from '../engine/format'
  import { SaveError } from '../engine/save'
  import { offlineCapMs } from '../engine/tick'
  import { GAME_VERSION } from '../engine/version'
  import { runtime } from './game'

  const { game } = runtime
  const MINUTE = 60_000
  const HOUR = 60 * MINUTE

  let open = $state(false)
  let saveText = $state('')
  let message = $state('')

  function say(text: string) {
    message = text
  }

  function simulateAway(ms: number) {
    runtime.simulateAway(ms)
    say(`Simulated being away for ${formatDuration(ms)}.`)
  }

  function exportNow() {
    saveText = runtime.exportText()
    navigator.clipboard?.writeText(saveText).then(
      () => say('Save exported and copied to the clipboard.'),
      () => say('Save exported below.'),
    )
  }

  function importNow() {
    try {
      runtime.importText(saveText)
      say('Save imported.')
    } catch (error) {
      say(error instanceof SaveError ? error.message : 'Import failed.')
    }
  }

  function resetNow() {
    if (confirm('Delete this save and start a new game?')) {
      runtime.reset()
      say('Started a new game.')
    }
  }
</script>

<div class="debug">
  <button type="button" class="toggle" onclick={() => (open = !open)} aria-expanded={open}>
    {open ? 'Close debug' : 'Debug'}
  </button>

  {#if open}
    <section class="panel" aria-label="Debug panel">
      <h2>Debug</h2>
      <dl>
        <dt>Version</dt>
        <dd>{GAME_VERSION} (save v{$game.meta.saveVersion})</dd>
        <dt>Play time</dt>
        <dd>{formatDuration($game.stats.activePlayMs)}</dd>
        <dt>Offline time</dt>
        <dd>{formatDuration($game.stats.offlineMs)}</dd>
        <dt>Offline cap</dt>
        <dd>{formatDuration(offlineCapMs($game))}</dd>
        <dt>Glimmers</dt>
        <dd>{formatNumber($game.resources.glimmers)}</dd>
        <dt>Click power</dt>
        <dd>{$game.player.clickPower}</dd>
        <dt>Taps / harvests</dt>
        <dd>{formatNumber($game.stats.taps)} / {formatNumber($game.stats.plantsHarvested)}</dd>
        <dt>Last saved</dt>
        <dd>
          {$game.meta.lastSavedAt ? new Date($game.meta.lastSavedAt).toLocaleTimeString() : 'never'}
        </dd>
      </dl>

      <h3>Resources</h3>
      <div class="row">
        <button
          type="button"
          onclick={() =>
            runtime.dispatch({
              type: 'debug/setClickPower',
              value: $game.player.clickPower >= 5 ? 1 : $game.player.clickPower + 1,
            })}
        >
          Click power {$game.player.clickPower >= 5 ? '→ 1' : '+1'}
        </button>
        <button
          type="button"
          onclick={() => runtime.dispatch({ type: 'debug/addGlimmers', amount: 100 })}
        >
          +100 Glimmers
        </button>
        <button
          type="button"
          onclick={() => runtime.dispatch({ type: 'debug/addGlimmers', amount: 1_000_000 })}
        >
          +1M Glimmers
        </button>
      </div>

      <h3>Time</h3>
      <div class="row">
        <button
          type="button"
          onclick={() => runtime.dispatch({ type: 'debug/skipTime', ms: 10 * MINUTE })}
        >
          Skip 10m
        </button>
        <button
          type="button"
          onclick={() => runtime.dispatch({ type: 'debug/skipTime', ms: HOUR })}
        >
          Skip 1h
        </button>
        <button type="button" onclick={() => simulateAway(2 * HOUR)}>Away 2h</button>
        <button type="button" onclick={() => simulateAway(6 * HOUR)}>Away 6h</button>
      </div>

      <h3>Save</h3>
      <div class="row">
        <button type="button" onclick={() => say(runtime.save() ? 'Saved.' : 'Saving is blocked.')}>
          Save now
        </button>
        <button type="button" onclick={exportNow}>Export</button>
        <button type="button" onclick={importNow}>Import</button>
        <button type="button" class="danger" onclick={resetNow}>Reset</button>
      </div>
      <textarea bind:value={saveText} rows="3" placeholder="Exported save text appears here"
      ></textarea>

      {#if message}<p class="message" role="status">{message}</p>{/if}

      <details>
        <summary>Raw state</summary>
        <pre>{JSON.stringify($game, null, 2)}</pre>
      </details>
    </section>
  {/if}
</div>

<style>
  .debug {
    position: fixed;
    right: 12px;
    bottom: 12px;
    z-index: 30;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;
    font-size: 0.9rem;
  }

  .panel {
    order: -1;
    width: min(380px, calc(100vw - 24px));
    max-height: 70vh;
    overflow: auto;
    background: #fffdf8;
    border: 2px dashed var(--petal-deep);
    border-radius: 12px;
    padding: 12px;
    user-select: text;
  }

  h2,
  h3 {
    margin: 8px 0 4px;
  }

  h3 {
    font-size: 1rem;
  }

  dl {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 2px 12px;
    margin: 0;
  }

  dt {
    font-weight: 700;
  }

  dd {
    margin: 0;
  }

  .row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  button {
    min-height: 44px;
    padding: 0 12px;
    border: 1px solid var(--petal-deep);
    border-radius: 10px;
    background: white;
    color: var(--ink);
    font: inherit;
    cursor: pointer;
  }

  .toggle {
    background: var(--petal);
    font-weight: 700;
  }

  .danger {
    border-color: #c0392b;
    color: #c0392b;
  }

  textarea {
    width: 100%;
    margin-top: 6px;
    font-family: monospace;
    font-size: 0.75rem;
  }

  .message {
    margin: 6px 0 0;
    color: var(--leaf-deep);
    font-weight: 700;
  }

  pre {
    font-size: 0.7rem;
    white-space: pre-wrap;
  }
</style>
