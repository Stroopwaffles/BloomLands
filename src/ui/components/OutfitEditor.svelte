<script lang="ts">
  import { OUTFIT_COLORS, OUTFIT_PIECES, SLOTS, type OutfitSlot } from '../../data/appearance'
  import { ownedPieces } from '../../engine/character'
  import Choices from './Choices.svelte'
  import Swatches from './Swatches.svelte'
  import { runtime } from '../game'

  const { game } = runtime
  const owned = $derived(ownedPieces($game))

  function optionsFor(slot: OutfitSlot) {
    return [
      ...owned
        .filter((id) => OUTFIT_PIECES[id].slot === slot)
        .map((id) => ({ id, name: OUTFIT_PIECES[id].name })),
      { id: 'none', name: 'None' },
    ]
  }
</script>

<div class="editor">
  {#each SLOTS as slot (slot.id)}
    {@const worn = $game.character.wardrobe[slot.id]}
    <section>
      <h4>{slot.name}</h4>
      <Choices
        options={optionsFor(slot.id)}
        value={worn.pieceId ?? 'none'}
        label={slot.name}
        onPick={(id) =>
          runtime.dispatch({
            type: 'wardrobe/equip',
            slot: slot.id,
            pieceId: id === 'none' ? null : id,
          })}
      />
      {#if worn.pieceId}
        <Swatches
          colors={OUTFIT_COLORS}
          value={worn.color}
          label={`${slot.name} color`}
          onPick={(color) => runtime.dispatch({ type: 'wardrobe/recolor', slot: slot.id, color })}
        />
      {/if}
    </section>
  {/each}
  <p class="note">
    Outfits are just for fun: they never change your stats. Find more in secret places.
  </p>
</div>

<style>
  .editor {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  section {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  h4 {
    margin: 0;
    font-family: var(--font-heading);
    font-weight: 500;
  }

  .note {
    margin: 0;
    font-size: 0.85rem;
    opacity: 0.7;
  }
</style>
