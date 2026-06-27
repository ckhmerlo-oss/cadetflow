import { NextResponse, type NextRequest } from 'next/server'
import { buildLoginUrl } from '@/utils/auth-redirect'
import { createClient } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    const returnPath =
      request.nextUrl.pathname +
      (request.nextUrl.search ? request.nextUrl.search : '')
    return NextResponse.redirect(new URL(buildLoginUrl(returnPath), request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|login|auth/callback|update-password|invite/move-in).*)',
  ],
}