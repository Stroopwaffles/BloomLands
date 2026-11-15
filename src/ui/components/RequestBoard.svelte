<script lang="ts">
  import Art from '../../art/Art.svelte'
  import { TRADERS } from '../../data/economy'
  import { VILLAGERS } from '../../data/bloom'
  import { placeName } from '../../data/world'
  import { trackedRequests } from '../../engine/comforts'
  import { payingStock } from '../../engine/costs'
  import { formatDuration } from '../../engine/format'
  import { hasQol } from '../../engine/modifiers'
  import CostList from './CostList.svelte'
  import { runtime } from '../game'

  /** The Request Board: pinned requests, and what they still need (storage and satchel count). */
  const { game } = runtime
  const pins = $derived(hasQol($game, 'request-tracker') ? trackedRequests($game) : [])
  const traderName = (id: string) => TRADERS.find((t) => t.id === id)?.name ?? 'A trader'
  const villagerName = (settlementId: string | undefined, id: string) =>
    VILLAGERS[settlementId ?? '']?.find((v) => v.id === id)?.name ?? 'A villager'
</script>

{#if pins.length > 0}
  <section class="board" aria-label="Request Board">
    <h3>📌 Request Board</h3>
    <ul>
      {#each pins as pin (`${pin.kind}-${pin.settlementId}-${pin.requestId}`)}
        <li>
          <Art id={pin.request.traderId} size={32} />
          <div>
            <strong>
              {pin.kind === 'trader'
                ? traderName(pin.request.traderId)
                : `${villagerName(pin.settlementId, pin.request.traderId)} of ${placeName(pin.settlementId ?? '')}`}
            </strong>
            <span class="leaves">Leaves in {formatDuration(pin.request.remainingMs + 999)}</span>
            <CostList cost={pin.request.wants} stock={payingStock($game)} />
          </div>
        </li>
      {/each}
    </ul>
  </section>
{/if}

<style>
  .board {
    padding: 10px 14px;
    border-radius: 16px;
    background: var(--cream-deep);
    border: 2px dashed var(--honey);
  }

  h3 {
    margin: 0 0 6px;
    font-size: 1rem;
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  li {
    display: flex;
    align-items: flex-start;
    gap: 8px;
  }

  li div {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .leaves {
    font-size: 0.8rem;
    opacity: 0.75;
  }
</style>
