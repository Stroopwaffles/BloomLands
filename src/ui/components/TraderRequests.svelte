<script lang="ts">
  import Art from '../../art/Art.svelte'
  import { TRADERS } from '../../data/economy'
  import { itemName } from '../../data/items'
  import { payingStock } from '../../engine/costs'
  import { formatDuration, formatNumber } from '../../engine/format'
  import { checkTrade } from '../../engine/traders'
  import CostList from './CostList.svelte'
  import { runtime } from '../game'
  import { BLOCKED_TEXT } from '../messages'

  const { game } = runtime

  const traderById = Object.fromEntries(TRADERS.map((t) => [t.id, t]))
</script>

{#if $game.traders.requests.length === 0}
  <p class="hint">No visitors right now. Traders stop by every so often.</p>
{:else}
  <ul>
    {#each $game.traders.requests as request (request.id)}
      {@const trader = traderById[request.traderId]}
      {@const check = checkTrade($game, request.id)}
      <li>
        <div class="who">
          <Art id={request.traderId} size={48} />
          <div>
            <strong>{trader?.name}</strong>
            <span class="title">{trader?.title}</span>
            <span class="leaves">Leaves in {formatDuration(request.remainingMs + 999)}</span>
          </div>
        </div>
        <p class="greeting">“{trader?.greeting}”</p>
        <div class="row">
          <span class="label">Wants</span>
          <CostList cost={request.wants} stock={payingStock($game)} />
        </div>
        <div class="row">
          <span class="label">Pays</span>
          <span class="reward">
            <Art id="icon-glimmers" size={22} />
            {formatNumber(request.glimmers)} Glimmers
            {#if request.trinketId}
              + <Art id={request.trinketId} size={22} /> {itemName(request.trinketId)}
            {/if}
          </span>
        </div>
        <div class="actions">
          <button
            type="button"
            class="primary"
            disabled={check !== 'ok'}
            title={check === 'ok' ? undefined : BLOCKED_TEXT[check]}
            onclick={() => runtime.dispatch({ type: 'trade/fulfill', requestId: request.id })}
          >
            Trade
          </button>
          <button
            type="button"
            class="secondary"
            onclick={() => runtime.dispatch({ type: 'trade/dismiss', requestId: request.id })}
          >
            Not today
          </button>
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
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  li {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px;
    background: white;
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

  .greeting {
    margin: 0;
    font-style: italic;
    opacity: 0.85;
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
    font-size: 0.85rem;
    text-transform: uppercase;
    opacity: 0.6;
  }

  .reward {
    display: flex;
    align-items: center;
    gap: 4px;
    font-weight: 700;
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
    background: #c9c2b8;
    cursor: not-allowed;
  }

  .secondary {
    border: 2px solid var(--honey);
    background: white;
    color: var(--ink);
  }

  .hint {
    margin: 0;
    opacity: 0.7;
  }
</style>
