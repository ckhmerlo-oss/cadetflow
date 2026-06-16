'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useMemo } from 'react'
import SearchableSelect, { SelectOption } from '@/app/components/SearchableSelect'
import { submitIncident } from '@/app/incidents/actions'

type CadetOption = { id: string; label: string }

export default function SubmitIncidentForm({ roleLevel }: { roleLevel: number }) {
  const supabase = createClient()
  const router = useRouter()

  const [cadets, setCadets] = useState<CadetOption[]>([])
  const [selectedCadets, setSelectedCadets] = useState<string[]>([])
  const [formData, setFormData] = useState({
    description: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    action_taken: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadCadets() {
      if (roleLevel < 50) {
        const { data } = await supabase.rpc('get_subordinates')
        if (data) {
          setCadets(
            data.map((c: { id: string; first_name: string; last_name: string }) => ({
              id: c.id,
              label: `${c.last_name}, ${c.first_name}`,
            }))
          )
        }
        return
      }

      const { data } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, company:companies(company_name), role:roles!inner(default_role_level)')
        .lt('role.default_role_level', 50)
        .order('last_name')

      if (data) {
        setCadets(
          data.map((c: {
            id: string
            first_name: string
            last_name: string
            company?: { company_name?: string } | { company_name?: string }[] | null
          }) => ({
            id: c.id,
            label: `${c.last_name}, ${c.first_name} (${Array.isArray(c.company) ? c.company[0]?.company_name : c.company?.company_name || 'No Co'})`,
          }))
        )
      }
    }
    loadCadets()
  }, [supabase, roleLevel])

  const cadetOptions: SelectOption[] = useMemo(() => cadets, [cadets])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedCadets.length === 0) {
      setError('Select at least one cadet.')
      return
    }

    setLoading(true)
    setError(null)
    const isoDate = new Date(`${formData.date}T${formData.time}:00`).toISOString()

    const { error: submitError } = await submitIncident({
      cadetIds: selectedCadets,
      description: formData.description,
      location: formData.location,
      incident_time: isoDate,
      action_taken: formData.action_taken,
    })

    if (submitError) {
      setError(submitError)
      setLoading(false)
    } else {
      router.push('/incidents')
    }
  }

  const handleAddCadet = (id: string) => {
    if (id && !selectedCadets.includes(id)) setSelectedCadets([...selectedCadets, id])
  }

  const removeCadet = (id: string) => setSelectedCadets(selectedCadets.filter((c) => c !== id))

  return (
    <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
      <h2 className="text-2xl font-bold text-foreground mb-6">Report an Incident</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-foreground mb-2">Who was involved?</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedCadets.map((id) => {
              const c = cadets.find((x) => x.id === id)
              return c ? (
                <span
                  key={id}
                  className="bg-primary/10 text-primary text-sm px-2 py-1 rounded-full flex items-center gap-1 border border-primary/20"
                >
                  {c.label}
                  <button
                    type="button"
                    onClick={() => removeCadet(id)}
                    className="hover:text-destructive font-bold ml-1 transition-colors"
                  >
                    ×
                  </button>
                </span>
              ) : null
            })}
          </div>
          <SearchableSelect
            label=""
            options={cadetOptions}
            value=""
            onChange={handleAddCadet}
            placeholder="Search cadets..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Date</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="input-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Time</label>
            <input
              type="time"
              required
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className="input-base"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-1">Location</label>
            <input
              type="text"
              required
              placeholder="e.g. Mess Hall, Science Lab 2"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="input-base"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Description of Event</label>
          <textarea
            required
            rows={4}
            placeholder="Describe exactly what happened..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="input-base"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Action Taken (Optional)</label>
          <textarea
            rows={2}
            placeholder="Did you correct them on the spot? Assign cleaning?"
            value={formData.action_taken}
            onChange={(e) => setFormData({ ...formData, action_taken: e.target.value })}
            className="input-base"
          />
        </div>

        <div className="flex justify-end pt-4">
          <button type="submit" disabled={loading} className="btn-primary font-bold">
            {loading ? 'Submitting...' : 'Submit Incident Report'}
          </button>
        </div>

        {error && (
          <p className="text-sm text-destructive bg-destructive/10 p-2 rounded border border-destructive/20">
            {error}
          </p>
        )}
      </form>
    </div>
  )
}
