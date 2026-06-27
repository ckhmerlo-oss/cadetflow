'use client'

import { useEffect, useState } from 'react'
import {
  getCategoryRestrictionPolicy,
  getCategoryRestrictionPolicyLog,
  updateCategoryRestrictionPolicy,
} from '@/app/lib/categoryRestrictions.server'
import type { SubmissionPermissionBand } from '@/app/lib/submissionPermissions'
import {
  getIncidentSubmissionPolicy,
  getIncidentSubmissionPolicyLog,
  updateIncidentSubmissionPolicy,
} from '@/app/lib/submissionPermissions.server'
import {
  formatAllowedCategoriesList,
  type CategoryRestrictionBand,
} from '@/app/lib/categoryRestrictions'
import { formatPolicyCategory, OFFENSE_CATEGORY_CONFIG } from '@/app/lib/blueBook'

const CATEGORY_OPTIONS = [1, 2, 3] as const

const DEFAULT_CATEGORY_BANDS: CategoryRestrictionBand[] = [
  { minRoleLevel: 20, allowedCategories: [1] },
  { minRoleLevel: 65, allowedCategories: [1, 2, 3] },
]

const DEFAULT_INCIDENT_BANDS: SubmissionPermissionBand[] = [
  { minRoleLevel: 20, allowed: true },
]

function bandDescription(minRoleLevel: number): string {
  if (minRoleLevel >= 65) {
    return 'Company TAC and Commandant authority (level 65+)'
  }
  if (minRoleLevel >= 20) {
    return 'Cadet chain and Faculty (level 20–64)'
  }
  if (minRoleLevel >= 15) {
    return 'Cadet leaders (level 15–19)'
  }
  return `Role level ${minRoleLevel}+`
}

