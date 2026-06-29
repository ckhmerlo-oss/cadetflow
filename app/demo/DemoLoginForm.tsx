'use client'

import { useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { getSafeRedirectPath, REDIRECT_PARAM } from '@/utils/auth-redirect'
import { DEMO_PERSONAS, DEMO_PORTAL_LABELS } from '@/app/demo/personas'

export default function DemoLoginForm() {
  const searchParams = useSearchParams()
  const redirectTo = getSafeRedirectPath(searchParams.get(REDIRECT_PARAM))
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const personas = useMemo(() => DEMO_PERSONAS, [])

  async function signInAs(profileId: string) {
    setError(null)
    setLoadingId(profileId)

    try {
      const params = new URLSearchParams({ profileId })
      if (redirectTo !== '/') {
        params.set('redirect', redirectTo)
      }

      window.location.assign(`/api/demo/login?${params.toString()}`)
    } catch (signInError) {
      setError(signInError instanceof Error ? signInError.message : 'Sign in failed.')
      setLoadingId(null)
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4 bg-background">
      <div className="w-full max-w-4xl bg-card border border-border rounded-lg shadow-md p-8 animate-in fade-in zoom-in-95 duration-300">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-foreground">CadetFlow Demo</h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl mx-auto">
            Choose a role to explore the full system. All demo data resets nightly at midnight Eastern Time.
          </p>
        </div>

        {error && (
          <p className="text-destructive text-sm text-center mb-4" role="alert">
            {error}
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {personas.map((persona) => {
            const isLoading = loadingId === persona.profileId
            return (
              <button
                key={persona.profileId}
                type="button"
                disabled={loadingId !== null}
                onClick={() => void signInAs(persona.profileId)}
                className="text-left rounded-lg border border-border bg-background p-4 transition-colors hover:border-primary hover:bg-muted/40 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="font-semibold text-foreground">{persona.displayName}</p>
                    <p className="text-xs text-muted-foreground">{persona.roleLabel}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
                    {DEMO_PORTAL_LABELS[persona.portal]}
                  </span>
                </div>
                {persona.company && (
                  <p className="text-xs text-muted-foreground mb-2">{persona.company}</p>
                )}
                <p className="text-sm text-muted-foreground">{persona.description}</p>
                <p className="mt-3 text-xs font-medium text-primary">
                  {isLoading ? 'Signing in…' : 'Enter as this user →'}
                </p>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
