<script lang="ts">
  import Art from '../../art/Art.svelte'
  import { countItems } from '../../engine/state'
  import Destinations from '../components/Destinations.svelte'
  import ItemList from '../components/ItemList.svelte'
  import PotionShelf from '../components/PotionShelf.svelte'
  import { runtime } from '../game'
  import ResearchTab from './ResearchTab.svelte'
  import WorkshopTab from './WorkshopTab.svelte'

  const { game } = runtime
  const carrying = $derived(countItems($game.player.satchel))

  type Tab = 'court' | 'workshop' | 'research'
  const TABS: { id: Tab; label: string }[] = [
    { id: 'court', label: 'Court' },
    { id: 'workshop', label: 'Workshop' },
    { id: 'research', label: 'Research' },
  ]
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
      </button>
    {/each}
  </nav>

  {#if tab === 'court'}
    <div class="court-layout">
      <section class="court panel">
        <h2>Your court</h2>
        <Art id="char-fairy" size={180} />
        <p class="hint">A humble start. One day this will be a grand court.</p>
      </section>

      <div class="side">
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
        </section>

        <section class="panel">
          <h2>Fly out</h2>
          <Destinations />
        </section>

        <section class="panel">
          <h2>Potions</h2>
          <PotionShelf />
        </section>

        <section class="panel">
          <h2>Storage</h2>
          <ItemList items={$game.inventory} empty="Your storeroom is empty." />
        </section>
      </div>
    </div>
  {:else if tab === 'workshop'}
    <WorkshopTab />
  {:else}
    <ResearchTab />
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
    .court-layout {
      grid-template-columns: 1fr;
    }
  }
</style>
