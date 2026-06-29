import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getBarracksViewerPersona, getHallwayBuilding } from '../../actions'
import { COMPANY_LETTERS } from '../../constants'
import PrintPageShell from './PrintPageShell'

export default async function HallwayPrintPage({
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
    redirect('/barracks/hallway')
  }

  const building = await getHallwayBuilding(company)
  if (!building) redirect('/barracks/hallway')

  return <PrintPageShell building={building} company={company} />
}
