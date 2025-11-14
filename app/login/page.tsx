// in app/login/page.tsx
'use client' 

import { createClient } from '@/utils/supabase/client'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react' // We still need useEffect for post-login
import { useTheme } from '@/app/components/ThemeProvider'

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()
  const { theme } = useTheme()

  // This effect ONLY listens for a NEW sign-in event.
  // It no longer checks for an existing session, as the middleware handles that.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          router.push('/')
          router.refresh()
        }

        // Listen for the password recovery event
        if (event === 'PASSWORD_RECOVERY') {
          // Redirect the user to your update-password page
          router.push('/update-password')
          
        }
      }
    )
    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  // We have removed the 'loading' state and the 'checkSession' useEffect.
  // The page now just renders the form immediately.

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