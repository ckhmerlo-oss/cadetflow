const DEPARTURE_BADGE: Record<string, { label: string; className: string }> = {
  non_return: {
    label: 'NON-RETURN',
    className: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-900/30 dark:text-slate-200 dark:border-slate-700',
  },
  withdrawn: {
    label: 'WITHDRAWN',
    className: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-200 dark:border-orange-800',
  },
  suspended: {
    label: 'SUSPENDED',
    className: 'bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-800',
  },
  dismissal: {
    label: 'DISMISSAL',
    className: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-200 dark:border-red-800',
  },
}

type DepartureBadgeProps = {
  classification?: string | null
  className?: string
}

export default function DepartureBadge({ classification, className = '' }: DepartureBadgeProps) {
  if (classification && DEPARTURE_BADGE[classification]) {
    const b = DEPARTURE_BADGE[classification]
    return (
      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border shadow-sm ${b.className} ${className}`}>
        {b.label}
      </span>
    )
  }
  return null
}
