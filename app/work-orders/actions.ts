'use server'

import { formatRpcError, logRpcFailure } from '@/app/lib/rpcDiagnostics'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import type { WorkOrderIssueType, WorkOrderStatus } from './constants'

export type WorkOrderRecord = {
  id: string
  created_at: string
  updated_at: string
  requester_id: string
  company_id: string | null
  barracks_room_id: string | null
  location: string | null
  issue_type: WorkOrderIssueType
  issue_presets: string[]
  description: string
  priority: string
  status: WorkOrderStatus
  notes: string | null
  assigned_to_id: string | null
  responsible_cadet_id: string | null
  source_inspection_item_id: string | null
  source_inspection_form_id: string | null
  requester?: { first_name: string; last_name: string }
  assignee?: { first_name: string; last_name: string } | null
  responsible_cadet?: { first_name: string; last_name: string } | null
  company?: { company_name: string } | null
  barracks_room?: { room_number: string; company_letter: string; floor: number } | null
}

export type WorkOrderAuditEntry = {
  id: string
  work_order_id: string
  actor_id: string | null
  action: string
  old_status: string | null
  new_status: string | null
  comment: string | null
  metadata: Record<string, unknown>
  created_at: string
  actor?: { first_name: string; last_name: string } | null
}

export type BarracksRoomOption = {
  id: string
  room_number: string
  company_letter: string
  floor: number
  room_index: number
}

async function getViewerContext() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id, role:roles!inner(default_role_level, role_name, can_manage_own_company_roster, can_manage_all_rosters)')
    .eq('id', user.id)
    .single()

  const role = profile?.role as {
    default_role_level?: number
    role_name?: string
    can_manage_own_company_roster?: boolean
    can_manage_all_rosters?: boolean
  } | null

  return {
    supabase,
    userId: user.id,
    companyId: profile?.company_id as string | null,
    roleLevel: role?.default_role_level ?? 0,
    roleName: role?.role_name ?? '',
    canManageAll: Boolean(role?.can_manage_all_rosters),
    canManageOwn: Boolean(role?.can_manage_own_company_roster),
    isMaintenance: (role?.role_name ?? '').toLowerCase().includes('maintenance'),
  }
}

const WORK_ORDER_SELECT = `
  *,
  requester:profiles!requester_id(first_name, last_name),
  assignee:profiles!assigned_to_id(first_name, last_name),
  responsible_cadet:profiles!responsible_cadet_id(first_name, last_name),
  company:companies(company_name),
  barracks_room:barracks_rooms(room_number, company_letter, floor)
`

export async function listBarracksRooms(companyLetter?: string | null) {
  const ctx = await getViewerContext()
  if (!ctx) return []

  const { data, error } = await ctx.supabase.rpc('list_barracks_rooms', {
    p_company_letter: companyLetter ?? null,
  })

  if (error) {
    logRpcFailure('list_barracks_rooms', error, { companyLetter })
    return []
  }

  return (data ?? []) as BarracksRoomOption[]
}

export async function getCadetDefaultRoomNumber() {
  const ctx = await getViewerContext()
  if (!ctx) return null

  const { data } = await ctx.supabase
    .from('cadet_profiles')
    .select('room_number')
    .eq('profile_id', ctx.userId)
    .maybeSingle()

  return data?.room_number?.trim() || null
}

export async function submitWorkOrder(payload: {
  issueType: WorkOrderIssueType
  description: string
  barracksRoomId?: string | null
  location?: string | null
  issuePresets?: string[]
}) {
  const ctx = await getViewerContext()
  if (!ctx) return { error: 'Unauthorized' }

  const { data, error } = await ctx.supabase.rpc('create_work_order', {
    p_issue_type: payload.issueType,
    p_description: payload.description,
    p_barracks_room_id: payload.barracksRoomId ?? null,
    p_location: payload.location ?? null,
    p_issue_presets: payload.issuePresets ?? [],
  })

  if (error) return { error: formatRpcError('create_work_order', error) }

  revalidatePath('/work-orders')
  revalidatePath('/submit')
  return { success: true, id: data as string }
}

