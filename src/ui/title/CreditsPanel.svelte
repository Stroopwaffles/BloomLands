<script lang="ts">
  import { GAME_VERSION } from '../../engine/version'
</script>

<h2>Credits</h2>
<dl>
  <dt>Bloom Lands</dt>
  <dd>Release {GAME_VERSION} · The Meadow</dd>
  <dt>Game design</dt>
  <dd>Designed by its creator, one fairy court at a time.</dd>
  <dt>Made with</dt>
  <dd>Claude (code, art and writing), Svelte, Vite and TypeScript.</dd>
  <dt>Fonts</dt>
  <dd>Fredoka and Nunito, from Google Fonts.</dd>
</dl>
<p class="ai">This game was made entirely with AI.</p>
<p class="thanks">Thank you for helping the Meadow bloom.</p>

<style>
  dl {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 6px 14px;
    margin: 0;
  }

  dt {
    font-weight: 700;
  }

  dd {
    margin: 0;
  }

  .ai {
    margin: 14px 0 0;
    color: #a0602a;
    font-weight: 700;
  }

  .thanks {
    margin: 4px 0 0;
    font-style: italic;
    color: var(--leaf-deep);
  }
</style>
