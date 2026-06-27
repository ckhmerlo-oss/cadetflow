'use client'

import { useState, useTransition, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import SearchableSelect, { type SelectOption } from '@/app/components/SearchableSelect'
import {
  assignBarracksBunk,
  clearBarracksBunk,
  compareInspectionForms,
  resendMoveInInvite,
  revokeMoveInInvite,
  resetBarracksRoom,
  searchCompanyCadets,
  setBarracksRoomDisplayName,
  setBarracksRoomPurpose,
  type BarracksViewerPersona,
  type MoveInInviteRow,
  type RoomDetailData,
} from '../actions'
import { formatRoomTitleLabel } from '../lib/hallway-layout'
import { formatInspectionTimestamp } from '../lib/move-in-form-status'
import { findPendingMoveInForBunk } from '../lib/move-in-pending'
import EditMoveInInviteModal from './EditMoveInInviteModal'
import MoveInFormStatusBadge from './MoveInFormStatusBadge'
import SendMoveInInviteModal from './SendMoveInInviteModal'

type RoomDetailClientProps = {
  detail: RoomDetailData
  persona: BarracksViewerPersona
  invites?: MoveInInviteRow[]
}

const inspectionActionClass =
  'inline-flex items-center justify-center rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground shadow-sm hover:bg-muted/50 transition-colors'

function PencilIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden>
      <path d="m2.695 14.763-1.262 3.34a.75.75 0 0 0 1.049.852l3.354-1.254a4 4 0 0 0 1.653-1.089l3.084-3.084a2.25 2.25 0 0 0-3.182-3.182l-3.084 3.084a4 4 0 0 0-1.089 1.653L2.695 14.763Zm9.45-8.447a.75.75 0 0 1 1.06 0l1.128 1.127a.75.75 0 0 1 0 1.061l-.97.97-2.185-2.185.97-.97Z" />
    </svg>
  )
}

function MoveInTag() {
  return (
    <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border border-sky-500/40 bg-sky-500/10 text-sky-800 dark:text-sky-200">
      MOV
    </span>
  )
}

