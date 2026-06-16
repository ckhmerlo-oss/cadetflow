'use server'

import type { SubmissionPermissionBand } from '@/app/lib/submissionPermissions'
import { createClient } from '@/utils/supabase/server'

export async function canSubmitIncidents(roleLevel?: number): Promise<boolean> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('can_submit_incidents', {
    p_role_level: roleLevel ?? null,
  })

  if (error) {
    console.error('Failed to resolve incident submission permission:', error.message)
    return (roleLevel ?? 0) >= 20
  }

  return Boolean(data)
}

export async function canSubmitDemerits(roleLevel?: number): Promise<boolean> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('can_submit_demerits', {
    p_role_level: roleLevel ?? null,
  })

  if (error) {
    console.error('Failed to resolve demerit submission permission:', error.message)
    return (roleLevel ?? 0) >= 15
  }

  return Boolean(data)
}

export async function getIncidentSubmissionPolicy(): Promise<SubmissionPermissionBand[]> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('get_incident_submission_policy')

  if (error || !data) {
    return [{ minRoleLevel: 20, allowed: true }]
  }

  return (data as Array<{ min_role_level: number; allowed: boolean }>).map((band) => ({
    minRoleLevel: band.min_role_level,
    allowed: band.allowed,
  }))
}

export async function updateIncidentSubmissionPolicy(
  bands: SubmissionPermissionBand[]
): Promise<{ error?: string; policy?: SubmissionPermissionBand[] }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role:role_id(default_role_level)')
    .eq('id', user.id)
    .single()

  const roleLevel =
    (profile?.role as { default_role_level?: number } | null)?.default_role_level ?? 0
  if (roleLevel < 90) return { error: 'Permission Denied' }

  const payload = bands.map((band) => ({
    min_role_level: band.minRoleLevel,
    allowed: band.allowed,
  }))

  const { data, error } = await supabase.rpc('update_incident_submission_policy', {
    p_bands: payload,
  })

  if (error) return { error: error.message }

  return {
    policy: (data as Array<{ min_role_level: number; allowed: boolean }>).map((band) => ({
      minRoleLevel: band.min_role_level,
      allowed: band.allowed,
    })),
  }
}

export async function getIncidentSubmissionPolicyLog(limit = 10) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('incident_submission_policy_log')
    .select('id, actor_id, action, old_policy, new_policy, created_at')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Failed to load incident submission audit log:', error.message)
    return []
  }

  return data ?? []
}
