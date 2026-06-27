'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import SearchableSelect from '@/app/components/SearchableSelect'
import { formatDateTime } from '@/app/lib/utils'
import { searchCompanyCadets, type CompanyCadetOption } from '../actions'
import type { HallwayFloorData, HallwayLeader, RosterStats } from '../lib/hallway-layout'
import { formatLeaderLine } from '../lib/hallway-layout'
import { COMPANY_NAMES, ROSTER_TAG_LEGEND, ROSTER_TAG_NONE, ROSTER_TAG_VACANT, type CompanyLetter } from '../constants'

export type RosterPanelProps = {
  companyLetter: string
  companyName: string | null
  commander: HallwayLeader
  firstSergeant: HallwayLeader
  stats: RosterStats
  printDate?: string
  editable?: boolean
  printMode?: boolean
  sportCodes?: string[]
  plain?: boolean
}

function leaderLine(leader: HallwayLeader): string {
  return formatLeaderLine(leader)
}

const NOTES_KEY = (letter: string) => `barracks-roster-notes-${letter}`
const FLOOR_NOTES_KEY = (letter: string, floor: number) => `barracks-roster-notes-${letter}-floor-${floor}`
const FLOOR_PL_OVERRIDE_KEY = (letter: string, floor: number) => `barracks-roster-pl-override-${letter}-floor-${floor}`
const FLOOR_PSG_OVERRIDE_KEY = (letter: string, floor: number) => `barracks-roster-psg-override-${letter}-floor-${floor}`

function useLocalStorageField(key: string) {
  const [value, setValue] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') return
    setValue(localStorage.getItem(key) ?? '')
  }, [key])

  const save = (next: string) => {
    setValue(next)
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, next)
    }
  }

  return { value, save }
}

function useRosterNotes(companyLetter: string) {
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') return
    setNotes(localStorage.getItem(NOTES_KEY(companyLetter)) ?? '')
  }, [companyLetter])

  const saveNotes = (value: string) => {
    setNotes(value)
    if (typeof window !== 'undefined') {
      localStorage.setItem(NOTES_KEY(companyLetter), value)
    }
  }

  return { notes, saveNotes }
}

function useFloorNotes(companyLetter: string, floor: number) {
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') return
    setNotes(localStorage.getItem(FLOOR_NOTES_KEY(companyLetter, floor)) ?? '')
  }, [companyLetter, floor])

  const saveNotes = (value: string) => {
    setNotes(value)
    if (typeof window !== 'undefined') {
      localStorage.setItem(FLOOR_NOTES_KEY(companyLetter, floor), value)
    }
  }

  return { notes, saveNotes }
}

function panelBox(printMode: boolean, plain = false) {
  if (plain) return 'text-xs leading-snug'
  return printMode
    ? 'border border-black rounded-sm p-1.5 text-[9px] leading-snug'
    : 'border border-border rounded-md p-2 text-xs leading-snug bg-card'
}

function panelHeading(printMode: boolean, plain = false) {
  if (plain) return 'text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1.5'
  return printMode ? 'text-[8px] font-bold uppercase mb-0.5' : 'text-[10px] font-bold uppercase text-muted-foreground mb-1'
}

function adminSectionTitle(children: ReactNode) {
  return (
    <h3 className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-2">
      {children}
    </h3>
  )
}

function rosterUpdatedAt(printDate?: string) {
  return formatDateTime(printDate ?? new Date().toISOString())
}

export function RosterHeader({
  companyLetter,
  companyName,
  printDate,
  printMode = false,
}: Pick<RosterPanelProps, 'companyLetter' | 'companyName' | 'printDate' | 'printMode'>) {
  const displayName = companyName ?? COMPANY_NAMES[companyLetter as CompanyLetter] ?? companyLetter
  const updatedAt = rosterUpdatedAt(printDate)
  const box = panelBox(printMode)

  return (
    <header className={`${box} text-center`}>
      <div className={printMode ? 'text-[9px] font-bold uppercase' : 'text-sm font-bold'}>
        {displayName}
      </div>
      <div className={printMode ? 'text-[8px] font-semibold' : 'text-xs'}>
        Room Roster
      </div>
      <div className={`${printMode ? 'text-[7px]' : 'text-[10px]'} mt-0.5 opacity-80`}>
        Updated {updatedAt}
      </div>
    </header>
  )
}

