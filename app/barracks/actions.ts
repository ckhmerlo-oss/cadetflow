'use server'

import { formatRpcError, logRpcFailure } from '@/app/lib/rpcDiagnostics'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import type { InspectionStatus } from './constants'
import type { HallwayBuildingData, HallwayFloorData, HallwayRoom, OccupantTag } from './lib/hallway-layout'
import { computeRosterStats } from './lib/hallway-layout'
import {
  collectSportCodesFromProfiles,
  mergeCadetTags,
  type CadetTagProfile,
  type ManualMark,
  type SportCodeMap,
} from './lib/roster-tags'

export type BarracksViewerPersona = {
  userId: string
  roleLevel: number
  companyId: string | null
  isTac: boolean
  isMaintenance: boolean
  isAdmin: boolean
  canManage: boolean
  bunkOnlyView: boolean
}

export type RoomDetailData = {
  room: {
    id: string
    room_number: string
    canonical_room_number: string
    room_display_name: string | null
    company_letter: string
    floor: number
    room_index: number
    company_id: string | null
    company_name: string | null
    room_purpose: string | null
    latest_move_in_form_id: string | null
    latest_move_out_form_id: string | null
    occupant_top: {
      id: string
      first_name: string
      last_name: string
      cadet_rank: string
      archived: boolean
    } | null
    occupant_bottom: {
      id: string
      first_name: string
      last_name: string
      cadet_rank: string
      archived: boolean
    } | null
  }
  move_in_forms: Array<{
    id: string
    cadet_id: string
    cadet_name: string
    submission_status?: 'draft' | 'submitted' | 'validated'
    completed_at: string | null
    validated_by_id: string | null
    validated_by_name?: string | null
    filled_by_id?: string
    filled_by_name?: string | null
    created_at: string
    invite_id?: string | null
    sent_at?: string | null
    sent_by_id?: string | null
    sent_by_name?: string | null
    recipient_email?: string | null
    invite_revoked_at?: string | null
    invite_redeemed_at?: string | null
    invite_expires_at?: string | null
    invite_can_edit?: boolean
    locked_bunk?: 'top' | 'bottom' | null
    locked_desk_side?: 'left' | 'right' | null
  }>
  move_out_forms: Array<{
    id: string
    cadet_id: string
    cadet_name: string
    completed_at: string | null
    created_at: string
  }>
  work_orders: Array<{
    id: string
    status: string
    priority: string
    description: string
    issue_presets: string[]
    created_at: string
    source_inspection_item_id: string | null
    source_inspection_form_id: string | null
  }>
}

export type InspectionTemplate = {
  id: string
  item_key: string
  label: string
  sort_order: number
  section_key?: string | null
  section_label?: string | null
  subsection?: 'left' | 'right' | 'top' | 'bottom' | null
}

export type InspectionFormData = {
  form: {
    id: string
    form_type: 'move_in' | 'move_out'
    barracks_room_id: string
    room_number: string
    cadet_id: string
    filled_by_id: string
    validated_by_id?: string | null
    completed_at: string | null
    notes: string | null
    created_at: string
    submission_status?: 'draft' | 'submitted' | 'validated'
    locked_bunk?: 'top' | 'bottom' | null
    locked_desk_side?: 'left' | 'right' | null
    invite_id?: string | null
    cadet_name?: string
    filled_by_name?: string | null
    validated_by_name?: string | null
    sent_at?: string | null
    sent_by_id?: string | null
    sent_by_name?: string | null
    recipient_email?: string | null
    invite_revoked_at?: string | null
    invite_redeemed_at?: string | null
    invite_expires_at?: string | null
    invite_can_edit?: boolean
  }
  items: Array<{
    id: string
    item_key: string
    item_label: string
    sort_order: number
    status: InspectionStatus
    notes: string | null
  }>
}

