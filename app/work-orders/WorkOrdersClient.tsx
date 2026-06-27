'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useCallback, useMemo, useState } from 'react'
import SearchableSelect from '@/app/components/SearchableSelect'
import { StatusBadge } from '@/app/components/ui/StatusBadge'
import { WORK_ORDER_ISSUE_PRESETS, WORK_ORDER_PRIORITIES } from '@/app/work-orders/constants'
import {
  bulkTransitionWorkOrders,
  getWorkOrderAuditLog,
  getWorkOrderNotificationHistory,
  transitionWorkOrder,
  updateWorkOrderDetails,
  type WorkOrderAuditEntry,
  type WorkOrderNotificationEntry,
  type WorkOrderRecord,
  type WorkOrderViewerPersona,
} from './actions'

function displayLocation(order: WorkOrderRecord) {
  if (order.barracks_room?.room_number) return order.barracks_room.room_number
  return order.location ?? 'Unknown'
}

function getPriorityRank(priority: string) {
  const idx = WORK_ORDER_PRIORITIES.indexOf(priority as (typeof WORK_ORDER_PRIORITIES)[number])
  return idx === -1 ? 0 : idx
}

function getHighestPriority(orders: WorkOrderRecord[]) {
  return orders.reduce((best, order) =>
    getPriorityRank(order.priority) > getPriorityRank(best) ? order.priority : best,
    orders[0]?.priority ?? 'normal'
  )
}

type LocationGroup = {
  location: string
  orders: WorkOrderRecord[]
  highestPriority: string
}

function groupOrdersByLocation(orders: WorkOrderRecord[]): LocationGroup[] {
  const map = new Map<string, WorkOrderRecord[]>()
  for (const order of orders) {
    const key = displayLocation(order)
    const existing = map.get(key)
    if (existing) existing.push(order)
    else map.set(key, [order])
  }

  return [...map.entries()]
    .map(([location, groupOrders]) => ({
      location,
      orders: [...groupOrders].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ),
      highestPriority: getHighestPriority(groupOrders),
    }))
    .sort((a, b) => {
      const priorityDiff = getPriorityRank(b.highestPriority) - getPriorityRank(a.highestPriority)
      if (priorityDiff !== 0) return priorityDiff
      return a.location.localeCompare(b.location, undefined, { numeric: true })
    })
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

function isTacBulkActionable(order: WorkOrderRecord, persona: WorkOrderViewerPersona) {
  return (
    persona.isTac &&
    !persona.isMaintenance &&
    ['submitted', 'tac_review'].includes(order.status)
  )
}

function isMaintenanceBulkActionable(order: WorkOrderRecord, persona: WorkOrderViewerPersona) {
  return (
    persona.isMaintenance &&
    ['forwarded', 'assigned'].includes(order.status)
  )
}

function canMaintenanceManageOrder(order: WorkOrderRecord, persona: WorkOrderViewerPersona) {
  return (
    (persona.isMaintenance || persona.isAdmin) &&
    ['forwarded', 'assigned'].includes(order.status)
  )
}

function isBulkActionable(order: WorkOrderRecord, persona: WorkOrderViewerPersona) {
  return isTacBulkActionable(order, persona) || isMaintenanceBulkActionable(order, persona)
}

function getGroupBulkableOrders(group: LocationGroup, persona: WorkOrderViewerPersona) {
  return group.orders.filter((order) => isBulkActionable(order, persona))
}

function isGroupAllSelected(
  group: LocationGroup,
  selectedIds: Set<string>,
  persona: WorkOrderViewerPersona
) {
  const bulkable = getGroupBulkableOrders(group, persona)
  return bulkable.length > 0 && bulkable.every((order) => selectedIds.has(order.id))
}

function formatEmailStatus(status: string) {
  if (status === 'sent') return 'Email sent'
  if (status === 'failed' || status === 'dead_letter') return 'Email failed'
  return 'Email queued'
}

type HistoryItem =
  | { kind: 'audit'; entry: WorkOrderAuditEntry; emails: WorkOrderNotificationEntry[] }
  | { kind: 'email'; entry: WorkOrderNotificationEntry }

