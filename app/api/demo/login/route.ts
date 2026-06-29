import { NextResponse, type NextRequest } from 'next/server'
import { getSafeRedirectPath } from '@/utils/auth-redirect'
import { getDemoPersona, isAllowedDemoProfileId } from '@/app/demo/personas'
import {
  buildDemoLoginErrorUrl,
  supabaseProjectRef,
} from '@/app/demo/demoLoginErrors'
import {
  getDemoInternalPassword,
  isDemoHost,
  resolveRequestHost,
} from '@/app/lib/demoEnvironment'
import { createRouteHandlerClient } from '@/utils/supabase/route-handler'

function loginErrorRedirect(request: NextRequest, params: Parameters<typeof buildDemoLoginErrorUrl>[1]) {
  return NextResponse.redirect(buildDemoLoginErrorUrl(request.url, params))
}

export async function GET(request: NextRequest) {
  const host = resolveRequestHost(request.headers)

  if (!isDemoHost(host)) {
    return new NextResponse('Demo login is only available on the demo host.', { status: 404 })
  }

  const profileId = request.nextUrl.searchParams.get('profileId')
  if (!profileId || !isAllowedDemoProfileId(profileId)) {
    return loginErrorRedirect(request, { code: 'invalid_persona', host })
  }

  const persona = getDemoPersona(profileId)!
  const redirectTo = getSafeRedirectPath(request.nextUrl.searchParams.get('redirect'))
  const redirectResponse = NextResponse.redirect(new URL(redirectTo, request.url))

  let supabase
  let config

  try {
    ;({ supabase, config } = createRouteHandlerClient(request, redirectResponse))
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'Unknown configuration error'
    console.error('demo login config failed:', detail, { host, email: persona.email })
    return loginErrorRedirect(request, {
      code: detail.includes('Missing demo Supabase') ? 'missing_demo_env' : 'config_error',
      detail,
      email: persona.email,
      host,
    })
  }

  if (!config.isDemo) {
    const ref = supabaseProjectRef(config.url)
    console.error('demo login used non-demo Supabase project', {
      host,
      email: persona.email,
      supabaseRef: ref,
      supabaseUrl: config.url,
    })
    return loginErrorRedirect(request, {
      code: 'wrong_supabase_project',
      detail: `Resolved host "${host ?? 'unknown'}" but Supabase project ref is "${ref ?? 'unknown'}".`,
      email: persona.email,
      host,
      supabaseRef: ref,
    })
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: persona.email,
    password: getDemoInternalPassword(),
  })

  if (error) {
    console.error('demo login failed:', error.message, {
      email: persona.email,
      host,
      supabaseRef: supabaseProjectRef(config.url),
      status: error.status,
    })
    return loginErrorRedirect(request, {
      code: 'sign_in_failed',
      detail: error.message,
      email: persona.email,
      host,
      supabaseRef: supabaseProjectRef(config.url),
    })
  }

  return redirectResponse
}
