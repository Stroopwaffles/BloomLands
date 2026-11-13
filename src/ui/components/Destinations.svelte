<script lang="ts">
  import { allPlaces, HOME, placeName } from '../../data/world'
  import { formatDuration } from '../../engine/format'
  import { travelMs } from '../../engine/travel'
  import { runtime } from '../game'

  const { game } = runtime

  /** Everywhere the player could fly from here. */
  const places = $derived(
    allPlaces().filter(
      (id) => id !== $game.player.place && travelMs($game, $game.player.place, id) !== null,
    ),
  )
</script>

<div class="destinations">
  {#each places as placeId (placeId)}
    <button type="button" onclick={() => runtime.dispatch({ type: 'travel/go', to: placeId })}>
      <span class="name">{placeId === HOME ? 'Fly home' : `Fly to ${placeName(placeId)}`}</span>
      <span class="time">{formatDuration(travelMs($game, $game.player.place, placeId) ?? 0)}</span>
    </button>
  {/each}
</div>

<style>
  .destinations {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  button {
    min-height: 52px;
    padding: 6px 16px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    border: 2px solid var(--leaf);
    border-radius: 14px;
    background: white;
    color: var(--ink);
    font: inherit;
    cursor: pointer;
  }

  .name {
    font-weight: 700;
  }

  .time {
    font-size: 0.85rem;
    opacity: 0.75;
  }
</style>
