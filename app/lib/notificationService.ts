'use server'

import { createClient } from '@/utils/supabase/server'

type EventType = 'new_report' | 'status_change' | 'tour_reminder' | 'team_alert'

const EVENT_TYPE_MAP: Record<EventType, string> = {
  new_report: 'report.submitted',
  status_change: 'report.final_approved',
  tour_reminder: 'tour.added',
  team_alert: 'team_alert',
}

/** Enqueue email via DB RPC; delivery handled by process-email-queue worker. */
export async function notifyUser(
  userId: string,
  eventType: EventType,
  data: { subject: string; message: string; linkUrl?: string }
) {
  const supabase = await createClient()
  const canonicalEvent = EVENT_TYPE_MAP[eventType]
  const idempotencyKey = `email.app:${canonicalEvent}:${userId}:${data.subject}`

  const { error } = await supabase.rpc('enqueue_email_notification', {
    p_user_id: userId,
    p_event_type: canonicalEvent,
    p_subject: data.subject,
    p_message: data.message,
    p_link_url: data.linkUrl ?? null,
    p_idempotency_key: idempotencyKey,
    p_cadet_id: null,
  })

  if (error) {
    console.error(`Failed to enqueue email notification for ${userId}:`, error.message)
  }
}
