'use client'

import { createClient } from '@/utils/supabase/client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PREFERENCE_CATEGORIES } from '@/app/lib/notificationEvents'

type Frequency = 'immediate' | 'digest' | 'off'

type Preferences = {
  email_new_report: Frequency
  email_status_change: Frequency
  email_tour_change: Frequency
  email_conduct_change: Frequency
  email_team_alert: Frequency
  email_green_sheet: boolean
  in_app_new_report: Frequency
  in_app_status_change: Frequency
  in_app_tour_change: Frequency
  in_app_conduct_change: Frequency
  in_app_team_alert: Frequency
  digest_frequency: 'daily' | 'hourly' | '30min'
  digest_time: string
}

type CoachedSport = {
  id: string
  sport_name: string
  season: string
  enable_alerts: boolean
}

type OverrideFrequency = Frequency | 'inherit'

type CadetOverrideState = {
  cadet_id: string
  first_name: string
  last_name: string
  expanded: boolean
  categories: Record<string, { email: OverrideFrequency; inApp: OverrideFrequency }>
}

const EMPTY_CATEGORIES = (): Record<string, { email: OverrideFrequency; inApp: OverrideFrequency }> =>
  Object.fromEntries(
    PREFERENCE_CATEGORIES.map((c) => [c.key, { email: 'inherit' as OverrideFrequency, inApp: 'inherit' as OverrideFrequency }])
  )

