import { getAllowedPolicyCategories } from '@/app/lib/categoryRestrictions.server'
import { filterOffensesByPolicy } from '@/app/lib/categoryRestrictions'
import { createClient } from '@/utils/supabase/server'
import { getIncidents } from './actions'
import IncidentsClient from './IncidentsClient'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function IncidentsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role:roles(default_role_level)')
    .eq('id', user.id)
    .eq('archived', false)
    .single()
  
  const roleLevel = (profile?.role as any)?.default_role_level || 0
  if (roleLevel < 50) return redirect('/')

  // Fetch Incidents
  const incidents = await getIncidents('all')
  
  // Fetch Offense Types
  const { data: offenseTypes } = await supabase
    .from('offense_types')
    .select('id, offense_name, offense_group, demerits, policy_category') 
    .order('offense_group')

  const allowedCategories = roleLevel >= 90
    ? [1, 2, 3]
    : (await getAllowedPolicyCategories(roleLevel)).categories

  const filteredOffenses = filterOffensesByPolicy(offenseTypes ?? [], allowedCategories)

  const formattedOffenses = filteredOffenses.map((o: any) => ({
      id: o.id,
      label: o.offense_name,
      group: o.offense_group,
      demerits: o.demerits,
      policy_category: o.policy_category,
  }))

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary">Incident Reports</h1>
            <p className="text-muted-foreground">Track and triage behavioral incidents.</p>
          </div>
          <Link href="/submit?tab=incident" className="btn-primary font-bold">
            + New Incident
          </Link>
      </div>
      
      <IncidentsClient 
        incidents={incidents} 
        roleLevel={roleLevel}
        offenseTypes={formattedOffenses}
      />
    </div>
  )
}