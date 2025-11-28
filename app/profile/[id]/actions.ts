'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { EDIT_AUTHORIZED_ROLES, STAR_TOUR_AUTHORIZED_ROLES } from '../constants'

export async function updateCadetProfile(cadetId: string, formData: FormData) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: editorProfile } = await supabase
    .from('profiles')
    .select('role:role_id (role_name)')
    .eq('id', user.id)
    .single()

  const roleName = (editorProfile?.role as any)?.role_name || ''
  
  const canEdit = EDIT_AUTHORIZED_ROLES.includes(roleName) || roleName.includes('TAC') || roleName === 'Admin';
  if (!canEdit) return { error: 'You do not have permission to edit profiles.' }

  const updates: { [key: string]: any } = {
    cadet_rank: formData.get('cadet_rank')?.toString() || null,
    room_number: formData.get('room_number')?.toString() || null,
    grade_level: formData.get('grade_level')?.toString() || null,
    years_attended: parseInt(formData.get('years_attended')?.toString() || '0'),
    probation_status: formData.get('probation_status')?.toString() || null,
    sport_fall: formData.get('sport_fall')?.toString() || null,
    sport_winter: formData.get('sport_winter')?.toString() || null,
    sport_spring: formData.get('sport_spring')?.toString() || null,
  }

  const canManageStarTours = STAR_TOUR_AUTHORIZED_ROLES.includes(roleName);
  if (canManageStarTours) {
    updates.has_star_tours = formData.get('has_star_tours') === 'on'
  }

  const { error } = await supabase.from('profiles').update(updates).eq('id', cadetId)

  if (error) {
    console.error('Profile update error:', error.message)
    return { error: `Update failed: ${error.message}` }
  }

  revalidatePath(`/profile/${cadetId}`)
  revalidatePath(`/reports/daily`)
  return { success: true }
}

export async function submitTourAdjustment(cadetId: string, amount: number, reason: string) {
  const supabase = createClient()
  
  // 1. Auth Check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // 2. Permission Check (Commandant Staff / Level 90+)
  const { data: profile } = await supabase
    .from('profiles')
    .select('role:role_id (default_role_level)')
    .eq('id', user.id)
    .single()

  const roleLevel = (profile?.role as any)?.default_role_level || 0
  if (roleLevel < 90) {
    return { error: 'Permission Denied: Only Commandant Staff can manually adjust tour balances.' }
  }

  if (amount === 0) return { error: 'Adjustment amount cannot be zero.' }
  if (!reason) return { error: 'A reason is required for adjustments.' }

  // 3. Insert Ledger Entry
  const { error } = await supabase.from('tour_ledger').insert({
    cadet_id: cadetId,
    staff_id: user.id,
    amount: amount,
    action: 'adjustment',
    comment: reason
  })

  if (error) {
    console.error('Adjustment Error:', error)
    return { error: error.message }
  }

  // 4. Revalidate
  revalidatePath(`/profile/${cadetId}`)
  revalidatePath(`/ledger/${cadetId}`)
  
  return { success: true }
}