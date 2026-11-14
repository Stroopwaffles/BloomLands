<script lang="ts">
  import { COURT_RANKS } from '../../data/economy'
  import { formatDuration } from '../../engine/format'
  import { courtRank } from '../../engine/modifiers'
  import { SaveError } from '../../engine/save'
  import { runtime } from '../game'

  /** Export, import and delete the save (design doc 6: export/import backup strings). */
  let { onImported }: { onImported: () => void } = $props()

  const { game } = runtime
  const hasSave = $derived($game.character.created)

  let exported = $state('')
  let importText = $state('')
  let message = $state('')
  let confirmDelete = $state(false)
  let confirmImport = $state(false)

  function exportNow() {
    runtime.save()
    exported = runtime.exportText()
    navigator.clipboard?.writeText(exported).then(
      () => (message = 'Backup copied to your clipboard.'),
      () => (message = 'Backup ready below. Copy it somewhere safe.'),
    )
  }

  function download() {
    runtime.save()
    const text = runtime.exportText()
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `bloom-lands-save-${new Date().toISOString().slice(0, 10)}.txt`
    a.click()
    URL.revokeObjectURL(url)
    message = 'Backup file saved.'
  }

  async function loadFile(event: Event) {
    const file = (event.currentTarget as HTMLInputElement).files?.[0]
    if (!file) return
    importText = (await file.text()).trim()
    message = `Loaded ${file.name}. Press Import to use it.`
  }

  function importNow() {
    if (hasSave && !confirmImport) {
      confirmImport = true
      return
    }
    try {
      runtime.importText(importText)
      message = 'Save imported!'
      confirmImport = false
      onImported()
    } catch (error) {
      message = error instanceof SaveError ? error.message : 'That save could not be loaded.'
      confirmImport = false
    }
  }

  function deleteNow() {
    runtime.reset()
    confirmDelete = false
    exported = ''
    message = 'Save deleted. A new court awaits.'
  }
</script>

<h2>Saves</h2>

<section class="current">
  {#if hasSave}
    <strong>Your court: {COURT_RANKS[courtRank($game)].name}</strong>
    <span>Played {formatDuration($game.stats.activePlayMs + $game.stats.offlineMs)}</span>
    <span>
      Last saved {$game.meta.lastSavedAt
        ? new Date($game.meta.lastSavedAt).toLocaleString()
        : 'not yet'}
    </span>
  {:else}
    <strong>No court yet.</strong>
    <span>Import a backup, or start a new game.</span>
  {/if}
</section>

<p class="hint">
  Your game saves itself in this browser. Clearing browser data erases it, so keep a backup.
</p>

{#if hasSave}
  <section>
    <h3>Back up</h3>
    <div class="row">
      <button type="button" onclick={exportNow}>Copy backup text</button>
      <button type="button" onclick={download}>Save backup file</button>
    </div>
    {#if exported}
      <textarea readonly rows="3" value={exported} aria-label="Backup text"></textarea>
    {/if}
  </section>
{/if}

<section>
  <h3>Restore</h3>
  <textarea
    rows="3"
    bind:value={importText}
    placeholder="Paste backup text here"
    aria-label="Backup text to import"></textarea>
  <div class="row">
    <label class="file">
      Load backup file
      <input type="file" accept=".txt,text/plain" onchange={loadFile} />
    </label>
    <button type="button" disabled={!importText.trim()} onclick={importNow}>
      {confirmImport ? 'Yes, replace my court' : 'Import'}
    </button>
  </div>
  {#if confirmImport}
    <p class="warn">This replaces your current court. Press again to confirm.</p>
  {/if}
</section>

{#if hasSave}
  <section>
    <h3>Delete</h3>
    {#if confirmDelete}
      <p class="warn">This erases your court from this browser. It can't be undone.</p>
      <div class="row">
        <button type="button" class="danger" onclick={deleteNow}>Delete my court</button>
        <button type="button" onclick={() => (confirmDelete = false)}>Keep it</button>
      </div>
    {:else}
      <button type="button" class="danger" onclick={() => (confirmDelete = true)}>
        Delete save…
      </button>
    {/if}
  </section>
{/if}

{#if message}<p class="message" role="status">{message}</p>{/if}

<style>
  section {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-top: 12px;
  }

  .current {
    margin-top: 0;
    padding: 10px 14px;
    border-radius: 14px;
    background: var(--cream-deep);
  }

  h3 {
    margin: 0;
    font-size: 1rem;
  }

  .row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .hint {
    margin: 10px 0 0;
    font-size: 0.85rem;
    opacity: 0.75;
  }

  textarea {
    width: 100%;
    padding: 8px;
    border: 2px solid var(--honey);
    border-radius: 10px;
    font-family: monospace;
    font-size: 0.75rem;
    user-select: text;
  }

  .file {
    display: inline-flex;
    align-items: center;
    min-height: 50px;
    padding: 0 22px;
    border: 2px solid rgb(var(--surface-rgb) / 0.9);
    border-radius: 16px;
    background: rgb(var(--cream-rgb) / 0.85);
    font-family: var(--font-heading);
    font-size: 1.15rem;
    cursor: pointer;
    box-shadow: 0 3px 10px rgb(90 67 82 / 0.12);
  }

  .file input {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
  }

  .file:focus-within {
    outline: 3px solid var(--leaf-deep);
  }

  .warn {
    margin: 0;
    color: #a52a1f;
    font-weight: 700;
    font-size: 0.9rem;
  }

  .message {
    margin: 12px 0 0;
    color: var(--leaf-deep);
    font-weight: 700;
  }

  .danger {
    border-color: #c0392b !important;
    color: #a52a1f !important;
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
