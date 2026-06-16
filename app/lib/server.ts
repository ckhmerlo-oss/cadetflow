'use server'

import { createClient } from '@/utils/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import {
  alertEmail,
  greenSheetEmail,
  testEmail,
  type IntendedRecipient,
} from './emailTemplates'

export type EmailQueueFailure = {
  queueId: string
  subject: string
  intendedEmail: string | null
  profileName: string
  error: string
  stage?: string
  errorCode?: string
  httpStatus?: number
  retriable?: boolean
}

export type ActionResponse = {
  success: boolean
  message?: string
  error?: string
  sent?: number
  processed?: number
  failed?: number
  retried?: number
  failures?: EmailQueueFailure[]
}

type EmailType = 'greensheet' | 'alert' | 'summary' | 'test'

interface EmailPayload {
  recipients: string[]
  subject: string
  htmlContent: string
  idempotencyKey?: string
  intendedRecipient?: IntendedRecipient
}

const getAdmin = () => createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function isUserArchived(userId: string): Promise<boolean> {
  const admin = getAdmin()
  const { data } = await admin
    .from('profiles')
    .select('archived')
    .eq('id', userId)
    .single()
  return data?.archived === true
}

export async function dispatchEmail(type: EmailType, payload: EmailPayload): Promise<ActionResponse> {
  const supabase = createClient()

  let settingKey = ''
  if (type === 'greensheet') settingKey = 'enable_email_blasts'
  if (type === 'alert') settingKey = 'enable_alert_ed'

  if (settingKey) {
    const { data: setting } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', settingKey)
      .single()
    if (setting && setting.value === false) {
      return { success: false, error: 'Disabled globally in settings' }
    }
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {
    return { success: false, error: 'Missing SUPABASE_SERVICE_ROLE_KEY' }
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({ type, ...payload }),
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok || !data.success) {
      const detail = [data.error, data.stage && `stage=${data.stage}`, data.errorCode && `code=${data.errorCode}`]
        .filter(Boolean)
        .join(' · ')
      return { success: false, error: detail || `Email dispatch failed (${response.status})` }
    }

    return { success: true, sent: data.sentCount ?? payload.recipients.length }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { success: false, error: message }
  }
}

async function filterRecipientsByPreference(userIds: string[], category: string): Promise<string[]> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('filter_users_by_email_preference', {
    p_user_ids: userIds,
    p_category: category,
  })
  if (error || !data) return []
  return data as string[]
}

