'use client'

import { useMemo, useState, type ReactNode } from 'react'
import type { InspectionTemplate } from '../actions'
import type { InspectionStatus } from '../constants'
import {
  groupInspectionRows,
  isItemVisibleForSubsection,
  lockedSubsectionForSection,
  sectionIsSingleItem,
  sectionUsesSubsectionPicker,
  shouldHideItemLabel,
  subsectionDisplayLabel,
  subsectionLabelsForView,
  subsectionOptionsForSection,
  type InspectionRowLike,
  type InspectionSectionGroup,
  type InspectionSubsection,
} from '../lib/inspection-form-layout'
import InspectionItemCard from './InspectionItemCard'
import SubsectionBubblePicker from './SubsectionBubblePicker'

type EditHandlers = {
  onStatusChange: (itemKey: string, status: InspectionStatus) => void
  onNotesChange: (itemKey: string, notes: string) => void
}

type InspectionFormSectionsProps = {
  rows: InspectionRowLike[]
  templates: InspectionTemplate[]
  mode: 'edit' | 'view'
  editHandlers?: EditHandlers
  /** tac = TAC inspecting (toggle sides); external = parent/cadet with locks */
  editorMode?: 'tac' | 'external'
  lockedBunk?: 'top' | 'bottom' | null
  lockedDeskSide?: 'left' | 'right' | null
}

function FlatItems({
  items,
  sectionLabel,
  mode,
  editHandlers,
}: {
  items: InspectionRowLike[]
  sectionLabel?: string
  mode: 'edit' | 'view'
  editHandlers?: EditHandlers
}) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <InspectionItemCard
          key={item.item_key}
          itemKey={item.item_key}
          label={
            sectionLabel && shouldHideItemLabel(sectionLabel, item.item_label) ? '' : item.item_label
          }
          mode={mode}
          status={(item.status as InspectionStatus) ?? 'N/A'}
          notes={item.notes}
          onStatusChange={
            editHandlers
              ? (status) => editHandlers.onStatusChange(item.item_key, status)
              : undefined
          }
          onNotesChange={
            editHandlers ? (notes) => editHandlers.onNotesChange(item.item_key, notes) : undefined
          }
        />
      ))}
    </div>
  )
}

function SectionHeader({
  sectionLabel,
  subsectionLabel,
  showPicker,
  picker,
}: {
  sectionLabel: string
  subsectionLabel: string | null
  showPicker: boolean
  picker: ReactNode
}) {
  return (
    <header
      className="sticky top-0 z-10 border-b border-border bg-muted/40 px-3 py-2.5 sm:px-4 flex flex-wrap items-center justify-between gap-2"
    >
      <h2 className="text-sm font-semibold">
        {sectionLabel}
        {subsectionLabel ? (
          <>
            <span className="text-muted-foreground font-normal"> · </span>
            <span className="font-bold text-foreground">{subsectionLabel}</span>
          </>
        ) : null}
      </h2>
      {showPicker ? picker : null}
    </header>
  )
}

function renderSectionBody(
  section: InspectionSectionGroup,
  usesPicker: boolean,
  activeSub: InspectionSubsection | null,
  mode: 'edit' | 'view',
  editHandlers?: EditHandlers
) {
  const options = subsectionOptionsForSection(section)
  const sharedItems = section.subsections.filter((s) => s.subsection === null).flatMap((s) => s.items)

  const visiblePairedItems = usesPicker
    ? section.subsections
        .filter(
          (s) =>
            s.subsection !== null &&
            isItemVisibleForSubsection(section.sectionKey, s.subsection, activeSub)
        )
        .flatMap((s) => s.items)
    : []

  const flatNonPickerItems = !usesPicker ? section.subsections.flatMap((s) => s.items) : []

  const displayItems = usesPicker ? visiblePairedItems : flatNonPickerItems

  return (
    <div className="space-y-3 p-3 sm:p-4">
      {displayItems.length > 0 && (
        <FlatItems
          items={displayItems}
          sectionLabel={section.sectionLabel}
          mode={mode}
          editHandlers={editHandlers}
        />
      )}
      {usesPicker && sharedItems.length > 0 && (
        <FlatItems items={sharedItems} mode={mode} editHandlers={editHandlers} />
      )}
    </div>
  )
}

