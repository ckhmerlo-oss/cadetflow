'use server'

import { createClient } from '@/utils/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { dispatchEmail } from './server' // Reuse your existing basic dispatcher

// Access Admin API to get emails
const getAdmin = () => createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type EventType = 'new_report' | 'status_change' | 'tour_reminder'

export async function notifyUser(
  userId: string, 
  eventType: EventType, 
  data: { subject: string, message: string, linkUrl?: string }
) {
  const supabase = createClient()
  const admin = getAdmin()

  // 1. Get User Preferences & Email
  // We need admin client to get the email from auth.users (if not in profile)
  // But preferences are in public schema.
  const [prefRes, userRes] = await Promise.all([
      supabase.rpc('get_or_create_preferences', { p_user_id: userId }),
      admin.auth.admin.getUserById(userId)
  ])

  const prefs = prefRes.data?.[0]
  const email = userRes.data.user?.email

  if (!prefs || !email) {
      console.error(`Cannot notify ${userId}: Missing prefs or email.`)
      return
  }

  // 2. Determine Frequency based on Event Type
  let frequency = 'off'
  if (eventType === 'new_report') frequency = prefs.email_new_report
  if (eventType === 'status_change') frequency = prefs.email_status_change
  if (eventType === 'tour_reminder') frequency = prefs.email_tour_reminder ? 'immediate' : 'off' // Reminders are usually batch-processed anyway

  // 3. Execute
  if (frequency === 'off') {
      return; // Do nothing
  } 
  
  else if (frequency === 'immediate') {
      // --- SEND NOW ---
      await dispatchEmail('alert', {
          recipients: [email],
          subject: data.subject,
          htmlContent: `
            <div style="font-family:sans-serif; max-width:600px; margin:0 auto;">
                <h2>${data.subject}</h2>
                <p style="font-size:16px; color:#333;">${data.message}</p>
                ${data.linkUrl ? `<a href="${data.linkUrl}" style="display:inline-block; background:#4F46E5; color:white; padding:10px 20px; text-decoration:none; border-radius:5px; margin-top:10px;">View Details</a>` : ''}
            </div>
          `
      })
  } 
  
  else if (frequency === 'digest') {
      // --- QUEUE FOR LATER ---
      await supabase.from('notification_queue').insert({
          user_id: userId,
          event_type: eventType,
          subject: data.subject,
          message: data.message,
          link_url: data.linkUrl
      })
  }
}