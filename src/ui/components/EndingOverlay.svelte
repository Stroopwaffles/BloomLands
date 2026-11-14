<script lang="ts">
  import { onMount } from 'svelte'
  import Art from '../../art/Art.svelte'
  import CourtScene from '../../art/CourtScene.svelte'
  import SceneBackdrop from '../../art/SceneBackdrop.svelte'
  import { CAPTAIN, ENDING_SCENES, SPIRIT_THANKS } from '../../data/ending'
  import { SPIRITS } from '../../data/spirits'
  import { REGION_ORDER, REGIONS } from '../../data/world'
  import { captainJoined } from '../../engine/ending'
  import { courtRank } from '../../engine/modifiers'
  import { endingView } from '../endingView.svelte'
  import { runtime } from '../game'

  /**
   * The ending (design doc 3.11 → Ending sequence), after the fifth Root Song: the spirits
   * gather, every region blooms, the captain and the helpers celebrate, the spirits give thanks,
   * and it ends on the finished court. Then the bonus run begins.
   */
  const { game } = runtime
  const STEPS = ['gather', 'bloom', 'celebrate', 'thanks', 'court'] as const
  let step = $state(0)
  /** The court that was finished (the new run has already started behind the ending). */
  const court = $derived(
    $game.prestige.endingCourt ?? {
      rank: courtRank($game),
      helpers: $game.helpers.list.map((h) => h.type),
    },
  )
  let regionIndex = $state(0)
  const spirits = Object.values(SPIRITS)

  onMount(() =>
    runtime.onEvents((events) => {
      if (events.some((e) => e.type === 'ending')) {
        step = 0
        regionIndex = 0
        endingView.ending = true
      }
    }),
  )

  // The bloom scene pans across every region by itself.
  $effect(() => {
    if (!endingView.ending || STEPS[step] !== 'bloom') return
    const timer = setInterval(() => {
      if (regionIndex < REGION_ORDER.length - 1) regionIndex++
      else clearInterval(timer)
    }, 2200)
    return () => clearInterval(timer)
  })

  function next() {
    if (step < STEPS.length - 1) {
      step++
      regionIndex = 0
    } else {
      endingView.ending = false
    }
  }

  const petals = Array.from({ length: 26 }, (_, i) => ({
    left: (i * 37) % 100,
    delay: (i * 0.41) % 6,
    color: ['#f7b7c8', '#ffd94f', '#cdbbf5', '#9ccc72', '#8ac4f0'][i % 5],
  }))
</script>

