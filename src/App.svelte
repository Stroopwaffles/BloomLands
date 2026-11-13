<script lang="ts">
  import { GAME_VERSION } from './engine/version'
</script>

<main>
  <div class="card">
    <svg class="flower" viewBox="0 0 32 32" aria-hidden="true">
      <g fill="var(--petal)" stroke="var(--petal-deep)" stroke-width="0.8">
        <circle cx="16" cy="8" r="6" />
        <circle cx="24" cy="16" r="6" />
        <circle cx="16" cy="24" r="6" />
        <circle cx="8" cy="16" r="6" />
      </g>
      <circle cx="16" cy="16" r="5" fill="#ffe59e" stroke="#e2b94f" stroke-width="0.8" />
    </svg>
    <h1>Bloom Lands</h1>
    <p>A cozy fairy clicker about healing the land.</p>
    <p class="status">Coming soon · v{GAME_VERSION}</p>
  </div>
</main>

<style>
  main {
    min-height: 100vh;
    display: grid;
    place-items: center;
    padding: 16px;
  }

  .card {
    background: var(--cream-deep);
    border: 2px solid var(--honey);
    border-radius: 24px;
    padding: 32px 40px;
    text-align: center;
    max-width: 420px;
    width: 100%;
  }

  .flower {
    width: 72px;
    height: 72px;
    animation: sway 4s ease-in-out infinite;
  }

  h1 {
    margin: 8px 0 4px;
    font-size: 2.4rem;
    color: var(--leaf-deep);
  }

  p {
    margin: 4px 0;
  }

  .status {
    margin-top: 16px;
    font-size: 0.9rem;
    opacity: 0.75;
  }

  @keyframes sway {
    0%,
    100% {
      transform: rotate(-6deg);
    }
    50% {
      transform: rotate(6deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .flower {
      animation: none;
    }
  }
</style>
