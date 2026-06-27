'use client'

import Link from 'next/link'
import { ROSTER_TAG_NONE, ROSTER_TAG_VACANT } from '../constants'
import {
  autoTagCodes,
  bunkSelectionKey,
  formatOccupantName,
  formatOccupantTagCodes,
  formatRoomHallwayLabel,
  formatRosterPrintName,
  primaryManualTagCode,
  roomOccupancyStatus,
  roomStatusClass,
  splitPurposeRoomLabels,
  type HallwayOccupant,
  type HallwayRoom,
} from '../lib/hallway-layout'

type TagOption = { code: string; label: string }

type CompactRoomRowProps = {
  room: HallwayRoom
  roomNumberSide: 'left' | 'right'
  interactive?: boolean
  printMode?: boolean
  markingMode?: boolean
  bunkOnlyView?: boolean
  selectedBunks?: Set<string>
  onToggleBunk?: (key: string) => void
  tagOptions?: TagOption[]
  canEditTags?: boolean
  onTagChange?: (profileId: string, tagCode: string) => void
}

function RoomNumberLink({
  roomId,
  roomNum,
  printMode,
  className,
}: {
  roomId: string
  roomNum: string
  printMode: boolean
  className: string
}) {
  if (printMode) {
    return <div className={className}>{roomNum}</div>
  }

  return (
    <Link
      href={`/barracks/rooms/${roomId}`}
      className={`${className} flex items-center justify-center w-full h-full hover:text-primary hover:underline`}
      onClick={(e) => e.stopPropagation()}
    >
      {roomNum}
    </Link>
  )
}

function OccupantRow({
  occupant,
  bunk,
  printMode,
  markingMode,
  selected,
  onToggle,
  tagOptions,
  canEditTags,
  onTagChange,
  bunkOnlyView = false,
  purposeBunkLabel,
}: {
  occupant: HallwayOccupant
  bunk: 'top' | 'bottom'
  printMode: boolean
  markingMode?: boolean
  selected?: boolean
  onToggle?: () => void
  tagOptions: TagOption[]
  canEditTags?: boolean
  onTagChange?: (profileId: string, tagCode: string) => void
  bunkOnlyView?: boolean
  /** When set, renders a non-cadet bunk label instead of occupant data. */
  purposeBunkLabel?: string | null
}) {
  const isPurposeBunk = purposeBunkLabel != null
  const isVacant = !occupant
  const displayName = isPurposeBunk
    ? purposeBunkLabel
    : bunkOnlyView
    ? (isVacant ? 'Vacant' : 'Occupied')
    : printMode
      ? formatRosterPrintName(occupant)
      : formatOccupantName(occupant)
  const tagSuffix = printMode && occupant && !isPurposeBunk ? formatOccupantTagCodes(occupant) : ''
  const nameWithTags = tagSuffix ? `${displayName} ${tagSuffix}` : displayName
  const manualCode = isPurposeBunk ? '---' : isVacant ? ROSTER_TAG_VACANT : (primaryManualTagCode(occupant) ?? ROSTER_TAG_NONE)
  const autoCodes = isVacant || isPurposeBunk ? [] : autoTagCodes(occupant)

  if (printMode) {
    const purposeClass = isPurposeBunk && displayName
      ? 'text-[10px] font-bold uppercase leading-tight py-[1px] min-h-[0.13in] flex items-center justify-center'
      : 'text-center truncate text-[10px] leading-tight py-[1px]'
    return (
      <div className={purposeClass}>
        {nameWithTags}
      </div>
    )
  }

  const rowClass = [
    'flex items-center gap-1 min-w-0 rounded px-0.5 -mx-0.5',
    markingMode && occupant ? 'cursor-pointer hover:bg-accent/40' : '',
    selected ? 'bg-primary/15 ring-1 ring-primary/40' : '',
  ].filter(Boolean).join(' ')

  const handleRowClick = () => {
    if (markingMode && occupant && onToggle) onToggle()
  }

  return (
    <div
      className={rowClass}
      onClick={handleRowClick}
      role={markingMode && occupant ? 'button' : undefined}
      tabIndex={markingMode && occupant ? 0 : undefined}
      onKeyDown={(e) => {
        if (markingMode && occupant && onToggle && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onToggle()
        }
      }}
    >
      {!isPurposeBunk && (
        <span className="text-[10px] uppercase font-bold opacity-50 shrink-0 w-7">
          {bunk === 'top' ? 'Top' : 'Btm'}
        </span>
      )}

      {isVacant || bunkOnlyView || isPurposeBunk ? (
        <span
          className={`flex-1 truncate text-sm min-w-0 ${
            isPurposeBunk && displayName
              ? 'font-bold uppercase text-muted-foreground text-center'
              : isPurposeBunk
                ? ''
                : isVacant
                  ? 'text-muted-foreground italic'
                  : 'font-medium'
          }`}
        >
          {displayName}
        </span>
      ) : (
        <Link
          href={`/profile/${occupant.id}`}
          className="flex-1 truncate text-sm font-medium hover:text-primary hover:underline min-w-0"
          onClick={(e) => e.stopPropagation()}
        >
          {displayName}
        </Link>
      )}

      {!bunkOnlyView && !isPurposeBunk && autoCodes.length > 0 && (
        <span className="text-[9px] font-bold uppercase text-muted-foreground shrink-0" title="Auto tag">
          {autoCodes.join(' ')}
        </span>
      )}

      {canEditTags && onTagChange && !isVacant && !bunkOnlyView && !isPurposeBunk ? (
        <select
          value={manualCode}
          onChange={(e) => {
            e.stopPropagation()
            onTagChange(occupant.id, e.target.value)
          }}
          onClick={(e) => e.stopPropagation()}
          className="w-11 shrink-0 text-xs font-bold uppercase bg-background border border-input rounded px-0.5 py-0.5"
          aria-label={`Accountability tag for ${displayName}`}
        >
          {tagOptions.map(({ code, label }) => (
            <option key={code} value={code}>{code}</option>
          ))}
        </select>
      ) : !bunkOnlyView && !isPurposeBunk ? (
        <span className="w-11 shrink-0 text-center text-xs font-bold uppercase text-muted-foreground">
          {manualCode}
        </span>
      ) : null}
    </div>
  )
}

