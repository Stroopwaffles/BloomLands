<script lang="ts">
  import { COURT_RANKS } from '../../data/economy'
  import { RITUALS } from '../../data/magic'
  import { HOME, placeName, placeRegion, REGION_ORDER, REGIONS } from '../../data/world'
  import { formatDuration } from '../../engine/format'
  import { knownRituals } from '../../engine/magic'
  import { courtRank } from '../../engine/modifiers'
  import { placeOpen, regionUnlocked } from '../../engine/regions'
  import { travelMs } from '../../engine/travel'
  import { runtime } from '../game'

  const { game } = runtime

  const here = $derived($game.player.place)
  const hereRegion = $derived(placeRegion(here))

  function placesIn(regionId: string): string[] {
    const r = REGIONS[regionId]
    return [r.settlement, ...r.spots, r.spiritPlace, ...r.secretSpots].filter(
      (id) => id !== here && placeOpen($game, id) && travelMs($game, here, id) !== null,
    )
  }

  /** Open regions, the one you're in first; then the next locked region (with what it needs). */
  const regions = $derived(
    [...REGION_ORDER].sort((a, b) => Number(b === hereRegion) - Number(a === hereRegion)),
  )
  const nextLocked = $derived(REGION_ORDER.find((id) => !regionUnlocked($game, id)) ?? null)
  const knowsRite = (ritualId: string) => knownRituals($game).includes(ritualId)
</script>

<div class="destinations">
  {#if here !== HOME}
    <button type="button" onclick={() => runtime.dispatch({ type: 'travel/go', to: HOME })}>
      <span class="name">Fly home</span>
      <span class="time">{formatDuration(travelMs($game, here, HOME) ?? 0)}</span>
    </button>
  {/if}

  {#each regions as regionId (regionId)}
    {#if regionUnlocked($game, regionId)}
      {@const places = placesIn(regionId)}
      {#if places.length > 0}
        <div class="region" class:away={regionId !== hereRegion}>
          {#if $game.unlockedRegions.length > 1}
            <span class="region-name">{REGIONS[regionId].name}</span>
          {/if}
          <div class="row">
            {#each places as placeId (placeId)}
              <button
                type="button"
                onclick={() => runtime.dispatch({ type: 'travel/go', to: placeId })}
              >
                <span class="name">Fly to {placeName(placeId)}</span>
                <span class="time">{formatDuration(travelMs($game, here, placeId) ?? 0)}</span>
              </button>
            {/each}
          </div>
        </div>
      {/if}
    {/if}
  {/each}

  {#if nextLocked && REGIONS[nextLocked].unlock}
    {@const unlock = REGIONS[nextLocked].unlock!}
    {@const rankOk = courtRank($game) >= unlock.rank}
    <div class="locked" aria-label={`The ${REGIONS[nextLocked].name} is still closed`}>
      <span class="region-name">🔒 The {REGIONS[nextLocked].name}</span>
      <ul>
        <li class:done={rankOk}>
          {rankOk ? '✓' : '○'} A {COURT_RANKS[unlock.rank].name} court
        </li>
        <li class:done={knowsRite(unlock.ritualId)}>
          {knowsRite(unlock.ritualId) ? '✓' : '○'} Research the {RITUALS[unlock.ritualId].name}
        </li>
        <li>○ Perform it at your Ritual Circle</li>
      </ul>
    </div>
  {/if}
</div>

<style>
  .destinations {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: flex-start;
  }

  .region {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex-basis: 100%;
  }

  .row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .region-name {
    font-family: var(--font-heading);
    font-size: 0.95rem;
    opacity: 0.8;
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

  .away button {
    border-style: dashed;
  }

  .name {
    font-weight: 700;
  }

  .time {
    font-size: 0.85rem;
    opacity: 0.75;
  }

  .locked {
    flex-basis: 100%;
    padding: 8px 14px;
    border: 2px dashed #b9a98f;
    border-radius: 14px;
    background: rgb(255 250 240 / 0.7);
    color: var(--ink);
  }

  .locked ul {
    margin: 4px 0 0;
    padding: 0;
    list-style: none;
    font-size: 0.9rem;
  }

  .locked li.done {
    color: var(--leaf-deep);
    font-weight: 700;
  }
</style>
