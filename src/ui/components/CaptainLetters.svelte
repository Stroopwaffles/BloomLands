<script lang="ts">
  import Art from '../../art/Art.svelte'
  import { CAPTAIN, CAPTAIN_LETTERS } from '../../data/ending'
  import { captainJoined, captainLetters, unreadLetters } from '../../engine/ending'
  import { runtime } from '../game'

  /** Letters from Captain Mallow, one for each pirate crew ever won over. Kept through every run. */
  const { game } = runtime
  const letters = $derived(captainLetters($game))
  const unread = $derived(unreadLetters($game))
  let open = $state<number | null>(null)

  function toggle(i: number) {
    open = open === i ? null : i
    if (unread > 0) runtime.dispatch({ type: 'captain/read' })
  }
</script>

{#if letters.length > 0}
  <section class="panel letters">
    <header>
      <Art id={CAPTAIN.id} size={48} />
      <div>
        <h2>
          {captainJoined($game) ? 'Captain Mallow' : 'Letters from Captain Mallow'}
          {#if unread > 0}<span class="new">{unread} new</span>{/if}
        </h2>
        <p class="hint">
          {captainJoined($game)
            ? 'She lives at your court now, and the Stormchasers keep watch over it.'
            : `Each pirate crew you win over sends word to their captain. (${letters.length} of ${CAPTAIN_LETTERS.length})`}
        </p>
      </div>
    </header>
    <ul>
      {#each letters as letter, i (i)}
        <li>
          <button type="button" aria-expanded={open === i} onclick={() => toggle(i)}>
            <span>✉</span>
            {letter.title}
          </button>
          {#if open === i}
            <div class="letter">
              {#each letter.lines as line, j (j)}
                <p>{line}</p>
              {/each}
            </div>
          {/if}
        </li>
      {/each}
    </ul>
  </section>
{/if}

<style>
  .letters header {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  h2 {
    margin: 0;
    font-size: 1.15rem;
  }

  .hint {
    margin: 2px 0 0;
    font-size: 0.85rem;
    opacity: 0.8;
  }

  .new {
    margin-left: 6px;
    padding: 1px 8px;
    border-radius: 999px;
    background: #c0392b;
    color: white;
    font-size: 0.75rem;
    vertical-align: middle;
  }

  ul {
    list-style: none;
    margin: 10px 0 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  li button {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 44px;
    padding: 0 12px;
    border: 2px solid var(--honey);
    border-radius: 12px;
    background: var(--surface);
    color: var(--ink);
    font: inherit;
    font-weight: 700;
    text-align: left;
    cursor: pointer;
  }

  .letter {
    margin: 4px 0 0;
    padding: 10px 14px;
    border-radius: 12px;
    background: #fbf3e2;
    color: #4a3a2a;
    font-family: var(--font-heading);
    border: 1px dashed #c9a77f;
  }

  :global([data-theme='night']) .letter {
    background: #3a3260;
    color: var(--ink);
    border-color: #6a5aa8;
  }

  .letter p {
    margin: 0 0 6px;
  }

  .letter p:last-child {
    margin: 0;
  }
</style>
