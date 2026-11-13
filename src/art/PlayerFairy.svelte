<script lang="ts">
  import { runtime } from '../ui/game'
  import FairyFigure from './FairyFigure.svelte'

  /** The player's own fairy, as currently dressed. Registered as the 'char-fairy' asset. */
  let { size = 120 }: { size: number } = $props()

  const { game } = runtime
</script>

<FairyFigure look={$game.character.look} wardrobe={$game.character.wardrobe} size={size / 1.2} />
