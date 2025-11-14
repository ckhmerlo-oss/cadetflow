// in app/admin/actions.ts
'use server'

// We need TWO clients. One to check the user, one to perform the admin task.
import { createClient as createServerClient } from '@/utils/supabase/server' // Standard server client
import { createClient } from '@supabase/supabase-js' // Admin client

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
    // === START OF FIX ===
    
    // 1. Create a standard client to check the CALLER'S identity
    const supabase = createServerClient()

    // 2. Get the currently logged-in user's data
    const { data: { user }, } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('Not authenticated')
    }

    // 3. Check their role level from the profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role_level')
      .eq('id', user.id)
      .single()

    if (profileError) {
      throw new Error('Could not verify user profile.')
    }
    
    // 4. Enforce security! (Using 105 for "Admin" from your roles.json)
    if (profile.role_level < 105) {
      throw new Error('Permission denied: You are not an administrator.')
    }
    
    // === END OF FIX ===
    
    // 5. Only if the check passes, create the admin client
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 6. Perform the admin action
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword,
    })

    if (error) {
      throw error
    }

    return { error: null, success: true }
  } catch (error: any) {
    return {
      error: `Failed to reset password: ${error.message}`,
      success: false,
    }
  }
}