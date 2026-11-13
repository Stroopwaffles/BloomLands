import { getStorage } from '../engine/save'
import { createRuntime } from './runtime.svelte'

/** The one running game. */
export const runtime = createRuntime(getStorage())

/** The debug panel shows in local development, or on the live site with `?debug` in the URL. */
export const debugEnabled =
  import.meta.env.DEV || new URLSearchParams(window.location.search).has('debug')

// Local development only: lets the browser console (and automated checks) drive the game,
// e.g. `__bloom.dispatch({ type: 'debug/addItem', itemId: 'potion-lucky-dew', amount: 1 })`.
if (import.meta.env.DEV) (window as unknown as { __bloom: typeof runtime }).__bloom = runtime