{#if endingView.ending}
  <div class="ending" role="dialog" aria-label="The ending">
    <div class="petals" aria-hidden="true">
      {#each petals as p, i (i)}
        <span style:left="{p.left}%" style:animation-delay="{p.delay}s" style:background={p.color}
        ></span>
      {/each}
    </div>

    {#key step}
      <div class="scene">
        {#if STEPS[step] === 'gather'}
          <div class="gathering">
            <div class="court">
              <CourtScene
                rank={court.rank}
                helperTypes={[]}
                captain={captainJoined($game)}
                size={220}
              />
            </div>
            {#each spirits as spirit, i (spirit.id)}
              {@const angle = (i / spirits.length) * Math.PI * 2 - Math.PI / 2}
              <span
                class="spirit"
                style:left="{50 + Math.cos(angle) * 42}%"
                style:top="{50 + Math.sin(angle) * 40}%"
                style:animation-delay="{i * 0.35}s"
              >
                <Art id={spirit.id} size={72} />
              </span>
            {/each}
          </div>
          <p class="line">{ENDING_SCENES.gather}</p>
        {:else if STEPS[step] === 'bloom'}
          {@const regionId = REGION_ORDER[regionIndex]}
          {#key regionId}
            <div class="region">
              <SceneBackdrop spotId={REGIONS[regionId].sceneSpot} />
              <span class="region-name">{REGIONS[regionId].name}</span>
            </div>
          {/key}
          <p class="line">{ENDING_SCENES.bloom}</p>
        {:else if STEPS[step] === 'celebrate'}
          <div class="party">
            {#if captainJoined($game)}
              <span class="dancer slow"><Art id={CAPTAIN.id} size={130} /></span>
            {/if}
            <span class="dancer"><Art id="char-fairy" size={150} /></span>
            {#each ['gatherer', 'scout', 'brewer', 'peddler', 'pirate'] as type, i (type)}
              <span class="dancer small" style:animation-delay="{i * 0.2}s">
                <Art id={`helper-${type}`} size={64} />
              </span>
            {/each}
          </div>
          <p class="line">
            {captainJoined($game)
              ? ENDING_SCENES.celebrate
              : 'Your helpers dance in the moonlight. Somewhere, a pirate captain is watching.'}
          </p>
        {:else if STEPS[step] === 'thanks'}
          <ul class="thanks">
            {#each spirits as spirit, i (spirit.id)}
              <li style:animation-delay="{i * 0.5}s">
                <Art id={spirit.id} size={44} />
                <span>
                  <strong>{spirit.name.split(',')[0]}</strong>
                  {SPIRIT_THANKS[spirit.id] ?? '"Thank you."'}
                </span>
              </li>
            {/each}
          </ul>
          <p class="line">{ENDING_SCENES.thanks}</p>
        {:else}
          <div class="finished">
            <CourtScene
              rank={court.rank}
              helperTypes={court.helpers}
              captain={captainJoined($game)}
              size={300}
            />
          </div>
          <p class="line">{ENDING_SCENES.court}</p>
          <p class="sub">
            Thank you for healing the land. One last run awaits, just for fun: grow your court to
            its final rank.
          </p>
        {/if}
      </div>
    {/key}

    <button type="button" class="next" onclick={next}>
      {step < STEPS.length - 1 ? 'Continue' : 'Begin the bonus run'}
    </button>
  </div>
{/if}

<style>
  .ending {
    position: fixed;
    inset: 0;
    z-index: 95;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20px;
    padding: 24px;
    background:
      radial-gradient(circle at 50% 40%, rgb(255 229 158 / 0.25), transparent 60%),
      radial-gradient(circle at 50% 50%, #2a2160, #120f2b 80%);
    color: #fffaf0;
    overflow: hidden;
    animation: fade 1.2s ease-out both;
  }

  .scene {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    width: min(720px, 100%);
    animation: fade 0.9s ease-out both;
  }

  .line {
    margin: 0;
    font-family: var(--font-heading);
    font-size: clamp(1.3rem, 3.4vw, 2rem);
    text-align: center;
    text-shadow: 0 0 18px rgb(255 229 158 / 0.6);
  }

  .sub {
    margin: 0;
    max-width: 520px;
    text-align: center;
    opacity: 0.85;
  }

  .gathering {
    position: relative;
    width: min(520px, 90vw);
    aspect-ratio: 1.3;
  }

  .gathering .court {
    position: absolute;
    left: 50%;
    top: 50%;
    translate: -50% -50%;
  }

  .spirit {
    position: absolute;
    translate: -50% -50%;
    filter: drop-shadow(0 0 14px #fff3b0);
    animation: arrive 1.2s ease-out both;
  }

  .region {
    position: relative;
    width: min(640px, 90vw);
    aspect-ratio: 16 / 10;
    border-radius: 24px;
    overflow: hidden;
    border: 3px solid #fff3b0;
    animation: fade 0.8s ease-out both;
  }

  .region-name {
    position: absolute;
    left: 50%;
    bottom: 12px;
    translate: -50% 0;
    padding: 4px 16px;
    border-radius: 999px;
    background: rgb(18 15 43 / 0.7);
    font-family: var(--font-heading);
    font-size: 1.2rem;
  }

  .party {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    justify-content: center;
    gap: 8px;
  }

  .dancer {
    animation: dance 1s ease-in-out infinite alternate;
  }

  .dancer.slow {
    animation-duration: 1.4s;
  }

  .thanks {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
    width: min(560px, 92vw);
  }

  .thanks li {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 12px;
    border-radius: 14px;
    background: rgb(255 255 255 / 0.08);
    animation: fade 0.8s ease-out both;
  }

  .thanks span {
    display: flex;
    flex-direction: column;
    font-size: 0.95rem;
  }

  .finished {
    filter: drop-shadow(0 0 30px rgb(255 229 158 / 0.5));
  }

  .next {
    position: relative;
    min-height: 52px;
    padding: 0 28px;
    border: 2px solid #fff3b0;
    border-radius: 16px;
    background: #c98a1c;
    color: white;
    font: inherit;
    font-family: var(--font-heading);
    font-size: 1.2rem;
    cursor: pointer;
  }

  .petals span {
    position: absolute;
    top: -20px;
    width: 10px;
    height: 7px;
    border-radius: 60% 0;
    opacity: 0.8;
    animation: fall 7s linear infinite;
  }

  @keyframes fall {
    to {
      translate: 30px 110vh;
      rotate: 540deg;
    }
  }

  @keyframes fade {
    from {
      opacity: 0;
    }
  }

  @keyframes arrive {
    from {
      opacity: 0;
      scale: 0.4;
    }
  }

  @keyframes dance {
    from {
      translate: 0 0;
      rotate: -4deg;
    }
    to {
      translate: 0 -10px;
      rotate: 4deg;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .ending,
    .scene,
    .spirit,
    .dancer,
    .petals span,
    .thanks li,
    .region {
      animation: none;
    }
  }
</style>
