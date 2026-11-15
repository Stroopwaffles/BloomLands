<script lang="ts">
  import { EVENTS } from '../../data/events'
  import { formatDuration } from '../../engine/format'
  import { runtime } from '../game'

  /** A glowing badge in the header while a special event lasts, with its countdown. */
  const { game } = runtime
  const active = $derived($game.specialEvents.active)
</script>

{#if active && EVENTS[active.id]}
  <div class="event-badge" role="status" title="A special event is happening! Find it on the map.">
    <span class="moon" aria-hidden="true"></span>
    {EVENTS[active.id].name} · {formatDuration(active.remainingMs)}
  </div>
{/if}

<style>
  .event-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 12px;
    border-radius: 999px;
    background: #3a0e1e;
    border: 2px solid #b0243e;
    color: #ffd6dc;
    font-weight: 700;
    font-size: 0.9rem;
    white-space: nowrap;
    box-shadow: 0 0 12px rgb(255 60 90 / 0.45);
    animation: glow 3s ease-in-out infinite;
  }

  .moon {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #c8243a;
    box-shadow: 0 0 8px #ff4a5a;
  }

  @keyframes glow {
    50% {
      box-shadow: 0 0 4px rgb(255 60 90 / 0.25);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .event-badge {
      animation: none;
    }
  }
</style>
