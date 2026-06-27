'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import PeriodSelector from '@/app/components/PeriodSelector'
import DepartureBadge from '@/app/components/DepartureBadge'
import type { AcademicTermRow, PeriodSelection } from '@/app/lib/period-types'
import type { CadetHistoryReport } from '@/app/lib/cadet-history-queries'
import { getCadetHistoryReport } from '@/app/lib/cadet-history-queries'

const DEPARTURE_LABELS: Record<string, string> = {
  non_return: 'Non-return',
  withdrawn: 'Withdrawn',
  suspended: 'Suspended',
  dismissal: 'Dismissal',
}

type CadetHistoryClientProps = {
  cadetId: string
  cadetName: string
  cadetRank: string
  isArchived: boolean
  historicalYears: string[]
  allTerms: AcademicTermRow[]
  initialPeriod: PeriodSelection | null
}

export default function CadetHistoryClient({
  cadetId,
  cadetName,
  cadetRank,
  isArchived,
  historicalYears,
  allTerms,
  initialPeriod,
}: CadetHistoryClientProps) {
  const [period, setPeriod] = useState<PeriodSelection | null>(initialPeriod)
  const [fullCareer, setFullCareer] = useState(false)
  const [report, setReport] = useState<CadetHistoryReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateReport = useCallback(async () => {
    if (!fullCareer && !period) {
      setError('Select a school year or term.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await getCadetHistoryReport(cadetId, period, fullCareer)
      setReport(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate report')
      setReport(null)
    } finally {
      setLoading(false)
    }
  }, [cadetId, period, fullCareer])

  useEffect(() => {
    if (initialPeriod || fullCareer) {
      void generateReport()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (report && cadetName) {
      document.title = `${cadetName.split(',')[0]}_SchoolHistory`
    }
    return () => { document.title = 'CadetFlow' }
  }, [report, cadetName])

  const formatDate = (d: string | null) => {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatDateTime = (d: string) =>
    new Date(d).toLocaleString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit', hour: 'numeric', minute: '2-digit' })

  return (
    <>
      <style jsx global>{`
        @media print {
          body { background-color: white !important; color: black !important; }
          .no-print { display: none !important; }
          .print-container { padding: 0 !important; max-width: 100% !important; margin: 0 !important; }
          .print-section { break-inside: avoid; page-break-inside: avoid; }
          .print-card { box-shadow: none !important; border: 1px solid #ccc !important; }
          table { width: 100% !important; border-collapse: collapse !important; font-size: 9pt !important; }
          th, td { border: 1px solid #999 !important; padding: 4px !important; }
        }
      `}</style>

      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 print-container space-y-6">
        <div className="no-print space-y-4">
          <Link href={`/profile/${cadetId}`} className="text-sm text-primary hover:underline">
            ← Back to profile
          </Link>

          <div className="p-3 text-sm bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-900 dark:text-blue-100">
            This report is generated from live records and is not saved. Reprint to refresh.
          </div>

          {isArchived && (
            <div className="p-3 text-sm bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-800 dark:text-amber-200">
              This cadet is archived. Report reflects historical records only.
            </div>
          )}
        </div>

        <div className="print-report-header print-section">
          <h1 className="text-3xl font-bold text-foreground">School History Report</h1>
          <p className="mt-1 text-lg text-muted-foreground">
            {cadetRank} {cadetName}
          </p>
        </div>

        <div className="no-print flex flex-wrap gap-3 items-end bg-card border border-border rounded-xl p-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={fullCareer}
                onChange={(e) => setFullCareer(e.target.checked)}
                className="rounded border-input"
              />
              Full career (all started years)
            </label>
            {!fullCareer && period && (
              <PeriodSelector
                years={historicalYears}
                terms={allTerms}
                value={period}
                onChange={setPeriod}
                disabled={loading}
              />
            )}
          </div>
          <button
            type="button"
            onClick={() => void generateReport()}
            disabled={loading}
            className="py-2 px-4 rounded-md shadow-sm text-sm font-bold text-primary-foreground bg-primary hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? 'Generating…' : 'Generate report'}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            disabled={!report}
            className="py-2 px-4 rounded-md shadow-sm text-sm font-bold border border-border bg-background hover:bg-accent disabled:opacity-50"
          >
            Print
          </button>
        </div>

        {error && <p className="text-destructive no-print">{error}</p>}
        {loading && !report && <p className="text-muted-foreground">Generating report…</p>}

        {report && (
          <div className="space-y-8">
            <div className="print-section print-card bg-card border border-border rounded-xl p-5 text-sm">
              <div className="flex flex-wrap justify-between gap-2">
                <div>
                  <p className="text-xs uppercase font-bold text-muted-foreground">Report scope</p>
                  <p className="font-semibold">{report.scope.label}</p>
                  <p className="text-muted-foreground">
                    {formatDate(report.scope.term_start)} — {formatDate(report.scope.term_end)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase font-bold text-muted-foreground">Generated</p>
                  <p>{formatDateTime(report.generated_at)}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 items-center">
                {report.departure_classification_as_of && (
                  <DepartureBadge classification={report.departure_classification_as_of} />
                )}
                {report.cadet.years_attended > 0 && (
                  <span className="text-xs text-muted-foreground">
                    Years completed: {report.cadet.years_attended}
                  </span>
                )}
                {report.cadet.account_created_at && (
                  <span className="text-xs text-muted-foreground">
                    Account created: {formatDate(report.cadet.account_created_at)}
                  </span>
                )}
              </div>
            </div>

            {(report.archive_intervals.length > 0 || report.role_events.length > 0) && (
              <section className="print-section">
                <h2 className="text-lg font-bold mb-3 border-b border-border pb-1">Lifecycle timeline</h2>
                <ul className="space-y-2 text-sm">
                  {report.cadet.account_created_at && (
                    <li className="flex gap-2">
                      <span className="text-muted-foreground shrink-0">{formatDate(report.cadet.account_created_at)}</span>
                      <span>Account created</span>
                    </li>
                  )}
                  {report.archive_intervals.map((iv) => (
                    <li key={iv.id} className="flex flex-wrap gap-2">
                      <span className="text-muted-foreground shrink-0">{formatDateTime(iv.started_at)}</span>
                      <span>
                        {iv.departure_classification
                          ? (DEPARTURE_LABELS[iv.departure_classification] ?? iv.departure_classification)
                          : 'Archive period'}
                        {iv.ended_at ? ` — reactivated ${formatDateTime(iv.ended_at)}` : ' — ongoing'}
                        {iv.reason ? ` · ${iv.reason}` : ''}
                      </span>
                    </li>
                  ))}
                  {report.role_events.map((ev, i) => (
                    <li key={`role-${i}`} className="flex flex-wrap gap-2">
                      <span className="text-muted-foreground shrink-0">{formatDate(ev.ended_at)}</span>
                      <span>
                        Role: {ev.role_name ?? '—'}
                        {ev.company_name ? ` · ${ev.company_name}` : ''}
                        {ev.school_year ? ` · ${ev.school_year}` : ''}
                        {ev.reason ? ` · ${ev.reason}` : ''}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {report.conduct_by_term.length > 0 && (
              <section className="print-section">
                <h2 className="text-lg font-bold mb-3 border-b border-border pb-1">Conduct by term</h2>
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="min-w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-3 py-2 text-left">Term</th>
                        <th className="px-3 py-2 text-right">Term demerits</th>
                        <th className="px-3 py-2 text-right">Year demerits</th>
                        <th className="px-3 py-2 text-left">Conduct</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-card">
                      {report.conduct_by_term.map((row) => (
                        <tr key={`${row.school_year}-${row.term_number}`}>
                          <td className="px-3 py-2">{row.term_name} · {row.school_year}</td>
                          <td className="px-3 py-2 text-right">{row.term_demerits}</td>
                          <td className="px-3 py-2 text-right">{row.year_demerits}</td>
                          <td className="px-3 py-2">{row.conduct_status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {report.discipline_events.length > 0 && (
              <section className="print-section">
                <h2 className="text-lg font-bold mb-3 border-b border-border pb-1">Disciplinary record</h2>
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="min-w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-3 py-2 text-left">Date</th>
                        <th className="px-3 py-2 text-left">Event</th>
                        <th className="px-3 py-2 text-right">Demerits</th>
                        <th className="px-3 py-2 text-right">Tours</th>
                        <th className="px-3 py-2 text-left">By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-card">
                      {report.discipline_events.map((ev, i) => (
                        <tr key={i}>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {formatDateTime(ev.date_of_offense ?? ev.event_date)}
                          </td>
                          <td className="px-3 py-2">{ev.title}</td>
                          <td className="px-3 py-2 text-right">{ev.demerits_issued || '—'}</td>
                          <td className="px-3 py-2 text-right">
                            {ev.tour_change != null ? Math.abs(ev.tour_change) : '—'}
                          </td>
                          <td className="px-3 py-2">{ev.actor_name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {report.classes.length > 0 && (
              <section className="print-section">
                <h2 className="text-lg font-bold mb-3 border-b border-border pb-1">Classes</h2>
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="min-w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-3 py-2 text-left">Year / Term</th>
                        <th className="px-3 py-2 text-left">Period</th>
                        <th className="px-3 py-2 text-left">Course</th>
                        <th className="px-3 py-2 text-left">Teacher</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-card">
                      {report.classes.map((c, i) => (
                        <tr key={i}>
                          <td className="px-3 py-2">{c.school_year} · T{c.term_number ?? '—'}</td>
                          <td className="px-3 py-2">{c.seminar_period ?? c.slot_type ?? '—'}</td>
                          <td className="px-3 py-2">{c.course_name}</td>
                          <td className="px-3 py-2">{c.teacher_name ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {report.activities_current ? (
              <section className="print-section">
                <h2 className="text-lg font-bold mb-3 border-b border-border pb-1">Athletics &amp; activities</h2>
                <p className="text-xs text-muted-foreground mb-2 italic">
                  Current Only
                </p>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  {report.activities_current.sport_fall && (
                    <div><dt className="text-muted-foreground">Fall sport</dt><dd className="font-medium">{report.activities_current.sport_fall}</dd></div>
                  )}
                  {report.activities_current.sport_winter && (
                    <div><dt className="text-muted-foreground">Winter sport</dt><dd className="font-medium">{report.activities_current.sport_winter}</dd></div>
                  )}
                  {report.activities_current.sport_spring && (
                    <div><dt className="text-muted-foreground">Spring sport</dt><dd className="font-medium">{report.activities_current.sport_spring}</dd></div>
                  )}
                  {report.activities_current.is_in_band && (
                    <div><dt className="text-muted-foreground">Band</dt><dd className="font-medium">Yes</dd></div>
                  )}
                  {(report.activities_current.extracurriculars?.length ?? 0) > 0 && (
                    <div className="sm:col-span-2">
                      <dt className="text-muted-foreground">Extracurriculars</dt>
                      <dd className="font-medium">{report.activities_current.extracurriculars.join(', ')}</dd>
                    </div>
                  )}
                </dl>
              </section>
            ) : (
              !report.scope.full_career && (
                <section className="print-section text-sm text-muted-foreground italic">
                  Athletics and extracurriculars are omitted for historical-only scopes (not versioned per school year).
                </section>
              )
            )}
          </div>
        )}
      </div>
    </>
  )
}