async function getViewerContext() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id, role:roles!inner(default_role_level, role_name, can_manage_own_company_roster, can_manage_all_rosters)')
    .eq('id', user.id)
    .single()

  const role = profile?.role as {
    default_role_level?: number
    role_name?: string
    can_manage_own_company_roster?: boolean
    can_manage_all_rosters?: boolean
  } | null

  const roleLevel = role?.default_role_level ?? 0
  const isMaintenance = (role?.role_name ?? '').toLowerCase().includes('maintenance')

  return {
    supabase,
    userId: user.id,
    companyId: profile?.company_id as string | null,
    roleLevel,
    isMaintenance,
    isTac: roleLevel >= 65,
    isAdmin: roleLevel >= 90 || Boolean(role?.can_manage_all_rosters),
    canManage: roleLevel >= 65 && Boolean(role?.can_manage_own_company_roster || role?.can_manage_all_rosters),
  }
}

export async function getBarracksViewerPersona(): Promise<BarracksViewerPersona | null> {
  const ctx = await getViewerContext()
  if (!ctx) return null
  return {
    userId: ctx.userId,
    roleLevel: ctx.roleLevel,
    companyId: ctx.companyId,
    isTac: ctx.isTac,
    isMaintenance: ctx.isMaintenance,
    isAdmin: ctx.isAdmin,
    canManage: ctx.canManage || ctx.isAdmin,
    bunkOnlyView: ctx.isMaintenance && !ctx.isAdmin,
  }
}

export async function getHallwayFloor(companyLetter: string, floor: number): Promise<HallwayFloorData | null> {
  const ctx = await getViewerContext()
  if (!ctx) return null

  const { data, error } = await ctx.supabase.rpc('get_hallway_floor', {
    p_company_letter: companyLetter,
    p_floor: floor,
  })

  if (error) {
    logRpcFailure('get_hallway_floor', error, { companyLetter, floor })
    return null
  }

  const payload = data as HallwayFloorData
  return {
    ...payload,
    company_id: payload.company_id ?? null,
    platoon_leader: payload.platoon_leader ?? null,
    platoon_sergeant: payload.platoon_sergeant ?? null,
  }
}

async function fetchSportCodeMap(): Promise<SportCodeMap> {
  const ctx = await getViewerContext()
  if (!ctx) return {}

  const { data, error } = await ctx.supabase
    .from('sports')
    .select('name, short_code')
    .eq('is_active', true)
    .not('short_code', 'is', null)

  if (error) {
    console.error('fetchSportCodeMap:', error.message)
    return {}
  }

  const map: SportCodeMap = {}
  for (const row of data ?? []) {
    if (row.short_code) map[row.name as string] = row.short_code as string
  }
  return map
}

async function fetchManualMarks(companyLetter: string): Promise<ManualMark[]> {
  const ctx = await getViewerContext()
  if (!ctx) return []

  const { data, error } = await ctx.supabase.rpc('list_barracks_roster_marks', {
    p_company_letter: companyLetter,
  })

  if (error) {
    console.error('fetchManualMarks:', error.message)
    return []
  }

  return (data ?? []) as ManualMark[]
}

async function fetchCompanyRosterMeta(companyLetter: string): Promise<CadetTagProfile[]> {
  const ctx = await getViewerContext()
  if (!ctx) return []

  const { data: roomRow } = await ctx.supabase
    .from('barracks_rooms')
    .select('company_id')
    .eq('company_letter', companyLetter)
    .limit(1)
    .maybeSingle()

  const companyId = roomRow?.company_id as string | undefined
  if (!companyId) return []

  const { data, error } = await ctx.supabase
    .from('profiles')
    .select(`
      id,
      role:roles!inner(default_role_level),
      cadet_profiles!inner (
        room_number,
        sport_fall,
        sport_winter,
        sport_spring,
        is_in_band,
        extracurriculars,
        probation_status
      )
    `)
    .eq('company_id', companyId)
    .eq('archived', false)
    .lt('role.default_role_level', 50)

  if (error) {
    console.error('fetchCompanyRosterMeta:', error.message)
    return []
  }

  return (data ?? []).map((row: Record<string, unknown>) => {
    const cp = Array.isArray(row.cadet_profiles) ? row.cadet_profiles[0] : row.cadet_profiles
    const profile = cp as {
      sport_fall?: string | null
      sport_winter?: string | null
      sport_spring?: string | null
      is_in_band?: boolean
      extracurriculars?: string[] | null
      probation_status?: string | null
    } | null

    return {
      id: row.id as string,
      sport_fall: profile?.sport_fall ?? null,
      sport_winter: profile?.sport_winter ?? null,
      sport_spring: profile?.sport_spring ?? null,
      is_in_band: Boolean(profile?.is_in_band),
      extracurriculars: Array.isArray(profile?.extracurriculars) ? profile.extracurriculars : [],
      probation_status: profile?.probation_status ?? null,
    }
  })
}

