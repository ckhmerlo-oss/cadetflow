import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getTeacherClasses } from './actions'
import ClassesDashboardClient from './ClassesDashboardClient'

export default async function ClassesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role:role_id(default_role_level)')
    .eq('id', user.id)
    .single()

  const roleLevel = (profile?.role as { default_role_level?: number } | null)?.default_role_level ?? 0
  if (roleLevel < 50 || roleLevel >= 65) redirect('/')

  const sections = await getTeacherClasses()

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-primary mb-2">My Classes</h1>
      <p className="text-muted-foreground mb-8">
        Define your teaching schedule and manage class rosters for the current school year.
      </p>
      <ClassesDashboardClient sections={sections} />
    </div>
  )
}
