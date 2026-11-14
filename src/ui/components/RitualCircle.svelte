<script lang="ts">
  import Art from '../../art/Art.svelte'
  import { RITUALS } from '../../data/magic'
  import { payingStock } from '../../engine/costs'
  import {
    checkRitual,
    clearSkyChoices,
    knownRituals,
    riteRegions,
    ritualCost,
    ritualDone,
  } from '../../engine/magic'
  import { WEATHER, type WeatherKind } from '../../data/challenges'
  import { REGIONS } from '../../data/world'
  import { BLOOMCALL } from '../../data/magic'
  import { formatDuration } from '../../engine/format'
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

  /** For rites performed on a region: the region (and, for Clear Skies, the weather) chosen. */
  let regionChoice = $state<Record<string, string>>({})
  let weatherChoice = $state<Record<string, WeatherKind>>({})

  function regionFor(ritualId: string): string | undefined {
    const options = riteRegions($game, ritualId)
    const chosen = regionChoice[ritualId]
    return chosen && options.includes(chosen) ? chosen : options[0]
  }

  function weatherFor(ritualId: string, regionId: string | undefined): WeatherKind | undefined {
    if (!regionId) return undefined
    const options = clearSkyChoices(regionId)
    const chosen = weatherChoice[ritualId]
    return chosen && options.includes(chosen) ? chosen : options[0]
  }

  /** The Root Song Ritual starts a new run, so it asks first. */
  let confirming = $state(false)
  const preview = $derived(rootSongPreview($game))

  function perform(ritualId: string) {
    if (RITUALS[ritualId].effect === 'root-song') {
      confirming = true
      return
    }
    const regionId = regionFor(ritualId)
    runtime.dispatch({
      type: 'ritual/perform',
      ritualId,
      regionId,
      weather: weatherFor(ritualId, regionId),
    })
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
        {@const regionId = regionFor(ritualId)}
        {@const weather = weatherFor(ritualId, regionId)}
        {@const check = checkRitual($game, ritualId, regionId, weather)}
        <li>
          <div>
            <strong>{ritual.name}</strong>
            <span class="desc">{ritual.description}</span>
            {#if ritual.targetsRegion}
              <div class="choices">
                <label>
                  Region
                  <select
                    value={regionId}
                    onchange={(e) => (regionChoice[ritualId] = e.currentTarget.value)}
                  >
                    {#each riteRegions($game, ritualId) as id (id)}
                      <option value={id}>{REGIONS[id].name}</option>
                    {/each}
                  </select>
                </label>
                {#if ritual.effect === 'clear-skies' && regionId}
                  <label>
                    Weather
                    <select
                      value={weather}
                      onchange={(e) =>
                        (weatherChoice[ritualId] = e.currentTarget.value as WeatherKind)}
                    >
                      {#each clearSkyChoices(regionId) as kind (kind)}
                        <option value={kind}>{WEATHER[kind].name}</option>
                      {/each}
                    </select>
                  </label>
                {/if}
              </div>
              {#if ritual.effect === 'bloomcall' && regionId && $game.bloomcalls[regionId]}
                <span class="desc">
                  Bloomcall is already ringing there: {formatDuration($game.bloomcalls[regionId])}
                  left (another adds {formatDuration(BLOOMCALL.durationMs)}).
                </span>
              {/if}
            {/if}
            <CostList cost={ritualCost($game, ritualId, regionId)} stock={payingStock($game)} />
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

  .choices {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: 4px 0;
  }

  .choices label {
    display: inline-flex;
    align-items: flex-start;
    flex-direction: column;
    gap: 2px;
    font-size: 0.8rem;
    font-weight: 700;
  }

  .choices select {
    width: auto;
    min-width: 150px;
    min-height: 40px;
    padding: 0 8px;
    border: 2px solid #a78bfa;
    border-radius: 10px;
    background: var(--surface);
    color: var(--ink);
    font: inherit;
    font-size: 0.9rem;
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
