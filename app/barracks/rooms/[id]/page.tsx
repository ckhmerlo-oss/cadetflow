import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getBarracksRoomDetail, getBarracksViewerPersona, listMoveInInvitesForRoom } from '../../actions'
import RoomDetailClient from '../../components/RoomDetailClient'

export default async function RoomDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const persona = await getBarracksViewerPersona()
  if (!persona || (!persona.isTac && !persona.isMaintenance && !persona.isAdmin)) {
    redirect('/')
  }

  const detail = await getBarracksRoomDetail(id)
  if (!detail) notFound()

  const invites = persona.canManage || persona.isAdmin ? await listMoveInInvitesForRoom(id) : []

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
      <RoomDetailClient detail={detail} persona={persona} invites={invites} />
    </div>
  )
}
