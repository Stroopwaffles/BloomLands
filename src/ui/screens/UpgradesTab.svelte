<script lang="ts">
  import Art from '../../art/Art.svelte'
  import { UPGRADE_CATEGORIES, UPGRADE_ORDER, UPGRADES } from '../../data/upgrades'
  import { payingStock } from '../../engine/costs'
  import { formatNumber } from '../../engine/format'
  import { checkUpgrade } from '../../engine/upgrades'
  import CostList from '../components/CostList.svelte'
  import { runtime } from '../game'
  import { BLOCKED_TEXT } from '../messages'

  const { game } = runtime

  function inCategory(category: string) {
    return UPGRADE_ORDER.map((id) => UPGRADES[id]).filter((u) => u.category === category)
  }
</script>

<div class="categories">
  {#each UPGRADE_CATEGORIES as category (category.id)}
    <section class="panel">
      <h3>{category.name}</h3>
      <p class="note">{category.note}</p>
      <ul>
        {#each inCategory(category.id) as upgrade (upgrade.id)}
          {@const check = checkUpgrade($game, upgrade.id)}
          <li class:owned={check === 'already-done'} class:locked={check === 'locked'}>
            <div class="title">
              <Art id={upgrade.id} size={40} />
              <div>
                <strong>{upgrade.name}</strong>
                <span class="desc">{upgrade.description}</span>
                {#if upgrade.courtPoints > 0}
                  <span class="points">+{upgrade.courtPoints} court</span>
                {/if}
              </div>
            </div>
            {#if check === 'already-done'}
              <span class="badge">Owned</span>
            {:else if check === 'locked'}
              <span class="hint">
                Needs {upgrade.requires
                  .filter((r) => !$game.upgrades.includes(r))
                  .map((r) => UPGRADES[r].name)
                  .join(', ')}
              </span>
            {:else}
              <div class="cost">
                <span class="glimmers" class:short={$game.resources.glimmers < upgrade.glimmers}>
                  <Art id="icon-glimmers" size={22} />
                  {formatNumber(upgrade.glimmers)}
                </span>
                {#if upgrade.items.length > 0}
                  <CostList cost={upgrade.items} stock={payingStock($game)} />
                {/if}
              </div>
              <button
                type="button"
                disabled={check !== 'ok'}
                title={check === 'ok' ? undefined : BLOCKED_TEXT[check]}
                onclick={() => runtime.dispatch({ type: 'upgrade/buy', upgradeId: upgrade.id })}
              >
                {category.id === 'lodging' ? 'Build' : 'Buy'}
              </button>
            {/if}
          </li>
        {/each}
      </ul>
    </section>
  {/each}
</div>

<style>
  .categories {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 16px;
    align-items: start;
  }

  .panel {
    background: var(--cream-deep);
    border: 2px solid var(--honey);
    border-radius: 20px;
    padding: 16px;
  }

  h3 {
    margin: 0;
  }

  .note {
    margin: 4px 0 12px;
    font-size: 0.9rem;
    opacity: 0.75;
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
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 6px 10px;
    align-items: center;
    padding: 10px;
    background: white;
    border-radius: 14px;
  }

  li.owned {
    opacity: 0.6;
  }

  li.locked {
    opacity: 0.5;
  }

  .title {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .title div {
    display: flex;
    flex-direction: column;
  }

  .desc {
    font-size: 0.9rem;
  }

  .points {
    font-size: 0.8rem;
    color: var(--leaf-deep);
    font-weight: 700;
  }

  .badge {
    font-weight: 700;
    color: var(--leaf-deep);
  }

  .hint {
    grid-column: 1 / -1;
    font-size: 0.85rem;
  }

  .cost {
    grid-column: 1;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px 12px;
  }

  .glimmers {
    display: flex;
    align-items: center;
    gap: 4px;
    font-weight: 700;
    color: var(--leaf-deep);
  }

  .glimmers.short {
    color: #b0413e;
  }

  button {
    grid-column: 2;
    grid-row: 1 / span 2;
    min-height: 44px;
    min-width: 72px;
    padding: 0 14px;
    border: none;
    border-radius: 12px;
    background: var(--leaf-deep);
    color: white;
    font: inherit;
    font-weight: 700;
    cursor: pointer;
  }

  button:disabled {
    background: #c9c2b8;
    cursor: not-allowed;
  }
</style>
