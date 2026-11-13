<script lang="ts">
  import Art from '../../art/Art.svelte'
  import { HELPER_TYPE_ORDER, HELPER_TYPES } from '../../data/helpers'
  import { SETTLEMENTS } from '../../data/world'
  import { formatNumber } from '../../engine/format'
  import { checkRecruit, recruitCost } from '../../engine/helpers'
  import { helperCapacity, helperCount } from '../../engine/modifiers'
  import BloomMeter from '../components/BloomMeter.svelte'
  import Characters from '../components/Characters.svelte'
  import Destinations from '../components/Destinations.svelte'
  import VillagerRequests from '../components/VillagerRequests.svelte'
  import { runtime } from '../game'
  import { BLOCKED_TEXT } from '../messages'

  const { game } = runtime
  const settlement = $derived(SETTLEMENTS[$game.player.place])
</script>

{#if settlement}
  <div class="settlement">
    <header>
      <div>
        <h2>{settlement.name}</h2>
        <p>{settlement.description}</p>
      </div>
      <Destinations />
    </header>

    <section class="panel">
      <h3>Recruit helpers</h3>
      <p class="note">
        The {settlement.folk} here are happy to help your court. Recruits head straight to your home and
        start work.
      </p>
      <ul>
        {#each HELPER_TYPE_ORDER as type (type)}
          {@const def = HELPER_TYPES[type]}
          {@const capacity = helperCapacity($game, type)}
          {@const check = checkRecruit($game, type)}
          <li>
            <Art id={`helper-${type}`} size={64} />
            <div class="info">
              <strong>{def.name}</strong>
              <span>{def.description}</span>
              <span class="room">
                {#if capacity === 0}
                  {def.unlockHint}
                {:else}
                  {helperCount($game, type)} / {capacity} rooms filled
                {/if}
              </span>
            </div>
            <div class="buy">
              {#if capacity > 0 && check !== 'no-room'}
                <span class="cost" class:short={check === 'missing-glimmers'}>
                  <Art id="icon-glimmers" size={20} />
                  {formatNumber(recruitCost($game, type))}
                </span>
              {/if}
              <button
                type="button"
                disabled={check !== 'ok'}
                title={check === 'ok' ? undefined : BLOCKED_TEXT[check]}
                onclick={() => runtime.dispatch({ type: 'helpers/recruit', helperType: type })}
              >
                Recruit
              </button>
            </div>
          </li>
        {/each}
      </ul>
    </section>

    <section class="panel">
      <h3>Folk of {settlement.name}</h3>
      <p class="note">Some villagers have stories, and could use a fairy's help.</p>
      <Characters settlementId={settlement.id} />
    </section>

    <section class="panel">
      <div class="village-head">
        <h3>Villagers in need</h3>
        <BloomMeter regionId={settlement.regionId} compact />
      </div>
      <p class="note">Helping the village makes it thrive, and the whole region blooms.</p>
      <VillagerRequests settlementId={settlement.id} />
    </section>
  </div>
{/if}

<style>
  .settlement {
    min-height: calc(100vh - 70px);
    padding: 16px;
    background: linear-gradient(#fbe9d0, #e7f2d9);
  }

  header,
  .panel {
    max-width: 900px;
    margin: 0 auto 16px;
  }

  header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  h2,
  h3 {
    margin: 0;
  }

  header p {
    margin: 4px 0 0;
    opacity: 0.8;
  }

  .panel {
    background: var(--cream-deep);
    border: 2px solid var(--honey);
    border-radius: 20px;
    padding: 16px;
  }

  .note {
    margin: 4px 0 12px;
    font-size: 0.9rem;
    opacity: 0.8;
  }

  .village-head {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

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
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: white;
    border-radius: 16px;
  }

  .info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
    font-size: 0.9rem;
  }

  .info strong {
    font-size: 1.05rem;
  }

  .room {
    color: var(--leaf-deep);
    font-weight: 700;
  }

  .buy {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .cost {
    display: flex;
    align-items: center;
    gap: 4px;
    font-weight: 700;
    color: var(--leaf-deep);
  }

  .cost.short {
    color: #b0413e;
  }

  button {
    min-height: 44px;
    padding: 0 18px;
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
