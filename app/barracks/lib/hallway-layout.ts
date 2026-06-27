import { getHallwayLayoutConfig, roomPurposeShortLabel } from '../constants'

export type OccupantTag = {
  code: string
  source: 'manual' | 'auto'
  note?: string | null
}

export type HallwayOccupant = {
  id: string
  first_name: string
  last_name: string
  cadet_rank: string
  pending_move_in?: boolean
  tags?: OccupantTag[]
} | null

export type HallwayRoom = {
  id: string
  room_number: string
  room_display_name?: string | null
  room_index: number
  floor: number
  company_letter: string
  room_purpose?: string | null
  occupant_top: HallwayOccupant
  occupant_bottom: HallwayOccupant
  open_work_orders: number
  latest_move_in_form_id: string | null
  latest_move_out_form_id: string | null
}

export type HallwayLeader = {
  id: string
  first_name: string
  last_name: string
  cadet_rank: string
} | null

export type HallwayFloorData = {
  company_letter: string
  company_name: string | null
  company_id: string | null
  floor: number
  rooms: HallwayRoom[]
  company_commander: HallwayLeader
  first_sergeant: HallwayLeader
  platoon_leader: HallwayLeader
  platoon_sergeant: HallwayLeader
}

export type HallwayBuildingData = {
  company_letter: string
  company_name: string | null
  floors: Record<1 | 2 | 3, HallwayFloorData>
  company_commander: HallwayLeader
  first_sergeant: HallwayLeader
  stats: RosterStats
}

export type RosterStats = {
  roster_total: number
  in_barracks: number
  off_campus: number
  sports: number
  band: number
  vacant_bunks: number
  by_floor: Record<1 | 2 | 3, { assigned: number; vacant_bunks: number }>
}

export function shortRoomNumber(roomNumber: string): string {
  return roomNumber.replace(/^[A-Z]/, '')
}

/** Short numeric label for the room number column (e.g. 105, 100). */
export function formatRoomNumberColumn(room: Pick<HallwayRoom, 'room_number'>): string {
  return shortRoomNumber(room.room_number)
}

/** Hallway / print label for the room number column on cadet rooms. */
export function formatRoomHallwayLabel(room: Pick<HallwayRoom, 'room_number' | 'room_display_name' | 'room_purpose'>): string {
  if (room.room_purpose) return formatRoomNumberColumn(room)
  const custom = room.room_display_name?.trim()
  if (custom) return custom
  return shortRoomNumber(room.room_number)
}

/** Split a non-cadet room label across top/bottom bunk slots (TAC office style). */
export function splitPurposeRoomLabels(
  room: Pick<HallwayRoom, 'room_display_name' | 'room_purpose'>
): { top: string; bottom: string } | null {
  if (!room.room_purpose) return null
  const label = room.room_display_name?.trim() || roomPurposeShortLabel(room.room_purpose) || 'Non-cadet'
  const parts = label.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    const mid = Math.ceil(parts.length / 2)
    return {
      top: parts.slice(0, mid).join(' '),
      bottom: parts.slice(mid).join(' '),
    }
  }
  return { top: label, bottom: '' }
}

export function isTacOfficeRoom(room: Pick<HallwayRoom, 'floor' | 'room_number'>): boolean {
  return room.floor === 1 && /^[A-E]100$/.test(room.room_number)
}

/** Room detail page title label. */
export function formatRoomTitleLabel(room: {
  room_number: string
  room_display_name?: string | null
}): string {
  const custom = room.room_display_name?.trim()
  if (custom) return custom
  return room.room_number
}

