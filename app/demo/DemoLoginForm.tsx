'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { getSafeRedirectPath, REDIRECT_PARAM } from '@/utils/auth-redirect'
import { DEMO_PERSONAS, DEMO_PORTAL_LABELS } from '@/app/demo/personas'
import {
  DEMO_SUPABASE_PROJECT_REF,
  parseDemoLoginError,
  type DemoLoginDiagnostics,
} from '@/app/demo/demoLoginErrors'

type DemoLoginFormProps = {
  diagnostics: DemoLoginDiagnostics
}

function DiagnosticsPanel({
  diagnostics,
  loginError,
  showAlways,
}: {
  diagnostics: DemoLoginDiagnostics
  loginError: ReturnType<typeof parseDemoLoginError>
  showAlways: boolean
}) {
  if (!showAlways && !loginError) return null

  const refMismatch =
    loginError?.supabaseRef != null && loginError.supabaseRef !== DEMO_SUPABASE_PROJECT_REF

  return (
    <div
      className="mb-6 rounded-lg border border-amber-500/40 bg-amber-500/5 p-4 text-left text-sm"
      role="status"
    >
      <p className="font-semibold text-foreground mb-2">Demo login diagnostics</p>
      <dl className="grid gap-1 text-muted-foreground">
        <div className="flex flex-wrap gap-x-2">
          <dt className="font-medium text-foreground">Request host:</dt>
          <dd>{diagnostics.requestHost ?? '(unknown)'}</dd>
        </div>
        <div className="flex flex-wrap gap-x-2">
          <dt className="font-medium text-foreground">Demo environment:</dt>
          <dd>{diagnostics.demoEnvironment ? 'yes' : 'no'}</dd>
        </div>
        <div className="flex flex-wrap gap-x-2">
          <dt className="font-medium text-foreground">Demo Supabase URL env:</dt>
          <dd>{diagnostics.demoSupabaseConfigured ? 'set' : 'missing — redeploy after adding env vars'}</dd>
        </div>
        <div className="flex flex-wrap gap-x-2">
          <dt className="font-medium text-foreground">DEMO_INTERNAL_PASSWORD env:</dt>
          <dd>{diagnostics.demoPasswordConfigured ? 'set' : 'missing (defaults to password123)'}</dd>
        </div>
        <div className="flex flex-wrap gap-x-2">
          <dt className="font-medium text-foreground">Expected demo project ref:</dt>
          <dd>{diagnostics.expectedDemoRef}</dd>
        </div>
        {loginError?.supabaseRef && (
          <div className="flex flex-wrap gap-x-2">
            <dt className="font-medium text-foreground">Supabase ref used at login:</dt>
            <dd className={refMismatch ? 'text-destructive font-medium' : undefined}>
              {loginError.supabaseRef}
              {refMismatch ? ' (wrong project)' : ''}
            </dd>
          </div>
        )}
        {loginError?.email && (
          <div className="flex flex-wrap gap-x-2">
            <dt className="font-medium text-foreground">Persona email:</dt>
            <dd>{loginError.email}</dd>
          </div>
        )}
        {loginError?.host && (
          <div className="flex flex-wrap gap-x-2">
            <dt className="font-medium text-foreground">Host seen by login route:</dt>
            <dd>{loginError.host}</dd>
          </div>
        )}
      </dl>
      <p className="mt-3 text-xs text-muted-foreground">
        Add <code className="rounded bg-muted px-1">?debug=1</code> to this URL to keep diagnostics visible.
      </p>
    </div>
  )
}

export default function DemoLoginForm({ diagnostics }: DemoLoginFormProps) {
  const searchParams = useSearchParams()
  const redirectTo = getSafeRedirectPath(searchParams.get(REDIRECT_PARAM))
  const loginError = useMemo(() => parseDemoLoginError(searchParams), [searchParams])
  const showDiagnostics = searchParams.get('debug') === '1' || loginError != null

  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [clientError, setClientError] = useState<string | null>(null)

  const personas = useMemo(() => DEMO_PERSONAS, [])

  useEffect(() => {
    if (loginError) {
      setLoadingId(null)
    }
  }, [loginError])

  async function signInAs(profileId: string) {
    setClientError(null)
    setLoadingId(profileId)

    try {
      const params = new URLSearchParams({ profileId })
      if (redirectTo !== '/') {
        params.set('redirect', redirectTo)
      }

      window.location.assign(`/api/demo/login?${params.toString()}`)
    } catch (signInError) {
      setClientError(signInError instanceof Error ? signInError.message : 'Sign in failed.')
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
          <div
            className="mt-4 mx-auto max-w-2xl rounded-lg border border-amber-500/40 bg-amber-500/5 px-4 py-3 text-sm text-foreground"
            role="status"
          >
            <strong>Explore the demo</strong> — click the{' '}
            <span className="font-semibold text-primary">?</span> icon in the header to browse features,
            settings, and what&apos;s coming soon.
          </div>
        </div>

        {(loginError || clientError) && (
          <div
            className="mb-4 rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm"
            role="alert"
          >
            <p className="font-semibold text-destructive">
              {loginError?.title ?? 'Sign in failed'}
            </p>
            {(loginError?.detail || clientError) && (
              <p className="mt-2 text-foreground">{loginError?.detail ?? clientError}</p>
            )}
            {loginError?.code === 'sign_in_failed' && (
              <p className="mt-2 text-muted-foreground">
                Common fixes: confirm <code className="rounded bg-muted px-1">DEMO_INTERNAL_PASSWORD=password123</code> on
                Vercel, re-run <code className="rounded bg-muted px-1">demo-seed.sql</code> on the demo Supabase project,
                ensure Auth → Hooks → Custom access token has{' '}
                <code className="rounded bg-muted px-1">public.custom_access_token_hook</code> deployed (migration{' '}
                <code className="rounded bg-muted px-1">20260730000003</code>), and redeploy after changing env vars.
              </p>
            )}
          </div>
        )}

        <DiagnosticsPanel
          diagnostics={diagnostics}
          loginError={loginError}
          showAlways={showDiagnostics}
        />

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
