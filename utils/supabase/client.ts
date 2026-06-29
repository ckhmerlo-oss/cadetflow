import { createBrowserClient } from '@supabase/ssr'
import { getSupabasePublicConfig, isDemoHost } from '@/app/lib/demoEnvironment'

const browserClients = new Map<string, ReturnType<typeof createBrowserClient>>()

function resolveBrowserHost(): string | null {
  if (typeof window === 'undefined') return null
  return window.location.hostname
}

export function createClient() {
  const host = resolveBrowserHost()
  const config = getSupabasePublicConfig(host)
  const cacheKey = config.isDemo ? 'demo' : 'prod'

  let client = browserClients.get(cacheKey)
  if (!client) {
    client = createBrowserClient(config.url, config.key)
    browserClients.set(cacheKey, client)
  }

  return client
}

export function isBrowserDemoHost(): boolean {
  return isDemoHost(resolveBrowserHost())
}
