'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { defaultTermNames } from '@/app/lib/school-year'
import {
  closeSchoolYear,
  getGraduationRoster,
  getSchoolYearTerms,
  getYearClosePreflight,
  getYearCloseReminderPreview,
  markCadetsGraduated,
  sendYearCloseReminders,
  setDepartureClassification,
  setupSchoolYearTermsForClose,
  unmarkCadetsGraduated,
  type GraduationRosterCadet,
  type YearClosePreflight,
  type YearClosePreflightItem,
  type YearCloseReminderPreview,
} from '@/app/oversight/actions'

type TermRow = { school_year: string; archived: boolean }
type YearTermForm = { name: string; start: string; end: string }
type GradeFilter = 'seniors' | '12' | 'pg' | 'all'

function isGrade12(grade: string | null | undefined): boolean {
  if (!grade) return false
  const g = grade.trim()
  return g === '12' || g === '12th' || /^grade\s*12$/i.test(g)
}

function isPG(grade: string | null | undefined): boolean {
  if (!grade) return false
  return grade.trim().toUpperCase() === 'PG'
}

function matchesGradeFilter(grade: string | null | undefined, filter: GradeFilter): boolean {
  switch (filter) {
    case '12':
      return isGrade12(grade)
    case 'pg':
      return isPG(grade)
    case 'all':
      return true
    default:
      return isGrade12(grade) || isPG(grade)
  }
}

function nextYearLabel(year: string): string {
  const parts = year.split('-').map(Number)
  if (parts.length === 2 && !Number.isNaN(parts[0]) && !Number.isNaN(parts[1])) {
    return `${parts[0] + 1}-${parts[1] + 1}`
  }
  return ''
}

function defaultTermDates(schoolYear?: string): YearTermForm[] {
  const names = defaultTermNames(schoolYear)
  const base = new Date()
  return [0, 1, 2, 3, 4].map((i) => {
    const start = new Date(base)
    start.setDate(start.getDate() + i * 30)
    const end = new Date(start)
    end.setDate(end.getDate() + 29)
    return {
      name: names[i],
      start: start.toISOString().slice(0, 10),
      end: end.toISOString().slice(0, 10),
    }
  })
}

