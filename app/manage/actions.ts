'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// Helper function to get the role level of the currently logged-in user
async function getMyRoleLevel(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 0
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role:role_id (default_role_level)')
    .eq('id', user.id)
    .single()
  
  return (profile?.role as any)?.default_role_level || 0
}

export async function createNewRole(prevState: any, formData: FormData) {
  const supabase = createClient()

  // 1. Security Check: Verify user is Role Level 90+
  const userRoleLevel = await getMyRoleLevel(supabase)
  if (userRoleLevel < 90) {
    return { success: false, message: 'Permission Denied: You must be Role Level 90 or higher.' }
  }

  // 2. Get Data from Form
  const roleData = {
    role_name: formData.get('role_name') as string,
    default_role_level: parseInt(formData.get('default_role_level') as string, 10),
    company_id: formData.get('company_id') === 'null' ? null : formData.get('company_id'),
    approval_group_id: formData.get('approval_group_id') === 'null' ? null : formData.get('approval_group_id'),
    can_manage_all_rosters: formData.get('can_manage_all_rosters') === 'on',
    can_manage_own_company_roster: formData.get('can_manage_own_company_roster') === 'on'
  }

  // 3. Validate Data
  if (!roleData.role_name || isNaN(roleData.default_role_level)) {
    return { success: false, message: 'Role Name and Role Level are required.' }
  }

  // 4. Insert into Database
  const { error } = await supabase
    .from('roles')
    .insert(roleData)

  if (error) {
    console.error('Error creating role:', error)
    return { success: false, message: `Database Error: ${error.message}` }
  }

  // 5. Success
  revalidatePath('/manage') // This tells Next.js to refresh the data on the manage page
  return { success: true, message: `Role "${roleData.role_name}" created successfully.` }
}