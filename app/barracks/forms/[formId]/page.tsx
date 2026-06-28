import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getBarracksViewerPersona, getInspectionForm, listInspectionTemplates } from '../../actions'
import InspectionFormView from '../../components/InspectionFormView'

export default async function InspectionFormPage({
  params,
  searchParams,
}: {
  params: Promise<{ formId: string }>
  searchParams: Promise<{ type?: string }>
}) {
  const { formId } = await params
  const { type } = await searchParams

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const formType = type === 'move_out' ? 'move_out' : 'move_in'
  const [data, templates, persona] = await Promise.all([
    getInspectionForm(formId, formType),
    listInspectionTemplates(),
    getBarracksViewerPersona(),
  ])

  if (!data) notFound()

  const canValidate = Boolean(
    formType === 'move_in' &&
      persona &&
      (persona.canManage || persona.isAdmin) &&
      data.form.submission_status === 'submitted'
  )

  const canManage = Boolean(persona && (persona.canManage || persona.isAdmin))

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
      <InspectionFormView
        data={data}
        roomId={data.form.barracks_room_id}
        templates={templates}
        canValidate={canValidate}
        canManage={canManage}
        bunkOnlyView={persona?.bunkOnlyView ?? false}
      />
    </div>
  )
}
