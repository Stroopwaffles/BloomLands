<script lang="ts">
  import Art from '../../art/Art.svelte'
  import { CHARACTERS, STORIES } from '../../data/stories'
  import { payingStock } from '../../engine/costs'
  import { storiesIn, storyStatus, taskProgress, taskReady } from '../../engine/stories'
  import CostList from './CostList.svelte'
  import { runtime } from '../game'

  /** The settlement's characters, and a conversation window for their stories. */
  let { settlementId }: { settlementId: string } = $props()

  const { game } = runtime
  const storyIds = $derived(storiesIn(settlementId))
  let talkingTo = $state<string | null>(null)

  const open = $derived(talkingTo ? STORIES[talkingTo] : null)
  const progress = $derived(talkingTo ? $game.stories[talkingTo] : undefined)
  const status = $derived(talkingTo ? storyStatus($game, talkingTo) : 'new')
  const chapter = $derived(
    open && progress && !progress.complete ? open.chapters[progress.chapter] : null,
  )
  const lines = $derived(
    !open ? [] : status === 'complete' ? open.ending : (chapter ?? open.chapters[0]).lines,
  )

  function talk() {
    if (talkingTo) runtime.dispatch({ type: 'story/advance', storyId: talkingTo })
  }

  function onKey(event: KeyboardEvent) {
    if (event.key === 'Escape') talkingTo = null
  }
</script>

<svelte:window onkeydown={onKey} />

<ul class="characters">
  {#each storyIds as storyId (storyId)}
    {@const story = STORIES[storyId]}
    {@const character = CHARACTERS[story.characterId]}
    {@const st = storyStatus($game, storyId)}
    {@const ready = st === 'active' && taskReady($game, storyId)}
    <li>
      <Art id={character.id} size={64} />
      <div class="info">
        <strong>{character.name}</strong>
        <span class="title">{character.title}</span>
        <span class="state" class:ready>
          {#if st === 'new'}Has something to ask you{:else if st === 'complete'}Story complete{:else if ready}Ready
            to hand over!{:else}Chapter {($game.stories[storyId]?.chapter ?? 0) + 1} of {story
              .chapters.length}{/if}
        </span>
      </div>
      <button
        type="button"
        class:glow={st === 'new' || ready}
        onclick={() => (talkingTo = storyId)}
      >
        Talk
      </button>
    </li>
  {/each}
</ul>

{#if open && talkingTo}
  {@const character = CHARACTERS[open.characterId]}
  <div class="backdrop" role="presentation" onclick={() => (talkingTo = null)}></div>
  <div class="dialog" role="dialog" aria-modal="true" aria-label={`Talking to ${character.name}`}>
    <header>
      <Art id={character.id} size={72} />
      <div>
        <h3>{character.name}</h3>
        <span>{character.title}</span>
      </div>
    </header>

    <div class="lines">
      {#each lines as line, i (i)}
        <p class="bubble">{line}</p>
      {/each}
    </div>

    {#if status === 'new'}
      <div class="actions">
        <button type="button" class="primary" onclick={talk}>I'll help!</button>
        <button type="button" class="secondary" onclick={() => (talkingTo = null)}
          >Maybe later</button
        >
      </div>
    {:else if chapter}
      {@const [done, needed] = taskProgress($game, talkingTo)}
      <div class="task">
        <strong>{chapter.task.label}</strong>
        {#if chapter.task.kind === 'bring'}
          <CostList cost={chapter.task.items} stock={payingStock($game)} />
        {:else}
          <div class="bar"><div style:width="{(done / needed) * 100}%"></div></div>
          <span>{done} / {needed}</span>
        {/if}
      </div>
      <div class="actions">
        <button
          type="button"
          class="primary"
          disabled={!taskReady($game, talkingTo)}
          onclick={talk}
        >
          {chapter.task.kind === 'bring' ? 'Hand it over' : "It's done!"}
        </button>
        <button type="button" class="secondary" onclick={() => (talkingTo = null)}>Close</button>
      </div>
    {:else}
      <div class="actions">
        <button type="button" class="secondary" onclick={() => (talkingTo = null)}>Goodbye</button>
      </div>
    {/if}
  </div>
{/if}

<style>
  .characters {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 10px;
  }

  .characters li {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    background: var(--surface);
    border-radius: 16px;
  }

  .info {
    flex: 1;
    display: flex;
    flex-direction: column;
    font-size: 0.9rem;
  }

  .title {
    opacity: 0.7;
  }

  .state {
    color: var(--leaf-deep);
    font-weight: 700;
  }

  .state.ready {
    color: var(--petal-deep);
  }

  button {
    min-height: 44px;
    padding: 0 18px;
    border-radius: 12px;
    font: inherit;
    font-weight: 700;
    cursor: pointer;
  }

  .characters button {
    border: 2px solid var(--leaf);
    background: var(--surface);
    color: var(--ink);
  }

  .characters button.glow {
    border-color: var(--petal-deep);
    background: var(--petal);
  }

  .backdrop {
    position: fixed;
    inset: 0;
    background: rgb(40 30 50 / 0.45);
    z-index: 40;
  }

  .dialog {
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: min(520px, calc(100vw - 32px));
    max-height: calc(100vh - 40px);
    overflow: auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 18px;
    border-radius: 24px;
    background: var(--cream);
    border: 3px solid var(--honey);
    z-index: 41;
  }

  .dialog header {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  h3 {
    margin: 0;
  }

  .lines {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .bubble {
    margin: 0;
    padding: 10px 14px;
    border-radius: 16px 16px 16px 4px;
    background: var(--surface);
    line-height: 1.45;
  }

  .task {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 10px 14px;
    border-radius: 14px;
    background: #f1ecff;
    border: 2px dashed #a78bfa;
  }

  .bar {
    height: 10px;
    border-radius: 999px;
    background: var(--surface);
    overflow: hidden;
  }

  .bar div {
    height: 100%;
    background: #a78bfa;
  }

  .actions {
    display: flex;
    gap: 8px;
  }

  .primary {
    border: none;
    background: var(--leaf-deep);
    color: white;
  }

  .primary:disabled {
    background: var(--disabled, #c9c2b8);
    cursor: not-allowed;
  }

  .secondary {
    border: 2px solid var(--honey);
    background: var(--surface);
    color: var(--ink);
  }

  /* Night: the quest requirements box dims to match the night theme. */
  :global([data-theme='night']) .task {
    background: var(--rite-bg);
    border-color: #7a66c0;
  }

  :global([data-theme='night']) .bar div {
    background: #8f7ad8;
  }
</style>
