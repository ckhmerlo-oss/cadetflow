// in middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// ... (all the middleware code you already have) ...
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // We need to create a new Supabase client
  // on every request to refresh the session.
  const supabase = createServerClient(
    // These ENV variables must be set in your .env.local file
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // This line is the most important:
  // It refreshes the session cookie for server-side
  // components, solving the redirect loop.
  await supabase.auth.getSession()

  return response
}


// --- THIS IS THE FIX ---
// Replace your existing config with this:
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - /login (the login page)
     * - /auth/callback (the auth callback route)
     * - /update-password (the password update page)
     *
     * This ensures the middleware ONLY runs on your
     * protected application routes and ignores auth flows.
     */
    '/((?!_next/static|_next/image|favicon.ico|login|auth/callback|update-password).*)',
  ],
}