export default function CategoryRestrictionsTab() {
  const [bands, setBands] = useState<CategoryRestrictionBand[]>(DEFAULT_CATEGORY_BANDS)
  const [incidentBands, setIncidentBands] = useState<SubmissionPermissionBand[]>(DEFAULT_INCIDENT_BANDS)
  const [auditLog, setAuditLog] = useState<
    Array<{ id: string; created_at: string; old_policy: unknown; new_policy: unknown }>
  >([])
  const [incidentAuditLog, setIncidentAuditLog] = useState<
    Array<{ id: string; created_at: string; old_policy: unknown; new_policy: unknown }>
  >([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingIncidents, setSavingIncidents] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [policyResult, log, incidentPolicy, incidentLog] = await Promise.all([
        getCategoryRestrictionPolicy(),
        getCategoryRestrictionPolicyLog(10),
        getIncidentSubmissionPolicy(),
        getIncidentSubmissionPolicyLog(10),
      ])
      if (policyResult.error) setError(policyResult.error)
      else if (policyResult.policy.length > 0) setBands(policyResult.policy)
      if (incidentPolicy.length > 0) setIncidentBands(incidentPolicy)
      setAuditLog(log as typeof auditLog)
      setIncidentAuditLog(incidentLog as typeof incidentAuditLog)
      setLoading(false)
    }
    load()
  }, [])

  const toggleCategory = (bandIndex: number, category: number) => {
    setBands((prev) =>
      prev.map((band, index) => {
        if (index !== bandIndex) return band
        const hasCategory = band.allowedCategories.includes(category)
        const nextCategories = hasCategory
          ? band.allowedCategories.filter((c) => c !== category)
          : [...band.allowedCategories, category].sort((a, b) => a - b)
        return { ...band, allowedCategories: nextCategories }
      })
    )
  }

  const updateMinRoleLevel = (bandIndex: number, value: string) => {
    const parsed = parseInt(value, 10)
    if (Number.isNaN(parsed) || parsed < 0) return
    setBands((prev) =>
      prev.map((band, index) =>
        index === bandIndex ? { ...band, minRoleLevel: parsed } : band
      )
    )
  }

  const updateIncidentMinRoleLevel = (bandIndex: number, value: string) => {
    const parsed = parseInt(value, 10)
    if (Number.isNaN(parsed) || parsed < 0) return
    setIncidentBands((prev) =>
      prev.map((band, index) =>
        index === bandIndex ? { ...band, minRoleLevel: parsed } : band
      )
    )
  }

  const toggleIncidentAllowed = (bandIndex: number) => {
    setIncidentBands((prev) =>
      prev.map((band, index) =>
        index === bandIndex ? { ...band, allowed: !band.allowed } : band
      )
    )
  }

  const addBand = () => {
    setBands((prev) => [...prev, { minRoleLevel: 0, allowedCategories: [1] }])
  }

  const addIncidentBand = () => {
    setIncidentBands((prev) => [...prev, { minRoleLevel: 0, allowed: false }])
  }

  const removeBand = (index: number) => {
    setBands((prev) => prev.filter((_, i) => i !== index))
  }

  const removeIncidentBand = (index: number) => {
    setIncidentBands((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSaveCategories = async () => {
    setSaving(true)
    setMessage(null)
    setError(null)

    const sorted = [...bands].sort((a, b) => a.minRoleLevel - b.minRoleLevel)
    if (sorted.some((band, index) => index > 0 && band.minRoleLevel === sorted[index - 1].minRoleLevel)) {
      setError('Each demerit band must have a unique minimum role level.')
      setSaving(false)
      return
    }
    if (sorted.some((band) => band.allowedCategories.length === 0)) {
      setError('Each demerit band must allow at least one category.')
      setSaving(false)
      return
    }

    const result = await updateCategoryRestrictionPolicy(sorted)
    setSaving(false)

    if (result.error) {
      setError(result.error)
      return
    }

    if (result.policy) setBands(result.policy)
    setAuditLog(await getCategoryRestrictionPolicyLog(10) as typeof auditLog)
    setMessage('Demerit Report category policy saved.')
  }

  const handleSaveIncidents = async () => {
    setSavingIncidents(true)
    setMessage(null)
    setError(null)

    const sorted = [...incidentBands].sort((a, b) => a.minRoleLevel - b.minRoleLevel)
    if (sorted.some((band, index) => index > 0 && band.minRoleLevel === sorted[index - 1].minRoleLevel)) {
      setError('Each incident band must have a unique minimum role level.')
      setSavingIncidents(false)
      return
    }

    const result = await updateIncidentSubmissionPolicy(sorted)
    setSavingIncidents(false)

    if (result.error) {
      setError(result.error)
      return
    }

    if (result.policy) setIncidentBands(result.policy)
    setIncidentAuditLog(await getIncidentSubmissionPolicyLog(10) as typeof incidentAuditLog)
    setMessage('Incident Report submission policy saved.')
  }

  if (loading) {
    return <p className="text-muted-foreground">Loading submission policy...</p>
  }

  return (
    <div className="space-y-8">
      <section className="bg-card border border-border p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-semibold text-foreground border-b border-border pb-4 mb-4">
          Submission Policy
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          School-wide defaults for the unified <code className="text-xs">/submit</code> hub.
          Company TAC overrides are planned for Day 12.4.
        </p>

        <h3 className="text-lg font-semibold text-foreground mb-4">Demerit Report Categories</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Control which stick categories each role band may submit on the Demerit tab.
        </p>

        <div className="space-y-4">
          {bands.map((band, index) => (
            <div
              key={`cat-${band.minRoleLevel}-${index}`}
              className="border border-border rounded-lg p-4 space-y-3 bg-background/50"
            >
              <div className="flex flex-wrap items-end gap-4 justify-between">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Minimum role level
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={band.minRoleLevel}
                    onChange={(e) => updateMinRoleLevel(index, e.target.value)}
                    className="input-base w-32"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {bandDescription(band.minRoleLevel)}
                  </p>
                </div>
                {bands.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeBand(index)}
                    className="text-sm text-destructive hover:underline"
                  >
                    Remove band
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                {CATEGORY_OPTIONS.map((category) => {
                  const config = OFFENSE_CATEGORY_CONFIG[String(category === 1 ? '1' : category === 2 ? '2a' : '3a')]
                  const checked = band.allowedCategories.includes(category)
                  return (
                    <label
                      key={category}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md border cursor-pointer ${
                        checked ? config?.color ?? 'border-primary' : 'border-border opacity-70'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleCategory(index, category)}
                      />
                      <span className="text-sm font-medium">{formatPolicyCategory(category)}</span>
                    </label>
                  )
                })}
              </div>

              <p className="text-xs text-muted-foreground">
                Allows {formatAllowedCategoriesList(band.allowedCategories)} Demerit Reports
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 mt-6">
          <button type="button" onClick={addBand} className="btn-secondary">
            Add demerit band
          </button>
          <button type="button" onClick={handleSaveCategories} disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save demerit categories'}
          </button>
        </div>
      </section>

      <section className="bg-card border border-border p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-foreground mb-4">Incident Reports</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Control which role bands may file Incident Reports on the Incident tab (cadet chain default: level 20+).
        </p>

        <div className="space-y-4">
          {incidentBands.map((band, index) => (
            <div
              key={`inc-${band.minRoleLevel}-${index}`}
              className="border border-border rounded-lg p-4 space-y-3 bg-background/50"
            >
              <div className="flex flex-wrap items-end gap-4 justify-between">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Minimum role level
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={band.minRoleLevel}
                    onChange={(e) => updateIncidentMinRoleLevel(index, e.target.value)}
                    className="input-base w-32"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {bandDescription(band.minRoleLevel)}
                  </p>
                </div>
                {incidentBands.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeIncidentBand(index)}
                    className="text-sm text-destructive hover:underline"
                  >
                    Remove band
                  </button>
                )}
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={band.allowed}
                  onChange={() => toggleIncidentAllowed(index)}
                />
                <span className="text-sm font-medium">Allow Incident Reports</span>
              </label>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 mt-6">
          <button type="button" onClick={addIncidentBand} className="btn-secondary">
            Add incident band
          </button>
          <button type="button" onClick={handleSaveIncidents} disabled={savingIncidents} className="btn-primary">
            {savingIncidents ? 'Saving...' : 'Save incident policy'}
          </button>
        </div>

        {message && (
          <p className="mt-4 text-sm text-green-600 dark:text-green-400">{message}</p>
        )}
        {error && (
          <p className="mt-4 text-sm text-destructive bg-destructive/10 p-2 rounded border border-destructive/20">
            {error}
          </p>
        )}
      </section>

      <section className="bg-card border border-border p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-foreground mb-4">Recent policy changes</h3>
        {auditLog.length === 0 && incidentAuditLog.length === 0 ? (
          <p className="text-sm text-muted-foreground">No policy changes recorded yet.</p>
        ) : (
          <ul className="space-y-3">
            {[...auditLog.map(e => ({ ...e, kind: 'Demerit categories' })), ...incidentAuditLog.map(e => ({ ...e, kind: 'Incident submission' }))]
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .slice(0, 10)
              .map((entry) => (
                <li key={entry.id} className="text-sm border border-border rounded-md p-3">
                  <p className="text-muted-foreground">
                    {new Date(entry.created_at).toLocaleString()}
                  </p>
                  <p className="mt-1 text-foreground">{entry.kind} policy updated</p>
                </li>
              ))}
          </ul>
        )}
      </section>
    </div>
  )
}
