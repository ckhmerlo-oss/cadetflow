'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleUserArchiveStatus(targetUserId: string, setArchived: boolean) {
  const supabase = await createClient()
  
  // 1. Check Permissions (Level 90+ only)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: currentUserProfile } = await supabase
    .from('profiles')
    .select('role:roles(default_role_level)')
    .eq('id', user.id)
    .single()
    
  const roleLevel = (currentUserProfile?.role as any)?.default_role_level || 0
  if (roleLevel < 90) {
      return { error: 'Insufficient permissions. Only Admins can archive users.' }
  }

  // 2. Prepare Updates
  const updates: any = { archived: setArchived }
  
  // *** NEW: Unassign if archiving ***
  if (setArchived) {
      updates.company_id = null
      updates.role_id = null
      // We keep the data for history, but remove active status
  }

  // 3. Execute Update
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', targetUserId)

  if (error) {
      console.error('Archive Error:', error)
      return { error: error.message }
  }

  // 4. Revalidate
  revalidatePath('/manage')
  revalidatePath('/roster')
  
  return { success: true }
}