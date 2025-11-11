// in app/components/SignOutButton.tsx
'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function SignOutButton() {
  const supabase = createClient()
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    // We don't need router.push('/login')
    // The middleware will automatically redirect when it detects no user.
    router.refresh()
  }

  return (
    <button
      onClick={handleSignOut}
      className="py-2 px-3 rounded-md text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
    >
      Sign Out
    </button>
  )
}