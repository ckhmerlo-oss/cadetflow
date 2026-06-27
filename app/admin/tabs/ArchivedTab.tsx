'use client'

import { createClient } from '@/utils/supabase/client'
import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import SearchableSelect from '@/app/components/SearchableSelect'
import { toggleUserArchiveStatus } from '../actions'
import { reactivateCadets } from '@/app/oversight/actions'

type DepartureClassification = 'non_return' | 'withdrawn' | 'suspended' | 'dismissal'

type UserProfile = {
  id: string
  first_name: string
  last_name: string
  email: string
  company_name?: string
  role_name?: string
  departure_classification?: string | null
}

type Company = { id: string; company_name: string }
type Role = { id: string; role_name: string; default_role_level: number; company_id: string | null }

const CLASSIFICATION_OPTIONS: { value: DepartureClassification; label: string; description: string }[] = [
  { value: 'withdrawn', label: 'Withdrawn', description: 'Left voluntarily during the school year.' },
  { value: 'suspended', label: 'Suspended', description: 'Suspended pending final disposition; must be resolved before year close.' },
  { value: 'dismissal', label: 'Dismissal', description: 'Dismissed from the program.' },
  { value: 'non_return', label: 'Non-return', description: 'Not returning next year (known departure).' },
]

const CLASSIFICATION_BADGE: Record<string, string> = {
  non_return: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-200',
  withdrawn: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200',
  suspended: 'bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-200',
  dismissal: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200',
}

