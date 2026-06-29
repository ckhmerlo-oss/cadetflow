'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import SearchableSelect, { SelectOption } from '@/app/components/SearchableSelect'
import { submitSpecialReport, type InvolvementType } from '@/app/special-reports/actions'
import {
  createPendingSpecialReportFile,
  deferredUploadMessage,
  isSpecialReportUploadEnabled,
  releasePendingFilePreviews,
  SPECIAL_REPORT_FILE_MAX_COUNT,
  validateSpecialReportFile,
  type PendingSpecialReportFile,
} from '@/app/special-reports/lib/attachments'
import { createClient } from '@/utils/supabase/client'

type CadetOption = { id: string; label: string }

const INVOLVEMENT_OPTIONS: { value: InvolvementType; label: string }[] = [
  { value: 'witness', label: 'Witness' },
  { value: 'participant', label: 'Participant' },
  { value: 'other', label: 'Other' },
]

export default function SubmitSpecialReportForm({ userId }: { userId: string }) {
  const router = useRouter()
  const supabase = createClient()

  const [cadets, setCadets] = useState<CadetOption[]>([])
  const [subjectCadetIds, setSubjectCadetIds] = useState<string[]>([''])
  const [formData, setFormData] = useState({
    narrative: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    involvement_type: 'witness' as InvolvementType,
  })
  const [pendingFiles, setPendingFiles] = useState<PendingSpecialReportFile[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fileNotice, setFileNotice] = useState<string | null>(null)

  useEffect(() => {
    async function loadCadets() {
      const { data } = await supabase.rpc('get_subordinates')
      const options: CadetOption[] = (data ?? []).map(
        (c: { id: string; first_name: string; last_name: string }) => ({
          id: c.id,
          label: `${c.last_name}, ${c.first_name}`,
        })
      )
      const selfOption = options.find((c) => c.id === userId)
      if (!selfOption) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', userId)
          .single()
        if (profile) {
          options.unshift({
            id: userId,
            label: `${profile.last_name}, ${profile.first_name} (self)`,
          })
        }
      }
      setCadets(options.length ? options : [{ id: userId, label: 'Self' }])
    }
    loadCadets()
  }, [supabase, userId])

  useEffect(() => {
    return () => releasePendingFilePreviews(pendingFiles)
  }, [pendingFiles])

  const cadetOptions: SelectOption[] = useMemo(
    () => cadets.filter((c) => c.id !== userId),
    [cadets, userId]
  )

  const handleCadetChange = (index: number, value: string) => {
    const next = [...subjectCadetIds]
    next[index] = value
    setSubjectCadetIds(next)
  }

  const addCadetSlot = () => setSubjectCadetIds([...subjectCadetIds, ''])

  const removeCadetSlot = (index: number) => {
    if (subjectCadetIds.length === 1) {
      setSubjectCadetIds([''])
      return
    }
    setSubjectCadetIds(subjectCadetIds.filter((_, i) => i !== index))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? [])
    if (!selected.length) return

    const next: PendingSpecialReportFile[] = []
    for (const file of selected) {
      const validationError = validateSpecialReportFile(file)
      if (validationError) {
        setError(validationError)
        return
      }
      if (pendingFiles.length + next.length >= SPECIAL_REPORT_FILE_MAX_COUNT) {
        setError(`Maximum ${SPECIAL_REPORT_FILE_MAX_COUNT} files allowed.`)
        return
      }
      next.push(createPendingSpecialReportFile(file))
    }

    setError(null)
    setPendingFiles((prev) => [...prev, ...next])
    setFileNotice(deferredUploadMessage(pendingFiles.length + next.length))
    e.target.value = ''
  }

  const removeFile = (clientId: string) => {
    setPendingFiles((prev) => {
      const removed = prev.find((f) => f.clientId === clientId)
      if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl)
      const next = prev.filter((f) => f.clientId !== clientId)
      setFileNotice(deferredUploadMessage(next.length))
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const isoDate = new Date(`${formData.date}T${formData.time}:00`).toISOString()
    const validSubjectIds = subjectCadetIds.filter((id) => id.trim() !== '' && id !== userId)
    const result = await submitSpecialReport({
      narrative: formData.narrative,
      location: formData.location,
      occurred_at: isoDate,
      involvement_type: formData.involvement_type,
      subject_cadet_ids: validSubjectIds.length > 0 ? validSubjectIds : undefined,
    })

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    if (pendingFiles.length > 0 && !isSpecialReportUploadEnabled()) {
      setFileNotice(deferredUploadMessage(pendingFiles.length))
    }

    router.push('/special-reports')
  }

  return (
    <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
      <h2 className="text-2xl font-bold text-foreground mb-2">Special Report (Affidavit)</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Submit a narrative affidavit as a witness or participant. Staff will review and may group your
        report into an event.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Your role</label>
          <select
            value={formData.involvement_type}
            onChange={(e) =>
              setFormData({ ...formData, involvement_type: e.target.value as InvolvementType })
            }
            className="input-base"
          >
            {INVOLVEMENT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-foreground">
            Subject cadet(s) involved
          </label>
          <p className="text-xs text-muted-foreground">
            Name other cadets involved. Leave blank if you are a witness with no specific subjects, or
            if you are the only participant.
          </p>
          {subjectCadetIds.map((id, index) => (
            <div key={index} className="flex gap-2 items-center">
              <div className="flex-1">
                <SearchableSelect
                  label=""
                  options={cadetOptions}
                  value={id}
                  onChange={(val) => handleCadetChange(index, val)}
                  placeholder={`Select cadet #${index + 1}...`}
                />
              </div>
              {subjectCadetIds.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeCadetSlot(index)}
                  className="text-xs text-destructive hover:underline shrink-0"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addCadetSlot}
            className="text-sm text-primary font-medium hover:underline"
          >
            + Add another subject cadet
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Date of occurrence</label>
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
              placeholder="e.g. Barracks hallway, Parade field"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="input-base"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Narrative</label>
          <textarea
            required
            rows={6}
            placeholder="Describe what you witnessed or participated in, in your own words..."
            value={formData.narrative}
            onChange={(e) => setFormData({ ...formData, narrative: e.target.value })}
            className="input-base"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Supporting files (optional)
          </label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            multiple
            onChange={handleFileChange}
            className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-muted file:text-foreground"
          />
          {pendingFiles.length > 0 && (
            <ul className="mt-2 space-y-1 text-sm">
              {pendingFiles.map((f) => (
                <li key={f.clientId} className="flex items-center gap-2">
                  <span className="truncate">{f.file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(f.clientId)}
                    className="text-destructive hover:underline text-xs"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
          {fileNotice && (
            <p className="text-xs text-muted-foreground mt-2">{fileNotice}</p>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <button type="submit" disabled={loading} className="btn-primary font-bold">
            {loading ? 'Submitting...' : 'Submit Special Report'}
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
