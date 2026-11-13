import { mount } from 'svelte'
import './app.css'
import App from './App.svelte'
import { ART } from './art/registry'
import PlayerFairy from './art/PlayerFairy.svelte'

// The player's fairy is drawn from their own choices wherever 'char-fairy' appears.
ART['char-fairy'] = PlayerFairy

const app = mount(App, {
  target: document.getElementById('app')!,
})

export default app
