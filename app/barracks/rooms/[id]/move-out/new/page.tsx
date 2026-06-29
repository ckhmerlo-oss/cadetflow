import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import {
  getBarracksRoomDetail,
  getBarracksViewerPersona,
  listInspectionTemplates,
  searchCompanyCadets,
} from '../../../../actions'
import InspectionFormEditor from '../../../../components/InspectionFormEditor'

export default async function MoveOutFormPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const persona = await getBarracksViewerPersona()
  if (!persona?.canManage && !persona?.isAdmin) redirect('/')

  const [detail, templates] = await Promise.all([
    getBarracksRoomDetail(id),
    listInspectionTemplates(),
  ])
  if (!detail) notFound()

  const cadets = await searchCompanyCadets('', detail.room.company_id)
  const cadetOptions = cadets.map((c) => ({ id: c.id, label: c.label }))

  const defaultCadetId =
    detail.room.occupant_top && !detail.room.occupant_top.archived
      ? detail.room.occupant_top.id
      : detail.room.occupant_bottom && !detail.room.occupant_bottom.archived
        ? detail.room.occupant_bottom.id
        : ''

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
      <InspectionFormEditor
        roomId={detail.room.id}
        roomNumber={detail.room.room_number}
        formType="move_out"
        templates={templates}
        cadetOptions={cadetOptions}
        defaultCadetId={defaultCadetId}
      />
    </div>
  )
}
