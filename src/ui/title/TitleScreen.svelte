<script lang="ts" module>
  /** Remembered for the whole visit, so the intro doesn't replay every time the menu opens. */
  let introSeen = false
</script>

<script lang="ts">
  import { onMount } from 'svelte'
  import FairyFigure from '../../art/FairyFigure.svelte'
  import SceneBackdrop from '../../art/SceneBackdrop.svelte'
  import { DEFAULT_LOOK, defaultWardrobe } from '../../data/appearance'
  import { BLOOM_LEVELS } from '../../data/bloom'
  import { COURT_RANKS } from '../../data/economy'
  import { REGIONS } from '../../data/world'
  import { formatDuration } from '../../engine/format'
  import { bloomLevel, courtRank } from '../../engine/modifiers'
  import { GAME_VERSION } from '../../engine/version'
  import { runtime } from '../game'
  import CreditsPanel from './CreditsPanel.svelte'
  import SavesPanel from './SavesPanel.svelte'
  import SettingsPanel from './SettingsPanel.svelte'

  /** The welcome screen: a short intro, then the main menu (inspired by Fold Drive Miner's). */
  let { onPlay }: { onPlay: () => void } = $props()

  const { game } = runtime
  const hasSave = $derived($game.character.created)

  type View = 'menu' | 'settings' | 'saves' | 'credits' | 'confirm-new'
  let view = $state<View>('menu')

  // The intro plays once per visit and can be skipped with any tap or key.
  let intro = $state(!introSeen)
  onMount(() => {
    introSeen = true
    if (!intro) return
    const timer = setTimeout(() => (intro = false), 2800)
    const skip = () => (intro = false)
    window.addEventListener('keydown', skip, { once: true })
    return () => {
      clearTimeout(timer)
      window.removeEventListener('keydown', skip)
    }
  })

  function newGame() {
    if (hasSave) {
      view = 'confirm-new'
      return
    }
    startFresh()
  }

  function startFresh() {
    runtime.reset()
    onPlay()
  }

  const petals = Array.from({ length: 14 }, (_, i) => ({
    left: (i * 37) % 100,
    delay: (i * 0.9) % 7,
    duration: 7 + ((i * 13) % 6),
    hue: ['#f7b7c8', '#ffffff', '#ffd94f', '#cdbbf5'][i % 4],
  }))
</script>

