<script lang="ts">
  import Art from '../../art/Art.svelte'
  import { countItems } from '../../engine/state'
  import Destinations from '../components/Destinations.svelte'
  import ItemList from '../components/ItemList.svelte'
  import { runtime } from '../game'

  const { game } = runtime
  const carrying = $derived(countItems($game.player.satchel))
</script>

<div class="home">
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
      <h2>Storage</h2>
      <ItemList items={$game.inventory} empty="Your storeroom is empty." />
    </section>

    <section class="panel">
      <h2>Fly out</h2>
      <Destinations />
    </section>
  </div>
</div>

<style>
  .home {
    display: grid;
    grid-template-columns: minmax(240px, 1fr) 2fr;
    gap: 16px;
    padding: 16px;
    max-width: 1100px;
    margin: 0 auto;
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
    .home {
      grid-template-columns: 1fr;
    }
  }
</style>
