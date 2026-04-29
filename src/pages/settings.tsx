import { useState } from 'react'

type SettingsState = {
  emailNotifications: boolean
  inAppNotifications: boolean
  compactList: boolean
}

const defaultState: SettingsState = {
  emailNotifications: true,
  inAppNotifications: true,
  compactList: false,
}

const storageKey = 'studybuddy.settings'

function SettingsPage() {
  const [settings, setSettings] = useState<SettingsState>(() => {
    try {
      const raw = window.localStorage.getItem(storageKey)
      if (!raw) {
        return defaultState
      }

      const parsed = JSON.parse(raw) as SettingsState
      return {
        emailNotifications: Boolean(parsed.emailNotifications),
        inAppNotifications: Boolean(parsed.inAppNotifications),
        compactList: Boolean(parsed.compactList),
      }
    } catch {
      return defaultState
    }
  })

  function updateSetting<Key extends keyof SettingsState>(key: Key, value: SettingsState[Key]) {
    const nextState = {
      ...settings,
      [key]: value,
    }
    setSettings(nextState)
    window.localStorage.setItem(storageKey, JSON.stringify(nextState))
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="font-display text-xs font-medium uppercase tracking-[0.2em] text-accent-text">
          Settings
        </p>
        <h2 className="mt-2 font-display text-2xl font-medium text-text-primary">
          Workspace preferences
        </h2>
      </header>

      <div className="space-y-3 rounded-2xl border border-border bg-surface-1 p-5">
        <SettingToggle
          title="Email notifications"
          description="Receive email updates for messages and request activity."
          checked={settings.emailNotifications}
          onChange={(value) => updateSetting('emailNotifications', value)}
        />
        <SettingToggle
          title="In-app notifications"
          description="Show activity notifications in the app."
          checked={settings.inAppNotifications}
          onChange={(value) => updateSetting('inAppNotifications', value)}
        />
        <SettingToggle
          title="Compact list mode"
          description="Show tighter spacing in lists and feeds."
          checked={settings.compactList}
          onChange={(value) => updateSetting('compactList', value)}
        />
      </div>
    </div>
  )
}

type SettingToggleProps = {
  title: string
  description: string
  checked: boolean
  onChange: (value: boolean) => void
}

function SettingToggle({ title, description, checked, onChange }: SettingToggleProps) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface-2 px-4 py-3">
      <div>
        <p className="text-sm font-semibold text-text-primary">{title}</p>
        <p className="mt-1 text-xs text-text-tertiary">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`inline-flex h-6 w-11 items-center rounded-full p-1 transition-colors ${
          checked ? 'bg-accent' : 'bg-surface-3'
        }`}
        aria-pressed={checked}
      >
        <span
          className={`h-4 w-4 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </label>
  )
}

export default SettingsPage
