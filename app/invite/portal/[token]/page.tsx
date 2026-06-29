import { notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getPortalInvitePublic } from '@/app/invite/actions'
import PortalInviteClient from './PortalInviteClient'

export default async function PortalInvitePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const invite = await getPortalInvitePublic(token)
  if (!invite) notFound()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <PortalInviteClient
      token={token}
      invite={invite}
      isLoggedIn={Boolean(user)}
      userEmail={user?.email ?? null}
    />
  )
}
