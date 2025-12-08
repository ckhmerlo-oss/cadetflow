'use server'

import { createClient } from '@/utils/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

// UPDATED: Added 'test' type
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
export async function dispatchEmail(type: EmailType, payload: EmailPayload) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  // 1. Check Settings (Skipped for 'test')
  let settingKey = ''
  if (type === 'greensheet') settingKey = 'enable_email_blasts'
  if (type === 'alert') settingKey = 'enable_alert_ed'
  
  if (settingKey) {
      const { data: setting } = await supabase.from('system_settings').select('value').eq('key', settingKey).single()
      if (setting && setting.value === false) {
          console.log(`🚫 Email blocked by setting: ${settingKey}`)
          return { success: false, reason: 'Disabled globally' }
      }
  }

  // 2. Send via Edge Function
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
}

// ... (Existing Helper Functions: filterRecipientsByPreference, etc. remain unchanged) ...


// --- NEW: TEST EMAIL ACTION ---
export async function sendTestEmail(recipientsStr: string, subject: string, body: string) {
    // 1. Parse Recipients
    const recipients = recipientsStr.split(',').map(e => e.trim()).filter(e => e.length > 0 && e.includes('@'));
    
    if (recipients.length === 0) return { success: false, error: "No valid email addresses found." }
    if (!subject) return { success: false, error: "Subject is required." }

    // 2. Dispatch
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

// ... (Existing Trigger Functions: triggerGreenSheetBlast, triggerTourSheetAlert, triggerActionItemAlert remain unchanged) ...

// --- RE-EXPORTING EXISTING FUNCTIONS TO MAINTAIN FILE INTEGRITY ---
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

export async function triggerGreenSheetBlast() {
  const supabase = createClient()
  const admin = getAdmin()
  const { data: html } = await supabase.rpc('generate_daily_email_html')
  if (!html) return { error: "Failed to generate HTML" }
  const { data: facultyIds } = await supabase.rpc('get_faculty_user_ids')
  if (!facultyIds || facultyIds.length === 0) return { error: "No faculty found" }
  const candidateIds = facultyIds.map((f: any) => f.id);
  const authorizedIds = await filterRecipientsByPreference(candidateIds, 'email_green_sheet');
  if (authorizedIds.length === 0) return { success: true, message: "No faculty have opted in." }
  const { data: users } = await admin.auth.admin.listUsers()
  const recipients = users.users.filter(u => authorizedIds.includes(u.id)).map(u => u.email!).filter(Boolean)
  return dispatchEmail('greensheet', { recipients, subject: `Daily Report - ${new Date().toLocaleDateString()}`, htmlContent: html })
}

export async function triggerTourSheetAlert() {
  const supabase = createClient()
  const admin = getAdmin()
  const { data: debtors } = await supabase.rpc('get_tour_sheet_debtors') 
  if (!debtors || debtors.length === 0) return { success: true, message: "No one on the tour sheet." }
  const debtorIds = debtors.map((d: any) => d.id);
  const authorizedIds = await filterRecipientsByPreference(debtorIds, 'email_tour_reminder');
  const { data: users } = await admin.auth.admin.listUsers()
  let sentCount = 0;
  for (const debtor of debtors) {
      if (!authorizedIds.includes(debtor.id)) continue;
      const user = users.users.find(u => u.id === debtor.id)
      if (user?.email) {
          await dispatchEmail('alert', { recipients: [user.email], subject: `Action Required: You are on the Tour Sheet`, htmlContent: `<h3>Tour Sheet Notification</h3><p>You currently have a balance of <strong>${debtor.balance} Tours</strong>.</p><p>You are required to march until this balance is cleared.</p>` })
          sentCount++
      }
  }
  return { success: true, sent: sentCount }
}

export async function triggerActionItemAlert() {
  const supabase = createClient()
  const admin = getAdmin()
  const { data: activeUsers } = await supabase.rpc('get_users_with_pending_actions')
  if (!activeUsers || activeUsers.length === 0) return { success: true, message: "No pending actions." }
  const { data: users } = await admin.auth.admin.listUsers()
  let sentCount = 0;
  for (const record of activeUsers) {
      const { data: prefs } = await supabase.from('user_preferences').select('email_new_report, email_status_change').eq('user_id', record.user_id).single();
      if (!prefs || (prefs.email_new_report === 'off' && prefs.email_status_change === 'off')) continue;
      const user = users.users.find(u => u.id === record.user_id)
      if (user?.email) {
          const items = []
          if (record.approval_count > 0) items.push(`${record.approval_count} reports to approve`)
          if (record.revision_count > 0) items.push(`${record.revision_count} reports returned for revision`)
          if (record.appeal_count > 0) items.push(`${record.appeal_count} appeal updates`)
          await dispatchEmail('alert', { recipients: [user.email], subject: `CadetFlow: You have ${record.approval_count + record.revision_count + record.appeal_count} Action Items`, htmlContent: `<h3>Action Required</h3><p>You have pending items in your CadetFlow dashboard:</p><ul>${items.map(i => `<li>${i}</li>`).join('')}</ul><p><a href="${process.env.NEXT_PUBLIC_SITE_URL}">Go to Dashboard</a></p>` })
          sentCount++
      }
  }
  return { success: true, sent: sentCount }
}