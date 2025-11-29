'use client'

import { createClient } from '@/utils/supabase/client'
import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import RosterClient, { RosterCadet } from './RosterClient' 
import { EDIT_AUTHORIZED_ROLES } from '@/app/profile/constants' 
import { bulkAssignCompany, bulkAssignRole } from './actions'

// --- Types ---
type Company = { id: string; company_name: string }
type Role = { id: string; role_name: string; default_role_level: number; company_id: string | null }

type UnassignedUser = {
  user_id: string;
  first_name: string;
  last_name: string;
  created_at: string;
  company_id: string | null;
  company_name: string | null;
  role_id: string | null;
  role_name: string | null;
}

// Sort Configuration
type SortKey = 'name' | 'created_at' | 'company' | 'role'
type SortDirection = 'asc' | 'desc'

export default function ManagePage() {
  const supabase = createClient()
  const router = useRouter()
  
  // Added 'faculty' to tab state
  const [activeTab, setActiveTab] = useState<'roster' | 'faculty' | 'unassigned'>('roster')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Data State
  const [companies, setCompanies] = useState<Company[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [unassigned, setUnassigned] = useState<UnassignedUser[]>([]) 
  const [rosterData, setRosterData] = useState<RosterCadet[]>([])
  const [facultyData, setFacultyData] = useState<RosterCadet[]>([]) // New State
  
  // Permissions
  const [canEditProfiles, setCanEditProfiles] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false) // New State for 90+ check

  // Selection State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  
  // Sorting State
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({ 
    key: 'created_at', 
    direction: 'desc' 
  })
  
  // Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [targetCompanyId, setTargetCompanyId] = useState('')
  const [targetRoleId, setTargetRoleId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // --- 1. Extract Data Fetching Logic ---
  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        setError("You must be logged in.")
        return
      }

      const { data: viewerProfile } = await supabase
        .from('profiles')
        .select('role:role_id (role_name, default_role_level)')
        .eq('id', user.id)
        .single()
      
      const roleName = (viewerProfile?.role as any)?.role_name || ''
      const roleLevel = (viewerProfile?.role as any)?.default_role_level || 0
      
      const isSiteAdmin = roleName === 'Admin' || roleLevel >= 90;
      setIsAdmin(isSiteAdmin);
      setCanEditProfiles(EDIT_AUTHORIZED_ROLES.includes(roleName) || roleName.includes('TAC') || isSiteAdmin)

      // Build Promise Array
      const promises = [
        supabase.from('companies').select('*').order('company_name'),
        supabase.from('roles').select('*').order('default_role_level', { ascending: false }),
        supabase.rpc('get_unassigned_users'), 
        supabase.rpc('get_full_roster') 
      ]

      // Only fetch faculty if admin
      if (isSiteAdmin) {
        promises.push(supabase.rpc('get_faculty_roster'))
      }

      const results = await Promise.all(promises)
      
      const companiesRes = results[0]
      const rolesRes = results[1]
      const unassignedRes = results[2]
      const fullRosterRes = results[3]
      const facultyRes = isSiteAdmin ? results[4] : { data: [], error: null }

      if (companiesRes.data) setCompanies(companiesRes.data)
      if (rolesRes.data) setRoles(rolesRes.data)
      
      if (fullRosterRes.error) console.error("Error fetching roster:", fullRosterRes.error.message)
      else setRosterData(fullRosterRes.data as RosterCadet[])

      if (unassignedRes.error) console.error("Error fetching unassigned:", unassignedRes.error.message)
      else setUnassigned(unassignedRes.data as UnassignedUser[])

      if (facultyRes.error) console.error("Error fetching faculty:", facultyRes.error.message)
      else setFacultyData(facultyRes.data as RosterCadet[])

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // --- Sorting Logic ---
  const sortedUnassigned = useMemo(() => {
    const sorted = [...unassigned]
    sorted.sort((a, b) => {
      let valA: any = ''
      let valB: any = ''

      switch (sortConfig.key) {
        case 'name': valA = `${a.last_name}, ${a.first_name}`; valB = `${b.last_name}, ${b.first_name}`; break;
        case 'created_at': valA = new Date(a.created_at).getTime(); valB = new Date(b.created_at).getTime(); break;
        case 'company': valA = a.company_name || ''; valB = b.company_name || ''; break;
        case 'role': valA = a.role_name || ''; valB = b.role_name || ''; break;
      }

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
    return sorted
  }, [unassigned, sortConfig])

  const handleSort = (key: SortKey) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortConfig.key !== column) return <span className="text-gray-300 ml-1">⇅</span>
    return <span className="text-indigo-600 dark:text-indigo-400 ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
  }

  // --- Handlers ---

  const handlePrintRoster = () => window.print()

  const handleSelectRow = (id: string) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
    setSelectedIds(newSet)
  }

  const handleSelectAll = () => {
    if (selectedIds.size === unassigned.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(unassigned.map(u => u.user_id)))
    }
  }

  const handleReassign = (cadetId: string) => {
    setSelectedIds(new Set([cadetId]))
    openModal()
  }

  const openModal = () => {
    setTargetCompanyId('')
    setTargetRoleId('')
    setModalOpen(true)
  }

  const availableRoles = useMemo(() => {
    if (!targetCompanyId) return roles;
    return roles.filter(r => r.company_id === targetCompanyId || r.company_id === null)
  }, [roles, targetCompanyId])

  const handleRoleChange = (newRoleId: string) => {
    setTargetRoleId(newRoleId);
    if (!newRoleId) return;
    const selectedRole = roles.find(r => r.id === newRoleId);
    if (selectedRole && selectedRole.company_id) {
      setTargetCompanyId(selectedRole.company_id);
    }
  }

  const handleSubmitAssignment = async () => {
    if (!targetCompanyId && !targetRoleId) {
      alert("Please select at least a Company OR a Role to assign.")
      return
    }
    if (selectedIds.size === 0) return

    setIsSubmitting(true)
    const idsToUpdate = Array.from(selectedIds)
    
    const promises = []
    if (targetCompanyId) promises.push(bulkAssignCompany(idsToUpdate, targetCompanyId))
    if (targetRoleId) promises.push(bulkAssignRole(idsToUpdate, targetRoleId))

    const results = await Promise.all(promises)
    const errors = results.filter(r => r.error).map(r => r.error)

    if (errors.length > 0) {
      alert(`One or more errors occurred:\n${errors.join('\n')}`)
    } else {
      setSelectedIds(new Set())
      setModalOpen(false)
      await fetchData() 
    }
    setIsSubmitting(false)
  }

  if (loading && unassigned.length === 0 && rosterData.length === 0) {
    return <div className="max-w-7xl mx-auto p-8 text-center text-gray-500">Loading roster data...</div>
  }

  return (
    <>
      <style jsx global>{`
        @media print {
          body { background-color: white !important; color: black !important; }
          header, .no-print, div[aria-label="Tabs"] { display: none !important; }
          #printable-roster { display: block !important; visibility: visible !important; }
          body > div, body > main { display: block !important; visibility: visible !important; }
        }
      `}</style>
    
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 no-print">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Roster Management</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Assign cadets to roles.</p>
          </div>

          <Link href="/manage/roles" className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors font-medium shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Configure Chain of Command
          </Link>
        </div>
        
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700 no-print">
          <div id="tour-roster-filters" className="mb-6 border-b border-gray-200 dark:border-gray-700 no-print">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button onClick={() => setActiveTab('roster')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'roster' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>
              Cadet Roster
            </button>
            
            {/* ADMIN ONLY TAB */}
            {isAdmin && (
              <button onClick={() => setActiveTab('faculty')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'faculty' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                Faculty & Staff
              </button>
            )}

            <button onClick={() => setActiveTab('unassigned')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'unassigned' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>
              Unassigned 
              <span className="ml-1.5 inline-block py-0.5 px-2 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">{unassigned.length}</span>
            </button>
          </nav>
          </div>
        </div>
        
        {error && <div className="mb-6 p-4 text-center text-red-600 bg-red-50 rounded-lg border border-red-200">Error: {error}</div>}

        {/* --- TAB 1: ROSTER --- */}
        <div id="printable-roster" className={activeTab === 'roster' ? '' : 'hidden'}>
          <div className="flex justify-end mb-4 no-print">
            <button onClick={handlePrintRoster} className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 underline">Print Roster</button>
          </div>
          <RosterClient initialData={rosterData} canEditProfiles={canEditProfiles} companies={companies} onReassign={handleReassign} variant="cadet" />
        </div>

        {/* --- TAB 2: FACULTY (ADMIN ONLY) --- */}
        {isAdmin && (
          <div className={activeTab === 'faculty' ? '' : 'hidden'}>
             <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Restricted View:</strong> You are viewing the Faculty & Staff roster. This data is only visible to role level 90+.
                </p>
             </div>
             <RosterClient initialData={facultyData} canEditProfiles={canEditProfiles} companies={companies} onReassign={handleReassign} variant="faculty" />
          </div>
        )}

        {/* --- TAB 3: UNASSIGNED --- */}
        <div className={`no-print ${activeTab === 'unassigned' ? '' : 'hidden'}`}>
          <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50 dark:bg-gray-900/50">
              <div className="flex items-center gap-2">
                <input type="checkbox" className="rounded border-gray-300 dark:border-gray-600" checked={unassigned.length > 0 && selectedIds.size === unassigned.length} onChange={handleSelectAll} />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{selectedIds.size} selected</span>
              </div>
              <div className="flex gap-2">
                <button onClick={openModal} disabled={selectedIds.size === 0} className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 shadow-sm flex items-center gap-2"><span>Assign Selected...</span></button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th scope="col" className="w-12 px-6 py-3"></th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600" onClick={() => handleSort('name')}>Name <SortIcon column="name"/></th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600" onClick={() => handleSort('created_at')}>Date Joined <SortIcon column="created_at"/></th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600" onClick={() => handleSort('company')}>Company <SortIcon column="company"/></th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600" onClick={() => handleSort('role')}>Role <SortIcon column="role"/></th>
                    <th scope="col" className="px-6 py-3"><span className="sr-only">Action</span></th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {sortedUnassigned.length > 0 ? sortedUnassigned.map(u => (
                    <tr key={u.user_id} onClick={() => router.push(`/profile/${u.user_id}`)} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer">
                      <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" className="rounded border-gray-300 dark:border-gray-600 h-4 w-4 text-indigo-600" checked={selectedIds.has(u.user_id)} onChange={() => handleSelectRow(u.user_id)} onClick={(e) => e.stopPropagation()} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{u.last_name}, {u.first_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(u.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{u.company_name ? <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">{u.company_name}</span> : <span className="text-red-500 dark:text-red-400 text-xs italic">Unassigned</span>}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{u.role_name ? <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">{u.role_name}</span> : <span className="text-red-500 dark:text-red-400 text-xs italic">Unassigned</span>}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"><button onClick={(e) => { e.stopPropagation(); setSelectedIds(new Set([u.user_id])); openModal() }} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200">Edit</button></td>
                    </tr>
                  )) : <tr><td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">No unassigned profiles found.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      {/* --- ASSIGNMENT MODAL --- */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setModalOpen(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="relative inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start mb-4">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">Bulk Assignment</h3>
                    <div className="mt-2"><p className="text-sm text-gray-500 dark:text-gray-400">Assigning {selectedIds.size} users. Leave a field blank to keep it unchanged.</p></div>
                  </div>
                </div>
                <div className="space-y-4 px-4 sm:px-0">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company</label>
                    <select value={targetCompanyId} onChange={(e) => setTargetCompanyId(e.target.value)} className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                      <option value="">-- No Change --</option>
                      {companies.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                    <select value={targetRoleId} onChange={(e) => handleRoleChange(e.target.value)} className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                      <option value="">-- No Change --</option>
                      {availableRoles.map(r => <option key={r.id} value={r.id}>{r.role_name} (Lvl {r.default_role_level})</option>)}
                    </select>
                    {targetCompanyId && <p className="mt-1 text-xs text-gray-500">Showing only roles available for this company (and global roles).</p>}
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/30 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button type="button" disabled={isSubmitting} onClick={handleSubmitAssignment} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">{isSubmitting ? 'Saving...' : 'Save Assignments'}</button>
                <button type="button" onClick={() => setModalOpen(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}