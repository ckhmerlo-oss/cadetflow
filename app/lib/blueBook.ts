/**
 * Blue Book 2025 v3.6 aligned terminology and policy helpers.
 * See context/blue-book-key-terms.txt for the full reference.
 */

export const CONDUCT_LEVELS = [
  'Exemplary',
  'Commendable',
  'Satisfactory',
  'Deficient',
  'Unsatisfactory',
] as const

export type ConductLevel = (typeof CONDUCT_LEVELS)[number]

/** Mirrors public.calculate_conduct_status() in Postgres. */
export function calculateConductStatus(
  termDemerits: number,
  yearDemerits: number
): ConductLevel {
  if (termDemerits >= 43 || yearDemerits >= 211) return 'Unsatisfactory'
  if (termDemerits >= 31 || yearDemerits >= 151) return 'Deficient'
  if (termDemerits >= 19 || yearDemerits >= 91) return 'Satisfactory'
  if (termDemerits >= 7 || yearDemerits >= 31) return 'Commendable'
  return 'Exemplary'
}

const POLICY_CATEGORY_ROMAN: Record<number, string> = {
  1: 'I',
  2: 'II',
  3: 'III',
}

export function formatPolicyCategory(policyCategory: number): string {
  const roman = POLICY_CATEGORY_ROMAN[policyCategory]
  if (roman) return `Category ${roman}`
  if (policyCategory === 0) return 'Warning'
  return `Category ${policyCategory}`
}

export type OffenseCategoryConfig = {
  code: string
  label: string
  demerits: number
  policy_cat: number
  color: string
}

/** Internal offense_code tiers mapped to Blue Book category language. */
export const OFFENSE_CATEGORY_CONFIG: Record<string, OffenseCategoryConfig> = {
  '0': {
    code: '0',
    label: 'Warning (0 demerits)',
    demerits: 0,
    policy_cat: 0,
    color: 'bg-muted text-muted-foreground border-border',
  },
  '1': {
    code: '1',
    label: 'Category I (3 demerits)',
    demerits: 3,
    policy_cat: 1,
    color: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
  },
  '2a': {
    code: '2a',
    label: 'Category II (6 demerits)',
    demerits: 6,
    policy_cat: 2,
    color: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
  },
  '2b': {
    code: '2b',
    label: 'Category II (10 demerits)',
    demerits: 10,
    policy_cat: 2,
    color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
  },
  '3a': {
    code: '3a',
    label: 'Category III (15 demerits)',
    demerits: 15,
    policy_cat: 3,
    color: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  },
  '3b': {
    code: '3b',
    label: 'Category III (25 demerits)',
    demerits: 25,
    policy_cat: 3,
    color: 'bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30',
  },
  '3c': {
    code: '3c',
    label: 'Category III (35 demerits)',
    demerits: 35,
    policy_cat: 3,
    color: 'bg-destructive/20 text-destructive border-destructive/30',
  },
}

export function getCategoryKeyFromCode(code: string | null): string {
  if (code && OFFENSE_CATEGORY_CONFIG[code]) return code
  return '1'
}

export function formatOffenseCategoryLabel(
  offenseCode: string | null | undefined,
  policyCategory?: number,
  demerits?: number
): string {
  if (offenseCode && OFFENSE_CATEGORY_CONFIG[offenseCode]) {
    return OFFENSE_CATEGORY_CONFIG[offenseCode].label
  }
  if (policyCategory !== undefined) {
    const base = formatPolicyCategory(policyCategory)
    if (demerits !== undefined) return `${base} (${demerits} demerits)`
    return base
  }
  return offenseCode ? `Category ${offenseCode}` : 'Unknown'
}

export function formatOffenseOptionLabel(
  offenseName: string,
  offenseCode: string | null | undefined,
  policyCategory: number,
  demerits: number
): string {
  const category = formatOffenseCategoryLabel(offenseCode, policyCategory, demerits)
  return `${category} — ${offenseName}`
}

export function getConductLevelPillClass(status: string | null | undefined): string {
  switch (status) {
    case 'Exemplary':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    case 'Commendable':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case 'Satisfactory':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    case 'Deficient':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    case 'Unsatisfactory':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    default:
      return 'bg-muted text-muted-foreground'
  }
}

export function getConductLevelBadgeClass(status: string | null | undefined): string {
  switch (status) {
    case 'Exemplary':
      return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800'
    case 'Commendable':
      return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800'
    case 'Satisfactory':
      return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800'
    case 'Deficient':
      return 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800'
    case 'Unsatisfactory':
      return 'bg-destructive/10 text-destructive border-destructive/20'
    default:
      return 'bg-muted/50 text-foreground border-border'
  }
}
