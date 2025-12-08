'use server'

import { createClient } from '@/utils/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

// --- 1. SHARED TYPE DEFINITION ---
export type ActionResponse = {
  success: boolean
  message?: string
  error?: string
  sent?: number
}

type EmailType = 'greensheet' | 'alert' | 'summary' | 'test'

interface EmailPayload {
  recipients: string[];
  subject: string;
  htmlContent: string;
}

const getAdmin = () => createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// --- CORE DISPATCHER ---
export async function dispatchEmail(type: EmailType, payload: EmailPayload): Promise<ActionResponse> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  // 1. Check Settings
  let settingKey = ''
  if (type === 'greensheet') settingKey = 'enable_email_blasts'
  if (type === 'alert') settingKey = 'enable_alert_ed' // General bucket for alerts
  
  if (settingKey) {
      const { data: setting } = await supabase.from('system_settings').select('value').eq('key', settingKey).single()
      if (setting && setting.value === false) {
          console.log(`🚫 Email blocked by setting: ${settingKey}`)
          return { success: false, error: 'Disabled globally in settings' }
      }
  }

  // 2. Send via Edge Function
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ type, ...payload })
    })

    if (!response.ok) {
        const err = await response.text()
        console.error("Email Dispatch Failed:", err)
        return { success: false, error: err }
    }

    return { success: true }
  } catch (err: any) {
      return { success: false, error: err.message }
  }
}

// --- HELPER: Filter IDs by Preference ---
async function filterRecipientsByPreference(userIds: string[], preferenceCol: string) {
    const supabase = createClient()
    const { data: validPreferences } = await supabase
        .from('user_preferences')
        .select('user_id')
        .in('user_id', userIds)
        .eq(preferenceCol, true)

    if (!validPreferences) return [];
    return validPreferences.map(p => p.user_id);
}

// --- TEST EMAIL ACTION ---
export async function sendTestEmail(recipientsStr: string, subject: string, body: string): Promise<ActionResponse> {
    const recipients = recipientsStr.split(',').map(e => e.trim()).filter(e => e.length > 0 && e.includes('@'));
    
    if (recipients.length === 0) return { success: false, error: "No valid email addresses found." }
    if (!subject) return { success: false, error: "Subject is required." }

    return dispatchEmail('test', {
        recipients,
        subject: `[TEST] ${subject}`,
        htmlContent: `
            <div style="font-family: sans-serif; padding: 20px; border: 2px dashed #ccc; background: #f9f9f9;">
                <h3 style="color: #555; margin-top: 0;">Test Email from CadetFlow</h3>
                <p style="white-space: pre-wrap;">${body}</p>
                <hr />
                <p style="font-size: 12px; color: #999;">Sent by Admin for testing purposes.</p>
            </div>
        `
    })
}

// --- TRIGGER 1: GREEN SHEET (Faculty Only) ---
export async function triggerGreenSheetBlast(): Promise<ActionResponse> {
  const supabase = createClient()
  const admin = getAdmin()

  // 1. Get Content
  const { data: html, error: htmlError } = await supabase.rpc('generate_daily_email_html')
  if (htmlError || !html) return { success: false, error: "Failed to generate report HTML" }

  // 2. Get Faculty IDs
  const { data: facultyIds, error: facultyError } = await supabase.rpc('get_faculty_user_ids')
  if (facultyError || !facultyIds || facultyIds.length === 0) return { success: false, error: "No faculty found" }
  
  const candidateIds = facultyIds.map((f: any) => f.id);

  // 3. Check Preferences
  const authorizedIds = await filterRecipientsByPreference(candidateIds, 'email_green_sheet');
  if (authorizedIds.length === 0) return { success: true, message: "No faculty have opted in." }

  // 4. Map to Emails
  const { data: users } = await admin.auth.admin.listUsers()
  const recipients = users.users
    .filter(u => authorizedIds.includes(u.id))
    .map(u => u.email!)
    .filter(Boolean)

  if (recipients.length === 0) return { success: false, error: "No valid emails found for authorized faculty." }

  return dispatchEmail('greensheet', {
    recipients,
    subject: `Daily Report - ${new Date().toLocaleDateString()}`,
    htmlContent: html
  })
}

