'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { ClassSectionDetail } from '../types'
import {
  addCadetToSection,
  removeCadetFromSection,
  updateClassSectionName,
  searchCadetsForClass,
} from '../actions'
import SearchableSelect, { SelectOption } from '@/app/components/SearchableSelect'

export default function ClassClient({
  section,
  isOwner,
}: {
  section: ClassSectionDetail
  isOwner: boolean
}) {
  const [loading, setLoading] = useState(false)
  const [courseName, setCourseName] = useState(section.course_name)
  const [cadetOptions, setCadetOptions] = useState<SelectOption[]>([])
  const [selectedCadetId, setSelectedCadetId] = useState('')
  const [showAdd, setShowAdd] = useState(false)

  useEffect(() => {
    if (isOwner) searchCadetsForClass('').then(setCadetOptions)
  }, [isOwner])

  const slotLabel = section.term_number
    ? `Term ${section.term_number}`
    : section.seminar_period
      ? `Seminar ${section.seminar_period.toUpperCase()}`
      : 'Class'

  const handleSaveName = async () => {
    setLoading(true)
    const { error } = await updateClassSectionName(section.section_id, courseName)
    setLoading(false)
    if (error) alert(error)
  }

  const handleAddCadet = async () => {
    if (!selectedCadetId) return
    setLoading(true)
    const { error } = await addCadetToSection(section.section_id, selectedCadetId)
    setLoading(false)
    if (error) alert(error)
    else {
      setSelectedCadetId('')
      setShowAdd(false)
      window.location.reload()
    }
  }

  const handleRemove = async (cadetId: string) => {
    if (!confirm('Remove this cadet from the class?')) return
    setLoading(true)
    const { error } = await removeCadetFromSection(section.section_id, cadetId)
    setLoading(false)
    if (error) alert(error)
    else window.location.reload()
  }

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-xl p-6">
        <Link href="/classes" className="text-sm text-primary hover:underline">← Back to Classes</Link>
        <div className="mt-4 flex flex-col md:flex-row md:items-end gap-4 justify-between">
          <div>
            <span className="text-xs font-bold uppercase text-muted-foreground">{slotLabel}</span>
            {isOwner ? (
              <div className="flex gap-2 mt-2">
                <input
                  className="input-base text-2xl font-bold"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                />
                <button onClick={handleSaveName} disabled={loading} className="btn-primary text-sm">
                  Save
                </button>
              </div>
            ) : (
              <h1 className="text-3xl font-bold text-primary mt-1">{section.course_name}</h1>
            )}
            <p className="text-sm text-muted-foreground mt-2">{section.roster.length} cadets enrolled</p>
          </div>
          {isOwner && (
            <button onClick={() => setShowAdd(!showAdd)} className="btn-primary">
              Add Cadet
            </button>
          )}
        </div>

        {showAdd && isOwner && (
          <div className="mt-4 p-4 bg-muted/20 rounded-lg border border-border flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <SearchableSelect
                label=""
                placeholder="Search cadets..."
                options={cadetOptions}
                value={selectedCadetId}
                onChange={setSelectedCadetId}
              />
            </div>
            <button onClick={handleAddCadet} disabled={loading || !selectedCadetId} className="btn-primary">
              Add to Roster
            </button>
          </div>
        )}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Cadet</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Company</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {section.roster.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground italic">
                  No cadets on this roster yet.
                </td>
              </tr>
            ) : (
              section.roster.map((c) => (
                <tr key={c.cadet_id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <Link href={`/profile/${c.cadet_id}`} className="text-primary hover:underline font-medium">
                      {c.last_name}, {c.first_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{c.company_name ?? '—'}</td>
                  <td className="px-4 py-3 text-right">
                    {isOwner && (
                      <button
                        onClick={() => handleRemove(c.cadet_id)}
                        className="text-destructive text-sm hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
