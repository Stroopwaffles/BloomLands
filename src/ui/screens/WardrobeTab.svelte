<script lang="ts">
  import FairyFigure from '../../art/FairyFigure.svelte'
  import AppearanceEditor from '../components/AppearanceEditor.svelte'
  import OutfitEditor from '../components/OutfitEditor.svelte'
  import { runtime } from '../game'

  const { game } = runtime
</script>

<div class="wardrobe">
  <div class="preview">
    <FairyFigure look={$game.character.look} wardrobe={$game.character.wardrobe} size={200} />
  </div>
  <section class="panel">
    <h3>Outfit</h3>
    <OutfitEditor />
  </section>
  <section class="panel">
    <h3>Appearance</h3>
    <AppearanceEditor />
  </section>
</div>

<style>
  .wardrobe {
    display: grid;
    grid-template-columns: minmax(240px, 1fr) repeat(2, minmax(280px, 1.4fr));
    gap: 16px;
    align-items: start;
  }

  .preview {
    position: sticky;
    top: 16px;
    display: flex;
    justify-content: center;
    padding: 20px;
    border-radius: 24px;
    background: linear-gradient(#fde7ef, #fff7e8);
    border: 2px solid var(--honey);
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

  @media (max-width: 1000px) {
    .wardrobe {
      grid-template-columns: 1fr 1fr;
    }

    .preview {
      grid-column: 1 / -1;
      position: static;
    }
  }

  @media (max-width: 640px) {
    .wardrobe {
      grid-template-columns: 1fr;
    }
  }
</style>
