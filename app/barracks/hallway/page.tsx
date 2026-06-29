import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import {
  getBarracksViewerPersona,
  getHallwayBuilding,
  listBarracksCompanies,
} from '../actions'
import HallwayClient from './HallwayClient'
import { COMPANY_LETTERS } from '../constants'

export default async function HallwayPage({
  searchParams,
}: {
  searchParams: Promise<{ company?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const persona = await getBarracksViewerPersona()
  if (!persona || (!persona.isTac && !persona.isMaintenance && !persona.isAdmin)) {
    redirect('/')
  }

  const params = await searchParams
  const company = (params.company ?? 'A').toUpperCase()

  if (!COMPANY_LETTERS.includes(company as typeof COMPANY_LETTERS[number])) {
    redirect('/barracks/hallway?company=A')
  }

  const [building, companies] = await Promise.all([
    getHallwayBuilding(company),
    listBarracksCompanies(),
  ])

  if (!building) {
    return (
      <div className="max-w-7xl mx-auto p-8 text-center text-destructive">
        Unable to load hallway data. Check permissions or try another company.
      </div>
    )
  }

  return (
    <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8">
      <HallwayClient
        building={building}
        companies={companies}
        canEditNotes={persona.canManage || persona.isAdmin}
        canManageMarks={persona.canManage || persona.isAdmin}
        bunkOnlyView={persona.bunkOnlyView}
      />
    </div>
  )
}
