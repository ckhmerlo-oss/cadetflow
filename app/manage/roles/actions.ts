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
async function requireAuth(supabase: SupabaseClient) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase
    .from('profiles')
    .select('role:role_id(default_role_level)')
    .eq('id', user.id)
    .single()

  const roleLevel = (profile?.role as any)?.default_role_level || 0
  
  if (roleLevel < 50) {
    throw new Error("Insufficient permissions: You must be Staff to edit the Chain of Command.")
  }
  
  return user
}

// --- FETCHING ---
export async function getCompanyChain(companyId: string) {
  const supabase = createClient()
  
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

  const formattedGroups = companyGroups.map(g => ({
    ...g,
    role_count: g.roles ? (g.roles as any)[0]?.count || 0 : 0
  })) as ApprovalGroupNode[]

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
  const { data, error } = await supabase
    .from('roles')
    .select('id, role_name, default_role_level')
    .eq('approval_group_id', groupId)
    .order('role_name')
  
  return { roles: data || [], error: error?.message }
}

export async function getAllApprovalGroups() {
  const supabase = createClient()
  try { await requireAuth(supabase) } catch (e) { return [] }

  const { data, error } = await supabase
    .from('approval_groups')
    .select(`
      id, 
      group_name, 
      company:company_id (company_name)
    `)
    .order('group_name')
  
  if (error) return []
  
  return data.map((g: any) => ({
    id: g.id,
    label: `${g.group_name} (${g.company?.company_name || 'No Co.'})`
  }))
}


// --- MUTATIONS ---

export async function createGroupAction(
  companyId: string, 
  groupName: string | null, 
  childGroupIdToApprove?: string | null,
  existingGroupId?: string | null
) {
  const supabase = createClient()
  try { await requireAuth(supabase) } catch (e: any) { return { error: e.message } }

  let targetParentId = existingGroupId;

  if (!targetParentId) {
      if (!groupName) return { error: "Group Name is required for new groups." };

      let nextLink = null;
      
      if (childGroupIdToApprove) {
          const { data: child } = await supabase.from('approval_groups').select('next_approver_group_id').eq('id', childGroupIdToApprove).single();
          nextLink = child?.next_approver_group_id || null;
      }

      const { data: newGroup, error: createError } = await supabase
        .from('approval_groups')
        .insert({
          group_name: groupName,
          company_id: companyId,
          next_approver_group_id: nextLink,
          is_final_authority: !nextLink
        })
        .select('id')
        .single();

      if (createError) return { error: createError.message };
      targetParentId = newGroup.id;
  }

  if (childGroupIdToApprove && targetParentId) {
      const { error: updateError } = await supabase
        .from('approval_groups')
        .update({ 
            next_approver_group_id: targetParentId,
            is_final_authority: false
        })
        .eq('id', childGroupIdToApprove);

      if (updateError) return { error: "Failed to re-link the chain." };
  }

  revalidatePath('/manage/roles');
  return { success: true };
}

export async function createSubordinateGroupAction(
  companyId: string,
  groupName: string | null,
  parentGroupId: string,
  existingGroupId?: string | null
) {
  const supabase = createClient()
  try { await requireAuth(supabase) } catch (e: any) { return { error: e.message } }

  if (existingGroupId) {
      const { error } = await supabase
        .from('approval_groups')
        .update({ 
            next_approver_group_id: parentGroupId,
            is_final_authority: false 
        })
        .eq('id', existingGroupId);
      
      if (error) return { error: error.message };
  } else {
      if (!groupName) return { error: "Name required." };
      const { error } = await supabase
        .from('approval_groups')
        .insert({
          group_name: groupName,
          company_id: companyId,
          next_approver_group_id: parentGroupId,
          is_final_authority: false
        });
      if (error) return { error: error.message };
  }

  revalidatePath('/manage/roles');
  return { success: true };
}

export async function deleteGroupAction(groupId: string) {
  const supabase = createClient()
  try { await requireAuth(supabase) } catch (e: any) { return { error: e.message } }

  const { count } = await supabase
    .from('roles')
    .select('*', { count: 'exact', head: true })
    .eq('approval_group_id', groupId)
  
  if (count && count > 0) {
    return { error: "Cannot delete: This group still contains roles. Please move or delete them first." }
  }

  const { data: targetGroup } = await supabase
    .from('approval_groups')
    .select('next_approver_group_id')
    .eq('id', groupId)
    .single();
  
  if (!targetGroup) return { error: "Group not found" };
  const parentId = targetGroup.next_approver_group_id;

  const { error: relinkError } = await supabase
    .from('approval_groups')
    .update({ 
        next_approver_group_id: parentId,
        is_final_authority: (parentId === null) 
    })
    .eq('next_approver_group_id', groupId);

  if (relinkError) return { error: "Failed to re-link children groups." };

  const { error: deleteError } = await supabase
    .from('approval_groups')
    .delete()
    .eq('id', groupId);

  if (deleteError) return { error: deleteError.message };

  revalidatePath('/manage/roles');
  return { success: true };
}

// --- NEW ROLE ASSIGNMENT ACTIONS ---

// Action 1: Fetch Unassigned Roles for a Company
export async function getCompanyRoles(companyId: string) {
  const supabase = createClient()
  
  // We want roles that are:
  // 1. Belonging to this company
  // 2. Not assigned to ANY approval group (approval_group_id IS NULL)
  // OR roles that belong to this group (to show current) - but RoleListModal fetches current separately.
  // So here we just want AVAILABLE roles.
  
  const { data, error } = await supabase
    .from('roles')
    .select('id, role_name, default_role_level')
    .eq('company_id', companyId)
    .is('approval_group_id', null)
    .order('role_name')

  return { roles: data || [], error: error?.message }
}

// Action 2: Link Role to Group
export async function assignRoleToGroupAction(roleId: string, groupId: string) {
  const supabase = createClient()
  try { await requireAuth(supabase) } catch (e: any) { return { error: e.message } }

  const { error } = await supabase
    .from('roles')
    .update({ approval_group_id: groupId })
    .eq('id', roleId)

  if (error) return { error: error.message }
  revalidatePath('/manage/roles')
  return { success: true }
}

// Action 3: Unlink Role from Group
export async function unassignRoleAction(roleId: string) {
  const supabase = createClient()
  try { await requireAuth(supabase) } catch (e: any) { return { error: e.message } }

  const { error } = await supabase
    .from('roles')
    .update({ approval_group_id: null })
    .eq('id', roleId)

  if (error) return { error: error.message }
  revalidatePath('/manage/roles')
  return { success: true }
}