export default function CompactRoomRow({
  room,
  roomNumberSide,
  interactive = false,
  printMode = false,
  markingMode = false,
  selectedBunks,
  onToggleBunk,
  tagOptions = [],
  canEditTags = false,
  onTagChange,
  bunkOnlyView = false,
}: CompactRoomRowProps) {
  const status = roomOccupancyStatus(room)
  const hasOrders = room.open_work_orders > 0
  const roomNum = formatRoomHallwayLabel(room)
  const purposeLabels = splitPurposeRoomLabels(room)

  const numClass = printMode
    ? 'text-[10px] font-bold leading-none tabular-nums'
    : 'text-sm font-bold leading-none'

  const numCellClass = printMode
    ? 'flex items-center justify-center w-[0.26in] shrink-0 border-black box-border'
    : 'flex items-center justify-center w-10 shrink-0 border-current/20'

  const toggle = (bunk: 'top' | 'bottom', occupant: HallwayOccupant) => {
    if (!occupant || !onToggleBunk) return
    onToggleBunk(bunkSelectionKey(occupant.id, bunk))
  }

  const borderSide = roomNumberSide === 'left' ? 'border-r' : 'border-l'

  const body = (
    <>
      {roomNumberSide === 'left' && (
        <div className={`relative shrink-0 ${numCellClass} ${borderSide}`}>
          <RoomNumberLink
            roomId={room.id}
            roomNum={roomNum}
            printMode={printMode || !interactive}
            className={numClass}
          />
          {hasOrders && !printMode && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-orange-500" />
          )}
        </div>
      )}

      <div className={`flex-1 min-w-0 ${printMode ? 'py-[1px]' : 'py-1'}`}>
        <div className={printMode ? (purposeLabels ? 'border-b border-black/30' : '') : 'border-b border-current/15 pb-1 mb-1'}>
          <OccupantRow
            occupant={room.occupant_top}
            bunk="top"
            printMode={printMode}
            markingMode={interactive && markingMode}
            selected={room.occupant_top ? selectedBunks?.has(bunkSelectionKey(room.occupant_top.id, 'top')) : false}
            onToggle={() => toggle('top', room.occupant_top)}
            tagOptions={tagOptions}
            canEditTags={interactive && canEditTags}
            onTagChange={onTagChange}
            bunkOnlyView={bunkOnlyView}
            purposeBunkLabel={purposeLabels ? purposeLabels.top : null}
          />
        </div>
        <OccupantRow
          occupant={room.occupant_bottom}
          bunk="bottom"
          printMode={printMode}
          markingMode={interactive && markingMode}
          selected={room.occupant_bottom ? selectedBunks?.has(bunkSelectionKey(room.occupant_bottom.id, 'bottom')) : false}
          onToggle={() => toggle('bottom', room.occupant_bottom)}
          tagOptions={tagOptions}
          canEditTags={interactive && canEditTags}
          onTagChange={onTagChange}
          bunkOnlyView={bunkOnlyView}
          purposeBunkLabel={purposeLabels ? purposeLabels.bottom : null}
        />
      </div>

      {roomNumberSide === 'right' && (
        <div className={`relative shrink-0 ${numCellClass} ${borderSide}`}>
          <RoomNumberLink
            roomId={room.id}
            roomNum={roomNum}
            printMode={printMode || !interactive}
            className={numClass}
          />
          {hasOrders && !printMode && (
            <span className="absolute -top-0.5 -left-0.5 w-2 h-2 rounded-full bg-orange-500" />
          )}
        </div>
      )}
    </>
  )

  const className = [
    'relative flex items-stretch gap-0 border box-border min-w-0',
    printMode
      ? 'border-black bg-white text-black min-h-[0.26in] rounded-none'
      : `rounded-sm ${roomStatusClass(status)}`,
    printMode ? 'px-0' : 'px-1',
  ].join(' ')

  return <div className={className}>{body}</div>
}
