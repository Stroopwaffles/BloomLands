<script lang="ts">
  import FairyFigure from '../../art/FairyFigure.svelte'
  import AppearanceEditor from '../components/AppearanceEditor.svelte'
  import OutfitEditor from '../components/OutfitEditor.svelte'
  import { runtime } from '../game'

  /** Shown once at the start of a new game (design doc 3.13). */
  const { game } = runtime
</script>

<div class="creator">
  <div class="intro">
    <h2>Every court begins with one fairy.</h2>
    <p>Who are you? You can change any of this later from the Wardrobe at home.</p>
  </div>

  <div class="layout">
    <div class="preview">
      <FairyFigure look={$game.character.look} wardrobe={$game.character.wardrobe} size={220} />
      <button
        type="button"
        class="begin"
        onclick={() => runtime.dispatch({ type: 'character/finish' })}
      >
        Begin your court
      </button>
    </div>
    <div class="panels">
      <section class="panel">
        <h3>Appearance</h3>
        <AppearanceEditor />
      </section>
      <section class="panel">
        <h3>Outfit</h3>
        <OutfitEditor />
      </section>
    </div>
  </div>
</div>

<style>
  .creator {
    max-width: 1100px;
    margin: 0 auto;
    padding: 16px;
  }

  .intro {
    text-align: center;
    margin-bottom: 16px;
  }

  h2 {
    margin: 0;
    color: var(--leaf-deep);
  }

  .intro p {
    margin: 4px 0 0;
    opacity: 0.8;
  }

  .layout {
    display: grid;
    grid-template-columns: minmax(260px, 1fr) 2fr;
    gap: 16px;
    align-items: start;
  }

  .preview {
    position: sticky;
    top: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 20px;
    border-radius: 24px;
    background: linear-gradient(#fde7ef, #fff7e8);
    border: 2px solid var(--honey);
  }

  .panels {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 16px;
  }

  .panel {
    background: var(--cream-deep);
    border: 2px solid var(--honey);
    border-radius: 20px;
    padding: 16px;
  }

  h3 {
    margin: 0 0 12px;
  }

  .begin {
    min-height: 52px;
    padding: 0 28px;
    border: none;
    border-radius: 16px;
    background: var(--leaf-deep);
    color: white;
    font: inherit;
    font-family: var(--font-heading);
    font-size: 1.15rem;
    cursor: pointer;
  }

  @media (max-width: 700px) {
    .layout {
      grid-template-columns: 1fr;
    }

    .preview {
      position: static;
    }
  }
</style>
