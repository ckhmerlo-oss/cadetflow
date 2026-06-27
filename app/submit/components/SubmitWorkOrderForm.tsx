'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import SearchableSelect, { SelectOption } from '@/app/components/SearchableSelect'
import { WORK_ORDER_ISSUE_PRESETS } from '@/app/work-orders/constants'
import {
  getCadetDefaultRoomNumber,
  listBarracksRooms,
  submitWorkOrder,
} from '@/app/work-orders/actions'

export default function SubmitWorkOrderForm({ roleLevel }: { roleLevel: number }) {
  const router = useRouter()
  const [issueType, setIssueType] = useState<'barracks' | 'other'>('barracks')
  const [rooms, setRooms] = useState<SelectOption[]>([])
  const [selectedRoomId, setSelectedRoomId] = useState('')
  const [location, setLocation] = useState('')
  const [selectedPresets, setSelectedPresets] = useState<string[]>([])
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadRooms() {
      const roomRows = await listBarracksRooms()
      const defaultRoom = roleLevel < 50 ? await getCadetDefaultRoomNumber() : null

      const options = roomRows.map((room) => ({
        id: room.id,
        label: `${room.room_number} (Floor ${room.floor})`,
      }))
      setRooms(options)

      if (defaultRoom) {
        const match = roomRows.find((room) => room.room_number === defaultRoom)
        if (match) setSelectedRoomId(match.id)
      }
    }

    loadRooms()
  }, [roleLevel])

  const roomOptions = useMemo(() => rooms, [rooms])

  const togglePreset = (preset: string) => {
    setSelectedPresets((current) =>
      current.includes(preset)
        ? current.filter((item) => item !== preset)
        : [...current, preset]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await submitWorkOrder({
      issueType,
      description,
      barracksRoomId: issueType === 'barracks' ? selectedRoomId : null,
      location: issueType === 'other' ? location : null,
      issuePresets: selectedPresets,
    })

    setLoading(false)

    if (result.error) {
      setError(result.error)
      return
    }

    if (result.id) {
      router.push(`/work-orders/${result.id}`)
    } else {
      router.push('/work-orders')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-1">Damage / Work Order</h2>
        <p className="text-sm text-muted-foreground">
          Report barracks room issues or maintenance needs in shared spaces. Barracks reports go to that
          room&apos;s company TAC; other locations go directly to maintenance.
        </p>
      </div>

      <div className="space-y-2">
        <span className="text-sm font-medium text-foreground">Issue Location</span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setIssueType('barracks')}
            className={`rounded-md border px-3 py-2 text-sm ${
              issueType === 'barracks'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-muted-foreground'
            }`}
          >
            Barracks Room
          </button>
          <button
            type="button"
            onClick={() => setIssueType('other')}
            className={`rounded-md border px-3 py-2 text-sm ${
              issueType === 'other'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-muted-foreground'
            }`}
          >
            Other / Shared Space
          </button>
        </div>
      </div>

      {issueType === 'barracks' ? (
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Room</label>
          <SearchableSelect
            label=""
            options={roomOptions}
            value={selectedRoomId}
            onChange={setSelectedRoomId}
            placeholder="Select room..."
          />
        </div>
      ) : (
        <div>
          <label htmlFor="wo-location" className="block text-sm font-medium text-foreground mb-1">
            Location
          </label>
          <input
            id="wo-location"
            className="input-base w-full"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Gym locker room, laundry, hallway..."
            required
          />
        </div>
      )}

      {issueType === 'barracks' && (
        <div>
          <span className="block text-sm font-medium text-foreground mb-2">Common Issues</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {WORK_ORDER_ISSUE_PRESETS.map((preset) => (
              <label key={preset} className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={selectedPresets.includes(preset)}
                  onChange={() => togglePreset(preset)}
                />
                {preset}
              </label>
            ))}
          </div>
        </div>
      )}

      <div>
        <label htmlFor="wo-description" className="block text-sm font-medium text-foreground mb-1">
          Description
        </label>
        <textarea
          id="wo-description"
          className="input-base w-full min-h-[120px]"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the issue and any safety concerns..."
          required
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Work Order'}
      </button>
    </form>
  )
}