function buildHistoryTimeline(
  audit: WorkOrderAuditEntry[],
  emails: WorkOrderNotificationEntry[]
): HistoryItem[] {
  const items: HistoryItem[] = audit.map((entry) => ({
    kind: 'audit' as const,
    entry,
    emails:
      ['forward', 'submitted_to_maintenance'].includes(entry.action) ? emails : [],
  }))

  for (const email of emails) {
    const alreadyShown = items.some(
      (item) =>
        item.kind === 'audit' &&
        ['forward', 'submitted_to_maintenance'].includes(item.entry.action) &&
        item.emails.some((e) => e.sent_at === email.sent_at)
    )
    if (!alreadyShown) {
      items.push({ kind: 'email', entry: email })
    }
  }

  items.sort((a, b) => {
    const aTime =
      a.kind === 'audit'
        ? new Date(a.entry.created_at).getTime()
        : new Date(a.entry.sent_at).getTime()
    const bTime =
      b.kind === 'audit'
        ? new Date(b.entry.created_at).getTime()
        : new Date(b.entry.sent_at).getTime()
    return bTime - aTime
  })

  return items
}

const filterInputClass =
  'block w-full rounded-md border border-input bg-background text-foreground shadow-sm sm:text-sm py-2 px-3 focus:ring-primary focus:border-primary placeholder:text-muted-foreground'

