import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export function createClient(
  cookieStoreOverride?: Awaited<ReturnType<typeof cookies>>
) {
  const cookieStore = cookieStoreOverride ?? cookies()

  return createServerClient(
    supabaseUrl!,
    supabaseKey!,
    {
      cookies: {
        async get(name: string) {
          return (await cookieStore).get(name)?.value
        },
        async set(name: string, value: string, options: CookieOptions) {
          try {
            (await cookieStore).set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware.
          }
        },
        async remove(name: string, options: CookieOptions) {
          try {
            (await cookieStore).delete({ name, ...options })
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware.
          }
        },
      },
    }
  )
}