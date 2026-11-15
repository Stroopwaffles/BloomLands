<script lang="ts">
  import PinButton from './PinButton.svelte'
  import Art from '../../art/Art.svelte'
  import { BLOOM_REWARDS, VILLAGERS } from '../../data/bloom'
  import { payingStock } from '../../engine/costs'
  import { formatDuration, formatNumber } from '../../engine/format'
  import { checkVillagerRequest } from '../../engine/settlements'
  import CostList from './CostList.svelte'
  import { runtime } from '../game'
  import { BLOCKED_TEXT } from '../messages'

  let { settlementId }: { settlementId: string } = $props()

  const { game } = runtime
  const requests = $derived($game.settlements[settlementId]?.requests ?? [])
  const villagers = $derived(
    Object.fromEntries((VILLAGERS[settlementId] ?? []).map((v) => [v.id, v])),
  )
</script>

{#if requests.length === 0}
  <p class="hint">Nobody needs anything right now. Villagers ask for help every few minutes.</p>
{:else}
  <ul>
    {#each requests as request (request.id)}
      {@const who = villagers[request.traderId]}
      {@const check = checkVillagerRequest($game, settlementId, request.id)}
      <li>
        <div class="who">
          <Art id={request.traderId} size={44} />
          <div>
            <strong>{who?.name ?? 'A villager'}</strong>
            <span class="title">{who?.title}</span>
            <span class="leaves">Needs it within {formatDuration(request.remainingMs + 999)}</span>
          </div>
        </div>
        <div class="row">
          <span class="label">Needs</span>
          <CostList cost={request.wants} stock={payingStock($game)} />
        </div>
        <div class="row">
          <span class="label">Gives</span>
          <span class="reward">
            +{BLOOM_REWARDS.settlementRequest} bloom · {formatNumber(request.glimmers)} Glimmers
          </span>
        </div>
        <div class="actions">
          <button
            type="button"
            class="primary"
            disabled={check !== 'ok'}
            title={check === 'ok' ? undefined : BLOCKED_TEXT[check]}
            onclick={() =>
              runtime.dispatch({ type: 'villager/fulfill', settlementId, requestId: request.id })}
          >
            Help
          </button>
          <button
            type="button"
            class="secondary"
            onclick={() =>
              runtime.dispatch({ type: 'villager/dismiss', settlementId, requestId: request.id })}
          >
            Not now
          </button>
          <PinButton kind="villager" requestId={request.id} {settlementId} />
        </div>
      </li>
    {/each}
  </ul>
{/if}

<style>
  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 10px;
  }

  li {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px;
    background: var(--surface);
    border-radius: 16px;
  }

  .who {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .who div {
    display: flex;
    flex-direction: column;
  }

  .title,
  .leaves {
    font-size: 0.85rem;
    opacity: 0.75;
  }

  .row {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .label {
    min-width: 44px;
    font-weight: 700;
    font-size: 0.8rem;
    text-transform: uppercase;
    opacity: 0.6;
  }

  .reward {
    font-weight: 700;
    color: var(--petal-deep);
  }

  .actions {
    display: flex;
    gap: 8px;
  }

  button {
    min-height: 44px;
    padding: 0 18px;
    border-radius: 12px;
    font: inherit;
    font-weight: 700;
    cursor: pointer;
  }

  .primary {
    border: none;
    background: var(--leaf-deep);
    color: white;
  }

  .primary:disabled {
    background: var(--disabled, #c9c2b8);
    cursor: not-allowed;
  }

  .secondary {
    border: 2px solid var(--honey);
    background: var(--surface);
    color: var(--ink);
  }

  .hint {
    margin: 0;
    opacity: 0.7;
  }
</style>
