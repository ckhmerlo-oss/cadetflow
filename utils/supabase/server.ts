import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies, headers } from 'next/headers'
import { cache } from 'react'
import { DEMO_ENV_COOKIE, getSupabasePublicConfig, isDemoHost, resolveRequestHost } from '@/app/lib/demoEnvironment'

const resolveSupabaseConfig = cache(async () => {
  const headerStore = await headers()
  const host = resolveRequestHost(headerStore)
  const cookieStore = await cookies()
  const demoCookie = cookieStore.get(DEMO_ENV_COOKIE)?.value === 'demo'
  const effectiveHost = demoCookie && !isDemoHost(host) ? 'demo.cadetflow.com' : host
  return getSupabasePublicConfig(effectiveHost)
})

export async function createClient(
  cookieStoreOverride?: Awaited<ReturnType<typeof cookies>>,
) {
  const config = await resolveSupabaseConfig()
  const cookieStore = cookieStoreOverride ?? (await cookies())

  return createServerClient(config.url, config.key, {
    cookies: {
      async get(name: string) {
        return cookieStore.get(name)?.value
      },
      async set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch {
          // Server Component — middleware refreshes session cookies.
        }
      },
      async remove(name: string, options: CookieOptions) {
        try {
          cookieStore.delete({ name, ...options })
        } catch {
          // Server Component — middleware refreshes session cookies.
        }
      },
    },
  })
}