export function computeRosterStats(
  floors: Record<1 | 2 | 3, HallwayFloorData>,
  rosterMeta?: Array<{
    id: string
    in_barracks: boolean
    sports: boolean
    band: boolean
  }>
): RosterStats {
  const by_floor = { 1: { assigned: 0, vacant_bunks: 0 }, 2: { assigned: 0, vacant_bunks: 0 }, 3: { assigned: 0, vacant_bunks: 0 } } as RosterStats['by_floor']
  let vacant_bunks = 0
  const assignedIds = new Set<string>()

  for (const floor of [1, 2, 3] as const) {
    for (const room of floors[floor].rooms) {
      if (room.room_purpose) continue
      if (room.occupant_top) {
        by_floor[floor].assigned += 1
        assignedIds.add(room.occupant_top.id)
      } else {
        by_floor[floor].vacant_bunks += 1
        vacant_bunks += 1
      }
      if (room.occupant_bottom) {
        by_floor[floor].assigned += 1
        assignedIds.add(room.occupant_bottom.id)
      } else {
        by_floor[floor].vacant_bunks += 1
        vacant_bunks += 1
      }
    }
  }

  const roster_total = rosterMeta?.length ?? assignedIds.size
  const sports = rosterMeta?.filter((c) => c.sports).length ?? 0
  const band = rosterMeta?.filter((c) => c.band).length ?? 0
  const off_campus = rosterMeta
    ? rosterMeta.filter((c) => !assignedIds.has(c.id)).length
    : 0

  return {
    roster_total,
    in_barracks: assignedIds.size,
    off_campus,
    sports,
    band,
    vacant_bunks,
    by_floor,
  }
}


export function formatLeaderLine(leader: HallwayLeader): string {
  if (!leader) return 'Vacant'
  const rank = leader.cadet_rank?.trim()
  const name = `${leader.first_name} ${leader.last_name}`.trim()
  return rank ? `${rank} ${name}` : name || 'Vacant'
}

export function formatOccupantName(occupant: HallwayOccupant): string {
  if (!occupant) return 'Vacant'
  const rank = occupant.cadet_rank?.trim()
  const name = `${occupant.first_name} ${occupant.last_name}`.trim()
  return rank ? `${rank} ${name}` : name
}

export function formatRosterPrintName(occupant: HallwayOccupant): string {
  if (!occupant) return 'Vacant'
  const last = occupant.last_name?.trim() || ''
  const initial = occupant.first_name?.trim()?.[0]?.toUpperCase() ?? ''
  if (!last) return 'Vacant'
  return initial ? `${last}, ${initial}.` : last
}

export function formatOccupantTagCodes(occupant: HallwayOccupant): string {
  if (!occupant?.tags?.length) return ''
  const codes = [...new Set(occupant.tags.map((t) => t.code))]
  return codes.join(' ')
}

export function primaryManualTagCode(occupant: HallwayOccupant): string | null {
  if (!occupant?.tags?.length) return null
  const manual = occupant.tags.filter((t) => t.source === 'manual')
  return manual[0]?.code ?? null
}

export function autoTagCodes(occupant: HallwayOccupant): string[] {
  if (!occupant?.tags?.length) return []
  return occupant.tags.filter((t) => t.source === 'auto').map((t) => t.code)
}

export function bunkSelectionKey(profileId: string, bunk: 'top' | 'bottom'): string {
  return `${profileId}:${bunk}`
}

/** Bank split and sort order depend on company hallway geometry. */
export function splitHallwayBanks(rooms: HallwayRoom[], companyLetter: string) {
  const { oddsOnLeft } = getHallwayLayoutConfig(companyLetter)

  const left = rooms
    .filter((r) => (oddsOnLeft ? r.room_index % 2 === 1 : r.room_index % 2 === 0))
    .sort((a, b) => a.room_index - b.room_index)

  const right = rooms
    .filter((r) => (oddsOnLeft ? r.room_index % 2 === 0 : r.room_index % 2 === 1))
    .sort((a, b) => a.room_index - b.room_index)

  const maxRows = Math.max(left.length, right.length)
  return { left, right, maxRows }
}

export function roomOccupancyStatus(room: HallwayRoom): 'vacant' | 'partial' | 'full' | 'purpose' {
  if (room.room_purpose) return 'purpose'
  const top = room.occupant_top != null
  const bottom = room.occupant_bottom != null
  if (top && bottom) return 'full'
  if (top || bottom) return 'partial'
  return 'vacant'
}

export function roomStatusClass(status: ReturnType<typeof roomOccupancyStatus>): string {
  switch (status) {
    case 'full':
      return 'border-green-500/40 bg-green-500/5'
    case 'partial':
      return 'border-amber-500/40 bg-amber-500/5'
    case 'purpose':
      return 'border-slate-500/40 bg-slate-500/10'
    default:
      return 'border-border bg-muted/30'
  }
}
