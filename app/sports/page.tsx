import { createClient } from '@/utils/supabase/server'
import { getSportsList, getUnassignedCadets, getGlobalUpcomingEvents } from './actions'
import SportsDashboardClient from './SportsDashboardClient'

export default async function SportsDashboardPage() {
  const month = new Date().getMonth()
  let currentSeason = 'Fall'
  if (month >= 10 || month <= 1) currentSeason = 'Winter' // Corrected logic (Nov, Dec, Jan, Feb)
  if (month >= 2 && month <= 5) currentSeason = 'Spring'

  const [sports, unassigned, upcoming] = await Promise.all([
      getSportsList(),
      getUnassignedCadets(currentSeason),
      getGlobalUpcomingEvents()
  ])

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-primary mb-2">Sports Management</h1>
      <p className="text-muted-foreground mb-8">Manage rosters, schedules, and coaching assignments.</p>
      
      <SportsDashboardClient 
        sports={sports}
        upcomingEvents={upcoming}
        unassignedCadets={unassigned}
        currentSeason={currentSeason}
      />
    </div>
  )
}