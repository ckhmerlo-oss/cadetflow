'use server'

import { createClient } from '@/utils/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { dispatchEmail } from './server'

const getAdmin = () => createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type EventType = 'new_report' | 'status_change' | 'tour_reminder' | 'team_alert'

const EVENT_TYPE_MAP: Record<EventType, string> = {
  new_report: 'report.submitted',
  status_change: 'report.final_approved',
  tour_reminder: 'tour.added',
  team_alert: 'team_alert',
}

export async function notifyUser(
  userId: string,
  eventType: EventType,
  data: { subject: string, message: string, linkUrl?: string }
) {
  const supabase = await createClient()
  const admin = getAdmin()

  const [prefRes, userRes] = await Promise.all([
    supabase.rpc('get_or_create_preferences', { p_user_id: userId }),
    admin.auth.admin.getUserById(userId),
  ])

  const prefs = prefRes.data?.[0]
  const email = userRes.data.user?.email

  if (!prefs || !email) {
    console.error(`Cannot notify ${userId}: Missing prefs or email.`)
    return
  }

  let frequency = 'off'
  if (eventType === 'new_report') frequency = prefs.email_new_report
  if (eventType === 'status_change') frequency = prefs.email_status_change
  if (eventType === 'tour_reminder') {
    frequency = prefs.email_tour_change ?? (prefs.email_tour_reminder ? 'immediate' : 'off')
  }
  if (eventType === 'team_alert') frequency = prefs.email_team_alert

  if (frequency === 'off') {
    return
  }

  const canonicalEvent = EVENT_TYPE_MAP[eventType]
  const idempotencyKey = `email.app:${canonicalEvent}:${userId}:${data.subject}`

  if (frequency === 'immediate') {
    await dispatchEmail('alert', {
      recipients: [email],
      subject: data.subject,
      htmlContent: `
        <div style="font-family:sans-serif; max-width:600px; margin:0 auto;">
          <h2>${data.subject}</h2>
          <p style="font-size:16px; color:#333;">${data.message}</p>
          ${data.linkUrl ? `<a href="${data.linkUrl}" style="display:inline-block; background:#4F46E5; color:white; padding:10px 20px; text-decoration:none; border-radius:5px; margin-top:10px;">View Details</a>` : ''}
        </div>
      `,
    })
    return
  }

  if (frequency === 'digest') {
    const { error } = await supabase.rpc('enqueue_email_notification', {
      p_user_id: userId,
      p_event_type: canonicalEvent,
      p_subject: data.subject,
      p_message: data.message,
      p_link_url: data.linkUrl ?? null,
      p_idempotency_key: idempotencyKey,
    })

    if (error) {
      console.error(`Failed to enqueue email notification for ${userId}:`, error.message)
    }
  }
}
