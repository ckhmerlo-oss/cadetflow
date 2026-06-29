import { notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getMoveInInvitePublic } from '@/app/invite/actions'
import MoveInInviteClient from './MoveInInviteClient'

export default async function MoveInInvitePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const invite = await getMoveInInvitePublic(token)
  if (!invite) notFound()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <MoveInInviteClient
      token={token}
      invite={invite}
      isLoggedIn={Boolean(user)}
      userEmail={user?.email ?? null}
    />
  )
}
