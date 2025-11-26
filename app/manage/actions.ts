'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// Helper: Check if user is authorized (Staff/Admin/TAC)
async function checkPermissions(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data: profile } = await supabase
    .from('profiles')
    .select('role:role_id (default_role_level, role_name)')
    .eq('id', user.id)
    .single()

  const level = (profile?.role as any)?.default_role_level || 0
  const name = (profile?.role as any)?.role_name || ''
  
  // Allow Staff (50+), or specific roles like Admin/TAC
  return level >= 50 || name === 'Admin' || name.includes('TAC')
}

export async function updateUserRole(userId: string, roleId: string | null) {
  const supabase = createClient()
  
  if (!await checkPermissions(supabase)) {
    return { error: "Unauthorized." }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ role_id: roleId })
    .eq('id', userId)

  if (error) return { error: error.message }

  revalidatePath('/manage')
  return { success: true }
}

// --- NEW BULK ACTIONS ---

export async function bulkAssignCompany(userIds: string[], companyId: string) {
  const supabase = createClient()
  
  if (!await checkPermissions(supabase)) {
    return { error: "Unauthorized." }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ company_id: companyId })
    .in('id', userIds)

  if (error) return { error: error.message }

  revalidatePath('/manage')
  return { success: true }
}

export async function bulkAssignRole(userIds: string[], roleId: string) {
  const supabase = createClient()
  
  if (!await checkPermissions(supabase)) {
    return { error: "Unauthorized." }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ role_id: roleId })
    .in('id', userIds)

  if (error) return { error: error.message }

  revalidatePath('/manage')
  return { success: true }
}