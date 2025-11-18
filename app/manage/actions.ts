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
  
  // 1. Security Check
  const isAuthorized = await checkPermissions(supabase)
  if (!isAuthorized) {
    return { error: "Unauthorized. You do not have permission to change roles." }
  }

  // 2. Update Profile
  const { error } = await supabase
    .from('profiles')
    .update({ role_id: roleId })
    .eq('id', userId)

  if (error) {
    return { error: error.message }
  }

  // 3. Revalidate
  revalidatePath('/manage')
  revalidatePath('/manage/roles') // Also refresh the visualizer if needed
  return { success: true }
}