'use client'

import { useEffect, useState } from 'react'
import {
  markSpecialReportReviewed,
  unmarkSpecialReportReviewed,
  closeSpecialReport,
  toggleSpecialReportFlag,
} from '@/app/special-reports/actions'
import type { SpecialReport } from '@/app/special-reports/actions'
import type { DisciplineEvent } from '../actions'
import FilingEventLinkageSection from './FilingEventLinkageSection'
import { formatPersonName, REPORT_STATUS_STYLES } from '../lib/organizer'

export default function SpecialReportPreviewPanel({
  report: initialReport,
  events,
  onRefresh,
  onFiledToEvent,
  onUnlinked,
  onOpenEvent,
}: {
  report: SpecialReport
  events: DisciplineEvent[]
  onRefresh: () => void
  onFiledToEvent: (eventId: string) => void
  onUnlinked: () => void
  onOpenEvent?: (eventId: string) => void
}) {
  const [report, setReport] = useState(initialReport)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setReport(initialReport)
  }, [initialReport])

  const isUnfiled = !report.event_id
  const canReview = report.status === 'submitted'
  const canUnmark = report.status === 'reviewed' && isUnfiled
  const canClose = isUnfiled && report.status !== 'closed'

  const handleMarkReviewed = async () => {
    setLoading(true)
    setError(null)
    const result = await markSpecialReportReviewed(report.id, notes)
    setLoading(false)
    if (result.error) {
      setError(result.error)
      return
    }
    setNotes('')
    onRefresh()
  }

  const handleUnmark = async () => {
    setLoading(true)
    setError(null)
    const result = await unmarkSpecialReportReviewed(report.id)
    setLoading(false)
    if (result.error) {
      setError(result.error)
      return
    }
    onRefresh()
  }

  const handleClose = async () => {
    setLoading(true)
    setError(null)
    const result = await closeSpecialReport(report.id, notes)
    setLoading(false)
    if (result.error) {
      setError(result.error)
      return
    }
    setNotes('')
    onRefresh()
  }

  const handleToggleFlag = async () => {
    setLoading(true)
    setError(null)
    const result = await toggleSpecialReportFlag(report.id)
    setLoading(false)
    if (result.error) {
      setError(result.error)
      return
    }
    setReport((prev) => ({
      ...prev,
      flagged_for_review: result.flagged ?? !prev.flagged_for_review,
    }))
    onRefresh()
  }

  return (
    <div className="h-full overflow-y-auto space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-primary">Special report</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {formatPersonName(report.submitter)} · {report.involvement_type}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={handleToggleFlag}
            className={`text-sm px-3 py-2 rounded border disabled:opacity-50 ${
              report.flagged_for_review
                ? 'border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-300'
                : 'border-border hover:bg-muted'
            }`}
          >
            {report.flagged_for_review ? 'Unflag' : 'Flag for review'}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${REPORT_STATUS_STYLES[report.status] ?? 'bg-muted'}`}
        >
          {report.status.replace('_', ' ')}
        </span>
        {report.flagged_for_review && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300">
            Flagged
          </span>
        )}
        {report.event && (
          <span className="text-xs text-muted-foreground">
            Linked: {report.event.title}
          </span>
        )}
      </div>

      {report.reviewer && report.reviewed_at && (
        <p className="text-sm text-muted-foreground">
          Reviewed by {formatPersonName(report.reviewer)} on{' '}
          {new Date(report.reviewed_at).toLocaleString()}
        </p>
      )}

      <section className="bg-card border border-border rounded-lg p-6 space-y-4 text-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <h3 className="text-xs font-bold text-muted-foreground uppercase">Occurred</h3>
            <p>{new Date(report.occurred_at).toLocaleString()}</p>
          </div>
          <div>
            <h3 className="text-xs font-bold text-muted-foreground uppercase">Location</h3>
            <p>{report.location}</p>
          </div>
          {report.subject && (
            <div>
              <h3 className="text-xs font-bold text-muted-foreground uppercase">Primary subject</h3>
              <p>{formatPersonName(report.subject)}</p>
            </div>
          )}
          {(report.subjects?.length ?? 0) > 0 && (
            <div className="sm:col-span-2">
              <h3 className="text-xs font-bold text-muted-foreground uppercase">Subject cadets</h3>
              <p>{report.subjects!.map((s) => formatPersonName(s)).join('; ')}</p>
            </div>
          )}
          <div>
            <h3 className="text-xs font-bold text-muted-foreground uppercase">Submitted</h3>
            <p>{new Date(report.created_at).toLocaleString()}</p>
          </div>
        </div>
        <div>
          <h3 className="text-xs font-bold text-muted-foreground uppercase mb-2">Narrative</h3>
          <p className="whitespace-pre-wrap text-foreground leading-relaxed">{report.narrative}</p>
        </div>
        {report.review_notes && (
          <div className="border-t border-border pt-4">
            <h3 className="text-xs font-bold text-muted-foreground uppercase mb-1">Staff notes</h3>
            <p className="text-muted-foreground">{report.review_notes}</p>
          </div>
        )}
      </section>

      <FilingEventLinkageSection
        filingKind="report"
        filingId={report.id}
        currentEventId={report.event_id ?? null}
        currentEventTitle={report.event?.title}
        events={events}
        onLinked={(eventId) => {
          onFiledToEvent(eventId)
          onRefresh()
        }}
        onUnlinked={() => {
          onUnlinked()
          onRefresh()
        }}
        onOpenEvent={onOpenEvent}
      />

      {(canReview || canUnmark || canClose) && (
        <section className="bg-card border border-border rounded-lg p-4 space-y-3">
          <h3 className="text-sm font-semibold">Review actions</h3>
          {(canReview || canClose) && (
            <textarea
              rows={2}
              placeholder="Review notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input-base text-sm"
            />
          )}
          <div className="flex flex-wrap gap-2">
            {canReview && (
              <button
                type="button"
                disabled={loading}
                onClick={handleMarkReviewed}
                className="text-xs px-3 py-1.5 rounded border border-primary/30 text-primary hover:bg-primary/5 disabled:opacity-50"
              >
                Mark as reviewed
              </button>
            )}
            {canUnmark && (
              <button
                type="button"
                disabled={loading}
                onClick={handleUnmark}
                className="text-xs px-3 py-1.5 rounded border border-border hover:bg-muted disabled:opacity-50"
              >
                Unmark
              </button>
            )}
            {canClose && (
              <button
                type="button"
                disabled={loading}
                onClick={handleClose}
                className="text-xs px-3 py-1.5 rounded border border-border hover:bg-muted disabled:opacity-50"
              >
                Close report
              </button>
            )}
          </div>
        </section>
      )}

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 p-2 rounded border border-destructive/20">
          {error}
        </p>
      )}
    </div>
  )
}
