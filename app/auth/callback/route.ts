// in app/auth/callback/route.ts
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/'

  if (code) {
    const supabase = createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Error exchanging code for session:', error.message)
      return NextResponse.redirect(new URL('/login?error=auth_error', request.url))
    }
    
    // Check if this was a password recovery link
    if (data.session?.user?.recovery_sent_at) {
      // It was a recovery link. Redirect to the update-password page.
      // The session cookie is now set, so the update-password page will be secure.
      return NextResponse.redirect(new URL('/update-password', request.url))
    }

    // Standard sign-in or sign-up
    return NextResponse.redirect(new URL(next, request.url))
  }

  // Fallback redirect
  return NextResponse.redirect(new URL('/login?error=no_code', request.url))
}