export default function ArchivedTab() {
  const supabase = createClient()
  const [activeUsers, setActiveUsers] = useState<UserProfile[]>([])
  const [archivedUsers, setArchivedUsers] = useState<UserProfile[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  
  const [selectedUserId, setSelectedUserId] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [archiveModalOpen, setArchiveModalOpen] = useState(false)
  const [departureClassification, setDepartureClassification] = useState<DepartureClassification>('withdrawn')
  const [reactivateId, setReactivateId] = useState<string | null>(null)
  const [reactivateCompanyId, setReactivateCompanyId] = useState('')
  const [reactivateRoleId, setReactivateRoleId] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    
    const [activeRes, archivedRes, companiesRes, rolesRes] = await Promise.all([
      supabase.from('profiles').select(`
        id, first_name, last_name, email,
        company:companies(company_name),
        role:roles(role_name)
      `).eq('archived', false).order('last_name'),
      supabase.from('cadet_profile_view').select('id, first_name, last_name, departure_classification')
        .eq('archived', true).order('last_name'),
      supabase.from('companies').select('*').order('company_name'),
      supabase.from('roles').select('*').order('default_role_level', { ascending: false }),
    ])

    if (activeRes.data) {
      setActiveUsers(activeRes.data.map((p: any) => ({
        id: p.id,
        first_name: p.first_name,
        last_name: p.last_name,
        email: p.email,
        company_name: p.company?.company_name,
        role_name: p.role?.role_name
      })))
    }

    if (archivedRes.data) {
      const ids = archivedRes.data.map((p: { id: string }) => p.id)
      const { data: emails } = ids.length
        ? await supabase.from('profiles').select('id, email').in('id', ids)
        : { data: [] as { id: string; email: string }[] }
      const emailMap = new Map((emails ?? []).map((e) => [e.id, e.email]))
      setArchivedUsers(archivedRes.data.map((p: any) => ({
        id: p.id,
        first_name: p.first_name,
        last_name: p.last_name,
        email: emailMap.get(p.id) ?? '',
        departure_classification: p.departure_classification,
      })))
    }
    if (companiesRes.data) setCompanies(companiesRes.data)
    if (rolesRes.data) setRoles(rolesRes.data as Role[])

    setLoading(false)
  }

  const searchOptions = useMemo(() => {
    return activeUsers.map(u => ({
      id: u.id,
      label: `${u.last_name}, ${u.first_name} (${u.company_name || 'No Co.'})`
    }))
  }, [activeUsers])

  const cadetRoles = useMemo(
    () =>
      roles.filter(
        (r) =>
          r.default_role_level < 50 &&
          (reactivateCompanyId === '' || r.company_id === reactivateCompanyId || r.company_id === null)
      ),
    [roles, reactivateCompanyId]
  )

  const selectedUser = activeUsers.find(u => u.id === selectedUserId)

  const openArchiveModal = () => {
    if (!selectedUserId || !selectedUser) return
    setDepartureClassification('withdrawn')
    setArchiveModalOpen(true)
  }

  const handleArchive = async () => {
    if (!selectedUserId) return

    setIsProcessing(true)
    const res = await toggleUserArchiveStatus(selectedUserId, true, departureClassification)
    setIsProcessing(false)

    if (res.error) alert(res.error)
    else {
      setSelectedUserId('')
      setArchiveModalOpen(false)
      fetchData()
    }
  }

  const handleRestore = async (id: string, name: string) => {
    if (!confirm(`RESTORE ${name} to unassigned (no company/role)?\n\nUse "Reactivate for new year" to assign company/role and increment years attended.`)) return

    setIsProcessing(true)
    const res = await toggleUserArchiveStatus(id, false)
    setIsProcessing(false)

    if (res.error) alert(res.error)
    else fetchData()
  }

  const handleReactivateForYear = async () => {
    if (!reactivateId || !reactivateCompanyId || !reactivateRoleId) {
      alert('Select company and role for reactivation.')
      return
    }
    setIsProcessing(true)
    const res = await reactivateCadets([reactivateId], reactivateCompanyId, reactivateRoleId)
    setIsProcessing(false)
    if (res.error) {
      alert(res.error)
      return
    }
    if (res.count === 0) {
      alert('No cadets were reactivated. Verify the cadet is archived and you have permission for their company.')
      return
    }
    else {
      setReactivateId(null)
      setReactivateCompanyId('')
      setReactivateRoleId('')
      fetchData()
    }
  }

  if (loading) return <div className="p-8 text-muted-foreground">Loading users...</div>

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      <section className="bg-card border border-border p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-bold text-foreground mb-4">Archive User</h2>
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <SearchableSelect 
              label="Select Active User"
              options={searchOptions}
              value={selectedUserId}
              onChange={setSelectedUserId}
              placeholder="Search by name..."
            />
          </div>
          <button 
            onClick={openArchiveModal}
            disabled={isProcessing || !selectedUserId}
            className="w-full md:w-auto px-6 py-2 bg-destructive text-destructive-foreground font-medium rounded-md hover:bg-destructive/90 disabled:opacity-50 h-[42px] mb-[1px]"
          >
            Archive User
          </button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Archiving removes the user from active duty, requires a departure classification, and preserves history.
        </p>
      </section>

      <section className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/30">
          <h2 className="font-bold text-foreground">Archived Personnel ({archivedUsers.length})</h2>
        </div>
        
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase">Classification</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase">Email</th>
              <th className="px-6 py-3 text-right text-xs font-bold text-muted-foreground uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">
            {archivedUsers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-sm text-muted-foreground italic">
                  No archived users found.
                </td>
              </tr>
            ) : (
              archivedUsers.map(u => (
                <tr key={u.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-foreground">
                    <Link href={`/profile/${u.id}`} className="text-primary hover:underline">
                      {u.last_name}, {u.first_name}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    {u.departure_classification ? (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${CLASSIFICATION_BADGE[u.departure_classification] ?? 'bg-muted text-muted-foreground'}`}>
                        {u.departure_classification.replace('_', '-').toUpperCase()}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground font-mono">
                    {u.email}
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button 
                      onClick={() => setReactivateId(u.id)}
                      className="text-sm font-medium text-primary hover:underline disabled:opacity-50"
                      disabled={isProcessing}
                    >
                      Reactivate for new year
                    </button>
                    <button 
                      onClick={() => handleRestore(u.id, `${u.last_name}, ${u.first_name}`)}
                      className="text-sm font-medium text-green-600 hover:underline disabled:opacity-50"
                      disabled={isProcessing}
                    >
                      Restore (unassigned)
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      {archiveModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card border border-border rounded-lg shadow-lg max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-semibold text-foreground">
              Archive {selectedUser.last_name}, {selectedUser.first_name}
            </h3>
            <p className="text-sm text-muted-foreground">
              They will be hidden from rosters and unassigned from company and role. Select a departure classification:
            </p>
            <div className="space-y-2">
              {CLASSIFICATION_OPTIONS.map((opt) => (
                <label key={opt.value} className="flex items-start gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="departureClassification"
                    value={opt.value}
                    checked={departureClassification === opt.value}
                    onChange={() => setDepartureClassification(opt.value)}
                    className="mt-1"
                  />
                  <span>
                    <span className="font-medium">{opt.label}</span>
                    <span className="block text-muted-foreground text-xs">{opt.description}</span>
                  </span>
                </label>
              ))}
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setArchiveModalOpen(false)}
                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleArchive}
                disabled={isProcessing}
                className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md text-sm disabled:opacity-50"
              >
                {isProcessing ? 'Archiving…' : 'Confirm archive'}
              </button>
            </div>
          </div>
        </div>
      )}

      {reactivateId && (
        <section className="bg-card border border-primary/30 p-6 rounded-lg shadow-sm space-y-4">
          <h3 className="font-semibold text-foreground">Reactivate returner</h3>
          <p className="text-sm text-muted-foreground">Assigns company and role, increments years completed, and resets operational fields.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Company</label>
              <select
                value={reactivateCompanyId}
                onChange={(e) => {
                  setReactivateCompanyId(e.target.value)
                  setReactivateRoleId('')
                }}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select company</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.company_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Role</label>
              <select
                value={reactivateRoleId}
                onChange={(e) => setReactivateRoleId(e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select role</option>
                {cadetRoles.map((r) => (
                  <option key={r.id} value={r.id}>{r.role_name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleReactivateForYear}
              disabled={isProcessing}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm disabled:opacity-50"
            >
              Confirm reactivation
            </button>
            <button
              type="button"
              onClick={() => setReactivateId(null)}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        </section>
      )}

    </div>
  )
}
