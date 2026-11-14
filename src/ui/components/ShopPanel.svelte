<script lang="ts">
  import Art from '../../art/Art.svelte'
  import { itemName } from '../../data/items'
  import { SETTLEMENTS } from '../../data/world'
  import { formatNumber } from '../../engine/format'
  import { satchelCapacity } from '../../engine/modifiers'
  import { buyPrice, checkBuy, checkSell, sellPrice, shopStock } from '../../engine/shop'
  import { countItems } from '../../engine/state'
  import { runtime } from '../game'
  import { BLOCKED_TEXT } from '../messages'

  /** A settlement's shop: buy the region's common goods, sell anything in your satchel. */
  let { settlementId }: { settlementId: string } = $props()

  const { game } = runtime
  const settlement = $derived(SETTLEMENTS[settlementId])
  const stock = $derived(shopStock(settlementId))
  const carried = $derived(
    Object.entries($game.player.satchel)
      .filter(([, n]) => n > 0)
      .sort(([a], [b]) => itemName(a).localeCompare(itemName(b))),
  )
  const space = $derived(satchelCapacity($game) - countItems($game.player.satchel))
  const satchelWorth = $derived(carried.reduce((sum, [id, n]) => sum + sellPrice(id) * n, 0))

  const BUY_AMOUNTS = [1, 5, 10]

  function why(check: string): string | undefined {
    return check === 'ok' ? undefined : BLOCKED_TEXT[check as keyof typeof BLOCKED_TEXT]
  }

  function sellEverything() {
    for (const [itemId, amount] of carried) {
      runtime.dispatch({ type: 'shop/sell', itemId, amount })
    }
  }
</script>

<section class="panel shop">
  <div class="head">
    <h3>{settlement.shop.name}</h3>
    <span class="keeper">{settlement.shop.keeper}</span>
  </div>
  <p class="note">“{settlement.shop.greeting}”</p>

  <div class="columns">
    <div>
      <h4>Buy</h4>
      <p class="sub">
        Common goods from around here. They go in your satchel ({space} space left).
      </p>
      <ul>
        {#each stock as itemId (itemId)}
          <li>
            <Art id={itemId} size={30} />
            <span class="name">{itemName(itemId)}</span>
            <span class="price"><Art id="icon-glimmers" size={16} />{buyPrice(itemId)} each</span>
            <span class="buttons">
              {#each BUY_AMOUNTS as amount (amount)}
                {@const check = checkBuy($game, itemId, amount)}
                <button
                  type="button"
                  disabled={check !== 'ok'}
                  title={why(check)}
                  onclick={() => runtime.dispatch({ type: 'shop/buy', itemId, amount })}
                  >×{amount}</button
                >
              {/each}
            </span>
          </li>
        {/each}
      </ul>
    </div>

    <div>
      <div class="sell-head">
        <h4>Sell</h4>
        {#if carried.length > 1}
          <button type="button" class="all" onclick={sellEverything}>
            Sell everything · <Art id="icon-glimmers" size={16} />{formatNumber(satchelWorth)}
          </button>
        {/if}
      </div>
      <p class="sub">The shop buys anything in your satchel, at half its worth.</p>
      {#if carried.length === 0}
        <p class="empty">Your satchel is empty.</p>
      {:else}
        <ul>
          {#each carried as [itemId, amount] (itemId)}
            <li>
              <Art id={itemId} size={30} />
              <span class="name">{itemName(itemId)} <small>×{formatNumber(amount)}</small></span>
              <span class="price"><Art id="icon-glimmers" size={16} />{sellPrice(itemId)} each</span
              >
              <span class="buttons">
                <button
                  type="button"
                  disabled={checkSell($game, itemId, 1) !== 'ok'}
                  onclick={() => runtime.dispatch({ type: 'shop/sell', itemId, amount: 1 })}
                  >Sell 1</button
                >
                {#if amount > 1}
                  <button
                    type="button"
                    onclick={() => runtime.dispatch({ type: 'shop/sell', itemId, amount })}
                    >All</button
                  >
                {/if}
              </span>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  </div>
</section>

<style>
  .panel {
    max-width: 900px;
    margin: 0 auto 16px;
    background: var(--cream-deep);
    border: 2px solid var(--honey);
    border-radius: 20px;
    padding: 16px;
  }

  .head {
    display: flex;
    align-items: baseline;
    gap: 10px;
  }

  h3,
  h4 {
    margin: 0;
  }

  .keeper {
    font-size: 0.85rem;
    opacity: 0.7;
  }

  .note {
    margin: 4px 0 12px;
    font-style: italic;
    opacity: 0.85;
  }

  .columns {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 16px;
  }

  .sub,
  .empty {
    margin: 2px 0 8px;
    font-size: 0.85rem;
    opacity: 0.75;
  }

  .sell-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  li {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    padding: 6px 10px;
    background: white;
    border-radius: 12px;
  }

  .name {
    flex: 1;
    min-width: 90px;
    font-weight: 700;
    font-size: 0.9rem;
  }

  .name small {
    font-weight: 400;
    opacity: 0.7;
  }

  .price {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    font-size: 0.85rem;
  }

  .buttons {
    display: flex;
    gap: 4px;
  }

  button {
    min-width: 44px;
    min-height: 40px;
    padding: 0 10px;
    border: 2px solid var(--leaf);
    border-radius: 10px;
    background: white;
    color: var(--ink);
    font: inherit;
    font-size: 0.85rem;
    font-weight: 700;
    cursor: pointer;
  }

  button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .all {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: var(--leaf-deep);
    border-color: var(--leaf-deep);
    color: white;
  }
</style>
