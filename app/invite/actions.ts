'use server'

import { createClient } from '@/utils/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

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

export async function getMoveInInvitePublic(token: string): Promise<MoveInInvitePublic | null> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('get_move_in_invite_public', {
    p_token: token,
  })

  if (error) {
    console.error('getMoveInInvitePublic:', error.message)
    return null
  }

  return data as MoveInInvitePublic
}

export type RedeemParentInviteResult =
  | { error: string }
  | { success: true; form_id: string; cadet_id: string; room_id: string }

export type CreateParentAccountResult =
  | { error: string }
  | { success: true; formId: string }

export async function redeemParentInvite(token: string): Promise<RedeemParentInviteResult> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('redeem_parent_invite', {
    p_token: token,
  })

  if (error) return { error: error.message }

  const result = data as { form_id: string; cadet_id: string; room_id: string }
  return { success: true, ...result }
}

export async function createParentAccountAndRedeem(
  token: string,
  payload: { firstName: string; lastName: string; password: string }
): Promise<CreateParentAccountResult> {
  const invite = await getMoveInInvitePublic(token)
  if (!invite) return { error: 'Invalid invite link.' }
  if (invite.revoked_at) return { error: 'This invite has been revoked.' }
  if (invite.is_expired) return { error: 'This invite has expired.' }

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

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

  await admin
    .from('profiles')
    .update({
      first_name: payload.firstName.trim(),
      last_name: payload.lastName.trim(),
      role_id: PARENT_ROLE_ID,
      company_id: null,
    })
    .eq('id', userId)

  const supabase = createClient()
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: invite.recipient_email,
    password: payload.password,
  })

  if (signInError) return { error: 'Account created but sign-in failed. Try logging in.' }

  const redeem = await redeemParentInvite(token)
  if ('error' in redeem) return { error: redeem.error }

  revalidatePath(`/move-in/forms/${redeem.form_id}`)
  return { success: true, formId: redeem.form_id }
}
