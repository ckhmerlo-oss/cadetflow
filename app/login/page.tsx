// in app/login/page.tsx
'use client' 

import { createClient } from '@/utils/supabase/client'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react' // We still need useEffect for post-login
import { useTheme } from '@/app/components/ThemeProvider'

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()
  const { theme } = useTheme()

  // This effect listens for a NEW sign-in OR a password recovery
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          router.push('/')
          router.refresh()
        }
        
        // --- THIS IS THE CRITICAL FIX ---
        if (event === 'PASSWORD_RECOVERY') {
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