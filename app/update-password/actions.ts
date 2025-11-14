// in app/update-password/actions.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// This function will be called by your form
export async function updatePassword(prevState: any, formData: FormData) {
  const supabase = createClient()

  const newPassword = formData.get('new-password') as string
  const confirmPassword = formData.get('confirm-password') as string

  // --- Start of your original handleSubmit logic ---
  if (newPassword !== confirmPassword) {
    return { error: "Passwords do not match.", success: false }
  }

  if (newPassword.length < 6) {
    return { error: "Password must be at least 6 characters long.", success: false }
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) {
    return { error: error.message, success: false }
  }

  // Sign out the user after a successful password update
  await supabase.auth.signOut()
  
  // Invalidate the login path cache
  revalidatePath('/login', 'layout')
  
  // Return success
  return { error: null, success: true }
  // --- End of your original handleSubmit logic ---
}