import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import {
  getMaintenanceStaffList,
  getWorkOrder,
  getWorkOrderAuditLog,
  getWorkOrderNotificationHistory,
  getWorkOrderPermissions,
} from '../actions'
import WorkOrderDetailsClient from './WorkOrderDetailsClient'

export default async function WorkOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const workOrder = await getWorkOrder(id)
  if (!workOrder) notFound()

  const [auditLog, emailHistory, permissions, maintenanceStaff] = await Promise.all([
    getWorkOrderAuditLog(id),
    getWorkOrderNotificationHistory(id),
    getWorkOrderPermissions(workOrder),
    getMaintenanceStaffList(),
  ])

  const canView =
    permissions.isRequester ||
    permissions.canTacManage ||
    permissions.canMaintenanceManage

  if (!canView) notFound()

  return (
    <WorkOrderDetailsClient
      workOrder={workOrder}
      auditLog={auditLog}
      emailHistory={emailHistory}
      permissions={permissions}
      maintenanceStaff={maintenanceStaff}
    />
  )
}
