<script lang="ts">
  import Art from '../../art/Art.svelte'
  import { SPIRITS } from '../../data/spirits'
  import { SPIRIT_PLACES } from '../../data/world'
  import { payingStock } from '../../engine/costs'
  import { checkSpirit, requirementMet, spiritAwake } from '../../engine/spirits'
  import BloomMeter from '../components/BloomMeter.svelte'
  import CostList from '../components/CostList.svelte'
  import Destinations from '../components/Destinations.svelte'
  import { runtime } from '../game'

  const { game } = runtime
  const place = $derived(SPIRIT_PLACES[$game.player.place])
  const spirit = $derived(place ? SPIRITS[place.spiritId] : null)
  const awake = $derived(spirit ? spiritAwake($game, spirit.id) : false)
</script>

{#if place && spirit}
  <div class="spirit-place" class:awake>
    <header>
      <div>
        <h2>{place.name}</h2>
        <p>{place.description}</p>
      </div>
      <Destinations />
    </header>

    <section class="spirit">
      <div class="glow" class:awake aria-hidden="true">
        <Art id={spirit.id} size={150} />
      </div>
      <h3>{spirit.name}</h3>
      <div class="lines">
        {#each awake ? spirit.awakening : spirit.sleeping as line, i (i)}
          <p>{line}</p>
        {/each}
      </div>

      {#if !awake}
        <ul class="requirements">
          {#each spirit.requirements as req, i (i)}
            {@const met = requirementMet($game, spirit.id, req)}
            <li class:met>
              <span class="check" aria-hidden="true">{met ? '✓' : ''}</span>
              <div>
                <span>{req.label}</span>
                {#if req.kind === 'offering'}
                  <CostList cost={req.items} stock={payingStock($game)} />
                {:else if req.kind === 'bloom'}
                  <BloomMeter regionId={spirit.regionId} compact />
                {/if}
              </div>
            </li>
          {/each}
        </ul>
        <button
          type="button"
          disabled={checkSpirit($game, spirit.id) !== 'ok'}
          onclick={() => runtime.dispatch({ type: 'spirit/awaken', spiritId: spirit.id })}
        >
          Make the offering
        </button>
      {:else}
        <p class="note">
          {spirit.name.split(',')[0]} is awake for this run. When you perform the Root Song Ritual someday,
          {spirit.name.split(',')[0]} will have a gift for you.
        </p>
      {/if}
    </section>
  </div>
{/if}

<style>
  .spirit-place {
    min-height: calc(100vh - 70px);
    padding: 16px;
    background: linear-gradient(#f6e7c8, #e9f0d8);
  }

  .spirit-place.awake {
    background: linear-gradient(#fff3c4, #d8efc8);
  }

  header,
  .spirit {
    max-width: 760px;
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

  .spirit {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 20px;
    border-radius: 24px;
    background: rgb(255 255 255 / 0.7);
    border: 2px solid var(--honey);
    text-align: center;
  }

  .glow {
    padding: 10px;
    border-radius: 50%;
    opacity: 0.6;
    filter: saturate(0.4);
    animation: breathe 5s ease-in-out infinite;
  }

  .glow.awake {
    opacity: 1;
    filter: none;
    box-shadow: 0 0 40px rgb(242 180 92 / 0.6);
  }

  @keyframes breathe {
    50% {
      transform: scale(1.04);
    }
  }

  .lines p {
    margin: 4px 0;
    font-style: italic;
  }

  .requirements {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
    text-align: left;
  }

  .requirements li {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 14px;
    background: white;
  }

  .requirements li div {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
  }

  .check {
    flex: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 2px solid var(--honey);
    text-align: center;
    line-height: 20px;
    font-weight: 700;
    color: white;
  }

  .met .check {
    background: var(--leaf-deep);
    border-color: var(--leaf-deep);
  }

  button {
    min-height: 48px;
    padding: 0 24px;
    border: none;
    border-radius: 14px;
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

  .note {
    margin: 0;
    opacity: 0.8;
  }

  @media (prefers-reduced-motion: reduce) {
    .glow {
      animation: none;
    }
  }
</style>
