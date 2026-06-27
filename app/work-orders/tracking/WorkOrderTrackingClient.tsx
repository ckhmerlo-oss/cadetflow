'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { StatusBadge } from '@/app/components/ui/StatusBadge'
import type { WorkOrderRecord } from '@/app/work-orders/actions'

function displayLocation(order: WorkOrderRecord) {
  if (order.barracks_room?.room_number) return order.barracks_room.room_number
  return order.location ?? 'Unknown'
}

function formatName(person?: { first_name: string; last_name: string } | null) {
  if (!person) return 'Unknown'
  return `${person.last_name}, ${person.first_name}`
}

export default function WorkOrderTrackingClient({
  workOrders,
}: {
  workOrders: WorkOrderRecord[]
}) {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [search, setSearch] = useState('')

  const openCount = workOrders.filter((o) => !['completed', 'cancelled'].includes(o.status)).length

  const filtered = useMemo(() => {
    return workOrders.filter((order) => {
      if (statusFilter !== 'all' && order.status !== statusFilter) return false
      if (!search.trim()) return true
      const haystack = [
        displayLocation(order),
        order.description,
        formatName(order.requester),
        order.company?.company_name ?? '',
      ]
        .join(' ')
        .toLowerCase()
      return haystack.includes(search.toLowerCase())
    })
  }, [workOrders, statusFilter, search])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Open orders</p>
          <p className="text-2xl font-bold text-foreground">{openCount}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total tracked</p>
          <p className="text-2xl font-bold text-foreground">{workOrders.length}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Completed</p>
          <p className="text-2xl font-bold text-foreground">
            {workOrders.filter((o) => o.status === 'completed').length}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          className="input-base min-w-[220px]"
          placeholder="Search location, requester, description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="input-base"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All statuses</option>
          <option value="submitted">Submitted</option>
          <option value="tac_review">TAC review</option>
          <option value="forwarded">Forwarded</option>
          <option value="assigned">Assigned</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/40 text-left">
            <tr>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Requester</th>
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((order) => (
              <tr key={order.id} className="hover:bg-muted/30">
                <td className="px-4 py-3 whitespace-nowrap">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/work-orders/${order.id}`} className="text-primary hover:underline">
                    {displayLocation(order)}
                  </Link>
                </td>
                <td className="px-4 py-3">{formatName(order.requester)}</td>
                <td className="px-4 py-3">{order.company?.company_name ?? '—'}</td>
                <td className="px-4 py-3 capitalize">{order.priority}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={order.status} type="workorder" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="p-6 text-sm text-muted-foreground">No work orders match the current filters.</p>
        )}
      </div>
    </div>
  )
}
