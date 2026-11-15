<script lang="ts">
  import Choices from '../components/Choices.svelte'
  import { settings, updateSettings } from '../settings.svelte'
  import type { Settings } from '../settingsData'

  const VOLUMES = [0, 25, 50, 75, 100]

  /** Desktop alerts need the browser's permission first. */
  const alertsSupported = typeof Notification !== 'undefined'
  let alertNote = $state('')

  async function setDesktopAlerts(on: boolean) {
    alertNote = ''
    if (!on) {
      updateSettings({ desktopAlerts: false })
      return
    }
    const permission =
      Notification.permission === 'default'
        ? await Notification.requestPermission()
        : Notification.permission
    if (permission === 'granted') {
      updateSettings({ desktopAlerts: true })
    } else {
      updateSettings({ desktopAlerts: false })
      alertNote =
        'Your browser is blocking notifications for this site. You can allow them in its site settings.'
    }
  }
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
    <h3>Night colors</h3>
    <p class="hint">Softer, darker colors for the interface while it's night in the game.</p>
    <Choices
      label="Night colors"
      options={[
        { id: 'auto', name: 'At night' },
        { id: 'off', name: 'Never' },
      ]}
      value={settings.nightTheme}
      onPick={(id) => updateSettings({ nightTheme: id as Settings['nightTheme'] })}
    />
  </section>
  <section>
    <h3>Workshop and research notices</h3>
    <p class="hint">A note pops up when research or a workshop job finishes.</p>
    <Choices
      label="Workshop and research notices"
      options={[
        { id: 'on', name: 'On' },
        { id: 'off', name: 'Off' },
      ]}
      value={settings.workNotices ? 'on' : 'off'}
      onPick={(id) => updateSettings({ workNotices: id === 'on' })}
    />
  </section>
  {#if alertsSupported}
    <section>
      <h3>Alerts while away</h3>
      <p class="hint">
        A desktop notification when research or a workshop job finishes while the game is open in
        the background.
      </p>
      <Choices
        label="Alerts while away"
        options={[
          { id: 'on', name: 'On' },
          { id: 'off', name: 'Off' },
        ]}
        value={settings.desktopAlerts ? 'on' : 'off'}
        onPick={(id) => setDesktopAlerts(id === 'on')}
      />
      {#if alertNote}<p class="hint">{alertNote}</p>{/if}
    </section>
  {/if}
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
