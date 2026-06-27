'use client'

import type { ReactNode } from 'react'
import { splitHallwayBanks, type HallwayFloorData } from '../lib/hallway-layout'
import CompactRoomRow from './CompactRoomRow'
import { FloorNotesInline, FloorPlatoonLeaders } from './RosterInfoPanel'

type TagOption = { code: string; label: string }

type FloorHallwayBlockProps = {
  data: HallwayFloorData
  interactive?: boolean
  printMode?: boolean
  editableNotes?: boolean
  markingMode?: boolean
  selectedBunks?: Set<string>
  onToggleBunk?: (key: string) => void
  tagOptions?: TagOption[]
  canEditTags?: boolean
  onTagChange?: (profileId: string, tagCode: string) => void
  bunkOnlyView?: boolean
}

function SpineLabel({
  children,
  printMode,
}: {
  children: ReactNode
  printMode: boolean
}) {
  return (
    <div
      className={
        printMode
          ? 'text-[8px] font-bold uppercase tracking-wide border border-black py-0.5 text-center bg-white'
          : 'text-[10px] font-bold uppercase tracking-wide border border-border py-1 text-center rounded-sm bg-card/80'
      }
    >
      {children}
    </div>
  )
}

export default function FloorHallwayBlock({
  data,
  interactive = false,
  printMode = false,
  editableNotes = false,
  markingMode = false,
  selectedBunks,
  onToggleBunk,
  tagOptions = [],
  canEditTags = false,
  onTagChange,
  bunkOnlyView = false,
}: FloorHallwayBlockProps) {
  const { left, right } = splitHallwayBanks(data.rooms, data.company_letter)
  const gap = printMode ? 'gap-[2px]' : 'gap-1'

  const rowProps = {
    interactive,
    printMode,
    markingMode,
    selectedBunks,
    onToggleBunk,
    tagOptions,
    canEditTags,
    onTagChange,
    bunkOnlyView,
  }

  const rootClass = printMode
    ? 'h-full flex flex-col justify-start border border-black p-[3px] bg-white box-border min-w-0 overflow-hidden'
    : 'w-full border border-border rounded-lg p-2 bg-card/30'

  return (
    <div className={rootClass}>
      <div
        className={`mb-1 ${printMode ? 'text-[9px] font-bold uppercase border-b border-black pb-0.5' : 'text-sm font-semibold text-foreground'}`}
      >
        Floor {data.floor}
      </div>

      <FloorPlatoonLeaders
        data={data}
        editable={editableNotes}
        printMode={printMode}
      />

      <div className={`flex flex-col ${gap} mb-1`}>
        <SpineLabel printMode={printMode}>
          {data.floor === 1 ? 'Main Ent. / Stairwell' : 'Stairwell'}
        </SpineLabel>
      </div>

      <div className={`flex ${gap} ${printMode ? 'shrink-0' : 'w-full'}`}>
        <div className={`flex flex-col ${gap} flex-1 min-w-0`}>
          {left.map((room) => (
            <CompactRoomRow key={room.id} room={room} roomNumberSide="left" {...rowProps} />
          ))}
        </div>
        <div className={`flex flex-col ${gap} flex-1 min-w-0`}>
          {right.map((room) => (
            <CompactRoomRow key={room.id} room={room} roomNumberSide="right" {...rowProps} />
          ))}
        </div>
      </div>

      {printMode ? (
        <div className={`flex flex-col ${gap} shrink-0`}>
          <SpineLabel printMode={printMode}>Bathroom</SpineLabel>
          <FloorNotesInline
            companyLetter={data.company_letter}
            floor={data.floor}
            editable={editableNotes}
            printMode
            embedded
          />
        </div>
      ) : (
        <>
          <div className={`flex flex-col ${gap} mt-1`}>
            <SpineLabel printMode={printMode}>Bathroom</SpineLabel>
          </div>
          <FloorNotesInline
            companyLetter={data.company_letter}
            floor={data.floor}
            editable={editableNotes}
          />
        </>
      )}
    </div>
  )
}
