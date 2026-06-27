'use client'

import type { ReactNode } from 'react'
import type { HallwayBuildingData } from '../lib/hallway-layout'
import FloorHallwayBlock from './FloorHallwayBlock'
import {
  RosterHeader,
  RosterLeadership,
  RosterNotesFloorBlock,
  RosterStatsBlock,
  RosterTagLegend,
  buildRosterPanelProps,
} from './RosterInfoPanel'

type BunkKey = string

type TagOption = { code: string; label: string }

type HallwayBuildingSheetProps = {
  building: HallwayBuildingData
  interactive?: boolean
  printMode?: boolean
  editableNotes?: boolean
  markingMode?: boolean
  selectedBunks?: Set<BunkKey>
  onToggleBunk?: (key: BunkKey) => void
  sportCodes?: string[]
  tagOptions?: TagOption[]
  canEditTags?: boolean
  onTagChange?: (profileId: string, tagCode: string) => void
  bunkOnlyView?: boolean
}

const floorProps = (
  props: HallwayBuildingSheetProps,
  interactive: boolean,
  printMode: boolean,
  editableNotes: boolean
) => ({
  interactive,
  printMode,
  editableNotes,
  markingMode: props.markingMode,
  selectedBunks: props.selectedBunks,
  onToggleBunk: props.onToggleBunk,
  tagOptions: props.tagOptions,
  canEditTags: props.canEditTags,
  onTagChange: props.onTagChange,
  bunkOnlyView: props.bunkOnlyView,
})

function ScreenCell({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`min-w-0 ${className}`}>{children}</div>
}

/**
 * Screen: F1/F3 | F2 floor grid only (roster summary in page admin bar).
 * Print: F1/F3 left; F2 center (full height); admin + company notes in the right column.
 */
export default function HallwayBuildingSheet(props: HallwayBuildingSheetProps) {
  const {
    building,
    interactive = false,
    printMode = false,
    editableNotes = false,
    sportCodes = [],
  } = props

  const panel = buildRosterPanelProps(building, sportCodes, editableNotes, printMode)
  const floors = floorProps(props, interactive, printMode, editableNotes)

  if (!printMode) {
    return (
      <div
        className="w-full grid gap-3 items-start grid-cols-1 lg:grid-cols-2"
        style={{ gridTemplateRows: 'auto auto' }}
      >
        <ScreenCell className="lg:col-start-1 lg:row-start-1">
          <FloorHallwayBlock data={building.floors[1]} {...floors} />
        </ScreenCell>
        <ScreenCell className="lg:col-start-2 lg:row-start-1">
          <FloorHallwayBlock data={building.floors[2]} {...floors} />
        </ScreenCell>
        <ScreenCell className="lg:col-start-1 lg:row-start-2">
          <FloorHallwayBlock data={building.floors[3]} {...floors} />
        </ScreenCell>
      </div>
    )
  }

  const cellClass = 'flex flex-col min-h-0 min-w-0 h-full'
  const infoPanelClass = 'flex flex-col gap-1 border border-black p-1 bg-white self-stretch box-border min-w-0 h-full overflow-hidden'

  return (
    <div className="print-roster bg-white text-black w-full h-full box-border">
      <div
        className="grid items-stretch relative w-full h-full min-h-[10in] box-border"
        style={{
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 0.52fr)',
          gridTemplateRows: '1fr 1fr',
          columnGap: '0.06in',
          rowGap: '0.06in',
        }}
      >
        <div className={`col-start-1 row-start-1 ${cellClass}`}>
          <FloorHallwayBlock data={building.floors[1]} printMode />
        </div>
        <div className={`col-start-1 row-start-2 ${cellClass}`}>
          <FloorHallwayBlock data={building.floors[3]} printMode />
        </div>
        <div className={`col-start-2 row-start-1 row-span-2 ${cellClass}`}>
          <FloorHallwayBlock data={building.floors[2]} printMode />
        </div>

        <div className={`col-start-3 row-start-1 row-span-2 z-20 ${infoPanelClass}`}>
          <div className="shrink-0 flex flex-col gap-1">
            <RosterHeader {...panel} />
            <RosterLeadership {...panel} />
            <RosterStatsBlock {...panel} />
            <RosterTagLegend {...panel} />
          </div>
          <RosterNotesFloorBlock {...panel} />
        </div>
      </div>
    </div>
  )
}
