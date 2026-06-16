'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { slotLabel } from '@/app/classes/constants'
import {
  getAvailableSectionsForSlot,
  setCadetScheduleSlot,
  clearCadetScheduleSlot,
} from '@/app/classes/actions'
import type { ScheduleSlotOption } from '@/app/classes/types'
import type { OversightEntry } from '@/app/oversight/types'
import {
  addManualFacultyAssignment,
  removeManualFacultyAssignment,
  selfRemoveSecondaryAssignment,
} from '@/app/oversight/actions'

const ALL_SLOTS = ['term_1', 'term_2', 'term_3', 'term_4', 'term_5', 'seminar_a', 'seminar_b']

type ScheduleRow = {
  slot_type: string
  section_id: string | null
  course_name: string | null
  teacher_first_name: string | null
  teacher_last_name: string | null
}

export default function CadetScheduleOversight({
  cadetId,
  schedule,
  oversight,
  canEditSchedule,
  isFaculty,
  currentUserId,
}: {
  cadetId: string
  schedule: ScheduleRow[]
  oversight: OversightEntry[]
  canEditSchedule: boolean
  isFaculty: boolean
  currentUserId: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [slotOptions, setSlotOptions] = useState<Record<string, ScheduleSlotOption[]>>({})

  const scheduleBySlot = Object.fromEntries(schedule.map((s) => [s.slot_type, s]))

  const big3 = oversight.filter((o) => ['teacher', 'coach', 'tac'].includes(o.assignment_type))
  const secondary = oversight.filter((o) => o.assignment_type === 'secondary')
  const faculty = oversight.filter((o) => o.assignment_type === 'faculty')

  const loadOptions = async (slot: string) => {
    if (slotOptions[slot]) return
    const opts = await getAvailableSectionsForSlot(slot)
    setSlotOptions((prev) => ({ ...prev, [slot]: opts }))
  }

  const handleSlotChange = async (slot: string, sectionId: string) => {
    setLoading(slot)
    if (!sectionId) {
      const { error } = await clearCadetScheduleSlot(cadetId, slot)
      if (error) alert(error)
    } else {
      const { error } = await setCadetScheduleSlot(cadetId, slot, sectionId)
      if (error) alert(error)
    }
    setLoading(null)
    router.refresh()
  }

  const handleSelfAssign = async () => {
    setLoading('faculty')
    const { error } = await addManualFacultyAssignment(cadetId)
    if (error) alert(error)
    setLoading(null)
    router.refresh()
  }

  const handleRemoveFaculty = async (assignmentId: string) => {
    setLoading(assignmentId)
    const { error } = await removeManualFacultyAssignment(assignmentId, cadetId)
    if (error) alert(error)
    setLoading(null)
    router.refresh()
  }

  const handleRemoveSecondary = async (assignmentId: string) => {
    setLoading(assignmentId)
    const { error } = await selfRemoveSecondaryAssignment(assignmentId, cadetId)
    if (error) alert(error)
    setLoading(null)
    router.refresh()
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      <div className="bg-card shadow-sm border border-border rounded-xl p-5">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Class Schedule</h3>
        <div className="space-y-3">
          {ALL_SLOTS.map((slot) => {
            const row = scheduleBySlot[slot]
            return (
              <div key={slot} className="flex flex-col sm:flex-row sm:items-center gap-2 border-b border-border pb-3">
                <span className="w-24 text-xs font-bold uppercase text-muted-foreground shrink-0">
                  {slotLabel(slot)}
                </span>
                {canEditSchedule ? (
                  <select
                    className="input-base text-sm flex-1"
                    value={row?.section_id ?? ''}
                    disabled={loading === slot}
                    onFocus={() => loadOptions(slot)}
                    onChange={(e) => handleSlotChange(slot, e.target.value)}
                  >
                    <option value="">— None —</option>
                    {(slotOptions[slot] ?? []).map((o) => (
                      <option key={o.section_id} value={o.section_id}>
                        {o.course_name} ({o.teacher_last_name})
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="text-sm text-foreground">
                    {row?.course_name
                      ? `${row.course_name} — ${row.teacher_last_name}, ${row.teacher_first_name}`
                      : '—'}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="bg-card shadow-sm border border-border rounded-xl p-5">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Oversight Adults</h3>

        <div className="mb-4">
          <p className="text-xs font-bold uppercase text-primary mb-2">Big 3</p>
          {big3.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No Big-3 assignments yet.</p>
          ) : (
            <ul className="space-y-2">
              {big3.map((o) => (
                <li key={o.assignment_id} className="text-sm flex justify-between">
                  <span>
                    <span className="font-medium capitalize">{o.assignment_type}:</span>{' '}
                    {o.staff_last_name}, {o.staff_first_name}
                    {o.course_name ? ` (${o.course_name})` : ''}
                  </span>
                  <span className="text-xs text-muted-foreground">auto</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {(secondary.length > 0 || faculty.length > 0) && (
          <div className="mb-4 pt-4 border-t border-border">
            <p className="text-xs font-bold uppercase text-muted-foreground mb-2">Also Assigned</p>
            <ul className="space-y-2">
              {secondary.map((o) => (
                <li key={o.assignment_id} className="text-sm flex justify-between items-center gap-2">
                  <span>
                    Seminar: {o.staff_last_name}, {o.staff_first_name}
                    {o.course_name ? ` (${o.course_name})` : ''}
                  </span>
                  {o.is_self && (
                    <button
                      onClick={() => handleRemoveSecondary(o.assignment_id)}
                      disabled={loading === o.assignment_id}
                      className="text-xs text-destructive hover:underline shrink-0"
                    >
                      Remove me
                    </button>
                  )}
                </li>
              ))}
              {faculty.map((o) => (
                <li key={o.assignment_id} className="text-sm flex justify-between items-center gap-2">
                  <span>Faculty: {o.staff_last_name}, {o.staff_first_name}</span>
                  {(o.is_self || canEditSchedule) && (
                    <button
                      onClick={() => handleRemoveFaculty(o.assignment_id)}
                      disabled={loading === o.assignment_id}
                      className="text-xs text-destructive hover:underline shrink-0"
                    >
                      Remove
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {isFaculty && !faculty.some((f) => f.staff_id === currentUserId) && (
          <button
            onClick={handleSelfAssign}
            disabled={loading === 'faculty'}
            className="text-sm text-primary hover:underline"
          >
            Assign myself to this cadet
          </button>
        )}
      </div>
    </div>
  )
}
