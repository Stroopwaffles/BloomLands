<script lang="ts">
  import Art from '../../art/Art.svelte'
  import { SPELLS, type SpellTarget } from '../../data/magic'
  import { payingStock } from '../../engine/costs'
  import { checkSpell, knownSpells, spellCost } from '../../engine/magic'
  import CostList from './CostList.svelte'
  import { runtime } from '../game'
  import { BLOCKED_TEXT } from '../messages'

  /** Buttons for the known spells that work on these kinds of target. */
  let { targets }: { targets: SpellTarget[] } = $props()

  const { game } = runtime
  const spells = $derived(knownSpells($game).filter((id) => targets.includes(SPELLS[id].target)))
</script>

{#if spells.length > 0}
  <div class="spells">
    {#each spells as spellId (spellId)}
      {@const spell = SPELLS[spellId]}
      {@const check = checkSpell($game, spellId)}
      <div class="spell" class:ready={check === 'ok'}>
        <button
          type="button"
          disabled={check !== 'ok'}
          title={check === 'ok' ? spell.description : BLOCKED_TEXT[check]}
          onclick={() => runtime.dispatch({ type: 'spell/cast', spellId })}
        >
          <Art id={spellId} size={28} />
          <span>{spell.name}</span>
        </button>
        <CostList cost={spellCost($game, spellId)} stock={payingStock($game)} />
      </div>
    {/each}
  </div>
{/if}

<style>
  .spells {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .spell {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 6px 10px 8px;
    border-radius: 14px;
    background: rgb(255 255 255 / 0.75);
    border: 2px solid #d9cdf2;
  }

  .spell.ready {
    border-color: #a78bfa;
    box-shadow: 0 0 10px rgb(167 139 250 / 0.45);
  }

  button {
    display: flex;
    align-items: center;
    gap: 6px;
    min-height: 44px;
    padding: 0 12px;
    border: none;
    border-radius: 10px;
    background: #7c5cff;
    color: white;
    font: inherit;
    font-weight: 700;
    cursor: pointer;
  }

  button:disabled {
    background: #c9c2d8;
    cursor: not-allowed;
  }
</style>
