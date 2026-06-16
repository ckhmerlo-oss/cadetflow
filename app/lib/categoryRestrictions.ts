import { formatPolicyCategory } from '@/app/lib/blueBook'

export type CategoryRestrictionBand = {
  minRoleLevel: number
  allowedCategories: number[]
}

export function filterOffensesByPolicy<T extends { policy_category: number }>(
  offenses: T[],
  allowed: number[]
): T[] {
  return offenses.filter(
    (o) => o.policy_category === 0 || allowed.includes(o.policy_category)
  )
}

export function formatAllowedCategoriesList(allowed: number[]): string {
  const labels = allowed
    .filter((c) => c >= 1 && c <= 3)
    .sort((a, b) => a - b)
    .map((c) => formatPolicyCategory(c))

  if (labels.length === 0) return formatPolicyCategory(1)
  if (labels.length === 1) return labels[0]
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`
  return `${labels.slice(0, -1).join(', ')}, and ${labels[labels.length - 1]}`
}

export function categoryRestrictionErrorMessage(
  policyCategory: number,
  allowed: number[]
): string {
  if (policyCategory === 3) {
    return 'Category III Demerit Reports require Company TAC authority.'
  }
  if (policyCategory === 2) {
    return 'Category II Demerit Reports require Company TAC authority.'
  }

  const allowedText = formatAllowedCategoriesList(allowed)
  return `Your role is limited to ${allowedText} Demerit Reports. Higher categories require Company TAC authority.`
}

export function categoryRestrictionHelperText(allowed: number[]): string | null {
  const sorted = [...allowed].filter((c) => c >= 1 && c <= 3).sort((a, b) => a - b)
  if (sorted.length >= 3) return null
  return `Your role may submit ${formatAllowedCategoriesList(sorted)} Demerit Reports only.`
}
