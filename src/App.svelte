<script lang="ts">
  import { onMount } from 'svelte'
  import Art from './art/Art.svelte'
  import { formatNumber } from './engine/format'
  import { GAME_VERSION } from './engine/version'
  import DebugPanel from './ui/DebugPanel.svelte'
  import { debugEnabled, runtime } from './ui/game'
  import WelcomeBack from './ui/WelcomeBack.svelte'

  const { game } = runtime

  onMount(() => runtime.start())
</script>

<header>
  <h1>Bloom Lands</h1>
  <div class="counter" aria-label="Glimmers">
    <Art id="icon-glimmers" size={32} />
    <span>{formatNumber($game.resources.glimmers)}</span>
  </div>
</header>

<main>
  <div class="card">
    <Art id="char-fairy" size={160} />
    <p>Your court begins here.</p>
    <p class="status">Gathering arrives in the next update · v{GAME_VERSION}</p>
  </div>
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

  .counter {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 1.4rem;
    font-weight: 700;
  }

  main {
    min-height: calc(100vh - 64px);
    display: grid;
    place-items: center;
    padding: 16px;
  }

  .card {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: var(--cream-deep);
    border: 2px solid var(--honey);
    border-radius: 24px;
    padding: 32px 40px;
    text-align: center;
  }

  p {
    margin: 4px 0;
  }

  .status {
    margin-top: 12px;
    font-size: 0.9rem;
    opacity: 0.75;
  }
</style>