function attachTagsToRoom(
  room: HallwayRoom,
  profileMap: Map<string, CadetTagProfile>,
  manualMarks: ManualMark[],
  sportCodeMap: SportCodeMap
): HallwayRoom {
  const tagFor = (occupant: HallwayRoom['occupant_top']): OccupantTag[] | undefined => {
    if (!occupant) return undefined
    const tags = mergeCadetTags(occupant.id, profileMap.get(occupant.id), manualMarks, sportCodeMap)
    if (occupant.pending_move_in && !tags.some((tag) => tag.code === 'MOV')) {
      tags.push({ code: 'MOV', source: 'auto' })
      tags.sort((a, b) => a.code.localeCompare(b.code))
    }
    return tags
  }

  return {
    ...room,
    occupant_top: room.occupant_top
      ? { ...room.occupant_top, tags: tagFor(room.occupant_top) }
      : null,
    occupant_bottom: room.occupant_bottom
      ? { ...room.occupant_bottom, tags: tagFor(room.occupant_bottom) }
      : null,
  }
}

function attachTagsToFloors(
  floors: HallwayBuildingData['floors'],
  rosterMeta: CadetTagProfile[],
  manualMarks: ManualMark[],
  sportCodeMap: SportCodeMap
): HallwayBuildingData['floors'] {
  const profileMap = new Map(rosterMeta.map((p) => [p.id, p]))

  const mapFloor = (floor: HallwayFloorData): HallwayFloorData => ({
    ...floor,
    rooms: floor.rooms.map((room) => attachTagsToRoom(room, profileMap, manualMarks, sportCodeMap)),
  })

  return {
    1: mapFloor(floors[1]),
    2: mapFloor(floors[2]),
    3: mapFloor(floors[3]),
  }
}

export type HallwayBuildingResult = HallwayBuildingData & {
  sport_codes: string[]
}

export async function getHallwayBuilding(companyLetter: string): Promise<HallwayBuildingResult | null> {
  const [f1, f2, f3, rosterMeta, manualMarks, sportCodeMap] = await Promise.all([
    getHallwayFloor(companyLetter, 1),
    getHallwayFloor(companyLetter, 2),
    getHallwayFloor(companyLetter, 3),
    fetchCompanyRosterMeta(companyLetter),
    fetchManualMarks(companyLetter),
    fetchSportCodeMap(),
  ])

  if (!f1 || !f2 || !f3) return null

  const rawFloors = { 1: f1, 2: f2, 3: f3 } as HallwayBuildingData['floors']
  const floors = attachTagsToFloors(rawFloors, rosterMeta, manualMarks, sportCodeMap)

  const statsMeta = rosterMeta.map((p) => {
    const hasSport = ['sport_fall', 'sport_winter', 'sport_spring'].some((k) => {
      const v = p[k as keyof CadetTagProfile]
      return typeof v === 'string' && v.trim() !== '' && v !== 'None'
    })
    return {
      id: p.id,
      in_barracks: true,
      sports: hasSport,
      band: p.is_in_band,
    }
  })

  return {
    company_letter: f1.company_letter,
    company_name: f1.company_name,
    floors,
    company_commander: f1.company_commander,
    first_sergeant: f1.first_sergeant,
    stats: computeRosterStats(floors, statsMeta),
    sport_codes: collectSportCodesFromProfiles(rosterMeta, sportCodeMap),
  }
}

export async function getBarracksRoomDetail(roomId: string): Promise<RoomDetailData | null> {
  const ctx = await getViewerContext()
  if (!ctx) return null

  const { data, error } = await ctx.supabase.rpc('get_barracks_room_detail', {
    p_room_id: roomId,
  })

  if (error) {
    logRpcFailure('get_barracks_room_detail', error, { roomId })
    return null
  }

  return data as RoomDetailData
}

