import type { OccupantTag } from './hallway-layout'

export type CadetTagProfile = {
  id: string
  sport_fall: string | null
  sport_winter: string | null
  sport_spring: string | null
  is_in_band: boolean
  extracurriculars: string[]
  probation_status: string | null
}

export type ManualMark = {
  profile_id: string
  tag_code: string
  note: string | null
}

export type SportCodeMap = Record<string, string>

export function getCurrentSportSeason(): 'Fall' | 'Winter' | 'Spring' {
  const month = new Date().getMonth() + 1
  if (month >= 8 && month <= 11) return 'Fall'
  if (month === 12 || month <= 2) return 'Winter'
  return 'Spring'
}

export function activeSportName(profile: CadetTagProfile): string | null {
  const season = getCurrentSportSeason()
  const value =
    season === 'Fall'
      ? profile.sport_fall
      : season === 'Winter'
        ? profile.sport_winter
        : profile.sport_spring
  if (!value || value === 'None') return null
  return value.trim()
}

export function computeAutoTags(
  profile: CadetTagProfile,
  sportCodeMap: SportCodeMap
): OccupantTag[] {
  const tags: OccupantTag[] = []

  const sport = activeSportName(profile)
  if (sport) {
    const code = sportCodeMap[sport]
    if (code) tags.push({ code, source: 'auto' })
  }

  if (profile.is_in_band) {
    tags.push({ code: 'BND', source: 'auto' })
  }

  if (profile.extracurriculars?.length) {
    tags.push({ code: 'CLB', source: 'auto' })
  }

  if (profile.probation_status && profile.probation_status !== 'None') {
    tags.push({ code: 'PRB', source: 'auto' })
  }

  return tags
}

export function mergeCadetTags(
  profileId: string,
  profile: CadetTagProfile | undefined,
  manualMarks: ManualMark[],
  sportCodeMap: SportCodeMap
): OccupantTag[] {
  const manual = manualMarks
    .filter((m) => m.profile_id === profileId)
    .map((m) => ({
      code: m.tag_code,
      source: 'manual' as const,
      note: m.note,
    }))

  const auto = profile ? computeAutoTags(profile, sportCodeMap) : []

  const byCode = new Map<string, OccupantTag>()
  for (const tag of auto) byCode.set(tag.code, tag)
  for (const tag of manual) byCode.set(tag.code, tag)

  return [...byCode.values()].sort((a, b) => a.code.localeCompare(b.code))
}

export function collectSportCodesFromProfiles(
  profiles: CadetTagProfile[],
  sportCodeMap: SportCodeMap
): string[] {
  const codes = new Set<string>()
  for (const profile of profiles) {
    const sport = activeSportName(profile)
    if (sport && sportCodeMap[sport]) codes.add(sportCodeMap[sport])
  }
  return [...codes].sort()
}
