import {
  assertParentLinkedToCadet,
  getLinkedCadetsForParent,
  listTravelRequestsForCadet,
} from '@/app/lib/parent-queries'
import ParentCadetNotFound from '@/app/parent/components/ParentCadetNotFound'
import TravelRequestForm from '@/app/parent/components/TravelRequestForm'

export default async function ParentTravelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const linked = await assertParentLinkedToCadet(id)
  if (!linked) return <ParentCadetNotFound />

  const cadets = await getLinkedCadetsForParent()
  const cadet = cadets.find((c) => c.cadet_id === id)
  if (!cadet) return <ParentCadetNotFound />

  const requests = await listTravelRequestsForCadet(id)

  return (
    <TravelRequestForm
      cadetId={id}
      cadetName={`${cadet.first_name} ${cadet.last_name}`}
      isArchived={cadet.archived}
      initialRequests={requests}
    />
  )
}
