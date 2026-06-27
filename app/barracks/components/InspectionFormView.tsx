'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { InspectionFormData, InspectionTemplate } from '../actions'
import { validateMoveInForm } from '../actions'
import { INSPECTION_STATUS_PICKER_STATUSES, statusRequiresAttention } from '../constants'
import InspectionFormAuditCard from './InspectionFormAuditCard'
import InspectionFormSections from './InspectionFormSections'
import MoveInFormStatusBadge from './MoveInFormStatusBadge'

export default function InspectionFormView({
  data,
  roomId,
  templates = [],
  canValidate = false,
  canManage = false,
  bunkOnlyView = false,
}: {
  data: InspectionFormData
  roomId: string
  templates?: InspectionTemplate[]
  canValidate?: boolean
  canManage?: boolean
  bunkOnlyView?: boolean
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [validateError, setValidateError] = useState<string | null>(null)
  const [validateSuccess, setValidateSuccess] = useState(false)

  const { form, items } = data
  const title = form.form_type === 'move_in' ? 'Move-in inspection' : 'Move-out inspection'
  const showFormNotes =
    Boolean(form.notes?.trim()) &&
    items.some((item) => statusRequiresAttention(String(item.status)))

  const submissionStatus = form.submission_status

  const handleValidate = () => {
    startTransition(async () => {
      setValidateError(null)
      const result = await validateMoveInForm(form.id, roomId)
      if (result.error) {
        setValidateError(result.error)
        return
      }
      setValidateSuccess(true)
      router.refresh()
    })
  }

  return (
    <div className="space-y-5 pb-8">
      <div>
        <Link href={`/barracks/rooms/${roomId}`} className="text-sm text-primary hover:underline">
          ← Back to room {form.room_number}
        </Link>
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <h1 className="text-xl font-bold sm:text-2xl">{title}</h1>
          {form.form_type === 'move_in' && <MoveInFormStatusBadge form={form} />}
        </div>
        <p className="text-sm text-muted-foreground sm:text-base mt-1">
          Room {form.room_number}
          {!bunkOnlyView && form.cadet_name ? ` · ${form.cadet_name}` : ''}
        </p>
      </div>

      {form.form_type === 'move_in' && !bunkOnlyView && (
        <InspectionFormAuditCard
          form={form}
          roomId={roomId}
          roomNumber={form.room_number}
          cadetName={form.cadet_name ?? 'Cadet'}
          canManage={canManage}
        />
      )}

      {canValidate && submissionStatus === 'submitted' && !validateSuccess && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 space-y-3">
          <p className="text-sm">
            This form was submitted by a parent or cadet and needs TAC validation before work orders are
            created.
          </p>
          {validateError && <p className="text-sm text-destructive">{validateError}</p>}
          <button
            type="button"
            disabled={isPending}
            onClick={handleValidate}
            className="btn-primary w-full sm:w-auto min-h-[2.75rem]"
          >
            {isPending ? 'Validating...' : 'Validate form & create work orders'}
          </button>
        </div>
      )}

      {validateSuccess && (
        <div className="p-3 text-sm bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-800 dark:text-emerald-200">
          Form validated. Deficiency work orders have been created if applicable.
        </div>
      )}

      <InspectionFormSections rows={items} templates={templates} mode="view" />

      {showFormNotes && (
        <div className="p-4 bg-muted/40 border border-border rounded-lg text-sm">
          <span className="font-medium">Form notes:</span> {form.notes}
        </div>
      )}

      <div className="bg-card border border-border rounded-xl p-4">
        <p className="text-sm font-medium">Inspection photos</p>
        <p className="text-xs text-muted-foreground mt-1">
          Saved photos will appear here after Day 12.2 storage integration (up to 10).
        </p>
      </div>

      <p className="text-xs text-muted-foreground">
        Status codes: {INSPECTION_STATUS_PICKER_STATUSES.join(', ')}
      </p>
    </div>
  )
}
