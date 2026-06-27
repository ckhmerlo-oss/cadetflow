'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState, useTransition } from 'react'
import HallwayBuildingSheet from '../components/HallwayBuildingSheet'
import { HallwayAdminBar, buildRosterPanelProps } from '../components/RosterInfoPanel'
import {
  applyRosterMarks,
  clearRosterMarks,
  removeRosterMarks,
  type HallwayBuildingResult,
} from '../actions'
import { buildAccountabilityTagOptions, MANUAL_ROSTER_TAGS, ROSTER_TAG_NONE } from '../constants'
import { bunkSelectionKey, type HallwayBuildingData } from '../lib/hallway-layout'

type HallwayClientProps = {
  building: HallwayBuildingResult
  companies: Array<{ letter: string; name: string }>
  canEditNotes: boolean
  canManageMarks: boolean
  bunkOnlyView?: boolean
}

function parseSelectionKey(key: string): { profileId: string; bunk: 'top' | 'bottom' } | null {
  const idx = key.lastIndexOf(':')
  if (idx === -1) return null
  const profileId = key.slice(0, idx)
  const bunk = key.slice(idx + 1) as 'top' | 'bottom'
  if (bunk !== 'top' && bunk !== 'bottom') return null
  return { profileId, bunk }
}

function collectFloorBunkKeys(floor: HallwayBuildingData['floors'][1]): string[] {
  const keys: string[] = []
  for (const room of floor.rooms) {
    if (room.occupant_top) keys.push(bunkSelectionKey(room.occupant_top.id, 'top'))
    if (room.occupant_bottom) keys.push(bunkSelectionKey(room.occupant_bottom.id, 'bottom'))
  }
  return keys
}

