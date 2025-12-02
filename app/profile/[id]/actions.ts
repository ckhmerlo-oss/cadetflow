'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { STAR_TOUR_AUTHORIZED_ROLES } from '../constants'

export async function updateCadetProfile(cadetId: string, formData: FormData) {
  const supabase = createClient()
  
  // 1. Auth Check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // 2. Fetch Editor Permissions
  const { data: editor } = await supabase
    .from('profiles')
    .select(`
      id, 
      company_id, 
      role:role_id (
        role_name, 
        default_role_level, 
        can_manage_all_rosters, 
        can_manage_own_company_roster
      )
    `)
    .eq('id', user.id)
    .single()

  if (!editor || !editor.role) return { error: 'Unauthorized' }

  const editorRole = editor.role as any
  const editorLevel = editorRole.default_role_level || 0
  const canManageAll = editorRole.can_manage_all_rosters
  const canManageOwn = editorRole.can_manage_own_company_roster
  
  // 3. Fetch Target Details
  const { data: target } = await supabase
    .from('profiles')
    .select('company_id, role:role_id(default_role_level)')
    .eq('id', cadetId)
    .single()

  if (!target) return { error: 'Target profile not found.' }
  
  const targetLevel = (target.role as any)?.default_role_level || 0

  // 4. HIERARCHY RULE: Cannot edit someone of equal or higher rank
  if (targetLevel >= editorLevel) {
    return { error: `Permission Denied: You cannot edit a user of rank level ${targetLevel} (your level is ${editorLevel}).` }
  }

  // 5. SCOPE RULE: Check if editor has jurisdiction
  let hasPermission = false
  if (canManageAll) {
    hasPermission = true
  } else if (canManageOwn) {
    if (editor.company_id === target.company_id) {
      hasPermission = true
    } else {
      return { error: "Permission Denied: You can only edit profiles within your own company." }
    }
  }

  if (!hasPermission) {
    return { error: 'You do not have permission to edit this profile.' }
  }

  // 6. Prepare Updates
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

  // 7. SENSITIVE FIELD CHECK: Star Tours
  // Only specific high-level roles can modify this field
  const canManageStarTours = STAR_TOUR_AUTHORIZED_ROLES.includes(editorRole.role_name);
  if (canManageStarTours) {
    // Only read the checkbox if they are authorized
    if (formData.has('has_star_tours')) {
        updates.has_star_tours = formData.get('has_star_tours') === 'on'
    }
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