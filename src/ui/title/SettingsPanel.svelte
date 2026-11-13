<script lang="ts">
  import Choices from '../components/Choices.svelte'
  import { settings, updateSettings } from '../settings.svelte'
  import type { Settings } from '../settingsData'

  const VOLUMES = [0, 25, 50, 75, 100]
</script>

<h2>Settings</h2>
<div class="settings">
  <section>
    <h3>Music</h3>
    <Choices
      label="Music volume"
      options={VOLUMES.map((n) => ({ id: String(n), name: n === 0 ? 'Off' : `${n}%` }))}
      value={String(settings.musicVolume)}
      onPick={(id) => updateSettings({ musicVolume: Number(id) as Settings['musicVolume'] })}
    />
  </section>
  <section>
    <h3>Sound effects</h3>
    <Choices
      label="Sound effects volume"
      options={VOLUMES.map((n) => ({ id: String(n), name: n === 0 ? 'Off' : `${n}%` }))}
      value={String(settings.soundVolume)}
      onPick={(id) => updateSettings({ soundVolume: Number(id) as Settings['soundVolume'] })}
    />
  </section>
  <section>
    <h3>Reduced motion</h3>
    <Choices
      label="Reduced motion"
      options={[
        { id: 'system', name: 'Follow device' },
        { id: 'on', name: 'Always' },
      ]}
      value={settings.reducedMotion}
      onPick={(id) => updateSettings({ reducedMotion: id as Settings['reducedMotion'] })}
    />
  </section>
  <section>
    <h3>Particle effects</h3>
    <p class="hint">Petal bursts, sparkles, rain and drifting seeds.</p>
    <Choices
      label="Particle effects"
      options={[
        { id: 'on', name: 'On' },
        { id: 'off', name: 'Off' },
      ]}
      value={settings.particles ? 'on' : 'off'}
      onPick={(id) => updateSettings({ particles: id === 'on' })}
    />
  </section>
  <section>
    <h3>Interface size</h3>
    <Choices
      label="Interface size"
      options={[90, 100, 110, 125].map((n) => ({ id: String(n), name: `${n}%` }))}
      value={String(settings.uiScale)}
      onPick={(id) => updateSettings({ uiScale: Number(id) as Settings['uiScale'] })}
    />
  </section>
  <section>
    <h3>Autosave</h3>
    <Choices
      label="Autosave"
      options={[15, 30, 60, 120].map((n) => ({ id: String(n), name: `${n}s` }))}
      value={String(settings.autosaveSeconds)}
      onPick={(id) =>
        updateSettings({ autosaveSeconds: Number(id) as Settings['autosaveSeconds'] })}
    />
  </section>
  <section>
    <h3>Big numbers</h3>
    <Choices
      label="Big numbers"
      options={[
        { id: 'short', name: '1.2K' },
        { id: 'scientific', name: '1.2E3' },
      ]}
      value={settings.numberStyle}
      onPick={(id) => updateSettings({ numberStyle: id as Settings['numberStyle'] })}
    />
  </section>
</div>

<style>
  .settings {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  section {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  h3 {
    margin: 0;
    font-size: 1rem;
  }

  .hint {
    margin: 0;
    font-size: 0.85rem;
    opacity: 0.7;
  }
</style>
