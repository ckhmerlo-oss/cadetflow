import type { InspectionTemplate } from '../actions'
import { DEFICIENCY_STATUSES, type InspectionStatus } from '../constants'

export type InspectionSubsection = 'left' | 'right' | 'top' | 'bottom'

export type InspectionRowLike = {
  item_key: string
  item_label: string
  sort_order: number
  status?: InspectionStatus | string
  notes?: string | null
  id?: string
}

export type InspectionSubsectionGroup = {
  subsection: InspectionSubsection | null
  subsectionLabel: string | null
  items: InspectionRowLike[]
}

export type InspectionSectionGroup = {
  sectionKey: string
  sectionLabel: string
  subsections: InspectionSubsectionGroup[]
}

const SUBSECTION_LABELS: Record<InspectionSubsection, string> = {
  left: 'Left',
  right: 'Right',
  top: 'Top',
  bottom: 'Bottom',
}

const SUBSECTION_ORDER: Record<string, number> = {
  left: 1,
  top: 1,
  right: 2,
  bottom: 2,
}

/** Legacy Day 09 v1 keys mapped for read-only display of older forms. */
const LEGACY_ITEM_LAYOUT: Record<
  string,
  { section_key: string; section_label: string; subsection: InspectionSubsection | null; sort_order: number }
> = {
  top_bunk: { section_key: 'legacy_bunk', section_label: 'Bunk', subsection: 'top', sort_order: 10 },
  bottom_bunk: { section_key: 'legacy_bunk', section_label: 'Bunk', subsection: 'bottom', sort_order: 20 },
  desk: { section_key: 'legacy', section_label: 'Legacy items', subsection: null, sort_order: 30 },
  mattress_t: { section_key: 'mattress', section_label: 'Mattress', subsection: 'top', sort_order: 230 },
  mattress_b: { section_key: 'mattress', section_label: 'Mattress', subsection: 'bottom', sort_order: 240 },
  desk_chair_l: { section_key: 'desk', section_label: 'Desk', subsection: 'left', sort_order: 160 },
  desk_chair_r: { section_key: 'desk', section_label: 'Desk', subsection: 'right', sort_order: 170 },
  wall_locker: { section_key: 'wall_locker', section_label: 'Wall locker', subsection: null, sort_order: 50 },
  bed_locker: { section_key: 'legacy', section_label: 'Legacy items', subsection: null, sort_order: 60 },
  sink: { section_key: 'vanity', section_label: 'Vanity / sink', subsection: null, sort_order: 70 },
  mirror: { section_key: 'vanity', section_label: 'Vanity / sink', subsection: null, sort_order: 80 },
  medicine_cabinet: { section_key: 'vanity', section_label: 'Vanity / sink', subsection: null, sort_order: 90 },
  trash_can: { section_key: 'vanity', section_label: 'Vanity / sink', subsection: null, sort_order: 100 },
  broom_dustpan: { section_key: 'room', section_label: 'Room', subsection: null, sort_order: 110 },
  window_blinds: { section_key: 'window', section_label: 'Window', subsection: null, sort_order: 120 },
  door_lock: { section_key: 'door', section_label: 'Door', subsection: null, sort_order: 130 },
  light_fixtures: { section_key: 'room', section_label: 'Room', subsection: null, sort_order: 140 },
  electrical: { section_key: 'room', section_label: 'Room', subsection: null, sort_order: 150 },
  rifle_rack: { section_key: 'rifle_rack', section_label: 'Rifle rack', subsection: null, sort_order: 160 },
  floor: { section_key: 'room', section_label: 'Room', subsection: null, sort_order: 170 },
}

function templateMetaForRow(
  row: InspectionRowLike,
  templateByKey: Map<string, InspectionTemplate>
): {
  section_key: string
  section_label: string
  subsection: InspectionSubsection | null
  sort_order: number
} {
  const template = templateByKey.get(row.item_key)
  if (template?.section_key && template.section_label) {
    return {
      section_key: template.section_key,
      section_label: template.section_label,
      subsection: (template.subsection as InspectionSubsection | null) ?? null,
      sort_order: template.sort_order,
    }
  }

  const legacy = LEGACY_ITEM_LAYOUT[row.item_key]
  if (legacy) return legacy

  return {
    section_key: 'other',
    section_label: 'Other',
    subsection: null,
    sort_order: row.sort_order,
  }
}

export function isDeficiencyStatus(status: string | undefined): boolean {
  return !!status && (DEFICIENCY_STATUSES as string[]).includes(status)
}