export function RosterLeadership({
  commander,
  firstSergeant,
  printMode = false,
}: Pick<RosterPanelProps, 'commander' | 'firstSergeant' | 'printMode'>) {
  const box = panelBox(printMode)
  const heading = panelHeading(printMode)

  return (
    <>
      <div className={box}>
        <div className={heading}>Company Commander</div>
        <div>{leaderLine(commander)}</div>
      </div>
      <div className={box}>
        <div className={heading}>First Sergeant</div>
        <div>{leaderLine(firstSergeant)}</div>
      </div>
    </>
  )
}

export function RosterStatsBlock({ stats, printMode = false }: Pick<RosterPanelProps, 'stats' | 'printMode'>) {
  const box = panelBox(printMode)
  const heading = panelHeading(printMode)

  return (
    <>
      <div className={box}>
        <div className={heading}>Personnel Summary</div>
        <table className="w-full">
          <tbody>
            <tr><td className="pr-2">Company roster</td><td className="text-right font-medium">{stats.roster_total}</td></tr>
            <tr><td className="pr-2">In barracks</td><td className="text-right font-medium">{stats.in_barracks}</td></tr>
            <tr><td className="pr-2">Off-campus / day</td><td className="text-right font-medium">{stats.off_campus}</td></tr>
            <tr><td className="pr-2">Sports (in season)</td><td className="text-right font-medium">{stats.sports}</td></tr>
            <tr><td className="pr-2">Band</td><td className="text-right font-medium">{stats.band}</td></tr>
            <tr><td className="pr-2">Vacant bunks</td><td className="text-right font-medium">{stats.vacant_bunks}</td></tr>
          </tbody>
        </table>
      </div>
      <div className={box}>
        <div className={heading}>By Floor</div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-current/20">
              <th className="text-left font-bold">Fl</th>
              <th className="text-right font-bold">Asgn</th>
              <th className="text-right font-bold">Vac</th>
            </tr>
          </thead>
          <tbody>
            {([1, 2, 3] as const).map((f) => (
              <tr key={f}>
                <td>{f}</td>
                <td className="text-right">{stats.by_floor[f].assigned}</td>
                <td className="text-right">{stats.by_floor[f].vacant_bunks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export function RosterTagLegend({
  printMode = false,
  sportCodes = [],
}: Pick<RosterPanelProps, 'printMode' | 'sportCodes'>) {
  const box = panelBox(printMode)
  const heading = panelHeading(printMode)
  const sportLegend = sportCodes.map((code) => ({ code, label: 'Sport' }))

  return (
    <div className={box}>
      <div className={heading}>Tag Legend</div>
      <div className={`flex flex-wrap gap-x-2 gap-y-0.5 ${printMode ? 'text-[8px]' : ''}`}>
        {[
          { code: ROSTER_TAG_NONE, label: 'Present' },
          { code: ROSTER_TAG_VACANT, label: 'Vacant bunk' },
          ...ROSTER_TAG_LEGEND,
          ...sportLegend,
        ].map(({ code, label }) => (
          <span key={code}><strong>{code}</strong> {label}</span>
        ))}
      </div>
    </div>
  )
}

export function FloorPlatoonLeaders({
  data,
  editable = false,
  printMode = false,
}: {
  data: HallwayFloorData
  editable?: boolean
  printMode?: boolean
}) {
  const rolePl = data.platoon_leader
  const rolePsg = data.platoon_sergeant
  const plOverrideKey = FLOOR_PL_OVERRIDE_KEY(data.company_letter, data.floor)
  const psgOverrideKey = FLOOR_PSG_OVERRIDE_KEY(data.company_letter, data.floor)
  const { value: plOverrideId, save: savePlOverride } = useLocalStorageField(plOverrideKey)
  const { value: psgOverrideId, save: savePsgOverride } = useLocalStorageField(psgOverrideKey)
  const [cadets, setCadets] = useState<CompanyCadetOption[]>([])

  useEffect(() => {
    if (!data.company_id) return
    searchCompanyCadets('', data.company_id).then(setCadets)
  }, [data.company_id])

  const cadetOptions = useMemo(
    () => cadets.map((c) => ({ id: c.id, label: c.label })),
    [cadets]
  )

  const cadetById = useMemo(() => {
    const map = new Map<string, HallwayLeader>()
    for (const c of cadets) {
      map.set(c.id, {
        id: c.id,
        first_name: c.first_name,
        last_name: c.last_name,
        cadet_rank: c.cadet_rank,
      })
    }
    if (rolePl) map.set(rolePl.id, rolePl)
    if (rolePsg) map.set(rolePsg.id, rolePsg)
    return map
  }, [cadets, rolePl, rolePsg])

  const resolveLeader = (roleDefault: HallwayLeader, overrideId: string): HallwayLeader => {
    if (overrideId && cadetById.has(overrideId)) {
      return cadetById.get(overrideId) ?? null
    }
    return roleDefault
  }

  const displayPl = resolveLeader(rolePl, plOverrideId)
  const displayPsg = resolveLeader(rolePsg, psgOverrideId)
  const selectPlValue = plOverrideId || rolePl?.id || ''
  const selectPsgValue = psgOverrideId || rolePsg?.id || ''

  const handlePlChange = (id: string) => {
    if (!id || id === rolePl?.id) savePlOverride('')
    else savePlOverride(id)
  }

  const handlePsgChange = (id: string) => {
    if (!id || id === rolePsg?.id) savePsgOverride('')
    else savePsgOverride(id)
  }

  const headingClass = printMode
    ? 'text-[7px] font-bold uppercase leading-tight mb-0.5'
    : 'text-[10px] font-bold uppercase text-muted-foreground mb-1'
  const cellClass = printMode
    ? 'border border-black rounded-none p-[3px] text-[8px] leading-snug bg-white min-w-0'
    : 'border border-border rounded-md p-1.5 text-xs bg-card/50 min-w-0'

  const renderSlot = (
    title: string,
    display: HallwayLeader,
    selectValue: string,
    onChange: (id: string) => void
  ) => (
    <div className={cellClass}>
      <div className={headingClass}>{title}</div>
      {editable && !printMode ? (
        <div className="[&_input]:py-1 [&_input]:text-xs [&_input]:min-h-0">
          <SearchableSelect
            label=""
            options={cadetOptions}
            value={selectValue}
            onChange={onChange}
            placeholder="Search cadets..."
          />
        </div>
      ) : (
        <div className={`truncate ${!display ? 'opacity-50 italic' : ''}`}>
          {formatLeaderLine(display)}
        </div>
      )}
    </div>
  )

  return (
    <div className={`grid grid-cols-2 gap-1 mb-1 ${printMode ? '' : 'mt-1'}`}>
      {renderSlot('Platoon Leader', displayPl, selectPlValue, handlePlChange)}
      {renderSlot('Platoon Sergeant', displayPsg, selectPsgValue, handlePsgChange)}
    </div>
  )
}

export function FloorNotesInline({
  companyLetter,
  floor,
  editable = false,
  printMode = false,
  embedded = false,
}: {
  companyLetter: string
  floor: number
  editable?: boolean
  printMode?: boolean
  /** When true in print mode, sits flush under bathroom with no top margin. */
  embedded?: boolean
}) {
  const { notes, saveNotes } = useFloorNotes(companyLetter, floor)
  const heading = panelHeading(printMode)

  const printRootClass = embedded
    ? 'shrink-0 border border-black rounded-none p-[3px] text-[8px] leading-snug bg-white flex flex-col min-h-[0.65in]'
    : 'mt-1 shrink-0 border border-black rounded-none p-[3px] text-[8px] leading-snug bg-white flex flex-col min-h-[0.65in]'

  return (
    <div className={printMode ? printRootClass : 'mt-2 border border-border rounded-md p-1.5 text-xs bg-card/50'}>
      <div className={heading}>Floor {floor} Notes</div>
      {editable && !printMode ? (
        <textarea
          value={notes}
          onChange={(e) => saveNotes(e.target.value)}
          rows={2}
          className="w-full text-xs bg-background border border-input rounded p-1 min-h-[2rem] resize-y"
          placeholder={`Notes for floor ${floor}...`}
        />
      ) : (
        <div
          className={`flex-1 min-h-[0.45in] whitespace-pre-wrap overflow-hidden ${!notes ? 'opacity-50 italic' : ''}`}
        >
          {notes || '—'}
        </div>
      )}
    </div>
  )
}

export function RosterNotesFloorBlock({
  companyLetter,
  editable = false,
  printMode = false,
}: Pick<RosterPanelProps, 'companyLetter' | 'editable' | 'printMode'>) {
  const { notes, saveNotes } = useRosterNotes(companyLetter)
  const heading = printMode ? 'text-[9px] font-bold uppercase border-b border-black pb-0.5 mb-1' : 'text-sm font-semibold text-foreground mb-2'

  const rootClass = printMode
    ? 'flex-1 flex flex-col border border-black p-[3px] bg-white box-border min-w-0 min-h-0 overflow-hidden mt-1'
    : 'w-full border border-border rounded-lg p-2 bg-card/30'

  return (
    <div className={rootClass}>
      <div className={heading}>Notes</div>
      {editable && !printMode ? (
        <textarea
          value={notes}
          onChange={(e) => saveNotes(e.target.value)}
          rows={4}
          className="w-full flex-1 text-xs bg-background border border-input rounded p-1.5 min-h-[4rem] resize-y"
          placeholder="Company-wide notes (saved locally, included when printing)..."
        />
      ) : (
        <div className={`flex-1 whitespace-pre-wrap ${printMode ? 'text-[8px] leading-snug' : 'text-xs'} ${!notes ? 'opacity-50 italic' : ''}`}>
          {notes || '—'}
        </div>
      )}
    </div>
  )
}

export function RosterNotes({
  companyLetter,
  editable = false,
  printMode = false,
  plain = false,
}: Pick<RosterPanelProps, 'companyLetter' | 'editable' | 'printMode' | 'plain'>) {
  const { notes, saveNotes } = useRosterNotes(companyLetter)
  const box = panelBox(printMode, plain)
  const heading = panelHeading(printMode, plain)

  return (
    <div className={box}>
      {!plain && <div className={heading}>Notes</div>}
      {editable && !printMode ? (
        <textarea
          value={notes}
          onChange={(e) => saveNotes(e.target.value)}
          rows={plain ? 3 : 4}
          className="w-full text-xs bg-background border border-input rounded-md p-2 min-h-[3rem] resize-y"
          placeholder="Company-wide notes (saved locally, included when printing)..."
        />
      ) : (
        <div className={`whitespace-pre-wrap min-h-[2em] ${!notes ? 'opacity-50 italic' : ''}`}>
          {notes || '—'}
        </div>
      )}
    </div>
  )
}

/** Stacked panel for print sidebar. */
export default function RosterInfoPanel(props: RosterPanelProps) {
  const gap = props.printMode ? 'gap-0.5' : 'gap-2'

  return (
    <div className={`flex flex-col ${gap}`}>
      <RosterHeader {...props} />
      <RosterLeadership {...props} />
      <RosterStatsBlock {...props} />
      <RosterTagLegend {...props} />
    </div>
  )
}

export function buildRosterPanelProps(
  building: Pick<
    import('../lib/hallway-layout').HallwayBuildingData,
    'company_letter' | 'company_name' | 'company_commander' | 'first_sergeant' | 'stats'
  >,
  sportCodes: string[] = [],
  editable = false,
  printMode = false
): RosterPanelProps {
  return {
    companyLetter: building.company_letter,
    companyName: building.company_name,
    commander: building.company_commander,
    firstSergeant: building.first_sergeant,
    stats: building.stats,
    editable,
    printMode,
    sportCodes,
  }
}

/** Structured roster summary for the hallway admin bar (screen only). */
export function HallwayAdminBar(props: RosterPanelProps) {
  const displayName = props.companyName ?? COMPANY_NAMES[props.companyLetter as CompanyLetter] ?? props.companyLetter
  const updatedAt = rosterUpdatedAt(props.printDate)
  const sportLegend = props.sportCodes?.map((code) => ({ code, label: 'Sport' })) ?? []
  const { stats } = props

  const statRow = (label: string, value: number) => (
    <tr key={label}>
      <td className="py-0.5 pr-4 text-muted-foreground">{label}</td>
      <td className="py-0.5 text-right font-medium tabular-nums">{value}</td>
    </tr>
  )

  return (
    <div className="space-y-5 text-xs">
      <header className="pb-4 border-b border-border">
        <p className="text-base font-semibold text-foreground">{displayName}</p>
        <p className="text-sm text-foreground/90 mt-0.5">Room Roster</p>
        <p className="text-[11px] text-muted-foreground mt-1">
          Updated {updatedAt}
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <section>
          {adminSectionTitle('Leadership')}
          <dl className="space-y-3">
            <div>
              <dt className="text-[10px] font-medium uppercase text-muted-foreground">Company Commander</dt>
              <dd className="mt-0.5 font-medium text-foreground">{leaderLine(props.commander)}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-medium uppercase text-muted-foreground">First Sergeant</dt>
              <dd className="mt-0.5 font-medium text-foreground">{leaderLine(props.firstSergeant)}</dd>
            </div>
          </dl>
        </section>

        <section>
          {adminSectionTitle('Personnel')}
          <div className="grid gap-4 sm:grid-cols-2">
            <table className="w-full">
              <tbody>
                {statRow('Company roster', stats.roster_total)}
                {statRow('In barracks', stats.in_barracks)}
                {statRow('Off-campus / day', stats.off_campus)}
                {statRow('Sports (in season)', stats.sports)}
                {statRow('Band', stats.band)}
                {statRow('Vacant bunks', stats.vacant_bunks)}
              </tbody>
            </table>
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-[10px] font-bold uppercase text-muted-foreground">
                  <th className="pb-1 text-left font-bold">Floor</th>
                  <th className="pb-1 text-right font-bold">Asgn</th>
                  <th className="pb-1 text-right font-bold">Vac</th>
                </tr>
              </thead>
              <tbody>
                {([1, 2, 3] as const).map((f) => (
                  <tr key={f}>
                    <td className="py-0.5">{f}</td>
                    <td className="py-0.5 text-right tabular-nums">{stats.by_floor[f].assigned}</td>
                    <td className="py-0.5 text-right tabular-nums">{stats.by_floor[f].vacant_bunks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          {adminSectionTitle('Tag Legend')}
          <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-[11px] leading-snug">
            {[
              { code: ROSTER_TAG_NONE, label: 'Present' },
              { code: ROSTER_TAG_VACANT, label: 'Vacant bunk' },
              ...ROSTER_TAG_LEGEND,
              ...sportLegend,
            ].map(({ code, label }) => (
              <span key={code} className="text-muted-foreground">
                <strong className="text-foreground">{code}</strong> {label}
              </span>
            ))}
          </div>
        </section>
      </div>

      {props.editable && (
        <section className="pt-4 border-t border-border">
          {adminSectionTitle('Notes')}
          <RosterNotes {...props} plain />
        </section>
      )}
    </div>
  )
}
