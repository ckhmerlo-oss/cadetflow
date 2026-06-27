import { getAllowedPolicyCategories } from '@/app/lib/categoryRestrictions.server'
import { filterOffensesByPolicy } from '@/app/lib/categoryRestrictions'
import { createClient } from '@/utils/supabase/server'
import { getIncident, getFacultyList } from '../actions'
import { notFound, redirect } from 'next/navigation'
import IncidentDetailsClient from './IncidentDetailsClient'

export default async function IncidentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  // 1. Fetch Incident
  const incident = await getIncident(id)
  if (!incident) return notFound()

  // 2. Check Permissions
  const { data: profile } = await supabase.from('profiles').select('role:roles(default_role_level)').eq('id', user.id).single()
  const roleLevel = (profile?.role as any)?.default_role_level || 0
  
  const isReporter = incident.reporter_id === user.id
  const isStaff = roleLevel >= 50
  
  if (!isReporter && !isStaff) return notFound()

  // 3. Fetch Data for Actions (Only if Staff & Pending)
  let facultyList: {id: string, label: string}[] = [] 
  let offenseTypes: any[] = []
  
  if (roleLevel >= 65 && incident.status === 'pending') {
      facultyList = await getFacultyList()
      
      const { data: offenses } = await supabase
        .from('offense_types')
        .select('id, offense_name, demerits, offense_group, policy_category') 
        .order('offense_group')
      
      const { categories: allowedCategories } = await getAllowedPolicyCategories(roleLevel)
      offenseTypes = filterOffensesByPolicy(offenses ?? [], allowedCategories)
  }

  return (
    <IncidentDetailsClient 
      incident={incident}
      userRoleLevel={roleLevel}
      facultyList={facultyList}
      offenseTypes={offenseTypes.map(o => ({
          ...o, 
          label: o.offense_name, 
          group: o.offense_group
      }))}
    />
  )
}