<div class="title-screen">
  <div class="scene" aria-hidden="true">
    <SceneBackdrop spotId="buttercup-rise" weather="sunshine" />
    <div class="golden"></div>
    {#each petals as p, i (i)}
      <span
        class="petal-fall"
        style:left="{p.left}%"
        style:animation-delay="{p.delay}s"
        style:animation-duration="{p.duration}s"
        style:--hue={p.hue}
      ></span>
    {/each}
  </div>

  <div class="layout">
    <div class="brand">
      <span class="tag">Release {GAME_VERSION.split('.').slice(0, 2).join('.')} · The Forest</span>
      <h1 class="logo">Bloom<br />Lands</h1>
      <p class="tagline">a cozy fairy court</p>

      {#if view === 'menu'}
        <nav class="menu" aria-label="Main menu">
          {#if hasSave}
            <button type="button" class="primary" onclick={onPlay}>Continue</button>
          {/if}
          <button type="button" class:primary={!hasSave} onclick={newGame}>New game</button>
          <button type="button" onclick={() => (view = 'saves')}>Saves</button>
          <button type="button" onclick={() => (view = 'settings')}>Settings</button>
          <button type="button" onclick={() => (view = 'credits')}>Credits</button>
        </nav>
      {:else}
        <section class="panel-box" aria-live="polite">
          {#if view === 'settings'}
            <SettingsPanel />
          {:else if view === 'saves'}
            <SavesPanel onImported={onPlay} />
          {:else if view === 'credits'}
            <CreditsPanel />
          {:else if view === 'confirm-new'}
            <h2>Start a new court?</h2>
            <p>
              Your current court will be replaced. If you'd like to keep it, export a backup from
              Saves first.
            </p>
            <div class="row">
              <button type="button" class="danger" onclick={startFresh}>Start a new court</button>
              <button type="button" onclick={() => (view = 'saves')}>Go to Saves</button>
            </div>
          {/if}
          <button type="button" class="back" onclick={() => (view = 'menu')}>Back</button>
        </section>
      {/if}
    </div>

    <div class="hero">
      <div class="halo" aria-hidden="true"></div>
      {#if hasSave}
        <FairyFigure look={$game.character.look} wardrobe={$game.character.wardrobe} size={250} />
        <div class="save-card">
          <strong>{COURT_RANKS[courtRank($game)].name}</strong>
          {#each $game.unlockedRegions as regionId (regionId)}
            <span>{REGIONS[regionId].name}: {BLOOM_LEVELS[bloomLevel($game, regionId)].name}</span>
          {/each}
          <span>
            Played {formatDuration($game.stats.activePlayMs + $game.stats.offlineMs)}
          </span>
        </div>
      {:else}
        <div class="waiting">
          <FairyFigure look={DEFAULT_LOOK} wardrobe={defaultWardrobe('female')} size={250} />
        </div>
        <div class="save-card">
          <strong>A fairy waits to be imagined</strong>
          <span>Start a new game to create yours.</span>
        </div>
      {/if}
    </div>
  </div>

  <footer>
    <p class="ai">This game was made entirely with AI.</p>
    <p>Bloom Lands · v{GAME_VERSION}</p>
  </footer>

  {#if intro}
    <button type="button" class="intro" onclick={() => (intro = false)} aria-label="Skip intro">
      <span class="intro-logo">Bloom Lands</span>
      <span class="intro-line">Once, the Meadow was tired and grey…</span>
      <span class="skip">Tap or press any key to skip</span>
    </button>
  {/if}
</div>

<style>
  .title-screen {
    position: relative;
    min-height: 100vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .scene {
    position: absolute;
    inset: 0;
  }

  .golden {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 70% 35%, rgb(255 231 160 / 0.55), transparent 55%),
      linear-gradient(rgb(255 236 214 / 0.25), rgb(255 247 232 / 0.55));
  }

  .petal-fall {
    position: absolute;
    top: -20px;
    width: 12px;
    height: 16px;
    border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
    background: var(--hue);
    border: 1px solid rgb(201 122 140 / 0.4);
    animation: fall linear infinite;
  }

  @keyframes fall {
    0% {
      transform: translate(0, 0) rotate(0);
      opacity: 0;
    }
    10% {
      opacity: 1;
    }
    100% {
      transform: translate(-80px, 110vh) rotate(540deg);
      opacity: 0.6;
    }
  }

  .layout {
    position: relative;
    flex: 1;
    display: grid;
    grid-template-columns: minmax(300px, 1fr) minmax(260px, 1fr);
    align-items: center;
    gap: 24px;
    width: min(1100px, 100%);
    margin: 0 auto;
    padding: 32px 24px 16px;
  }

  .brand {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .tag {
    padding: 4px 12px;
    border-radius: 6px;
    background: var(--honey);
    color: #5a3a10;
    font-family: var(--font-heading);
    font-size: 0.85rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    transform: skewX(-8deg);
  }

  .logo {
    margin: 0;
    font-family: var(--font-heading);
    font-weight: 600;
    font-size: clamp(3.4rem, 9vw, 6.2rem);
    line-height: 0.92;
    letter-spacing: 0.01em;
    background: linear-gradient(180deg, #ffd1dd 0%, #f7a6bd 45%, #f2b45c 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    -webkit-text-stroke: 2px #b8607a;
    filter: drop-shadow(0 4px 0 rgb(184 96 122 / 0.35)) drop-shadow(0 0 18px rgb(255 243 176 / 0.8));
  }

  .tagline {
    margin: 0 0 12px;
    font-family: var(--font-heading);
    font-size: 1.3rem;
    color: var(--leaf-deep);
    font-style: italic;
  }

  .menu {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: min(320px, 100%);
  }

  .menu button,
  .panel-box button {
    min-height: 50px;
    padding: 0 22px;
    border: 2px solid rgb(255 255 255 / 0.9);
    border-radius: 16px;
    background: rgb(255 250 240 / 0.85);
    color: var(--ink);
    font: inherit;
    font-family: var(--font-heading);
    font-size: 1.15rem;
    text-align: left;
    cursor: pointer;
    box-shadow: 0 3px 10px rgb(90 67 82 / 0.12);
  }

  .menu button:hover {
    background: white;
    transform: translateX(4px);
  }

  .menu button.primary {
    background: var(--leaf-deep);
    border-color: var(--leaf-deep);
    color: white;
  }

  .panel-box {
    width: min(460px, 100%);
    max-height: 62vh;
    overflow: auto;
    padding: 18px;
    border-radius: 22px;
    background: rgb(255 250 240 / 0.95);
    border: 2px solid var(--honey);
    box-shadow: 0 8px 24px rgb(90 67 82 / 0.18);
    user-select: text;
  }

  .panel-box :global(h2) {
    margin: 0 0 10px;
  }

  .panel-box .back {
    margin-top: 14px;
    text-align: center;
  }

  .row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .danger {
    border-color: #c0392b !important;
    color: #a52a1f !important;
  }

  .hero {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .halo {
    position: absolute;
    top: 0;
    width: 320px;
    height: 320px;
    border-radius: 50%;
    background: radial-gradient(circle, rgb(255 243 176 / 0.85), transparent 65%);
  }

  .hero :global(svg.fairy) {
    position: relative;
  }

  .waiting {
    position: relative;
    opacity: 0.55;
    filter: saturate(0.3) brightness(1.15);
  }

  .save-card {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 10px 20px;
    border-radius: 16px;
    background: rgb(255 250 240 / 0.9);
    border: 2px solid var(--petal);
    text-align: center;
    font-size: 0.95rem;
  }

  .save-card strong {
    font-family: var(--font-heading);
    font-size: 1.15rem;
    font-weight: 500;
    color: var(--leaf-deep);
  }

  footer {
    position: relative;
    text-align: center;
    padding: 8px 16px 16px;
    font-size: 0.85rem;
  }

  footer p {
    margin: 2px 0;
  }

  .ai {
    color: #a0602a;
    font-weight: 700;
  }

  .intro {
    position: fixed;
    inset: 0;
    z-index: 50;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 14px;
    border: none;
    background: radial-gradient(circle, #fff7e8, #fde7ef);
    color: var(--ink);
    font: inherit;
    cursor: pointer;
    animation: intro-out 0.6s ease-in 2.3s forwards;
  }

  .intro-logo {
    font-family: var(--font-heading);
    font-size: clamp(2.6rem, 8vw, 4.6rem);
    color: #c97a8c;
    animation: bloom-in 1.4s ease-out both;
  }

  .intro-line {
    font-style: italic;
    opacity: 0;
    animation: fade-in 0.8s ease-out 0.9s forwards;
  }

  .skip {
    position: absolute;
    bottom: 24px;
    right: 24px;
    font-size: 0.8rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    opacity: 0.6;
  }

  @keyframes bloom-in {
    from {
      opacity: 0;
      transform: scale(0.6) rotate(-4deg);
      filter: blur(6px);
    }
    to {
      opacity: 1;
      transform: none;
      filter: none;
    }
  }

  @keyframes fade-in {
    to {
      opacity: 0.85;
    }
  }

  @keyframes intro-out {
    to {
      opacity: 0;
      visibility: hidden;
    }
  }

  @media (max-width: 760px) {
    .layout {
      grid-template-columns: 1fr;
      padding-top: 20px;
    }

    .brand {
      align-items: center;
      text-align: center;
    }

    .hero {
      order: -1;
    }

    .hero :global(svg.fairy) {
      width: 150px;
      height: 180px;
    }

    .halo {
      width: 220px;
      height: 220px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .petal-fall,
    .intro-logo,
    .intro-line {
      animation: none;
      opacity: 1;
    }
  }
</style>
