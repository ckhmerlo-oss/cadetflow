// in middleware.ts
import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function middleware(request: NextRequest) {
  // Create the client (this is the *only* thing you get from server.ts)
  const supabase = createClient()

  // Refresh session if expired - THIS IS THE IMPORTANT PART
  await supabase.auth.getSession()

  // Just return the standard response
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - /login (the login page itself)
     */
    '/((?!_next/static|_next/image|favicon.ico|login).*)',
  ],
}