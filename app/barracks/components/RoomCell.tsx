'use client'

import Link from 'next/link'
import {
  autoTagCodes,
  formatOccupantName,
  formatRoomHallwayLabel,
  roomOccupancyStatus,
  roomStatusClass,
  splitPurposeRoomLabels,
  type HallwayRoom,
} from '../lib/hallway-layout'

function formatOccupantSlot(room: HallwayRoom, bunk: 'top' | 'bottom') {
  const purposeLabels = splitPurposeRoomLabels(room)
  if (purposeLabels) {
    const label = bunk === 'top' ? purposeLabels.top : purposeLabels.bottom
    return label
  }
  const occupant = bunk === 'top' ? room.occupant_top : room.occupant_bottom
  const name = formatOccupantName(occupant)
  if (name === 'Vacant') return name
  const showMov = occupant?.pending_move_in || autoTagCodes(occupant).includes('MOV')
  return showMov ? `${name} MOV` : name
}

type RoomCellProps = {
  room: HallwayRoom
  compact?: boolean
}

export default function RoomCell({ room, compact = false }: RoomCellProps) {
  const status = roomOccupancyStatus(room)
  const hasOrders = room.open_work_orders > 0

  return (
    <Link
      href={`/barracks/rooms/${room.id}`}
      className={`block border rounded-md transition-colors hover:ring-2 hover:ring-primary/30 ${roomStatusClass(status)} ${compact ? 'p-1.5 text-xs' : 'p-2 text-sm'}`}
    >
      <div className={`truncate text-center ${compact ? 'text-[10px]' : 'text-xs'} text-muted-foreground`}>
        {formatOccupantSlot(room, 'top')}
      </div>
      <div className={`text-center font-bold ${compact ? 'text-sm py-0.5' : 'text-base py-1'}`}>
        {formatRoomHallwayLabel(room)}
        {hasOrders && (
          <span className="ml-1 inline-block w-2 h-2 rounded-full bg-orange-500" title={`${room.open_work_orders} open work order(s)`} />
        )}
      </div>
      <div className={`truncate text-center ${compact ? 'text-[10px]' : 'text-xs'} text-muted-foreground`}>
        {formatOccupantSlot(room, 'bottom')}
      </div>
    </Link>
  )
}
