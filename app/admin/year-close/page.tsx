import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import YearCloseWizard from './YearCloseWizard'
import { getSchoolYearTerms } from '@/app/oversight/actions'

export default async function YearClosePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role:role_id(default_role_level)')
    .eq('id', user.id)
    .single()

  const level = (profile?.role as { default_role_level?: number } | null)?.default_role_level ?? 0
  if (level < 90) redirect('/admin')

  const terms = await getSchoolYearTerms()
  const activeYears = [...new Set(
    (terms as { school_year: string; archived: boolean }[])
      .filter((t) => !t.archived)
      .map((t) => t.school_year)
  )]

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <a href="/admin" className="text-sm text-muted-foreground hover:text-foreground">← Admin Settings</a>
          <h1 className="text-2xl font-bold text-foreground mt-2">Close School Year</h1>
          <p className="text-sm text-muted-foreground mt-1">
            End-of-year archive: pulls open demerits, closes appeals and pending incidents, archives all cadets, and activates the next school year. Historical conduct is queried from source records (Day 07).
          </p>
        </div>
        <YearCloseWizard
          activeYears={activeYears}
          allTerms={terms as { school_year: string; archived: boolean }[]}
          canForceArchive={level > 100}
        />
      </div>
    </div>
  )
}
