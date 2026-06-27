'use client'

import { useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import SearchableSelect, { type SelectOption } from '@/app/components/SearchableSelect'
import {
  saveInspectionForm,
  saveMoveInFormExternal,
  uploadPendingInspectionPhotos,
  type InspectionTemplate,
} from '../actions'
import { statusRequiresAttention, type InspectionStatus } from '../constants'
import {
  INSPECTION_PHOTO_MAX_COUNT,
  createPendingInspectionPhoto,
  releasePendingPhotoPreviews,
  type PendingInspectionPhoto,
} from '../lib/inspection-attachments'
import { filterTemplatesForExternal } from '../lib/inspection-form-layout'
import InspectionFormSections from './InspectionFormSections'
import InspectionPhotoAttach, { type PhotoAttachStatusMessage } from './InspectionPhotoAttach'

type ItemRow = {
  id?: string
  item_key: string
  item_label: string
  sort_order: number
  status: InspectionStatus
  notes: string
}

type InspectionFormEditorProps = {
  roomId: string
  roomNumber: string
  formType: 'move_in' | 'move_out'
  templates: InspectionTemplate[]
  cadetOptions?: SelectOption[]
  defaultCadetId?: string
  validatorUserId?: string
  editorMode?: 'tac' | 'external'
  formId?: string
  lockedBunk?: 'top' | 'bottom' | null
  lockedDeskSide?: 'left' | 'right' | null
  cadetDisplayName?: string
  backHref?: string
  submitLabel?: string
  successRedirect?: string
  containerClass?: string
  initialItems?: ItemRow[]
  initialNotes?: string
  readOnly?: boolean
}

function buildItemRows(
  templates: InspectionTemplate[],
  initialItems?: ItemRow[]
): ItemRow[] {
  const byKey = new Map(initialItems?.map((i) => [i.item_key, i]))
  return templates.map((t) => {
    const existing = byKey.get(t.item_key)
    return {
      id: existing?.id,
      item_key: t.item_key,
      item_label: t.label,
      sort_order: t.sort_order,
      status: (existing?.status as InspectionStatus) ?? 'N/A',
      notes: existing?.notes ?? '',
    }
  })
}

export default function InspectionFormEditor({
  roomId,
  roomNumber,
  formType,
  templates,
  cadetOptions = [],
  defaultCadetId = '',
  validatorUserId,
  editorMode = 'tac',
  formId,
  lockedBunk = null,
  lockedDeskSide = null,
  cadetDisplayName,
  backHref,
  submitLabel,
  successRedirect,
  containerClass = 'space-y-5 pb-8',
  initialItems,
  initialNotes = '',
  readOnly = false,
}: InspectionFormEditorProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [cadetId, setCadetId] = useState(defaultCadetId)
  const [notes, setNotes] = useState(initialNotes)
  const [error, setError] = useState<string | null>(null)
  const [formPhotos, setFormPhotos] = useState<PendingInspectionPhoto[]>([])
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [photoStatus, setPhotoStatus] = useState<PhotoAttachStatusMessage | null>(null)

  const activeTemplates = useMemo(() => {
    if (editorMode === 'external' && lockedBunk && lockedDeskSide) {
      return filterTemplatesForExternal(templates, lockedBunk, lockedDeskSide)
    }
    return templates
  }, [editorMode, templates, lockedBunk, lockedDeskSide])

  const [items, setItems] = useState<ItemRow[]>(() => buildItemRows(activeTemplates, initialItems))

  useEffect(() => {
    setItems(buildItemRows(activeTemplates, initialItems))
  }, [activeTemplates, initialItems])

  const showFormNotes = useMemo(
    () => items.some((row) => statusRequiresAttention(row.status)),
    [items]
  )

  const pendingPhotosRef = useRef(formPhotos)
  pendingPhotosRef.current = formPhotos

  useEffect(() => {
    return () => releasePendingPhotoPreviews(pendingPhotosRef.current)
  }, [])

  const title = formType === 'move_in' ? 'Move-in Inspection' : 'Move-out Inspection'
  const backLink = backHref ?? `/barracks/rooms/${roomId}`

  const updateItem = (itemKey: string, patch: Partial<ItemRow>) => {
    setItems((prev) =>
      prev.map((row) => {
        if (row.item_key !== itemKey) return row
        const next = { ...row, ...patch }
        return next
      })
    )
  }

  const addFormPhoto = (file: File) => {
    setPhotoError(null)
    const photo = createPendingInspectionPhoto(file, { level: 'form', formType })
    setFormPhotos((prev) => [...prev, photo])
    setPhotoStatus({
      type: 'info',
      message: 'Photo attached. Photos upload when you save the form.',
    })
  }

  const removeFormPhoto = (clientId: string) => {
    setFormPhotos((prev) => {
      const target = prev.find((p) => p.clientId === clientId)
      if (target) URL.revokeObjectURL(target.previewUrl)
      return prev.filter((p) => p.clientId !== clientId)
    })
    setPhotoError(null)
    if (formPhotos.length <= 1) setPhotoStatus(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (readOnly) return

    if (editorMode === 'tac' && !cadetId) {
      setError('Select the cadet for this inspection.')
      return
    }

    if (editorMode === 'external' && !formId) {
      setError('Form not found.')
      return
    }

    startTransition(async () => {
      setError(null)
      setPhotoError(null)
      setPhotoStatus(null)

      const payloadItems = items.map((row) => ({
        id: row.id ?? null,
        item_key: row.item_key,
        item_label: row.item_label,
        sort_order: row.sort_order,
        status: row.status,
        notes: row.notes?.trim() || null,
      }))

      const result =
        editorMode === 'external'
          ? await saveMoveInFormExternal({
              formId: formId!,
              items: payloadItems,
              notes: showFormNotes ? notes || null : null,
              markSubmit: true,
            })
          : await saveInspectionForm({
              formType,
              roomId,
              cadetId,
              items: payloadItems,
              notes: showFormNotes ? notes || null : null,
              validatedById: formType === 'move_in' ? validatorUserId ?? null : null,
              markComplete: true,
            })

      if (result.error) {
        setError(result.error)
        return
      }

      const savedFormId = editorMode === 'external' ? formId! : (result.formId as string)

      if (savedFormId && formPhotos.length > 0) {
        const uploadResult = await uploadPendingInspectionPhotos({
          formId: savedFormId,
          formType,
          photos: formPhotos.map((photo) => ({
            clientId: photo.clientId,
            filename: photo.file.name,
            mimeType: photo.file.type,
            byteSize: photo.file.size,
            scope: 'form',
          })),
        })

        if (uploadResult.uploaded > 0) {
          setPhotoStatus({
            type: 'success',
            message: `${uploadResult.uploaded} photo(s) uploaded successfully.`,
          })
        } else if (uploadResult.deferred > 0) {
          setPhotoStatus({ type: 'info', message: uploadResult.message })
        } else if (uploadResult.message.toLowerCase().includes('unauthorized')) {
          setPhotoError(uploadResult.message)
          return
        } else {
          setPhotoStatus({ type: 'info', message: uploadResult.message })
        }
      }

      router.push(successRedirect ?? backLink)
      router.refresh()
    })
  }

  const defaultSubmitLabel =
    editorMode === 'external' ? 'Submit for TAC review' : 'Save & complete'

  return (
    <form onSubmit={handleSubmit} className={containerClass}>
      <div>
        <Link href={backLink} className="text-sm text-primary hover:underline">
          ← Back
        </Link>
        <h1 className="text-xl font-bold mt-2 sm:text-2xl">{title}</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Room {roomNumber}
          {cadetDisplayName ? ` · ${cadetDisplayName}` : ''}
        </p>
        {editorMode === 'external' && lockedBunk && lockedDeskSide && (
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="inline-flex items-center rounded-lg border border-border bg-muted/50 px-4 py-2.5 text-base font-bold capitalize">
              Bunk: {lockedBunk}
            </span>
            <span className="inline-flex items-center rounded-lg border border-border bg-muted/50 px-4 py-2.5 text-base font-bold capitalize">
              Desk side: {lockedDeskSide}
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 text-sm bg-destructive/10 border border-destructive/30 rounded-lg text-destructive">
          {error}
        </div>
      )}

      {editorMode === 'tac' && (
        <div className="bg-card border border-border rounded-xl p-4">
          <SearchableSelect
            label="Cadet"
            options={cadetOptions}
            value={cadetId}
            onChange={setCadetId}
            placeholder="Select cadet..."
            required
          />
        </div>
      )}

      <InspectionFormSections
        rows={items}
        templates={activeTemplates}
        mode={readOnly ? 'view' : 'edit'}
        editorMode={editorMode}
        lockedBunk={lockedBunk}
        lockedDeskSide={lockedDeskSide}
        editHandlers={
          readOnly
            ? undefined
            : {
                onStatusChange: (itemKey, status) => updateItem(itemKey, { status }),
                onNotesChange: (itemKey, notes) => updateItem(itemKey, { notes }),
              }
        }
      />

      {showFormNotes && !readOnly && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <label className="block text-sm font-medium">Form notes</label>
          <p className="text-xs text-muted-foreground">
            Shown because at least one item has a status other than INS or N/A.
          </p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="input-base w-full min-h-[5rem] text-base sm:text-sm"
            placeholder="Overall notes for flagged items..."
          />
        </div>
      )}

      {!readOnly && (
        <>
          <div className="bg-card border border-border rounded-xl p-4 space-y-2">
            <label className="block text-sm font-medium">Inspection photos</label>
            <p className="text-xs text-muted-foreground">
              Optional — up to {INSPECTION_PHOTO_MAX_COUNT} room photos.
            </p>
            <InspectionPhotoAttach
              label="Add photo"
              pendingPhotos={formPhotos}
              maxPhotos={INSPECTION_PHOTO_MAX_COUNT}
              onAdd={addFormPhoto}
              onRemove={removeFormPhoto}
              onValidationError={setPhotoError}
              errorMessage={photoError}
              statusMessage={photoStatus}
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:gap-3 sticky bottom-0 bg-background/95 py-3 border-t border-border -mx-4 px-4 sm:static sm:border-0 sm:py-0 sm:mx-0 sm:px-0 sm:bg-transparent">
            <button
              type="submit"
              disabled={isPending}
              className="btn-primary w-full sm:w-auto min-h-[3rem]"
            >
              {isPending ? 'Saving...' : submitLabel ?? defaultSubmitLabel}
            </button>
            <Link
              href={backLink}
              className="btn-secondary w-full sm:w-auto min-h-[3rem] text-center"
            >
              Cancel
            </Link>
          </div>
        </>
      )}
    </form>
  )
}
