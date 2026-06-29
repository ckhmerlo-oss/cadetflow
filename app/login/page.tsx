import { Suspense } from 'react'
import { cookies, headers } from 'next/headers'
import {
  DEMO_ENV_COOKIE,
  isDemoEnvironment,
  resolveRequestHost,
} from '@/app/lib/demoEnvironment'
import DemoLoginForm from '@/app/demo/DemoLoginForm'
import ProdLoginForm from '@/app/login/ProdLoginForm'

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
    return (
      <Suspense fallback={<LoginFallback />}>
        <DemoLoginForm />
      </Suspense>
    )
  }

  return (
    <Suspense fallback={<LoginFallback />}>
      <ProdLoginForm />
    </Suspense>
  )
}
