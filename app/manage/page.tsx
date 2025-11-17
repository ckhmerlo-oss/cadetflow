'use client'

import { createClient } from '@/utils/supabase/client'
import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import RosterClient from './RosterClient' 
import { RosterCadet } from './RosterClient' 
import { EDIT_AUTHORIZED_ROLES } from '@/app/profile/constants' 

// --- Data Types (Original) ---
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
}
type SearchUser = {
  user_id: string;
  first_name: string;
  last_name: string;
  role_name: string | null;
  company_name: string | null;
  role_level: number;
}
// --- End Original Types ---

export default function ManagePage() {
  const supabase = createClient()
  
  const [activeTab, setActiveTab] = useState<'roster' | 'unassigned' | 'roles'>('roster')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [roles, setRoles] = useState<Role[]>([])
  const [companies, setCompanies] = useState<Company[]>([]) // <-- Used for filter
  const [groups, setGroups] = useState<Group[]>([])
  const [roster, setRoster] = useState<RosterUser[]>([]) 
  const [unassigned, setUnassigned] = useState<UnassignedUser[]>([]) 
  const [searchTerm, setSearchTerm] = useState('')

  const [rosterData, setRosterData] = useState<RosterCadet[]>([])
  
  const [canEditProfiles, setCanEditProfiles] = useState(false)
  const [viewerRoleLevel, setViewerRoleLevel] = useState(0) 
  const [showCreateRoleForm, setShowCreateRoleForm] = useState(false)


  useEffect(() => {
    async function getInitialData() {
      setLoading(true)
      setError(null)

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
      const isAdmin = roleName === 'Admin'
      
      setCanEditProfiles(EDIT_AUTHORIZED_ROLES.includes(roleName) || roleName.includes('TAC') || isAdmin)
      setViewerRoleLevel(roleLevel)

      const [
        rolesRes, 
        companiesRes, 
        groupsRes, 
        rosterRes, 
        unassignedRes,
        fullRosterRes 
      ] = await Promise.all([
        supabase.rpc('get_all_roles_with_details'),
        supabase.from('companies').select('*').order('company_name'), // <-- Fetches companies
        supabase.from('approval_groups').select('*'),
        supabase.rpc('get_roster_with_roles'),
        supabase.rpc('get_unassigned_users'), 
        supabase.rpc('get_full_roster') 
      ])
      
      if (rolesRes.data) setRoles(rolesRes.data)
      if (companiesRes.data) setCompanies(companiesRes.data) // <-- Set companies state
      if (groupsRes.data) setGroups(groupsRes.data)
      if (rosterRes.data) setRoster(rosterRes.data)
      
      if (fullRosterRes.error) {
        console.error("Error fetching full roster:", fullRosterRes.error.message)
        setError(fullRosterRes.error.message)
      } else {
        setRosterData(fullRosterRes.data as RosterCadet[])
      }

      if (unassignedRes.error) {
         console.error("Error fetching unassigned users:", unassignedRes.error.message)
         if (!error) setError(unassignedRes.error.message)
      } else {
        setUnassigned(unassignedRes.data as UnassignedUser[])
      }

      setLoading(false)
    }

    getInitialData()
  }, [supabase])

  const searchResults = useMemo(() => {
    if (!searchTerm) return []
    const lowerSearch = searchTerm.toLowerCase()
    return roster.filter(u => 
      u.first_name.toLowerCase().includes(lowerSearch) || 
      u.last_name.toLowerCase().includes(lowerSearch)
    ).map(u => ({
      user_id: u.user_id,
      first_name: u.first_name,
      last_name: u.last_name,
      role_name: u.role_name,
      role_level: u.role_level,
      company_name: roles.find(r => r.role_id === u.role_id)?.company_name || null
    } as SearchUser))
  }, [searchTerm, roster, roles])

  const handleRoleCreated = (newRole: Role) => {
    setRoles(prevRoles => [...prevRoles, newRole].sort((a, b) => a.default_role_level - b.default_role_level))
    setShowCreateRoleForm(false)
  }

  // --- NEW: Print Function ---
  const handlePrintRoster = () => {
    window.print()
  }

  if (loading) {
    return <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 text-center text-gray-600 dark:text-gray-400">Loading management data...</div>
  }

  return (
    <>
      {/* --- NEW: Print Styles --- */}
      <style jsx global>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          /* Hide everything */
          header, 
          .no-print,
          div[aria-label="Tabs"] {
            display: none !important;
          }
          /* Show only the printable area */
          #printable-roster {
            display: block !important;
            visibility: visible !important;
            box-shadow: none !important;
            border: none !important;
          }
          /* Ensure main layout containers don't hide it */
          body > div, body > main {
            display: block !important;
            visibility: visible !important;
          }
          .printable-table {
            width: 100%;
            border-collapse: collapse;
          }
          .printable-table th, .printable-table td {
            border: 1px solid #ccc;
            padding: 4px 8px;
            font-size: 10pt;
          }
          .printable-table th {
            background-color: #f4f4f4;
            font-weight: 600;
          }
          /* Hide details in print */
          .print-hide {
            display: none !important;
          }
        }
      `}</style>
    
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Management
        </h1>
        
        {/* --- TABS --- */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700 no-print">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('roster')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'roster'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              Cadet Roster
            </button>
            <button
              onClick={() => setActiveTab('unassigned')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'unassigned'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              Unassigned Cadets <span className="ml-1.5 inline-block py-0.5 px-2 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">{unassigned.length}</span>
            </button>
            <button
              onClick={() => setActiveTab('roles')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'roles'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              Role Management
            </button>
          </nav>
        </div>
        
        {error && (
          <div className="p-4 text-center text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="font-medium">Error loading data:</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* --- TAB CONTENT: Cadet Roster --- */}
        <div id="printable-roster" className={activeTab === 'roster' ? '' : 'hidden'}>
          <div className="flex justify-between items-center mb-4 no-print">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Cadet Roster</h2>
            <button
              onClick={handlePrintRoster}
              className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              Print Roster
            </button>
          </div>
          {/* Pass companies for filter dropdown */}
          <RosterClient 
            initialData={rosterData} 
            canEditProfiles={canEditProfiles} 
            companies={companies}
          />
        </div>

        {/* --- TAB CONTENT: Unassigned Cadets --- */}
        <div className={`no-print ${activeTab === 'unassigned' ? '' : 'hidden'}`}>
          <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Unassigned Cadets ({unassigned.length})</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">These users have profiles but no assigned role. Assign them a role to add them to the main roster.</p>
            </div>
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {unassigned.length > 0 ? unassigned.map(u => (
                <li key={u.user_id} className="p-4 flex justify-between items-center">
                  <span className="font-medium text-gray-900 dark:text-white">{u.last_name}, {u.first_name}</span>
                  <Link href={`/profile/${u.user_id}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200">
                    Assign Role &rarr;
                  </Link>
                </li>
              )) : (
                <li className="p-4 text-center text-gray-500 dark:text-gray-400">All cadets are assigned roles.</li>
              )}
            </ul>
          </div>
        </div>

        {/* --- TAB CONTENT: Role Management --- */}
        <div className={`no-print ${activeTab === 'roles' ? '' : 'hidden'}`}>
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} searchResults={searchResults} />

          {viewerRoleLevel >= 90 && (
            <div className="my-6">
              {showCreateRoleForm ? (
                <CreateRoleForm 
                  companies={companies} 
                  groups={groups}
                  onCancel={() => setShowCreateRoleForm(false)}
                  onSuccess={handleRoleCreated}
                />
              ) : (
                <button
                  onClick={() => setShowCreateRoleForm(true)}
                  className="w-full py-2 px-4 bg-indigo-600 text-white font-medium rounded-md shadow-sm hover:bg-indigo-700 transition-colors"
                >
                  + Create New Role
                </button>
              )}
            </div>
          )}
          
          <div className="mt-8 flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-10 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6">Role Name</th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Company</th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Group</th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Level</th>
                        <th className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Actions</span></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                      {roles.map(role => (
                        <tr key={role.role_id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-6">{role.role_name}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{role.company_name || 'N/A'}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{role.approval_group_name || 'N/A'}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{role.default_role_level}</td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <Link href="#" className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200">Edit</Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}


// --- Search Bar Component (Original) ---
function SearchBar({ searchTerm, setSearchTerm, searchResults }: { searchTerm: string, setSearchTerm: (term: string) => void, searchResults: SearchUser[] }) {
  // ... (This component is unchanged from your original) ...
  return (
    <div className="relative no-print">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Find a user (for Role Management)..."
        className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-800 dark:text-white"
      />
      {searchTerm && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {searchResults.length > 0 ? (
            searchResults.map(user => (
              <Link key={user.user_id} href={`/profile/${user.user_id}`} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                {user.last_name}, {user.first_name} ({user.role_name || 'Unassigned'}) - {user.company_name || 'N/A'}
              </Link>
            ))
          ) : (
            <div className="px-4 py-2 text-sm text-gray-500">No users found.</div>
          )}
        </div>
      )}
    </div>
  )
}

// --- Create Role Form Component (Original) ---
function CreateRoleForm({ companies, groups, onCancel, onSuccess }: { companies: Company[], groups: Group[], onCancel: () => void, onSuccess: (newRole: Role) => void }) {
  // ... (This component is unchanged) ...
  const supabase = createClient()
  const [formData, setFormData] = useState({
    role_name: '',
    company_id: '',
    approval_group_id: '',
    default_role_level: 10,
    can_manage_all_rosters: false,
    can_manage_own_company_roster: false
  })
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)

    const { error: rpcError } = await supabase.rpc('create_new_role', {
      p_role_name: formData.role_name,
      p_company_id: formData.company_id || null,
      p_approval_group_id: formData.approval_group_id || null,
      p_default_role_level: Number(formData.default_role_level),
      p_can_manage_all_rosters: formData.can_manage_all_rosters,
      p_can_manage_own_company_roster: formData.can_manage_own_company_roster
    })

    setIsSaving(false)
    if (rpcError) {
      setError(rpcError.message)
    } else {
      const newRole: Role = {
        role_id: '', 
        role_name: formData.role_name,
        company_id: formData.company_id || null,
        company_name: companies.find(c => c.id === formData.company_id)?.company_name || null,
        approval_group_id: formData.approval_group_id || null,
        approval_group_name: groups.find(g => g.id === formData.approval_group_id)?.group_name || null,
        default_role_level: Number(formData.default_role_level),
        can_manage_all_rosters: formData.can_manage_all_rosters,
        can_manage_own_company_roster: formData.can_manage_own_company_roster
      }
      onSuccess(newRole)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Create New Role</h3>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Role Name</label>
          <input
            type="text"
            name="role_name"
            value={formData.role_name}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 shadow-sm p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Role Level (0-100)</label>
          <input
            type="number"
            name="default_role_level"
            value={formData.default_role_level}
            onChange={handleChange}
            required
            min="0"
            max="100"
            className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 shadow-sm p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Company (Optional)</label>
          <select
            name="company_id"
            value={formData.company_id}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 shadow-sm p-2"
          >
            <option value="">None</option>
            {companies.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Approval Group (Optional)</label>
          <select
            name="approval_group_id"
            value={formData.approval_group_id}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 shadow-sm p-2"
          >
            <option value="">None</option>
            {groups.map(g => <option key={g.id} value={g.id}>{g.group_name}</option>)}
          </select>
        </div>
        <div className="col-span-full space-y-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              name="can_manage_all_rosters"
              checked={formData.can_manage_all_rosters}
              onChange={handleChange}
              className="h-4 w-4 rounded text-indigo-600"
            />
            <label className="ml-2 block text-sm text-gray-900 dark:text-gray-300">Can Manage All Rosters</label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              name="can_manage_own_company_roster"
              checked={formData.can_manage_own_company_roster}
              onChange={handleChange}
              className="h-4 w-4 rounded text-indigo-600"
            />
            <label className="ml-2 block text-sm text-gray-900 dark:text-gray-300">Can Manage Own Company Roster</label>
          </div>
        </div>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="py-2 px-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="py-2 px-4 bg-indigo-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-indigo-700 disabled:opacity-50"
        >
          {isSaving ? 'Creating...' : 'Create Role'}
        </button>
      </div>
    </form>
  )
}