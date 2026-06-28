'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import SearchableSelect from '@/app/components/SearchableSelect'
import { StatusBadge } from '@/app/components/ui/StatusBadge'
import { WORK_ORDER_PRIORITIES } from '@/app/work-orders/constants'
import {
  transitionWorkOrder,
  type WorkOrderAuditEntry,
  type WorkOrderNotificationEntry,
  type WorkOrderRecord,
} from '@/app/work-orders/actions'

function formatEmailStatus(status: string) {
  if (status === 'sent') return 'Email sent'
  if (status === 'failed' || status === 'dead_letter') return 'Email failed'
  return 'Email queued'
}

function displayLocation(order: WorkOrderRecord) {
  if (order.barracks_room?.room_number) return order.barracks_room.room_number
  return order.location ?? 'Unknown'
}

function formatName(person?: { first_name: string; last_name: string } | null) {
  if (!person) return 'Unknown'
  return `${person.last_name}, ${person.first_name}`
}

function formatAssignee(person?: { first_name: string; last_name: string } | null) {
  if (!person) return null
  return `${person.last_name}, ${person.first_name}`
}

const notAssignedClass = 'text-orange-700 dark:text-orange-400 font-medium'

export default function WorkOrderDetailsClient({
  workOrder,
  auditLog,
  emailHistory,
  permissions,
  maintenanceStaff,
  companyCadets = [],
}: {
  workOrder: WorkOrderRecord
  auditLog: WorkOrderAuditEntry[]
  emailHistory: WorkOrderNotificationEntry[]
  permissions: {
    canTacManage: boolean
    canMaintenanceManage: boolean
    isAdmin: boolean
    isRequester: boolean
  }
  maintenanceStaff: { id: string; label: string }[]
  companyCadets?: { id: string; label: string }[]
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [comment, setComment] = useState('')
  const [priority, setPriority] = useState(workOrder.priority)
  const [assigneeId, setAssigneeId] = useState(workOrder.assigned_to_id ?? '')
  const [responsibleCadetId, setResponsibleCadetId] = useState(
    workOrder.responsible_cadet_id ?? workOrder.requester_id ?? ''
  )

  const runAction = async (
    action: string,
    extra?: { assignedToId?: string; priority?: string; responsibleCadetId?: string }
  ) => {
    setLoading(true)
    const result = await transitionWorkOrder(workOrder.id, action, {
      comment: comment || undefined,
      assignedToId: extra?.assignedToId,
      priority: extra?.priority,
      responsibleCadetId:
        extra?.responsibleCadetId ??
        (action === 'forward' ? responsibleCadetId || undefined : undefined),
    })
    setLoading(false)

    if (result.error) {
      alert(result.error)
      return
    }

    setComment('')
    router.refresh()
  }

  const canForward = permissions.canTacManage && ['submitted', 'tac_review'].includes(workOrder.status)
  const canCancel = permissions.canTacManage && !['completed', 'cancelled'].includes(workOrder.status)
  const canAssign = permissions.canMaintenanceManage && ['forwarded', 'assigned'].includes(workOrder.status)
  const canComplete = permissions.canMaintenanceManage && ['forwarded', 'assigned'].includes(workOrder.status)
  const canSetPriority = permissions.canTacManage && ['submitted', 'tac_review'].includes(workOrder.status)
  const canAddNote = permissions.canTacManage || permissions.canMaintenanceManage
  const assigneeName = formatAssignee(workOrder.assignee)

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <Link href="/work-orders" className="text-sm text-primary hover:underline">
        ← Back to work orders
      </Link>

      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{displayLocation(workOrder)}</h1>
            <p className="text-sm text-muted-foreground">
              Submitted {new Date(workOrder.created_at).toLocaleString()}
            </p>
          </div>
          <StatusBadge status={workOrder.status} type="workorder" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Requester</p>
            <p className="text-foreground">{formatName(workOrder.requester)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Company</p>
            <p className="text-foreground">{workOrder.company?.company_name ?? '—'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Issue type</p>
            <p className="text-foreground capitalize">{workOrder.issue_type}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Priority</p>
            <p className="text-foreground capitalize">{workOrder.priority}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Location</p>
            <p className="text-foreground">{displayLocation(workOrder)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Assigned to</p>
            {assigneeName ? (
              <p className="text-foreground">{assigneeName}</p>
            ) : (
              <p className={notAssignedClass}>Not Assigned</p>
            )}
          </div>
          <div>
            <p className="text-muted-foreground">Responsible cadet</p>
            {workOrder.responsible_cadet ? (
              <p className="text-foreground">{formatName(workOrder.responsible_cadet)}</p>
            ) : (
              <p className={notAssignedClass}>Not assigned</p>
            )}
          </div>
        </div>

        {workOrder.issue_presets?.length > 0 && (
          <div>
            <p className="text-sm text-muted-foreground mb-1">Issues</p>
            <div className="flex flex-wrap gap-2">
              {workOrder.issue_presets.map((preset) => (
                <span key={preset} className="rounded-full bg-muted px-2 py-1 text-xs text-foreground">
                  {preset}
                </span>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="text-sm text-muted-foreground mb-1">Description</p>
          <p className="text-foreground whitespace-pre-wrap">{workOrder.description}</p>
        </div>

        {workOrder.notes && (
          <div>
            <p className="text-sm text-muted-foreground mb-1">Notes</p>
            <p className="text-foreground whitespace-pre-wrap">{workOrder.notes}</p>
          </div>
        )}
      </div>

      {(canForward || canCancel || canAssign || canComplete || canSetPriority || canAddNote) && (
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Actions</h2>

          <textarea
            className="input-base w-full min-h-[80px]"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Comment or note (optional for most actions, required for add note)"
          />

          {canSetPriority && (
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-sm text-muted-foreground">Priority</label>
              <select
                className="input-base"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                {WORK_ORDER_PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="btn-secondary text-sm"
                disabled={loading}
                onClick={() => runAction('set_priority', { priority })}
              >
                Update priority
              </button>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {workOrder.status === 'submitted' && permissions.canTacManage && (
              <button
                type="button"
                className="btn-secondary text-sm"
                disabled={loading}
                onClick={() => runAction('start_review')}
              >
                Start TAC review
              </button>
            )}
            {canForward && (
              <>
                {companyCadets.length > 0 && (
                  <SearchableSelect
                    label="Responsible cadet"
                    options={companyCadets}
                    value={responsibleCadetId}
                    onChange={setResponsibleCadetId}
                    placeholder="Moving cadet (default for degraded items)"
                  />
                )}
                <button
                  type="button"
                  className="btn-primary text-sm"
                  disabled={loading}
                  onClick={() => runAction('forward')}
                >
                  Forward to maintenance
                </button>
              </>
            )}
            {canCancel && (
              <button
                type="button"
                className="btn-secondary text-sm text-destructive"
                disabled={loading}
                onClick={() => runAction('cancel')}
              >
                Cancel request
              </button>
            )}
          </div>

          {canAssign && (
            <div className="space-y-2">
            <SearchableSelect
              label="Assignee"
              options={maintenanceStaff}
                value={assigneeId}
                onChange={setAssigneeId}
                placeholder="Assign maintenance staff..."
              />
              <button
                type="button"
                className="btn-primary text-sm"
                disabled={loading || !assigneeId}
                onClick={() => runAction('assign', { assignedToId: assigneeId })}
              >
                Assign
              </button>
            </div>
          )}

          {canComplete && (
            <div className="space-y-1">
              <button
                type="button"
                className="btn-secondary text-sm w-full"
                disabled={loading}
                onClick={() => runAction('complete')}
              >
                Mark complete (optional)
              </button>
              <p className="text-xs text-muted-foreground">
                Optional — use only if your team tracks completion in CadetFlow.
              </p>
            </div>
          )}

          {canAddNote && (
            <button
              type="button"
              className="btn-secondary text-sm"
              disabled={loading || !comment.trim()}
              onClick={() => runAction('add_note')}
            >
              Add note
            </button>
          )}
        </div>
      )}

      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">History</h2>
        {auditLog.length === 0 ? (
          <p className="text-sm text-muted-foreground">No audit entries yet.</p>
        ) : (
          <ul className="space-y-3">
            {auditLog.map((entry) => (
              <li key={entry.id} className="border-b border-border pb-3 last:border-0">
                <p className="text-sm font-medium text-foreground">
                  {entry.action.replace(/_/g, ' ')}
                  {entry.new_status ? ` → ${entry.new_status}` : ''}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatName(entry.actor)} · {new Date(entry.created_at).toLocaleString()}
                </p>
                {entry.comment && (
                  <p className="text-sm text-foreground mt-1 whitespace-pre-wrap">{entry.comment}</p>
                )}
                {['forward', 'submitted_to_maintenance'].includes(entry.action) &&
                  emailHistory.map((email, idx) => (
                    <p key={idx} className="text-xs text-muted-foreground mt-1 ml-2 border-l-2 border-primary/40 pl-2">
                      {formatEmailStatus(email.status)} to {email.recipient_name}
                      {email.intended_email ? ` (${email.intended_email})` : ''}
                      {' · '}
                      {new Date(email.sent_at).toLocaleString()}
                      {email.error_message && (
                        <span className="text-destructive block">{email.error_message}</span>
                      )}
                    </p>
                  ))}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
