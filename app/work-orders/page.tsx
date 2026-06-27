import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getMaintenanceStaffList, getMyWorkOrders, getViewerPersona } from './actions'
import WorkOrdersClient from './WorkOrdersClient'

function getPageCopy(persona: NonNullable<Awaited<ReturnType<typeof getViewerPersona>>>) {
  if (persona.isMaintenance && !persona.isAdmin) {
    return {
      title: 'Maintenance Queue',
      subtitle: 'Forwarded work orders waiting on maintenance action.',
    }
  }
  if (persona.isTac && persona.roleLevel >= 65) {
    return {
      title: 'Work Orders',
      subtitle: 'Review barracks maintenance requests and forward to the maintenance portal.',
    }
  }
  if (persona.isAdmin) {
    return {
      title: 'Work Orders',
      subtitle: 'Review and track maintenance requests across the school.',
    }
  }
  return {
    title: 'My Requests',
    subtitle: 'Track your submitted maintenance requests and their status.',
  }
}

export default async function WorkOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const persona = await getViewerPersona()
  if (!persona || persona.roleLevel < 15) redirect('/')

  const params = await searchParams
  const initialTab = params.tab === 'history' ? 'history' : 'actionable'

  const [actionableOrders, historyOrders, maintenanceStaff] = await Promise.all([
    getMyWorkOrders('actionable'),
    getMyWorkOrders('history'),
    getMaintenanceStaffList(),
  ])

  const copy = getPageCopy(persona)

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{copy.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{copy.subtitle}</p>
        </div>
        <div className="flex gap-2">
          {(persona.isMaintenance || persona.roleLevel < 50) && (
            <Link href="/submit?tab=damage" className="btn-primary text-sm">
              + New Request
            </Link>
          )}
        </div>
      </div>

      <WorkOrdersClient
        actionableOrders={actionableOrders}
        historyOrders={historyOrders}
        persona={persona}
        initialTab={initialTab}
        maintenanceStaff={maintenanceStaff}
      />
    </div>
  )
}