export default function InspectionFormSections({
  rows,
  templates,
  mode,
  editHandlers,
  editorMode = 'tac',
  lockedBunk = null,
  lockedDeskSide = null,
}: InspectionFormSectionsProps) {
  const sections = groupInspectionRows(rows, templates)

  const defaultActive = useMemo(() => {
    const map: Record<string, InspectionSubsection> = {}
    for (const section of sections) {
      if (!sectionUsesSubsectionPicker(section.sectionKey)) continue
      const locked = lockedSubsectionForSection(section.sectionKey, lockedBunk, lockedDeskSide)
      const options = subsectionOptionsForSection(section)
      if (locked && options.includes(locked)) {
        map[section.sectionKey] = locked
      } else if (options.length > 0) {
        map[section.sectionKey] = options[0]
      }
    }
    return map
  }, [sections, lockedBunk, lockedDeskSide])

  const [activeSubsections, setActiveSubsections] =
    useState<Record<string, InspectionSubsection>>(defaultActive)

  const getActiveSubsection = (sectionKey: string, options: InspectionSubsection[]) => {
    const locked = lockedSubsectionForSection(sectionKey, lockedBunk, lockedDeskSide)
    if (editorMode === 'external' && locked) return locked
    const current = activeSubsections[sectionKey]
    if (current && options.includes(current)) return current
    if (locked && options.includes(locked)) return locked
    return options[0]
  }

  return (
    <div className="space-y-3">
      {sections.map((section) => {
        const usesPicker = sectionUsesSubsectionPicker(section.sectionKey)
        const options = subsectionOptionsForSection(section)
        const activeSub = usesPicker ? getActiveSubsection(section.sectionKey, options) : null
        const subsectionLabel =
          usesPicker && activeSub ? subsectionDisplayLabel(activeSub) : null

        if (sectionIsSingleItem(section)) {
          const items = section.subsections.flatMap((s) => s.items)
          return (
            <FlatItems
              key={section.sectionKey}
              items={items}
              mode={mode}
              editHandlers={editHandlers}
            />
          )
        }

        if (mode === 'view' && usesPicker && options.length >= 2) {
          const viewSubsections = subsectionLabelsForView(section)
          const sharedItems = section.subsections
            .filter((s) => s.subsection === null)
            .flatMap((s) => s.items)

          return (
            <section
              key={section.sectionKey}
              className="overflow-hidden rounded-xl border border-border bg-card"
            >
              <header className="border-b border-border bg-muted/40 px-3 py-2.5 sm:px-4">
                <h2 className="text-sm font-semibold">{section.sectionLabel}</h2>
              </header>
              <div className="space-y-4 p-3 sm:p-4">
                {viewSubsections.map((sub) => {
                  const subGroup = section.subsections.find((s) => s.subsection === sub)
                  if (!subGroup || subGroup.items.length === 0) return null
                  return (
                    <div key={sub} className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {subsectionDisplayLabel(sub)}
                      </p>
                      <FlatItems
                        items={subGroup.items}
                        sectionLabel={section.sectionLabel}
                        mode="view"
                      />
                    </div>
                  )
                })}
                {sharedItems.length > 0 && <FlatItems items={sharedItems} mode="view" />}
              </div>
            </section>
          )
        }

        const showTacPicker =
          usesPicker &&
          options.length >= 2 &&
          mode === 'edit' &&
          editorMode === 'tac'

        return (
          <section
            key={section.sectionKey}
            className="overflow-hidden rounded-xl border border-border bg-card"
          >
            <SectionHeader
              sectionLabel={section.sectionLabel}
              subsectionLabel={subsectionLabel}
              showPicker={showTacPicker}
              picker={
                <SubsectionBubblePicker
                  options={options}
                  value={activeSub!}
                  name={`section-${section.sectionKey}`}
                  locked={false}
                  onChange={(sub) =>
                    setActiveSubsections((prev) => ({ ...prev, [section.sectionKey]: sub }))
                  }
                />
              }
            />

            {renderSectionBody(section, usesPicker, activeSub, mode, editHandlers)}
          </section>
        )
      })}
    </div>
  )
}
