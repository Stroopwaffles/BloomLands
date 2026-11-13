<script lang="ts">
  import { itemName } from '../../data/items'
  import { RECIPES } from '../../data/recipes'
  import { BRANCHES, RESEARCH, RESEARCH_ORDER } from '../../data/research'
  import { payingStock } from '../../engine/costs'
  import { formatDuration } from '../../engine/format'
  import { checkResearch, researchStatus } from '../../engine/research'
  import CostList from '../components/CostList.svelte'
  import ProgressBar from '../components/ProgressBar.svelte'
  import { runtime } from '../game'
  import { BLOCKED_TEXT } from '../messages'

  const { game } = runtime
  const current = $derived($game.research.current)

  function nodesIn(branch: string) {
    return RESEARCH_ORDER.map((id) => RESEARCH[id]).filter(
      (node) =>
        node.branch === branch && (!node.region || $game.unlockedRegions.includes(node.region)),
    )
  }
</script>

<div class="research">
  {#if current}
    <section class="current panel">
      <ProgressBar
        label={`Researching ${RESEARCH[current.id].name}`}
        totalMs={current.totalMs}
        remainingMs={current.remainingMs}
      />
    </section>
  {/if}

  <div class="branches">
    {#each BRANCHES as branch (branch.id)}
      <section class="panel">
        <h3>{branch.name}</h3>
        {#if branch.note}<p class="hint">{branch.note}</p>{/if}
        <ul>
          {#each nodesIn(branch.id) as node (node.id)}
            {@const status = researchStatus($game, node.id)}
            {@const check = checkResearch($game, node.id)}
            <li class={status}>
              <div class="title">
                <strong>{node.name}</strong>
                <span class="badge">
                  {#if status === 'done'}Done{:else if status === 'in-progress'}Researching{:else if status === 'locked'}Locked{:else}{formatDuration(
                      node.durationMs,
                    )}{/if}
                </span>
              </div>
              <p>{node.description}</p>
              <p class="unlocks">
                Unlocks: {node.unlocks.map((id) => itemName(RECIPES[id].output.itemId)).join(', ')}
              </p>
              {#if status === 'locked'}
                <p class="hint">
                  Needs: {node.requires
                    .filter((req) => !$game.research.completed.includes(req))
                    .map((req) => RESEARCH[req].name)
                    .join(', ')}
                </p>
              {:else if status === 'available'}
                <CostList cost={node.cost} stock={payingStock($game)} />
                <button
                  type="button"
                  disabled={check !== 'ok'}
                  title={check === 'ok' ? undefined : BLOCKED_TEXT[check]}
                  onclick={() => runtime.dispatch({ type: 'research/start', researchId: node.id })}
                >
                  Research
                </button>
              {/if}
            </li>
          {/each}
        </ul>
      </section>
    {/each}
  </div>
</div>

<style>
  .research {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .branches {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
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
    margin: 0 0 8px;
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
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 10px;
    background: white;
    border-radius: 14px;
    border: 2px solid transparent;
  }

  li.available {
    border-color: var(--leaf);
  }

  li.in-progress {
    border-color: var(--honey);
  }

  li.done {
    opacity: 0.65;
  }

  li.locked {
    opacity: 0.55;
  }

  .title {
    display: flex;
    justify-content: space-between;
    gap: 8px;
  }

  .badge {
    font-size: 0.8rem;
    opacity: 0.8;
  }

  p {
    margin: 0;
    font-size: 0.9rem;
  }

  .unlocks {
    font-size: 0.85rem;
    color: var(--leaf-deep);
  }

  .hint {
    opacity: 0.7;
  }

  button {
    align-self: flex-start;
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
