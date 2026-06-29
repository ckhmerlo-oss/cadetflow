export const DEMO_HOSTS = ['demo.cadetflow.com', 'demo.localhost'] as const
export const DEMO_ENV_COOKIE = 'cadetflow_env'
export const DEMO_SITE_URL = 'https://demo.cadetflow.com'

export type SupabasePublicConfig = {
  url: string
  key: string
  isDemo: boolean
}

type HeaderBag = { get(name: string): string | null | undefined }

function normalizeHost(host: string | null | undefined): string {
  let normalized = (host ?? '').split(':')[0]?.trim().toLowerCase() ?? ''
  if (normalized.startsWith('www.')) {
    normalized = normalized.slice(4)
  }
  return normalized
}

/** Prefer forwarded host on Vercel/proxies; fall back to Host. */
export function resolveRequestHost(headerBag: HeaderBag): string | null {
  const forwarded = headerBag.get('x-forwarded-host') ?? headerBag.get('x-vercel-forwarded-host')
  const raw = forwarded ?? headerBag.get('host')
  if (!raw) return null
  return raw.split(',')[0]?.trim() ?? null
}

export function isDemoHost(host: string | null | undefined): boolean {
  if (process.env.CADETFLOW_DEMO_MODE === 'true') return true
  const normalized = normalizeHost(host)
  return DEMO_HOSTS.includes(normalized as (typeof DEMO_HOSTS)[number])
}

export function isDemoEnvironment(options?: {
  host?: string | null
  demoCookie?: boolean
}): boolean {
  if (process.env.CADETFLOW_DEMO_MODE === 'true') return true
  if (options?.demoCookie) return true
  return isDemoHost(options?.host)
}

export function getSupabasePublicConfig(host: string | null | undefined): SupabasePublicConfig {
  const demo = isDemoHost(host)

  if (demo) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL_DEMO
    const key =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY_DEMO ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_DEMO

    if (!url || !key) {
      throw new Error(
        'Missing demo Supabase configuration. Set NEXT_PUBLIC_SUPABASE_URL_DEMO and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY_DEMO on Vercel, then redeploy.',
      )
    }

    return { url, key, isDemo: true }
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error(
      'Missing Supabase configuration. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.',
    )
  }

  return { url, key, isDemo: false }
}

export function getSupabaseServiceRoleKey(host: string | null | undefined): string {
  const demo = isDemoHost(host)
  const key = demo
    ? process.env.SUPABASE_SERVICE_ROLE_KEY_DEMO
    : process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!key) {
    throw new Error(
      demo
        ? 'Missing SUPABASE_SERVICE_ROLE_KEY_DEMO.'
        : 'Missing SUPABASE_SERVICE_ROLE_KEY.',
    )
  }

  return key
}

export function demoSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL_DEMO ?? DEMO_SITE_URL
}

export function resolveSiteUrl(host: string | null | undefined): string {
  if (isDemoHost(host)) {
    return demoSiteUrl()
  }

  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
  )
}

export function getDemoInternalPassword(): string {
  return process.env.DEMO_INTERNAL_PASSWORD ?? 'password123'
}