export type WorkOrderNotificationEntry = {
  sent_at: string
  recipient_name: string
  intended_email: string | null
  status: string
  error_message: string | null
}

export type WorkOrderViewerPersona = {
  roleLevel: number
  userId: string
  companyId: string | null
  isTac: boolean
  isMaintenance: boolean
  isAdmin: boolean
  isSubmitter: boolean
}

async function enrichWorkOrders(
  supabase: Awaited<ReturnType<typeof createClient>>,
  rows: WorkOrderRecord[]
): Promise<WorkOrderRecord[]> {
  if (rows.length === 0) return []

  const ids = rows.map((r) => r.id)
  const { data, error } = await supabase
    .from('work_orders')
    .select(WORK_ORDER_SELECT)
    .in('id', ids)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('enrichWorkOrders:', error.message)
    return rows
  }

  const orderMap = new Map(rows.map((r, i) => [r.id, i]))
  const enriched = (data ?? []) as WorkOrderRecord[]
  enriched.sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0))
  return enriched
}

export async function getViewerPersona(): Promise<WorkOrderViewerPersona | null> {
  const ctx = await getViewerContext()
  if (!ctx) return null

  const isAdmin = ctx.roleLevel >= 90 || ctx.canManageAll
  const isTac = ctx.roleLevel >= 65 && !ctx.isMaintenance
  const isSubmitter = ctx.roleLevel < 65 && !ctx.isMaintenance

  return {
    roleLevel: ctx.roleLevel,
    userId: ctx.userId,
    companyId: ctx.companyId,
    isTac: ctx.roleLevel >= 65 || isAdmin,
    isMaintenance: ctx.isMaintenance,
    isAdmin,
    isSubmitter: isSubmitter || (ctx.roleLevel >= 15 && ctx.roleLevel < 65),
  }
}

export async function getMyWorkOrders(scope: 'actionable' | 'history' | 'all' = 'actionable') {
  const ctx = await getViewerContext()
  if (!ctx) return []

  const { data, error } = await ctx.supabase.rpc('get_my_work_orders', {
    p_scope: scope,
  })

  if (error) {
    logRpcFailure('get_my_work_orders', error, { scope })
    return getMyWorkOrdersFallback(scope)
  }

  return enrichWorkOrders(ctx.supabase, (data ?? []) as WorkOrderRecord[])
}

async function getMyWorkOrdersFallback(scope: 'actionable' | 'history' | 'all') {
  const ctx = await getViewerContext()
  if (!ctx) return []

  const { data, error } = await ctx.supabase
    .from('work_orders')
    .select(WORK_ORDER_SELECT)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getMyWorkOrdersFallback:', error.message)
    return []
  }

  let result = (data ?? []) as WorkOrderRecord[]
  const isAdmin = ctx.roleLevel >= 90 || ctx.canManageAll

  if (scope === 'all') {
    return isAdmin ? result : []
  }

  if (ctx.isMaintenance && !isAdmin) {
    if (scope === 'actionable') {
      return result
        .filter((order) => ['forwarded', 'assigned'].includes(order.status))
        .sort((a, b) => {
          const aMine = a.assigned_to_id === ctx.userId ? 0 : 1
          const bMine = b.assigned_to_id === ctx.userId ? 0 : 1
          if (aMine !== bMine) return aMine - bMine
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        })
    }
    return result.filter((order) => ['completed', 'cancelled'].includes(order.status))
  }

  if (ctx.roleLevel >= 65 && !isAdmin) {
    if (!ctx.canManageAll) {
      result = result.filter((row) => row.company_id === ctx.companyId)
    }
    if (scope === 'actionable') {
      return result.filter((order) => ['submitted', 'tac_review'].includes(order.status))
    }
    return result.filter((order) =>
      ['forwarded', 'assigned', 'completed', 'cancelled'].includes(order.status)
    )
  }

  if (isAdmin) {
    if (scope === 'actionable') {
      return result.filter((order) => ['submitted', 'tac_review'].includes(order.status))
    }
    return result.filter((order) =>
      ['forwarded', 'assigned', 'completed', 'cancelled'].includes(order.status)
    )
  }

  result = result.filter((order) => order.requester_id === ctx.userId)
  if (scope === 'actionable') {
    return result.filter((order) => ['submitted', 'tac_review'].includes(order.status))
  }
  return result.filter((order) =>
    ['forwarded', 'assigned', 'completed', 'cancelled'].includes(order.status)
  )
}

