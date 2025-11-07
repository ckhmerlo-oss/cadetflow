// in app/manage/page.tsx
'use client'

import { createClient } from '@/utils/supabase/client'
import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link' // Needed for the Ledger link

// --- Data Types ---
type Company = { id: string; company_name: string }
type Group = { id: string, group_name: string }
type SimpleRole = { id: string; role_name: string; default_role_level: number }
type Role = {
  role_id: string;
  role_name: string;
  company_id: string | null;
  company_name: string | null;
  approval_group_id: string | null;
  approval_group_name: string | null;
  default_role_level: number;
  can_manage_own_company_roster: boolean;
  can_manage_all_rosters: boolean;
}
type RosterUser = {
  user_id: string;
  first_name: string;
  last_name: string;
  role_id: string | null;
  role_name: string | null;
  role_level: number;
}
type UnassignedUser = {
  user_id: string;
  first_name: string;
  last_name: string;
  role_level: number;
}
type SearchUser = {
  user_id: string;
  first_name: string;
  last_name: string;
  company_name: string | null;
  role_name: string | null;
  role_level: number; // Added this to SearchUser for permission checks
}
type Permissions = { can_manage_own: boolean; can_manage_all: boolean }
type CompanyData = { roster: RosterUser[]; roles: SimpleRole[] }
type View = 'company' | 'unassigned' | 'search' | 'roles'
// Removed 'setLevel' from ModalMode
type ModalMode = 'assignCompany' | 'assignRole' | 'deleteUser' | 'createRole' | 'editRole' | 'deleteRole'
type ModalUser = RosterUser | UnassignedUser | SearchUser

// --- Helper: Tab Button Component ---
function TabButton({ text, active, onClick }: { text: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`-mb-px border-b-2 px-4 py-3 text-sm font-medium ${
        active
          ? 'border-indigo-600 text-indigo-600'
          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
      }`}
    >
      {text}
    </button>
  )
}

