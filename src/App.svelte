<script lang="ts">
  import { onMount } from 'svelte'
  import { music, themeFor } from './audio/music'
  import { isNight } from './engine/environment'
  import { startSound } from './ui/sound'
  import Art from './art/Art.svelte'
  import { HOME, isSettlement, isSpiritPlace, placeRegion, REGIONS } from './data/world'
  import { latestRegion } from './engine/regions'
  import { formatNumber } from './engine/format'
  import { COURT_RANKS } from './data/economy'
  import { courtRank, trinketCount } from './engine/modifiers'
  import BuffBar from './ui/components/BuffBar.svelte'
  import Notices from './ui/components/Notices.svelte'
  import SatchelButton from './ui/components/SatchelButton.svelte'
  import RiteOverlay from './ui/components/RiteOverlay.svelte'
  import EndingOverlay from './ui/components/EndingOverlay.svelte'
  import FinaleScreen from './ui/components/FinaleScreen.svelte'
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
  import { applySettings, settings, updateSettings } from './ui/settings.svelte'
  import TitleScreen from './ui/title/TitleScreen.svelte'

  const { game } = runtime

  /** The welcome screen shows first on every visit; the game runs (and saves) behind it. */
  let screen = $state<'title' | 'game'>('title')

  function toMenu() {
    runtime.save()
    screen = 'title'
  }

  onMount(() => {
    applySettings()
    const stopSound = startSound()
    const stopGame = runtime.start()
    return () => {
      stopSound()
      stopGame()
    }
  })

  /** The newest region the player has opened (the menu plays its music). */
  const newestRegion = $derived(latestRegion($game))
  /** Music follows where you are (or where you're flying to), and day or night. */
  const musicTheme = $derived(
    screen === 'title'
      ? themeFor(newestRegion, false)
      : themeFor(placeRegion($game.player.travel?.to ?? $game.player.place), isNight($game)),
  )
  $effect(() => music.play(musicTheme))

  /**
   * Soft night colors for the whole interface while it's night in the game, and always in
   * regions that are always dark: the Caves and the twilight Glade (not on the menu).
   */
  const inDark = $derived(
    REGIONS[placeRegion($game.player.travel?.to ?? $game.player.place)]?.dark === true,
  )
  const nightTheme = $derived(
    screen === 'game' && settings.nightTheme === 'auto' && (isNight($game) || inDark),
  )
  $effect(() => {
    if (nightTheme) document.documentElement.dataset.theme = 'night'
    else delete document.documentElement.dataset.theme
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
      <button
        type="button"
        class="mute-button"
        aria-pressed={settings.muted}
        aria-label={settings.muted ? 'Turn sound on' : 'Mute sound'}
        title={settings.muted ? 'Turn sound on' : 'Mute sound'}
        onclick={() => updateSettings({ muted: !settings.muted })}
      >
        {settings.muted ? '🔇' : '🔊'}
      </button>
      <div class="buffs"><BuffBar /></div>
      <div class="counters">
        <SatchelButton />
        <div class="counter" aria-label="Glimmers">
          <Art id="icon-glimmers" size={28} />
          <span>{formatNumber($game.resources.glimmers)}</span>
        </div>
        <div class="counter" aria-label="Trinkets">
          <Art id="icon-trinkets" size={28} />
          <span>{formatNumber(trinketCount($game))}</span>
        </div>
        <div class="rank" aria-label="Court rank">
          {COURT_RANKS[courtRank($game)].name}{#if $game.prestige.run > 1}<span class="run"
              >· Run {$game.prestige.run}</span
            >{/if}
        </div>
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
    <RiteOverlay />
    <EndingOverlay />
    <FinaleScreen />
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
    background: var(--surface);
    color: var(--ink);
    font: inherit;
    font-family: var(--font-heading);
    cursor: pointer;
  }

  .mute-button {
    min-width: 44px;
    min-height: 44px;
    border: 2px solid var(--honey);
    border-radius: 12px;
    background: var(--surface);
    font-size: 1.2rem;
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

  .rank {
    padding: 4px 12px;
    border-radius: 999px;
    background: var(--leaf);
    color: white;
    font-family: var(--font-heading);
    font-weight: 500;
    align-self: center;
  }

  .run {
    margin-left: 6px;
    opacity: 0.85;
  }

  .counter {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 1.2rem;
    font-weight: 700;
  }
</style>
