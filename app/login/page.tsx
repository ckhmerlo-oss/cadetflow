'use client' 

import { createClient } from '@/utils/supabase/client'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { useEffect, useState } from 'react' 
import { useTheme } from '../components/ThemeProvider'

export default function LoginPage() {
  const supabase = createClient()
  const { theme } = useTheme()
  const [showForgotHelp, setShowForgotHelp] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // 1. CHECK IF ALREADY LOGGED IN
  useEffect(() => {
    let isActive = true

    const checkSession = async () => {
        // Use getUser() instead of getSession() to avoid redirecting
        // based on stale cached client session data.
        const { data: { user } } = await supabase.auth.getUser()
        if (isActive && user) window.location.replace('/')
    }

    checkSession()

    return () => {
      isActive = false
    }
  }, [supabase])

  // 2. Handle New Sign-Ins
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
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
    <div className="flex min-h-[80vh] items-center justify-center p-4 bg-background">
      {/* Semantic Card Wrapper */}
      <div className="w-full max-w-md bg-card border border-border rounded-lg shadow-md p-8 animate-in fade-in zoom-in-95 duration-300">
        
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-foreground">Sign In</h1>
          <p className="text-sm text-muted-foreground mt-2">Sign in with your FUMA credentials to access the system.</p>
        </div>

        {isMounted ? (
          <Auth
            supabaseClient={supabase}
            appearance={{ 
                theme: ThemeSupa,
                style: {
                    anchor: { display: 'none' }, // Hiding default links to use custom logic below
                    button: { borderRadius: 'var(--radius)' },
                    input: { borderRadius: 'var(--radius)' },
                },
                className: {
                    // SEMANTIC OVERRIDES:
                    container: 'w-full gap-4',
                    button: 'w-full bg-primary text-primary-foreground hover:bg-primary/90 border-0 transition-colors font-medium py-2',
                    input: 'bg-background text-foreground border-input focus:border-primary focus:ring-primary placeholder:text-muted-foreground',
                    label: 'text-foreground font-medium text-sm mb-1',
                    loader: 'text-primary animate-spin',
                    message: 'text-destructive text-sm mt-1',
                }
            }}
            // We force 'dark' theme prop if it's a dark mode to help Supabase base styles, 
            // but our className overrides above do the heavy lifting.
            theme={theme?.includes('dark') ? 'dark' : 'default'}
            providers={[]} 
          />
        ) : (
          <div className="h-40 rounded-md border border-border bg-muted/30" />
        )}

        <div className="mt-6 text-center border-t border-border pt-4">
          {!showForgotHelp ? (
              <button 
                  onClick={() => setShowForgotHelp(true)}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors hover:underline"
              >
                  Forgot your password?
              </button>
          ) : (
              <div className="p-4 bg-muted/50 rounded-lg border border-border animate-in fade-in slide-in-from-top-2 text-left">
                  <p className="text-sm text-foreground">
                      Please contact <a href="mailto:it@fuma.org" className="text-primary hover:underline font-medium">it@fuma.org</a> for password assistance.
                  </p>
                  <button 
                      onClick={() => setShowForgotHelp(false)}
                      className="text-xs text-muted-foreground hover:text-foreground mt-2 underline"
                  >
                      Close
                  </button>
              </div>
          )}
        </div>
      </div>
    </div>
  )
}