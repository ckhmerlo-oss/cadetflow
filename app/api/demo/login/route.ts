import { NextResponse, type NextRequest } from 'next/server'
import { getSafeRedirectPath } from '@/utils/auth-redirect'
import { getDemoPersona, isAllowedDemoProfileId } from '@/app/demo/personas'
import { getDemoInternalPassword, isDemoHost, resolveRequestHost } from '@/app/lib/demoEnvironment'
import { createRouteHandlerClient } from '@/utils/supabase/route-handler'

export async function GET(request: NextRequest) {
  const host = resolveRequestHost(request.headers)
  if (!isDemoHost(host)) {
    return new NextResponse(null, { status: 404 })
  }

  const profileId = request.nextUrl.searchParams.get('profileId')
  if (!profileId || !isAllowedDemoProfileId(profileId)) {
    return NextResponse.redirect(new URL('/login?error=invalid_persona', request.url))
  }

  const persona = getDemoPersona(profileId)!
  const redirectTo = getSafeRedirectPath(request.nextUrl.searchParams.get('redirect'))
  const redirectResponse = NextResponse.redirect(new URL(redirectTo, request.url))
  const { supabase } = createRouteHandlerClient(request, redirectResponse)

  const { error } = await supabase.auth.signInWithPassword({
    email: persona.email,
    password: getDemoInternalPassword(),
  })

  if (error) {
    console.error('demo login failed:', error.message, { email: persona.email, host })
    return NextResponse.redirect(new URL('/login?error=sign_in_failed', request.url))
  }

  return redirectResponse
}
