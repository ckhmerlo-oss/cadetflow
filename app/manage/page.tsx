'use client'

import { createClient } from '@/utils/supabase/client'
import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import RosterClient, { RosterCadet } from './RosterClient' 
import { EDIT_AUTHORIZED_ROLES } from '@/app/profile/constants' 
import { bulkAssignCompany, bulkAssignRole } from './actions'

// ... (Rest of imports and Types remain exactly the same)
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

type SortKey = 'name' | 'created_at' | 'company' | 'role'
type SortDirection = 'asc' | 'desc'

export default function ManagePage() {
  // ... (All State setup remains exactly the same)
  const supabase = createClient()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'roster' | 'faculty' | 'unassigned' | 'archived'>('roster')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [companies, setCompanies] = useState<Company[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [unassigned, setUnassigned] = useState<UnassignedUser[]>([]) 
  const [rosterData, setRosterData] = useState<RosterCadet[]>([])
  const [facultyData, setFacultyData] = useState<RosterCadet[]>([]) 
  const [archivedData, setArchivedData] = useState<RosterCadet[]>([])
  const [canEditProfiles, setCanEditProfiles] = useState(false)
  const [canManage, setCanManage] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  // *** NEW: State for Probation Access ***
  const [canViewProbation, setCanViewProbation] = useState(false)

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({ 
    key: 'created_at', 
    direction: 'desc' 
  })
  
  const [modalOpen, setModalOpen] = useState(false)
  const [targetCompanyId, setTargetCompanyId] = useState('')
  const [targetRoleId, setTargetRoleId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

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
        .select(`
           company:companies(id, company_name),
           role:role_id (role_name, default_role_level, can_manage_all_rosters, can_manage_own_company_roster)
        `)
        .eq('id', user.id)
        .eq('archived', false)
        .single()
      
      const roleData = viewerProfile?.role as any
      const roleName = roleData?.role_name || ''
      const roleLevel = roleData?.default_role_level || 0
      const canManageAll = roleData?.can_manage_all_rosters || false
      const canManageOwn = roleData?.can_manage_own_company_roster || false
      const isViewer = roleLevel >= 50 || canManageAll || canManageOwn;
      
      if (!isViewer) {
          setError("Unauthorized.");
          setLoading(false);
          return;
      }

      // *** UPDATE: Check Probation Permissions (Level 30+) ***
      setCanViewProbation(roleLevel >= 30);

      const viewerCompanyName = (viewerProfile?.company as any)?.company_name

      const isSiteAdmin = roleName === 'Admin' || roleLevel >= 90;
      setIsAdmin(isSiteAdmin);
      setCanEditProfiles(EDIT_AUTHORIZED_ROLES.includes(roleName) || roleName.includes('TAC') || isSiteAdmin)
      
      setCanManage(canManageAll || canManageOwn || isSiteAdmin)

      const promises = [
        supabase.from('companies').select('*').order('company_name'),
        supabase.from('roles').select('*').order('default_role_level', { ascending: false }),
        supabase.rpc('get_unassigned_users'), 
        supabase.rpc('get_full_roster') 
      ]

      if (isSiteAdmin) {
        promises.push(supabase.rpc('get_faculty_roster'))
      }

      const results = await Promise.all(promises)
      
      // ... (Rest of data handling remains exactly the same)
      const companiesRes = results[0]
      const rolesRes = results[1]
      const unassignedRes = results[2]
      const fullRosterRes = results[3]
      const facultyRes = isSiteAdmin ? results[4] : { data: [], error: null }

      if (companiesRes.data) setCompanies(companiesRes.data)
      if (rolesRes.data) setRoles(rolesRes.data)
      
      if (fullRosterRes.error) console.error("Error fetching roster:", fullRosterRes.error.message)
      else {
          let allCadets = fullRosterRes.data as RosterCadet[];
          if (!canManageAll && canManageOwn && viewerCompanyName) {
              allCadets = allCadets.filter(c => c.company_name === viewerCompanyName);
          }
          setRosterData(allCadets)
      }

      if (unassignedRes.error) console.error("Error fetching unassigned:", unassignedRes.error.message)
      else setUnassigned(unassignedRes.data as UnassignedUser[])

      if (facultyRes.error) console.error("Error fetching faculty:", facultyRes.error.message)
      else setFacultyData((facultyRes.data as any[] || []).map((f) => ({
        ...f,
        cadet_rank: f.staff_title,
        role_level: f.role_level,
      })))

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // ... (All Helper functions like handleSort, handleSelectRow, etc. remain the same)
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
    if (sortConfig.key !== column) return <span className="text-muted-foreground/30 ml-1">⇅</span>
    return <span className="text-primary ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
  }

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

  const getModalTitle = () => {
      if (selectedIds.size === 1) {
          const id = Array.from(selectedIds)[0];
          const u = unassigned.find(x => x.user_id === id) || rosterData.find(x => x.id === id) || facultyData.find(x => x.id === id);
          if (u) return `Re-Assign ${u.last_name}`;
      }
      return "Bulk Assignment";
  }

  const handleExport = () => {
    // 1. Determine which data to export based on the active tab
    let dataToExport: any[] = [];
    let filename = `roster_export_${new Date().toISOString().split('T')[0]}.csv`;

    // Define columns for the CSV
    // We'll map the raw data keys to nice Header Names
    let headers: string[] = [];
    let rowMapper: (item: any) => string[] = (item) => [];

    if (activeTab === 'roster' || activeTab === 'faculty' || activeTab === 'archived') {
        const sourceData = activeTab === 'roster' ? rosterData 
                         : activeTab === 'faculty' ? facultyData 
                         : archivedData;
        
        dataToExport = sourceData;
        filename = `${activeTab}_export.csv`;
        
        headers = ['Last Name', 'First Name', 'Rank', 'Company', 'Role', 'Email', 'Grade', 'Room', 'Term Demerits', 'Year Demerits', 'Penalty Tours Owed'];
        
        rowMapper = (item: RosterCadet) => [
            item.last_name,
            item.first_name,
            item.cadet_rank || '',
            item.company_name || '',
            item.role_name || '',
            item.email || '',
            item.grade_level || '',
            item.room_number || '',
            (item.term_demerits || 0).toString(),
            (item.year_demerits || 0).toString(),
            (item.current_tour_balance || 0).toString()
        ];
    } else if (activeTab === 'unassigned') {
        dataToExport = unassigned;
        filename = `unassigned_users.csv`;
        
        headers = ['Last Name', 'First Name', 'Date Joined', 'Pending Company', 'Pending Role'];
        
        rowMapper = (item: UnassignedUser) => [
            item.last_name,
            item.first_name,
            new Date(item.created_at).toLocaleDateString(),
            item.company_name || 'N/A',
            item.role_name || 'N/A'
        ];
    }

    if (dataToExport.length === 0) {
        alert("No data to export in the current view.");
        return;
    }

    // 2. Convert to CSV String
    const csvContent = [
        headers.join(','), // Header Row
        ...dataToExport.map(item => 
            rowMapper(item).map(field => {
                // Escape special characters (commas, quotes)
                const stringField = String(field || '');
                if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
                    return `"${stringField.replace(/"/g, '""')}"`;
                }
                return stringField;
            }).join(',')
        )
    ].join('\n');

    // 3. Trigger Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
    return <div className="max-w-7xl mx-auto p-8 text-center text-muted-foreground">Loading roster data...</div>
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
            <h1 className="text-3xl font-bold text-primary">Roster Management</h1>
            <p className="text-muted-foreground mt-1">Assign cadets to roles.</p>
          </div>

          <div className="flex gap-3">

            {/* --- NEW EXPORT BUTTON --- */}
             <button 
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-background border border-input rounded-md hover:bg-accent transition-colors font-medium shadow-sm text-foreground"
                title="Download current list as CSV"
             >
                <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Export CSV
             </button>

            {/* *** NEW: Link to Probation Page *** */}
            {canViewProbation && (
                <Link 
                  href="/manage/probation" 
                  className="flex items-center gap-2 px-4 py-2 bg-destructive/5 text-destructive border border-destructive/20 rounded-md hover:bg-destructive/10 transition-colors font-medium shadow-sm"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    Manage Probation
                </Link>
            )}

            <Link href="/manage/roles" className="btn-primary flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Configure Chain of Command
            </Link>
          </div>
        </div>
        
        {/* --- TABS --- */}
        <div id="tour-roster-filters" className="mb-6 border-b border-border no-print">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button 
                onClick={() => setActiveTab('roster')} 
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'roster' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            >
              Cadet Roster
            </button>
            
            {isAdmin && (
              <button 
                onClick={() => setActiveTab('faculty')} 
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'faculty' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
              >
                Faculty & Staff
              </button>
            )}

            <button 
                onClick={() => setActiveTab('unassigned')} 
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'unassigned' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            >
              Unassigned 
              <span className="ml-1.5 inline-block py-0.5 px-2 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">{unassigned.length}</span>
            </button>
          </nav>
        </div>
        
        {error && <div className="mb-6 p-4 text-center text-destructive bg-destructive/10 rounded-lg border border-destructive/20">Error: {error}</div>}

        {/* --- TAB 1: ROSTER --- */}
        <div id="printable-roster" className={activeTab === 'roster' ? '' : 'hidden'}>
          <div className="flex justify-end mb-4 no-print">
            <button onClick={handlePrintRoster} className="text-sm text-muted-foreground hover:text-primary underline">Print Roster</button>
          </div>
          <RosterClient initialData={rosterData} canEditProfiles={canEditProfiles} canManage={canManage} companies={companies} onReassign={handleReassign} variant="cadet" />
        </div>

        {/* --- TAB 2: FACULTY --- */}
        {isAdmin && (
          <div className={activeTab === 'faculty' ? '' : 'hidden'}>
             <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Restricted View:</strong> You are viewing the Faculty & Staff roster. This data is only visible to role level 90+.
                </p>
             </div>
             <RosterClient initialData={facultyData} canEditProfiles={canEditProfiles} canManage={canManage} companies={companies} onReassign={handleReassign} variant="faculty" />
          </div>
        )}

        {/* --- TAB 3: UNASSIGNED --- */}
        <div className={`no-print ${activeTab === 'unassigned' ? '' : 'hidden'}`}>
           <div className="bg-card shadow-sm border border-border rounded-lg overflow-hidden">
            <div className="p-4 border-b border-border flex flex-col sm:flex-row justify-between items-center gap-4 bg-muted/30">
              <div className="flex items-center gap-2">
                <input type="checkbox" className="rounded border-input text-primary focus:ring-primary" checked={unassigned.length > 0 && selectedIds.size === unassigned.length} onChange={handleSelectAll} />
                <span className="text-sm font-medium text-foreground">{selectedIds.size} selected</span>
              </div>
              <div className="flex gap-2">
                <button onClick={openModal} disabled={selectedIds.size === 0} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 shadow-sm flex items-center gap-2"><span>Assign Selected...</span></button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted/50">
                  <tr>
                    <th scope="col" className="w-12 px-6 py-3"></th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-accent hover:text-foreground" onClick={() => handleSort('name')}>Name <SortIcon column="name"/></th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-accent hover:text-foreground" onClick={() => handleSort('created_at')}>Date Joined <SortIcon column="created_at"/></th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-accent hover:text-foreground" onClick={() => handleSort('company')}>Company <SortIcon column="company"/></th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-accent hover:text-foreground" onClick={() => handleSort('role')}>Role <SortIcon column="role"/></th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {sortedUnassigned.length > 0 ? sortedUnassigned.map(u => (
                    <tr 
                        key={u.user_id} 
                        onClick={() => { setSelectedIds(new Set([u.user_id])); openModal(); }} 
                        className="hover:bg-accent transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" className="rounded border-input text-primary focus:ring-primary h-4 w-4" checked={selectedIds.has(u.user_id)} onChange={() => handleSelectRow(u.user_id)} onClick={(e) => e.stopPropagation()} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{u.last_name}, {u.first_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{u.company_name ? <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">{u.company_name}</span> : <span className="text-destructive text-xs italic">Unassigned</span>}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{u.role_name ? <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">{u.role_name}</span> : <span className="text-destructive text-xs italic">Unassigned</span>}</td>
                    </tr>
                  )) : <tr><td colSpan={5} className="px-6 py-10 text-center text-sm text-muted-foreground">No unassigned profiles found.</td></tr>}
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
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity" onClick={() => setModalOpen(false)}></div>
            <div className="relative inline-block align-bottom bg-card rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full border border-border">
              <div className="bg-card px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start mb-4">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-foreground" id="modal-title">
                        {getModalTitle()}
                    </h3>
                    <div className="mt-2"><p className="text-sm text-muted-foreground">Assigning {selectedIds.size} users. Leave a field blank to keep it unchanged.</p></div>
                  </div>
                </div>
                <div className="space-y-4 px-4 sm:px-0">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Company</label>
                    <select value={targetCompanyId} onChange={(e) => setTargetCompanyId(e.target.value)} className="input-base">
                      <option value="">-- No Change --</option>
                      {companies.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Role</label>
                    <select value={targetRoleId} onChange={(e) => handleRoleChange(e.target.value)} className="input-base">
                      <option value="">-- No Change --</option>
                      {availableRoles.map(r => <option key={r.id} value={r.id}>{r.role_name} (Lvl {r.default_role_level})</option>)}
                    </select>
                    {targetCompanyId && <p className="mt-1 text-xs text-muted-foreground">Showing only roles available for this company (and global roles).</p>}
                  </div>
                </div>
              </div>
              <div className="bg-muted/30 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-border">
                <button type="button" disabled={isSubmitting} onClick={handleSubmitAssignment} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">{isSubmitting ? 'Saving...' : 'Save Assignments'}</button>
                <button type="button" onClick={() => setModalOpen(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-input shadow-sm px-4 py-2 bg-background text-base font-medium text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}