<script lang="ts">
  import {
    BODIES,
    defaultWardrobe,
    EYE_COLORS,
    EYE_SHAPES,
    HAIR_COLORS,
    HAIR_STYLES,
    SKIN_TONES,
    WING_COLORS,
    WING_SHAPES,
    type Body,
    type CharacterLook,
  } from '../../data/appearance'
  import Choices from './Choices.svelte'
  import Swatches from './Swatches.svelte'
  import { runtime } from '../game'

  const { game } = runtime
  const look = $derived($game.character.look)

  function set(patch: Partial<CharacterLook>) {
    runtime.dispatch({ type: 'character/look', patch })
  }

  /** Switching body also switches to that body's default starter outfit, if a starter is worn. */
  function setBody(body: Body) {
    set({ body })
    const worn = $game.character.wardrobe.outfit.pieceId
    if (worn === 'piece-petal-dress' || worn === 'piece-petal-tunic') {
      const outfit = defaultWardrobe(body).outfit.pieceId
      runtime.dispatch({ type: 'wardrobe/equip', slot: 'outfit', pieceId: outfit })
    }
  }
</script>

<div class="editor">
  <section>
    <h4>Fairy</h4>
    <Choices options={BODIES} value={look.body} label="Body" onPick={(id) => setBody(id as Body)} />
  </section>
  <section>
    <h4>Skin</h4>
    <Swatches colors={SKIN_TONES} value={look.skin} label="Skin" onPick={(skin) => set({ skin })} />
  </section>
  <section>
    <h4>Hair</h4>
    <Choices
      options={HAIR_STYLES}
      value={look.hair}
      label="Hair style"
      onPick={(id) => set({ hair: id as CharacterLook['hair'] })}
    />
    <Swatches
      colors={HAIR_COLORS}
      value={look.hairColor}
      label="Hair color"
      onPick={(hairColor) => set({ hairColor })}
    />
  </section>
  <section>
    <h4>Eyes</h4>
    <Choices
      options={EYE_SHAPES}
      value={look.eyes}
      label="Eye shape"
      onPick={(id) => set({ eyes: id as CharacterLook['eyes'] })}
    />
    <Swatches
      colors={EYE_COLORS}
      value={look.eyeColor}
      label="Eye color"
      onPick={(eyeColor) => set({ eyeColor })}
    />
  </section>
  <section>
    <h4>Wings</h4>
    <Choices
      options={WING_SHAPES}
      value={look.wings}
      label="Wing shape"
      onPick={(id) => set({ wings: id as CharacterLook['wings'] })}
    />
    <Swatches
      colors={WING_COLORS}
      value={look.wingColor}
      label="Wing color"
      onPick={(wingColor) => set({ wingColor })}
    />
  </section>
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
</style>
