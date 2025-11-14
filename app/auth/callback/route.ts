// in app/auth/callback/route.ts
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const type = requestUrl.searchParams.get('type') // <-- Get the type
  const next = requestUrl.searchParams.get('next') ?? '/'

  if (code) {
    const supabase = createClient()
    
    // Use the error-handling version
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) {
        return NextResponse.redirect(
          `${requestUrl.origin}/login?error=Could not authenticate user: ${error.message}`
        )
      }
    } catch (error: any) {
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=Server Error: ${error.message}`
      )
    }
  }

  // --- THIS IS THE FIX ---
  // Check for the 'recovery' type from the email link
  if (type === 'recovery') {
    return NextResponse.redirect(`${requestUrl.origin}/update-password`)
  }

  // Default redirect for sign-in or sign-up
  return NextResponse.redirect(`${requestUrl.origin}${next}`)
}