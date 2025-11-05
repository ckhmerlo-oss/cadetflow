// in app/manage/page.tsx
'use client'

import { createClient } from '@/utils/supabase/client'
import { useState, useEffect } from 'react'

// --- Data Types ---
// *** FIX: This type now matches the RPC function 'get_all_companies_list' ***
type Company = { id: string; company_name: string }

type Role = { id: string; role_name: string; default_role_level: number }
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
}
type Permissions = { can_manage_own: boolean; can_manage_all: boolean }
type CompanyData = { roster: RosterUser[]; roles: Role[] }
type View = 'company' | 'unassigned' | 'search'
type ModalMode = 'assignCompany' | 'assignRole' | 'setLevel'
type ModalUser = RosterUser | UnassignedUser | SearchUser

// --- Helper: Tab Button Component ---
function TabButton({ text, active, onClick }: { text: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`-mb-px border-b-2 px-4 py-3 text-sm font-medium ${
        active
          ? 'border-indigo-600 text-indigo-600'
          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
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
  const [view, setView] = useState<View>('company')
  
  // *** FIX: This type now matches the 'ManageableCompany' type below ***
  const [manageableCompanies, setManageableCompanies] = useState<Company[]>([])
  const [allCompanies, setAllCompanies] = useState<Company[]>([])
  
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('')
  const [companyRoster, setCompanyRoster] = useState<RosterUser[]>([])
  const [companyRoles, setCompanyRoles] = useState<Role[]>([])
  
  const [unassignedList, setUnassignedList] = useState<UnassignedUser[]>([])
  
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchUser[]>([])
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<ModalMode>('assignRole')
  const [modalUser, setModalUser] = useState<ModalUser | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  
  // Modal Form State
  const [newCompanyId, setNewCompanyId] = useState('')
  const [newRoleId, setNewRoleId] = useState('')
  const [newRoleLevel, setNewRoleLevel] = useState(0)


  // --- Data Fetching ---

  // 1. Initial page load
  useEffect(() => {
    // *** FIX: This type is what the RPC returns ***
    type ManageableCompany = { company_id: string, company_name: string }

    async function getInitialData() {
      setLoading(true)
      // *** FIX: This RPC call *was* correct ***
      const { data: permsData, error: permsError } = await supabase
        .rpc('get_my_manage_permissions')
        .single<Permissions>()
      
      if (permsError) return setError(permsError.message)
      setPermissions(permsData)

      // *** FIX: Removed the broken generic <ManageableCompany[]> ***
      const { data: companiesData, error: companiesError } = await supabase
        .rpc('get_manageable_companies')

      if (companiesError) return setError(companiesError.message)

      if (companiesData && companiesData.length > 0) {
        // *** FIX: Added explicit type (c: ManageableCompany) to fix implicit 'any' ***
        const mappedCompanies = companiesData.map((c: ManageableCompany) => ({ id: c.company_id, company_name: c.company_name }))
        setManageableCompanies(mappedCompanies)
        setSelectedCompanyId(companiesData[0].company_id)
      }

      if (permsData.can_manage_all) {
        setView('unassigned')
        // *** FIX: Removed broken generic <UnassignedUser[]> ***
        const { data: unassignedData, error: unassignedError } = await supabase.rpc('get_unassigned_roster')
        if (unassignedError) return setError(unassignedError.message)
        setUnassignedList(unassignedData)

        // *** FIX: Removed broken generic <Company[]> ***
        const { data: allCompaniesData, error: allCompaniesError } = await supabase.rpc('get_all_companies_list')
        if (allCompaniesError) return setError(allCompaniesError.message)
        setAllCompanies(allCompaniesData)
      }
    }
    getInitialData().finally(() => setLoading(false))
  }, [supabase])

  // 2. Fetch roster when selected company changes
  useEffect(() => {
    if (view !== 'company' || !selectedCompanyId) return

    async function getRoster() {
      setLoading(true)
      setError(null)
      // *** FIX: Removed broken generic <CompanyData> ***
      const { data, error } = await supabase.rpc('get_roster_for_company', {
        p_company_id: selectedCompanyId
      })

      if (error) setError(error.message)
      else {
        // We cast the types here instead
        const companyData = data as CompanyData
        setCompanyRoster(companyData.roster || [])
        setCompanyRoles(companyData.roles || [])
      }
      setLoading(false)
    }
    getRoster()
  }, [selectedCompanyId, view, supabase])

  // 3. Run search when query changes
  useEffect(() => {
    if (view !== 'search' || !searchQuery) {
      setSearchResults([])
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      // *** FIX: Removed broken generic <SearchUser[]> ***
      const { data, error } = await supabase.rpc('search_all_profiles', {
        p_search_term: searchQuery
      })
      if (error) setError(error.message)
      else setSearchResults(data || [])
      setLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, view, supabase])

  
  // --- Modal Control ---

  function closeModal() {
    setModalOpen(false)
    setModalUser(null)
    setIsSaving(false)
    setError(null)
  }

  function openModal(user: ModalUser, mode: ModalMode) {
    setModalUser(user)
    setModalMode(mode)
    
    if (mode === 'assignCompany') setNewCompanyId('')
    if (mode === 'assignRole' && 'role_id' in user) setNewRoleId(user.role_id || '')
    if (mode === 'setLevel' && 'role_level' in user) setNewRoleLevel(user.role_level)

    setModalOpen(true)
  }
  
  // --- Save Handlers ---

  async function onSave() {
    setIsSaving(true)
    setError(null)
    let rpcError = null

    try {
      if (!modalUser) throw new Error("No user selected")

      if (modalMode === 'assignCompany') {
        const { error } = await supabase.rpc('assign_user_company', {
          p_user_id: modalUser.user_id,
          p_new_company_id: newCompanyId || null
        })
        rpcError = error
        // *** FIX: Removed broken generic <UnassignedUser[]> ***
        const { data, error: refetchError } = await supabase.rpc('get_unassigned_roster')
        if (refetchError) throw refetchError
        setUnassignedList(data)

      } else if (modalMode === 'assignRole') {
        const { error } = await supabase.rpc('update_user_role', {
          p_user_id: modalUser.user_id,
          p_new_role_id: newRoleId
        })
        rpcError = error
      } else if (modalMode === 'setLevel') {
        const { error } = await supabase.rpc('update_user_role_level', {
          p_user_id: modalUser.user_id,
          p_new_role_level: newRoleLevel
        })
        rpcError = error
      }

      if (rpcError) throw rpcError
      
      if (view === 'company') {
        // *** FIX: Removed broken generic <CompanyData> ***
        const { data, error } = await supabase.rpc('get_roster_for_company', { p_company_id: selectedCompanyId })        
        if (error) throw error
        const companyData = data as CompanyData
        setCompanyRoster(companyData.roster || [])
        setCompanyRoles(companyData.roles || [])
      }

      closeModal()
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.')
      setIsSaving(false)
    }
  }

  // --- Render ---

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>
  }

  if (error && !isSaving) {
    // Show a general error if the whole page failed
    return <div className="p-8 text-center text-red-600">{error}</div>
  }

  if (!permissions) return <div className="p-8 text-center">Loading permissions...</div>

  return (
    <>
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl font-bold text-gray-900">Roster Management</h1>
        
        {/* --- Tab Navigation --- */}
        <div className="mt-4 border-b border-gray-200">
          <nav className="flex -mb-px space-x-6" aria-label="Tabs">
            {permissions.can_manage_all && (
              <TabButton text="Unassigned" active={view === 'unassigned'} onClick={() => setView('unassigned')} />
            )}
            <TabButton text="Company Rosters" active={view === 'company'} onClick={() => setView('company')} />
            {permissions.can_manage_all && (
              <TabButton text="Search All" active={view === 'search'} onClick={() => setView('search')} />
            )}
          </nav>
        </div>

        {/* --- Main Content Area --- */}
        <div className="mt-6">
          {/* *** FIX: Show saving errors here *** */}
          {error && isSaving && <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-md">{error}</div>}

          {/* --- View: Unassigned Roster --- */}
          {view === 'unassigned' && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">Unassigned Personnel</h2>
              <p className="text-gray-600">Users not assigned to any company.</p>
              <RosterTable loading={loading}>
                {unassignedList.map(user => (
                  <tr key={user.user_id}>
                    <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{user.last_name}, {user.first_name}</td>
                    <td className="px-3 py-4 text-sm text-gray-500 italic">Unassigned</td>
                    <td className="px-3 py-4 text-sm text-gray-500 italic">N/A</td>
                    <td className="py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <button onClick={() => openModal(user, 'assignCompany')} className="text-indigo-600 hover:text-indigo-900">
                        Assign Company...
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
              <label htmlFor="company" className="block text-sm font-medium text-gray-700">Select Company</label>
              <select
                id="company"
                value={selectedCompanyId}
                onChange={e => setSelectedCompanyId(e.target.value)}
                className="mt-1 block w-full max-w-xs rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                disabled={manageableCompanies.length === 0}
              >
                {manageableCompanies.map(c => (
                  <option key={c.id} value={c.id}>{c.company_name}</option>
                ))}
              </select>
              <RosterTable loading={loading}>
                {companyRoster.map(user => (
                  <tr key={user.user_id}>
                    <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{user.last_name}, {user.first_name}</td>
                    <td className="px-3 py-4 text-sm text-gray-500">
                      {user.role_name || <span className="text-red-500 italic">Unassigned Role</span>}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-500">{user.role_level}</td>
                    <td className="py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 space-x-4">
                      <button onClick={() => openModal(user, 'assignRole')} className="text-indigo-600 hover:text-indigo-900">
                        Assign Role
                      </button>
                      <button onClick={() => openModal(user, 'setLevel')} className="text-gray-600 hover:text-gray-900">
                        Set Level
                      </button>
                    </td>
                  </tr>
                ))}
              </RosterTable>
            </div>
          )}

          {/* --- View: Search All --- */}
          {view === 'search' && (
            <div>
              <input 
                type="text"
                placeholder="Search by first or last name..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="block w-full max-w-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              <RosterTable loading={loading}>
                {searchResults.map(user => (
                  <tr key={user.user_id}>
                    <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{user.last_name}, {user.first_name}</td>
                    <td className="px-3 py-4 text-sm text-gray-500">{user.company_name || <span className="text-red-500 italic">Unassigned</span>}</td>
                    <td className="px-3 py-4 text-sm text-gray-500">{user.role_name || 'N/A'}</td>
                    <td className="py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <button onClick={() => openModal(user, 'assignCompany')} className="text-indigo-600 hover:text-indigo-900">
                        Assign Company...
                      </button>
                    </td>
                  </tr>
                ))}
              </RosterTable>
            </div>
          )}

        </div>
      </div>

      {/* --- Modal --- */}
      {modalOpen && modalUser && (
        <div className="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-medium leading-6 text-gray-900" id="modal-title">
                    Edit: {modalUser.last_name}, {modalUser.first_name}
                  </h3>
                  
                  {/* Modal Body */}
                  <div className="mt-4 space-y-4">
                    {modalMode === 'assignCompany' && (
                      <div>
                        <label htmlFor="company" className="block text-sm font-medium text-gray-700">Assign to Company</label>
                        <select
                          id="company"
                          value={newCompanyId}
                          onChange={e => setNewCompanyId(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                        >
                          <option value="">Unassign (move to Unassigned)</option>
                          {allCompanies.map(c => (
                            <option key={c.id} value={c.id}>{c.company_name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    
                    {modalMode === 'assignRole' && (
                      <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700">Assign New Role</label>
                        <select
                          id="role"
                          value={newRoleId}
                          onChange={e => setNewRoleId(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                        >
                          <option value="">Unassign Role</option>
                          {companyRoles.map(r => (
                            <option key={r.id} value={r.id}>{r.role_name} (lvl: {r.default_role_level})</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {modalMode === 'setLevel' && (
                      <div>
                        <label htmlFor="level" className="block text-sm font-medium text-gray-700">Set Role Level</label>
                        <p className="text-xs text-gray-500">Current Role: {('role_name' in modalUser && modalUser.role_name) || 'N/A'}</p>
                        <input
                          id="level"
                          type="number"
                          value={newRoleLevel}
                          onChange={e => setNewRoleLevel(Number(e.target.value))}
                          className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                    )}
                    {/* *** FIX: Show error here *** */}
                    {error && isSaving && <p className="text-sm text-red-600 mt-2">{error}</p>}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button type="button" disabled={isSaving} onClick={onSave}
                    className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-gray-400">
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button type="button" onClick={closeModal}
                    className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// --- Helper: Table Component ---
function RosterTable({ loading, children }: { loading: boolean, children: React.ReactNode }) {
  return (
    <div className="mt-4 flow-root">
      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
            <table className="min_w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Name</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Affiliation</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Role/Level</th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {loading ? (
                  <tr><td colSpan={4} className="p-8 text-center text-gray-500">Loading...</td></tr>
                ) : children}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}