async function sendToUsers(
  userIds: string[],
  buildEmail: (userId: string, email: string, profileName: string) => EmailPayload
): Promise<{ sent: number; lastError: string | null }> {
  const admin = getAdmin()
  const { data: users } = await admin.auth.admin.listUsers()
  const { data: profiles } = await admin
    .from('profiles')
    .select('id, first_name, last_name, archived')
    .in('id', userIds)

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]))
  let sentCount = 0
  let lastError: string | null = null

  for (const userId of userIds) {
    const profile = profileMap.get(userId)
    if (profile?.archived) continue

    const user = users.users.find((u) => u.id === userId)
    if (!user?.email) continue

    const profileName = `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim() || 'Unknown'
    const payload = buildEmail(userId, user.email, profileName)
    const res = await dispatchEmail('alert', payload)
    if (res.success) sentCount++
    else lastError = res.error ?? null
  }

  return { sent: sentCount, lastError }
}

export async function sendTestEmail(recipientsStr: string, subject: string, body: string): Promise<ActionResponse> {
  const recipients = recipientsStr.split(',').map((e) => e.trim()).filter((e) => e.length > 0 && e.includes('@'))
  if (recipients.length === 0) return { success: false, error: 'No valid email addresses found.' }
  if (!subject) return { success: false, error: 'Subject is required.' }

  return dispatchEmail('test', {
    recipients,
    subject: `[TEST] ${subject}`,
    htmlContent: testEmail(body),
    idempotencyKey: `test:${Date.now()}:${subject}`,
    intendedRecipient: { email: recipients[0], profileName: 'Test Recipient' },
  })
}

export async function triggerGreenSheetBlast(): Promise<ActionResponse> {
  const supabase = createClient()
  const admin = getAdmin()

  const { data: html, error: htmlError } = await supabase.rpc('generate_daily_email_html')
  if (htmlError || !html) return { success: false, error: 'Failed to generate report HTML' }

  const { data: facultyIds, error: facultyError } = await supabase.rpc('get_faculty_user_ids')
  if (facultyError || !facultyIds || facultyIds.length === 0) return { success: false, error: 'No faculty found' }

  const candidateIds = facultyIds.map((f: { id: string }) => f.id)
  const authorizedIds = await filterRecipientsByPreference(candidateIds, 'green_sheet')
  if (authorizedIds.length === 0) return { success: true, message: 'No faculty have opted in.' }

  const { data: users } = await admin.auth.admin.listUsers()
  const recipients = users.users
    .filter((u) => authorizedIds.includes(u.id))
    .map((u) => u.email!)
    .filter(Boolean)

  if (recipients.length === 0) return { success: false, error: 'No valid emails found for authorized faculty.' }

  const res = await dispatchEmail('greensheet', {
    recipients,
    subject: `Daily Report - ${new Date().toLocaleDateString()}`,
    htmlContent: greenSheetEmail(html),
    idempotencyKey: `greensheet:${new Date().toISOString().slice(0, 10)}`,
    intendedRecipient: {
      email: recipients[0],
      profileName: `Faculty blast (${recipients.length} recipients)`,
    },
  })

  if (!res.success) return res
  return { success: true, sent: res.sent ?? recipients.length, message: `Sent to ${res.sent ?? recipients.length} faculty.` }
}

export async function triggerTourSheetAlert(): Promise<ActionResponse> {
  const supabase = createClient()
  const { data: debtors, error: dbError } = await supabase.rpc('get_tour_sheet_debtors')
  if (dbError) return { success: false, error: dbError.message }
  if (!debtors || debtors.length === 0) return { success: true, message: 'No one on the tour sheet.' }

  const debtorIds = debtors.map((d: { id: string }) => d.id)
  const authorizedIds = await filterRecipientsByPreference(debtorIds, 'tour_change')

  const { sent, lastError } = await sendToUsers(authorizedIds, (userId, email, profileName) => {
    const debtor = debtors.find((d: { id: string }) => d.id === userId)
    return {
      recipients: [email],
      subject: 'Action Required: You are on the Tour Sheet',
      htmlContent: alertEmail({
        subject: 'Tour Sheet Notification',
        message: `You currently have a balance of ${debtor?.balance ?? 0} Tours. You are required to march until this balance is cleared.`,
        siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
      }),
      idempotencyKey: `tour-alert:${userId}:${new Date().toISOString().slice(0, 10)}`,
      intendedRecipient: { email, userId, profileName },
    }
  })

  if (sent === 0 && authorizedIds.length > 0 && lastError) {
    return { success: false, error: lastError }
  }
  return { success: true, sent }
}

export async function triggerActionItemAlert(): Promise<ActionResponse> {
  const supabase = createClient()
  const admin = getAdmin()

  const { data: activeUsers, error: dbError } = await supabase.rpc('get_users_with_pending_actions')
  if (dbError) return { success: false, error: dbError.message }
  if (!activeUsers || activeUsers.length === 0) return { success: true, message: 'No pending actions.' }

  const { data: users } = await admin.auth.admin.listUsers()
  let sentCount = 0
  let lastError: string | null = null

  for (const record of activeUsers) {
    if (await isUserArchived(record.user_id)) continue

    const { data: prefs } = await supabase
      .from('user_preferences')
      .select('email_new_report, email_status_change')
      .eq('user_id', record.user_id)
      .single()

    if (!prefs || (prefs.email_new_report === 'off' && prefs.email_status_change === 'off')) {
      continue
    }

    const user = users.users.find((u) => u.id === record.user_id)
    if (!user?.email) continue

    const { data: profile } = await admin
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', record.user_id)
      .single()

    const items = []
    if (record.approval_count > 0) items.push(`${record.approval_count} reports to approve`)
    if (record.revision_count > 0) items.push(`${record.revision_count} reports returned for revision`)
    if (record.appeal_count > 0) items.push(`${record.appeal_count} appeal updates`)

    const profileName = `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim() || 'Unknown'
    const res = await dispatchEmail('alert', {
      recipients: [user.email],
      subject: `CadetFlow: You have ${record.approval_count + record.revision_count + record.appeal_count} Action Items`,
      htmlContent: alertEmail({
        subject: 'Action Required',
        message: `You have pending items in your CadetFlow dashboard:\n• ${items.join('\n• ')}`,
        linkUrl: process.env.NEXT_PUBLIC_SITE_URL,
        siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
      }),
      idempotencyKey: `action-items:${record.user_id}:${new Date().toISOString().slice(0, 10)}`,
      intendedRecipient: { email: user.email, userId: record.user_id, profileName },
    })

    if (res.success) sentCount++
    else lastError = res.error ?? null
  }

  if (sentCount === 0 && lastError) return { success: false, error: lastError }
  return { success: true, sent: sentCount }
}

export async function processEmailQueue(): Promise<ActionResponse> {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) return { success: false, error: 'Missing SUPABASE_SERVICE_ROLE_KEY' }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/process-email-queue`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${serviceKey}`,
        },
        body: JSON.stringify({}),
      }
    )

    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      return { success: false, error: data.error ?? `Queue processing failed (${response.status})` }
    }

    return {
      success: true,
      processed: data.processed ?? 0,
      sent: data.sent ?? 0,
      failed: data.failed ?? 0,
      failures: data.failures ?? [],
      message: `Processed ${data.processed ?? 0}, sent ${data.sent ?? 0}, failed ${data.failed ?? 0}`,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { success: false, error: message }
  }
}

export async function retryFailedEmailQueue(limit = 100): Promise<ActionResponse> {
  const admin = getAdmin()
  const { data, error } = await admin.rpc('retry_failed_email_notifications', { p_limit: limit })

  if (error) {
    return { success: false, error: error.message }
  }

  const retried = typeof data === 'number' ? data : 0
  return {
    success: true,
    retried,
    message: retried === 0
      ? 'No failed queue items to retry.'
      : `Reset ${retried} failed item${retried === 1 ? '' : 's'} to pending.`,
  }
}

export type DeliveryLogEntry = {
  id: string
  intended_email: string | null
  actual_email: string | null
  profile_name: string | null
  subject: string | null
  status: string
  error_message: string | null
  delivery_mode: string | null
  created_at: string
}

export async function getEmailDeliveryLog(): Promise<DeliveryLogEntry[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('email_delivery_log')
    .select('id, intended_email, actual_email, profile_name, subject, status, error_message, delivery_mode, created_at')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('getEmailDeliveryLog:', error.message)
    return []
  }
  return (data ?? []) as DeliveryLogEntry[]
}
