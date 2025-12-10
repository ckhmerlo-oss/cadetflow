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
    .single()
  
  const roleLevel = (profile?.role as any)?.default_role_level || 0
  if (roleLevel < 50) return redirect('/')

  // Fetch Incidents
  const incidents = await getIncidents('all')
  
  // Fetch Offense Types
  // FIX: Ensure 'demerits' is selected so the dropdown shows the value
  const { data: offenseTypes } = await supabase
    .from('offense_types')
    .select('id, offense_name, offense_group, demerits') 
    .order('offense_group')

  const formattedOffenses = offenseTypes?.map((o: any) => ({
      id: o.id,
      label: o.offense_name,
      group: o.offense_group,
      demerits: o.demerits // Pass explicit demerits
  })) || []

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Incident Reports</h1>
            <p className="text-gray-500 dark:text-gray-400">Track and triage behavioral incidents.</p>
          </div>
          <Link href="/incidents/create" className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700 font-bold">
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