export function schoolYearToAYLabel(schoolYear: string): string {
  const parts = schoolYear.split('-').map(Number)
  if (parts.length === 2 && !Number.isNaN(parts[0]) && !Number.isNaN(parts[1])) {
    return `AY${String(parts[0]).slice(-2)}-${String(parts[1]).slice(-2)}`
  }
  return ''
}

export function defaultTermNames(schoolYear?: string): string[] {
  const ay = schoolYear ? schoolYearToAYLabel(schoolYear) : ''
  const suffix = ay ? ` ${ay}` : ''
  return [1, 2, 3, 4, 5].map((n) => `Term ${n}${suffix}`)
}
