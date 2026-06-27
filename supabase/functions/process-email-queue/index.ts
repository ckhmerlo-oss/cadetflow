import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { alertEmail, digestEmail } from '../_shared/emailTemplates.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PendingRow {
  queue_id: string
  user_id: string
  event_type: string
  subject: string
  message: string
  link_url: string | null
  idempotency_key: string
  delivery_frequency: string
  profile_name: string
  is_digest_batch: boolean
  digest_item_ids: string[] | null
}

interface QueueFailure {
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

function formatSendError(sendData: Record<string, unknown>, httpStatus: number): QueueFailure['error'] {
  const parts = [String(sendData.error ?? `Send failed (${httpStatus})`)]
  if (sendData.stage) parts.push(`stage=${sendData.stage}`)
  if (sendData.errorCode) parts.push(`code=${sendData.errorCode}`)
  return parts.join(' · ')
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  if (!serviceKey || !supabaseUrl) {
    return new Response(JSON.stringify({ error: 'Missing Supabase configuration' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const authHeader = req.headers.get('Authorization') ?? ''
  const token = authHeader.replace('Bearer ', '')
  if (token !== serviceKey) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const supabase = createClient(supabaseUrl, serviceKey)
  const siteUrl = Deno.env.get('SITE_URL') ?? ''

  try {
    const { data: rows, error: listError } = await supabase.rpc('list_pending_email_notifications', {
      p_batch_size: 20,
    })

    if (listError) {
      throw new Error(listError.message)
    }

    const pending = (rows ?? []) as PendingRow[]
    if (pending.length === 0) {
      return new Response(JSON.stringify({ processed: 0, sent: 0, failed: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const userIds = [...new Set(pending.map((r) => r.user_id))]
    const { data: emailRows, error: emailLookupError } = await supabase.rpc('get_auth_user_emails', {
      p_user_ids: userIds,
    })
    if (emailLookupError) {
      throw new Error(emailLookupError.message)
    }
    const emailByUserId = new Map(
      ((emailRows ?? []) as { user_id: string; email: string }[]).map((r) => [r.user_id, r.email])
    )

    let sent = 0
    let failed = 0
    const failures: QueueFailure[] = []

    for (const row of pending) {
      const intendedEmail = emailByUserId.get(row.user_id)
      if (!intendedEmail) {
        const error = 'No email address found for user'
        await supabase.rpc('mark_email_notification_failed', {
          p_queue_ids: row.is_digest_batch && row.digest_item_ids ? row.digest_item_ids : [row.queue_id],
          p_error: error,
          p_retriable: false,
          p_intended_email: null,
          p_user_id: row.user_id,
          p_profile_name: row.profile_name,
          p_subject: row.subject,
        })
        failures.push({
          queueId: row.queue_id,
          subject: row.subject,
          intendedEmail: null,
          profileName: row.profile_name,
          error,
          stage: 'lookup',
          errorCode: 'MISSING_USER_EMAIL',
          retriable: false,
        })
        failed++
        continue
      }

      const queueIds = row.is_digest_batch && row.digest_item_ids ? row.digest_item_ids : [row.queue_id]

      let htmlContent: string
      if (row.is_digest_batch) {
        const lines = row.message.split('\n').filter(Boolean)
        const items = lines.map((line) => {
          const match = line.match(/^• (.+?): (.+?)(?: \[(.+)\])?$/)
          return {
            subject: match?.[1] ?? 'Notification',
            message: match?.[2] ?? line,
            linkUrl: match?.[3] ?? null,
          }
        })
        htmlContent = digestEmail({ items, siteUrl })
      } else {
        htmlContent = alertEmail({
          subject: row.subject,
          message: row.message,
          linkUrl: row.link_url,
          siteUrl,
        })
      }

      const sendRes = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${serviceKey}`,
        },
        body: JSON.stringify({
          type: 'alert',
          recipients: [intendedEmail],
          subject: row.subject,
          htmlContent,
          idempotencyKey: row.idempotency_key,
          intendedRecipient: {
            email: intendedEmail,
            userId: row.user_id,
            profileName: row.profile_name,
          },
        }),
      })

      const sendData = await sendRes.json().catch(() => ({}))

      if (sendRes.ok && sendData.success) {
        await supabase.rpc('mark_email_notification_sent', {
          p_queue_ids: queueIds,
          p_resend_id: sendData.resendId ?? null,
          p_intended_email: intendedEmail,
          p_actual_email: sendData.actualEmail ?? intendedEmail,
          p_delivery_mode: sendData.deliveryMode ?? 'normal',
          p_user_id: row.user_id,
          p_profile_name: row.profile_name,
          p_subject: row.subject,
        })
        sent++
      } else {
        const error = formatSendError(sendData, sendRes.status)
        await supabase.rpc('mark_email_notification_failed', {
          p_queue_ids: queueIds,
          p_error: error,
          p_retriable: sendData.retriable !== false,
          p_intended_email: intendedEmail,
          p_user_id: row.user_id,
          p_profile_name: row.profile_name,
          p_subject: row.subject,
        })
        failures.push({
          queueId: row.queue_id,
          subject: row.subject,
          intendedEmail,
          profileName: row.profile_name,
          error,
          stage: typeof sendData.stage === 'string' ? sendData.stage : undefined,
          errorCode: typeof sendData.errorCode === 'string' ? sendData.errorCode : undefined,
          httpStatus: sendRes.status,
          retriable: sendData.retriable !== false,
        })
        failed++
      }
    }

    return new Response(
      JSON.stringify({ processed: pending.length, sent, failed, failures }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
