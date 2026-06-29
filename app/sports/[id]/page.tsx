import { createClient } from '@/utils/supabase/server'
import { getSportDetail } from '../actions'
import { notFound } from 'next/navigation'
import SportClient from './SportClient'

export default async function SportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  const detail = await getSportDetail(id)
  
  if (!detail) return notFound()

  // Check if current user is a coach
  const isCoach = detail.coaches.some(c => c.user_id === user?.id)
  
  // Check if user is Faculty (Level 50+) to allow claiming
  const { data: profile } = await supabase.from('profiles').select('role:roles(default_role_level)').eq('id', user?.id).single()
  const isFaculty = (profile?.role as any)?.default_role_level >= 50

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <SportClient 
            sport={detail} 
            currentUserId={user?.id || ''}
            permissions={{ isCoach, isFaculty }}
        />
    </div>
  )
}