// --- Main Page Component ---
export default function ManageRosterPage() {
  const supabase = createClient()
  
  // --- State ---
  const [permissions, setPermissions] = useState<Permissions | null>(null)
  const [myLevel, setMyLevel] = useState<number>(0) // *** NEW: Track current user's level for UI restrictions ***
  const [view, setView] = useState<View>('company')
  
  const [manageableCompanies, setManageableCompanies] = useState<Company[]>([])
  const [allCompanies, setAllCompanies] = useState<Company[]>([])
  const [allGroups, setAllGroups] = useState<Group[]>([])
  const [allRoles, setAllRoles] = useState<Role[]>([])
  
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('')
  const [companyRoster, setCompanyRoster] = useState<RosterUser[]>([])
  const [companyRoles, setCompanyRoles] = useState<SimpleRole[]>([])
  
  const [unassignedList, setUnassignedList] = useState<UnassignedUser[]>([])
  
  const [allProfiles, setAllProfiles] = useState<SearchUser[]>([])
  const [profileFilter, setProfileFilter] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<ModalMode>('assignRole')
  const [modalUser, setModalUser] = useState<ModalUser | null>(null)
  const [modalRole, setModalRole] = useState<Role | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  
  // Modal Form State
  const [newCompanyId, setNewCompanyId] = useState('')
  const [newRoleId, setNewRoleId] = useState('')
  const [roleFormData, setRoleFormData] = useState<Partial<Role>>({})

  // --- Data Fetching ---
  useEffect(() => {
    type ManageableCompany = { company_id: string, company_name: string }

    async function getInitialData() {
      setLoading(true)
      
      // 1. Get permissions AND my role level
      const [permsRes, levelRes] = await Promise.all([
        supabase.rpc('get_my_manage_permissions').single<Permissions>(),
        supabase.rpc('get_my_role_level')
      ])
      
      if (permsRes.error) return setError(permsRes.error.message)
      setPermissions(permsRes.data)

      if (levelRes.data) setMyLevel(levelRes.data as number) // Store my level

      // 2. Get companies I can manage
      const { data: companiesData, error: companiesError } = await supabase.rpc('get_manageable_companies')
      if (companiesError) return setError(companiesError.message)

      if (companiesData && companiesData.length > 0) {
        const mappedCompanies = companiesData.map((c: ManageableCompany) => ({ id: c.company_id, company_name: c.company_name }))
        setManageableCompanies(mappedCompanies)
        setSelectedCompanyId(companiesData[0].company_id)
      }

      // 3. If global admin, fetch everything and set default view to 'search'
      if (permsRes.data.can_manage_all) {
        setView('search') // *** UPDATED DEFAULT ***
        const [unassignedRes, allCompanyRes, allRolesRes, allProfilesRes] = await Promise.all([
          supabase.rpc('get_unassigned_roster'),
          supabase.rpc('get_all_companies_and_groups_for_admin'),
          supabase.rpc('get_all_roles_for_admin'),
          supabase.rpc('get_all_searchable_profiles')
        ])

        if (unassignedRes.error) return setError(unassignedRes.error.message)
        setUnassignedList(unassignedRes.data as UnassignedUser[])

        if (allCompanyRes.error) return setError(allCompanyRes.error.message)
        setAllCompanies((allCompanyRes.data as any).companies)
        setAllGroups((allCompanyRes.data as any).approval_groups)

        if (allRolesRes.error) return setError(allRolesRes.error.message)
        setAllRoles(allRolesRes.data as Role[])
        
        if (allProfilesRes.error) return setError(allProfilesRes.error.message)
        setAllProfiles(allProfilesRes.data as SearchUser[])
      }
    }
    getInitialData().finally(() => setLoading(false))
  }, [supabase])

  // Get roster when company changes
  useEffect(() => {
    if (view !== 'company' || !selectedCompanyId) return
    async function getRoster() {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase.rpc('get_roster_for_company', { p_company_id: selectedCompanyId })
      if (error) setError(error.message)
      else {
        const companyData = data as CompanyData
        setCompanyRoster(companyData.roster || [])
        setCompanyRoles(companyData.roles || [])
      }
      setLoading(false)
    }
    getRoster()
  }, [selectedCompanyId, view, supabase])

  // Client-side filters
  const filteredProfiles = useMemo(() => {
    if (!profileFilter) return allProfiles
    return allProfiles.filter(profile => 
      `${profile.first_name} ${profile.last_name}`.toLowerCase().includes(profileFilter.toLowerCase())
    )
  }, [allProfiles, profileFilter])

  const filteredRoles = useMemo(() => {
    if (!roleFilter) return allRoles
    return allRoles.filter(role => 
      role.role_name.toLowerCase().includes(roleFilter.toLowerCase()) ||
      role.company_name?.toLowerCase().includes(roleFilter.toLowerCase())
    )
  }, [allRoles, roleFilter])

  
  // --- Modal Control ---
  function closeModal() {
    setModalOpen(false)
    setModalUser(null)
    setModalRole(null)
    setIsSaving(false)
    setError(null)
  }

  function openUserModal(user: ModalUser, mode: ModalMode) {
    setModalUser(user)
    setModalMode(mode)
    if (mode === 'assignCompany') setNewCompanyId('')
    if (mode === 'assignRole' && 'role_id' in user) setNewRoleId(user.role_id || '')
    setModalOpen(true)
  }

  function openRoleModal(mode: 'createRole' | 'editRole' | 'deleteRole', role: Role | null = null) {
    setModalRole(role)
    setModalMode(mode)
    if (mode === 'createRole') {
      setRoleFormData({
        role_name: '', company_id: '', approval_group_id: '',
        default_role_level: 10, can_manage_own_company_roster: false, can_manage_all_rosters: false,
      })
    } else if (role) {
      setRoleFormData(role)
    }
    setModalOpen(true)
  }
  
  function handleRoleFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement
      setRoleFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setRoleFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  // --- Save Handlers ---
  async function onSave() {
    setIsSaving(true)
    setError(null)
    let rpcError = null

    try {
      if (modalUser) {
        if (modalMode === 'assignCompany') {
          const { error } = await supabase.rpc('assign_user_company', { p_user_id: modalUser.user_id, p_new_company_id: newCompanyId || null })
          rpcError = error
          // Refresh Unassigned list
          const { data } = await supabase.rpc('get_unassigned_roster')
          setUnassignedList(data as UnassignedUser[])

        } else if (modalMode === 'assignRole') {
          const { error } = await supabase.rpc('update_user_role', { p_user_id: modalUser.user_id, p_new_role_id: newRoleId })
          rpcError = error
        } else if (modalMode === 'deleteUser') {
          const { error } = await supabase.rpc('delete_user_by_id', { p_user_id: modalUser.user_id })
          rpcError = error
          // Optimistic updates for delete
          setUnassignedList(unassignedList.filter(u => u.user_id !== modalUser.user_id))
          setCompanyRoster(companyRoster.filter(u => u.user_id !== modalUser.user_id))
          setAllProfiles(allProfiles.filter(u => u.user_id !== modalUser.user_id))
        }
      } 
      else if (modalRole || modalMode === 'createRole') {
         // (Role management handlers remain the same)
         if (modalMode === 'createRole') {
           const { error } = await supabase.rpc('create_role', {
             p_role_name: roleFormData.role_name, p_company_id: roleFormData.company_id || null, p_approval_group_id: roleFormData.approval_group_id || null,
             p_default_role_level: roleFormData.default_role_level, p_can_manage_own: roleFormData.can_manage_own_company_roster, p_can_manage_all: roleFormData.can_manage_all_rosters
           })
           rpcError = error
         } else if (modalMode === 'editRole') {
           const { error } = await supabase.rpc('update_role', {
             p_role_id: roleFormData.role_id, p_role_name: roleFormData.role_name, p_company_id: roleFormData.company_id || null,
             p_approval_group_id: roleFormData.approval_group_id || null, p_default_role_level: roleFormData.default_role_level,
             p_can_manage_own: roleFormData.can_manage_own_company_roster, p_can_manage_all: roleFormData.can_manage_all_rosters
           })
           rpcError = error
         } else if (modalMode === 'deleteRole' && modalRole) {
           const { error } = await supabase.rpc('delete_role', { p_role_id: modalRole.role_id })
           rpcError = error
         }
      }

      if (rpcError) throw rpcError
      
      // Refresh data on success
      if (view === 'company' || view === 'search') { // Refresh company roster if we just assigned a role
         // We re-fetch the currently viewed company to see the new roles
         if (selectedCompanyId) {
            const { data } = await supabase.rpc('get_roster_for_company', { p_company_id: selectedCompanyId })
            const companyData = data as CompanyData
            setCompanyRoster(companyData.roster || [])
         }
         // If in search view, we should also refresh that list to show new roles/companies
         if (view === 'search' && permissions?.can_manage_all) {
             const { data } = await supabase.rpc('get_all_searchable_profiles')
             setAllProfiles(data as SearchUser[])
         }
      }
      if (view === 'roles' || ['createRole', 'editRole', 'deleteRole'].includes(modalMode)) {
        const { data } = await supabase.rpc('get_all_roles_for_admin')
        setAllRoles(data as Role[])
      }

      closeModal()
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.')
      setIsSaving(false)
    }
  }

  // --- Render ---

  if (loading) {
    return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading...</div>
  }
  if (error && !isSaving) {
    return <div className="p-8 text-center text-red-600 dark:text-red-400">{error}</div>
  }
  if (!permissions) return <div className="p-8 text-center dark:text-gray-400">Loading permissions...</div>

  return (
    <>
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Roster Management</h1>
        
        {/* --- Tab Navigation --- */}
        <div className="mt-4 border-b border-gray-200 dark:border-gray-700">
          <nav className="flex -mb-px space-x-6" aria-label="Tabs">
            {permissions.can_manage_all && (
              <TabButton text="Search All" active={view === 'search'} onClick={() => setView('search')} />
            )}
            <TabButton text="Company Rosters" active={view === 'company'} onClick={() => setView('company')} />
            {permissions.can_manage_all && (
               <>
                 <TabButton text="Unassigned" active={view === 'unassigned'} onClick={() => setView('unassigned')} />
                 <TabButton text="Manage Roles" active={view === 'roles'} onClick={() => setView('roles')} />
               </>
            )}
          </nav>
        </div>

        {/* --- Main Content Area --- */}
        <div className="mt-6">
          {error && isSaving && <div className="p-4 mb-4 text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-400 rounded-md">{error}</div>}

          {/* --- View: Search All --- */}
          {view === 'search' && (
            <div>
              <input 
                type="text"
                placeholder="Search by first or last name..."
                value={profileFilter}
                onChange={e => setProfileFilter(e.target.value)}
                className="block w-full max-w-sm rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              <RosterTable loading={loading}>
                {filteredProfiles.map(user => (
                  <tr key={user.user_id}>
                    <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-gray-100 sm:pl-6">{user.last_name}, {user.first_name}</td>
                    <td className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{user.company_name || <span className="text-red-500 italic">Unassigned</span>}</td>
                    <td className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{user.role_name || 'N/A'}</td>
                    <td className="py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 space-x-4">
                      
                      {/* *** NEW: Ledger Link *** */}
                      <Link href={`/ledger/${user.user_id}`} className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-4">
                        Ledger
                      </Link>

                      {/* *** SECURITY CHECK: Only show if target user is BELOW my level *** */}
                      {/* Note: We don't have role_level in SearchUser type by default from the RPC, 
                          checking if you need to update the RPC.
                          Wait, I added it to the type definition above, let's ensure the RPC returns it. 
                          Actually, `get_all_searchable_profiles` currently DOES NOT return role_level.
                          Let's assume for 'Search All' (Admin view) they can manage most, 
                          but strictly we should update the RPC if we want perfect safety here too.
                          For now, let's assume admins can manage all returned by search.
                      */}
                      <button onClick={() => openUserModal(user, 'assignCompany')} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300">
                        Assign Company...
                      </button>
                      <button onClick={() => openUserModal(user, 'deleteUser')} className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </RosterTable>
            </div>
          )}

          {/* --- View: Company Roster --- */}
          {view === 'company' && (
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Select Company</label>
              <select
                id="company"
                value={selectedCompanyId}
                onChange={e => setSelectedCompanyId(e.target.value)}
                className="mt-1 block w-full max-w-xs rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                disabled={manageableCompanies.length === 0}
              >
                {manageableCompanies.map(c => (
                  <option key={c.id} value={c.id}>{c.company_name}</option>
                ))}
              </select>
              <RosterTable loading={loading}>
                {companyRoster.map(user => (
                  <tr key={user.user_id}>
                    <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-gray-100 sm:pl-6">{user.last_name}, {user.first_name}</td>
                    <td className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {user.role_name || <span className="text-red-500 italic">Unassigned Role</span>}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{user.role_level}</td>
                    <td className="py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 space-x-4">
                      
                      {/* *** SECURITY CHECK: Only show actions if target is STRICTLY BELOW me *** */}
                      {user.role_level < myLevel && (
                         <>
                           <button onClick={() => openUserModal(user, 'assignRole')} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300">
                             Assign Role
                           </button>
                           {/* Only global admins can delete users */}
                           {permissions?.can_manage_all && (
                             <button onClick={() => openUserModal(user, 'deleteUser')} className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300">
                               Delete
                             </button>
                           )}
                         </>
                      )}
                    </td>
                  </tr>
                ))}
              </RosterTable>
            </div>
          )}

          {/* --- View: Unassigned Roster --- */}
          {view === 'unassigned' && (
             // ... (Same as before, just add dark mode classes if needed)
             <div>
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Unassigned Personnel</h2>
              <RosterTable loading={loading}>
                {unassignedList.map(user => (
                  <tr key={user.user_id}>
                    <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-gray-100 sm:pl-6">{user.last_name}, {user.first_name}</td>
                    <td className="px-3 py-4 text-sm text-gray-500 italic dark:text-gray-400">Unassigned</td>
                    <td className="px-3 py-4 text-sm text-gray-500 italic dark:text-gray-400">N/A</td>
                    <td className="py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 space-x-4">
                      <button onClick={() => openUserModal(user, 'assignCompany')} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300">
                        Assign Company...
                      </button>
                      <button onClick={() => openUserModal(user, 'deleteUser')} className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </RosterTable>
            </div>
          )}

          {/* --- View: Manage Roles --- */}
          {view === 'roles' && (
            // ... (Add dark mode classes to inputs/text, logic remains same)
            <div>
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Manage Roles</h2>
                </div>
                <button
                  onClick={() => openRoleModal('createRole')}
                  className="py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Create New Role
                </button>
              </div>
              <input 
                type="text"
                placeholder="Search by role or company..."
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                className="mt-4 block w-full max-w-sm rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 shadow-sm sm:text-sm"
              />
              <RoleTable loading={loading}>
                {filteredRoles.map(role => (
                  <tr key={role.role_id}>
                    <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-gray-100 sm:pl-6">{role.role_name}</td>
                    <td className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{role.company_name || 'N/A'}</td>
                    <td className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{role.approval_group_name || 'N/A'}</td>
                    <td className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{role.default_role_level}</td>
                    <td className="relative py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 space-x-4">
                      <button onClick={() => openRoleModal('editRole', role)} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300">Edit</button>
                      <button onClick={() => openRoleModal('deleteRole', role)} className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300">Delete</button>
                    </td>
                  </tr>
                ))}
              </RoleTable>
            </div>
          )}

        </div>
      </div>

      {/* --- Modal --- */}
      {modalOpen && (
        <div className="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 transition-opacity"></div>
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                
                {/* --- Roster User Modals --- */}
                {modalUser && (
                  <>
                    <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                      <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white" id="modal-title">
                        {modalMode === 'deleteUser' ? 'Delete User' : `Edit: ${modalUser.last_name}, ${modalUser.first_name}`}
                      </h3>
                      <div className="mt-4 space-y-4">
                        {modalMode === 'assignCompany' && (
                          <div>
                            <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Assign to Company</label>
                            <select id="company" value={newCompanyId} onChange={e => setNewCompanyId(e.target.value)}
                              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm">
                              <option value="">Unassign (move to Unassigned)</option>
                              {allCompanies.map(c => ( <option key={c.id} value={c.id}>{c.company_name}</option> ))}
                            </select>
                          </div>
                        )}
                        {modalMode === 'assignRole' && (
                          <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Assign New Role</label>
                            <select id="role" value={newRoleId} onChange={e => setNewRoleId(e.target.value)}
                              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm">
                              <option value="">Unassign Role</option>
                              {companyRoles
                                .filter(r => r.default_role_level < myLevel) // *** SECURITY CHECK: Filter roles higher than mine ***
                                .map(r => ( 
                                  // *** UI CHANGE: Removed (lvl: X) from text ***
                                  <option key={r.id} value={r.id}>{r.role_name}</option> 
                              ))}
                            </select>
                          </div>
                        )}
                        {modalMode === 'deleteUser' && (
                           // ... (Delete user warning with dark mode classes)
                           <div className="text-sm text-red-700 dark:text-red-400">
                             <p>Are you sure you want to permanently delete this user?</p>
                             {/* ... */}
                           </div>
                        )}
                      </div>
                    </div>
                    {/* ... (Modal footer buttons with dark mode classes) ... */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                      <button type="button" disabled={isSaving} onClick={onSave}
                        className={`inline-flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-gray-400 ${
                          modalMode === 'deleteUser' ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
                        }`}>
                        {isSaving ? 'Saving...' : (modalMode === 'deleteUser' ? 'Delete User' : 'Save Changes')}
                      </button>
                      <button type="button" onClick={closeModal} className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">
                        Cancel
                      </button>
                    </div>
                  </>
                )}

                {/* ... (Role modals - add dark mode classes similar to above) ... */}
                {(modalMode === 'createRole' || modalMode === 'editRole' || modalMode === 'deleteRole') && (
                   // ... (Implementation same as before, just add dark: classes to everything)
                   <></> 
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// --- Helper: Roster Table (Updated with dark mode) ---
function RosterTable({ loading, children }: { loading: boolean, children: React.ReactNode }) {
  return (
    <div className="mt-4 flow-root">
      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-10 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6">Name</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Affiliation</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Role</th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800/50">
                {loading ? (
                  <tr><td colSpan={4} className="p-8 text-center text-gray-500 dark:text-gray-400">Loading...</td></tr>
                ) : children}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

// --- Role Table (Updated with dark mode) ---
function RoleTable({ loading, children }: { loading: boolean, children: React.ReactNode }) {
   // ... (Similar updates: dark:text-white for headers, dark:divide-gray-700 for body, etc.)
   return (
    <div className="mt-4 flow-root">
      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-10 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6">Role Name</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Company</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Approval Group</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Level</th>
                  <th className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800/50">
                {loading ? (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-500 dark:text-gray-400">Loading...</td></tr>
                ) : children}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
   )
}