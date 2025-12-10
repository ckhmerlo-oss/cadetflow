'use client'

import { createClient } from '@/utils/supabase/client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type Frequency = 'immediate' | 'digest' | 'off'

type Preferences = {
  email_new_report: Frequency
  email_status_change: Frequency
  email_tour_reminder: boolean
  email_green_sheet: boolean
  email_team_alert: Frequency // Global toggle for team alerts
  digest_frequency: 'daily' | 'hourly' | '30min'
  digest_time: string
}

type CoachedSport = {
    id: string // primary key of sport_coaches table
    sport_name: string
    season: string
    enable_alerts: boolean
}

export default function PreferencesPage() {
  const supabase = createClient()
  const router = useRouter()
  
  const [prefs, setPrefs] = useState<Preferences | null>(null)
  const [coachedSports, setCoachedSports] = useState<CoachedSport[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')
      
      // 1. Fetch User Prefs
      const { data: prefData } = await supabase.rpc('get_or_create_preferences', { p_user_id: user.id })
      if (prefData && prefData.length > 0) setPrefs(prefData[0])

      // 2. Fetch Coached Sports
      const { data: sportsData } = await supabase
        .from('sport_coaches')
        .select('id, enable_alerts, sport:sports(name, season)')
        .eq('coach_id', user.id)
      
      if (sportsData) {
          setCoachedSports(sportsData.map((s: any) => ({
              id: s.id,
              sport_name: s.sport.name,
              season: s.sport.season,
              enable_alerts: s.enable_alerts
          })))
      }
      setLoading(false)
    }
    load()
  }, [supabase, router])

  const handleSave = async () => {
      if (!prefs) return
      setSaving(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      // 1. Update Global Prefs
      const { error: prefError } = await supabase
        .from('user_preferences')
        .update(prefs)
        .eq('user_id', user?.id)
      
      // 2. Update Sport Specifics
      for (const s of coachedSports) {
          await supabase
            .from('sport_coaches')
            .update({ enable_alerts: s.enable_alerts })
            .eq('id', s.id)
      }
      
      setSaving(false)
      if (prefError) alert("Failed to save.")
      else alert("Preferences updated!")
  }

  // Generate 30-min interval times for dropdown
  const timeOptions = []
  for (let i = 0; i < 24; i++) {
      const h = i.toString().padStart(2, '0')
      timeOptions.push(`${h}:00`, `${h}:30`)
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Loading settings...</div>
  if (!prefs) return <div className="p-8 text-center text-red-500">Error loading preferences.</div>

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Notification Settings</h1>
      <p className="text-gray-500 mb-8">Control what emails you receive and when.</p>

      <div className="space-y-8">
        
        {/* --- SECTION 1: GLOBAL SETTINGS --- */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border dark:border-gray-700 space-y-6">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 border-b pb-2 dark:border-gray-700">General Alerts</h2>
            
            <SettingRow 
                title="New Reports" 
                desc="When a report is filed against you or requires your approval."
                value={prefs.email_new_report}
                onChange={(v) => setPrefs({...prefs, email_new_report: v as Frequency})}
            />
            <SettingRow 
                title="Status Updates" 
                desc="When a report you submitted is approved, rejected, or returned."
                value={prefs.email_status_change}
                onChange={(v) => setPrefs({...prefs, email_status_change: v as Frequency})}
            />
             <SettingRow 
                title="Sports Team Alerts" 
                desc="Global toggle for alerts regarding your athletes."
                value={prefs.email_team_alert}
                onChange={(v) => setPrefs({...prefs, email_team_alert: v as Frequency})}
            />
        </div>

        {/* --- SECTION 2: DIGEST SCHEDULE --- */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border dark:border-gray-700 space-y-6">
             <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 border-b pb-2 dark:border-gray-700">Digest Schedule</h2>
             <p className="text-sm text-gray-500 -mt-4">
                 If you selected "Daily Digest" for any category above, this controls when you receive that email.
             </p>

             <div className="flex gap-4">
                <div className="w-1/2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Frequency</label>
                    <select 
                        value={prefs.digest_frequency}
                        onChange={(e) => setPrefs({ ...prefs, digest_frequency: e.target.value as any })}
                        className="block w-full rounded-md border-gray-300 dark:bg-gray-900 dark:border-gray-600 p-2"
                    >
                        <option value="daily">Daily</option>
                        <option value="hourly">Hourly</option>
                        <option value="30min">Every 30 Minutes</option>
                    </select>
                </div>
                
                {prefs.digest_frequency === 'daily' && (
                    <div className="w-1/2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Delivery Time (UTC)</label>
                        <select 
                            value={prefs.digest_time}
                            onChange={(e) => setPrefs({ ...prefs, digest_time: e.target.value })}
                            className="block w-full rounded-md border-gray-300 dark:bg-gray-900 dark:border-gray-600 p-2"
                        >
                            {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                )}
             </div>
        </div>

        {/* --- SECTION 3: COACHING ALERTS --- */}
        {coachedSports.length > 0 && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border dark:border-gray-700 space-y-4">
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 border-b pb-2 dark:border-gray-700">Coaching Alerts</h2>
                <p className="text-sm text-gray-500 -mt-2">Enable alerts for specific teams you coach.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {coachedSports.map((sport, idx) => (
                        <div key={sport.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border dark:border-gray-600">
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white">{sport.sport_name}</h4>
                                <span className="text-xs uppercase text-gray-500">{sport.season}</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={sport.enable_alerts} 
                                    onChange={e => {
                                        const newSports = [...coachedSports]
                                        newSports[idx].enable_alerts = e.target.checked
                                        setCoachedSports(newSports)
                                    }} 
                                    className="sr-only peer" 
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                            </label>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* --- SAVE BAR --- */}
        <div className="flex justify-end pt-4">
            <button onClick={handleSave} disabled={saving} className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50 shadow-md transition-transform hover:scale-105">
                {saving ? 'Saving...' : 'Save All Preferences'}
            </button>
        </div>

      </div>
    </div>
  )
}

function SettingRow({ title, desc, value, onChange }: { title: string, desc: string, value: Frequency, onChange: (v: string) => void }) {
    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div className="mb-2 sm:mb-0 max-w-md">
                <h3 className="font-medium text-gray-900 dark:text-white">{title}</h3>
                <p className="text-xs text-gray-500">{desc}</p>
            </div>
            <select 
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="rounded-md border-gray-300 dark:bg-gray-900 dark:border-gray-600 text-sm p-2 w-full sm:w-auto"
            >
                <option value="immediate">Immediate Email</option>
                <option value="digest">Digest Summary</option>
                <option value="off">Don't Notify</option>
            </select>
        </div>
    )
}