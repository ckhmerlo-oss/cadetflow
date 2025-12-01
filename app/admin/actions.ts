'use server'

import { createClient as createServerClient } from '@/utils/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

// --- EXISTING: Password Reset ---
export async function adminResetPassword(prevState: any, formData: FormData) {
  const userId = formData.get('userId') as string
  const newPassword = formData.get('newPassword') as string

  if (!userId || !newPassword) {
    return { error: 'User ID and New Password are required.', success: false }
  }

  if (newPassword.length < 6) {
    return { error: 'Password must be at least 6 characters.', success: false }
  }

  try {
    const supabase = createServerClient()
    const { data: { user }, } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Standard permission check
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role:role_id(default_role_level)')
      .eq('id', user.id)
      .single()

    if (profileError) throw new Error('Could not verify user profile.')
    
    const roleLevel = (profile?.role as any)?.default_role_level || 0
    if (roleLevel < 90) throw new Error('Permission denied: Admin rights required.')
    
    // Create Admin Client for Auth operations
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword,
    })

    if (error) throw error

    return { error: null, success: true }
  } catch (error: any) {
    return { error: `Failed to reset: ${error.message}`, success: false }
  }
}

// --- NEW: Company Management ---

export async function createCompanyAction(formData: FormData) {
  const supabase = createServerClient()
  const name = formData.get('name') as string

  if (!name.trim()) return { error: "Company Name is required" }

  // 1. Auth & Permission Check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role:role_id(default_role_level)')
    .eq('id', user.id)
    .single()
  
  const roleLevel = (profile?.role as any)?.default_role_level || 0
  if (roleLevel < 90) return { error: "Permission Denied" }

  // 2. Insert
  const { error } = await supabase
    .from('companies')
    .insert({ company_name: name.trim() })

  if (error) return { error: error.message }
  
  revalidatePath('/admin')
  return { success: true }
}

export async function deleteCompanyAction(companyId: string) {
  const supabase = createServerClient()

  // 1. Auth & Permission Check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role:role_id(default_role_level)')
    .eq('id', user.id)
    .single()
  
  const roleLevel = (profile?.role as any)?.default_role_level || 0
  if (roleLevel < 90) return { error: "Permission Denied" }

  // 2. Delete
  const { error } = await supabase
    .from('companies')
    .delete()
    .eq('id', companyId)

  if (error) {
      // Handle FK constraints nicely
      if (error.code === '23503') {
          return { error: "Cannot delete: This company has cadets or staff assigned to it." }
      }
      return { error: error.message }
  }
  
  revalidatePath('/admin')
  return { success: true }
}

// --- UPDATED: Role Management Actions ---

export async function createAdminRoleAction(formData: FormData) {
  const supabase = createServerClient()
  
  const roleName = formData.get('roleName') as string
  const defaultLevel = parseInt(formData.get('defaultLevel') as string) || 0
  const companyId = formData.get('companyId') as string || null
  const approvalGroupId = formData.get('approvalGroupId') as string || null // <--- NEW
  const canManageOwn = formData.get('canManageOwn') === 'on'
  const canManageAll = formData.get('canManageAll') === 'on'

  if (!roleName.trim()) return { error: "Role Name is required" }

  // 1. Auth Check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role:role_id(default_role_level)')
    .eq('id', user.id)
    .single()
  
  const roleLevel = (profile?.role as any)?.default_role_level || 0
  if (roleLevel < 90) return { error: "Permission Denied" }

  // 2. Insert
  const { error } = await supabase
    .from('roles')
    .insert({
      role_name: roleName.trim(),
      default_role_level: defaultLevel,
      company_id: companyId,
      approval_group_id: approvalGroupId, // <--- SAVING
      can_manage_own_company_roster: canManageOwn,
      can_manage_all_rosters: canManageAll
    })

  if (error) return { error: error.message }
  
  revalidatePath('/admin')
  return { success: true }
}

export async function updateAdminRoleAction(formData: FormData) {
  const supabase = createServerClient()
  
  const roleId = formData.get('roleId') as string
  const roleName = formData.get('roleName') as string
  const defaultLevel = parseInt(formData.get('defaultLevel') as string) || 0
  const companyId = formData.get('companyId') as string || null
  const approvalGroupId = formData.get('approvalGroupId') as string || null // <--- NEW
  const canManageOwn = formData.get('canManageOwn') === 'on'
  const canManageAll = formData.get('canManageAll') === 'on'

  if (!roleId) return { error: "Role ID is required" }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role:role_id(default_role_level)')
    .eq('id', user.id)
    .single()
  
  const roleLevel = (profile?.role as any)?.default_role_level || 0
  if (roleLevel < 90) return { error: "Permission Denied" }

  const { error } = await supabase
    .from('roles')
    .update({
      role_name: roleName.trim(),
      default_role_level: defaultLevel,
      company_id: companyId,
      approval_group_id: approvalGroupId, // <--- SAVING
      can_manage_own_company_roster: canManageOwn,
      can_manage_all_rosters: canManageAll
    })
    .eq('id', roleId)

  if (error) return { error: error.message }
  
  revalidatePath('/admin')
  return { success: true }
}

export async function deleteAdminRoleAction(roleId: string) {
  const supabase = createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role:role_id(default_role_level)')
    .eq('id', user.id)
    .single()
  
  const roleLevel = (profile?.role as any)?.default_role_level || 0
  if (roleLevel < 90) return { error: "Permission Denied" }

  const { count } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role_id', roleId)

  if (count && count > 0) {
    return { error: `Cannot delete: ${count} users are currently assigned to this role.` }
  }

  const { error } = await supabase
    .from('roles')
    .delete()
    .eq('id', roleId)

  if (error) return { error: error.message }
  
  revalidatePath('/admin')
  return { success: true }
}