// --- TRIGGER 2: TOUR SHEET ALERT (Debtors Only) ---
export async function triggerTourSheetAlert(): Promise<ActionResponse> {
  const supabase = createClient()
  const admin = getAdmin()

  // 1. Get Debtors
  const { data: debtors, error: dbError } = await supabase.rpc('get_tour_sheet_debtors') 
  if (dbError) return { success: false, error: dbError.message }
  if (!debtors || debtors.length === 0) return { success: true, message: "No one on the tour sheet." }

  // 2. Check Preferences
  const debtorIds = debtors.map((d: any) => d.id);
  const authorizedIds = await filterRecipientsByPreference(debtorIds, 'email_tour_reminder');
  
  // 3. Map & Send
  const { data: users } = await admin.auth.admin.listUsers()
  let sentCount = 0;
  let lastError = null;
  
  for (const debtor of debtors) {
      if (!authorizedIds.includes(debtor.id)) continue;

      const user = users.users.find(u => u.id === debtor.id)
      if (user?.email) {
          const res = await dispatchEmail('alert', {
              recipients: [user.email],
              subject: `Action Required: You are on the Tour Sheet`,
              htmlContent: `
                <h3>Tour Sheet Notification</h3>
                <p>You currently have a balance of <strong>${debtor.balance} Tours</strong>.</p>
                <p>You are required to march until this balance is cleared.</p>
              `
          })
          if (res.success) sentCount++
          else lastError = res.error
      }
  }

  // If we sent some, consider it a success, otherwise report error if 0 sent but people existed
  if (sentCount === 0 && authorizedIds.length > 0 && lastError) {
      return { success: false, error: lastError }
  }

  return { success: true, sent: sentCount }
}

// --- TRIGGER 3: ACTION ITEMS (Pending Work) ---
export async function triggerActionItemAlert(): Promise<ActionResponse> {
  const supabase = createClient()
  const admin = getAdmin()

  const { data: activeUsers, error: dbError } = await supabase.rpc('get_users_with_pending_actions')
  if (dbError) return { success: false, error: dbError.message }
  if (!activeUsers || activeUsers.length === 0) return { success: true, message: "No pending actions." }
  
  const { data: users } = await admin.auth.admin.listUsers()
  let sentCount = 0;
  let lastError = null;

  for (const record of activeUsers) {
      // Check Preferences (Manual check since logic is complex 'OR')
      const { data: prefs } = await supabase
        .from('user_preferences')
        .select('email_new_report, email_status_change')
        .eq('user_id', record.user_id)
        .single();
      
      // If both are OFF, skip. If either is 'immediate' or 'digest', we nudge them.
      if (!prefs || (prefs.email_new_report === 'off' && prefs.email_status_change === 'off')) {
          continue;
      }

      const user = users.users.find(u => u.id === record.user_id)
      if (user?.email) {
          const items = []
          if (record.approval_count > 0) items.push(`${record.approval_count} reports to approve`)
          if (record.revision_count > 0) items.push(`${record.revision_count} reports returned for revision`)
          if (record.appeal_count > 0) items.push(`${record.appeal_count} appeal updates`)

          const res = await dispatchEmail('alert', {
              recipients: [user.email],
              subject: `CadetFlow: You have ${record.approval_count + record.revision_count + record.appeal_count} Action Items`,
              htmlContent: `
                <h3>Action Required</h3>
                <p>You have pending items in your CadetFlow dashboard:</p>
                <ul>${items.map(i => `<li>${i}</li>`).join('')}</ul>
                <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}">Go to Dashboard</a></p>
              `
          })
          if (res.success) sentCount++
          else lastError = res.error
      }
  }

  if (sentCount === 0 && lastError) {
      return { success: false, error: lastError }
  }

  return { success: true, sent: sentCount }
}