'use client'

import { useEffect, useState } from 'react'
import {
  getLinkableFilings,
  linkFilingsToEvent,
  type LinkableIncident,
  type LinkableSpecialReport,
} from './actions'

export default function LinkFilingsModal({
  eventId,
  onClose,
  onLinked,
}: {
  eventId: string
  onClose: () => void
  onLinked: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [incidents, setIncidents] = useState<LinkableIncident[]>([])
  const [specialReports, setSpecialReports] = useState<LinkableSpecialReport[]>([])
  const [selectedIncidents, setSelectedIncidents] = useState<Set<string>>(new Set())
  const [selectedReports, setSelectedReports] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      const data = await getLinkableFilings()
      if (cancelled) return
      setIncidents(data.incidents)
      setSpecialReports(data.specialReports)
      setLoaded(true)
      setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const toggle = (set: Set<string>, id: string, setter: (s: Set<string>) => void) => {
    const next = new Set(set)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setter(next)
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    const result = await linkFilingsToEvent(
      eventId,
      Array.from(selectedIncidents),
      Array.from(selectedReports)
    )
    setLoading(false)
    if (result.error) {
      setError(result.error)
      return
    }
    onLinked()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card border border-border rounded-lg shadow-lg max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-bold text-foreground">Link filings to event</h3>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            ×
          </button>
        </div>

        {loading && !loaded ? (
          <p className="text-sm text-muted-foreground">Loading linkable filings...</p>
        ) : (
          <>
            <div>
              <h4 className="text-sm font-medium mb-2">Incident reports</h4>
              {incidents.length === 0 ? (
                <p className="text-xs text-muted-foreground">No unlinked incidents.</p>
              ) : (
                <ul className="space-y-2 max-h-40 overflow-y-auto">
                  {incidents.map((inc) => (
                    <li key={inc.id} className="flex items-start gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedIncidents.has(inc.id)}
                        onChange={() => toggle(selectedIncidents, inc.id, setSelectedIncidents)}
                        className="mt-1"
                      />
                      <span>
                        {inc.subject?.last_name}, {inc.subject?.first_name} —{' '}
                        {inc.description.slice(0, 80)}
                        {inc.description.length > 80 ? '…' : ''}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Special reports</h4>
              {specialReports.length === 0 ? (
                <p className="text-xs text-muted-foreground">No unlinked special reports.</p>
              ) : (
                <ul className="space-y-2 max-h-40 overflow-y-auto">
                  {specialReports.map((sr) => (
                    <li key={sr.id} className="flex items-start gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedReports.has(sr.id)}
                        onChange={() => toggle(selectedReports, sr.id, setSelectedReports)}
                        className="mt-1"
                      />
                      <span>
                        {(sr.submitter as { last_name?: string; first_name?: string })?.last_name},{' '}
                        {(sr.submitter as { last_name?: string; first_name?: string })?.first_name} —{' '}
                        {sr.narrative.slice(0, 80)}
                        {sr.narrative.length > 80 ? '…' : ''}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}

        {error && (
          <p className="text-sm text-destructive bg-destructive/10 p-2 rounded">{error}</p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded border border-border">
            Cancel
          </button>
          <button
            type="button"
            disabled={loading || (selectedIncidents.size === 0 && selectedReports.size === 0)}
            onClick={handleSubmit}
            className="btn-primary text-sm"
          >
            {loading ? 'Linking...' : 'Link selected'}
          </button>
        </div>
      </div>
    </div>
  )
}
