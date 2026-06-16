import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import type { IntendedRecipient } from '../_shared/emailTemplates.ts'
import { applyDevModeRedirect, getDevModeSettings } from '../_shared/devMode.ts'
import { sendViaResend, validateEmailPayload } from '../_shared/resendClient.ts'
import { acquireEmailSendSlot } from '../_shared/rateLimiter.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailPayload {
  type: 'greensheet' | 'alert' | 'summary' | 'test'
  recipients: string[]
  subject: string
  htmlContent: string
  idempotencyKey?: string
  intendedRecipient?: IntendedRecipient
}

async function verifyCaller(req: Request): Promise<boolean> {
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const authHeader = req.headers.get('Authorization') ?? ''
  const token = authHeader.replace('Bearer ', '')

  if (serviceKey && token === serviceKey) {
    return true
  }

  const url = Deno.env.get('SUPABASE_URL')
  if (!url || !token) return false

  const supabase = createClient(url, Deno.env.get('SUPABASE_ANON_KEY') ?? token, {
    global: { headers: { Authorization: authHeader } },
  })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const admin = createClient(url, serviceKey!)
  const { data: profile } = await admin
    .from('profiles')
    .select('is_site_admin, role:roles(default_role_level)')
    .eq('id', user.id)
    .single()

  if (profile?.is_site_admin) return true
  const role = profile?.role as { default_role_level?: number } | null
  return (role?.default_role_level ?? 0) >= 90
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (!(await verifyCaller(req))) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    const payload: EmailPayload = await req.json()
    const validationError = validateEmailPayload(payload)
    if (validationError) {
      return new Response(JSON.stringify({
        success: false,
        error: validationError,
        stage: 'validation',
        errorCode: 'INVALID_PAYLOAD',
        retriable: false,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const apiKey = Deno.env.get('RESEND_API_KEY')
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Server misconfiguration: Missing RESEND_API_KEY',
          stage: 'config',
          errorCode: 'MISSING_RESEND_API_KEY',
          retriable: false,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    const devMode = await getDevModeSettings()
    const { recipients, htmlContent, deliveryMode } = applyDevModeRedirect(
      payload.recipients,
      payload.htmlContent,
      payload.intendedRecipient,
      devMode
    )

    const from = Deno.env.get('RESEND_FROM') ?? 'CadetFlow <greensheet@cadetflow.com>'

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const rateLimitClient = supabaseUrl && serviceKey
      ? createClient(supabaseUrl, serviceKey)
      : null

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
        beforeEachSend: rateLimitClient
          ? () => acquireEmailSendSlot(rateLimitClient)
          : undefined,
      }
    )

    if (!result.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: result.error,
          stage: result.stage ?? 'resend',
          errorCode: result.errorCode,
          httpStatus: result.httpStatus,
          retriable: result.retriable,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: result.retriable ? 503 : 400 }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        resendId: result.resendId,
        sentCount: result.sentCount ?? recipients.length,
        deliveryMode,
        redirected: deliveryMode === 'development_redirect',
        actualEmail: recipients[0],
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    const isDevModeError = message.includes('Development Mode')
    return new Response(JSON.stringify({
      success: false,
      error: message,
      stage: isDevModeError ? 'dev_mode' : 'unknown',
      errorCode: isDevModeError ? 'DEV_MODE_MISCONFIGURED' : 'UNHANDLED',
      retriable: false,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
