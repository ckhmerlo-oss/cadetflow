import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getMyOversightCadets } from './actions'
import OversightClient from './OversightClient'

export default async function OversightPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role:role_id(default_role_level)')
    .eq('id', user.id)
    .single()

  const roleLevel = (profile?.role as { default_role_level?: number } | null)?.default_role_level ?? 0
  if (roleLevel < 50) redirect('/')

  const cadets = await getMyOversightCadets()

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-primary mb-2">My Cadets</h1>
      <p className="text-muted-foreground mb-8">
        Cadets you oversee as teacher, coach, TAC, seminar instructor, or voluntary faculty assignee.
      </p>
      <OversightClient cadets={cadets} />
    </div>
  )
}
