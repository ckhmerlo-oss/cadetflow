'use client'

import { useEffect, useState } from 'react'
import { linkFilingsToEvent } from '../actions'
import type { DisciplineEvent } from '../actions'

type FilingKind = 'report' | 'incident'

export default function FilingEventLinkageSection({
  filingKind,
  filingId,
  currentEventId,
  currentEventTitle,
  events,
  onLinked,
  onUnlinked,
  onOpenEvent,
}: {
  filingKind: FilingKind
  filingId: string
  currentEventId: string | null
  currentEventTitle?: string | null
  events: DisciplineEvent[]
  onLinked: (eventId: string) => void
  onUnlinked: () => void
  onOpenEvent?: (eventId: string) => void
}) {
  const [fileEventId, setFileEventId] = useState(currentEventId ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setFileEventId(currentEventId ?? '')
  }, [currentEventId, filingId])

  const openEvents = events.filter((e) =>
    ['open', 'under_review', 'carried_forward'].includes(e.status)
  )

  const linkArgs = (eventId: string) => {
    if (filingKind === 'report') {
      return { incidentIds: [] as string[], specialReportIds: [filingId] }
    }
    return { incidentIds: [filingId], specialReportIds: [] as string[] }
  }

  const unlinkArgs = () => {
    if (filingKind === 'report') {
      return { unlinkIncidentIds: [] as string[], unlinkSpecialReportIds: [filingId] }
    }
    return { unlinkIncidentIds: [filingId], unlinkSpecialReportIds: [] as string[] }
  }

  const handleLink = async () => {
    if (!fileEventId) return
    setLoading(true)
    setError(null)
    const { incidentIds, specialReportIds } = linkArgs(fileEventId)
    const result = await linkFilingsToEvent(fileEventId, incidentIds, specialReportIds)
    setLoading(false)
    if (result.error) {
      setError(result.error)
      return
    }
    onLinked(fileEventId)
  }

  const handleRelink = async () => {
    if (!fileEventId || !currentEventId) return
    setLoading(true)
    setError(null)

    if (fileEventId !== currentEventId) {
      const { unlinkIncidentIds, unlinkSpecialReportIds } = unlinkArgs()
      const unlinkResult = await linkFilingsToEvent(
        currentEventId,
        [],
        [],
        unlinkIncidentIds,
        unlinkSpecialReportIds
      )
      if (unlinkResult.error) {
        setLoading(false)
        setError(unlinkResult.error)
        return
      }
    }

    const { incidentIds, specialReportIds } = linkArgs(fileEventId)
    const linkResult = await linkFilingsToEvent(fileEventId, incidentIds, specialReportIds)
    setLoading(false)
    if (linkResult.error) {
      setError(linkResult.error)
      return
    }
    onLinked(fileEventId)
  }

  const handleUnlink = async () => {
    if (!currentEventId) return
    setLoading(true)
    setError(null)
    const { unlinkIncidentIds, unlinkSpecialReportIds } = unlinkArgs()
    const result = await linkFilingsToEvent(
      currentEventId,
      [],
      [],
      unlinkIncidentIds,
      unlinkSpecialReportIds
    )
    setLoading(false)
    if (result.error) {
      setError(result.error)
      return
    }
    setFileEventId('')
    onUnlinked()
  }

  return (
    <section className="bg-card border border-border rounded-lg p-4 space-y-3">
      <h3 className="text-sm font-semibold">Event linkage</h3>

      {currentEventId ? (
        <div className="text-sm space-y-1">
          <p className="text-muted-foreground">Currently linked to:</p>
          {onOpenEvent ? (
            <button
              type="button"
              onClick={() => onOpenEvent(currentEventId)}
              className="text-primary hover:underline font-medium"
            >
              {currentEventTitle ?? 'View event'}
            </button>
          ) : (
            <span className="font-medium">{currentEventTitle ?? currentEventId}</span>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Not linked to an event.</p>
      )}

      <select
        value={fileEventId}
        onChange={(e) => setFileEventId(e.target.value)}
        className="input-base text-sm"
      >
        <option value="">Select an event...</option>
        {openEvents.map((event) => (
          <option key={event.id} value={event.id}>
            {event.title}
          </option>
        ))}
      </select>

      <div className="flex flex-wrap gap-2">
        {currentEventId ? (
          <>
            <button
              type="button"
              disabled={loading || !fileEventId || fileEventId === currentEventId}
              onClick={handleRelink}
              className="btn-primary text-sm disabled:opacity-50"
            >
              Relink to event
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={handleUnlink}
              className="text-sm px-3 py-2 rounded border border-border hover:bg-muted disabled:opacity-50"
            >
              Unlink from event
            </button>
          </>
        ) : (
          <button
            type="button"
            disabled={loading || !fileEventId}
            onClick={handleLink}
            className="btn-primary text-sm disabled:opacity-50"
          >
            Link to event
          </button>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 p-2 rounded border border-destructive/20">
          {error}
        </p>
      )}
    </section>
  )
}
