<script lang="ts">
  import { onMount } from 'svelte'
  import CourtScene from '../../art/CourtScene.svelte'
  import { OUTFIT_SETS } from '../../data/appearance'
  import { RELIC_LIST } from '../../data/prestige'
  import { captainJoined } from '../../engine/ending'
  import { formatDuration, formatNumber } from '../../engine/format'
  import { courtRank } from '../../engine/modifiers'
  import { endingView } from '../endingView.svelte'
  import { runtime } from '../game'

  /**
   * The hard ending (design doc 3.11): the bonus run reached the final court rank. A last look at
   * the finished court and everything the player did, then a brand-new game if they like.
   */
  const { game } = runtime
  let confirming = $state(false)

  onMount(() =>
    runtime.onEvents((events) => {
      if (events.some((e) => e.type === 'finale')) {
        confirming = false
        endingView.finale = true
      }
    }),
  )

  const stats = $derived.by(() => {
    const s = $game.stats
    const p = $game.prestige
    return [
      ['Time in the land', formatDuration(s.activePlayMs + s.offlineMs)],
      ['Runs', String(p.run)],
      ['Root Song earned', formatNumber(p.rootSongEarned)],
      ['Relics', `${p.relics.length} of ${RELIC_LIST.length}`],
      ['Pirate crews befriended', String(p.crewsEverWon.length)],
      ['Outfits', `${$game.outfits.length + 1} of ${Object.keys(OUTFIT_SETS).length}`],
      ['Plants gathered', formatNumber(s.plantsHarvested)],
      ['Things crafted', formatNumber(s.itemsCrafted)],
      ['Villagers helped', formatNumber(s.villagersHelped)],
      ['Glimmers earned', formatNumber(s.glimmersEarned)],
      ['Rites performed', formatNumber(s.ritualsPerformed)],
    ]
  })

  function brandNew() {
    endingView.finale = false
    runtime.reset()
  }
</script>

{#if endingView.finale}
  <div class="finale" role="dialog" aria-label="The end">
    <h2>The End</h2>
    <p class="lead">
      Your court is complete. The land is whole and blooming, and everyone you helped along the way
      has a home.
    </p>
    <div class="court">
      <CourtScene
        rank={courtRank($game)}
        helperTypes={$game.helpers.list.map((h) => h.type)}
        captain={captainJoined($game)}
        size={300}
      />
    </div>
    <dl class="stats">
      {#each stats as [label, value] (label)}
        <div>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      {/each}
    </dl>
    <p class="thanks">Thank you for playing Bloom Lands.</p>
    <div class="actions">
      <button type="button" class="stay" onclick={() => (endingView.finale = false)}>
        Stay a while
      </button>
      {#if confirming}
        <button type="button" class="new" onclick={brandNew}>Yes, start over from nothing</button>
        <button type="button" class="stay" onclick={() => (confirming = false)}>No, wait</button>
      {:else}
        <button type="button" class="new" onclick={() => (confirming = true)}>
          Start a brand-new game
        </button>
      {/if}
    </div>
    {#if confirming}
      <p class="warning">
        A brand-new game starts from nothing: no relics, no Root Song, no outfits. Your current game
        is gone for good (export it from Saves first if you'd like to keep it).
      </p>
    {/if}
  </div>
{/if}

<style>
  .finale {
    position: fixed;
    inset: 0;
    z-index: 96;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    padding: 28px 20px;
    overflow-y: auto;
    background: radial-gradient(circle at 50% 30%, #3a3170, #120f2b 80%);
    color: #fffaf0;
    text-align: center;
    animation: fade 1.2s ease-out both;
  }

  h2 {
    margin: 0;
    font-family: var(--font-heading);
    font-size: clamp(2.4rem, 7vw, 4rem);
    color: #ffe59e;
    text-shadow: 0 0 24px rgb(255 229 158 / 0.6);
  }

  .lead,
  .thanks,
  .warning {
    margin: 0;
    max-width: 560px;
  }

  .thanks {
    font-family: var(--font-heading);
    font-size: 1.2rem;
  }

  .warning {
    font-size: 0.9rem;
    color: #f7c6a8;
  }

  .court {
    filter: drop-shadow(0 0 30px rgb(255 229 158 / 0.45));
  }

  .stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 8px;
    width: min(640px, 100%);
    margin: 0;
  }

  .stats div {
    padding: 8px 10px;
    border-radius: 12px;
    background: rgb(255 255 255 / 0.08);
  }

  dt {
    font-size: 0.8rem;
    opacity: 0.8;
  }

  dd {
    margin: 2px 0 0;
    font-weight: 700;
    font-size: 1.1rem;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
  }

  .actions button {
    min-height: 48px;
    padding: 0 20px;
    border-radius: 14px;
    font: inherit;
    font-weight: 700;
    cursor: pointer;
  }

  .stay {
    border: 2px solid #fff3b0;
    background: none;
    color: #fffaf0;
  }

  .new {
    border: none;
    background: #c98a1c;
    color: white;
  }

  @keyframes fade {
    from {
      opacity: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .finale {
      animation: none;
    }
  }
</style>
