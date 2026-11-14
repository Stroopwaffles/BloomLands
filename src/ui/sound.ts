import { onAudioReady, setHidden, unlockAudio } from '../audio/engine'
import { music } from '../audio/music'
import { playSound, type SoundId } from '../audio/sfx'
import { PLANTS } from '../data/plants'
import type { GameEvent } from '../engine/events'
import { runtime } from './game'

/** Which sound a game event makes (null: silent). */
export function soundFor(event: GameEvent): SoundId | null {
  switch (event.type) {
    case 'hit':
      return 'tap'
    case 'pest-cleared':
    case 'drink':
    case 'recruited':
    case 'mount-fed':
    case 'flight-event':
      return 'pop'
    case 'harvest': {
      const rarity = PLANTS[event.plantId]?.rarity
      return rarity === 'rare' || rarity === 'very-rare' ? 'rare' : 'harvest'
    }
    case 'blocked':
      return 'blocked'
    case 'depart':
      return 'depart'
    case 'deposit':
    case 'packed':
    case 'parcel-sent':
    case 'parcel-arrived':
      return 'deposit'
    case 'craft-start':
    case 'research-start':
      return 'craft'
    case 'shop-sold':
    case 'shop-bought':
    case 'trade-filled':
    case 'villager-helped':
      return 'coins'
    case 'upgrade-bought':
      return event.rankUp ? 'fanfare' : 'coins'
    case 'creature-tap':
      return 'boing'
    case 'creature-gone':
    case 'camp-cleared':
      return 'shoo'
    case 'spell-cast':
      return 'spell'
    case 'ritual-performed':
      return 'ritual'
    case 'bloom':
      return event.levelUp ? 'fanfare' : null
    case 'story':
      return event.complete ? 'fanfare' : 'pop'
    case 'curio':
    case 'secret':
    case 'region-unlocked':
    case 'crew-won':
    case 'mount-tamed':
    case 'mount-level':
      return 'fanfare'
    case 'outfit':
      return 'rare'
    default:
      return null
  }
}

/** Buttons whose own game event already makes a sound (plants, creatures, flight taps). */
const SILENT_CLICK = '.plant, .creature, .tap, [data-silent]'

/** Starts the sound system: unlock on first interaction, event sounds, button clicks. */
export function startSound(): () => void {
  const unlock = () => unlockAudio()
  const onClick = (e: MouseEvent) => {
    const target = e.target as Element | null
    const button = target?.closest('button, label.file')
    if (!button || button.closest(SILENT_CLICK)) return
    if (button instanceof HTMLButtonElement && button.disabled) return
    playSound('click')
  }
  const onVisibility = () => setHidden(document.hidden)
  window.addEventListener('pointerdown', unlock, true)
  window.addEventListener('keydown', unlock, true)
  document.addEventListener('click', onClick, true)
  document.addEventListener('visibilitychange', onVisibility)
  const stopReady = onAudioReady(() => music.resume())
  const stopEvents = runtime.onEvents((events) => {
    for (const event of events) {
      const id = soundFor(event)
      if (id) playSound(id)
      if (event.type === 'harvest' && event.trinketId) playSound('trinket')
    }
  })
  return () => {
    window.removeEventListener('pointerdown', unlock, true)
    window.removeEventListener('keydown', unlock, true)
    document.removeEventListener('click', onClick, true)
    document.removeEventListener('visibilitychange', onVisibility)
    stopReady()
    stopEvents()
  }
}
