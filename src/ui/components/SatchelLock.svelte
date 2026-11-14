<script lang="ts">
  import { runtime } from '../game'

  /** Switch for locking the satchel, so costs only use storage. */
  const { game } = runtime
  const locked = $derived($game.player.satchelLocked)
</script>

<label class="lock" class:locked>
  <input
    type="checkbox"
    role="switch"
    aria-label="Lock satchel"
    checked={locked}
    onchange={(e) =>
      runtime.dispatch({ type: 'satchel/setLocked', locked: e.currentTarget.checked })}
  />
  <span class="switch" aria-hidden="true"></span>
  <span class="text">
    <strong>Lock satchel</strong>
    <span>
      {locked ? 'Costs use storage only.' : 'Costs use your satchel first, then storage.'}
    </span>
  </span>
</label>

<style>
  .lock {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 44px;
    cursor: pointer;
  }

  input {
    position: absolute;
    opacity: 0;
    width: 1px;
    height: 1px;
  }

  .switch {
    flex: none;
    position: relative;
    width: 46px;
    height: 26px;
    border-radius: 999px;
    background: var(--disabled, #d8d0c4);
    transition: background 0.15s;
  }

  .switch::after {
    content: '';
    position: absolute;
    top: 3px;
    left: 3px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--surface);
    transition: transform 0.15s;
  }

  .locked .switch {
    background: var(--petal-deep);
  }

  .locked .switch::after {
    transform: translateX(20px);
  }

  input:focus-visible + .switch {
    outline: 3px solid var(--leaf);
    outline-offset: 2px;
  }

  .text {
    display: flex;
    flex-direction: column;
    font-size: 0.9rem;
  }
</style>
