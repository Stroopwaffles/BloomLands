<script lang="ts">
  import { onMount } from 'svelte'
  import Art from './art/Art.svelte'
  import { HOME, isSettlement, isSpiritPlace } from './data/world'
  import { formatNumber } from './engine/format'
  import { COURT_RANKS } from './data/economy'
  import { courtRank, satchelCapacity, trinketCount } from './engine/modifiers'
  import { countItems } from './engine/state'
  import BuffBar from './ui/components/BuffBar.svelte'
  import Notices from './ui/components/Notices.svelte'
  import SkyBadge from './ui/components/SkyBadge.svelte'
  import DebugPanel from './ui/DebugPanel.svelte'
  import { debugEnabled, runtime } from './ui/game'
  import CharacterCreator from './ui/screens/CharacterCreator.svelte'
  import HomeScreen from './ui/screens/HomeScreen.svelte'
  import SettlementScreen from './ui/screens/SettlementScreen.svelte'
  import SpiritScreen from './ui/screens/SpiritScreen.svelte'
  import SpotScreen from './ui/screens/SpotScreen.svelte'
  import TravelScreen from './ui/screens/TravelScreen.svelte'
  import WelcomeBack from './ui/WelcomeBack.svelte'
  import { applySettings, settings } from './ui/settings.svelte'
  import TitleScreen from './ui/title/TitleScreen.svelte'

  const { game } = runtime

  const satchelCount = $derived(countItems($game.player.satchel))

  /** The welcome screen shows first on every visit; the game runs (and saves) behind it. */
  let screen = $state<'title' | 'game'>('title')

  function toMenu() {
    runtime.save()
    screen = 'title'
  }

  onMount(() => {
    applySettings()
    return runtime.start()
  })
</script>

{#if screen === 'title'}
  <TitleScreen onPlay={() => (screen = 'game')} />
{:else}
  {#key settings.numberStyle}
    <header>
      <button type="button" class="menu-button" onclick={toMenu} aria-label="Main menu">Menu</button
      >
      <h1>Bloom Lands</h1>
      <SkyBadge />
      <div class="buffs"><BuffBar /></div>
      <div class="counters">
        <div class="counter" aria-label="Satchel">
          <Art id="icon-satchel" size={28} />
          <span>{formatNumber(satchelCount)} / {formatNumber(satchelCapacity($game))}</span>
          {#if $game.player.satchelLocked}<span class="locked-tag">locked</span>{/if}
        </div>
        <div class="counter" aria-label="Glimmers">
          <Art id="icon-glimmers" size={28} />
          <span>{formatNumber($game.resources.glimmers)}</span>
        </div>
        <div class="counter" aria-label="Trinkets">
          <Art id="icon-trinkets" size={28} />
          <span>{formatNumber(trinketCount($game))}</span>
        </div>
        <div class="rank" aria-label="Court rank">{COURT_RANKS[courtRank($game)].name}</div>
      </div>
    </header>

    <main>
      {#if !$game.character.created}
        <CharacterCreator />
      {:else if $game.player.travel}
        <TravelScreen />
      {:else if $game.player.place === HOME}
        <HomeScreen />
      {:else if isSettlement($game.player.place)}
        <SettlementScreen />
      {:else if isSpiritPlace($game.player.place)}
        <SpiritScreen />
      {:else}
        <SpotScreen />
      {/if}
    </main>

    <WelcomeBack />
    <Notices />
  {/key}
{/if}
{#if debugEnabled}<DebugPanel />{/if}

<style>
  header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 12px 16px;
    background: var(--cream-deep);
    border-bottom: 2px solid var(--honey);
  }

  .menu-button {
    min-height: 44px;
    padding: 0 14px;
    border: 2px solid var(--honey);
    border-radius: 12px;
    background: white;
    color: var(--ink);
    font: inherit;
    font-family: var(--font-heading);
    cursor: pointer;
  }

  h1 {
    margin: 0;
    font-size: 1.6rem;
    color: var(--leaf-deep);
    white-space: nowrap;
  }

  .buffs {
    flex: 1;
    display: flex;
    justify-content: center;
  }

  .counters {
    display: flex;
    gap: 20px;
  }

  .locked-tag {
    padding: 0 8px;
    border-radius: 999px;
    background: var(--petal-deep);
    color: white;
    font-size: 0.75rem;
  }

  .rank {
    padding: 4px 12px;
    border-radius: 999px;
    background: var(--leaf);
    color: white;
    font-family: var(--font-heading);
    font-weight: 500;
    align-self: center;
  }

  .counter {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 1.2rem;
    font-weight: 700;
  }
</style>