export default function HallwayClient({
  building,
  companies,
  canEditNotes,
  canManageMarks,
  bunkOnlyView = false,
}: HallwayClientProps) {
  const router = useRouter()
  const [company, setCompany] = useState(building.company_letter)
  const [markingMode, setMarkingMode] = useState(false)
  const [selectedBunks, setSelectedBunks] = useState<Set<string>>(new Set())
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set())
  const [markNote, setMarkNote] = useState('')
  const [actionError, setActionError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setCompany(building.company_letter)
    setSelectedBunks(new Set())
    setSelectedTags(new Set())
  }, [building.company_letter])

  const applyCompany = () => {
    router.push(`/barracks/hallway?company=${company}`)
  }

  const printUrl = `/barracks/hallway/print?company=${company}`

  const tagOptions = useMemo(
    () => buildAccountabilityTagOptions(building.sport_codes),
    [building.sport_codes]
  )

  const bulkTagOptions = useMemo(() => {
    const sportTags = building.sport_codes.map((code) => ({ code, label: 'Sport' }))
    return [...MANUAL_ROSTER_TAGS, ...sportTags]
  }, [building.sport_codes])

  const selectedProfileIds = useMemo(() => {
    const ids = new Set<string>()
    for (const key of selectedBunks) {
      const parsed = parseSelectionKey(key)
      if (parsed) ids.add(parsed.profileId)
    }
    return [...ids]
  }, [selectedBunks])

  const toggleBunk = useCallback((key: string) => {
    setSelectedBunks((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }, [])

  const toggleTag = (code: string) => {
    setSelectedTags((prev) => {
      const next = new Set(prev)
      if (next.has(code)) next.delete(code)
      else next.add(code)
      return next
    })
  }

  const selectFloor = (floor: 1 | 2 | 3) => {
    setSelectedBunks(new Set(collectFloorBunkKeys(building.floors[floor])))
  }

  const runMarkAction = (action: () => Promise<{ error?: string; success?: boolean }>) => {
    setActionError(null)
    startTransition(async () => {
      const result = await action()
      if (result.error) {
        setActionError(result.error)
        return
      }
      setSelectedBunks(new Set())
      router.refresh()
    })
  }

  const handleApply = () => {
    if (!selectedProfileIds.length || !selectedTags.size) return
    runMarkAction(() =>
      applyRosterMarks(company, selectedProfileIds, [...selectedTags], markNote || null)
    )
  }

  const handleRemove = () => {
    if (!selectedProfileIds.length) return
    runMarkAction(() =>
      removeRosterMarks(
        company,
        selectedProfileIds,
        selectedTags.size ? [...selectedTags] : null
      )
    )
  }

  const handleClearSelected = () => {
    if (!selectedProfileIds.length) return
    runMarkAction(() => removeRosterMarks(company, selectedProfileIds, null))
  }

  const handleClearAllLv = () => {
    runMarkAction(() => clearRosterMarks(company, 'LV'))
  }

  const handleClearAllManual = () => {
    if (!confirm('Clear all manual marks for this company?')) return
    runMarkAction(() => clearRosterMarks(company, null))
  }

  const handleCellTagChange = useCallback(
    (profileId: string, tagCode: string) => {
      if (!canManageMarks) return
      setActionError(null)
      startTransition(async () => {
        const result =
          tagCode === ROSTER_TAG_NONE
            ? await removeRosterMarks(company, [profileId], null)
            : await applyRosterMarks(company, [profileId], [tagCode], null)
        if (result.error) {
          setActionError(result.error)
          return
        }
        router.refresh()
      })
    },
    [canManageMarks, company, router]
  )

  const rosterPanel = buildRosterPanelProps(building, building.sport_codes, canEditNotes)

  return (
    <>
      <style jsx global>{`
        @media print {
          body { background: white !important; color: black !important; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="no-print flex flex-wrap justify-between items-start gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Hallway View</h1>
          <p className="text-muted-foreground mt-1">
            All three floors mirror the physical barracks. Room numbers open the room page; names open profiles.
            {canManageMarks && ' Use the tag dropdown or bulk marking to track accountability.'}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={printUrl} className="btn-secondary text-sm">
            Print roster
          </Link>
        </div>
      </div>

      <div className="no-print mb-6 overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex flex-wrap items-end gap-3 border-b border-border bg-muted/25 px-4 py-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Company</label>
            <select
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="input-base min-w-[180px]"
            >
              {companies.map((c) => (
                <option key={c.letter} value={c.letter}>{c.name}</option>
              ))}
            </select>
          </div>
          <button type="button" onClick={applyCompany} className="btn-primary text-sm">
            Apply
          </button>
        </div>

        <div className="px-4 py-4">
          <HallwayAdminBar {...rosterPanel} />
        </div>

        {canManageMarks && (
          <div className="space-y-3 border-t border-border bg-muted/15 px-4 py-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mr-1">
                Accountability
              </span>
              <button
                type="button"
                onClick={() => setMarkingMode((v) => !v)}
                className={markingMode ? 'btn-primary text-sm' : 'btn-secondary text-sm'}
              >
                {markingMode ? 'Marking mode on' : 'Mark cadets'}
              </button>
              {markingMode && (
                <>
                  <span className="text-xs text-muted-foreground">
                    Click cadet rows to select · {selectedBunks.size} bunk(s) · {selectedProfileIds.length} cadet(s)
                  </span>
                  <button type="button" onClick={() => setSelectedBunks(new Set())} className="btn-secondary text-xs">
                    Clear selection
                  </button>
                  <span className="text-xs text-muted-foreground">Select floor:</span>
                  {([1, 2, 3] as const).map((f) => (
                    <button key={f} type="button" onClick={() => selectFloor(f)} className="btn-secondary text-xs">
                      F{f}
                    </button>
                  ))}
                </>
              )}
            </div>

            {markingMode && (
              <>
                <div className="flex flex-wrap gap-2">
                  {bulkTagOptions.map(({ code, label }) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => toggleTag(code)}
                      className={`text-xs px-2 py-1 rounded border ${
                        selectedTags.has(code)
                          ? 'border-primary bg-primary/10 text-primary font-semibold'
                          : 'border-border bg-background'
                      }`}
                      title={label}
                    >
                      {code}
                    </button>
                  ))}
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Tag note (optional, applied with tags)
                  </label>
                  <input
                    type="text"
                    value={markNote}
                    onChange={(e) => setMarkNote(e.target.value)}
                    className="input-base text-sm max-w-md"
                    placeholder="Freeform note for selected cadets..."
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleApply}
                    disabled={isPending || !selectedProfileIds.length || !selectedTags.size}
                    className="btn-primary text-sm disabled:opacity-50"
                  >
                    Apply tags
                  </button>
                  <button
                    type="button"
                    onClick={handleRemove}
                    disabled={isPending || !selectedProfileIds.length}
                    className="btn-secondary text-sm disabled:opacity-50"
                  >
                    Remove tags
                  </button>
                  <button
                    type="button"
                    onClick={handleClearSelected}
                    disabled={isPending || !selectedProfileIds.length}
                    className="btn-secondary text-sm disabled:opacity-50"
                  >
                    Clear selected marks
                  </button>
                  <button
                    type="button"
                    onClick={handleClearAllLv}
                    disabled={isPending}
                    className="btn-secondary text-sm disabled:opacity-50"
                  >
                    Clear all LV
                  </button>
                  <button
                    type="button"
                    onClick={handleClearAllManual}
                    disabled={isPending}
                    className="btn-secondary text-sm text-destructive disabled:opacity-50"
                  >
                    Clear all manual marks
                  </button>
                </div>
              </>
            )}

            {actionError && (
              <p className="text-sm text-destructive">{actionError}</p>
            )}
          </div>
        )}
      </div>

      <HallwayBuildingSheet
        building={building}
        interactive
        editableNotes={canEditNotes}
        markingMode={markingMode && canManageMarks}
        selectedBunks={selectedBunks}
        onToggleBunk={toggleBunk}
        sportCodes={building.sport_codes}
        tagOptions={tagOptions}
        canEditTags={canManageMarks}
        onTagChange={handleCellTagChange}
        bunkOnlyView={bunkOnlyView}
      />

      <div className="no-print mt-6 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded border border-green-500/40 bg-green-500/5" /> Full room
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded border border-amber-500/40 bg-amber-500/5" /> Partial
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded border border-border bg-muted/30" /> Vacant
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded border border-slate-500/40 bg-slate-500/10" /> Special purpose
        </span>
        <span className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500" /> Open work order
        </span>
      </div>
    </>
  )
}
