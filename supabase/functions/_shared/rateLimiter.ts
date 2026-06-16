import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

/** Minimum gap between Resend API calls (4/sec to stay under Resend's 5/sec limit). */
export const MIN_SEND_GAP_MS = 250

export async function acquireEmailSendSlot(supabase: SupabaseClient): Promise<void> {
  const { error } = await supabase.rpc('acquire_email_send_slot')
  if (error) {
    throw new Error(`Rate limiter unavailable: ${error.message}`)
  }
}
