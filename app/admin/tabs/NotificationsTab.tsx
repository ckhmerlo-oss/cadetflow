'use client'

import { createClient } from '@/utils/supabase/client'
import { useState, useEffect } from 'react'
import {
  triggerGreenSheetBlast,
  triggerTourSheetAlert,
  triggerActionItemAlert,
  sendTestEmail,
  processEmailQueue,
  retryFailedEmailQueue,
  getEmailDeliveryLog,
  type DeliveryLogEntry,
  type ActionResponse,
} from '@/app/lib/server'

const SendIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.126A59.768 59.768 0 0 1 21.485 12 59.77 59.77 0 0 1 3.27 20.876L5.999 12Zm0 0h7.5" /></svg>)

type Setting = { key: string; value: boolean; description: string }

const TOGGLE_EXCLUDED_KEYS = new Set([
  'green_sheet_schedule_time',
  'email_development_forward_to',
])

export default function NotificationsTab() {
  const supabase = createClient()
  const [settings, setSettings] = useState<Setting[]>([])
  const [scheduleTime, setScheduleTime] = useState('06:00')
  const [devForwardTo, setDevForwardTo] = useState('')
  const [loading, setLoading] = useState(true)

  const [sendingGreen, setSendingGreen] = useState(false)
  const [sendingTour, setSendingTour] = useState(false)
  const [sendingActions, setSendingActions] = useState(false)
  const [processingQueue, setProcessingQueue] = useState(false)
  const [retryingQueue, setRetryingQueue] = useState(false)
  const [lastQueueResult, setLastQueueResult] = useState<ActionResponse | null>(null)

  const [testRecipients, setTestRecipients] = useState('')
  const [testSubject, setTestSubject] = useState('')
  const [testBody, setTestBody] = useState('')
  const [sendingTest, setSendingTest] = useState(false)

  const [deliveryLog, setDeliveryLog] = useState<DeliveryLogEntry[]>([])

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    setLoading(true)
    const [sets, timeRes, forwardRes, log] = await Promise.all([
      supabase.from('system_settings').select('*').order('key'),
      supabase.from('system_settings').select('description').eq('key', 'green_sheet_schedule_time').single(),
      supabase.from('system_settings').select('description').eq('key', 'email_development_forward_to').single(),
      getEmailDeliveryLog(),
    ])
    if (sets.data) setSettings(sets.data)
    if (timeRes.data?.description) setScheduleTime(timeRes.data.description)
    if (forwardRes.data?.description) setDevForwardTo(forwardRes.data.description)
    setDeliveryLog(log)
    setLoading(false)
  }

  const toggleSetting = async (key: string, currentValue: boolean) => {
    const { error } = await supabase.from('system_settings').update({ value: !currentValue }).eq('key', key)
    if (!error) {
      setSettings((prev) => prev.map((s) => (s.key === key ? { ...s, value: !currentValue } : s)))
    }
  }

  const saveDevForwardTo = async () => {
    if (devForwardTo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(devForwardTo)) {
      alert('Please enter a valid email address.')
      return
    }
    await supabase.from('system_settings').upsert({
      key: 'email_development_forward_to',
      description: devForwardTo,
      value: false,
    })
    alert('Development forward address saved.')
  }

  const handleProcessQueue = async () => {
    setProcessingQueue(true)
    const res = await processEmailQueue()
    setProcessingQueue(false)
    setLastQueueResult(res)
    if (res?.success) {
      const log = await getEmailDeliveryLog()
      setDeliveryLog(log)
    }
  }

  const handleRetryFailed = async () => {
    if (!confirm('Reset failed/dead-letter queue items back to pending?')) return
    setRetryingQueue(true)
    const res = await retryFailedEmailQueue()
    setRetryingQueue(false)
    setLastQueueResult(res)
    if (res?.success) {
      const log = await getEmailDeliveryLog()
      setDeliveryLog(log)
    }
  }

  const handleManualGreen = async () => { if (!confirm('Email ALL Faculty/Staff?')) return; setSendingGreen(true); const res = await triggerGreenSheetBlast(); setSendingGreen(false); alert(res?.success ? 'Sent.' : `Failed: ${res?.error}`) }
  const handleManualTour = async () => { if (!confirm('Email Tour Sheet cadets?')) return; setSendingTour(true); const res = await triggerTourSheetAlert(); setSendingTour(false); alert(res?.success ? `Sent ${res.sent}.` : `Failed: ${res?.error}`) }
  const handleManualActions = async () => { if (!confirm('Email Action Item reminders?')) return; setSendingActions(true); const res = await triggerActionItemAlert(); setSendingActions(false); alert(res?.success ? `Sent ${res.sent}.` : `Failed: ${res?.error}`) }

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!testRecipients || !testSubject || !testBody) return
    setSendingTest(true)
    const res = await sendTestEmail(testRecipients, testSubject, testBody)
    setSendingTest(false)
    alert(res?.success ? 'Sent.' : `Failed: ${res?.error}`)
  }

  const saveSchedule = async () => {
    await supabase.from('system_settings').upsert({ key: 'green_sheet_schedule_time', description: scheduleTime, value: true })
    alert('Schedule updated.')
  }

  if (loading) return <div className="p-8 text-muted-foreground">Loading...</div>

  const sectionClass = 'card-base p-6'
  const inputClass = 'input-base'
  const devModeEnabled = settings.find((s) => s.key === 'email_development_mode')?.value === true

  return (
    <div className="space-y-8 animate-in fade-in duration-300">

      {/* DEVELOPMENT MODE */}
      <section className={`${sectionClass} ${devModeEnabled ? 'border-2 border-amber-500/50' : ''}`}>
        <h2 className="text-xl font-bold text-foreground mb-2">Development Mode</h2>
        <p className="text-sm text-muted-foreground mb-4">
          When enabled, all outbound emails redirect to the address below. No production recipients receive mail.
        </p>

        {devModeEnabled && (
          <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-800 dark:text-amber-200 text-sm">
            Development Mode is active. All emails redirect to{' '}
            <strong>{devForwardTo || '(not configured — sends will fail)'}</strong>.
          </div>
        )}

        <div className="space-y-4">
          {settings.filter((s) => s.key === 'email_development_mode').map((s) => (
            <div key={s.key} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div>
                <p className="font-medium text-foreground">Enable Development Mode</p>
                <p className="text-sm text-muted-foreground">{s.description}</p>
              </div>
              <button
                onClick={() => toggleSetting(s.key, s.value)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${s.value ? 'bg-amber-500' : 'bg-muted-foreground/30'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${s.value ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          ))}

          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-foreground mb-1">Forward all emails to</label>
              <input
                type="email"
                value={devForwardTo}
                onChange={(e) => setDevForwardTo(e.target.value)}
                placeholder="developer@example.com"
                className={inputClass}
              />
            </div>
            <button onClick={saveDevForwardTo} className="btn-primary bg-muted-foreground hover:bg-muted-foreground/80">
              Save Address
            </button>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleProcessQueue}
              disabled={processingQueue || retryingQueue}
              className="btn-primary w-full md:w-auto"
            >
              {processingQueue ? 'Processing...' : 'Process Email Queue Now'}
            </button>
            <button
              onClick={handleRetryFailed}
              disabled={processingQueue || retryingQueue}
              className="btn-primary w-full md:w-auto bg-muted-foreground hover:bg-muted-foreground/80"
            >
              {retryingQueue ? 'Retrying...' : 'Retry Failed Queue Items'}
            </button>
          </div>

          {lastQueueResult && (
            <div className={`mt-4 p-4 rounded-lg border text-sm ${
              lastQueueResult.success && (lastQueueResult.failed ?? 0) === 0
                ? 'bg-green-500/10 border-green-500/30 text-green-800 dark:text-green-200'
                : lastQueueResult.success
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-100'
                  : 'bg-red-500/10 border-red-500/30 text-red-800 dark:text-red-200'
            }`}>
              <p className="font-medium">
                {lastQueueResult.success
                  ? lastQueueResult.message
                  : `Queue action failed: ${lastQueueResult.error}`}
              </p>
              {lastQueueResult.failures && lastQueueResult.failures.length > 0 && (
                <ul className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                  {lastQueueResult.failures.map((f) => (
                    <li key={f.queueId} className="text-xs border-t border-current/10 pt-2 first:border-0 first:pt-0">
                      <div className="font-medium truncate">{f.subject}</div>
                      <div className="opacity-80">
                        {f.profileName}
                        {f.intendedEmail ? ` · ${f.intendedEmail}` : ''}
                      </div>
                      <div className="opacity-90 mt-0.5">{f.error}</div>
                    </li>
                  ))}
                </ul>
              )}
              {lastQueueResult.success && (lastQueueResult.failed ?? 0) > 0 && (
                <p className="mt-2 text-xs opacity-80">
                  Fix the issue above, click &quot;Retry Failed Queue Items&quot;, then process again.
                  Non-retriable errors (e.g. missing API key) go straight to dead-letter.
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* GLOBAL CONFIGURATION */}
      <section className={sectionClass}>
        <h2 className="text-xl font-bold text-foreground mb-4">Notification Channels</h2>
        <div className="space-y-4">
          {settings.filter((s) => !TOGGLE_EXCLUDED_KEYS.has(s.key) && s.key !== 'email_development_mode').map((s) => (
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

      {/* MANUAL TRIGGERS */}
      <section className={sectionClass}>
        <h2 className="text-xl font-bold text-foreground mb-6">Manual Broadcasts</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-border rounded-lg bg-muted/10">
            <h3 className="font-bold text-foreground mb-2">Daily Green Sheet</h3>
            <p className="text-xs text-muted-foreground mb-4">Sends the daily summary to all Faculty/Staff.</p>
            <button onClick={handleManualGreen} disabled={sendingGreen} className="btn-primary w-full">
              {sendingGreen ? 'Sending...' : 'Send to Faculty'}
            </button>
          </div>
          <div className="p-4 border border-border rounded-lg bg-muted/10">
            <h3 className="font-bold text-foreground mb-2">Tour Sheet Alerts</h3>
            <p className="text-xs text-muted-foreground mb-4">Emails every cadet currently on the Tour Sheet.</p>
            <button onClick={handleManualTour} disabled={sendingTour} className="btn-primary w-full bg-orange-600 hover:bg-orange-700">
              {sendingTour ? 'Sending...' : 'Alert Debtors'}
            </button>
          </div>
          <div className="p-4 border border-border rounded-lg bg-muted/10">
            <h3 className="font-bold text-foreground mb-2">Action Item Reminders</h3>
            <p className="text-xs text-muted-foreground mb-4">Nudges anyone with pending approvals or revisions.</p>
            <button onClick={handleManualActions} disabled={sendingActions} className="btn-primary w-full bg-blue-600 hover:bg-blue-700">
              {sendingActions ? 'Sending...' : 'Send Reminders'}
            </button>
          </div>
        </div>
      </section>

      {/* DELIVERY LOG */}
      <section className={sectionClass}>
        <h2 className="text-xl font-bold text-foreground mb-4">Recent Email Delivery Log</h2>
        {deliveryLog.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">No delivery records yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="py-2 pr-4">Time</th>
                  <th className="py-2 pr-4">Intended</th>
                  <th className="py-2 pr-4">Actual</th>
                  <th className="py-2 pr-4">Subject</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Error</th>
                </tr>
              </thead>
              <tbody>
                {deliveryLog.map((row) => (
                  <tr key={row.id} className="border-b border-border/50">
                    <td className="py-2 pr-4 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(row.created_at).toLocaleString()}
                    </td>
                    <td className="py-2 pr-4">
                      <div className="text-xs">{row.profile_name}</div>
                      <div className="text-xs text-muted-foreground">{row.intended_email}</div>
                    </td>
                    <td className="py-2 pr-4 text-xs">{row.actual_email ?? '—'}</td>
                    <td className="py-2 pr-4 text-xs max-w-[200px] truncate">{row.subject}</td>
                    <td className="py-2 pr-4">
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        row.status === 'sent' ? 'bg-green-500/10 text-green-700' :
                        row.status === 'failed' ? 'bg-red-500/10 text-red-700' :
                        row.status === 'dead_letter' ? 'bg-red-500/20 text-red-800' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {row.status}
                        {row.delivery_mode === 'development_redirect' ? ' (dev)' : ''}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-xs text-red-600 max-w-[280px]">
                      {row.error_message ? (
                        <span title={row.error_message} className="line-clamp-3">{row.error_message}</span>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* SCHEDULE */}
      <section className={sectionClass}>
        <h2 className="text-xl font-bold text-foreground mb-4">Daily Schedule</h2>
        <div className="flex items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Send Time (UTC)</label>
            <input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} className={`w-32 ${inputClass}`} />
          </div>
          <button onClick={saveSchedule} className="btn-primary bg-muted-foreground hover:bg-muted-foreground/80">Save Schedule</button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">This controls the automatic daily Green Sheet blast.</p>
      </section>

      {/* TEST EMAILER */}
      <section className="bg-primary/5 p-6 rounded-lg border border-primary/20">
        <h2 className="text-xl font-bold text-primary mb-4">System Test</h2>
        <form onSubmit={handleSendTest} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Recipients (Comma separated)</label>
            <input type="text" value={testRecipients} onChange={(e) => setTestRecipients(e.target.value)} placeholder="admin@fuma.org, test@fuma.org" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Subject</label>
            <input type="text" value={testSubject} onChange={(e) => setTestSubject(e.target.value)} placeholder="Test Notification" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Message Body</label>
            <textarea value={testBody} onChange={(e) => setTestBody(e.target.value)} rows={3} placeholder="Hello world..." className={inputClass} />
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
