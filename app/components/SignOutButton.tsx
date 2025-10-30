// in app/components/SignOutButton.tsx
'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function SignOutButton() {
  const supabase = createClient()
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login') // Redirect to login page
    router.refresh() // Ensure session is cleared
  }

  return (
    <button
      onClick={handleSignOut}
      className="py-2 px-4 rounded-md no-underline bg-red-600 text-white hover:bg-red-700"
    >
      Sign Out
    </button>
  )
}