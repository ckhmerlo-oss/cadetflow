// in middleware.ts (your root file)
import { type NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/middleware' // <-- Import from the NEW file

export async function middleware(request: NextRequest) {
  // createClient will now return supabase and a response
  const { supabase, response } = createClient(request)

  // Refresh the user's session
  await supabase.auth.getSession()

  // Return the response (which now has the updated cookie)
  return response
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