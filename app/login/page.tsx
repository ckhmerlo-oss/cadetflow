// in app/login/page.tsx
'use client' 

import { createClient } from '@/utils/supabase/client'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(true) // Add loading state

  // Hook 1: Check if user is ALREADY logged in on page load
  useEffect(() => {
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        // User is already logged in, redirect to home
        router.push('/')
      } else {
        // User is not logged in, show the login form
        setLoading(false)
      }
    }
    checkSession()
  }, [supabase, router])

  // Hook 2: Listen for the SIGNED_IN event
  useEffect(() => {
    // Listen for authentication state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // If the event is SIGNED_IN, redirect to the homepage
        if (event === 'SIGNED_IN' && session) {
          router.push('/')
        }
      }
    )

    // Cleanup subscription on component unmount
    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router]) // Re-run if router or supabase instance changes

  // Show a loading message while checking session
  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>
  }

  // If not loading and no session, show the login form
  return (
    <div style={{ width: '100%', maxWidth: '420px', margin: 'auto', paddingTop: '2rem' }}>
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        providers={[]} 
        // We keep redirectTo as a fallback
        redirectTo="/" 
      />
    </div>
  )
}

