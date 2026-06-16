import { createClient } from '@/utils/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { getClassSectionDetail } from '../actions'
import ClassClient from './ClassClient'

export default async function ClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const section = await getClassSectionDetail(id)
  if (!section) notFound()

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_site_admin, role:role_id(default_role_level)')
    .eq('id', user.id)
    .single()

  const roleLevel = (profile?.role as { default_role_level?: number } | null)?.default_role_level ?? 0
  const isOwner = section.teacher_id === user.id
  const isAdmin = profile?.is_site_admin || roleLevel >= 90

  if (!isOwner && !isAdmin) redirect('/classes')

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <ClassClient section={section} isOwner={isOwner} />
    </div>
  )
}
