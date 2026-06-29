import { Suspense } from 'react'
import { cookies, headers } from 'next/headers'
import DemoLoginForm from '@/app/demo/DemoLoginForm'
import { DEMO_SUPABASE_PROJECT_REF } from '@/app/demo/demoLoginErrors'
import ProdLoginForm from '@/app/login/ProdLoginForm'
import {
  DEMO_ENV_COOKIE,
  isDemoEnvironment,
  resolveRequestHost,
} from '@/app/lib/demoEnvironment'

export const dynamic = 'force-dynamic'

function LoginFallback() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4 bg-background">
      <div className="text-muted-foreground">Loading…</div>
    </div>
  )
}

export default async function LoginPage() {
  const headerStore = await headers()
  const cookieStore = await cookies()
  const host = resolveRequestHost(headerStore)
  const demoCookie = cookieStore.get(DEMO_ENV_COOKIE)?.value === 'demo'

  if (isDemoEnvironment({ host, demoCookie })) {
    const diagnostics = {
      requestHost: host,
      demoEnvironment: true,
      demoSupabaseConfigured: Boolean(
        process.env.NEXT_PUBLIC_SUPABASE_URL_DEMO &&
          (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY_DEMO ??
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_DEMO),
      ),
      demoPasswordConfigured: Boolean(process.env.DEMO_INTERNAL_PASSWORD),
      expectedDemoRef: DEMO_SUPABASE_PROJECT_REF,
    }

    return (
      <Suspense fallback={<LoginFallback />}>
        <DemoLoginForm diagnostics={diagnostics} />
      </Suspense>
    )
  }

  return (
    <Suspense fallback={<LoginFallback />}>
      <ProdLoginForm />
    </Suspense>
  )
}
