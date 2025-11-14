// in app/admin/actions.ts
'use server'

import { createClient } from '@supabase/supabase-js'

// This server action securely creates a temporary admin client
// to perform the password update.
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
    // Create the admin client *inside* the server action
    // This uses the SERVICE_ROLE_KEY, which must never be exposed to the client.
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // This is the new key you must add
    )

    const { error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    )

    if (error) {
      throw error
    }

    // On success, return a success state
    return { error: null, success: true }

  } catch (error: any) {
    // On failure, return the error message
    return { error: `Failed to reset password: ${error.message}`, success: false }
  }
}