'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { submitTravelRequest } from '@/app/parent/actions'
import type { TravelRequestRow } from '@/app/lib/parent-queries'

type TravelRequestFormProps = {
  cadetId: string
  cadetName: string
  isArchived: boolean
  initialRequests: TravelRequestRow[]
}

export default function TravelRequestForm({
  cadetId,
  cadetName,
  isArchived,
  initialRequests,
}: TravelRequestFormProps) {
  const [requests, setRequests] = useState(initialRequests)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [tripType, setTripType] = useState<'weekend' | 'break' | 'other'>('weekend')
  const [departureAt, setDepartureAt] = useState('')
  const [returnAt, setReturnAt] = useState('')
  const [destination, setDestination] = useState('')
  const [notes, setNotes] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      setError(null)
      setMessage(null)
      const result = await submitTravelRequest({
        cadetId,
        tripType,
        departureAt: new Date(departureAt).toISOString(),
        returnAt: new Date(returnAt).toISOString(),
        destination,
        notes: notes || undefined,
      })
      if ('error' in result) {
        setError(result.error ?? 'Submission failed')
        return
      }
      setMessage('Travel request submitted. Your TAC will review it.')
      setDestination('')
      setNotes('')
      setDepartureAt('')
      setReturnAt('')
      setRequests((prev) => [
        {
          id: result.requestId!,
          trip_type: tripType,
          departure_at: new Date(departureAt).toISOString(),
          return_at: new Date(returnAt).toISOString(),
          destination,
          notes: notes || null,
          status: 'submitted',
          created_at: new Date().toISOString(),
          parent_profile_id: '',
        },
        ...prev,
      ])
    })
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
      <Link href={`/parent/cadets/${cadetId}`} className="text-sm text-primary hover:underline">
        ← Back to {cadetName}
      </Link>

      <div>
        <h1 className="text-2xl font-bold">Travel — {cadetName}</h1>
        <p className="text-sm text-muted-foreground mt-1">Submit travel requests for school review.</p>
      </div>

      {isArchived && (
        <div className="p-3 text-sm bg-amber-500/10 border border-amber-500/30 rounded-lg">
          Cadet is archived. Travel requests cannot be submitted until reactivation.
        </div>
      )}

      {!isArchived && (
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Trip type</label>
            <select
              value={tripType}
              onChange={(e) => setTripType(e.target.value as 'weekend' | 'break' | 'other')}
              className="input-base w-full"
            >
              <option value="weekend">Weekend</option>
              <option value="break">Break</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Departure</label>
              <input
                type="datetime-local"
                required
                value={departureAt}
                onChange={(e) => setDepartureAt(e.target.value)}
                className="input-base w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Return</label>
              <input
                type="datetime-local"
                required
                value={returnAt}
                onChange={(e) => setReturnAt(e.target.value)}
                className="input-base w-full"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Destination</label>
            <input
              type="text"
              required
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="input-base w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="input-base w-full"
            />
          </div>
          <div className="p-3 text-sm bg-muted/50 border border-border rounded-lg text-muted-foreground">
            Document upload will be available after file storage setup (Day 12.2).
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {message && <p className="text-sm text-green-700 dark:text-green-300">{message}</p>}
          <button type="submit" disabled={isPending} className="btn-primary w-full">
            {isPending ? 'Submitting…' : 'Submit travel request'}
          </button>
        </form>
      )}

      <div className="space-y-2">
        <h2 className="font-semibold text-sm uppercase text-muted-foreground tracking-wide">Your requests</h2>
        {requests.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">No travel requests yet.</p>
        ) : (
          <ul className="divide-y divide-border border border-border rounded-xl">
            {requests.map((req) => (
              <li key={req.id} className="px-4 py-3 text-sm space-y-1">
                <div className="flex justify-between gap-2">
                  <span className="font-medium capitalize">{req.trip_type}</span>
                  <span className="text-muted-foreground capitalize">{req.status}</span>
                </div>
                <p>{req.destination}</p>
                <p className="text-muted-foreground text-xs">
                  {new Date(req.departure_at).toLocaleString()} → {new Date(req.return_at).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
