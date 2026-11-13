<script lang="ts">
  import Art from '../../art/Art.svelte'
  import { CURIOS } from '../../data/bloom'
  import { runtime } from '../game'

  const { game } = runtime
</script>

{#if $game.curios.length === 0}
  <p class="hint">
    No curios yet. They're rewards for finishing stories and finding secret places.
  </p>
{:else}
  <ul>
    {#each $game.curios as curioId (curioId)}
      <li>
        <Art id={curioId} size={40} />
        <div>
          <strong>{CURIOS[curioId]?.name}</strong>
          <span>{CURIOS[curioId]?.description}</span>
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
    gap: 8px;
  }

  li {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    background: white;
    border-radius: 14px;
    border: 2px solid #e9dcff;
    box-shadow: 0 0 8px rgb(167 139 250 / 0.25);
  }

  div {
    display: flex;
    flex-direction: column;
    font-size: 0.9rem;
  }

  .hint {
    margin: 0;
    opacity: 0.7;
  }
</style>
