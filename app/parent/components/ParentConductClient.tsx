'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import PeriodSelector from '@/app/components/PeriodSelector'
import { getConductLevelBadgeClass } from '@/app/lib/blueBook'
import type { AcademicTermRow, PeriodSelection } from '@/app/lib/period-types'
import type { LedgerAuditEvent } from '@/app/lib/period-types'
import {
  getAcademicTermsForYears,
  getCadetLedgerForPeriod,
  getCadetPeriodStats,
  listCadetHistoricalYears,
} from '@/app/lib/period-queries'
import { buildDefaultPeriodSelection, periodBoundsFromTerms, selectableYears, selectableTerms } from '@/app/lib/period-utils'

type ParentConductClientProps = {
  cadetId: string
  cadetName: string
  isArchived: boolean
}

export default function ParentConductClient({
  cadetId,
  cadetName,
  isArchived,
}: ParentConductClientProps) {
  const [historicalYears, setHistoricalYears] = useState<string[]>([])
  const [allTerms, setAllTerms] = useState<AcademicTermRow[]>([])
  const [period, setPeriod] = useState<PeriodSelection | null>(null)
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getCadetPeriodStats>>>(null)
  const [ledger, setLedger] = useState<LedgerAuditEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void (async () => {
      try {
        const years = await listCadetHistoricalYears(cadetId)
        const terms = await getAcademicTermsForYears(years)
        const selectable = selectableYears(terms, years)
        const termRows = selectableTerms(terms)
        const initial = buildDefaultPeriodSelection(selectable, termRows)
        setHistoricalYears(selectable)
        setAllTerms(termRows)
        setPeriod(initial)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load history')
      } finally {
        setLoading(false)
      }
    })()
  }, [cadetId])

  const loadPeriodData = useCallback(async (selection: PeriodSelection) => {
    setLoading(true)
    setError(null)
    try {
      const bounds = periodBoundsFromTerms(allTerms, selection)
      const [statsRes, ledgerRes] = await Promise.all([
        getCadetPeriodStats(cadetId, selection.schoolYear, selection.termNumber),
        bounds
          ? getCadetLedgerForPeriod(cadetId, bounds.start, bounds.end)
          : Promise.resolve([] as LedgerAuditEvent[]),
      ])
      setStats(statsRes)
      setLedger(ledgerRes)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load conduct data')
    } finally {
      setLoading(false)
    }
  }, [allTerms, cadetId])

  useEffect(() => {
    if (period && allTerms.length > 0) {
      void loadPeriodData(period)
    }
  }, [period, allTerms, loadPeriodData])

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      <Link href={`/parent/cadets/${cadetId}`} className="text-sm text-primary hover:underline">
        ← Back to {cadetName}
      </Link>

      <div>
        <h1 className="text-2xl font-bold">Conduct — {cadetName}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Term and year demerits, tour balance, and disciplinary events for the selected period.
        </p>
      </div>

      {isArchived && (
        <div className="p-3 text-sm bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-800 dark:text-amber-200">
          Read-only — cadet archived. Historical conduct is visible; travel and uploads are disabled.
        </div>
      )}

      {historicalYears.length > 0 && period && (
        <PeriodSelector
          years={historicalYears}
          terms={allTerms}
          value={period}
          onChange={setPeriod}
        />
      )}

      {error && (
        <div className="p-3 text-sm bg-destructive/10 border border-destructive/30 rounded-lg text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : stats ? (
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground uppercase">Term demerits</p>
            <p className="text-2xl font-bold">{stats.term_demerits}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground uppercase">Year demerits</p>
            <p className="text-2xl font-bold">{stats.year_demerits}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground uppercase">Conduct</p>
            <span className={`inline-block mt-1 px-2 py-0.5 rounded text-sm font-medium ${getConductLevelBadgeClass(stats.conduct_status)}`}>
              {stats.conduct_status}
            </span>
          </div>
        </div>
      ) : null}

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border font-semibold text-sm">Disciplinary events</div>
        {ledger.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground italic">No events in this period.</p>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-2 text-left text-xs uppercase text-muted-foreground">Date</th>
                <th className="px-4 py-2 text-left text-xs uppercase text-muted-foreground">Event</th>
                <th className="px-4 py-2 text-center text-xs uppercase text-muted-foreground">Dem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {ledger.map((entry, idx) => (
                <tr key={idx} className="hover:bg-muted/30">
                  <td className="px-4 py-2 whitespace-nowrap text-muted-foreground">
                    {new Date(entry.event_date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">{entry.title}</td>
                  <td className="px-4 py-2 text-center font-mono">
                    {entry.demerits_issued > 0
                      ? entry.demerits_issued
                      : entry.tour_change !== 0
                        ? `${entry.tour_change}T`
                        : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