export default function PreferencesPage() {
  const supabase = createClient()
  const router = useRouter()

  const [prefs, setPrefs] = useState<Preferences | null>(null)
  const [coachedSports, setCoachedSports] = useState<CoachedSport[]>([])
  const [cadetOverrides, setCadetOverrides] = useState<CadetOverrideState[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')

      const { data: prefData } = await supabase.rpc('get_or_create_preferences', { p_user_id: user.id })
      if (prefData && prefData.length > 0) {
        const row = prefData[0]
        setPrefs({
          email_new_report: row.email_new_report,
          email_status_change: row.email_status_change,
          email_tour_change: row.email_tour_change ?? 'immediate',
          email_conduct_change: row.email_conduct_change ?? 'immediate',
          email_team_alert: row.email_team_alert,
          email_green_sheet: row.email_green_sheet,
          in_app_new_report: row.in_app_new_report ?? 'immediate',
          in_app_status_change: row.in_app_status_change ?? 'immediate',
          in_app_tour_change: row.in_app_tour_change ?? 'immediate',
          in_app_conduct_change: row.in_app_conduct_change ?? 'immediate',
          in_app_team_alert: row.in_app_team_alert ?? 'immediate',
          digest_frequency: row.digest_frequency ?? 'daily',
          digest_time: row.digest_time ?? '06:00',
        })
      }

      const { data: sportsData } = await supabase
        .from('sport_coaches')
        .select('id, enable_alerts, sport:sports(name, season)')
        .eq('coach_id', user.id)

      if (sportsData) {
        setCoachedSports(sportsData.map((s: { id: string; enable_alerts: boolean; sport: { name: string; season: string } | { name: string; season: string }[] }) => {
          const sport = Array.isArray(s.sport) ? s.sport[0] : s.sport
          return {
            id: s.id,
            sport_name: sport.name,
            season: sport.season,
            enable_alerts: s.enable_alerts ?? true,
          }
        }))
      }

      const { data: oversightCadets } = await supabase.rpc('get_my_oversight_cadets')
      const { data: overrideRows } = await supabase
        .from('cadet_notification_preferences')
        .select('cadet_id, category, email_frequency, in_app_frequency')
        .eq('staff_id', user.id)

      if (oversightCadets && oversightCadets.length > 0) {
        const overrideMap = new Map<string, Record<string, { email: OverrideFrequency; inApp: OverrideFrequency }>>()
        for (const row of overrideRows ?? []) {
          if (!overrideMap.has(row.cadet_id)) overrideMap.set(row.cadet_id, EMPTY_CATEGORIES())
          const cats = overrideMap.get(row.cadet_id)!
          cats[row.category] = {
            email: (row.email_frequency as OverrideFrequency) ?? 'inherit',
            inApp: (row.in_app_frequency as OverrideFrequency) ?? 'inherit',
          }
        }

        setCadetOverrides(
          oversightCadets.map((c: { cadet_id: string; first_name: string; last_name: string }) => ({
            cadet_id: c.cadet_id,
            first_name: c.first_name,
            last_name: c.last_name,
            expanded: false,
            categories: overrideMap.get(c.cadet_id) ?? EMPTY_CATEGORIES(),
          }))
        )
      }

      setLoading(false)
    }
    load()
  }, [supabase, router])

  const handleSave = async () => {
    if (!prefs) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()

    const { error: prefError } = await supabase
      .from('user_preferences')
      .update(prefs)
      .eq('user_id', user?.id)

    for (const s of coachedSports) {
      await supabase
        .from('sport_coaches')
        .update({ enable_alerts: s.enable_alerts })
        .eq('id', s.id)
    }

    if (user?.id) {
      for (const cadet of cadetOverrides) {
        for (const category of PREFERENCE_CATEGORIES) {
          const override = cadet.categories[category.key]
          if (!override) continue

          const emailVal = override.email === 'inherit' ? null : override.email
          const inAppVal = override.inApp === 'inherit' ? null : override.inApp

          if (emailVal === null && inAppVal === null) {
            await supabase
              .from('cadet_notification_preferences')
              .delete()
              .eq('staff_id', user.id)
              .eq('cadet_id', cadet.cadet_id)
              .eq('category', category.key)
          } else {
            await supabase
              .from('cadet_notification_preferences')
              .upsert({
                staff_id: user.id,
                cadet_id: cadet.cadet_id,
                category: category.key,
                email_frequency: emailVal,
                in_app_frequency: inAppVal,
                updated_at: new Date().toISOString(),
              })
          }
        }
      }
    }

    setSaving(false)
    if (prefError) alert('Failed to save.')
    else alert('Preferences updated!')
  }

  const timeOptions: string[] = []
  for (let i = 0; i < 24; i++) {
    const h = i.toString().padStart(2, '0')
    timeOptions.push(`${h}:00`, `${h}:30`)
  }

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading settings...</div>
  if (!prefs) return <div className="p-8 text-center text-destructive">Error loading preferences.</div>

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-foreground mb-2">Notification Settings</h1>
      <p className="text-muted-foreground mb-8">
        Control what in-app and email notifications you receive and how often.
      </p>

      <div className="space-y-8">
        <div className="bg-card p-6 rounded-lg shadow-sm border border-border space-y-6">
          <h2 className="text-lg font-bold text-foreground border-b border-border pb-2">Alert Categories</h2>

          {PREFERENCE_CATEGORIES.map((category) => (
            <CategoryRow
              key={category.key}
              title={category.title}
              desc={category.description}
              inAppValue={prefs[category.inAppField as keyof Preferences] as Frequency}
              emailValue={prefs[category.emailField as keyof Preferences] as Frequency}
              onInAppChange={(v) => setPrefs({ ...prefs, [category.inAppField]: v })}
              onEmailChange={(v) => setPrefs({ ...prefs, [category.emailField]: v })}
            />
          ))}
        </div>

        <div className="bg-card p-6 rounded-lg shadow-sm border border-border space-y-4">
          <h2 className="text-lg font-bold text-foreground border-b border-border pb-2">Green Sheet Email</h2>
          <label className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-foreground">Daily Green Sheet</h3>
              <p className="text-xs text-muted-foreground">Receive the daily green sheet summary by email.</p>
            </div>
            <input
              type="checkbox"
              checked={prefs.email_green_sheet}
              onChange={(e) => setPrefs({ ...prefs, email_green_sheet: e.target.checked })}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
          </label>
        </div>

        <div className="bg-card p-6 rounded-lg shadow-sm border border-border space-y-6">
          <h2 className="text-lg font-bold text-foreground border-b border-border pb-2">Digest Schedule</h2>
          <p className="text-sm text-muted-foreground -mt-4">
            If you selected &quot;Digest Summary&quot; for any category above, this controls when batched notifications are delivered.
          </p>

          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block text-sm font-medium text-foreground mb-1">Frequency</label>
              <select
                value={prefs.digest_frequency}
                onChange={(e) => setPrefs({ ...prefs, digest_frequency: e.target.value as Preferences['digest_frequency'] })}
                className="input-base"
              >
                <option value="daily">Daily</option>
                <option value="hourly">Hourly</option>
                <option value="30min">Every 30 Minutes</option>
              </select>
            </div>

            {prefs.digest_frequency === 'daily' && (
              <div className="w-1/2">
                <label className="block text-sm font-medium text-foreground mb-1">Delivery Time (UTC)</label>
                <select
                  value={prefs.digest_time}
                  onChange={(e) => setPrefs({ ...prefs, digest_time: e.target.value })}
                  className="input-base"
                >
                  {timeOptions.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {cadetOverrides.length > 0 && (
          <div className="bg-card p-6 rounded-lg shadow-sm border border-border space-y-4">
            <h2 className="text-lg font-bold text-foreground border-b border-border pb-2">Oversight Cadet Alerts</h2>
            <p className="text-sm text-muted-foreground -mt-2">
              Override your global notification settings for individual cadets you oversee. &quot;Inherit&quot; uses your global preferences above.
            </p>

            <div className="space-y-3">
              {cadetOverrides.map((cadet, cadetIdx) => (
                <div key={cadet.cadet_id} className="border border-border rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => {
                      const next = [...cadetOverrides]
                      next[cadetIdx].expanded = !next[cadetIdx].expanded
                      setCadetOverrides(next)
                    }}
                    className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 text-left"
                  >
                    <span className="font-medium text-foreground">
                      {cadet.last_name}, {cadet.first_name}
                    </span>
                    <span className="text-muted-foreground text-sm">{cadet.expanded ? '▲' : '▼'}</span>
                  </button>

                  {cadet.expanded && (
                    <div className="p-4 space-y-4 border-t border-border">
                      {PREFERENCE_CATEGORIES.map((category) => (
                        <div key={category.key} className="space-y-2">
                          <h4 className="text-sm font-medium text-foreground">{category.title}</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <OverrideFrequencySelect
                              label="In-App"
                              value={cadet.categories[category.key]?.inApp ?? 'inherit'}
                              onChange={(v) => {
                                const next = [...cadetOverrides]
                                next[cadetIdx].categories[category.key] = {
                                  ...next[cadetIdx].categories[category.key],
                                  inApp: v,
                                }
                                setCadetOverrides(next)
                              }}
                            />
                            <OverrideFrequencySelect
                              label="Email"
                              value={cadet.categories[category.key]?.email ?? 'inherit'}
                              onChange={(v) => {
                                const next = [...cadetOverrides]
                                next[cadetIdx].categories[category.key] = {
                                  ...next[cadetIdx].categories[category.key],
                                  email: v,
                                }
                                setCadetOverrides(next)
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {coachedSports.length > 0 && (
          <div className="bg-card p-6 rounded-lg shadow-sm border border-border space-y-4">
            <h2 className="text-lg font-bold text-foreground border-b border-border pb-2">Coaching Alerts</h2>
            <p className="text-sm text-muted-foreground -mt-2">Enable alerts for specific teams you coach.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {coachedSports.map((sport, idx) => (
                <div key={sport.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
                  <div>
                    <h4 className="font-bold text-foreground">{sport.sport_name}</h4>
                    <span className="text-xs uppercase text-muted-foreground">{sport.season}</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sport.enable_alerts}
                      onChange={(e) => {
                        const newSports = [...coachedSports]
                        newSports[idx].enable_alerts = e.target.checked
                        setCoachedSports(newSports)
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-muted peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary px-8 py-3 font-bold shadow-md transition-transform hover:scale-105"
          >
            {saving ? 'Saving...' : 'Save All Preferences'}
          </button>
        </div>
      </div>
    </div>
  )
}

function CategoryRow({
  title,
  desc,
  inAppValue,
  emailValue,
  onInAppChange,
  onEmailChange,
}: {
  title: string
  desc: string
  inAppValue: Frequency
  emailValue: Frequency
  onInAppChange: (v: Frequency) => void
  onEmailChange: (v: Frequency) => void
}) {
  return (
    <div className="space-y-3 pb-4 border-b border-border last:border-b-0 last:pb-0">
      <div>
        <h3 className="font-medium text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FrequencySelect label="In-App" value={inAppValue} onChange={onInAppChange} />
        <FrequencySelect label="Email" value={emailValue} onChange={onEmailChange} />
      </div>
    </div>
  )
}

function OverrideFrequencySelect({
  label,
  value,
  onChange,
}: {
  label: string
  value: OverrideFrequency
  onChange: (v: OverrideFrequency) => void
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as OverrideFrequency)}
        className="input-base w-full"
      >
        <option value="inherit">Inherit Global</option>
        <option value="immediate">Immediate</option>
        <option value="digest">Digest Summary</option>
        <option value="off">Don&apos;t Notify</option>
      </select>
    </div>
  )
}

function FrequencySelect({
  label,
  value,
  onChange,
}: {
  label: string
  value: Frequency
  onChange: (v: Frequency) => void
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as Frequency)}
        className="input-base w-full"
      >
        <option value="immediate">Immediate</option>
        <option value="digest">Digest Summary</option>
        <option value="off">Don&apos;t Notify</option>
      </select>
    </div>
  )
}
