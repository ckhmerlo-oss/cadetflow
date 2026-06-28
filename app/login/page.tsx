'use client'

import { createClient } from '@/utils/supabase/client'
import { getSafeRedirectPath, REDIRECT_PARAM } from '@/utils/auth-redirect'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useMemo, useState } from 'react'
import type { AuthChangeEvent, AuthError, Session } from '@supabase/supabase-js'

function formatAuthError(error: AuthError | null): string {
  if (!error) return ''

  const msg = error.message?.trim()
  if (msg && msg !== '{}') return msg

  if (error.status === 500) {
    return 'Authentication server error. If running locally, run: npm run fix:auth (or supabase db reset).'
  }

  return 'Sign in failed. Check your email and password.'
}

function LoginForm() {
  const supabase = useMemo(() => createClient(), [])
  const searchParams = useSearchParams()
  const redirectTo = getSafeRedirectPath(searchParams.get(REDIRECT_PARAM))

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showForgotHelp, setShowForgotHelp] = useState(false)

  useEffect(() => {
    let isActive = true

    const checkSession = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (isActive && user) window.location.replace(redirectTo)
    }

    void checkSession()

    return () => {
      isActive = false
    }
  }, [supabase, redirectTo])

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      if (event === 'SIGNED_IN' && session) {
        window.location.replace(redirectTo)
      }
      if (event === 'PASSWORD_RECOVERY') {
        window.location.replace('/update-password')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, redirectTo])

  async function handleSignIn(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setLoading(true)

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError) {
      setError(formatAuthError(signInError))
      setLoading(false)
      return
    }

    window.location.replace(redirectTo)
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md bg-card border border-border rounded-lg shadow-md p-8 animate-in fade-in zoom-in-95 duration-300">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-foreground">Sign In</h1>
          <p className="text-sm text-muted-foreground mt-2">Sign in with your FUMA credentials to access the system.</p>
        </div>

        <form onSubmit={handleSignIn} className="space-y-4">
          <label className="block text-sm">
            <span className="font-medium text-foreground mb-1 block">Email address</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="w-full rounded-md border-input bg-background text-foreground shadow-sm py-2 px-3 focus:ring-ring focus:border-ring placeholder:text-muted-foreground"
            />
          </label>

          <label className="block text-sm">
            <span className="font-medium text-foreground mb-1 block">Your Password</span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              className="w-full rounded-md border-input bg-background text-foreground shadow-sm py-2 px-3 focus:ring-ring focus:border-ring placeholder:text-muted-foreground"
            />
          </label>

          {error && (
            <p className="text-destructive text-sm" role="alert">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 border-0 transition-colors font-medium py-2 rounded-md disabled:opacity-60"
          >
            {loading ? 'Signing in …' : 'Sign in'}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-border pt-4">
          {!showForgotHelp ? (
            <button
              type="button"
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
                type="button"
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

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[80vh] items-center justify-center p-4 bg-background">
        <div className="text-muted-foreground">Loading…</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
