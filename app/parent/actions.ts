'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { resolveSiteUrl } from '@/app/lib/demoEnvironment'
import { getRequestHost } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'
import { REQUIRED_LEGAL_DOCS } from '@/app/legal/content/types'

async function siteUrl() {
  const host = await getRequestHost()
  return resolveSiteUrl(host)
}

export async function createPortalInvite(payload: {
  cadetId: string
  recipientEmail: string
  cadetName: string
  expiresInDays?: number
}) {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('create_portal_invite', {
    p_cadet_id: payload.cadetId,
    p_recipient_email: payload.recipientEmail,
    p_expires_in_days: payload.expiresInDays ?? 14,
  })

  if (error) return { error: error.message }

  const result = data as {
    invite_id: string
    token: string
    recipient_email: string
    expires_at: string
  }

  const inviteLink = `${await siteUrl()}/invite/portal/${result.token}`

  const { sendEmailDirect } = await import('@/app/lib/email/emailDirect.server')
  const { parentInviteEmail } = await import('@/app/lib/emailTemplates')

  const admin = await createAdminClient()

  const emailResult = await sendEmailDirect(admin, {
    type: 'alert',
    recipients: [result.recipient_email],
    subject: `Parent portal invitation for ${payload.cadetName}`,
    htmlContent: parentInviteEmail({
      cadetName: payload.cadetName,
      inviteLink,
    }),
    idempotencyKey: `parent.portal.invite:${result.invite_id}`,
    intendedRecipient: {
      email: result.recipient_email,
      profileName: payload.cadetName,
    },
  })

  if (!emailResult.success) {
    console.error('createPortalInvite email:', emailResult.error)
  }

  revalidatePath(`/profile/${payload.cadetId}`)
  return {
    success: true,
    inviteId: result.invite_id,
    token: result.token,
    inviteLink,
    emailSent: emailResult.success,
  }
}

export async function resendPortalInvite(payload: {
  inviteId: string
  cadetId: string
  cadetName: string
}) {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('refresh_move_in_invite_token', {
    p_invite_id: payload.inviteId,
  })

  if (error) return { error: error.message }

  const result = data as {
    token: string
    recipient_email: string
    purpose?: string
  }

  const inviteLink = `${await siteUrl()}/invite/portal/${result.token}`

  const { sendEmailDirect } = await import('@/app/lib/email/emailDirect.server')
  const { parentInviteEmail } = await import('@/app/lib/emailTemplates')

  const admin = await createAdminClient()

  const emailResult = await sendEmailDirect(admin, {
    type: 'alert',
    recipients: [result.recipient_email],
    subject: `Parent portal invitation for ${payload.cadetName}`,
    htmlContent: parentInviteEmail({
      cadetName: payload.cadetName,
      inviteLink,
    }),
    idempotencyKey: `parent.portal.resend:${payload.inviteId}:${Date.now()}`,
    intendedRecipient: {
      email: result.recipient_email,
      profileName: payload.cadetName,
    },
  })

  revalidatePath(`/profile/${payload.cadetId}`)
  return { success: true, inviteLink, emailSent: emailResult.success }
}

export async function revokePortalInvite(inviteId: string, cadetId: string) {
  const supabase = await createClient()
  const { error } = await supabase.rpc('revoke_parent_invite', { p_invite_id: inviteId })
  if (error) return { error: error.message }
  revalidatePath(`/profile/${cadetId}`)
  return { success: true }
}

export async function updatePortalInviteEmail(inviteId: string, cadetId: string, email: string) {
  const supabase = await createClient()
  const { error } = await supabase.rpc('update_move_in_invite_email', {
    p_invite_id: inviteId,
    p_recipient_email: email,
  })
  if (error) return { error: error.message }
  revalidatePath(`/profile/${cadetId}`)
  return { success: true }
}

export async function recordLegalAcceptancesServer() {
  const supabase = await createClient()
  const acceptances = REQUIRED_LEGAL_DOCS.map((doc) => ({
    doc_key: doc.doc_key,
    version: doc.version,
  }))
  const { error } = await supabase.rpc('record_legal_acceptances', {
    p_acceptances: acceptances,
  })
  if (error) return { error: error.message }
  return { success: true }
}

export async function submitTravelRequest(payload: {
  cadetId: string
  tripType: 'weekend' | 'break' | 'other'
  departureAt: string
  returnAt: string
  destination: string
  notes?: string
}) {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('create_parent_travel_request', {
    p_cadet_id: payload.cadetId,
    p_trip_type: payload.tripType,
    p_departure_at: payload.departureAt,
    p_return_at: payload.returnAt,
    p_destination: payload.destination,
    p_notes: payload.notes ?? null,
  })
  if (error) return { error: error.message }
  revalidatePath(`/parent/cadets/${payload.cadetId}/travel`)
  return { success: true, requestId: data as string }
}

export async function acceptRequiredLegalDocs() {
  return recordLegalAcceptancesServer()
}
