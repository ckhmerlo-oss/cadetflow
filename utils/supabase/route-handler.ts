import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import {
  DEMO_ENV_COOKIE,
  getSupabasePublicConfig,
  isDemoHost,
  resolveRequestHost,
} from '@/app/lib/demoEnvironment'

function resolveEffectiveHost(request: NextRequest): string | null {
  const host = resolveRequestHost(request.headers)
  const demoCookie = request.cookies.get(DEMO_ENV_COOKIE)?.value === 'demo'
  if (demoCookie && !isDemoHost(host)) {
    return 'demo.cadetflow.com'
  }
  return host
}

/** Route handlers must use request.headers — headers() can differ from the browser host on Vercel. */
export function createRouteHandlerClient(request: NextRequest, response: NextResponse) {
  const config = getSupabasePublicConfig(resolveEffectiveHost(request))

  if (config.isDemo) {
    response.cookies.set(DEMO_ENV_COOKIE, 'demo', {
      path: '/',
      sameSite: 'lax',
      secure: request.nextUrl.protocol === 'https:',
    })
  }

  const supabase = createServerClient(config.url, config.key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
        if (config.isDemo) {
          response.cookies.set(DEMO_ENV_COOKIE, 'demo', {
            path: '/',
            sameSite: 'lax',
            secure: request.nextUrl.protocol === 'https:',
          })
        }
      },
    },
  })

  return { supabase, config }
}
