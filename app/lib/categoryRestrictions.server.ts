'use server'

import {
  categoryRestrictionErrorMessage,
  type CategoryRestrictionBand,
} from '@/app/lib/categoryRestrictions'
import { formatRpcError, logRpcFailure } from '@/app/lib/rpcDiagnostics'
import { createClient } from '@/utils/supabase/server'

export type AllowedCategoriesResult = {
  categories: number[]
  error?: string
}

export async function getAllowedPolicyCategories(
  roleLevel?: number
): Promise<AllowedCategoriesResult> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('get_allowed_policy_categories', {
    p_role_level: roleLevel ?? null,
  })

  if (error) {
    logRpcFailure('get_allowed_policy_categories', error, { roleLevel })
    return {
      categories: [],
      error: formatRpcError('get_allowed_policy_categories', error),
    }
  }

  const categories = (data as number[] | null) ?? []
  if (categories.length === 0) {
    return { categories: [] }
  }

  return { categories }
}

export async function validatePolicyCategoryForRole(
  policyCategory: number,
  roleLevel: number
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (policyCategory === 0 || roleLevel >= 90) {
    return { ok: true }
  }

  const { categories: allowed, error } = await getAllowedPolicyCategories(roleLevel)
  if (error) {
    return { ok: false, error }
  }
  if (allowed.includes(policyCategory)) {
    return { ok: true }
  }

  return {
    ok: false,
    error: categoryRestrictionErrorMessage(policyCategory, allowed),
  }
}

export type CategoryRestrictionPolicyResult = {
  policy: CategoryRestrictionBand[]
  error?: string
}

export async function getCategoryRestrictionPolicy(): Promise<CategoryRestrictionPolicyResult> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('get_category_restriction_policy')

  if (error || !data) {
    logRpcFailure('get_category_restriction_policy', error)
    return {
      policy: [],
      error: formatRpcError('get_category_restriction_policy', error),
    }
  }

  return {
    policy: (data as Array<{ min_role_level: number; allowed_categories: number[] }>).map(
      (band) => ({
        minRoleLevel: band.min_role_level,
        allowedCategories: band.allowed_categories ?? [1],
      })
    ),
  }
}

export async function updateCategoryRestrictionPolicy(
  bands: CategoryRestrictionBand[]
): Promise<{ error?: string; policy?: CategoryRestrictionBand[] }> {
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
    allowed_categories: band.allowedCategories,
  }))

  const { data, error } = await supabase.rpc('update_category_restriction_policy', {
    p_bands: payload,
  })

  if (error) return { error: formatRpcError('update_category_restriction_policy', error) }

  return {
    policy: (data as Array<{ min_role_level: number; allowed_categories: number[] }>).map(
      (band) => ({
        minRoleLevel: band.min_role_level,
        allowedCategories: band.allowed_categories ?? [1],
      })
    ),
  }
}

export async function getCategoryRestrictionPolicyLog(limit = 10) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('category_restriction_policy_log')
    .select('id, actor_id, action, old_policy, new_policy, created_at')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    logRpcFailure('category_restriction_policy_log', error, { limit })
    return []
  }

  return data ?? []
}
