'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// --- HELPER ---
async function getActorWithPermissions(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
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

  if (!profile || !profile.role) return null

  const role = profile.role as any
  return {
    userId: profile.id,
    companyId: profile.company_id,
    roleLevel: role.default_role_level || 0,
    canManageAll: role.can_manage_all_rosters || false,
    canManageOwn: role.can_manage_own_company_roster || false,
    roleName: role.role_name
  }
}

// --- ACTIONS ---

export async function updateUserRole(userId: string, roleId: string | null) {
  // If clearing a role (null), we treat it as assigning roleId "" or similar
  // But bulkAssignRole expects a string.
  // If roleId is null, we are essentially unassigning.
  // Let's handle null separately or ensure bulkAssignRole handles it.
  if (!roleId) {
      // Unassign logic could be separate, or we pass a special flag?
      // For now, let's assume roleId is required for assignment.
      // To unassign, we might need a separate action or allow null.
      // Let's keep it simple: This action is for ASSIGNING.
      return { error: "Role ID is required." }
  }
  return bulkAssignRole([userId], roleId)
}

export async function bulkAssignRole(userIds: string[], roleId: string) {
  const supabase = createClient()
  const actor = await getActorWithPermissions(supabase)
  
  if (!actor) return { error: "Unauthorized" }

  // 1. FETCH TARGET ROLE DETAILS
  const { data: targetRole } = await supabase
    .from('roles')
    .select('default_role_level, company_id')
    .eq('id', roleId)
    .single()
    
  if (!targetRole) return { error: "Role not found." }

  const targetRoleLevel = targetRole.default_role_level || 0
  
  // 2. HIERARCHY CHECK
  // You cannot assign a role that is equal to or higher than your own.
  if (targetRoleLevel >= actor.roleLevel) {
    return { error: `Permission Denied: You cannot assign a role of level ${targetRoleLevel} (your level is ${actor.roleLevel}).` }
  }

  // 3. SCOPE CHECK
  if (actor.canManageAll) {
    // Allowed globally
  } else if (actor.canManageOwn) {
    // a) Role must belong to the actor's company (or be generic/global if that's allowed, but usually specific)
    // Strict mode: Role must be in actor's company
    if (targetRole.company_id && targetRole.company_id !== actor.companyId) {
        return { error: "Permission Denied: You cannot assign roles from another company." }
    }

    // b) Target Users must be in actor's company OR unassigned
    const { data: targets } = await supabase
      .from('profiles')
      .select('id, company_id')
      .in('id', userIds)

    if (!targets) return { error: "Could not verify targets." }

    const allValid = targets.every(t => t.company_id === actor.companyId || t.company_id === null)
    
    if (!allValid) {
      return { error: "Permission Denied: You can only manage cadets within your own company or claim unassigned cadets." }
    }
  } else {
    return { error: "Unauthorized: You do not have roster management permissions." }
  }

  // 4. EXECUTE
  // We use the standard client because we assume the RLS policy (from 5_roster_permissions_and_rls.sql) 
  // correctly allows updates if (can_manage_own AND (target.company = my_company OR target.company IS NULL))
  
  const { error } = await supabase
    .from('profiles')
    .update({ role_id: roleId })
    .in('id', userIds)

  if (error) return { error: `Database Error: ${error.message}` }

  revalidatePath('/manage')
  revalidatePath('/roster')
  return { success: true }
}

export async function bulkAssignCompany(userIds: string[], companyId: string) {
  const supabase = createClient()
  const actor = await getActorWithPermissions(supabase)
  
  if (!actor) return { error: "Unauthorized" }

  // 1. SCOPE CHECK
  if (actor.canManageAll) {
     // Global allowed
  } else if (actor.canManageOwn) {
     // Can only move TO own company
     if (companyId !== actor.companyId) {
        return { error: "Permission Denied: You can only assign cadets to your own company." }
     }

     // Verify targets are Unassigned or in Own Company
     const { data: targets } = await supabase
       .from('profiles')
       .select('company_id')
       .in('id', userIds)

     if (!targets) return { error: "Could not verify targets." }

     const allValid = targets.every(t => t.company_id === actor.companyId || t.company_id === null)
     if (!allValid) {
         return { error: "Permission Denied: You can only claim unassigned cadets or move cadets already in your company." }
     }
  } else {
     return { error: "Unauthorized." }
  }

  // 2. EXECUTE
  const { error } = await supabase
    .from('profiles')
    .update({ company_id: companyId })
    .in('id', userIds)

  if (error) return { error: error.message }

  revalidatePath('/manage')
  revalidatePath('/roster')
  return { success: true }
}