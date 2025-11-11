// in app/components/SignOutButton.tsx
'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function SignOutButton() {
  const supabase = createClient()
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    
    // *** FIX: Manually push to /login. ***
    // This is now safe because we fixed the login page.
    router.push('/login')
    
    router.refresh() // Keep this to ensure all server state is cleared
  }

  return (
    <button
      onClick={handleSignOut}
      className="py-2 px-3 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 dark:hover:bg-red-800 transition-colors shadow-sm"
    >
      Sign Out
    </button>
  )
}