export async function getWorkOrderNotificationHistory(workOrderId: string) {
  const ctx = await getViewerContext()
  if (!ctx) return []

  const { data, error } = await ctx.supabase.rpc('get_work_order_notification_history', {
    p_work_order_id: workOrderId,
  })

  if (error) {
    console.error('getWorkOrderNotificationHistory:', error.message)
    return []
  }

  return (data ?? []) as WorkOrderNotificationEntry[]
}

export async function bulkTransitionWorkOrders(
  workOrderIds: string[],
  action: 'forward' | 'cancel' | 'assign' | 'complete',
  options?: { comment?: string; assignedToId?: string }
) {
  const ctx = await getViewerContext()
  if (!ctx) return { error: 'Unauthorized' }

  if (action === 'assign' && !options?.assignedToId) {
    return { error: 'Assignee is required for bulk assign' }
  }

  const errors: string[] = []
  for (const id of workOrderIds) {
    const { error } = await ctx.supabase.rpc('transition_work_order', {
      p_work_order_id: id,
      p_action: action,
      p_comment: options?.comment ?? null,
      p_assigned_to_id: action === 'assign' ? options?.assignedToId ?? null : null,
      p_priority: null,
    })
    if (error) errors.push(error.message)
  }

  if (errors.length > 0) {
    return { error: errors[0], partial: errors.length < workOrderIds.length }
  }

  revalidatePath('/work-orders')
  revalidatePath('/')
  return { success: true }
}

export async function updateWorkOrderDetails(
  workOrderId: string,
  payload: {
    description?: string
    issuePresets?: string[]
    notes?: string | null
  }
) {
  const ctx = await getViewerContext()
  if (!ctx) return { error: 'Unauthorized' }

  const { error } = await ctx.supabase.rpc('update_work_order_details', {
    p_work_order_id: workOrderId,
    p_description: payload.description ?? null,
    p_issue_presets: payload.issuePresets ?? null,
    p_notes: payload.notes ?? null,
  })

  if (error) return { error: formatRpcError('update_work_order_details', error) }

  revalidatePath('/work-orders')
  revalidatePath(`/work-orders/${workOrderId}`)
  return { success: true }
}

/** @deprecated Use getMyWorkOrders instead */
export async function getWorkOrders(filter: 'open' | 'forwarded' | 'all' = 'open') {
  const ctx = await getViewerContext()
  if (!ctx) return []

  let query = ctx.supabase
    .from('work_orders')
    .select(WORK_ORDER_SELECT)
    .order('created_at', { ascending: false })

  if (filter === 'open') {
    query = query.in('status', ['submitted', 'tac_review'])
  } else if (filter === 'forwarded') {
    query = query.in('status', ['forwarded', 'assigned'])
  }

  const { data, error } = await query
  if (error) {
    console.error('getWorkOrders:', error.message)
    return []
  }

  let result = (data ?? []) as WorkOrderRecord[]

  if (ctx.roleLevel >= 65 && ctx.roleLevel < 90 && !ctx.canManageAll) {
    result = result.filter((row) => row.company_id === ctx.companyId)
  }

  return result
}

export async function getMaintenanceWorkOrders() {
  const ctx = await getViewerContext()
  if (!ctx) return []

  const { data, error } = await ctx.supabase
    .from('work_orders')
    .select(WORK_ORDER_SELECT)
    .in('status', ['forwarded', 'assigned'])
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getMaintenanceWorkOrders:', error.message)
    return []
  }

  return (data ?? []) as WorkOrderRecord[]
}

