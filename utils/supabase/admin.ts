import { createClient as createSupabaseAdminClient, type SupabaseClient } from '@supabase/supabase-js'
import { cache } from 'react'
import { headers } from 'next/headers'
import { getSupabasePublicConfig, getSupabaseServiceRoleKey } from '@/app/lib/demoEnvironment'

export const getRequestHost = cache(async (): Promise<string | null> => {
  try {
    return (await headers()).get('host')
  } catch {
    return null
  }
})

export async function createAdminClient(hostOverride?: string | null): Promise<SupabaseClient> {
  const host = hostOverride ?? (await getRequestHost())
  const { url } = getSupabasePublicConfig(host)
  const serviceKey = getSupabaseServiceRoleKey(host)
  return createSupabaseAdminClient(url, serviceKey)
}

export function createAdminClientSync(host: string | null | undefined): SupabaseClient {
  const { url } = getSupabasePublicConfig(host)
  const serviceKey = getSupabaseServiceRoleKey(host)
  return createSupabaseAdminClient(url, serviceKey)
}
