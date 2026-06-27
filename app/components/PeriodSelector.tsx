'use client'

import { filterStartedTerms, isHistoricalPeriod } from '@/app/lib/period-utils'
import type { AcademicTermRow, PeriodSelection } from '@/app/lib/period-types'

type PeriodSelectorProps = {
  years: string[]
  terms: AcademicTermRow[]
  value: PeriodSelection
  onChange: (next: PeriodSelection) => void
  disabled?: boolean
  className?: string
}

export default function PeriodSelector({
  years,
  terms,
  value,
  onChange,
  disabled = false,
  className = '',
}: PeriodSelectorProps) {
  const termsForYear = filterStartedTerms(terms)
    .filter((t) => t.school_year === value.schoolYear && t.term_number != null)
    .sort((a, b) => (a.term_number ?? 0) - (b.term_number ?? 0))

  const historical = isHistoricalPeriod(value, terms)
  const showFullYear = termsForYear.length > 0

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex flex-wrap gap-2 items-center">
        <select
          value={value.schoolYear}
          disabled={disabled}
          onChange={(e) => onChange({ schoolYear: e.target.value, termNumber: null })}
          className="block w-full sm:w-44 rounded-md border-input bg-background text-foreground shadow-sm sm:text-sm py-2 focus:ring-ring focus:border-ring"
          aria-label="School year"
        >
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        <select
          value={value.termNumber ?? 'full'}
          disabled={disabled}
          onChange={(e) => {
            const v = e.target.value
            onChange({
              schoolYear: value.schoolYear,
              termNumber: v === 'full' ? null : Number(v),
            })
          }}
          className="block w-full sm:w-44 rounded-md border-input bg-background text-foreground shadow-sm sm:text-sm py-2 focus:ring-ring focus:border-ring"
          aria-label="Term"
        >
          {showFullYear && <option value="full">Full school year</option>}
          {termsForYear.map((t) => (
            <option key={t.id} value={t.term_number ?? ''}>
              {t.term_name}
            </option>
          ))}
        </select>
      </div>

      {historical && (
        <p className="text-xs text-amber-700 dark:text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded px-2 py-1">
          Viewing historical period — read-only
        </p>
      )}
    </div>
  )
}