export default function WorkOrdersClient({
  actionableOrders,
  historyOrders,
  persona,
  initialTab = 'actionable',
  maintenanceStaff = [],
}: {
  actionableOrders: WorkOrderRecord[]
  historyOrders: WorkOrderRecord[]
  persona: WorkOrderViewerPersona
  initialTab?: 'actionable' | 'history'
  maintenanceStaff?: { id: string; label: string }[]
}) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'actionable' | 'history'>(initialTab)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [issueTypeFilter, setIssueTypeFilter] = useState('all')
  const [companyFilter, setCompanyFilter] = useState('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const [expandedLocation, setExpandedLocation] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkComment, setBulkComment] = useState('')
  const [bulkAssigneeId, setBulkAssigneeId] = useState('')
  const [rowComment, setRowComment] = useState('')
  const [rowPriority, setRowPriority] = useState('normal')
  const [rowAssigneeId, setRowAssigneeId] = useState('')
  const [rowEditDescription, setRowEditDescription] = useState('')
  const [rowEditPresets, setRowEditPresets] = useState<string[]>([])
  const [rowEditNotes, setRowEditNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [historyCache, setHistoryCache] = useState<
    Record<string, { audit: WorkOrderAuditEntry[]; emails: WorkOrderNotificationEntry[] }>
  >({})

  const sourceOrders = activeTab === 'actionable' ? actionableOrders : historyOrders

  const companies = useMemo(() => {
    const names = new Set<string>()
    sourceOrders.forEach((o) => {
      if (o.company?.company_name) names.add(o.company.company_name)
    })
    return [...names].sort()
  }, [sourceOrders])

  const filtered = useMemo(() => {
    return sourceOrders.filter((order) => {
      if (statusFilter !== 'all' && order.status !== statusFilter) return false
      if (priorityFilter !== 'all' && order.priority !== priorityFilter) return false
      if (issueTypeFilter !== 'all' && order.issue_type !== issueTypeFilter) return false
      if (companyFilter !== 'all' && order.company?.company_name !== companyFilter) return false

      if (startDate) {
        const created = order.created_at.slice(0, 10)
        if (created < startDate) return false
      }
      if (endDate) {
        const created = order.created_at.slice(0, 10)
        if (created > endDate) return false
      }

      if (!search.trim()) return true
      const haystack = [
        displayLocation(order),
        order.description,
        formatName(order.requester),
        order.company?.company_name ?? '',
        order.status,
        order.priority,
      ]
        .join(' ')
        .toLowerCase()
      return haystack.includes(search.toLowerCase())
    })
  }, [sourceOrders, statusFilter, priorityFilter, issueTypeFilter, companyFilter, startDate, endDate, search])

  const locationGroups = useMemo(() => groupOrdersByLocation(filtered), [filtered])

  const showTacBulkBar = persona.isTac && activeTab === 'actionable' && !persona.isMaintenance
  const showMaintenanceBulkBar = persona.isMaintenance && activeTab === 'actionable'
  const showBulkColumn = showTacBulkBar || showMaintenanceBulkBar

  const tabLabels = useMemo(() => {
    if (persona.isMaintenance && !persona.isAdmin) {
      return { actionable: 'Queue', history: 'History' }
    }
    if (persona.isAdmin) {
      return { actionable: 'Queue', history: 'History' }
    }
    if (persona.isTac && !persona.isSubmitter) {
      return { actionable: 'Queue', history: 'Forwarded / History' }
    }
    return { actionable: 'My Active', history: 'History' }
  }, [persona])

  const loadHistory = useCallback(async (orderId: string) => {
    if (historyCache[orderId]) return
    const [audit, emails] = await Promise.all([
      getWorkOrderAuditLog(orderId),
      getWorkOrderNotificationHistory(orderId),
    ])
    setHistoryCache((prev) => ({ ...prev, [orderId]: { audit, emails } }))
  }, [historyCache])

  const handleLocationClick = (location: string) => {
    const next = expandedLocation === location ? null : location
    setExpandedLocation(next)
    if (!next) setExpandedId(null)
  }

  const handleRowClick = async (orderId: string) => {
    const next = expandedId === orderId ? null : orderId
    setExpandedId(next)
    if (next) {
      const order = sourceOrders.find((o) => o.id === orderId)
      if (order) {
        setRowPriority(order.priority)
        setRowAssigneeId(order.assigned_to_id ?? '')
        setRowEditDescription(order.description)
        setRowEditPresets(order.issue_presets ?? [])
        setRowEditNotes(order.notes ?? '')
      }
      await loadHistory(orderId)
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectGroup = (group: LocationGroup) => {
    const bulkable = getGroupBulkableOrders(group, persona)
    const allSelected = bulkable.every((order) => selectedIds.has(order.id))
    setSelectedIds((prev) => {
      const next = new Set(prev)
      for (const order of bulkable) {
        if (allSelected) next.delete(order.id)
        else next.add(order.id)
      }
      return next
    })
  }

  const handleBulkAction = async (action: 'forward' | 'cancel' | 'assign' | 'complete') => {
    if (selectedIds.size === 0) return
    if (action === 'assign' && !bulkAssigneeId) {
      alert('Select a staff member to assign.')
      return
    }
    const labels: Record<string, string> = {
      forward: 'Forward',
      cancel: 'Cancel',
      assign: 'Assign',
      complete: 'Mark complete',
    }
    if (!window.confirm(`${labels[action]} ${selectedIds.size} work order(s)?`)) {
      return
    }
    setLoading(true)
    const result = await bulkTransitionWorkOrders([...selectedIds], action, {
      comment: bulkComment || undefined,
      assignedToId: action === 'assign' ? bulkAssigneeId : undefined,
    })
    setLoading(false)
    if (result.error) {
      alert(result.error)
      return
    }
    setSelectedIds(new Set())
    setBulkComment('')
    router.refresh()
  }

  const runRowAction = async (
    orderId: string,
    action: string,
    extra?: { priority?: string; assignedToId?: string }
  ) => {
    setLoading(true)
    const result = await transitionWorkOrder(orderId, action, {
      comment: rowComment || undefined,
      priority: extra?.priority,
      assignedToId: extra?.assignedToId,
    })
    setLoading(false)
    if (result.error) {
      alert(result.error)
      return
    }
    setRowComment('')
    router.refresh()
  }

  const saveRowDetails = async (orderId: string) => {
    setLoading(true)
    const result = await updateWorkOrderDetails(orderId, {
      description: rowEditDescription,
      issuePresets: rowEditPresets,
      notes: rowEditNotes || null,
    })
    setLoading(false)
    if (result.error) {
      alert(result.error)
      return
    }
    router.refresh()
  }

  const togglePreset = (preset: string) => {
    setRowEditPresets((prev) =>
      prev.includes(preset) ? prev.filter((p) => p !== preset) : [...prev, preset]
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 border-b border-border pb-2">
        {(['actionable', 'history'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              setActiveTab(tab)
              setExpandedLocation(null)
              setExpandedId(null)
              setSelectedIds(new Set())
            }}
            className={`border-b-2 px-3 py-2 text-sm font-medium ${
              activeTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tabLabels[tab]}
            <span className="ml-2 text-xs text-muted-foreground">
              ({tab === 'actionable' ? actionableOrders.length : historyOrders.length})
            </span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            {activeTab === 'actionable' ? 'Open In Queue' : 'In History'}
          </p>
          <p className="text-2xl font-bold text-foreground">{filtered.length}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Actionable Total</p>
          <p className="text-2xl font-bold text-foreground">{actionableOrders.length}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">History Total</p>
          <p className="text-2xl font-bold text-foreground">{historyOrders.length}</p>
        </div>
      </div>

      <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Search</label>
            <input
              type="text"
              placeholder="Search location, requester, description..."
              className={filterInputClass}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-36 min-w-[9rem]">
            <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Status</label>
            <select className={filterInputClass} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="submitted">Submitted</option>
              <option value="tac_review">TAC Review</option>
              <option value="forwarded">Forwarded</option>
              <option value="assigned">Assigned</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="w-32 min-w-[8rem]">
            <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Priority</label>
            <select className={filterInputClass} value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
              <option value="all">All</option>
              {WORK_ORDER_PRIORITIES.map((p) => (
                <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="w-36 min-w-[9rem]">
            <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Issue Type</label>
            <select className={filterInputClass} value={issueTypeFilter} onChange={(e) => setIssueTypeFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="barracks">Barracks</option>
              <option value="other">Other / Shared</option>
            </select>
          </div>
          {(persona.isAdmin || persona.isTac) && companies.length > 0 && (
            <div className="w-36 min-w-[9rem]">
              <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Company</label>
              <select className={filterInputClass} value={companyFilter} onChange={(e) => setCompanyFilter(e.target.value)}>
                <option value="all">All</option>
                {companies.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          )}
          <div className="w-36 min-w-[9rem]">
            <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">From</label>
            <input type="date" className={filterInputClass} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="w-36 min-w-[9rem]">
            <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">To</label>
            <input type="date" className={filterInputClass} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>
      </div>

      {showTacBulkBar && (
        <div className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-muted/30 rounded-md border border-border">
          <div className="text-sm font-bold text-foreground whitespace-nowrap min-w-[100px]">
            {selectedIds.size} selected
          </div>
          <div className="flex-1 w-full">
            <input
              type="text"
              placeholder={selectedIds.size > 0 ? 'Optional comment for bulk action...' : 'Select checkboxes to enable bulk actions...'}
              value={bulkComment}
              onChange={(e) => setBulkComment(e.target.value)}
              disabled={selectedIds.size === 0}
              className={`${filterInputClass} disabled:bg-muted disabled:text-muted-foreground`}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => handleBulkAction('forward')}
              disabled={selectedIds.size === 0 || loading}
              className="flex-1 sm:flex-none px-4 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              Forward to maintenance
            </button>
            <button
              type="button"
              onClick={() => handleBulkAction('cancel')}
              disabled={selectedIds.size === 0 || loading}
              className="flex-1 sm:flex-none px-4 py-2 bg-destructive text-destructive-foreground text-sm font-bold rounded-md hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showMaintenanceBulkBar && (
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 p-3 bg-muted/30 rounded-md border border-border">
          <div className="text-sm font-bold text-foreground whitespace-nowrap min-w-[100px]">
            {selectedIds.size} selected
          </div>
          <div className="w-full lg:w-56 shrink-0" onClick={(e) => e.stopPropagation()}>
            <SearchableSelect
              label="Assign to"
              options={maintenanceStaff}
              value={bulkAssigneeId}
              onChange={setBulkAssigneeId}
              placeholder="Select staff..."
            />
          </div>
          <div className="flex-1 w-full">
            <input
              type="text"
              placeholder={selectedIds.size > 0 ? 'Optional comment...' : 'Select checkboxes to enable bulk actions...'}
              value={bulkComment}
              onChange={(e) => setBulkComment(e.target.value)}
              disabled={selectedIds.size === 0}
              className={`${filterInputClass} disabled:bg-muted disabled:text-muted-foreground`}
            />
          </div>
          <div className="flex gap-2 w-full lg:w-auto">
            <button
              type="button"
              onClick={() => handleBulkAction('assign')}
              disabled={selectedIds.size === 0 || loading || !bulkAssigneeId}
              className="flex-1 lg:flex-none px-4 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              Assign selected
            </button>
            <button
              type="button"
              onClick={() => handleBulkAction('complete')}
              disabled={selectedIds.size === 0 || loading}
              className="flex-1 lg:flex-none px-4 py-2 bg-secondary text-secondary-foreground text-sm font-bold rounded-md hover:bg-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              Mark complete
            </button>
          </div>
        </div>
      )}

      <div className="bg-card shadow-sm rounded-lg overflow-hidden border border-border">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase w-8" />
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Location</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Orders</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Highest Priority</th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {locationGroups.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-muted-foreground">
                    No work orders match the current filters.
                  </td>
                </tr>
              ) : (
                locationGroups.map((group) => {
                  const groupBulkableCount = getGroupBulkableOrders(group, persona).length
                  const groupAllSelected = isGroupAllSelected(group, selectedIds, persona)

                  return (
                  <React.Fragment key={group.location}>
                    <tr
                      onClick={() => handleLocationClick(group.location)}
                      className={`cursor-pointer hover:bg-muted/50 transition-colors ${
                        expandedLocation === group.location ? 'bg-muted/30' : ''
                      }`}
                    >
                      <td className="px-4 py-3 text-muted-foreground">
                        <span className="inline-block w-4 text-center">
                          {expandedLocation === group.location ? '▼' : '▶'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">{group.location}</td>
                      <td className="px-4 py-3 text-foreground">{group.orders.length}</td>
                      <td className="px-4 py-3 capitalize">{group.highestPriority}</td>
                    </tr>

                    {expandedLocation === group.location && (
                      <tr className="bg-muted/10">
                        <td colSpan={4} className="p-0 border-b border-border">
                          <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                              <thead className="bg-muted/30 text-left">
                                <tr>
                                  {showBulkColumn && (
                                    <th className="p-4 w-12">
                                      <input
                                        type="checkbox"
                                        className="rounded border-input text-primary focus:ring-primary disabled:opacity-30"
                                        checked={groupAllSelected}
                                        onChange={() => toggleSelectGroup(group)}
                                        disabled={groupBulkableCount === 0}
                                      />
                                    </th>
                                  )}
                                  <th className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase">Created</th>
                                  <th className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase">Location</th>
                                  <th className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase">Requester</th>
                                  <th className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase">Company</th>
                                  <th className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase">Priority</th>
                                  <th className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-border/60">
                                {group.orders.map((order) => {
                                  const canBulk = isBulkActionable(order, persona)
                                  const cached = historyCache[order.id]
                                  const timeline = cached
                                    ? buildHistoryTimeline(cached.audit, cached.emails)
                                    : []
                                  const canTacAct =
                                    persona.isTac &&
                                    ['submitted', 'tac_review'].includes(order.status) &&
                                    !persona.isMaintenance
                                  const canCancel =
                                    canTacAct || (persona.isAdmin && !['completed', 'cancelled'].includes(order.status))
                                  const canMaintAct = canMaintenanceManageOrder(order, persona)
                                  const assigneeName = formatAssignee(order.assignee)

                                  return (
                                    <React.Fragment key={order.id}>
                                      <tr
                                        onClick={() => handleRowClick(order.id)}
                                        className={`cursor-pointer hover:bg-muted/40 transition-colors ${
                                          expandedId === order.id ? 'bg-muted/30' : ''
                                        }`}
                                      >
                                        {showBulkColumn && (
                                          <td className="p-4" onClick={(e) => e.stopPropagation()}>
                                            {canBulk ? (
                                              <input
                                                type="checkbox"
                                                className="rounded border-input text-primary focus:ring-primary"
                                                checked={selectedIds.has(order.id)}
                                                onChange={() => toggleSelect(order.id)}
                                              />
                                            ) : (
                                              <span className="block w-4 h-4" />
                                            )}
                                          </td>
                                        )}
                                        <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                                          {new Date(order.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 font-medium text-foreground">{displayLocation(order)}</td>
                                        <td className="px-4 py-3">{formatName(order.requester)}</td>
                                        <td className="px-4 py-3">{order.company?.company_name ?? '—'}</td>
                                        <td className="px-4 py-3 capitalize">{order.priority}</td>
                                        <td className="px-4 py-3">
                                          <StatusBadge status={order.status} type="workorder" />
                                        </td>
                                      </tr>

                                      {expandedId === order.id && (
                                        <tr className="bg-muted/20 shadow-inner">
                                          <td colSpan={showBulkColumn ? 7 : 6} className="p-0 border-b border-border">
                                            <div className="flex flex-col md:flex-row">
                                              <div className="flex-grow p-6 space-y-4 md:border-r border-border">
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                  <div>
                                                    <span className="block text-xs font-bold text-muted-foreground uppercase">Issue Type</span>
                                                    <span className="text-foreground capitalize">{order.issue_type}</span>
                                                  </div>
                                                  <div>
                                                    <span className="block text-xs font-bold text-muted-foreground uppercase">Submitted</span>
                                                    <span className="text-foreground">{new Date(order.created_at).toLocaleString()}</span>
                                                  </div>
                                                  <div>
                                                    <span className="block text-xs font-bold text-muted-foreground uppercase">Assigned To</span>
                                                    {assigneeName ? (
                                                      <span className="text-foreground">{assigneeName}</span>
                                                    ) : (
                                                      <span className={notAssignedClass}>Not Assigned</span>
                                                    )}
                                                  </div>
                                                </div>

                                {canMaintAct ? (
                                  <>
                                    <div onClick={(e) => e.stopPropagation()}>
                                      <span className="block text-xs font-bold text-muted-foreground uppercase mb-1">Issues</span>
                                      <div className="flex flex-wrap gap-2">
                                        {WORK_ORDER_ISSUE_PRESETS.map((preset) => (
                                          <label key={preset} className="inline-flex items-center gap-1.5 text-xs cursor-pointer">
                                            <input
                                              type="checkbox"
                                              className="rounded border-input text-primary focus:ring-primary"
                                              checked={rowEditPresets.includes(preset)}
                                              onChange={() => togglePreset(preset)}
                                            />
                                            {preset}
                                          </label>
                                        ))}
                                      </div>
                                    </div>
                                    <div onClick={(e) => e.stopPropagation()}>
                                      <h4 className="text-xs font-bold text-muted-foreground uppercase mb-1">Description</h4>
                                      <textarea
                                        className={`${filterInputClass} min-h-[80px]`}
                                        rows={3}
                                        value={rowEditDescription}
                                        onChange={(e) => setRowEditDescription(e.target.value)}
                                      />
                                    </div>
                                    <div onClick={(e) => e.stopPropagation()}>
                                      <h4 className="text-xs font-bold text-muted-foreground uppercase mb-1">Notes</h4>
                                      <textarea
                                        className={`${filterInputClass} min-h-[60px]`}
                                        rows={2}
                                        value={rowEditNotes}
                                        onChange={(e) => setRowEditNotes(e.target.value)}
                                        placeholder="Internal maintenance notes..."
                                      />
                                    </div>
                                    <button
                                      type="button"
                                      disabled={loading}
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        saveRowDetails(order.id)
                                      }}
                                      className="btn-secondary text-sm self-start"
                                    >
                                      Save issues / notes
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    {order.issue_presets?.length > 0 && (
                                      <div>
                                        <span className="block text-xs font-bold text-muted-foreground uppercase mb-1">Issues</span>
                                        <div className="flex flex-wrap gap-2">
                                          {order.issue_presets.map((preset) => (
                                            <span key={preset} className="text-xs bg-muted px-2 py-1 rounded border border-border">
                                              {preset}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    <div>
                                      <h4 className="text-xs font-bold text-muted-foreground uppercase mb-1">Description</h4>
                                      <p className="text-sm text-foreground bg-card p-3 rounded border border-border whitespace-pre-wrap">
                                        {order.description}
                                      </p>
                                    </div>
                                    {order.notes && (
                                      <div>
                                        <h4 className="text-xs font-bold text-muted-foreground uppercase mb-1">Notes</h4>
                                        <p className="text-sm text-foreground bg-card p-3 rounded border border-border whitespace-pre-wrap">
                                          {order.notes}
                                        </p>
                                      </div>
                                    )}
                                  </>
                                )}

                                                <div>
                                                  <h4 className="text-xs font-bold text-muted-foreground uppercase mb-2">History</h4>
                                                  <div className="space-y-2 max-h-48 overflow-y-auto">
                                                    {!cached ? (
                                                      <p className="text-xs text-muted-foreground">Loading history...</p>
                                                    ) : timeline.length === 0 ? (
                                                      <p className="text-xs text-muted-foreground">No history yet.</p>
                                                    ) : (
                                                      timeline.map((item, idx) => {
                                                        if (item.kind === 'email') {
                                                          return (
                                                            <div key={`email-${idx}`} className="text-xs border-l-2 border-primary/40 pl-2">
                                                              <span className="font-medium text-foreground">
                                                                {formatEmailStatus(item.entry.status)}
                                                              </span>
                                                              <span className="text-muted-foreground">
                                                                {' '}to {item.entry.recipient_name}
                                                                {item.entry.intended_email ? ` (${item.entry.intended_email})` : ''}
                                                                {' · '}
                                                                {new Date(item.entry.sent_at).toLocaleString()}
                                                              </span>
                                                              {item.entry.error_message && (
                                                                <span className="text-destructive block">{item.entry.error_message}</span>
                                                              )}
                                                            </div>
                                                          )
                                                        }

                                                        const { entry, emails } = item
                                                        return (
                                                          <div key={entry.id} className="text-xs">
                                                            <div className="flex flex-wrap items-start gap-2">
                                                              <span className="font-medium text-foreground">
                                                                {formatName(entry.actor)}
                                                              </span>
                                                              <span className="px-1.5 py-0.5 bg-muted rounded text-muted-foreground font-bold uppercase text-[10px]">
                                                                {entry.action.replace(/_/g, ' ')}
                                                                {entry.new_status ? ` → ${entry.new_status}` : ''}
                                                              </span>
                                                              <span className="text-muted-foreground">
                                                                {new Date(entry.created_at).toLocaleString()}
                                                              </span>
                                                            </div>
                                                            {entry.comment && (
                                                              <p className="text-muted-foreground italic mt-0.5">{entry.comment}</p>
                                                            )}
                                                            {emails.map((email, emailIdx) => (
                                                              <div key={emailIdx} className="ml-2 mt-1 border-l-2 border-primary/40 pl-2 text-muted-foreground">
                                                                {formatEmailStatus(email.status)} to {email.recipient_name}
                                                                {email.intended_email ? ` (${email.intended_email})` : ''}
                                                                {' · '}
                                                                {new Date(email.sent_at).toLocaleString()}
                                                                {email.error_message && (
                                                                  <span className="text-destructive block">{email.error_message}</span>
                                                                )}
                                                              </div>
                                                            ))}
                                                          </div>
                                                        )
                                                      })
                                                    )}
                                                  </div>
                                                </div>

                                                <Link
                                                  href={`/work-orders/${order.id}`}
                                                  className="text-sm text-primary hover:underline"
                                                  onClick={(e) => e.stopPropagation()}
                                                >
                                                  Open full details →
                                                </Link>
                                              </div>

                                              {(canTacAct || canCancel || canMaintAct) && (
                                                <div className="md:w-72 flex-shrink-0 p-6 bg-muted/10 flex flex-col gap-3 border-l border-border">
                                                  <label className="block text-xs font-bold text-muted-foreground uppercase">
                                                    Comment
                                                  </label>
                                                  <textarea
                                                    className={`${filterInputClass} min-h-[80px]`}
                                                    rows={3}
                                                    value={rowComment}
                                                    onChange={(e) => setRowComment(e.target.value)}
                                                    placeholder="Optional note..."
                                                    onClick={(e) => e.stopPropagation()}
                                                  />

                                                  {canMaintAct && (
                                                    <>
                                                      <div onClick={(e) => e.stopPropagation()}>
                                                        <SearchableSelect
                                                          label="Assign staff"
                                                          options={maintenanceStaff}
                                                          value={rowAssigneeId}
                                                          onChange={setRowAssigneeId}
                                                          placeholder="Assign staff..."
                                                        />
                                                      </div>
                                                      <button
                                                        type="button"
                                                        disabled={loading || !rowAssigneeId}
                                                        onClick={(e) => {
                                                          e.stopPropagation()
                                                          runRowAction(order.id, 'assign', { assignedToId: rowAssigneeId })
                                                        }}
                                                        className="btn-primary text-sm"
                                                      >
                                                        Assign / reassign
                                                      </button>
                                                      <button
                                                        type="button"
                                                        disabled={loading || !rowComment.trim()}
                                                        onClick={(e) => {
                                                          e.stopPropagation()
                                                          runRowAction(order.id, 'add_note')
                                                        }}
                                                        className="btn-secondary text-sm"
                                                      >
                                                        Add note
                                                      </button>
                                                      <div className="pt-2 border-t border-border space-y-1">
                                                        <button
                                                          type="button"
                                                          disabled={loading}
                                                          onClick={(e) => {
                                                            e.stopPropagation()
                                                            runRowAction(order.id, 'complete')
                                                          }}
                                                          className="btn-secondary text-sm w-full"
                                                        >
                                                          Mark complete
                                                        </button>
                                                        <p className="text-xs text-muted-foreground">
                                                          Optional — use only if your team tracks completion in CadetFlow.
                                                        </p>
                                                      </div>
                                                    </>
                                                  )}

                                                  {canTacAct && order.status === 'submitted' && (
                                                    <button
                                                      type="button"
                                                      disabled={loading}
                                                      onClick={(e) => {
                                                        e.stopPropagation()
                                                        runRowAction(order.id, 'start_review')
                                                      }}
                                                      className="btn-secondary text-sm"
                                                    >
                                                      Start TAC review
                                                    </button>
                                                  )}

                                                  {canTacAct && (
                                                    <>
                                                      <div onClick={(e) => e.stopPropagation()}>
                                                        <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">
                                                          Priority
                                                        </label>
                                                        <select
                                                          className={filterInputClass}
                                                          value={rowPriority}
                                                          onChange={(e) => setRowPriority(e.target.value)}
                                                        >
                                                          {WORK_ORDER_PRIORITIES.map((p) => (
                                                            <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                                                          ))}
                                                        </select>
                                                      </div>
                                                      <button
                                                        type="button"
                                                        disabled={loading}
                                                        onClick={(e) => {
                                                          e.stopPropagation()
                                                          runRowAction(order.id, 'set_priority', { priority: rowPriority })
                                                        }}
                                                        className="btn-secondary text-sm"
                                                      >
                                                        Set priority
                                                      </button>
                                                      <button
                                                        type="button"
                                                        disabled={loading}
                                                        onClick={(e) => {
                                                          e.stopPropagation()
                                                          runRowAction(order.id, 'forward')
                                                        }}
                                                        className="btn-primary text-sm"
                                                      >
                                                        Forward to maintenance
                                                      </button>
                                                    </>
                                                  )}

                                                  {canCancel && (
                                                    <button
                                                      type="button"
                                                      disabled={loading}
                                                      onClick={(e) => {
                                                        e.stopPropagation()
                                                        runRowAction(order.id, 'cancel')
                                                      }}
                                                      className="text-sm text-destructive hover:underline text-left"
                                                    >
                                                      Cancel request
                                                    </button>
                                                  )}
                                                </div>
                                              )}
                                            </div>
                                          </td>
                                        </tr>
                                      )}
                                    </React.Fragment>
                                  )
                                })}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
