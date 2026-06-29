import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import {
  DEMO_ENV_COOKIE,
  getSupabasePublicConfig,
  resolveRequestHost,
} from '@/app/lib/demoEnvironment'

export function createClient(request: NextRequest) {
  const host = resolveRequestHost(request.headers)
  const config = getSupabasePublicConfig(host)

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  if (config.isDemo) {
    response.cookies.set(DEMO_ENV_COOKIE, 'demo', {
      path: '/',
      sameSite: 'lax',
      secure: request.nextUrl.protocol === 'https:',
    })
  } else {
    response.cookies.delete(DEMO_ENV_COOKIE)
  }

  const supabase = createServerClient(config.url, config.key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({
          request,
        })
        if (config.isDemo) {
          response.cookies.set(DEMO_ENV_COOKIE, 'demo', {
            path: '/',
            sameSite: 'lax',
            secure: request.nextUrl.protocol === 'https:',
          })
        }
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  return { supabase, response }
}
