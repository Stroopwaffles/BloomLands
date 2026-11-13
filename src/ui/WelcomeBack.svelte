<script lang="ts">
  import { formatDuration } from '../engine/format'
  import { runtime } from './game'

  const { welcomeBack } = runtime
</script>

{#if $welcomeBack}
  <div class="toast" role="status">
    <p>
      <strong>Welcome back!</strong> You were away for {formatDuration($welcomeBack.awayMs)}.
    </p>
    {#if $welcomeBack.capped}
      <p class="note">Your court kept working for {formatDuration($welcomeBack.simulatedMs)}.</p>
    {/if}
    <button type="button" onclick={() => runtime.dismissWelcomeBack()}>Lovely</button>
  </div>
{/if}

<style>
  .toast {
    position: fixed;
    top: 16px;
    left: 50%;
    transform: translateX(-50%);
    width: min(420px, calc(100% - 32px));
    background: var(--cream-deep);
    border: 2px solid var(--leaf);
    border-radius: 16px;
    padding: 12px 16px;
    box-shadow: 0 6px 18px rgb(90 67 82 / 0.15);
    z-index: 20;
    text-align: center;
  }

  p {
    margin: 4px 0;
  }

  .note {
    font-size: 0.9rem;
    opacity: 0.8;
  }

  button {
    margin-top: 8px;
    min-height: 44px;
    padding: 0 20px;
    border: none;
    border-radius: 12px;
    background: var(--leaf-deep);
    color: white;
    font: inherit;
    font-weight: 700;
    cursor: pointer;
  }
</style>
