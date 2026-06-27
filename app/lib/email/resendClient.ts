export interface ResendSendResult {
  success: boolean
  resendId?: string
  error?: string
  retriable?: boolean
  sentCount?: number
  stage?: 'resend'
  errorCode?: string
  httpStatus?: number
}

const MAX_RETRIES = 3
const BASE_DELAY_MS = 500

type SendHooks = {
  beforeEachSend?: () => Promise<void>
}

async function sendSingleEmail(params: {
  apiKey: string
  from: string
  to: string[]
  subject: string
  html: string
  idempotencyKey?: string
}): Promise<ResendSendResult> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${params.apiKey}`,
  }

  if (params.idempotencyKey) {
    headers['Idempotency-Key'] = params.idempotencyKey.slice(0, 256)
  }

  let lastError = 'Unknown error'
  let retriable = false

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      await sleep(BASE_DELAY_MS * Math.pow(2, attempt - 1))
    }

    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          from: params.from,
          to: params.to,
          subject: params.subject,
          html: params.html,
        }),
      })

      const data = await res.json().catch(() => ({}))

      if (res.ok) {
        return { success: true, resendId: data.id ?? data.data?.id, sentCount: params.to.length }
      }

      lastError = data.message ?? data.error ?? `Resend API error (${res.status})`
      retriable = res.status === 429 || res.status >= 500

      if (!retriable) {
        return {
          success: false,
          error: lastError,
          retriable: false,
          stage: 'resend',
          errorCode: `RESEND_${res.status}`,
          httpStatus: res.status,
        }
      }
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err)
      retriable = true
    }
  }

  return {
    success: false,
    error: lastError,
    retriable,
    stage: 'resend',
    errorCode: 'RESEND_RETRY_EXHAUSTED',
  }
}

export async function sendViaResend(
  params: {
    apiKey: string
    from: string
    to: string[]
    subject: string
    html: string
    idempotencyKey?: string
  },
  hooks?: SendHooks
): Promise<ResendSendResult> {
  const recipients = params.to
  if (recipients.length === 0) {
    return { success: false, error: 'No recipients defined.', retriable: false }
  }

  if (recipients.length === 1) {
    await hooks?.beforeEachSend?.()
    return sendSingleEmail(params)
  }

  let lastResendId: string | undefined
  let sentCount = 0
  const baseKey = params.idempotencyKey ?? `batch:${params.subject}`

  for (const recipient of recipients) {
    await hooks?.beforeEachSend?.()
    const result = await sendSingleEmail({
      ...params,
      to: [recipient],
      idempotencyKey: `${baseKey}:${recipient}`,
    })

    if (!result.success) {
      return {
        ...result,
        sentCount,
        error: sentCount > 0
          ? `${result.error} (after ${sentCount} of ${recipients.length} sent)`
          : result.error,
      }
    }

    sentCount++
    lastResendId = result.resendId
  }

  return { success: true, resendId: lastResendId, sentCount }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function validateEmailPayload(payload: {
  recipients?: string[]
  subject?: string
  htmlContent?: string
}): string | null {
  if (!payload.recipients || payload.recipients.length === 0) {
    return 'No recipients defined.'
  }
  if (payload.recipients.length > 500) {
    return 'Too many recipients (max 500).'
  }
  for (const email of payload.recipients) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return `Invalid email address: ${email}`
    }
  }
  if (!payload.subject?.trim()) {
    return 'Subject is required.'
  }
  if (!payload.htmlContent?.trim()) {
    return 'HTML content is required.'
  }
  return null
}
