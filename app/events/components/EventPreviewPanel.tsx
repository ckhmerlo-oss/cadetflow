'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  resolveEventHandled,
  updateEventDetails,
  updateEventStatus,
  type EventDetail,
  type EventResolutionOffense,
} from '../actions'
import LinkFilingsModal from '../LinkFilingsModal'
import EventDemeritResolutionPanel from './EventDemeritResolutionPanel'
import { deferredUploadMessage } from '@/app/special-reports/lib/attachments'
import { EVENT_STATUS_STYLES, formatPersonName } from '../lib/organizer'

type ResolveMode = 'none' | 'demerits' | 'handled'

export default function EventPreviewPanel({
  event,
  offenses,
  onRefresh,
}: {
  event: EventDetail
  offenses: EventResolutionOffense[]
  onRefresh: () => void
}) {
  const [title, setTitle] = useState(event.title)
  const [summary, setSummary] = useState(event.summary ?? '')
  const [handledSummary, setHandledSummary] = useState(event.summary ?? '')
  const [closeNotes, setCloseNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [resolveMode, setResolveMode] = useState<ResolveMode>('none')

  const isTerminal = event.status === 'closed'

  const handleSaveDetails = async () => {
    setLoading(true)
    setError(null)
    const result = await updateEventDetails(event.id, title, summary)
    setLoading(false)
    if (result.error) setError(result.error)
    else onRefresh()
  }

  const handleEscalate = async () => {
    setLoading(true)
    setError(null)
    const result = await updateEventStatus(event.id, 'under_review')
    setLoading(false)
    if (result.error) setError(result.error)
    else onRefresh()
  }

  const handleResolveHandled = async () => {
    if (!handledSummary.trim()) {
      setError('Resolution summary is required to close as handled.')
      return
    }
    setLoading(true)
    setError(null)
    const result = await resolveEventHandled(
      event.id,
      handledSummary.trim(),
      closeNotes.trim() || undefined
    )
    setLoading(false)
    if (result.error) setError(result.error)
    else {
      setResolveMode('none')
      onRefresh()
    }
  }

  return (
    <div className="h-full overflow-y-auto space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-primary">{event.title}</h2>
          <p className="text-xs text-muted-foreground mt-1">
            {event.school_year} ·{' '}
            <span
              className={`inline-block px-2 py-0.5 rounded-full ${EVENT_STATUS_STYLES[event.status] ?? 'bg-muted'}`}
            >
              {event.status.replace('_', ' ')}
            </span>
            {event.resolution_type && (
              <span className="ml-1">· closed via {event.resolution_type}</span>
            )}
            {event.carried_forward_from_school_year && (
              <span> · carried from {event.carried_forward_from_school_year}</span>
            )}
          </p>
        </div>
        {!isTerminal && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => setShowLinkModal(true)}
              className="btn-primary text-sm"
            >
              Link filings
            </button>
            {event.status !== 'under_review' && (
              <button
                type="button"
                disabled={loading}
                onClick={handleEscalate}
                className="text-sm px-3 py-2 rounded border border-border hover:bg-muted disabled:opacity-50"
              >
                Escalate
              </button>
            )}
          </div>
        )}
      </div>

      <section className="bg-card border border-border rounded-lg p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isTerminal}
            className="input-base"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Summary</label>
          <textarea
            rows={4}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            disabled={isTerminal}
            className="input-base"
          />
        </div>
        {!isTerminal && (
          <button
            type="button"
            disabled={loading}
            onClick={handleSaveDetails}
            className="text-sm px-4 py-2 rounded border border-border hover:bg-muted disabled:opacity-50"
          >
            Save details
          </button>
        )}
      </section>

      {!isTerminal && (
        <section className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Resolve event</h3>
          <p className="text-xs text-muted-foreground">
            Choose a terminal outcome: assign demerits to involved cadets, or close with a handled
            summary when no demerits are warranted.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setResolveMode(resolveMode === 'demerits' ? 'none' : 'demerits')}
              className={`text-sm px-3 py-2 rounded border ${
                resolveMode === 'demerits'
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border hover:bg-muted'
              }`}
            >
              Assign demerits
            </button>
            <button
              type="button"
              onClick={() => setResolveMode(resolveMode === 'handled' ? 'none' : 'handled')}
              className={`text-sm px-3 py-2 rounded border ${
                resolveMode === 'handled'
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border hover:bg-muted'
              }`}
            >
              Close as handled
            </button>
          </div>

          {resolveMode === 'demerits' && (
            <EventDemeritResolutionPanel
              event={event}
              offenses={offenses}
              onResolved={onRefresh}
            />
          )}

          {resolveMode === 'handled' && (
            <div className="space-y-3 border-t border-border pt-4">
              <div>
                <label className="block text-sm font-medium mb-1">Resolution summary</label>
                <textarea
                  rows={4}
                  value={handledSummary}
                  onChange={(e) => setHandledSummary(e.target.value)}
                  className="input-base"
                  placeholder="Staff-facing summary of findings and actions taken..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Close notes (optional)</label>
                <input
                  type="text"
                  value={closeNotes}
                  onChange={(e) => setCloseNotes(e.target.value)}
                  className="input-base"
                />
              </div>
              <button
                type="button"
                disabled={loading}
                onClick={handleResolveHandled}
                className="text-sm px-4 py-2 rounded border border-border hover:bg-muted disabled:opacity-50"
              >
                {loading ? 'Closing...' : 'Close event as handled'}
              </button>
            </div>
          )}
        </section>
      )}

      {event.demerit_reports.length > 0 && (
        <section className="bg-card border border-border rounded-lg p-6 space-y-3">
          <h3 className="text-sm font-semibold">Demerit reports from this event</h3>
          <ul className="space-y-2 text-sm">
            {event.demerit_reports.map((report) => (
              <li key={report.id} className="flex flex-wrap items-center justify-between gap-2">
                <span>
                  {formatPersonName(report.subject)} — {report.offense_type?.offense_name} (
                  {report.demerits_effective} dem)
                </span>
                <Link href={`/report/${report.id}`} className="text-primary hover:underline text-xs">
                  View report
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
        {deferredUploadMessage(0)}
      </section>

      <section className="text-sm text-muted-foreground">
        <p>
          {event.incidents.length} incident report{event.incidents.length === 1 ? '' : 's'},{' '}
          {event.special_reports.length} special report
          {event.special_reports.length === 1 ? '' : 's'} linked.
        </p>
        <p className="mt-1">Select a filing in the middle column to review details.</p>
      </section>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 p-2 rounded border border-destructive/20">
          {error}
        </p>
      )}

      {showLinkModal && (
        <LinkFilingsModal
          eventId={event.id}
          onClose={() => setShowLinkModal(false)}
          onLinked={onRefresh}
        />
      )}
    </div>
  )
}
