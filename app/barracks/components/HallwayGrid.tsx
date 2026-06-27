'use client'

import {
  formatOccupantName,
  formatRoomHallwayLabel,
  splitHallwayBanks,
  splitPurposeRoomLabels,
  type HallwayFloorData,
  type HallwayLeader,
  type HallwayRoom,
} from '../lib/hallway-layout'
import RoomCell from './RoomCell'
import { formatDateTime } from '@/app/lib/utils'
import { COMPANY_NAMES, type CompanyLetter } from '../constants'

function formatRoomOccupant(room: HallwayRoom, bunk: 'top' | 'bottom'): string {
  const purposeLabels = splitPurposeRoomLabels(room)
  if (purposeLabels) {
    return bunk === 'top' ? purposeLabels.top : purposeLabels.bottom
  }
  return formatOccupantName(bunk === 'top' ? room.occupant_top : room.occupant_bottom)
}

type PrintRosterSheetProps = {
  data: HallwayFloorData
  printDate?: string
}

function leaderLine(leader: HallwayLeader): string {
  if (!leader) return 'Vacant'
  const rank = leader.cadet_rank?.trim()
  const name = `${leader.first_name} ${leader.last_name}`.trim()
  return rank ? `${rank} ${name}` : name
}

export default function PrintRosterSheet({ data, printDate }: PrintRosterSheetProps) {
  const { left, right, maxRows } = splitHallwayBanks(data.rooms, data.company_letter)
  const companyName = data.company_name ?? COMPANY_NAMES[data.company_letter as CompanyLetter] ?? data.company_letter
  const updatedAt = formatDateTime(printDate ?? new Date().toISOString())

  return (
    <div className="print-roster bg-white text-black p-4 max-w-4xl mx-auto">
      <header className="text-center mb-4 border-b border-black pb-2">
        <h1 className="text-lg font-bold uppercase tracking-wide">{companyName}</h1>
        <p className="text-sm font-semibold mt-1">Room Roster</p>
        <div className="flex justify-center gap-6 text-sm mt-2">
          <span>Floor: {data.floor}</span>
          <span>Updated {updatedAt}</span>
        </div>
      </header>

      <div className="text-center font-bold text-sm mb-2 uppercase tracking-widest border border-black py-1">
        Main Ent.
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] gap-3">
        {/* Left bank */}
        <div className="space-y-1">
          {left.map((room) => (
            <div key={room.id} className="border border-black rounded-sm p-1 text-xs print-room-cell">
              <div className="text-center truncate">{formatRoomOccupant(room, 'top')}</div>
              <div className="text-center font-bold text-sm py-0.5">{formatRoomHallwayLabel(room)}</div>
              <div className="text-center truncate">{formatRoomOccupant(room, 'bottom')}</div>
            </div>
          ))}
        </div>

        {/* Center column */}
        <div className="w-36 flex flex-col gap-2 text-xs px-1">
          <div className="border border-black rounded-sm p-2 text-center">
            <div className="font-bold uppercase text-[10px] mb-1">Company Commander</div>
            <div>{leaderLine(data.company_commander)}</div>
          </div>
          <div className="border border-black rounded-sm p-2 text-center">
            <div className="font-bold uppercase text-[10px] mb-1">1SG</div>
            <div>{leaderLine(data.first_sergeant)}</div>
          </div>
          {Array.from({ length: Math.max(0, maxRows - left.length - 2) }).map((_, i) => (
            <div key={`vacant-${i}`} className="border border-dashed border-gray-400 rounded-sm p-2 text-center text-gray-500">
              Vacant
            </div>
          ))}
        </div>

        {/* Right bank */}
        <div className="space-y-1">
          {right.map((room) => (
            <div key={room.id} className="border border-black rounded-sm p-1 text-xs print-room-cell">
              <div className="text-center truncate">{formatRoomOccupant(room, 'top')}</div>
              <div className="text-center font-bold text-sm py-0.5">{formatRoomHallwayLabel(room)}</div>
              <div className="text-center truncate">{formatRoomOccupant(room, 'bottom')}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center font-bold text-sm mt-4 uppercase tracking-widest border border-black py-1">
        Stairwell
      </div>
    </div>
  )
}

/** Interactive hallway grid (screen view) */
export function HallwayGrid({ data }: { data: HallwayFloorData }) {
  const { left, right } = splitHallwayBanks(data.rooms, data.company_letter)
  const oddsOnLeft = data.company_letter === 'B' || data.company_letter === 'C'
  const leftLabel = oddsOnLeft ? 'Left bank (odd)' : 'Left bank (even)'
  const rightLabel = oddsOnLeft ? 'Right bank (even)' : 'Right bank (odd)'

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4">
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide text-center lg:text-left">{leftLabel}</p>
        {left.map((room) => (
          <RoomCell key={room.id} room={room} />
        ))}
      </div>

      <div className="hidden lg:flex flex-col gap-3 w-44 text-sm">
        <div className="text-center font-bold uppercase tracking-wide text-muted-foreground border border-border rounded-md py-2">
          Main Ent.
        </div>
        <div className="bg-card border border-border rounded-md p-3 text-center">
          <div className="text-xs font-bold uppercase text-muted-foreground mb-1">Company Commander</div>
          <div>{leaderLine(data.company_commander)}</div>
        </div>
        <div className="bg-card border border-border rounded-md p-3 text-center">
          <div className="text-xs font-bold uppercase text-muted-foreground mb-1">1SG</div>
          <div>{leaderLine(data.first_sergeant)}</div>
        </div>
        <div className="text-center font-bold uppercase tracking-wide text-muted-foreground border border-border rounded-md py-2 mt-auto">
          Stairwell
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide text-center lg:text-right">{rightLabel}</p>
        {right.map((room) => (
          <RoomCell key={room.id} room={room} />
        ))}
      </div>
    </div>
  )
}
