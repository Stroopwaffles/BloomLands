<script lang="ts">
  import Art from '../../art/Art.svelte'
  import { levelUpFood, mountBonusValue, MOUNTS } from '../../data/mounts'
  import { payingStock } from '../../engine/costs'
  import { stableCapacity } from '../../engine/modifiers'
  import { checkLevelUp, mountSpeed } from '../../engine/mounts'
  import CostList from './CostList.svelte'
  import { runtime } from '../game'
  import { BLOCKED_TEXT } from '../messages'

  const { game } = runtime
  const owned = $derived(Object.keys($game.mounts.owned))
</script>

{#if owned.length === 0}
  <p class="hint">
    {stableCapacity($game) === 0
      ? 'No mounts yet. Build a Roost, then befriend a wild mount (the bumblebee lives at Buttercup Rise).'
      : 'Your roost is ready. Befriend the bumblebee at Buttercup Rise, the flying squirrel in the Forest, or the frog at the Lilypad Pools, the hummingbird in Petalfall Rows, or (after helping Lumen) the glowworm in the Fungus Gallery.'}
  </p>
{:else}
  <ul>
    {#each owned as mountId (mountId)}
      {@const mount = MOUNTS[mountId]}
      {@const level = $game.mounts.owned[mountId].level}
      {@const riding = $game.mounts.riding === mountId}
      {@const check = checkLevelUp($game, mountId)}
      <li class:riding>
        <Art id={mountId} size={56} />
        <div class="info">
          <strong>{mount.name} · level {level}</strong>
          <span>
            Flights ×{mountSpeed($game, mountId).toFixed(2)} ·
            {mount.bonus.kind === 'satchel'
              ? `+${mountBonusValue(mount, level)} ${mount.bonus.label}`
              : `${Math.round((1 - mountBonusValue(mount, level)) * 100)}% ${mount.bonus.label}`}
          </span>
          <span class="status">
            {riding ? 'You are riding it.' : 'Resting. Lent to a helper while you fly on your own.'}
          </span>
          {#if level < mount.maxLevel}
            <div class="level">
              <CostList cost={[levelUpFood(mount, level)]} stock={payingStock($game)} />
              <button
                type="button"
                class="secondary"
                disabled={check !== 'ok'}
                title={check === 'ok' ? undefined : BLOCKED_TEXT[check]}
                onclick={() => runtime.dispatch({ type: 'mount/levelUp', mountId })}
              >
                Feed to level up
              </button>
            </div>
          {/if}
        </div>
        <button
          type="button"
          class="primary"
          onclick={() => runtime.dispatch({ type: 'mount/ride', mountId: riding ? null : mountId })}
        >
          {riding ? 'Dismount' : 'Ride'}
        </button>
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
    gap: 8px;
  }

  li {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    background: var(--surface);
    border-radius: 14px;
    border: 2px solid transparent;
  }

  li.riding {
    border-color: #f2b45c;
  }

  .info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
    font-size: 0.9rem;
  }

  .status {
    opacity: 0.75;
  }

  .level {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 4px;
  }

  button {
    min-height: 44px;
    padding: 0 16px;
    border-radius: 12px;
    font: inherit;
    font-weight: 700;
    cursor: pointer;
  }

  .primary {
    border: none;
    background: #f2b45c;
    color: var(--ink);
  }

  .secondary {
    border: 2px solid #f2b45c;
    background: var(--surface);
    color: var(--ink);
  }

  .secondary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .hint {
    margin: 0;
    opacity: 0.7;
  }
</style>
