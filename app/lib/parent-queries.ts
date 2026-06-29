'use server'

import { createClient } from '@/utils/supabase/server'

export type LinkedCadetRow = {
  cadet_id: string
  first_name: string
  last_name: string
  company_name: string | null
  room_number: string | null
  grade_level: string | null
  conduct_status: string | null
  archived: boolean
  link_id: string
}

export type PortalInviteRow = {
  id: string
  recipient_email: string
  recipient_phone: string | null
  expires_at: string
  revoked_at: string | null
  redeemed_at: string | null
  redeemed_by_id: string | null
  created_at: string
  can_edit: boolean
}

export type CadetParentLinkRow = {
  id: string
  parent_profile_id: string
  parent_name: string
  parent_email: string | null
  status: string
  created_at: string
}

export type TravelRequestRow = {
  id: string
  trip_type: string
  departure_at: string
  return_at: string
  destination: string
  notes: string | null
  status: string
  created_at: string
  parent_profile_id: string
}

export type PendingMoveInForm = {
  form_id: string
  room_number: string
  cadet_id: string
  cadet_name: string
  submission_status: string
}

export async function getLinkedCadetsForParent(): Promise<LinkedCadetRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('list_linked_cadets_for_parent')
  if (error) throw new Error(error.message)
  return (data ?? []) as LinkedCadetRow[]
}

export async function assertParentLinkedToCadet(cadetId: string): Promise<boolean> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('parent_can_view_cadet', { p_cadet_id: cadetId })
  if (error) throw new Error(error.message)
  if (!data) return false
  return true
}

export async function listPortalInvitesForCadet(cadetId: string): Promise<PortalInviteRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('list_portal_invites_for_cadet', { p_cadet_id: cadetId })
  if (error) throw new Error(error.message)
  return (data ?? []) as PortalInviteRow[]
}

export async function listCadetParentLinksForCadet(cadetId: string): Promise<CadetParentLinkRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('list_cadet_parent_links_for_cadet', { p_cadet_id: cadetId })
  if (error) throw new Error(error.message)
  return (data ?? []) as CadetParentLinkRow[]
}

export async function listTravelRequestsForCadet(cadetId: string): Promise<TravelRequestRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('list_parent_travel_requests_for_cadet', {
    p_cadet_id: cadetId,
  })
  if (error) throw new Error(error.message)
  return (data ?? []) as TravelRequestRow[]
}

export async function getParentPendingMoveInForms(): Promise<PendingMoveInForm[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_parent_pending_move_in_forms')
  if (error) throw new Error(error.message)
  return (data ?? []) as PendingMoveInForm[]
}

export async function getMissingLegalAcceptances(): Promise<{ doc_key: string; version: string }[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('user_missing_required_legal_acceptances')
  if (error) throw new Error(error.message)
  return (data ?? []) as { doc_key: string; version: string }[]
}