export async function assignBarracksBunk(roomId: string, bunk: 'top' | 'bottom', cadetId: string) {
  const ctx = await getViewerContext()
  if (!ctx) return { error: 'Unauthorized' }

  const { error } = await ctx.supabase.rpc('assign_barracks_bunk', {
    p_room_id: roomId,
    p_bunk: bunk,
    p_cadet_id: cadetId,
  })

  if (error) return { error: formatRpcError('assign_barracks_bunk', error) }

  revalidatePath('/barracks/hallway')
  revalidatePath(`/barracks/rooms/${roomId}`)
  revalidatePath('/manage')
  return { success: true }
}

export async function clearBarracksBunk(roomId: string, bunk: 'top' | 'bottom') {
  const ctx = await getViewerContext()
  if (!ctx) return { error: 'Unauthorized' }

  const { error } = await ctx.supabase.rpc('clear_barracks_bunk', {
    p_room_id: roomId,
    p_bunk: bunk,
  })

  if (error) return { error: error.message }

  revalidatePath('/barracks/hallway')
  revalidatePath(`/barracks/rooms/${roomId}`)
  revalidatePath('/manage')
  return { success: true }
}

export async function setBarracksRoomPurpose(roomId: string, purpose: string | null) {
  const ctx = await getViewerContext()
  if (!ctx) return { error: 'Unauthorized' }

  const { error } = await ctx.supabase.rpc('set_barracks_room_purpose', {
    p_room_id: roomId,
    p_purpose: purpose ?? '',
  })

  if (error) return { error: formatRpcError('set_barracks_room_purpose', error) }

  revalidatePath('/barracks/hallway')
  revalidatePath(`/barracks/rooms/${roomId}`)
  revalidatePath('/manage')
  return { success: true }
}

export async function setBarracksRoomDisplayName(roomId: string, displayName: string) {
  const ctx = await getViewerContext()
  if (!ctx) return { error: 'Unauthorized' }

  const { error } = await ctx.supabase.rpc('set_barracks_room_display_name', {
    p_room_id: roomId,
    p_display_name: displayName,
  })

  if (error) return { error: formatRpcError('set_barracks_room_display_name', error) }

  revalidatePath('/barracks/hallway')
  revalidatePath(`/barracks/rooms/${roomId}`)
  revalidatePath('/manage')
  return { success: true }
}

export async function resetBarracksRoom(roomId: string) {
  const ctx = await getViewerContext()
  if (!ctx) return { error: 'Unauthorized' }

  const { error } = await ctx.supabase.rpc('reset_barracks_room', { p_room_id: roomId })

  if (error) return { error: formatRpcError('reset_barracks_room', error) }

  revalidatePath('/barracks/hallway')
  revalidatePath(`/barracks/rooms/${roomId}`)
  revalidatePath('/manage')
  return { success: true }
}

export type CompanyCadetOption = {
  id: string
  label: string
  first_name: string
  last_name: string
  cadet_rank: string
}

export async function searchCompanyCadets(query: string, companyId?: string | null): Promise<CompanyCadetOption[]> {
  const ctx = await getViewerContext()
  if (!ctx) return []

  let q = ctx.supabase
    .from('profiles')
    .select(`
      id, first_name, last_name, company_id,
      role:roles!inner(default_role_level),
      cadet_profiles!inner (cadet_rank)
    `)
    .eq('archived', false)
    .lt('role.default_role_level', 50)

  if (companyId) {
    q = q.eq('company_id', companyId)
  }

  if (query.trim()) {
    q = q.or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
  }

  const { data, error } = await q.order('last_name').limit(50)
  if (error) return []

  return (data ?? []).map((p: Record<string, unknown>) => {
    const details = Array.isArray(p.cadet_profiles) ? p.cadet_profiles[0] : p.cadet_profiles
    const rank = ((details as { cadet_rank?: string } | null)?.cadet_rank ?? '').trim()
    const first = String(p.first_name ?? '').trim()
    const last = String(p.last_name ?? '').trim()
    const name = `${last}, ${first}`.trim()
    const label = rank ? `${rank} ${name}` : name
    return {
      id: p.id as string,
      label,
      first_name: first,
      last_name: last,
      cadet_rank: rank,
    }
  })
}