export async function getAllWorkOrdersForTracking() {
  const ctx = await getViewerContext()
  if (!ctx) return []

  const canView =
    ctx.isMaintenance ||
    ctx.roleLevel >= 65 ||
    ctx.canManageAll

  if (!canView) return []

  const { data, error } = await ctx.supabase
    .from('work_orders')
    .select(WORK_ORDER_SELECT)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getAllWorkOrdersForTracking:', error.message)
    return []
  }

  let result = (data ?? []) as WorkOrderRecord[]

  if (ctx.roleLevel >= 65 && ctx.roleLevel < 90 && !ctx.canManageAll && !ctx.isMaintenance) {
    result = result.filter((row) => row.company_id === ctx.companyId)
  }

  return result
}

export async function getWorkOrder(id: string) {
  const ctx = await getViewerContext()
  if (!ctx) return null

  const { data, error } = await ctx.supabase
    .from('work_orders')
    .select(WORK_ORDER_SELECT)
    .eq('id', id)
    .maybeSingle()

  if (error || !data) return null
  return data as WorkOrderRecord
}

export async function getWorkOrderAuditLog(workOrderId: string) {
  const ctx = await getViewerContext()
  if (!ctx) return []

  const { data: logRows, error } = await ctx.supabase.rpc('get_work_order_audit_log', {
    p_work_order_id: workOrderId,
  })

  if (error) {
    console.error('getWorkOrderAuditLog:', error.message)
    return []
  }

  const entries = (logRows ?? []) as WorkOrderAuditEntry[]
  const actorIds = [...new Set(entries.map((e) => e.actor_id).filter(Boolean))] as string[]

  if (actorIds.length === 0) return entries

  const { data: actors } = await ctx.supabase
    .from('profiles')
    .select('id, first_name, last_name')
    .in('id', actorIds)

  const actorMap = new Map((actors ?? []).map((a) => [a.id, a]))

  return entries.map((entry) => ({
    ...entry,
    actor: entry.actor_id ? actorMap.get(entry.actor_id) ?? null : null,
  }))
}

export async function transitionWorkOrder(
  workOrderId: string,
  action: string,
  options?: {
    comment?: string
    assignedToId?: string | null
    priority?: string | null
    responsibleCadetId?: string | null
  }
) {
  const ctx = await getViewerContext()
  if (!ctx) return { error: 'Unauthorized' }

  const { error } = await ctx.supabase.rpc('transition_work_order', {
    p_work_order_id: workOrderId,
    p_action: action,
    p_comment: options?.comment ?? null,
    p_assigned_to_id: options?.assignedToId ?? null,
    p_priority: options?.priority ?? null,
    p_responsible_cadet_id: options?.responsibleCadetId ?? null,
  })

  if (error) return { error: formatRpcError('transition_work_order', error) }

  revalidatePath('/work-orders')
  revalidatePath(`/work-orders/${workOrderId}`)
  revalidatePath('/')
  return { success: true }
}

export async function getMaintenanceStaffList() {
  const ctx = await getViewerContext()
  if (!ctx) return []

  const { data } = await ctx.supabase
    .from('profiles')
    .select('id, first_name, last_name, role:roles!inner(role_name)')
    .eq('archived', false)
    .ilike('role.role_name', '%maintenance%')
    .order('last_name')

  return (data ?? []).map((p: { id: string; first_name: string; last_name: string; role: { role_name: string } | { role_name: string }[] }) => {
    const role = Array.isArray(p.role) ? p.role[0] : p.role
    return {
      id: p.id,
      label: `${p.last_name}, ${p.first_name} (${role?.role_name ?? 'Maintenance'})`,
    }
  })
}

export async function getWorkOrderPermissions(workOrder: WorkOrderRecord) {
  const ctx = await getViewerContext()
  if (!ctx) {
    return {
      canTacManage: false,
      canMaintenanceManage: false,
      isAdmin: false,
      isRequester: false,
    }
  }

  const isAdmin = ctx.roleLevel >= 90 || ctx.canManageAll
  const canTacManage =
    isAdmin ||
    (ctx.roleLevel >= 65 &&
      (ctx.canManageAll || (ctx.canManageOwn && workOrder.company_id === ctx.companyId)))
  const canMaintenanceManage = ctx.isMaintenance || isAdmin
  const isRequester = workOrder.requester_id === ctx.userId

  return { canTacManage, canMaintenanceManage, isAdmin, isRequester }
}
