<script lang="ts">
  import Art from '../../art/Art.svelte'
  import { UPGRADE_ORDER, UPGRADES, type UpgradeDef } from '../../data/upgrades'
  import { payingStock } from '../../engine/costs'
  import { formatNumber } from '../../engine/format'
  import { checkUpgrade, upgradePrice } from '../../engine/upgrades'
  import CostList from '../components/CostList.svelte'
  import { runtime } from '../game'
  import { BLOCKED_TEXT } from '../messages'

  const { game } = runtime

  /**
   * The shop, one row per kind of upgrade. Lodging is split up by room (helper quarters, workshop,
   * storerooms, stables) so helper rooms and workshop rooms aren't mixed together.
   */
  const SECTIONS: {
    id: string
    name: string
    note: string
    icon: string
    verb: string
    has: (u: UpgradeDef) => boolean
  }[] = [
    {
      id: 'helpers',
      name: 'Helper Quarters',
      note: 'Rooms for more helpers. Each room raises your court.',
      icon: 'lodging-mouse-bunks',
      verb: 'Build',
      has: (u) => u.effect.kind === 'helpers' || u.effect.kind === 'supplyKeen',
    },
    {
      id: 'workshop',
      name: 'Workshop',
      note: 'New stations and extra benches for crafting, and the Ritual Circle.',
      icon: 'lodging-cauldron',
      verb: 'Build',
      has: (u) =>
        u.effect.kind === 'station' ||
        u.effect.kind === 'stationSlot' ||
        u.effect.kind === 'feature',
    },
    {
      id: 'storage',
      name: 'Storerooms',
      note: 'More room to keep what you gather.',
      icon: 'lodging-storeroom-1',
      verb: 'Build',
      has: (u) => u.effect.kind === 'storage',
    },
    {
      id: 'stables',
      name: 'Stables',
      note: 'Homes for the creatures who carry you.',
      icon: 'lodging-roost',
      verb: 'Build',
      has: (u) => u.effect.kind === 'stable',
    },
    {
      id: 'gear',
      name: 'Gear',
      note: 'Better tools for gathering and flying.',
      icon: 'icon-gloves',
      verb: 'Buy',
      has: (u) => u.category === 'gear',
    },
    {
      id: 'comfort',
      name: 'Comforts',
      note: 'Quality-of-life helpers. Once bought, they are yours forever.',
      icon: 'icon-comfort',
      verb: 'Buy',
      has: (u) => u.category === 'comfort',
    },
  ]

  const ALL = UPGRADE_ORDER.map((id) => UPGRADES[id])

  /** Ready to buy first, then ones you can't afford yet, then locked ones. */
  const rank = (check: string) => (check === 'ok' ? 0 : check === 'locked' ? 2 : 1)
</script>

<div class="sections">
  {#each SECTIONS as section (section.id)}
    {@const upgrades = ALL.filter(section.has)}
    {@const owned = upgrades.filter((u) => $game.upgrades.includes(u.id))}
    {@const unowned = upgrades
      .filter((u) => !$game.upgrades.includes(u.id))
      .map((u) => ({ upgrade: u, check: checkUpgrade($game, u.id) }))}
    {@const open = unowned
      .filter((o) => o.check !== 'locked')
      .sort((a, b) => rank(a.check) - rank(b.check))}
    {@const later = unowned.filter((o) => o.check === 'locked').map((o) => o.upgrade)}
    <section class="panel">
      <header>
        <Art id={section.icon} size={36} />
        <div class="heading">
          <h3>{section.name}</h3>
          <p class="note">{section.note}</p>
        </div>
        <span class="count">{owned.length} / {upgrades.length}</span>
      </header>

      {#if open.length > 0}
        <ul class="cards">
          {#each open as { upgrade, check } (upgrade.id)}
            {@const price = upgradePrice($game, upgrade.id)}
            <li>
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
              <div class="buy">
                <div class="cost">
                  <span class="glimmers" class:short={$game.resources.glimmers < price}>
                    <Art id="icon-glimmers" size={22} />
                    {formatNumber(price)}
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
                  {section.verb}
                </button>
              </div>
            </li>
          {/each}
        </ul>
      {:else if later.length === 0}
        <p class="done">All done here. Lovely!</p>
      {:else}
        <p class="done">Nothing ready yet.</p>
      {/if}

      {#if later.length > 0}
        <details class="later">
          <summary>Coming later ({later.length})</summary>
          <ul>
            {#each later as upgrade (upgrade.id)}
              <li>
                <Art id={upgrade.id} size={22} />
                <strong>{upgrade.name}</strong>
                <span class="hint">
                  needs {upgrade.requires
                    .filter((r) => !$game.upgrades.includes(r))
                    .map((r) => UPGRADES[r].name)
                    .join(', ')}
                </span>
              </li>
            {/each}
          </ul>
        </details>
      {/if}

      {#if owned.length > 0}
        <ul class="owned" aria-label="Owned">
          {#each owned as upgrade (upgrade.id)}
            <li title={upgrade.description}>
              <Art id={upgrade.id} size={22} />
              {upgrade.name}
            </li>
          {/each}
        </ul>
      {/if}
    </section>
  {/each}
</div>

<style>
  .sections {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .panel {
    background: var(--cream-deep);
    border: 2px solid var(--honey);
    border-radius: 20px;
    padding: 16px;
  }

  header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
  }

  .heading {
    flex: 1;
  }

  h3 {
    margin: 0;
  }

  .note {
    margin: 2px 0 0;
    font-size: 0.9rem;
    opacity: 0.75;
  }

  .count {
    font-weight: 700;
    font-size: 0.9rem;
    color: var(--leaf-deep);
    white-space: nowrap;
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 10px;
  }

  .cards li {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 10px;
    padding: 12px;
    background: var(--surface);
    border-radius: 14px;
  }

  .later {
    margin-top: 12px;
    font-size: 0.85rem;
  }

  .later summary {
    cursor: pointer;
    font-weight: 700;
    opacity: 0.8;
  }

  .later ul {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 4px 12px;
    margin-top: 8px;
  }

  .later li {
    display: flex;
    align-items: center;
    gap: 6px;
    opacity: 0.7;
  }

  .title {
    display: flex;
    gap: 10px;
    align-items: flex-start;
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

  .hint {
    font-size: 0.85rem;
  }

  .buy {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .cost {
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
    flex-shrink: 0;
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
    background: var(--disabled, #c9c2b8);
    cursor: not-allowed;
  }

  .done {
    margin: 0;
    font-size: 0.9rem;
    opacity: 0.75;
  }

  .owned {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px dashed var(--honey);
  }

  .owned li {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 2px 10px 2px 4px;
    border-radius: 999px;
    background: rgb(var(--surface-rgb) / 0.6);
    font-size: 0.8rem;
  }
</style>