export async function listInspectionTemplates(): Promise<InspectionTemplate[]> {
  const ctx = await getViewerContext()
  if (!ctx) return []

  const { data, error } = await ctx.supabase.rpc('list_room_inspection_templates')
  if (error) {
    console.error('listInspectionTemplates:', error.message)
    return []
  }

  return (data ?? []) as InspectionTemplate[]
}

export async function getInspectionForm(formId: string, formType: 'move_in' | 'move_out'): Promise<InspectionFormData | null> {
  const ctx = await getViewerContext()
  if (!ctx) return null

  const { data, error } = await ctx.supabase.rpc('get_room_inspection_form', {
    p_form_id: formId,
    p_form_type: formType,
  })

  if (error) {
    console.error('getInspectionForm:', error.message)
    return null
  }

  return data as InspectionFormData
}

export type InspectionComparisonRow = {
  item_key: string
  item_label: string
  move_in_status: string | null
  move_out_status: string | null
  changed: boolean
}

export async function compareInspectionForms(moveInFormId: string, moveOutFormId: string) {
  const ctx = await getViewerContext()
  if (!ctx) return { error: 'Unauthorized' as const }

  const { data, error } = await ctx.supabase.rpc('compare_room_inspection_forms', {
    p_move_in_form_id: moveInFormId,
    p_move_out_form_id: moveOutFormId,
  })

  if (error) {
    logRpcFailure('compare_room_inspection_forms', error, { moveInFormId, moveOutFormId })
    return { error: formatRpcError('compare_room_inspection_forms', error) }
  }

  return { rows: (data ?? []) as InspectionComparisonRow[] }
}

export async function saveInspectionForm(payload: {
  formType: 'move_in' | 'move_out'
  roomId: string
  cadetId: string
  formId?: string | null
  items: Array<{
    id?: string | null
    item_key: string
    item_label: string
    sort_order: number
    status: InspectionStatus
    notes?: string | null
  }>
  notes?: string | null
  validatedById?: string | null
  markComplete?: boolean
}) {
  const ctx = await getViewerContext()
  if (!ctx) return { error: 'Unauthorized' }

  const { data, error } = await ctx.supabase.rpc('save_room_inspection_form', {
    p_form_type: payload.formType,
    p_room_id: payload.roomId,
    p_cadet_id: payload.cadetId,
    p_form_id: payload.formId ?? null,
    p_items: payload.items,
    p_notes: payload.notes ?? null,
    p_validated_by_id: payload.validatedById ?? null,
    p_mark_complete: payload.markComplete ?? true,
  })

  if (error) return { error: formatRpcError('save_room_inspection_form', error) }

  revalidatePath('/barracks/hallway')
  revalidatePath(`/barracks/rooms/${payload.roomId}`)
  revalidatePath('/work-orders')
  return { success: true, formId: data as string }
}

export type InspectionAttachmentRecord = {
  id: string
  original_filename: string
  mime_type: string
  byte_size: number
  entity_type: string
  entity_id: string
  purpose: string
  created_at: string
}

/**
 * Day 12.2 stub — returns empty until `file_assets` exists.
 * Wire to `list_file_assets_for_entity` RPC when storage lands.
 */
export async function listInspectionFormAttachments(_payload: {
  formId: string
  formType: 'move_in' | 'move_out'
  itemKey?: string
}): Promise<InspectionAttachmentRecord[]> {
  return []
}

export type InspectionPhotoUploadPayload = {
  formId: string
  formType: 'move_in' | 'move_out'
  photos: Array<{
    clientId: string
    filename: string
    mimeType: string
    byteSize: number
    scope: 'form' | 'item'
    itemKey?: string
  }>
}

/**
 * Day 12.2 callback scaffold — persists nothing until storage RPCs deploy.
 * Set NEXT_PUBLIC_INSPECTION_PHOTO_UPLOAD=true and implement body after Day 12.2.
 */
