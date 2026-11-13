<script lang="ts">
  import Art from '../../art/Art.svelte'
  import { MOUNTS } from '../../data/mounts'
  import { payingStock } from '../../engine/costs'
  import { formatDuration } from '../../engine/format'
  import { stableCapacity } from '../../engine/modifiers'
  import { befriended, checkFeed, friendship, wildMountAt } from '../../engine/mounts'
  import CostList from './CostList.svelte'
  import SpellButtons from './SpellButtons.svelte'
  import { runtime } from '../game'
  import { BLOCKED_TEXT } from '../messages'

  /** A wild creature at this spot that can be befriended and tamed. */
  let { spotId }: { spotId: string } = $props()

  const { game } = runtime
  const mountId = $derived(wildMountAt($game, spotId))
  const mount = $derived(mountId ? MOUNTS[mountId] : null)
  const f = $derived(mountId ? friendship($game, mountId) : null)
  const friends = $derived(mountId ? befriended($game, mountId) : false)
</script>

{#if mount && mountId && f}
  {@const check = checkFeed($game, mountId)}
  <section class="wild">
    <Art id={`${mountId}-wild`} size={72} />
    <div class="about">
      <strong>A wild {mount.name.toLowerCase()} is buzzing about.</strong>
      <span class="hearts" aria-label={`Friendship ${f.feedings} of ${mount.feedingsToBefriend}`}>
        {#each Array.from({ length: mount.feedingsToBefriend }, (_, i) => i) as i (i)}
          <span class="heart" class:full={i < f.feedings}></span>
        {/each}
      </span>
      {#if friends}
        {#if stableCapacity($game) <= Object.keys($game.mounts.owned).length}
          <span>It trusts you! Build a roost at home, then cast Kindred Call to bring it home.</span
          >
        {:else}
          <span>It trusts you! Cast Kindred Call to invite it home.</span>
        {/if}
        <SpellButtons targets={['tame']} />
      {:else}
        <span>Bring it its favorite food to make friends.</span>
        <div class="feed">
          <CostList cost={[mount.food]} stock={payingStock($game)} />
          <button
            type="button"
            disabled={check !== 'ok'}
            title={check === 'ok' ? undefined : BLOCKED_TEXT[check]}
            onclick={() => runtime.dispatch({ type: 'mount/feed', mountId })}
          >
            {f.cooldownMs > 0 ? `Full · ${formatDuration(f.cooldownMs + 999)}` : 'Feed'}
          </button>
        </div>
      {/if}
    </div>
  </section>
{/if}

<style>
  .wild {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    border-radius: 18px;
    background: rgb(255 255 255 / 0.85);
    border: 2px solid #f2b45c;
    color: var(--ink);
  }

  .about {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 0.9rem;
  }

  .hearts {
    display: flex;
    gap: 4px;
  }

  .heart {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 2px solid var(--petal-deep);
    background: white;
  }

  .heart.full {
    background: var(--petal-deep);
  }

  .feed {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  button {
    min-height: 44px;
    padding: 0 16px;
    border: none;
    border-radius: 12px;
    background: #f2b45c;
    color: var(--ink);
    font: inherit;
    font-weight: 700;
    cursor: pointer;
  }

  button:disabled {
    background: #d8d0c4;
    cursor: not-allowed;
  }
</style>