function ItemLinkList({ items, emptyLabel }: { items?: YearClosePreflightItem[]; emptyLabel?: string }) {
  if (!items?.length) {
    return emptyLabel ? <span className="text-muted-foreground">{emptyLabel}</span> : null
  }
  return (
    <ul className="list-none space-y-1 mt-1">
      {items.map((item) => (
        <li key={item.id}>
          <Link href={item.href} className="text-primary hover:underline text-sm">
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  )
}

export default function YearCloseWizard({
  activeYears,
  allTerms,
  canForceArchive = false,
}: {
  activeYears: string[]
  allTerms: TermRow[]
  canForceArchive?: boolean
}) {
  const [schoolYear, setSchoolYear] = useState(activeYears[0] ?? '')
  const [nextSchoolYear, setNextSchoolYear] = useState('')
  const [yearTerms, setYearTerms] = useState<YearTermForm[]>(defaultTermDates())
  const [termsSaved, setTermsSaved] = useState(false)

  const [preflight, setPreflight] = useState<YearClosePreflight | null>(null)
  const [reminderPreview, setReminderPreview] = useState<YearCloseReminderPreview | null>(null)

  const [roster, setRoster] = useState<GraduationRosterCadet[]>([])
  const [gradModalOpen, setGradModalOpen] = useState(false)
  const [graduationSearch, setGraduationSearch] = useState('')
  const [gradeFilter, setGradeFilter] = useState<GradeFilter>('seniors')
  const [selectedGraduated, setSelectedGraduated] = useState<Set<string>>(new Set())
  const [graduationSaved, setGraduationSaved] = useState<string | null>(null)

  const [confirmText, setConfirmText] = useState('')
  const [forceArchive, setForceArchive] = useState(false)
  const [forceConfirmText, setForceConfirmText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<Record<string, unknown> | null>(null)
  const [remindersResult, setRemindersResult] = useState<{
    recipients: number
    enqueued: number
    skipped: number
    emailSent: number
    emailFailed: number
    emailError?: string
  } | null>(null)
  const [resolvingCadetId, setResolvingCadetId] = useState<string | null>(null)

  const configuredNextYears = [...new Set(
    allTerms.filter((t) => !t.archived).map((t) => t.school_year)
  )].filter((y) => y !== schoolYear)

  const loadNextYearTerms = useCallback(async (year: string) => {
    if (!year) return
    const terms = await getSchoolYearTerms(year)
    if (terms.length >= 5) {
      setYearTerms(
        terms.slice(0, 5).map((t: { term_name: string; start_date: string; end_date: string }) => ({
          name: t.term_name,
          start: t.start_date,
          end: t.end_date,
        }))
      )
      setTermsSaved(true)
    } else {
      setYearTerms(defaultTermDates(year))
      setTermsSaved(false)
    }
  }, [])

  const loadPreflight = useCallback(async () => {
    if (!schoolYear) return
    const next = nextSchoolYear || nextYearLabel(schoolYear)
    const { data, error: err } = await getYearClosePreflight(schoolYear, next || undefined)
    if (err) setError(err)
    else setPreflight(data)
    if (!nextSchoolYear && next) setNextSchoolYear(next)
  }, [schoolYear, nextSchoolYear])

  const loadReminderPreview = useCallback(async () => {
    if (!schoolYear) return
    const { data, error: err } = await getYearCloseReminderPreview(schoolYear)
    if (err) setError(err)
    else setReminderPreview(data)
  }, [schoolYear])

  const loadRoster = useCallback(async () => {
    const { data, error: err } = await getGraduationRoster()
    if (err) setError(err)
    else {
      setRoster(data)
      setSelectedGraduated(new Set(data.filter((c) => c.graduated_at).map((c) => c.id)))
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await loadPreflight()
      await loadReminderPreview()
      setLoading(false)
    }
    init()
  }, [loadPreflight, loadReminderPreview])

  const openGradModal = async () => {
    setGradModalOpen(true)
    if (roster.length === 0) {
      setLoading(true)
      await loadRoster()
      setLoading(false)
    }
  }

  useEffect(() => {
    if (nextSchoolYear) loadNextYearTerms(nextSchoolYear)
  }, [nextSchoolYear, loadNextYearTerms])

  const filteredRoster = useMemo(() => {
    const q = graduationSearch.toLowerCase()
    return roster.filter((c) => {
      if (!matchesGradeFilter(c.grade_level, gradeFilter)) return false
      if (!q) return true
      return (
        c.last_name.toLowerCase().includes(q)
        || c.first_name.toLowerCase().includes(q)
        || (c.company_name ?? '').toLowerCase().includes(q)
        || (c.grade_level ?? '').toLowerCase().includes(q)
      )
    })
  }, [roster, graduationSearch, gradeFilter])

  const graduatedCount = useMemo(
    () => roster.filter((c) => c.graduated_at).length,
    [roster]
  )

  const handleSaveTerms = async () => {
    if (!nextSchoolYear) return
    setLoading(true)
    setError(null)
    const res = await setupSchoolYearTermsForClose(nextSchoolYear, yearTerms)
    setLoading(false)
    if (res.error) setError(res.error)
    else {
      setTermsSaved(true)
      await loadPreflight()
    }
  }

  const handleSaveGraduation = async () => {
    setLoading(true)
    setError(null)
    setGraduationSaved(null)

    const toMark = roster.filter((c) => selectedGraduated.has(c.id) && !c.graduated_at).map((c) => c.id)
    const toUnmark = roster.filter((c) => !selectedGraduated.has(c.id) && c.graduated_at).map((c) => c.id)

    if (toMark.length) {
      const res = await markCadetsGraduated(toMark)
      if (res.error) {
        setLoading(false)
        setError(res.error)
        return
      }
    }
    if (toUnmark.length) {
      const res = await unmarkCadetsGraduated(toUnmark)
      if (res.error) {
        setLoading(false)
        setError(res.error)
        return
      }
    }

    setLoading(false)
    setGraduationSaved(`${toMark.length} marked, ${toUnmark.length} unmarked`)
    await loadRoster()
    setGradModalOpen(false)
  }

  const toggleGraduated = (id: string) => {
    setSelectedGraduated((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleSendReminders = async () => {
    setLoading(true)
    setError(null)
    const res = await sendYearCloseReminders(schoolYear)
    setLoading(false)
    if (res.error) setError(res.error)
    else {
      setRemindersResult({
        recipients: res.recipients ?? 0,
        enqueued: res.enqueued ?? 0,
        skipped: res.skipped ?? 0,
        emailSent: res.emailSent ?? 0,
        emailFailed: res.emailFailed ?? 0,
        emailError: res.emailError,
      })
    }
  }

  const handleResolveSuspended = async (cadetId: string, classification: 'non_return' | 'dismissal') => {
    setResolvingCadetId(cadetId)
    setError(null)
    const res = await setDepartureClassification(cadetId, classification)
    setResolvingCadetId(null)
    if (res.error) setError(res.error)
    else await loadPreflight()
  }

  const handleClose = async () => {
    if (confirmText !== schoolYear) {
      setError(`Type "${schoolYear}" to confirm.`)
      return
    }
    if (forceArchive) {
      if (!canForceArchive) {
        setError('Force archive requires admin role level above 100.')
        return
      }
      if (forceConfirmText !== 'FORCE ARCHIVE') {
        setError('Type "FORCE ARCHIVE" to confirm force archive.')
        return
      }
    }
    setLoading(true)
    setError(null)
    const res = await closeSchoolYear(schoolYear, nextSchoolYear, forceArchive)
    setLoading(false)
    if (res.error) setError(res.error)
    else {
      setSuccess(res.counts as Record<string, unknown>)
      await loadPreflight()
    }
  }

  const refreshAll = async () => {
    setLoading(true)
    await loadPreflight()
    await loadReminderPreview()
    setLoading(false)
  }

  if (success) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-semibold text-green-600">School year closed successfully</h2>
        <pre className="text-xs bg-muted p-3 rounded overflow-auto">{JSON.stringify(success, null, 2)}</pre>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin" className="text-sm text-primary hover:underline">Admin settings</Link>
          <Link href="/admin?tab=archived" className="text-sm text-primary hover:underline">Archived users — reactivate returners</Link>
          <Link href="/manage" className="text-sm text-primary hover:underline">Manage roster</Link>
        </div>
      </div>
    )
  }

  const inputClass = 'mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm'

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 text-destructive bg-destructive/10 border border-destructive/20 rounded-md text-sm">{error}</div>
      )}

      {/* Step 1: Years + terms */}
      <section className="bg-card border border-border rounded-lg p-6 space-y-4">
        <h2 className="font-semibold text-foreground">1. Select years and configure next-year terms</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Closing school year</label>
            <select
              value={schoolYear}
              onChange={(e) => { setSchoolYear(e.target.value); setConfirmText('') }}
              className={inputClass}
            >
              {activeYears.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Next school year</label>
            <input
              type="text"
              value={nextSchoolYear}
              onChange={(e) => { setNextSchoolYear(e.target.value); setTermsSaved(false) }}
              placeholder="2026-2027"
              className={inputClass}
            />
            {configuredNextYears.length > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Already configured: {configuredNextYears.join(', ')}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-3 pt-2 border-t border-border">
          <p className="text-sm text-muted-foreground">Configure all 5 terms for {nextSchoolYear || 'the next year'}.</p>
          {yearTerms.map((t, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input
                type="text"
                value={t.name}
                onChange={(e) => {
                  const next = [...yearTerms]
                  next[i] = { ...next[i], name: e.target.value }
                  setYearTerms(next)
                  setTermsSaved(false)
                }}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              />
              <input
                type="date"
                value={t.start}
                onChange={(e) => {
                  const next = [...yearTerms]
                  next[i] = { ...next[i], start: e.target.value }
                  setYearTerms(next)
                  setTermsSaved(false)
                }}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              />
              <input
                type="date"
                value={t.end}
                onChange={(e) => {
                  const next = [...yearTerms]
                  next[i] = { ...next[i], end: e.target.value }
                  setYearTerms(next)
                  setTermsSaved(false)
                }}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              />
              <span className="text-sm text-muted-foreground self-center">Term {i + 1}</span>
            </div>
          ))}
          <button
            type="button"
            onClick={handleSaveTerms}
            disabled={loading || !nextSchoolYear}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            Save school year terms
          </button>
          {!preflight?.next_year_terms_configured && !termsSaved && (
            <p className="text-sm text-amber-600">Save 5 terms before closing the school year.</p>
          )}
          {preflight?.next_year_terms_configured && (
            <p className="text-sm text-green-600">Next year has 5 active terms configured.</p>
          )}
        </div>
      </section>

      {/* Step 2: Graduated */}
      <section className="bg-card border border-border rounded-lg p-6 space-y-4">
        <h2 className="font-semibold text-foreground">2. Mark graduated cadets</h2>
        <p className="text-sm text-muted-foreground">
          Tag cadets who will not return. They stay active until year close; the tag is removed if they reappear in bulk add.
        </p>
        {roster.length > 0 && (
          <p className="text-sm text-foreground">
            {graduatedCount} cadet{graduatedCount !== 1 ? 's' : ''} marked as graduated
          </p>
        )}
        <button
          type="button"
          onClick={openGradModal}
          disabled={loading}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium hover:bg-secondary/90 disabled:opacity-50"
        >
          Select graduated cadets…
        </button>
        {graduationSaved && (
          <p className="text-sm text-green-600">{graduationSaved}</p>
        )}
      </section>

      {gradModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div
            className="bg-card border border-border rounded-lg shadow-lg w-full max-w-lg max-h-[85vh] flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-labelledby="grad-modal-title"
          >
            <div className="p-6 border-b border-border space-y-4">
              <h3 id="grad-modal-title" className="text-lg font-semibold text-foreground">
                Mark graduated cadets
              </h3>
              <p className="text-sm text-muted-foreground">
                Defaults to grade 12 and PG. Change the filter to include other cadets.
              </p>
              <div className="flex flex-wrap gap-2">
                {([
                  ['seniors', 'Grade 12 & PG'],
                  ['12', 'Grade 12 only'],
                  ['pg', 'PG only'],
                  ['all', 'All cadets'],
                ] as const).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setGradeFilter(value)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                      gradeFilter === value
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background text-foreground border-border hover:bg-muted'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <input
                type="search"
                placeholder="Search by name, company, or grade…"
                value={graduationSearch}
                onChange={(e) => setGraduationSearch(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                autoFocus
              />
            </div>
            <div className="flex-1 overflow-y-auto min-h-0 divide-y divide-border">
              {loading && roster.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground">Loading cadets…</p>
              ) : filteredRoster.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground">No cadets match the current filter.</p>
              ) : (
                filteredRoster.map((cadet) => (
                  <label
                    key={cadet.id}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 cursor-pointer text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={selectedGraduated.has(cadet.id)}
                      onChange={() => toggleGraduated(cadet.id)}
                      className="rounded border-input"
                    />
                    <span className="flex-1 min-w-0">
                      {cadet.last_name}, {cadet.first_name}
                      {cadet.company_name && (
                        <span className="text-muted-foreground"> — {cadet.company_name}</span>
                      )}
                    </span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {cadet.grade_level || '—'}
                    </span>
                    {cadet.graduated_at && (
                      <span className="text-xs bg-muted px-2 py-0.5 rounded shrink-0">Graduated</span>
                    )}
                  </label>
                ))
              )}
            </div>
            <div className="p-4 border-t border-border flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setGradModalOpen(false)}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium rounded-md border border-border hover:bg-muted disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveGraduation}
                disabled={loading}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? 'Saving…' : 'Save selections'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Phase A — Reminders */}
      <section className="bg-card border border-border rounded-lg p-6 space-y-4">
        <h2 className="font-semibold text-foreground">3. Phase A — Closeout reminders</h2>
        <p className="text-sm text-muted-foreground">
          Email and in-app notifications to Commandant, Deputy Commandant, TACs, and maintenance with scoped outstanding items.
        </p>

        {reminderPreview && (
          <>
            <p className="text-sm font-medium">
              Will notify {reminderPreview.recipient_count} recipient{reminderPreview.recipient_count !== 1 ? 's' : ''}
            </p>
            <div className="overflow-x-auto border border-border rounded-md">
              <table className="min-w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Recipient</th>
                    <th className="px-3 py-2 text-left font-medium">Role</th>
                    <th className="px-3 py-2 text-left font-medium">Manual items</th>
                    <th className="px-3 py-2 text-left font-medium">Auto-handled</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {reminderPreview.recipients.map((r) => (
                    <tr key={r.user_id}>
                      <td className="px-3 py-2">{r.name}</td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {r.role_name}
                        {r.company_name && ` (${r.company_name})`}
                      </td>
                      <td className="px-3 py-2">
                        {r.manual_items.length > 0 ? (
                          <ul className="space-y-1">
                            {r.manual_items.map((item, idx) => (
                              <li key={`${item.id}-${idx}`}>
                                <Link href={item.href} className="text-primary hover:underline">
                                  {item.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        ) : r.informational && Object.keys(r.informational).length > 0 ? (
                          <span className="text-muted-foreground">
                            Work orders: {r.informational.open_work_orders ?? 0} (informational)
                          </span>
                        ) : (
                          <span className="text-muted-foreground">None scoped to this recipient</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground text-xs">
                        {r.auto_summary.open_demerit_reports} demerits,{' '}
                        {r.auto_summary.open_appeals} appeals,{' '}
                        {r.auto_summary.pending_incidents} incidents
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleSendReminders}
            disabled={loading || !schoolYear}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium hover:bg-secondary/90 disabled:opacity-50"
          >
            {loading ? 'Sending…' : 'Send closeout reminders'}
          </button>
          <button
            type="button"
            onClick={loadReminderPreview}
            disabled={loading}
            className="text-sm text-primary hover:underline disabled:opacity-50"
          >
            Refresh preview
          </button>
        </div>
        {remindersResult !== null && (
          <div className="text-sm space-y-1">
            <p className="text-green-600">
              Queued for {remindersResult.recipients} recipient{remindersResult.recipients === 1 ? '' : 's'}
              {remindersResult.enqueued > 0 ? ` (${remindersResult.enqueued} enqueued` : ''}
              {remindersResult.skipped > 0 ? `, ${remindersResult.skipped} skipped` : ''}
              {remindersResult.enqueued > 0 ? ')' : ''}.
            </p>
            <p className="text-muted-foreground">
              Email delivery: {remindersResult.emailSent} sent
              {remindersResult.emailFailed > 0 ? `, ${remindersResult.emailFailed} failed` : ''}.
            </p>
            {remindersResult.emailError && (
              <p className="text-destructive">{remindersResult.emailError}</p>
            )}
          </div>
        )}
      </section>

      {/* Step 4: Phase B — Pre-flight */}
      <section className="bg-card border border-border rounded-lg p-6 space-y-4">
        <h2 className="font-semibold text-foreground">4. Phase B — Pre-flight summary</h2>
        {loading && !preflight ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : preflight ? (
          <>
            {preflight.already_closed && (
              <p className="text-sm text-destructive">This school year has already been closed.</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-3">
                <p className="font-medium text-muted-foreground uppercase text-xs">Auto-handled at execute</p>
                <ul className="list-disc list-inside text-foreground space-y-1">
                  <li>{preflight.auto_handled.open_demerit_reports} demerit reports → pulled</li>
                  <li>{preflight.auto_handled.open_appeals} appeals → rejected</li>
                  <li>{preflight.auto_handled.pending_incidents} pending incidents → closed</li>
                </ul>
                <p className="font-medium text-muted-foreground uppercase text-xs pt-2">Operational cleanup at execute</p>
                <ul className="list-disc list-inside text-foreground space-y-1">
                  <li>{preflight.auto_handled.tour_sheet_cleared ?? 0} tour sheet entries cleared</li>
                  <li>{preflight.auto_handled.probation_reset ?? 0} probation statuses reset</li>
                  <li>{preflight.auto_handled.rooms_cleared_at_execute ?? 0} room assignments cleared</li>
                </ul>
                {(preflight.items?.tour_sheet_cleared?.length ?? 0) > 0 && (
                  <ItemLinkList items={preflight.items?.tour_sheet_cleared} />
                )}
                {(preflight.items?.probation_reset?.length ?? 0) > 0 && (
                  <ItemLinkList items={preflight.items?.probation_reset} />
                )}
              </div>
              <div className="space-y-3">
                <p className="font-medium text-muted-foreground uppercase text-xs">Manual blockers</p>
                <ul className="list-disc list-inside text-foreground space-y-1">
                  <li>{preflight.manual.open_events ?? 0} open events (Day 10)</li>
                  <li>{preflight.manual.open_special_reports ?? 0} open special reports (Day 10)</li>
                  <li>{preflight.manual.uncleared_rooms ?? 0} rooms pending move-out (company TAC action)</li>
                  <li>{preflight.manual.summary_drafts ?? 0} summary drafts (Day 12)</li>
                  <li>{preflight.manual.suspended_cadets ?? 0} suspended cadets pending resolution</li>
                </ul>
                {(preflight.items?.suspended_cadets?.length ?? 0) > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Suspended cadets (resolve to non-return or dismissal before close):</p>
                    <ul className="space-y-2">
                      {preflight.items!.suspended_cadets!.map((item) => (
                        <li key={item.id} className="flex flex-wrap items-center gap-2 text-sm">
                          <Link href={item.href} className="text-primary hover:underline">
                            {item.label}
                          </Link>
                          <button
                            type="button"
                            disabled={loading || resolvingCadetId === item.id}
                            onClick={() => handleResolveSuspended(item.id, 'non_return')}
                            className="text-xs px-2 py-0.5 rounded border border-border hover:bg-accent disabled:opacity-50"
                          >
                            Mark non-return
                          </button>
                          <button
                            type="button"
                            disabled={loading || resolvingCadetId === item.id}
                            onClick={() => handleResolveSuspended(item.id, 'dismissal')}
                            className="text-xs px-2 py-0.5 rounded border border-destructive/40 text-destructive hover:bg-destructive/5 disabled:opacity-50"
                          >
                            Mark dismissal
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {(preflight.items?.uncleared_rooms?.length ?? 0) > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground">Move-out pending (assigned company TACs notified):</p>
                    <ItemLinkList items={preflight.items?.uncleared_rooms} />
                  </div>
                )}
                <p className="font-medium text-muted-foreground uppercase text-xs pt-2">Informational</p>
                <ul className="list-disc list-inside text-foreground">
                  <li>{preflight.informational?.open_work_orders ?? 0} open work orders (unchanged)</li>
                </ul>
              </div>
            </div>
          </>
        ) : null}
        <button
          type="button"
          onClick={refreshAll}
          disabled={loading}
          className="text-sm text-primary hover:underline disabled:opacity-50"
        >
          Refresh summary
        </button>
      </section>

      {/* Step 5: Execute */}
      <section className="bg-card border border-destructive/30 rounded-lg p-6 space-y-4">
        <h2 className="font-semibold text-foreground">5. Execute year close</h2>
        <p className="text-sm text-muted-foreground">
          Archives all cadets, academic data for {schoolYear || '…'}, and activates {nextSchoolYear || '…'}. This cannot be undone easily.
        </p>
        {canForceArchive && (
          <div className="rounded-md border border-destructive/40 bg-destructive/5 p-4 space-y-3">
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={forceArchive}
                onChange={(e) => {
                  setForceArchive(e.target.checked)
                  if (!e.target.checked) setForceConfirmText('')
                }}
                className="mt-1"
              />
              <span>
                <span className="font-medium">Force archive</span>
                <span className="block text-muted-foreground text-xs mt-0.5">
                  Bypass open events, special reports, and summary draft blockers. Clears or carries over all remaining open objects at execute. Admin role level above 100 only.
                </span>
              </span>
            </label>
            {forceArchive && (
              <div>
                <label className="text-sm font-medium">Type <span className="font-mono">FORCE ARCHIVE</span> to confirm force</label>
                <input
                  type="text"
                  value={forceConfirmText}
                  onChange={(e) => setForceConfirmText(e.target.value)}
                  className={inputClass}
                  placeholder="FORCE ARCHIVE"
                />
              </div>
            )}
          </div>
        )}
        <div>
          <label className="text-sm font-medium">Type <span className="font-mono">{schoolYear}</span> to confirm</label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className={inputClass}
            placeholder={schoolYear}
          />
        </div>
        <button
          type="button"
          onClick={handleClose}
          disabled={
            loading
            || !schoolYear
            || !nextSchoolYear
            || !preflight?.next_year_terms_configured
            || preflight?.already_closed
            || confirmText !== schoolYear
            || (forceArchive && forceConfirmText !== 'FORCE ARCHIVE')
          }
          className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md text-sm font-medium hover:bg-destructive/90 disabled:opacity-50"
        >
          {loading ? 'Closing…' : forceArchive ? `Force close school year ${schoolYear}` : `Close school year ${schoolYear}`}
        </button>
      </section>
    </div>
  )
}
