'use client' 

import { createClient } from '@/utils/supabase/client'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { useEffect, useState } from 'react' 
import { useTheme } from '@/app/components/ThemeProvider'

export default function LoginPage() {
  const supabase = createClient()
  const { theme } = useTheme()
  const [showForgotHelp, setShowForgotHelp] = useState(false)

  // 1. Force Logout on Mount
  // This clears any stale local session data that might cause a redirect loop
  useEffect(() => {
    const doLogout = async () => {
      await supabase.auth.signOut()
    }
    doLogout()
  }, [supabase])

  // 2. Handle New Sign-Ins
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // Hard refresh to ensure server gets the new cookie
          window.location.replace('/') 
        }
        
        if (event === 'PASSWORD_RECOVERY') {
          window.location.replace('/update-password')
        }
      }
    )
    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  return (
    <div style={{ width: '100%', maxWidth: '420px', margin: 'auto', paddingTop: '2rem' }} className="p-4">
      
      <Auth
        supabaseClient={supabase}
        appearance={{ 
            theme: ThemeSupa,
            style: {
                anchor: { display: 'none' }, // Hides default links
                button: { borderRadius: '0.375rem' },
                input: { borderRadius: '0.375rem' },
            }
        }}
        theme={theme}
        providers={[]} 
      />

      <div className="mt-4 text-center">
        {!showForgotHelp ? (
            <button 
                onClick={() => setShowForgotHelp(true)}
                className="text-sm text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors hover:underline"
            >
                Forgot your password?
            </button>
        ) : (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 animate-in fade-in slide-in-from-top-2">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                    Please contact <a href="mailto:it@fuma.org" className="text-indigo-600 hover:underline font-medium">it@fuma.org</a> for password assistance.
                </p>
                <button 
                    onClick={() => setShowForgotHelp(false)}
                    className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 mt-2 underline"
                >
                    Close
                </button>
            </div>
        )}
      </div>
    </div>
  )
}