export async function uploadPendingInspectionPhotos(
  payload: InspectionPhotoUploadPayload
): Promise<{ uploaded: number; deferred: number; message: string }> {
  const ctx = await getViewerContext()
  if (!ctx) return { uploaded: 0, deferred: payload.photos.length, message: 'Unauthorized' }

  if (process.env.NEXT_PUBLIC_INSPECTION_PHOTO_UPLOAD !== 'true') {
    return {
      uploaded: 0,
      deferred: payload.photos.length,
      message:
        'Photo storage is not enabled yet. Attachments are queued in the UI only until Day 12.2 deploys.',
    }
  }

  // Day 12.2: call request_file_upload + client upload + finalize_file_upload per photo.
  void payload
  return {
    uploaded: 0,
    deferred: payload.photos.length,
    message: 'Photo upload RPCs not implemented — complete Day 12.2 integration.',
  }
}

export async function listBarracksCompanies() {
  const ctx = await getViewerContext()
  if (!ctx) return []

  const { data } = await ctx.supabase
    .from('barracks_rooms')
    .select('company_letter, company_id, companies(company_name)')
    .order('company_letter')

  const seen = new Set<string>()
  const result: Array<{ letter: string; name: string }> = []

  for (const row of data ?? []) {
    const letter = row.company_letter as string
    if (seen.has(letter)) continue
    seen.add(letter)
    const company = Array.isArray(row.companies) ? row.companies[0] : row.companies
    result.push({
      letter,
      name: (company as { company_name?: string } | null)?.company_name ?? letter,
    })
  }

  return result
}

export async function applyRosterMarks(
  companyLetter: string,
  profileIds: string[],
  tagCodes: string[],
  note?: string | null
) {
  const ctx = await getViewerContext()
  if (!ctx?.canManage && !ctx?.isAdmin) return { error: 'Unauthorized' }

  const { error } = await ctx.supabase.rpc('apply_barracks_roster_marks', {
    p_company_letter: companyLetter,
    p_profile_ids: profileIds,
    p_tag_codes: tagCodes,
    p_note: note ?? null,
  })

  if (error) return { error: formatRpcError('apply_barracks_roster_marks', error) }

  revalidatePath('/barracks/hallway')
  revalidatePath('/barracks/hallway/print')
  return { success: true }
}

export async function removeRosterMarks(
  companyLetter: string,
  profileIds: string[],
  tagCodes?: string[] | null
) {
  const ctx = await getViewerContext()
  if (!ctx?.canManage && !ctx?.isAdmin) return { error: 'Unauthorized' }

  const { error } = await ctx.supabase.rpc('remove_barracks_roster_marks', {
    p_company_letter: companyLetter,
    p_profile_ids: profileIds,
    p_tag_codes: tagCodes ?? null,
  })

  if (error) return { error: error.message }

  revalidatePath('/barracks/hallway')
  revalidatePath('/barracks/hallway/print')
  return { success: true }
}

export async function clearRosterMarks(companyLetter: string, tagCode?: string | null) {
  const ctx = await getViewerContext()
  if (!ctx?.canManage && !ctx?.isAdmin) return { error: 'Unauthorized' }

  const { error } = await ctx.supabase.rpc('clear_barracks_roster_marks', {
    p_company_letter: companyLetter,
    p_tag_code: tagCode ?? null,
  })

  if (error) return { error: error.message }

  revalidatePath('/barracks/hallway')
  revalidatePath('/barracks/hallway/print')
  return { success: true }
}

export type MoveInInviteRow = {
  id: string
  cadet_id: string
  cadet_name: string
  recipient_email: string
  locked_bunk: 'top' | 'bottom'
  locked_desk_side: 'left' | 'right'
  move_in_form_id: string | null
  expires_at: string
  revoked_at: string | null
  redeemed_at: string | null
  created_at: string
  sent_by_id?: string | null
  sent_by_name?: string | null
  form_submission_status: string | null
  can_edit?: boolean
}

