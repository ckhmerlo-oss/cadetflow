// in app/auth/callback/route.ts
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const type = requestUrl.searchParams.get('type')
  const next = requestUrl.searchParams.get('next') ?? '/'

  if (code) {
    const supabase = createClient()
    
    // Add try...catch to find the error
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) {
        // If Supabase returns an error, show it
        return NextResponse.redirect(
          `${requestUrl.origin}/login?error=Could not authenticate user: ${error.message}`
        )
      }
    } catch (error: any) {
      // If the function throws an error, show it
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=Server Error: ${error.message}`
      )
    }
  }

  // --- UPDATED REDIRECT LOGIC ---
  
  // Redirect to update-password on recovery
  if (type === 'recovery') {
    return NextResponse.redirect(`${requestUrl.origin}/update-password`)
  }

  // Default redirect to home page (or 'next' path)
  return NextResponse.redirect(`${requestUrl.origin}${next}`)
}