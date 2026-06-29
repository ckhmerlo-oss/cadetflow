import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ProbationClient from './ProbationClient'
import { getProbationList, getAllCadetsForSelection } from './actions'
import Link from 'next/link'

export default async function ProbationPage() {
  const supabase = await createClient()

  // 1. Auth Check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  // 2. Permission Check
  // View: Faculty & Officers (Level 30+)
  // Edit: TAC Officers+ (Level 65+)
  const { data: profile } = await supabase
    .from('profiles')
    .select('role:role_id(default_role_level)')
    .eq('archived', false)
    .eq('id', user.id)
    .single()

  const roleLevel = (profile?.role as any)?.default_role_level || 0
  
  if (roleLevel < 30) {
      return (
          <div className="max-w-4xl mx-auto p-8 text-center">
              <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
              <p className="text-muted-foreground mt-2">You must be a Faculty member or Officer to view the probation list.</p>
              <Link href="/" className="text-primary hover:underline mt-4 block">Return Home</Link>
          </div>
      )
  }

  const canEdit = roleLevel >= 65;

  // 3. Fetch Data
  const probationList = await getProbationList()
  
  // Only fetch full cadet list if user can add people
  const cadetOptions = canEdit ? await getAllCadetsForSelection() : []

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground no-print">
          <Link href="/manage" className="hover:text-primary transition-colors">Manage</Link>
          <span>/</span>
          <span className="font-medium text-foreground">Probation Management</span>
      </div>

      <div className="flex justify-between items-end mb-6 no-print">
        <div>
            <h1 className="text-3xl font-bold text-primary">Probation Management</h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage disciplinary and academic probation statuses.</p>
        </div>
      </div>

      <ProbationClient 
        initialData={probationList} 
        cadetOptions={cadetOptions} 
        canEdit={canEdit} 
      />
    </div>
  )
}