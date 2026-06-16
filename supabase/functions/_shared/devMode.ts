import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import type { IntendedRecipient } from './emailTemplates.ts'
import { devModeBanner } from './emailTemplates.ts'

export interface DevModeSettings {
  enabled: boolean
  forwardTo: string | null
}

export async function getDevModeSettings(): Promise<DevModeSettings> {
  const url = Deno.env.get('SUPABASE_URL')
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!url || !key) {
    return { enabled: false, forwardTo: null }
  }

  const supabase = createClient(url, key)
  const { data } = await supabase
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

export function applyDevModeRedirect(
  recipients: string[],
  htmlContent: string,
  intendedRecipient: IntendedRecipient | undefined,
  devMode: DevModeSettings
): { recipients: string[]; htmlContent: string; deliveryMode: 'normal' | 'development_redirect' } {
  if (!devMode.enabled) {
    return { recipients, htmlContent, deliveryMode: 'normal' }
  }

  if (!devMode.forwardTo || !isValidEmail(devMode.forwardTo)) {
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

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}
