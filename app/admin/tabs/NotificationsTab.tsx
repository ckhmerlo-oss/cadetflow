'use client'

import { createClient } from '@/utils/supabase/client'
import { useState, useEffect } from 'react'
import { triggerGreenSheetBlast, triggerTourSheetAlert, triggerActionItemAlert, sendTestEmail } from '@/app/lib/server'

// Icons
const SendIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.126A59.768 59.768 0 0 1 21.485 12 59.77 59.77 0 0 1 3.27 20.876L5.999 12Zm0 0h7.5" /></svg>)

type Setting = { key: string; value: boolean; description: string }

export default function NotificationsTab() {
  const supabase = createClient()
  const [settings, setSettings] = useState<Setting[]>([])
  const [scheduleTime, setScheduleTime] = useState('06:00')
  const [loading, setLoading] = useState(true)
  
  const [sendingGreen, setSendingGreen] = useState(false)
  const [sendingTour, setSendingTour] = useState(false)
  const [sendingActions, setSendingActions] = useState(false)

  const [testRecipients, setTestRecipients] = useState('')
  const [testSubject, setTestSubject] = useState('')
  const [testBody, setTestBody] = useState('')
  const [sendingTest, setSendingTest] = useState(false)

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    setLoading(true)
    const [sets, timeRes] = await Promise.all([
        supabase.from('system_settings').select('*').order('key'),
        supabase.from('system_settings').select('description').eq('key', 'green_sheet_schedule_time').single()
    ])
    if (sets.data) setSettings(sets.data)
    if (timeRes.data?.description) setScheduleTime(timeRes.data.description)
    setLoading(false)
  }

  const toggleSetting = async (key: string, currentValue: boolean) => {
      const { error } = await supabase.from('system_settings').update({ value: !currentValue }).eq('key', key)
      if (!error) {
          setSettings(prev => prev.map(s => s.key === key ? { ...s, value: !currentValue } : s))
      }
  }

  const handleManualGreen = async () => { if(!confirm("Email ALL Faculty/Staff?")) return; setSendingGreen(true); const res = await triggerGreenSheetBlast(); setSendingGreen(false); alert(res?.success ? "Sent." : `Failed: ${res?.error}`) }
  const handleManualTour = async () => { if(!confirm("Email Tour Sheet cadets?")) return; setSendingTour(true); const res = await triggerTourSheetAlert(); setSendingTour(false); alert(res?.success ? `Sent ${res.sent}.` : `Failed: ${res?.error}`) }
  const handleManualActions = async () => { if(!confirm("Email Action Item reminders?")) return; setSendingActions(true); const res = await triggerActionItemAlert(); setSendingActions(false); alert(res?.success ? `Sent ${res.sent}.` : `Failed: ${res?.error}`) }
  
  const handleSendTest = async (e: React.FormEvent) => {
      e.preventDefault(); if (!testRecipients || !testSubject || !testBody) return; setSendingTest(true);
      const res = await sendTestEmail(testRecipients, testSubject, testBody); setSendingTest(false);
      alert(res?.success ? "Sent." : `Failed: ${res?.error}`)
  }

  const saveSchedule = async () => { await supabase.from('system_settings').upsert({ key: 'green_sheet_schedule_time', description: scheduleTime, value: true }); alert("Schedule updated.") }

  if (loading) return <div className="p-8 text-muted-foreground">Loading...</div>

  // Styles
  const sectionClass = "card-base p-6";
  const inputClass = "input-base";

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. GLOBAL CONFIGURATION */}
      <section className={sectionClass}>
          <h2 className="text-xl font-bold text-foreground mb-4">Notification Channels</h2>
          <div className="space-y-4">
              {settings.filter(s => s.key !== 'green_sheet_schedule_time').map(s => (
                  <div key={s.key} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div>
                          <p className="font-medium text-foreground">{s.key.replace(/_/g, ' ').replace('enable ', '').toUpperCase()}</p>
                          <p className="text-sm text-muted-foreground">{s.description}</p>
                      </div>
                      <button 
                        onClick={() => toggleSetting(s.key, s.value)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${s.value ? 'bg-green-500' : 'bg-muted-foreground/30'}`}
                      >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${s.value ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                  </div>
              ))}
          </div>
      </section>

      {/* 2. MANUAL TRIGGERS */}
      <section className={sectionClass}>
          <h2 className="text-xl font-bold text-foreground mb-6">Manual Broadcasts</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Green Sheet Card */}
              <div className="p-4 border border-border rounded-lg bg-muted/10">
                  <h3 className="font-bold text-foreground mb-2">Daily Green Sheet</h3>
                  <p className="text-xs text-muted-foreground mb-4">Sends the daily summary to all Faculty/Staff.</p>
                  <button onClick={handleManualGreen} disabled={sendingGreen} className="btn-primary w-full">
                      {sendingGreen ? 'Sending...' : 'Send to Faculty'}
                  </button>
              </div>

              {/* Tour Sheet Card */}
              <div className="p-4 border border-border rounded-lg bg-muted/10">
                  <h3 className="font-bold text-foreground mb-2">Tour Sheet Alerts</h3>
                  <p className="text-xs text-muted-foreground mb-4">Emails every cadet currently on the Tour Sheet.</p>
                  <button onClick={handleManualTour} disabled={sendingTour} className="btn-primary w-full bg-orange-600 hover:bg-orange-700">
                      {sendingTour ? 'Sending...' : 'Alert Debtors'}
                  </button>
              </div>

              {/* Action Items Card */}
              <div className="p-4 border border-border rounded-lg bg-muted/10">
                  <h3 className="font-bold text-foreground mb-2">Action Item Reminders</h3>
                  <p className="text-xs text-muted-foreground mb-4">Nudges anyone with pending approvals or revisions.</p>
                  <button onClick={handleManualActions} disabled={sendingActions} className="btn-primary w-full bg-blue-600 hover:bg-blue-700">
                      {sendingActions ? 'Sending...' : 'Send Reminders'}
                  </button>
              </div>
          </div>
      </section>
      
      {/* 3. SCHEDULE */}
      <section className={sectionClass}>
          <h2 className="text-xl font-bold text-foreground mb-4">Daily Schedule</h2>
          <div className="flex items-end gap-4">
              <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Send Time (UTC)</label>
                  <input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} className={`w-32 ${inputClass}`} />
              </div>
              <button onClick={saveSchedule} className="btn-primary bg-muted-foreground hover:bg-muted-foreground/80">Save Schedule</button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">This controls the automatic daily Green Sheet blast.</p>
      </section>

      {/* 4. TEST EMAILER */}
      <section className="bg-primary/5 p-6 rounded-lg border border-primary/20">
          <h2 className="text-xl font-bold text-primary mb-4">System Test</h2>
          <form onSubmit={handleSendTest} className="space-y-4">
              <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Recipients (Comma separated)</label>
                  <input type="text" value={testRecipients} onChange={e => setTestRecipients(e.target.value)} placeholder="admin@fuma.org, test@fuma.org" className={inputClass} />
              </div>
              <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Subject</label>
                  <input type="text" value={testSubject} onChange={e => setTestSubject(e.target.value)} placeholder="Test Notification" className={inputClass} />
              </div>
              <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Message Body</label>
                  <textarea value={testBody} onChange={e => setTestBody(e.target.value)} rows={3} placeholder="Hello world..." className={inputClass} />
              </div>
              <div className="flex justify-end">
                  <button type="submit" disabled={sendingTest} className="btn-primary">
                      <SendIcon /> <span className="ml-2">{sendingTest ? 'Sending...' : 'Send Test Email'}</span>
                  </button>
              </div>
          </form>
      </section>

    </div>
  )
}