export async function listMoveInInvitesForRoom(roomId: string): Promise<MoveInInviteRow[]> {
  const ctx = await getViewerContext()
  if (!ctx?.canManage && !ctx?.isAdmin) return []

  const { data, error } = await ctx.supabase.rpc('list_move_in_invites_for_room', {
    p_room_id: roomId,
  })

  if (error) {
    if (error.message.includes('schema cache') || error.message.includes('Could not find the function')) {
      console.error(
        'listMoveInInvitesForRoom: migration 20260710000001 not applied. Run: supabase migration up'
      )
    } else {
      console.error('listMoveInInvitesForRoom:', error.message)
    }
    return []
  }

  return (data ?? []) as MoveInInviteRow[]
}

export async function getCadetParentContact(cadetId: string) {
  const ctx = await getViewerContext()
  if (!ctx) return null
  if (ctx.isMaintenance && ctx.roleLevel < 90 && !ctx.canManageAll) return null

  const { data, error } = await ctx.supabase
    .from('cadet_profiles')
    .select('parent_email, parent_phone, parent_name')
    .eq('profile_id', cadetId)
    .maybeSingle()

  if (error) return null
  return data as { parent_email: string | null; parent_phone: string | null; parent_name: string | null }
}

export async function createMoveInInvite(payload: {
  roomId: string
  cadetId: string
  recipientEmail: string
  lockedBunk: 'top' | 'bottom'
  lockedDeskSide: 'left' | 'right'
  expiresInDays?: number
  cadetName: string
  roomNumber: string
}) {
  const ctx = await getViewerContext()
  if (!ctx?.canManage && !ctx?.isAdmin) return { error: 'Unauthorized' }

  const { data, error } = await ctx.supabase.rpc('create_move_in_invite', {
    p_room_id: payload.roomId,
    p_cadet_id: payload.cadetId,
    p_recipient_email: payload.recipientEmail,
    p_locked_bunk: payload.lockedBunk,
    p_locked_desk_side: payload.lockedDeskSide,
    p_expires_in_days: payload.expiresInDays ?? 14,
  })

  if (error) return { error: error.message }

  const result = data as {
    invite_id: string
    form_id: string
    token: string
    recipient_email: string
    expires_at: string
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
  const inviteLink = `${siteUrl}/invite/move-in/${result.token}`

  const { sendEmailDirect } = await import('@/app/lib/email/emailDirect.server')
  const { moveInInviteEmail } = await import('@/app/lib/emailTemplates')
  const { createClient: createAdminClient } = await import('@supabase/supabase-js')

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const emailResult = await sendEmailDirect(admin, {
    type: 'alert',
    recipients: [result.recipient_email],
    subject: `Move-in form for ${payload.cadetName} — room ${payload.roomNumber}`,
    htmlContent: moveInInviteEmail({
      cadetName: payload.cadetName,
      roomNumber: payload.roomNumber,
      inviteLink,
    }),
    idempotencyKey: `parent.move_in.invite:${result.invite_id}`,
    intendedRecipient: {
      email: result.recipient_email,
      profileName: payload.cadetName,
    },
  })

  if (!emailResult.success) {
    console.error('createMoveInInvite email:', emailResult.error)
  }

  revalidatePath(`/barracks/rooms/${payload.roomId}`)
  return {
    success: true,
    inviteId: result.invite_id,
    formId: result.form_id,
    token: result.token,
    inviteLink,
    emailSent: emailResult.success,
  }
}

export async function revokeMoveInInvite(inviteId: string, roomId: string) {
  const ctx = await getViewerContext()
  if (!ctx?.canManage && !ctx?.isAdmin) return { error: 'Unauthorized' }

  const { error } = await ctx.supabase.rpc('revoke_parent_invite', {
    p_invite_id: inviteId,
  })

  if (error) return { error: error.message }

  revalidatePath(`/barracks/rooms/${roomId}`)
  revalidatePath('/barracks/forms')
  return { success: true }
}

export async function updateMoveInInviteEmail(
  inviteId: string,
  recipientEmail: string,
  options?: {
    roomId?: string
    cadetName?: string
    roomNumber?: string
    resend?: boolean
  }
) {
  const ctx = await getViewerContext()
  if (!ctx?.canManage && !ctx?.isAdmin) return { error: 'Unauthorized' }

  const { data, error } = await ctx.supabase.rpc('update_move_in_invite_email', {
    p_invite_id: inviteId,
    p_recipient_email: recipientEmail,
  })

  if (error) return { error: error.message }

  let emailSent = false
  if (options?.resend && options.roomId && options.cadetName && options.roomNumber) {
    const resend = await resendMoveInInvite({
      inviteId,
      roomId: options.roomId,
      cadetName: options.cadetName,
      roomNumber: options.roomNumber,
    })
    emailSent = Boolean(resend.emailSent)
    if (resend.error) return { error: resend.error, success: true, emailSent: false }
  }

  if (options?.roomId) {
    revalidatePath(`/barracks/rooms/${options.roomId}`)
  }
  revalidatePath('/barracks/forms')

  return { success: true, emailSent, formId: (data as { form_id?: string })?.form_id }
}

export async function resendMoveInInvite(payload: {
  inviteId: string
  roomId: string
  cadetName: string
  roomNumber: string
}) {
  const ctx = await getViewerContext()
  if (!ctx?.canManage && !ctx?.isAdmin) return { error: 'Unauthorized' }

  const { data, error } = await ctx.supabase.rpc('refresh_move_in_invite_token', {
    p_invite_id: payload.inviteId,
  })

  if (error) return { error: error.message }

  const result = data as {
    invite_id: string
    token: string
    recipient_email: string
    expires_at: string
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
  const inviteLink = `${siteUrl}/invite/move-in/${result.token}`

  const { sendEmailDirect } = await import('@/app/lib/email/emailDirect.server')
  const { moveInInviteEmail } = await import('@/app/lib/emailTemplates')
  const { createClient: createAdminClient } = await import('@supabase/supabase-js')

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const emailResult = await sendEmailDirect(admin, {
    type: 'alert',
    recipients: [result.recipient_email],
    subject: `Move-in form for ${payload.cadetName} — room ${payload.roomNumber}`,
    htmlContent: moveInInviteEmail({
      cadetName: payload.cadetName,
      roomNumber: payload.roomNumber,
      inviteLink,
    }),
    idempotencyKey: `parent.move_in.resend:${result.invite_id}:${Date.now()}`,
    intendedRecipient: {
      email: result.recipient_email,
      profileName: payload.cadetName,
    },
  })

  revalidatePath(`/barracks/rooms/${payload.roomId}`)
  return {
    success: true,
    inviteLink,
    emailSent: emailResult.success,
  }
}

export async function saveMoveInFormExternal(payload: {
  formId: string
  items: Array<{
    id?: string | null
    item_key: string
    item_label: string
    sort_order: number
    status: InspectionStatus
    notes?: string | null
  }>
  notes?: string | null
  markSubmit?: boolean
}) {
  const ctx = await getViewerContext()
  if (!ctx) return { error: 'Unauthorized' }

  const { data, error } = await ctx.supabase.rpc('save_move_in_form_external', {
    p_form_id: payload.formId,
    p_items: payload.items,
    p_notes: payload.notes ?? null,
    p_mark_submit: payload.markSubmit ?? false,
  })

  if (error) return { error: error.message }

  const { data: formRow } = await ctx.supabase
    .from('room_move_in_forms')
    .select('barracks_room_id')
    .eq('id', payload.formId)
    .single()

  if (formRow?.barracks_room_id) {
    revalidatePath(`/barracks/rooms/${formRow.barracks_room_id}`)
  }
  revalidatePath(`/move-in/forms/${payload.formId}`)

  return { success: true, formId: data as string }
}

export async function validateMoveInForm(formId: string, roomId: string) {
  const ctx = await getViewerContext()
  if (!ctx?.canManage && !ctx?.isAdmin) return { error: 'Unauthorized' }

  const { data, error } = await ctx.supabase.rpc('validate_move_in_form', {
    p_form_id: formId,
  })

  if (error) return { error: error.message }

  revalidatePath(`/barracks/rooms/${roomId}`)
  revalidatePath(`/barracks/forms/${formId}`)
  revalidatePath('/work-orders')
  return { success: true, formId: data as string }
}
