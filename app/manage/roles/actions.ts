'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { SupabaseClient } from '@supabase/supabase-js'

export type ApprovalGroupNode = {
  id: string;
  group_name: string;
  next_approver_group_id: string | null;
  company_id: string;
  is_final_authority: boolean;
  role_count?: number; 
}

// --- SECURITY HELPER ---
// Returns true if authorized, throws error if not.
async function requireAuth(supabase: SupabaseClient) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase
    .from('profiles')
    .select('role:role_id(default_role_level)')
    .eq('id', user.id)
    .single()

  const roleLevel = (profile?.role as any)?.default_role_level || 0
  
  // SECURITY POLICY: 
  // Only Staff (50+) or higher can configure the Chain of Command.
  // You can adjust this to 40 if Company Commanders should edit their own structure.
  if (roleLevel < 50) {
    throw new Error("Insufficient permissions: You must be Staff to edit the Chain of Command.")
  }
  
  return user
}

// --- FETCHING (Publicly viewable for transparency, or restrict if needed) ---
export async function getCompanyChain(companyId: string) {
  const supabase = createClient()
  
  // 1. Fetch groups
  const { data: companyGroups, error } = await supabase
    .from('approval_groups')
    .select(`
      id, group_name, next_approver_group_id, company_id, is_final_authority,
      roles:roles(count)
    `)
    .eq('company_id', companyId)

  if (error) {
    console.error('Error fetching chain:', error)
    return []
  }

  // 2. Flatten
  const formattedGroups = companyGroups.map(g => ({
    ...g,
    role_count: g.roles ? (g.roles as any)[0]?.count || 0 : 0
  })) as ApprovalGroupNode[]

  // 3. Fetch external links (Final Authority nodes outside the company)
  const outgoingLinkIds = formattedGroups
    .map(g => g.next_approver_group_id)
    .filter(id => id !== null) as string[];
    
  const existingIds = new Set(formattedGroups.map(g => g.id));
  const missingIds = outgoingLinkIds.filter(id => !existingIds.has(id));

  if (missingIds.length > 0) {
    const { data: externalGroups } = await supabase
      .from('approval_groups')
      .select('id, group_name, next_approver_group_id, company_id, is_final_authority')
      .in('id', missingIds);

    if (externalGroups) {
        formattedGroups.push(...(externalGroups as any[]));
    }
  }

  return formattedGroups;
}

export async function getGroupRoles(groupId: string) {
  const supabase = createClient()
  // View-only access is fine for logged in users
  const { data, error } = await supabase
    .from('roles')
    .select('id, role_name, default_role_level')
    .eq('approval_group_id', groupId)
    .order('role_name')
  
  return { roles: data || [], error: error?.message }
}


// --- MUTATIONS (Protected) ---

export async function createGroupAction(
  companyId: string, 
  groupName: string, 
  childGroupIdToApprove: string 
) {
  const supabase = createClient()
  try { await requireAuth(supabase) } catch (e: any) { return { error: e.message } }

  // 1. Get Child's current parent
  const { data: childGroup, error: fetchError } = await supabase
    .from('approval_groups')
    .select('next_approver_group_id')
    .eq('id', childGroupIdToApprove)
    .single();

  if (fetchError || !childGroup) return { error: "Could not find the group you selected." };

  const oldParentId = childGroup.next_approver_group_id;

  // 2. Insert New Group
  const { data: newGroup, error: createError } = await supabase
    .from('approval_groups')
    .insert({
      group_name: groupName,
      company_id: companyId,
      next_approver_group_id: oldParentId,
      is_final_authority: false
    })
    .select('id')
    .single();

  if (createError) return { error: createError.message };

  // 3. Update Child
  const { error: updateError } = await supabase
    .from('approval_groups')
    .update({ next_approver_group_id: newGroup.id })
    .eq('id', childGroupIdToApprove);

  if (updateError) return { error: "Failed to re-link the chain." };

  revalidatePath('/manage/roles');
  return { success: true };
}

export async function deleteGroupAction(groupId: string) {
  const supabase = createClient()
  try { await requireAuth(supabase) } catch (e: any) { return { error: e.message } }

  // 1. Check if group has roles inside it
  // If we delete the group, the roles become orphans. Block this.
  const { count } = await supabase
    .from('roles')
    .select('*', { count: 'exact', head: true })
    .eq('approval_group_id', groupId)
  
  if (count && count > 0) {
    return { error: "Cannot delete: This group still contains roles. Please move or delete them first." }
  }

  // 2. Get Target info
  const { data: targetGroup } = await supabase
    .from('approval_groups')
    .select('next_approver_group_id')
    .eq('id', groupId)
    .single();
  
  if (!targetGroup) return { error: "Group not found" };
  const parentId = targetGroup.next_approver_group_id;

  // 3. Re-link children (Heal the chain)
  const { error: relinkError } = await supabase
    .from('approval_groups')
    .update({ next_approver_group_id: parentId })
    .eq('next_approver_group_id', groupId);

  if (relinkError) return { error: "Failed to re-link children groups." };

  // 4. Delete
  const { error: deleteError } = await supabase
    .from('approval_groups')
    .delete()
    .eq('id', groupId);

  if (deleteError) return { error: deleteError.message };

  revalidatePath('/manage/roles');
  return { success: true };
}

export async function createRoleAction(
  companyId: string,
  groupId: string,
  roleName: string,
  defaultLevel: number
) {
  const supabase = createClient()
  try { await requireAuth(supabase) } catch (e: any) { return { error: e.message } }

  const { error } = await supabase.from('roles').insert({
    company_id: companyId,
    approval_group_id: groupId,
    role_name: roleName,
    default_role_level: defaultLevel,
    // Auto-set permissions based on level
    can_manage_own_company_roster: defaultLevel >= 40, 
    can_manage_all_rosters: defaultLevel >= 50
  })

  if (error) return { error: error.message }
  revalidatePath('/manage/roles')
  return { success: true }
}

export async function deleteRoleAction(roleId: string) {
  const supabase = createClient()
  try { await requireAuth(supabase) } catch (e: any) { return { error: e.message } }
  
  // 1. CHECK FOR USAGE
  // If a cadet is assigned to this role, we must block deletion or we break the roster.
  const { count } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role_id', roleId)

  if (count && count > 0) {
    return { error: `Cannot delete: ${count} cadet(s) are currently assigned to this role.` }
  }
  
  // 2. Delete
  const { error } = await supabase.from('roles').delete().eq('id', roleId)
  
  if (error) return { error: error.message }
  revalidatePath('/manage/roles')
  return { success: true }
}