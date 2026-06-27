import type { SupabaseClient } from '@supabase/supabase-js'
import {
  alertEmail,
  devModeBanner,
  digestEmail,
  type IntendedRecipient,
} from '@/app/lib/emailTemplates'
import { sendViaResend, validateEmailPayload } from '@/app/lib/email/resendClient'

export type DirectQueueFailure = {
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

type EmailType = 'greensheet' | 'alert' | 'summary' | 'test'

export interface DirectEmailPayload {
  type: EmailType
  recipients: string[]
  subject: string
  htmlContent: string
  idempotencyKey?: string
  intendedRecipient?: IntendedRecipient
}

export interface DirectEmailResult {
  success: boolean
  error?: string
  sentCount?: number
  resendId?: string
  deliveryMode?: 'normal' | 'development_redirect'
  actualEmail?: string
  stage?: string
  errorCode?: string
  retriable?: boolean
  httpStatus?: number
}

interface DevModeSettings {
  enabled: boolean
  forwardTo: string | null
}

interface PendingRow {
  queue_id: string
  user_id: string
  subject: string
  message: string
  link_url: string | null
  idempotency_key: string
  profile_name: string
  is_digest_batch: boolean
  digest_item_ids: string[] | null
}

async function getDevModeSettings(admin: SupabaseClient): Promise<DevModeSettings> {
  const { data } = await admin
    .from('system_settings')
    .select('key, value, description')
    .in('key', ['email_development_mode', 'email_development_forward_to'])

  const rows = data ?? []
  const modeRow = rows.find((r) => r.key === 'email_development_mode')
  const forwardRow = rows.find((r) => r.key === 'email_development_forward_to')

  return {
    enabled: modeRow?.value === true,
    forwardTo: forwardRow?.description?.trim() || null,
  }
}

function applyDevModeRedirect(
  recipients: string[],
  htmlContent: string,
  intendedRecipient: IntendedRecipient | undefined,
  devMode: DevModeSettings
): { recipients: string[]; htmlContent: string; deliveryMode: 'normal' | 'development_redirect' } {
  if (!devMode.enabled) {
    return { recipients, htmlContent, deliveryMode: 'normal' }
  }

  if (!devMode.forwardTo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(devMode.forwardTo)) {
    throw new Error('Development Mode is enabled but no valid forward-to email is configured.')
  }

  const recipient: IntendedRecipient = intendedRecipient ?? {
    email: recipients[0] ?? 'unknown',
    profileName: 'Unknown',
  }

  const banner = devModeBanner(recipient)
  const wrappedHtml = htmlContent.includes('Development Mode — Intended Recipient')
    ? htmlContent
    : banner + htmlContent

  return {
    recipients: [devMode.forwardTo],
    htmlContent: wrappedHtml,
    deliveryMode: 'development_redirect',
  }
}

function formatSendError(result: DirectEmailResult, httpStatus?: number): string {
  const parts = [result.error ?? `Send failed (${httpStatus ?? 'unknown'})`]
  if (result.stage) parts.push(`stage=${result.stage}`)
  if (result.errorCode) parts.push(`code=${result.errorCode}`)
  return parts.join(' · ')
}

export async function sendEmailDirect(
  admin: SupabaseClient,
  payload: DirectEmailPayload
): Promise<DirectEmailResult> {
  const validationError = validateEmailPayload(payload)
  if (validationError) {
    return {
      success: false,
      error: validationError,
      stage: 'validation',
      errorCode: 'INVALID_PAYLOAD',
      retriable: false,
    }
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return {
      success: false,
      error: 'Server misconfiguration: Missing RESEND_API_KEY',
      stage: 'config',
      errorCode: 'MISSING_RESEND_API_KEY',
      retriable: false,
    }
  }

  try {
    const devMode = await getDevModeSettings(admin)
    const { recipients, htmlContent, deliveryMode } = applyDevModeRedirect(
      payload.recipients,
      payload.htmlContent,
      payload.intendedRecipient,
      devMode
    )

    const from = process.env.RESEND_FROM ?? 'CadetFlow <greensheet@cadetflow.com>'

    const result = await sendViaResend(
      {
        apiKey,
        from,
        to: recipients,
        subject: payload.subject,
        html: htmlContent,
        idempotencyKey: payload.idempotencyKey,
      },
      {
        beforeEachSend: async () => {
          const { error } = await admin.rpc('acquire_email_send_slot')
          if (error) throw new Error(error.message)
        },
      }
    )

    if (!result.success) {
      return {
        success: false,
        error: result.error,
        stage: result.stage ?? 'resend',
        errorCode: result.errorCode,
        httpStatus: result.httpStatus,
        retriable: result.retriable,
      }
    }

    return {
      success: true,
      resendId: result.resendId,
      sentCount: result.sentCount ?? recipients.length,
      deliveryMode,
      actualEmail: recipients[0],
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    const isDevModeError = message.includes('Development Mode')
    return {
      success: false,
      error: message,
      stage: isDevModeError ? 'dev_mode' : 'unknown',
      errorCode: isDevModeError ? 'DEV_MODE_MISCONFIGURED' : 'UNHANDLED',
      retriable: false,
    }
  }
}

export async function processEmailQueueDirect(admin: SupabaseClient): Promise<{
  processed: number
  sent: number
  failed: number
  failures: DirectQueueFailure[]
}> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL ?? ''

  const { data: rows, error: listError } = await admin.rpc('list_pending_email_notifications', {
    p_batch_size: 20,
  })

  if (listError) {
    throw new Error(listError.message)
  }

  const pending = (rows ?? []) as PendingRow[]
  if (pending.length === 0) {
    return { processed: 0, sent: 0, failed: 0, failures: [] }
  }

  const userIds = [...new Set(pending.map((r) => r.user_id))]
  const { data: emailRows, error: emailLookupError } = await admin.rpc('get_auth_user_emails', {
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
  const failures: DirectQueueFailure[] = []

  for (const row of pending) {
    const intendedEmail = emailByUserId.get(row.user_id)
    if (!intendedEmail) {
      const error = 'No email address found for user'
      await admin.rpc('mark_email_notification_failed', {
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

    const sendResult = await sendEmailDirect(admin, {
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
    })

    if (sendResult.success) {
      await admin.rpc('mark_email_notification_sent', {
        p_queue_ids: queueIds,
        p_resend_id: sendResult.resendId ?? null,
        p_intended_email: intendedEmail,
        p_actual_email: sendResult.actualEmail ?? intendedEmail,
        p_delivery_mode: sendResult.deliveryMode ?? 'normal',
        p_user_id: row.user_id,
        p_profile_name: row.profile_name,
        p_subject: row.subject,
      })
      sent++
    } else {
      const error = formatSendError(sendResult, sendResult.httpStatus)
      await admin.rpc('mark_email_notification_failed', {
        p_queue_ids: queueIds,
        p_error: error,
        p_retriable: sendResult.retriable !== false,
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
        stage: sendResult.stage,
        errorCode: sendResult.errorCode,
        httpStatus: sendResult.httpStatus,
        retriable: sendResult.retriable !== false,
      })
      failed++
    }
  }

  return { processed: pending.length, sent, failed, failures }
}

export function isEdgeFunctionsUnavailable(response: Response, data: Record<string, unknown>): boolean {
  if (response.status === 503) return true
  const message = typeof data.message === 'string' ? data.message : ''
  return message.includes('name resolution failed')
}