function BunkOccupantLabel({
  occupant,
  pendingForm,
  bunkOnlyView,
}: {
  occupant: RoomDetailData['room']['occupant_top']
  pendingForm: RoomDetailData['move_in_forms'][number] | undefined
  bunkOnlyView?: boolean
}) {
  if (bunkOnlyView) {
    const occupied = (occupant && !occupant.archived) || Boolean(pendingForm)
    return <p className="font-medium">{occupied ? 'Occupied' : 'Vacant'}</p>
  }

  if (occupant && !occupant.archived) {
    return (
      <p className="font-medium flex flex-wrap items-center gap-2">
        {occupantDisplay(occupant, true)}
        {pendingForm && <MoveInTag />}
      </p>
    )
  }

  if (pendingForm) {
    return (
      <p className="font-medium flex flex-wrap items-center gap-2">
        {pendingForm.cadet_name}
        <MoveInTag />
      </p>
    )
  }

  return <p className="font-medium">Vacant</p>
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function occupantDisplay(
  occupant: RoomDetailData['room']['occupant_top'],
  archivedExcluded: boolean
) {
  if (!occupant) return 'Vacant'
  if (archivedExcluded && occupant.archived) return 'Vacant'
  const rank = occupant.cadet_rank?.trim()
  const name = `${occupant.first_name} ${occupant.last_name}`.trim()
  return rank ? `${rank} ${name}` : name
}

export default function RoomDetailClient({ detail, persona, invites = [] }: RoomDetailClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [cadetOptions, setCadetOptions] = useState<SelectOption[]>([])
  const [topCadetId, setTopCadetId] = useState('')
  const [bottomCadetId, setBottomCadetId] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteBunk, setInviteBunk] = useState<'top' | 'bottom'>('top')
  const [editingInvite, setEditingInvite] = useState<{
    id: string
    cadet_name: string
    recipient_email: string
  } | null>(null)
  const [comparison, setComparison] = useState<Array<{
    item_key: string
    item_label: string
    move_in_status: string | null
    move_out_status: string | null
    changed: boolean
  }> | null>(null)
  const [editingName, setEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState('')

  const { room } = detail
  const canManage = persona.canManage || persona.isAdmin
  const bunkOnlyView = persona.bunkOnlyView
  const acceptsOccupants = !room.room_purpose
  const roomTitle = formatRoomTitleLabel(room)
  const hasCustomName = Boolean(room.room_display_name?.trim())
  const isCustomized =
    hasCustomName ||
    room.room_number !== room.canonical_room_number ||
    Boolean(room.room_purpose)

  useEffect(() => {
    searchCompanyCadets('', room.company_id).then((results) => {
      setCadetOptions(results.map((r) => ({ id: r.id, label: r.label })))
    })
  }, [room.company_id])

  const handleAssign = (bunk: 'top' | 'bottom', cadetId: string) => {
    if (!cadetId) return
    startTransition(async () => {
      const result = await assignBarracksBunk(room.id, bunk, cadetId)
      if (result.error) setMessage(result.error)
      else {
        setMessage(null)
        if (bunk === 'top') setTopCadetId('')
        else setBottomCadetId('')
        router.refresh()
      }
    })
  }

  const handleClear = (bunk: 'top' | 'bottom') => {
    startTransition(async () => {
      const result = await clearBarracksBunk(room.id, bunk)
      if (result.error) setMessage(result.error)
      else {
        setMessage(null)
        router.refresh()
      }
    })
  }

  const handleAcceptsOccupantsChange = (checked: boolean) => {
    const hadOccupants = Boolean(
      (room.occupant_top && !room.occupant_top.archived) ||
      (room.occupant_bottom && !room.occupant_bottom.archived)
    )
    if (
      !checked &&
      hadOccupants &&
      !confirm('This room will no longer accept cadet assignments. Current occupants will be cleared.')
    ) {
      return
    }

    startTransition(async () => {
      const result = await setBarracksRoomPurpose(room.id, checked ? null : 'special')
      if (result.error) setMessage(result.error)
      else {
        setMessage(null)
        router.refresh()
      }
    })
  }

  const openNameEditor = () => {
    setNameDraft(room.room_display_name ?? '')
    setEditingName(true)
  }

  const handleSaveName = () => {
    startTransition(async () => {
      const result = await setBarracksRoomDisplayName(room.id, nameDraft)
      if (result.error) setMessage(result.error)
      else {
        setMessage(null)
        setEditingName(false)
        router.refresh()
      }
    })
  }

  const handleResetRoom = () => {
    if (!confirm('Reset this room to its original name and number?')) return

    startTransition(async () => {
      const result = await resetBarracksRoom(room.id)
      if (result.error) setMessage(result.error)
      else {
        setMessage(null)
        setEditingName(false)
        setNameDraft('')
        router.refresh()
      }
    })
  }

  const handleCompare = () => {
    const moveInId = room.latest_move_in_form_id ?? detail.move_in_forms[0]?.id
    const moveOutId = room.latest_move_out_form_id ?? detail.move_out_forms[0]?.id
    if (!moveInId || !moveOutId) {
      setMessage('Need both a move-in and move-out form to compare.')
      return
    }
    startTransition(async () => {
      const result = await compareInspectionForms(moveInId, moveOutId)
      if ('error' in result) {
        setMessage(result.error)
        setComparison([])
        return
      }
      setComparison(result.rows)
      setMessage(null)
    })
  }

  const topOccupant = room.occupant_top && !room.occupant_top.archived ? room.occupant_top : null
  const bottomOccupant = room.occupant_bottom && !room.occupant_bottom.archived ? room.occupant_bottom : null
  const topPendingMoveIn = findPendingMoveInForBunk(detail.move_in_forms, 'top', topOccupant?.id ?? null)
  const bottomPendingMoveIn = findPendingMoveInForBunk(detail.move_in_forms, 'bottom', bottomOccupant?.id ?? null)

  const handleResendInvite = (invite: MoveInInviteRow) => {
    startTransition(async () => {
      const result = await resendMoveInInvite({
        inviteId: invite.id,
        roomId: room.id,
        cadetName: invite.cadet_name,
        roomNumber: room.room_number,
      })
      if (result.error) setMessage(result.error)
      else {
        setMessage(result.emailSent ? 'Invite resent by email.' : 'New link generated — email failed.')
        router.refresh()
      }
    })
  }

  const handleRevokeInvite = (inviteId: string) => {
    startTransition(async () => {
      const result = await revokeMoveInInvite(inviteId, room.id)
      if (result.error) setMessage(result.error)
      else {
        setMessage(null)
        router.refresh()
      }
    })
  }

  const openInviteForBunk = (bunk: 'top' | 'bottom', cadetId?: string) => {
    setInviteBunk(bunk)
    setShowInviteModal(true)
  }

  const defaultInviteCadetId =
    inviteBunk === 'top' ? (topOccupant?.id ?? '') : (bottomOccupant?.id ?? '')

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Link href="/barracks/hallway" className="text-sm text-primary hover:underline">
            ← Back to hallway
          </Link>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <h1 className="text-3xl font-bold text-foreground">Room {roomTitle}</h1>
            {canManage && !bunkOnlyView && !editingName && (
              <button
                type="button"
                onClick={openNameEditor}
                disabled={isPending}
                className="inline-flex items-center justify-center rounded-md border border-border bg-background p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                aria-label="Edit room name"
              >
                <PencilIcon />
              </button>
            )}
          </div>
          {editingName && canManage && !bunkOnlyView && (
            <div className="space-y-2 max-w-md">
              <label className="block text-sm font-medium text-foreground" htmlFor="room-name-input">
                Room name
              </label>
              <input
                id="room-name-input"
                type="text"
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                disabled={isPending}
                placeholder={room.canonical_room_number}
                className="input-base w-full"
                autoFocus
              />
              <div className="flex flex-wrap gap-2">
                <button type="button" disabled={isPending} onClick={handleSaveName} className="btn-primary text-sm">
                  Save
                </button>
                <button
                  type="button"
                  disabled={isPending || !isCustomized}
                  onClick={handleResetRoom}
                  className="btn-secondary text-sm"
                >
                  Reset
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => setEditingName(false)}
                  className="btn-secondary text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          <p className="text-muted-foreground">
            {room.company_name ?? room.company_letter} · Floor {room.floor}
            {hasCustomName && (
              <span className="text-muted-foreground/80"> · Room number {room.room_number}</span>
            )}
          </p>
          {canManage && !bunkOnlyView && (
            <label className="inline-flex items-center gap-2 text-sm text-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={acceptsOccupants}
                onChange={(e) => handleAcceptsOccupantsChange(e.target.checked)}
                disabled={isPending}
                className="rounded border-input"
              />
              Accepts Occupants
            </label>
          )}
        </div>
      </div>

      {message && (
        <div className="p-3 text-sm bg-destructive/10 border border-destructive/30 rounded-lg text-destructive">
          {message}
        </div>
      )}

      {/* Occupancy */}
      <section className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Occupancy</h2>
        {!acceptsOccupants ? (
          <p className="text-sm text-muted-foreground">
            This room does not accept cadet assignments. Enable Accepts Occupants above to restore bunk assignment.
          </p>
        ) : (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">Top bunk</h3>
            <BunkOccupantLabel occupant={room.occupant_top} pendingForm={topPendingMoveIn} bunkOnlyView={bunkOnlyView} />
            {canManage && !bunkOnlyView && (
              <div className="space-y-2">
                <SearchableSelect
                  label=""
                  options={cadetOptions}
                  value={topCadetId}
                  onChange={setTopCadetId}
                  placeholder="Search cadet..."
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={isPending || !topCadetId}
                    onClick={() => handleAssign('top', topCadetId)}
                    className="btn-primary text-sm"
                  >
                    Assign
                  </button>
                  {topOccupant && (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleClear('top')}
                      className="btn-secondary text-sm"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">Bottom bunk</h3>
            <BunkOccupantLabel occupant={room.occupant_bottom} pendingForm={bottomPendingMoveIn} bunkOnlyView={bunkOnlyView} />
            {canManage && !bunkOnlyView && (
              <div className="space-y-2">
                <SearchableSelect
                  label=""
                  options={cadetOptions}
                  value={bottomCadetId}
                  onChange={setBottomCadetId}
                  placeholder="Search cadet..."
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={isPending || !bottomCadetId}
                    onClick={() => handleAssign('bottom', bottomCadetId)}
                    className="btn-primary text-sm"
                  >
                    Assign
                  </button>
                  {bottomOccupant && (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleClear('bottom')}
                      className="btn-secondary text-sm"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        )}
      </section>

      {canManage && !bunkOnlyView && acceptsOccupants && invites.length > 0 && (
        <section className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Move-in invites</h2>
          <ul className="space-y-3">
            {invites.map((invite) => {
              const status = invite.revoked_at
                ? 'Revoked'
                : invite.redeemed_at
                  ? 'Redeemed'
                  : new Date(invite.expires_at) < new Date()
                    ? 'Expired'
                    : invite.form_submission_status === 'submitted'
                      ? 'Awaiting TAC review'
                      : 'Pending'
              return (
                <li
                  key={invite.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border border-border rounded-lg p-3"
                >
                  <div className="text-sm min-w-0">
                    <p className="font-medium truncate">{invite.cadet_name}</p>
                    <p className="text-muted-foreground truncate">{invite.recipient_email}</p>
                    <p className="text-xs text-muted-foreground">
                      {invite.locked_bunk} bunk · desk {invite.locked_desk_side} · {status}
                    </p>
                  </div>
                  {!invite.revoked_at && (
                    <div className="flex flex-wrap gap-2 shrink-0">
                      {invite.can_edit && (
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => setEditingInvite(invite)}
                          className="btn-secondary text-xs"
                        >
                          Edit email
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleResendInvite(invite)}
                        className="btn-secondary text-xs"
                      >
                        Resend
                      </button>
                      {invite.can_edit && (
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleRevokeInvite(invite.id)}
                          className="btn-secondary text-xs text-destructive border-destructive/30"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {/* Inspection history */}
      <section className="bg-card border border-border rounded-xl p-6">
        <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
          <h2 className="text-lg font-semibold">Inspection history</h2>
          {detail.move_in_forms.length > 0 && detail.move_out_forms.length > 0 && (
            <button type="button" onClick={handleCompare} disabled={isPending} className="text-sm text-primary hover:underline">
              Compare latest forms
            </button>
          )}
        </div>

        {comparison && (
          <div className="mb-6 overflow-x-auto">
            <table className="w-full text-sm border border-border">
              <thead>
                <tr className="bg-muted/50">
                  <th className="p-2 text-left">Item</th>
                  <th className="p-2 text-left">Move-in</th>
                  <th className="p-2 text-left">Move-out</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row) => (
                  <tr key={row.item_key} className={row.changed ? 'bg-amber-500/10' : ''}>
                    <td className="p-2 border-t border-border">{row.item_label}</td>
                    <td className="p-2 border-t border-border">{row.move_in_status ?? '—'}</td>
                    <td className="p-2 border-t border-border">{row.move_out_status ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Move-in forms</h3>
              {canManage && !bunkOnlyView && acceptsOccupants && (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => openInviteForBunk(topOccupant ? 'top' : bottomOccupant ? 'bottom' : 'top')}
                    className={inspectionActionClass}
                  >
                    Send Move-In Link
                  </button>
                  <Link
                    href={`/barracks/rooms/${room.id}/move-in/new`}
                    className={inspectionActionClass}
                  >
                    Move-In Form
                  </Link>
                </div>
              )}
            </div>
            {detail.move_in_forms.length === 0 ? (
              <p className="text-sm text-muted-foreground">None yet.</p>
            ) : (
              <ul className="space-y-3">
                {detail.move_in_forms.map((f) => (
                  <li
                    key={f.id}
                    className="flex flex-col gap-1 border border-border rounded-lg p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/barracks/forms/${f.id}?type=move_in`}
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          {bunkOnlyView ? 'Move-in form' : f.cadet_name}
                        </Link>
                        <MoveInFormStatusBadge form={f} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {bunkOnlyView ? (
                          <>
                            {f.sent_at ? `Sent ${formatInspectionTimestamp(f.sent_at)}` : 'TAC inspection'}
                          </>
                        ) : (
                          <>
                            {f.sent_by_name
                              ? `Requested by ${f.sent_by_name}`
                              : 'TAC inspection'}
                            {f.sent_at ? ` · Sent ${formatInspectionTimestamp(f.sent_at)}` : ''}
                            {f.recipient_email ? ` · ${f.recipient_email}` : ''}
                          </>
                        )}
                      </p>
                      {f.completed_at && (
                        <p className="text-xs text-muted-foreground">
                          Completed {formatInspectionTimestamp(f.completed_at)}
                          {!bunkOnlyView && f.filled_by_name ? ` by ${f.filled_by_name}` : ''}
                          {!bunkOnlyView && f.validated_by_name ? ` · Validated by ${f.validated_by_name}` : ''}
                        </p>
                      )}
                    </div>
                    {canManage && !bunkOnlyView && f.invite_can_edit && f.invite_id && (
                      <div className="flex gap-2 shrink-0">
                        <button
                          type="button"
                          className="btn-secondary text-xs"
                          onClick={() =>
                            setEditingInvite({
                              id: f.invite_id!,
                              cadet_name: f.cadet_name,
                              recipient_email: f.recipient_email ?? '',
                            })
                          }
                        >
                          Edit email
                        </button>
                        <button
                          type="button"
                          disabled={isPending}
                          className="btn-secondary text-xs text-destructive border-destructive/30"
                          onClick={() => handleRevokeInvite(f.invite_id!)}
                        >
                          Cancel invite
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Move-out forms</h3>
              {canManage && !bunkOnlyView && (
                <Link
                  href={`/barracks/rooms/${room.id}/move-out/new`}
                  className={inspectionActionClass}
                >
                  Move-Out Form
                </Link>
              )}
            </div>
            {detail.move_out_forms.length === 0 ? (
              <p className="text-sm text-muted-foreground">None yet.</p>
            ) : (
              <ul className="space-y-2">
                {detail.move_out_forms.map((f) => (
                  <li key={f.id}>
                    <Link href={`/barracks/forms/${f.id}?type=move_out`} className="text-sm text-primary hover:underline">
                      {bunkOnlyView ? 'Move-out form' : f.cadet_name} — {formatDate(f.completed_at ?? f.created_at)}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* Repair history */}
      <section className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Repair history</h2>
        {detail.work_orders.length === 0 ? (
          <p className="text-sm text-muted-foreground">No work orders for this room.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left py-2 pr-4">Date</th>
                  <th className="text-left py-2 pr-4">Status</th>
                  <th className="text-left py-2 pr-4">Priority</th>
                  <th className="text-left py-2">Description</th>
                </tr>
              </thead>
              <tbody>
                {detail.work_orders.map((wo) => (
                  <tr key={wo.id} className="border-b border-border/50">
                    <td className="py-2 pr-4 whitespace-nowrap">{formatDate(wo.created_at)}</td>
                    <td className="py-2 pr-4 capitalize">{wo.status.replace('_', ' ')}</td>
                    <td className="py-2 pr-4 capitalize">{wo.priority}</td>
                    <td className="py-2">
                      <Link href={`/work-orders/${wo.id}`} className="text-primary hover:underline">
                        {wo.description}
                      </Link>
                      {wo.source_inspection_item_id && (
                        <span className="ml-2 text-xs text-muted-foreground">(from inspection)</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {editingInvite && (
        <EditMoveInInviteModal
          inviteId={editingInvite.id}
          roomId={room.id}
          roomNumber={room.room_number}
          cadetName={editingInvite.cadet_name}
          initialEmail={editingInvite.recipient_email}
          onClose={() => setEditingInvite(null)}
          onSaved={() => router.refresh()}
        />
      )}

      {showInviteModal && (
        <SendMoveInInviteModal
          roomId={room.id}
          roomNumber={room.room_number}
          cadetOptions={cadetOptions}
          defaultCadetId={defaultInviteCadetId}
          defaultBunk={inviteBunk}
          onClose={() => setShowInviteModal(false)}
          onSent={() => router.refresh()}
        />
      )}
    </div>
  )
}
