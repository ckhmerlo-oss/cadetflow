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
}

export default function PreferencesPage() {
  const supabase = createClient()
  const router = useRouter()
  
  const [prefs, setPrefs] = useState<Preferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')
      
      // Fetch or Init
      const { data, error } = await supabase.rpc('get_or_create_preferences', { p_user_id: user.id })
      
      if (data && data.length > 0) {
          setPrefs(data[0])
      } else {
          console.error(error)
      }
      setLoading(false)
    }
    load()
  }, [supabase, router])

  const handleSave = async () => {
      if (!prefs) return
      setSaving(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      const { error } = await supabase
        .from('user_preferences')
        .update(prefs)
        .eq('user_id', user?.id)
      
      setSaving(false)
      if (error) alert("Failed to save.")
      else alert("Preferences updated!")
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Loading settings...</div>
  if (!prefs) return <div className="p-8 text-center text-red-500">Error loading preferences.</div>

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Notification Settings</h1>
      <p className="text-gray-500 mb-8">Control what emails you receive and when.</p>

      <div className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow border dark:border-gray-700">
        
        {/* 1. New Reports */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b dark:border-gray-700">
            <div className="mb-2 sm:mb-0">
                <h3 className="font-medium text-gray-900 dark:text-white">New Reports</h3>
                <p className="text-xs text-gray-500">When a report is filed against you or waiting for your approval.</p>
            </div>
            <select 
                value={prefs.email_new_report}
                onChange={(e) => setPrefs({ ...prefs, email_new_report: e.target.value as Frequency })}
                className="rounded-md border-gray-300 dark:bg-gray-900 dark:border-gray-600 text-sm p-2"
            >
                <option value="immediate">Immediately</option>
                <option value="digest">Daily Digest</option>
                <option value="off">Off</option>
            </select>
        </div>

        {/* 2. Status Changes */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b dark:border-gray-700">
            <div className="mb-2 sm:mb-0">
                <h3 className="font-medium text-gray-900 dark:text-white">Status Updates</h3>
                <p className="text-xs text-gray-500">When a report you submitted/approved is Approved, Rejected, or Returned.</p>
            </div>
            <select 
                value={prefs.email_status_change}
                onChange={(e) => setPrefs({ ...prefs, email_status_change: e.target.value as Frequency })}
                className="rounded-md border-gray-300 dark:bg-gray-900 dark:border-gray-600 text-sm p-2"
            >
                <option value="immediate">Immediately</option>
                <option value="digest">Daily Digest</option>
                <option value="off">Off</option>
            </select>
        </div>

        {/* 3. Green Sheet */}
        <div className="flex items-center justify-between pb-4 border-b dark:border-gray-700">
            <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Daily Green/Tour Sheet</h3>
                <p className="text-xs text-gray-500">Receive the daily disciplinary summary (if eligible).</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={prefs.email_green_sheet} onChange={e => setPrefs({...prefs, email_green_sheet: e.target.checked})} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
            </label>
        </div>

        {/* 4. Tour Reminders */}
        <div className="flex items-center justify-between">
            <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Tour Balance Alerts</h3>
                <p className="text-xs text-gray-500">Daily reminder if you are currently on the Tour Sheet.</p>
            </div>
             <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={prefs.email_tour_reminder} onChange={e => setPrefs({...prefs, email_tour_reminder: e.target.checked})} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
            </label>
        </div>

        <div className="pt-4 flex justify-end">
            <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Preferences'}
            </button>
        </div>
      </div>
    </div>
  )
}