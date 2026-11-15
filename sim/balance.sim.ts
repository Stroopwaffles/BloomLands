import { writeFileSync } from 'node:fs'
import { it } from 'vitest'
import { Bot } from '../src/sim/bot'

/**
 * Plays whole runs with the simulator bot and writes the timeline to sim/report.txt: when each
 * rank, region, spirit and Root Song arrives, in active minutes and in days. Settings come from
 * the environment: SIM_RUNS (default 1), SIM_MINUTES (active minutes a day, default 90).
 */
it('balance report', () => {
  const runs = Number(process.env.SIM_RUNS ?? 1)
  const minutes = Number(process.env.SIM_MINUTES ?? 90)
  const started = Date.now()
  const bot = new Bot({ runs, activeMinutesPerDay: minutes, maxDays: 40 })
  const milestones = bot.play()
  const lines = milestones.map(
    (m) =>
      `run ${m.run}  day ${String(m.day).padStart(2)}  ${String(m.activeMinutes).padStart(5)} min  ${m.label}`,
  )
  const s = bot.state
  lines.push(
    '',
    `Finished on run ${s.prestige.run}; ${Math.round((Date.now() - started) / 1000)}s to simulate.`,
    `Glimmers ${Math.round(s.resources.glimmers)}, helpers ${s.helpers.list.length}, upgrades ${s.upgrades.length}, regions ${s.unlockedRegions.join(', ')}`,
    `Root Song earned ${s.prestige.rootSongEarned}, unspent ${s.prestige.rootSong}; tiers bought: ${Object.entries(
      s.prestige.upgrades,
    )
      .map(([k, v]) => `${k.replace('root-', '')} ${v}`)
      .join(', ')}; relics ${s.prestige.relics.length}`,
    `Research done ${s.research.completed.length}, stories done ${Object.values(s.stories).filter((x) => x.complete).length}, spirits ${Object.values(s.spirits).filter((x) => x.awakened).length}`,
  )
  lines.push('', ...bot.days)
  writeFileSync('sim/report.txt', lines.join('\n') + '\n')
})
