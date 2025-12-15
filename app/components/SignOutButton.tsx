'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function SignOutButton() {
  const supabase = createClient()
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh() 
  }

  return (
    <button
      onClick={handleSignOut}
      className="py-2 px-3 rounded-md text-sm font-medium text-destructive-foreground bg-destructive hover:bg-destructive/90 transition-colors shadow-sm"
    >
      Sign Out
    </button>
  )
}