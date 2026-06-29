'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useMemo, useState } from 'react'
import SubmitDemeritForm from './components/SubmitDemeritForm'
import SubmitIncidentForm from './components/SubmitIncidentForm'
import SubmitSpecialReportForm from './components/SubmitSpecialReportForm'
import SubmitWorkOrderForm from './components/SubmitWorkOrderForm'

type SubmitTab = 'demerit' | 'incident' | 'special' | 'damage'

const TAB_CONFIG: Array<{
  id: SubmitTab
  label: string
  alwaysShow?: boolean
  comingSoon?: { title: string; description: string; plannedDay: string }
}> = [
  { id: 'demerit', label: 'Demerit Report' },
  { id: 'incident', label: 'Incident Report' },
  { id: 'special', label: 'Special Report', alwaysShow: true },
  { id: 'damage', label: 'Damage / Work Order', alwaysShow: true },
]

function SubmitHubContent() {
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [roleLevel, setRoleLevel] = useState<number | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [canDemerit, setCanDemerit] = useState(false)
  const [canIncident, setCanIncident] = useState(false)
  const [loading, setLoading] = useState(true)

  const requestedTab = (searchParams.get('tab') as SubmitTab | null) ?? 'demerit'

  useEffect(() => {
    async function loadPermissions() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role:role_id(default_role_level)')
        .eq('id', user.id)
        .single()

      const level = (profile?.role as { default_role_level?: number } | null)?.default_role_level ?? 0

      if (level < 15) {
        router.replace(`/ledger/${user.id}`)
        return
      }

      const [{ data: demeritAllowed }, { data: incidentAllowed }] = await Promise.all([
        supabase.rpc('can_submit_demerits', { p_role_level: level }),
        supabase.rpc('can_submit_incidents', { p_role_level: level }),
      ])

      setRoleLevel(level)
      setUserId(user.id)
      setCanDemerit(Boolean(demeritAllowed))
      setCanIncident(Boolean(incidentAllowed))
      setLoading(false)
    }

    loadPermissions()
  }, [supabase, router])

  const visibleTabs = useMemo(() => {
    return TAB_CONFIG.filter((tab) => {
      if (tab.alwaysShow) return true
      if (tab.id === 'demerit') return canDemerit
      if (tab.id === 'incident') return canIncident
      return false
    })
  }, [canDemerit, canIncident])

  const activeTab = useMemo(() => {
    if (visibleTabs.some((t) => t.id === requestedTab)) return requestedTab
    return visibleTabs[0]?.id ?? 'demerit'
  }, [requestedTab, visibleTabs])

  const setTab = (tab: SubmitTab) => {
    router.replace(`/submit?tab=${tab}`)
  }

  if (loading || roleLevel === null) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-muted-foreground">
        Loading submission options...
      </div>
    )
  }

  const isCadet = roleLevel < 50

  return (
    <div className="relative max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Submit Report</h1>
        <p className="text-sm text-muted-foreground">
          Choose the report type that matches the situation. Cadet leaders may file Category I Demerit Reports and Incident Reports when policy allows.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-border mb-6">
        {visibleTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setTab(tab.id)}
            className={`border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'demerit' && canDemerit && <SubmitDemeritForm />}

      {activeTab === 'incident' && canIncident && (
        <SubmitIncidentForm roleLevel={roleLevel} />
      )}

      {activeTab === 'damage' && <SubmitWorkOrderForm roleLevel={roleLevel} />}

      {activeTab === 'special' && isCadet && userId && (
        <SubmitSpecialReportForm userId={userId} />
      )}

      {activeTab === 'special' && !isCadet && (
        <div className="bg-card p-6 rounded-lg border border-border text-muted-foreground text-sm">
          Special reports are submitted by cadets. Use the{' '}
          <a href="/incidents" className="text-primary hover:underline">
            Incidents
          </a>{' '}
          workspace to review and link cadet affidavits.
        </div>
      )}
    </div>
  )
}

export default function SubmitReportPage() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto p-8 text-muted-foreground">Loading...</div>}>
      <SubmitHubContent />
    </Suspense>
  )
}
