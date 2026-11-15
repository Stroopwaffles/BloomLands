import { describe, expect, it } from 'vitest'
import { Bot } from '../src/sim/bot'

describe('the balance simulator', () => {
  it('plays a first day like a player: a few ranks, and into the Forest', () => {
    const bot = new Bot({ runs: 1, activeMinutesPerDay: 90, maxDays: 1 })
    const milestones = bot.play().map((m) => m.label)
    expect(milestones).toContain('Rank: Hearthling')
    expect(milestones).toContain('Region: Forest')
    expect(bot.state.helpers.list.length).toBeGreaterThan(0)
  })
})
