<script lang="ts">
  import Art from '../../art/Art.svelte'
  import { RITUALS } from '../../data/magic'
  import { payingStock } from '../../engine/costs'
  import { checkRitual, knownRituals, ritualDone } from '../../engine/magic'
  import { hasFeature } from '../../engine/modifiers'
  import { rootSongPreview } from '../../engine/prestige'
  import { COURT_RANKS } from '../../data/economy'
  import CostList from './CostList.svelte'
  import { runtime } from '../game'
  import { BLOCKED_TEXT } from '../messages'

  const { game } = runtime
  const built = $derived(hasFeature($game, 'ritual-circle'))
  /** Rites that can still do something; one-time rites that are done move to a short list. */
  const rituals = $derived(knownRituals($game).filter((id) => !ritualDone($game, id)))
  const completed = $derived(knownRituals($game).filter((id) => ritualDone($game, id)))

  /** The Root Song Ritual starts a new run, so it asks first. */
  let confirming = $state(false)
  const preview = $derived(rootSongPreview($game))

  function perform(ritualId: string) {
    if (RITUALS[ritualId].effect === 'root-song') confirming = true
    else runtime.dispatch({ type: 'ritual/perform', ritualId })
  }

  function sing() {
    confirming = false
    runtime.dispatch({ type: 'ritual/perform', ritualId: 'ritual-root-song' })
  }
</script>

<section class="panel">
  <header>
    <Art id="feature-ritual-circle" size={44} />
    <h3>Ritual Circle</h3>
  </header>
  {#if !built}
    <p class="hint">Not built yet. Build it from the Upgrades tab.</p>
  {:else if rituals.length === 0 && completed.length === 0}
    <p class="hint">No rites known yet. Research them in the Rites branch.</p>
  {:else}
    <ul>
      {#each rituals as ritualId (ritualId)}
        {@const ritual = RITUALS[ritualId]}
        {@const check = checkRitual($game, ritualId)}
        <li>
          <div>
            <strong>{ritual.name}</strong>
            <span class="desc">{ritual.description}</span>
            <CostList cost={ritual.cost} stock={payingStock($game)} />
            {#if ritual.rank}
              <span class="desc rank" class:short={check === 'needs-rank'}>
                Needs a {COURT_RANKS[ritual.rank].name}.
              </span>
            {/if}
          </div>
          <button
            type="button"
            disabled={check !== 'ok'}
            title={check === 'ok' ? undefined : BLOCKED_TEXT[check]}
            onclick={() => perform(ritualId)}
          >
            Perform
          </button>
        </li>
      {/each}
    </ul>
    {#if confirming}
      <div class="confirm" role="dialog" aria-label="Sing the Root Song?">
        <h4>Sing the Root Song?</h4>
        <p>
          The land heals, and a new run begins (run {$game.prestige.run + 1}). You'll earn
          <strong>{preview.total} Root Song</strong>:
        </p>
        <ul class="parts">
          {#each preview.parts as part (part.label)}
            <li><span>{part.label}</span><strong>+{part.amount}</strong></li>
          {/each}
        </ul>
        <div class="lists">
          <div>
            <strong>Stays</strong>
            <p>
              Your fairy and outfits, Comforts, storage and supply settings, relics, Root Song and
              its upgrades.
            </p>
          </div>
          <div>
            <strong>Starts over</strong>
            <p>
              Glimmers, trinkets, storage, lodging, helpers, research, mounts, curios, stories,
              spirits, pirates, bloom, regions and secret areas.
            </p>
          </div>
        </div>
        <div class="actions">
          <button type="button" class="sing" onclick={sing}>Sing the Root Song</button>
          <button type="button" class="cancel" onclick={() => (confirming = false)}>Not yet</button>
        </div>
      </div>
    {/if}
    {#if completed.length > 0}
      <p class="done">
        Completed: {completed.map((id) => RITUALS[id].name).join(', ')} ✓
      </p>
    {/if}
  {/if}
</section>

<style>
  .rank {
    font-weight: 700;
  }

  .rank.short {
    color: #b03a2e;
  }

  :global([data-theme='night']) .rank.short {
    color: #f29a8e;
  }

  .confirm {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 14px;
    border-radius: 16px;
    background: var(--surface);
    border: 2px solid #d9a441;
  }

  .confirm h4,
  .confirm p {
    margin: 0;
  }

  .parts {
    gap: 2px;
  }

  .parts li {
    justify-content: space-between;
    padding: 2px 8px;
    background: none;
  }

  .lists {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 10px;
    font-size: 0.88rem;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .sing {
    background: #c98a1c;
  }

  .cancel {
    background: var(--disabled, #c9c2d8);
    color: var(--ink);
  }

  .done {
    margin: 0;
    font-size: 0.85rem;
    opacity: 0.75;
  }

  .panel {
    display: flex;
    flex-direction: column;
    gap: 10px;
    background: var(--rite-bg, #f1ecff);
    border: 2px solid #a78bfa;
    border-radius: 20px;
    padding: 16px;
  }

  header {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  h3 {
    margin: 0;
  }

  .hint {
    margin: 0;
    opacity: 0.7;
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  li {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    background: var(--surface);
    border-radius: 14px;
  }

  li div {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .desc {
    font-size: 0.9rem;
  }

  button {
    min-height: 44px;
    padding: 0 16px;
    border: none;
    border-radius: 12px;
    background: #7c5cff;
    color: white;
    font: inherit;
    font-weight: 700;
    cursor: pointer;
  }

  button:disabled {
    background: var(--disabled, #c9c2d8);
    cursor: not-allowed;
  }
</style>
