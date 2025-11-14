// in app/auth/callback/route.ts
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const type = requestUrl.searchParams.get('type') // <-- Get the auth type

  if (code) {
    const supabase = createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  // --- UPDATED REDIRECT LOGIC ---

  // Check for the 'recovery' type from the email link
  if (type === 'recovery') {
    // Redirect to the update-password page
    return NextResponse.redirect(`${requestUrl.origin}/update-password`)
  }

  // Default redirect to home page for other types (e.g., magiclink, signup)
  return NextResponse.redirect(requestUrl.origin)
}