'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { ClassSection } from './types'
import { createClassSection, getClassSectionDetail } from './actions'
import { slotLabel } from './constants'

type RosterEntry = {
  cadet_id: string
  first_name: string
  last_name: string
  company_name: string | null
}

function ClassCard({
  section,
  slotLabelText,
}: {
  section: ClassSection
  slotLabelText: string
}) {
  const [expanded, setExpanded] = useState(false)
  const [roster, setRoster] = useState<RosterEntry[] | null>(null)
  const [loadingRoster, setLoadingRoster] = useState(false)

  const toggleRoster = async () => {
    if (!expanded && roster === null) {
      setLoadingRoster(true)
      const detail = await getClassSectionDetail(section.section_id)
      setRoster(detail?.roster ?? [])
      setLoadingRoster(false)
    }
    setExpanded((prev) => !prev)
  }

  return (
    <div className="bg-card border border-border rounded-xl p-5 hover:border-primary transition-colors">
      <Link href={`/classes/${section.section_id}`} className="block">
        <p className="text-xs font-bold uppercase text-muted-foreground">{slotLabelText}</p>
        <h3 className="text-lg font-bold text-primary mt-1">{section.course_name}</h3>
        <p className="text-sm text-muted-foreground mt-2">{section.roster_count} cadets</p>
      </Link>
      {section.roster_count > 0 && (
        <div className="mt-3 pt-3 border-t border-border">
          <button
            type="button"
            onClick={() => void toggleRoster()}
            className="text-sm text-primary hover:underline font-medium"
          >
            {loadingRoster ? 'Loading roster…' : expanded ? 'Hide roster' : 'Show roster'}
          </button>
          {expanded && roster && (
            <ul className="mt-2 space-y-1 text-sm">
              {roster.length === 0 ? (
                <li className="text-muted-foreground italic">No cadets enrolled.</li>
              ) : (
                roster.map((c) => (
                  <li key={c.cadet_id} className="flex justify-between gap-2">
                    <Link
                      href={`/profile/${c.cadet_id}`}
                      className="text-foreground hover:text-primary hover:underline"
                    >
                      {c.last_name}, {c.first_name}
                    </Link>
                    <span className="text-muted-foreground shrink-0">{c.company_name ?? '—'}</span>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

export default function ClassesDashboardClient({ sections }: { sections: ClassSection[] }) {
  const [loading, setLoading] = useState(false)
  const [courseName, setCourseName] = useState('')
  const [termNumber, setTermNumber] = useState<number | ''>('')
  const [seminarPeriod, setSeminarPeriod] = useState<'a' | 'b' | ''>('')

  const mainSections = sections.filter((s) => s.term_number != null)
  const seminarSections = sections.filter((s) => s.seminar_period != null)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!courseName) return
    setLoading(true)
    const { error } = await createClassSection(
      courseName,
      termNumber === '' ? null : termNumber,
      seminarPeriod === '' ? null : seminarPeriod
    )
    setLoading(false)
    if (error) alert(error)
    else {
      setCourseName('')
      setTermNumber('')
      setSeminarPeriod('')
      window.location.reload()
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleCreate} className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-foreground">Add Class for This Year</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            className="input-base"
            placeholder="Course name"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            required
          />
          <select
            className="input-base"
            value={termNumber}
            onChange={(e) => {
              setTermNumber(e.target.value ? Number(e.target.value) : '')
              if (e.target.value) setSeminarPeriod('')
            }}
          >
            <option value="">Main term (optional)</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>Term {n}</option>
            ))}
          </select>
          <select
            className="input-base"
            value={seminarPeriod}
            onChange={(e) => {
              setSeminarPeriod(e.target.value as 'a' | 'b' | '')
              if (e.target.value) setTermNumber('')
            }}
          >
            <option value="">Seminar (optional)</option>
            <option value="a">Seminar A</option>
            <option value="b">Seminar B</option>
          </select>
          <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
            {loading ? 'Creating...' : 'Create Class'}
          </button>
        </div>
      </form>

      <div>
        <h2 className="text-xl font-bold text-foreground mb-4">Main Term Classes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mainSections.length === 0 ? (
            <p className="text-muted-foreground col-span-full">No main term classes yet.</p>
          ) : (
            mainSections.map((s) => (
              <ClassCard
                key={s.section_id}
                section={s}
                slotLabelText={`Term ${s.term_number}`}
              />
            ))
          )}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-foreground mb-4">Seminar Classes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {seminarSections.length === 0 ? (
            <p className="text-muted-foreground">No seminar classes yet.</p>
          ) : (
            seminarSections.map((s) => (
              <ClassCard
                key={s.section_id}
                section={s}
                slotLabelText={slotLabel(`seminar_${s.seminar_period}`)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
