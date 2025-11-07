// in app/login/page.tsx
'use client' 

import { createClient } from '@/utils/supabase/client'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useTheme } from '@/app/components/ThemeProvider'

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  // *** 2. GET the theme from the hook ***
  const { theme } = useTheme()

  // (useEffect for checking session remains the same)
  useEffect(() => {
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/')
        router.refresh()
      } else {
        setLoading(false)
      }
    }
    checkSession()
  }, [supabase, router])

  // (useEffect for auth state change remains the same)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          router.push('/')
          router.refresh()
        }
      }
    )
    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>
  }

  return (
    <div style={{ width: '100%', maxWidth: '420px', margin: 'auto', paddingTop: '2rem' }}>
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        // *** 3. USE the dynamic theme ***
        theme={theme}
        providers={[]} 
        redirectTo="/" 
      />
    </div>
  )
}