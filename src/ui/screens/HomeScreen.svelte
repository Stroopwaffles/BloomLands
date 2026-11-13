<script lang="ts">
  import Art from '../../art/Art.svelte'
  import { countItems } from '../../engine/state'
  import Destinations from '../components/Destinations.svelte'
  import ItemList from '../components/ItemList.svelte'
  import BloomMeter from '../components/BloomMeter.svelte'
  import CurioShelf from '../components/CurioShelf.svelte'
  import PotionShelf from '../components/PotionShelf.svelte'
  import Roost from '../components/Roost.svelte'
  import SatchelLock from '../components/SatchelLock.svelte'
  import { runtime } from '../game'
  import { COURT_RANKS } from '../../data/economy'
  import { formatNumber } from '../../engine/format'
  import { courtPoints, courtRank, storageCapacity, storageUsed } from '../../engine/modifiers'
  import TraderRequests from '../components/TraderRequests.svelte'
  import HelpersTab from './HelpersTab.svelte'
  import ResearchTab from './ResearchTab.svelte'
  import UpgradesTab from './UpgradesTab.svelte'
  import WorkshopTab from './WorkshopTab.svelte'

  const { game } = runtime
  const carrying = $derived(countItems($game.player.satchel))

  type Tab = 'court' | 'workshop' | 'research' | 'helpers' | 'upgrades'
  const TABS: { id: Tab; label: string }[] = [
    { id: 'court', label: 'Court' },
    { id: 'workshop', label: 'Workshop' },
    { id: 'research', label: 'Research' },
    { id: 'helpers', label: 'Helpers' },
    { id: 'upgrades', label: 'Upgrades' },
  ]

  const rank = $derived(courtRank($game))
  const points = $derived(courtPoints($game))
  const nextRank = $derived(COURT_RANKS[rank + 1])
  let tab = $state<Tab>('court')

  const busyStations = $derived(
    Object.values($game.stations).reduce((sum, station) => sum + station.jobs.length, 0),
  )
</script>

