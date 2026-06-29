'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'
import { REQUIRED_LEGAL_DOCS } from '@/app/legal/content/types'

const PARENT_ROLE_ID = 'e7110000-0000-0000-0000-000000000001'

export type MoveInInvitePublic = {
  invite_id: string
  form_id: string
  cadet_first_name: string
  cadet_last_name: string | null
  cadet_first_initial: string | null
  room_number: string
  recipient_email: string
  locked_bunk: 'top' | 'bottom'
  locked_desk_side: 'left' | 'right'
  expires_at: string
  revoked_at: string | null
  redeemed_at: string | null
  is_expired: boolean
  is_active: boolean
}

export type PortalInvitePublic = {
  invite_id: string
  purpose: 'portal'
  cadet_id: string
  cadet_first_name: string
  cadet_last_name: string | null
  cadet_first_initial: string | null
  recipient_email: string
  expires_at: string
  revoked_at: string | null
  redeemed_at: string | null
  is_expired: boolean
  is_active: boolean
}

export async function getMoveInInvitePublic(token: string): Promise<MoveInInvitePublic | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_move_in_invite_public', {
    p_token: token,
  })

  if (error) {
    console.error('getMoveInInvitePublic:', error.message)
    return null
  }

  return data as MoveInInvitePublic
}

export async function getPortalInvitePublic(token: string): Promise<PortalInvitePublic | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_portal_invite_public', {
    p_token: token,
  })

  if (error) {
    console.error('getPortalInvitePublic:', error.message)
    return null
  }

  return data as PortalInvitePublic
}

export type RedeemParentInviteResult =
  | { error: string }
  | { success: true; purpose: string; form_id: string | null; cadet_id: string; room_id: string | null }

export type CreateParentAccountResult =
  | { error: string }
  | { success: true; purpose: string; formId: string | null; cadetId: string }

async function recordLegalAcceptancesForUser(supabase: Awaited<ReturnType<typeof createClient>>) {
  const acceptances = REQUIRED_LEGAL_DOCS.map((doc) => ({
    doc_key: doc.doc_key,
    version: doc.version,
  }))
  const { error } = await supabase.rpc('record_legal_acceptances', {
    p_acceptances: acceptances,
  })
  if (error) {
    console.error('recordLegalAcceptances:', error.message)
  }
}

export async function redeemParentInvite(token: string): Promise<RedeemParentInviteResult> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('redeem_parent_invite', {
    p_token: token,
  })

  if (error) return { error: error.message }

  const result = data as {
    purpose: string
    form_id: string | null
    cadet_id: string
    room_id: string | null
  }
  return { success: true, ...result }
}

export async function createParentAccountAndRedeem(
  token: string,
  payload: { firstName: string; lastName: string; password: string },
  options?: { skipLegalAcceptance?: boolean }
): Promise<CreateParentAccountResult> {
  const invite =
    (await getPortalInvitePublic(token)) ?? (await getMoveInInvitePublic(token))
  if (!invite) return { error: 'Invalid invite link.' }
  if (invite.revoked_at) return { error: 'This invite has been revoked.' }
  if (invite.is_expired) return { error: 'This invite has expired.' }

  const admin = await createAdminClient()

  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email: invite.recipient_email,
    password: payload.password,
    email_confirm: true,
    user_metadata: {
      first_name: payload.firstName.trim(),
      last_name: payload.lastName.trim(),
    },
  })

  if (authError) {
    if (authError.message.toLowerCase().includes('already')) {
      return { error: 'An account already exists for this email. Sign in to continue.' }
    }
    return { error: authError.message }
  }

  const userId = authData.user?.id
  if (!userId) return { error: 'Account creation failed.' }

  const { error: profileError } = await admin.from('profiles').upsert(
    {
      id: userId,
      first_name: payload.firstName.trim(),
      last_name: payload.lastName.trim(),
      role_id: PARENT_ROLE_ID,
      company_id: null,
    },
    { onConflict: 'id' }
  )

  if (profileError) {
    console.error('createParentAccountAndRedeem profile upsert:', profileError.message)
    return { error: 'Account created but profile setup failed. Try signing in and continuing again.' }
  }

  const supabase = await createClient()
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: invite.recipient_email,
    password: payload.password,
  })

  if (signInError) return { error: 'Account created but sign-in failed. Try logging in.' }

  if (!options?.skipLegalAcceptance) {
    await recordLegalAcceptancesForUser(supabase)
  }

  const redeem = await redeemParentInvite(token)
  if ('error' in redeem) return { error: redeem.error }

  if (redeem.form_id) {
    revalidatePath(`/move-in/forms/${redeem.form_id}`)
  }

  return {
    success: true,
    purpose: redeem.purpose,
    formId: redeem.form_id,
    cadetId: redeem.cadet_id,
  }
}
