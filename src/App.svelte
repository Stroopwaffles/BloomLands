<script lang="ts">
  import { onMount } from 'svelte'
  import Art from './art/Art.svelte'
  import { HOME } from './data/world'
  import { formatNumber } from './engine/format'
  import { COURT_RANKS } from './data/economy'
  import { courtRank, satchelCapacity, trinketCount } from './engine/modifiers'
  import { countItems } from './engine/state'
  import BuffBar from './ui/components/BuffBar.svelte'
  import DebugPanel from './ui/DebugPanel.svelte'
  import { debugEnabled, runtime } from './ui/game'
  import HomeScreen from './ui/screens/HomeScreen.svelte'
  import SpotScreen from './ui/screens/SpotScreen.svelte'
  import TravelScreen from './ui/screens/TravelScreen.svelte'
  import WelcomeBack from './ui/WelcomeBack.svelte'

  const { game } = runtime

  const satchelCount = $derived(countItems($game.player.satchel))

  onMount(() => runtime.start())
</script>

<header>
  <h1>Bloom Lands</h1>
  <div class="buffs"><BuffBar /></div>
  <div class="counters">
    <div class="counter" aria-label="Satchel">
      <Art id="icon-satchel" size={28} />
      <span>{formatNumber(satchelCount)} / {formatNumber(satchelCapacity($game))}</span>
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
  {#if $game.player.travel}
    <TravelScreen />
  {:else if $game.player.place === HOME}
    <HomeScreen />
  {:else}
    <SpotScreen />
  {/if}
</main>

<WelcomeBack />
{#if debugEnabled}<DebugPanel />{/if}

<style>
  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 12px 16px;
    background: var(--cream-deep);
    border-bottom: 2px solid var(--honey);
  }

  h1 {
    margin: 0;
    font-size: 1.6rem;
    color: var(--leaf-deep);
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
