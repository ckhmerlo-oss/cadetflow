export const INSPECTION_STATUSES = ['INS', 'DAM', 'CLN', 'FIX', 'REP', 'MIS', 'OTH', 'N/A'] as const
export type InspectionStatus = (typeof INSPECTION_STATUSES)[number]

/** Status codes shown in the bubble picker (OTH replaced by optional item notes). */
export const INSPECTION_STATUS_PICKER_STATUSES = [
  'INS',
  'DAM',
  'CLN',
  'FIX',
  'REP',
  'MIS',
  'N/A',
] as const satisfies ReadonlyArray<InspectionStatus>

export const DEFICIENCY_STATUSES: InspectionStatus[] = ['DAM', 'CLN', 'FIX', 'REP', 'MIS']

/** Item or form needs attention (deficiency code or legacy OTH). */
export function statusRequiresAttention(status: string): boolean {
  return status !== 'N/A' && status !== 'INS'
}

/** @deprecated Use statusRequiresAttention for form-level prompts; item notes are always available in the UI. */
export function statusAllowsNotes(status: string): boolean {
  return statusRequiresAttention(status)
}

export const COMPANY_LETTERS = ['A', 'B', 'C', 'D', 'E'] as const
export type CompanyLetter = (typeof COMPANY_LETTERS)[number]

export const COMPANY_NAMES: Record<CompanyLetter, string> = {
  A: 'Alpha Company',
  B: 'Bravo Company',
  C: 'Charlie Company',
  D: 'Delta Company',
  E: 'Echo Company',
}

export const FLOORS = [1, 2, 3] as const

/** A/E/D: evens left; B/C: odds left (mirrored hallway). */
export function getHallwayLayoutConfig(companyLetter: string) {
  const mirrored = companyLetter === 'B' || companyLetter === 'C'
  return {
    oddsOnLeft: mirrored,
    tacOfficeSide: (mirrored ? 'right' : 'left') as 'left' | 'right',
  }
}

export const MANUAL_ROSTER_TAGS = [
  { code: 'LV', label: 'Leave' },
  { code: 'MED', label: 'Medical' },
  { code: 'SUS', label: 'Suspended' },
  { code: 'CLB', label: 'Club' },
] as const

export const AUTO_ROSTER_TAG_LEGEND = [
  { code: 'BND', label: 'Band' },
  { code: 'MOV', label: 'Move-in pending' },
  { code: 'PRB', label: 'Probation' },
] as const

export const ROSTER_TAG_LEGEND = [...MANUAL_ROSTER_TAGS, ...AUTO_ROSTER_TAG_LEGEND] as const

/** Default display when no manual accountability tag is set */
export const ROSTER_TAG_NONE = '---'

/** Vacant bunk placeholder (always 3 characters) */
export const ROSTER_TAG_VACANT = 'VAC'

export function buildAccountabilityTagOptions(sportCodes: string[]) {
  return [
    { code: ROSTER_TAG_NONE, label: 'Present / none' },
    ...MANUAL_ROSTER_TAGS,
    ...sportCodes.map((code) => ({ code, label: 'Sport' })),
  ]
}

export const ROOM_PURPOSE_OPTIONS = [
  { value: '', label: 'Cadet room' },
  { value: 'supply', label: 'Supply room' },
  { value: 'cq', label: 'CQ room' },
  { value: 'special', label: 'Special purpose' },
] as const

export type RoomPurposeCode = '' | 'supply' | 'cq' | 'special'

export function roomPurposeLabel(purpose: string | null | undefined): string | null {
  if (!purpose) return null
  return ROOM_PURPOSE_OPTIONS.find((option) => option.value === purpose)?.label ?? purpose
}

export function roomPurposeShortLabel(purpose: string | null | undefined): string | null {
  if (!purpose) return null
  switch (purpose) {
    case 'supply':
      return 'Supply'
    case 'cq':
      return 'CQ'
    case 'special':
      return 'Special'
    default:
      return roomPurposeLabel(purpose)
  }
}
