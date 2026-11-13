import { writable, type Readable } from 'svelte/store'
import { applyAction, type Action } from '../engine/actions'
import {
  clearStorage,
  exportSave,
  importSave,
  loadFromStorage,
  saveToStorage,
} from '../engine/save'
import type { GameEvent } from '../engine/events'
import { createNewGame, type GameState } from '../engine/state'
import { advance } from '../engine/tick'

export const TICK_INTERVAL_MS = 100
export const AUTOSAVE_INTERVAL_MS = 30_000
/** Only greet the player if they were away at least this long. */
export const WELCOME_BACK_MIN_MS = 60_000

export interface WelcomeBack {
  awayMs: number
  simulatedMs: number
  capped: boolean
}

export interface Runtime {
  /** The live game state. Components read it with `$game`. */
  game: Readable<GameState>
  /** Set when offline progress was applied; the UI shows a welcome-back message. */
  welcomeBack: Readable<WelcomeBack | null>
  dismissWelcomeBack(): void
  /** Applies a player action. Returns what happened (also sent to `onEvents` listeners). */
  dispatch(action: Action): GameEvent[]
  /** Listen for game events (harvests, hits, ...) to animate them. Returns an unsubscribe. */
  onEvents(listener: (events: GameEvent[]) => void): () => void
  /** Saves now. Returns false if the browser blocked saving. */
  save(): boolean
  exportText(): string
  /** Replaces the game with an imported save. Throws SaveError with a readable message. */
  importText(text: string): void
  /** Deletes the save and starts a new game. */
  reset(): void
  /** Debug: pretend the game was closed for `ms`, then catch up as if reopening it. */
  simulateAway(ms: number): void
  /** Starts ticking, autosaving and listening for the tab closing. Returns a stop function. */
  start(): () => void
}

/**
 * Connects the pure game engine to the browser: the tick loop, autosave, and reacting to the
 * tab being hidden, shown or closed. Screens only talk to the game through this.
 */
export function createRuntime(storage: Storage | null, clock: () => number = Date.now): Runtime {
  // Deeply reactive: when the engine changes any part of the state, exactly the parts of the
  // screen that show it update. The engine itself stays plain TypeScript.
  let state: GameState = $state(loadFromStorage(storage) ?? createNewGame(clock()))
  const game = writable(state)
  const welcomeBack = writable<WelcomeBack | null>(null)
  // Event listeners are plain callbacks, not screen state, so this Set doesn't need reactivity.
  // eslint-disable-next-line svelte/prefer-svelte-reactivity
  const listeners = new Set<(events: GameEvent[]) => void>()

  const publish = () => game.set(state)

  function catchUp() {
    const report = advance(state, clock())
    if (report.offline && report.elapsedMs >= WELCOME_BACK_MIN_MS) {
      welcomeBack.set({
        awayMs: report.elapsedMs,
        simulatedMs: report.simulatedMs,
        capped: report.capped,
      })
    }
    publish()
  }

  function save() {
    const ok = saveToStorage(storage, state, clock())
    publish()
    return ok
  }

  function replace(next: GameState) {
    state = next
    // A replaced game starts "now": importing a save never grants extra offline time.
    state.meta.lastTickAt = clock()
    welcomeBack.set(null)
    save()
  }

  return {
    game: { subscribe: game.subscribe },
    welcomeBack: { subscribe: welcomeBack.subscribe },
    dismissWelcomeBack: () => welcomeBack.set(null),

    dispatch(action) {
      advance(state, clock())
      const events = applyAction(state, action)
      publish()
      if (events.length > 0) for (const listener of listeners) listener(events)
      return events
    },

    onEvents(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },

    save,
    exportText: () => exportSave(state, clock()),
    importText: (text) => replace(importSave(text)),

    reset() {
      clearStorage(storage)
      replace(createNewGame(clock()))
    },

    simulateAway(ms) {
      advance(state, clock())
      state.meta.lastTickAt -= ms
      catchUp()
    },

    start() {
      catchUp()
      save()

      const tick = setInterval(catchUp, TICK_INTERVAL_MS)
      const autosave = setInterval(save, AUTOSAVE_INTERVAL_MS)
      const onVisibility = () => {
        if (document.visibilityState === 'hidden') save()
        else catchUp()
      }
      const onPageHide = () => save()

      document.addEventListener('visibilitychange', onVisibility)
      window.addEventListener('pagehide', onPageHide)

      return () => {
        clearInterval(tick)
        clearInterval(autosave)
        document.removeEventListener('visibilitychange', onVisibility)
        window.removeEventListener('pagehide', onPageHide)
        save()
      }
    },
  }
}
