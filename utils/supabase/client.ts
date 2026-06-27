import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let browserClient: ReturnType<typeof createBrowserClient> | undefined

export function createClient() {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Missing Supabase configuration. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local, then restart the dev server.'
    )
  }

  if (!browserClient) {
    browserClient = createBrowserClient(supabaseUrl, supabaseKey)
  }

  return browserClient
}