export function groupInspectionRows(
  rows: InspectionRowLike[],
  templates: InspectionTemplate[] = []
): InspectionSectionGroup[] {
  const templateByKey = new Map(templates.map((t) => [t.item_key, t]))

  const enriched = rows.map((row) => ({
    row,
    meta: templateMetaForRow(row, templateByKey),
  }))

  const sectionMinSort = new Map<string, number>()
  for (const entry of enriched) {
    const current = sectionMinSort.get(entry.meta.section_key)
    if (current === undefined || entry.meta.sort_order < current) {
      sectionMinSort.set(entry.meta.section_key, entry.meta.sort_order)
    }
  }

  enriched.sort((a, b) => {
    const secA = sectionMinSort.get(a.meta.section_key) ?? 0
    const secB = sectionMinSort.get(b.meta.section_key) ?? 0
    if (secA !== secB) return secA - secB
    const subA = a.meta.subsection ? SUBSECTION_ORDER[a.meta.subsection] ?? 3 : 3
    const subB = b.meta.subsection ? SUBSECTION_ORDER[b.meta.subsection] ?? 3 : 3
    if (subA !== subB) return subA - subB
    return a.meta.sort_order - b.meta.sort_order
  })

  const sectionOrder: string[] = []
  const sectionMap = new Map<string, InspectionSectionGroup>()

  for (const { row, meta } of enriched) {
    if (!sectionMap.has(meta.section_key)) {
      sectionOrder.push(meta.section_key)
      sectionMap.set(meta.section_key, {
        sectionKey: meta.section_key,
        sectionLabel: meta.section_label,
        subsections: [],
      })
    }

    const section = sectionMap.get(meta.section_key)!
    let subsectionGroup = section.subsections.find((s) => s.subsection === meta.subsection)
    if (!subsectionGroup) {
      subsectionGroup = {
        subsection: meta.subsection,
        subsectionLabel: meta.subsection ? SUBSECTION_LABELS[meta.subsection] : null,
        items: [],
      }
      section.subsections.push(subsectionGroup)
    }
    subsectionGroup.items.push(row)
  }

  for (const section of sectionMap.values()) {
    section.subsections.sort((a, b) => {
      const orderA = a.subsection ? SUBSECTION_ORDER[a.subsection] ?? 99 : 99
      const orderB = b.subsection ? SUBSECTION_ORDER[b.subsection] ?? 99 : 99
      return orderA - orderB
    })
  }

  return sectionOrder.map((key) => sectionMap.get(key)!)
}

export function sectionUsesSubsectionPicker(sectionKey: string): boolean {
  return (
    sectionKey === 'desk' ||
    sectionKey === 'mattress' ||
    sectionKey === 'bed_locker'
  )
}

/** @deprecated Use sectionUsesSubsectionPicker */
export function sectionUsesSideBySideLayout(sectionKey: string): boolean {
  return sectionUsesSubsectionPicker(sectionKey)
}

export function subsectionOptionsForSection(
  section: InspectionSectionGroup
): InspectionSubsection[] {
  const paired = section.subsections
    .filter((s) => s.subsection !== null)
    .map((s) => s.subsection!)
  return paired.sort((a, b) => (SUBSECTION_ORDER[a] ?? 99) - (SUBSECTION_ORDER[b] ?? 99))
}

export function lockedSubsectionForSection(
  sectionKey: string,
  lockedBunk?: 'top' | 'bottom' | null,
  lockedDeskSide?: 'left' | 'right' | null
): InspectionSubsection | null {
  if (sectionKey === 'mattress' || sectionKey === 'bed_locker') {
    return lockedBunk ?? null
  }
  if (sectionKey === 'desk') {
    return lockedDeskSide ?? null
  }
  return null
}

export function isItemVisibleForSubsection(
  sectionKey: string,
  subsection: InspectionSubsection | null,
  activeSubsection: InspectionSubsection | null
): boolean {
  if (subsection === null) return true
  if (!sectionUsesSubsectionPicker(sectionKey)) return true
  return subsection === activeSubsection
}

export function subsectionLabelsForView(section: InspectionSectionGroup): InspectionSubsection[] {
  const withData = section.subsections
    .filter((s) => s.subsection !== null && s.items.some((i) => i.status && i.status !== 'N/A'))
    .map((s) => s.subsection!)
  if (withData.length > 0) {
    return withData.sort((a, b) => (SUBSECTION_ORDER[a] ?? 99) - (SUBSECTION_ORDER[b] ?? 99))
  }
  return subsectionOptionsForSection(section)
}

export function filterTemplatesForExternal(
  templates: InspectionTemplate[],
  lockedBunk: 'top' | 'bottom',
  lockedDeskSide: 'left' | 'right'
): InspectionTemplate[] {
  return templates.filter((t) => {
    if (!t.subsection) return true
    const section = t.section_key ?? ''
    if (section === 'mattress' || section === 'bed_locker') {
      return t.subsection === lockedBunk
    }
    if (section === 'desk') {
      return t.subsection === lockedDeskSide
    }
    return true
  })
}

/** Hide redundant item label when it duplicates the section title in a subsection column. */
export function shouldHideItemLabel(sectionLabel: string, itemLabel: string): boolean {
  return itemLabel.trim().toLowerCase() === sectionLabel.trim().toLowerCase()
}

export function subsectionDisplayLabel(subsection: InspectionSubsection): string {
  return SUBSECTION_LABELS[subsection]
}

/** Section with a single checklist leaf — no section card wrapper. */
export function sectionIsSingleItem(section: InspectionSectionGroup): boolean {
  return section.subsections.reduce((count, group) => count + group.items.length, 0) === 1
}
