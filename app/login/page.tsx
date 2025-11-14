// in app/login/page.tsx
'use client' 

import { createClient } from '@/utils/supabase/client'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react' // Remove useState
import { useTheme } from '@/app/components/ThemeProvider'

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()
  const { theme } = useTheme()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          router.push('/')
          router.refresh()
        }
        
        // --- THIS IS THE FIX ---
        // Listen for the password recovery event
        if (event === 'PASSWORD_RECOVERY') {
          // Redirect the user to your update-password page
          router.push('/update-password')
        }
        // --- END OF FIX ---
      }
    )
    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  return (
    <div style={{ width: '100%', maxWidth: '420px', margin: 'auto', paddingTop: '2rem' }}>
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        theme={theme}
        providers={[]} 
        redirectTo="/" 
      />
    </div>
  )
}