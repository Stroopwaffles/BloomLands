<script lang="ts">
  import Art from '../../art/Art.svelte'
  import { COURT_RANKS } from '../../data/economy'
  import { PRESTIGE_RULES, RELIC_LIST, ROMAN, ROOT_UPGRADE_LIST } from '../../data/prestige'
  import { SPIRITS } from '../../data/spirits'
  import {
    checkRootUpgrade,
    nextRelic,
    rootSongPreview,
    rootUpgradeCost,
    rootUpgradeTier,
  } from '../../engine/prestige'
  import { runtime } from '../game'
  import { BLOCKED_TEXT } from '../messages'

  /**
   * Root Song (design doc 3.11): spend it on upgrades that last forever, and see the relics
   * the spirits have given. Both carry into every run.
   */
  const { game } = runtime
  const prestige = $derived($game.prestige)
  const preview = $derived(rootSongPreview($game))
  const spirits = Object.values(SPIRITS)

  function relicsOf(spiritId: string) {
    return RELIC_LIST.filter((r) => r.spiritId === spiritId)
  }
</script>

<div class="root-song">
  <section class="panel summary">
    <Art id="icon-root-song" size={64} />
    <div>
      <h3>Root Song</h3>
      <p class="balance"><strong>{prestige.rootSong}</strong> to spend</p>
      <p class="note">
        Run {prestige.run}{prestige.rootSongEarned > 0
          ? ` · ${prestige.rootSongEarned} earned in all`
          : ''}.
        {#if prestige.run === 1}
          Reach a {COURT_RANKS[PRESTIGE_RULES.requiredRank].name}, research the Root Song Ritual
          (Rites) and brew a Harmony Blend to sing it. Right now it would give
          <strong>{preview.total}</strong> Root Song.
        {:else}
          Singing again now would give <strong>{preview.total}</strong> Root Song.
        {/if}
      </p>
      {#if prestige.freshRun}
        <p class="fresh">
          A new run! Start-of-run gifts bought now still count for this run, until you leave home.
        </p>
      {/if}
    </div>
  </section>

  <section class="panel">
    <h3>Upgrades</h3>
    <p class="note">Bought with Root Song. They last forever, through every run.</p>
    <ul class="upgrades">
      {#each ROOT_UPGRADE_LIST as upgrade (upgrade.id)}
        {@const tier = rootUpgradeTier($game, upgrade.id)}
        {@const cost = rootUpgradeCost($game, upgrade.id)}
        {@const check = checkRootUpgrade($game, upgrade.id)}
        <li class:maxed={check === 'maxed'}>
          <div class="info">
            <strong>{upgrade.name}</strong>
            <span class="desc">{upgrade.perTier}</span>
            <span class="tiers" aria-label={`Tier ${tier} of ${upgrade.costs.length}`}>
              {#each upgrade.costs.keys() as i (i)}
                <span class="pip" class:on={i < tier}></span>
              {/each}
              {#if upgrade.nextRun && !prestige.freshRun}
                <span class="later">from your next run</span>
              {/if}
            </span>
          </div>
          {#if cost === null}
            <span class="badge">Max</span>
          {:else}
            <button
              type="button"
              disabled={check !== 'ok'}
              title={check === 'ok' ? undefined : BLOCKED_TEXT[check]}
              onclick={() => runtime.dispatch({ type: 'rootsong/buy', upgradeId: upgrade.id })}
            >
              <Art id="icon-root-song" size={20} />
              {cost}
            </button>
          {/if}
        </li>
      {/each}
    </ul>
  </section>

  <section class="panel relics">
    <h3>Relics</h3>
    <p class="note">
      Each spirit gives one relic a run when it wakes, in order. Relics last forever. Later runs ask
      a little more of each spirit.
    </p>
    {#each spirits as spirit (spirit.id)}
      {@const next = nextRelic($game, spirit.id)}
      <div class="spirit-row">
        <h4>{spirit.name}</h4>
        <ul>
          {#each relicsOf(spirit.id) as relic (relic.id)}
            {@const owned = prestige.relics.includes(relic.id)}
            <li class:owned class:next={next?.id === relic.id}>
              <span class="art"><Art id={owned ? relic.id : 'relic-unknown'} size={44} /></span>
              <span class="numeral">{ROMAN[relic.index]}</span>
              {#if owned}
                <strong>{relic.name}</strong>
                <span class="desc">{relic.description}</span>
              {:else if next?.id === relic.id}
                <strong>Next gift</strong>
                <span class="desc">
                  {prestige.giftedThisRun.includes(spirit.id)
                    ? 'Wake this spirit in a later run.'
                    : 'Wake this spirit to receive it.'}
                </span>
              {:else}
                <strong>???</strong>
              {/if}
            </li>
          {/each}
        </ul>
      </div>
    {/each}
  </section>
</div>

<style>
  .root-song {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .panel {
    background: var(--cream-deep);
    border: 2px solid var(--honey);
    border-radius: 20px;
    padding: 16px;
  }

  h3,
  h4,
  p {
    margin: 0;
  }

  .summary {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .summary > div {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .balance {
    font-size: 1.3rem;
  }

  .note {
    margin: 4px 0 10px;
    font-size: 0.9rem;
    opacity: 0.85;
  }

  .summary .note {
    margin: 0;
  }

  .fresh {
    padding: 6px 10px;
    border-radius: 10px;
    background: rgb(var(--surface-rgb) / 0.9);
    border: 2px dashed #d9a441;
    font-size: 0.9rem;
    font-weight: 700;
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .upgrades {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 8px;
  }

  .upgrades li {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    border-radius: 14px;
    background: var(--surface);
  }

  .upgrades li.maxed {
    opacity: 0.8;
  }

  .info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .desc {
    font-size: 0.85rem;
  }

  .tiers {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 2px;
  }

  .pip {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 2px solid #d9a441;
  }

  .pip.on {
    background: #d9a441;
  }

  .later {
    margin-left: 4px;
    font-size: 0.75rem;
    font-style: italic;
    opacity: 0.75;
  }

  button {
    display: flex;
    align-items: center;
    gap: 4px;
    min-height: 44px;
    padding: 0 12px;
    border: none;
    border-radius: 12px;
    background: #c98a1c;
    color: white;
    font: inherit;
    font-weight: 700;
    cursor: pointer;
  }

  button:disabled {
    background: var(--disabled, #c9c2d8);
    cursor: not-allowed;
  }

  .badge {
    padding: 4px 10px;
    border-radius: 999px;
    background: var(--leaf);
    color: white;
    font-weight: 700;
    font-size: 0.85rem;
  }

  .spirit-row + .spirit-row {
    margin-top: 12px;
  }

  .spirit-row h4 {
    margin-bottom: 6px;
  }

  .spirit-row ul {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 8px;
  }

  .spirit-row li {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 10px 8px;
    border-radius: 14px;
    background: var(--surface);
    text-align: center;
    opacity: 0.55;
  }

  .spirit-row li.owned {
    opacity: 1;
    box-shadow: 0 0 0 2px #d9a441;
  }

  .spirit-row li.next {
    opacity: 0.9;
    border: 2px dashed #d9a441;
  }

  .numeral {
    position: absolute;
    top: 6px;
    left: 8px;
    font-family: var(--font-heading);
    font-size: 0.8rem;
    font-weight: 600;
    opacity: 0.7;
  }

  .spirit-row .desc {
    font-size: 0.78rem;
  }
</style>
