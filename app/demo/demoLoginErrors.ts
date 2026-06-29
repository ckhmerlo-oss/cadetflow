export const DEMO_LOGIN_ERROR_PARAM = 'error'
export const DEMO_LOGIN_DETAIL_PARAM = 'detail'
export const DEMO_LOGIN_EMAIL_PARAM = 'email'
export const DEMO_LOGIN_HOST_PARAM = 'host'
export const DEMO_LOGIN_REF_PARAM = 'ref'

export type DemoLoginErrorCode =
  | 'invalid_persona'
  | 'sign_in_failed'
  | 'missing_demo_env'
  | 'wrong_supabase_project'
  | 'config_error'

type DemoLoginErrorParams = {
  code: DemoLoginErrorCode
  detail?: string
  email?: string
  host?: string | null
  supabaseRef?: string | null
}

const ERROR_MESSAGES: Record<DemoLoginErrorCode, string> = {
  invalid_persona: 'That demo persona is not recognized.',
  sign_in_failed: 'Supabase rejected the demo sign-in.',
  missing_demo_env:
    'Demo Supabase environment variables are missing on the server. Set NEXT_PUBLIC_SUPABASE_URL_DEMO and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY_DEMO on Vercel, then redeploy.',
  wrong_supabase_project:
    'The login route connected to the production Supabase project instead of the demo project.',
  config_error: 'Demo login configuration failed.',
}

export function supabaseProjectRef(url: string | undefined | null): string | null {
  if (!url) return null
  try {
    return new URL(url).hostname.split('.')[0] ?? null
  } catch {
    return null
  }
}

export function buildDemoLoginErrorUrl(baseUrl: string, params: DemoLoginErrorParams): URL {
  const url = new URL('/login', baseUrl)
  url.searchParams.set(DEMO_LOGIN_ERROR_PARAM, params.code)

  if (params.detail) {
    url.searchParams.set(DEMO_LOGIN_DETAIL_PARAM, params.detail.slice(0, 300))
  }
  if (params.email) {
    url.searchParams.set(DEMO_LOGIN_EMAIL_PARAM, params.email)
  }
  if (params.host) {
    url.searchParams.set(DEMO_LOGIN_HOST_PARAM, params.host)
  }
  if (params.supabaseRef) {
    url.searchParams.set(DEMO_LOGIN_REF_PARAM, params.supabaseRef)
  }

  return url
}

export type ParsedDemoLoginError = {
  code: DemoLoginErrorCode
  title: string
  detail: string | null
  email: string | null
  host: string | null
  supabaseRef: string | null
}

export function parseDemoLoginError(
  searchParams: Pick<URLSearchParams, 'get'>,
): ParsedDemoLoginError | null {
  const rawCode = searchParams.get(DEMO_LOGIN_ERROR_PARAM)
  if (!rawCode || !(rawCode in ERROR_MESSAGES)) return null

  const code = rawCode as DemoLoginErrorCode
  return {
    code,
    title: ERROR_MESSAGES[code],
    detail: searchParams.get(DEMO_LOGIN_DETAIL_PARAM),
    email: searchParams.get(DEMO_LOGIN_EMAIL_PARAM),
    host: searchParams.get(DEMO_LOGIN_HOST_PARAM),
    supabaseRef: searchParams.get(DEMO_LOGIN_REF_PARAM),
  }
}

export type DemoLoginDiagnostics = {
  requestHost: string | null
  demoEnvironment: boolean
  demoSupabaseConfigured: boolean
  demoPasswordConfigured: boolean
  expectedDemoRef: string
}

export const DEMO_SUPABASE_PROJECT_REF = 'gnxycfheypaciwwzcokj'