<div class="home">
  <nav class="tabs" aria-label="Home sections">
    {#each TABS as t (t.id)}
      <button
        type="button"
        class:active={tab === t.id}
        aria-pressed={tab === t.id}
        onclick={() => (tab = t.id)}
      >
        {t.label}
        {#if t.id === 'workshop' && busyStations > 0}<span class="dot">{busyStations}</span>{/if}
        {#if t.id === 'research' && $game.research.current}<span class="dot">1</span>{/if}
        {#if t.id === 'helpers' && $game.helpers.list.length > 0}
          <span class="dot">{$game.helpers.list.length}</span>
        {/if}
        {#if t.id === 'court' && $game.traders.requests.length > 0}
          <span class="dot visitors">{$game.traders.requests.length}</span>
        {/if}
      </button>
    {/each}
  </nav>

  {#if tab === 'court'}
    <div class="court-layout">
      <section class="court panel">
        <h2>Your court</h2>
        <Art id="char-fairy" size={180} />
        <p class="rank">{COURT_RANKS[rank].name}</p>
        {#if nextRank}
          <div class="rank-bar" aria-label="Progress to next court rank">
            <div style:width="{Math.min(100, (points / nextRank.points) * 100)}%"></div>
          </div>
          <p class="hint">
            {points} / {nextRank.points} court points to become {nextRank.name}. Build rooms to grow
            your court.
          </p>
        {:else}
          <p class="hint">Your court is complete!</p>
        {/if}
      </section>

      <div class="side">
        <section class="panel">
          <h2>Visitors</h2>
          <TraderRequests />
        </section>

        <section class="panel">
          <h2>Satchel</h2>
          {#if carrying > 0}
            <ItemList items={$game.player.satchel} />
            <button
              type="button"
              class="primary"
              onclick={() => runtime.dispatch({ type: 'satchel/deposit' })}
            >
              Put everything in storage
            </button>
          {:else}
            <p class="hint">Empty. Fly out to the Meadow to gather.</p>
          {/if}
          <div class="lock-row"><SatchelLock /></div>
        </section>

        <section class="panel">
          <h2>Fly out</h2>
          <Destinations />
        </section>

        <section class="panel">
          <h2>The land</h2>
          <BloomMeter regionId="meadow" />
        </section>

        <section class="panel">
          <h2>Potions</h2>
          <PotionShelf />
        </section>

        <section class="panel">
          <h2>Roost</h2>
          <Roost />
        </section>

        <section class="panel">
          <h2>Curios</h2>
          <CurioShelf />
        </section>

        <section class="panel">
          <h2>
            Storage
            <span class="capacity">
              {formatNumber(storageUsed($game))} / {formatNumber(storageCapacity($game))}
            </span>
          </h2>
          <ItemList items={$game.inventory} empty="Your storeroom is empty." />
        </section>
      </div>
    </div>
  {:else if tab === 'workshop'}
    <WorkshopTab />
  {:else if tab === 'research'}
    <ResearchTab />
  {:else if tab === 'helpers'}
    <HelpersTab />
  {:else}
    <UpgradesTab />
  {/if}
</div>

<style>
  .home {
    padding: 16px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
  }

  .tabs button {
    position: relative;
    min-height: 48px;
    padding: 0 22px;
    border: 2px solid var(--honey);
    border-radius: 14px;
    background: white;
    color: var(--ink);
    font: inherit;
    font-family: var(--font-heading);
    font-size: 1.05rem;
    cursor: pointer;
  }

  .tabs button.active {
    background: var(--honey);
    font-weight: 600;
  }

  .dot {
    position: absolute;
    top: -8px;
    right: -8px;
    min-width: 22px;
    height: 22px;
    padding: 0 6px;
    border-radius: 999px;
    background: var(--leaf-deep);
    color: white;
    font-size: 0.75rem;
    line-height: 22px;
  }

  .lock-row {
    margin-top: 12px;
    padding-top: 10px;
    border-top: 1px dashed var(--honey);
  }

  .dot.visitors {
    background: var(--petal-deep);
  }

  .rank {
    margin: 8px 0 0;
    font-family: var(--font-heading);
    font-size: 1.3rem;
    color: var(--leaf-deep);
  }

  .rank-bar {
    width: 80%;
    height: 10px;
    margin-top: 6px;
    border-radius: 999px;
    background: white;
    border: 2px solid var(--leaf);
    overflow: hidden;
  }

  .rank-bar div {
    height: 100%;
    background: var(--leaf);
  }

  .capacity {
    font-family: var(--font-body);
    font-size: 0.95rem;
    font-weight: 400;
    opacity: 0.75;
  }

  .tabs {
    flex-wrap: wrap;
  }

  .court-layout {
    display: grid;
    grid-template-columns: minmax(240px, 1fr) 2fr;
    gap: 16px;
    align-items: start;
  }

  .side {
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

  .court {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  h2 {
    margin: 0 0 12px;
    font-size: 1.3rem;
  }

  .hint {
    margin: 8px 0 0;
    opacity: 0.75;
  }

  .primary {
    margin-top: 12px;
    min-height: 48px;
    padding: 0 20px;
    border: none;
    border-radius: 14px;
    background: var(--leaf-deep);
    color: white;
    font: inherit;
    font-weight: 700;
    cursor: pointer;
  }

  @media (max-width: 700px) {
    .lock-row {
      margin-top: 12px;
      padding-top: 10px;
      border-top: 1px dashed var(--honey);
    }

    .dot.visitors {
      background: var(--petal-deep);
    }

    .rank {
      margin: 8px 0 0;
      font-family: var(--font-heading);
      font-size: 1.3rem;
      color: var(--leaf-deep);
    }

    .rank-bar {
      width: 80%;
      height: 10px;
      margin-top: 6px;
      border-radius: 999px;
      background: white;
      border: 2px solid var(--leaf);
      overflow: hidden;
    }

    .rank-bar div {
      height: 100%;
      background: var(--leaf);
    }

    .capacity {
      font-family: var(--font-body);
      font-size: 0.95rem;
      font-weight: 400;
      opacity: 0.75;
    }

    .tabs {
      flex-wrap: wrap;
    }

    .court-layout {
      grid-template-columns: 1fr;
    }
  }
</style>
