'use client'

import { useState } from 'react'
import { createEvent } from '../actions'

export default function NewEventPanel({ onCreated }: { onCreated: (eventId: string) => void }) {
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const result = await createEvent(title, summary)
    setLoading(false)
    if (result.error) {
      setError(result.error)
      return
    }
    if (result.id) {
      setTitle('')
      setSummary('')
      onCreated(result.id)
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <h2 className="text-xl font-bold text-primary mb-1">Create event</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Group incident reports and cadet affidavits for leadership review.
      </p>

      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-base"
            placeholder="Brief event title"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Summary (optional)</label>
          <textarea
            rows={4}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="input-base"
            placeholder="Context for leadership review..."
          />
        </div>
        {error && (
          <p className="text-sm text-destructive bg-destructive/10 p-2 rounded">{error}</p>
        )}
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Creating...' : 'Create event'}
        </button>
      </form>
    </div>
  )
}
