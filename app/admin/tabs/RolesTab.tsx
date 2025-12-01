'use client'

import { createClient } from '@/utils/supabase/client'
import { useState, useEffect, useMemo } from 'react'
import { createAdminRoleAction, updateAdminRoleAction, deleteAdminRoleAction } from '../actions'

type Role = {
  id: string;
  role_name: string;
  default_role_level: number;
  company_id: string | null;
  approval_group_id: string | null;
  can_manage_own_company_roster: boolean;
  can_manage_all_rosters: boolean;
}

type Company = {
  id: string;
  company_name: string;
}

type ApprovalGroup = {
  id: string;
  group_name: string;
  company_id: string;
}

export default function RolesTab() {
  const supabase = createClient()
  const [roles, setRoles] = useState<Role[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [approvalGroups, setApprovalGroups] = useState<ApprovalGroup[]>([])
  const [loading, setLoading] = useState(true)
  
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Role>>({})

  const [isCreating, setIsCreating] = useState(false)
  const [createForm, setCreateForm] = useState<Partial<Role>>({ 
    default_role_level: 0,
    can_manage_own_company_roster: false,
    can_manage_all_rosters: false,
    company_id: '',
    approval_group_id: ''
  })

  useEffect(() => {
    Promise.all([fetchRoles(), fetchCompanies(), fetchGroups()]).then(() => setLoading(false))
  }, [])

  async function fetchRoles() {
    const { data, error } = await supabase.from('roles').select('*').order('default_role_level', { ascending: false })
    if (!error && data) setRoles(data)
  }

  async function fetchCompanies() {
    const { data, error } = await supabase.from('companies').select('id, company_name').order('company_name')
    if (!error && data) setCompanies(data)
  }

  async function fetchGroups() {
    const { data, error } = await supabase.from('approval_groups').select('id, group_name, company_id').order('group_name')
    if (!error && data) setApprovalGroups(data)
  }

  // --- Handlers ---

  const handleCreateCheck = (field: 'can_manage_own_company_roster' | 'can_manage_all_rosters', checked: boolean) => {
      setCreateForm(prev => {
          const next = { ...prev, [field]: checked };
          if (field === 'can_manage_all_rosters' && checked) next.can_manage_own_company_roster = true;
          return next;
      })
  }

  const handleCreate = async () => {
    if (!createForm.role_name) { alert("Role Name is required."); return }

    const formData = new FormData()
    formData.append('roleName', createForm.role_name)
    formData.append('defaultLevel', createForm.default_role_level?.toString() || '0')
    if (createForm.company_id) formData.append('companyId', createForm.company_id)
    if (createForm.approval_group_id) formData.append('approvalGroupId', createForm.approval_group_id)
    if (createForm.can_manage_own_company_roster) formData.append('canManageOwn', 'on')
    if (createForm.can_manage_all_rosters) formData.append('canManageAll', 'on')

    const result = await createAdminRoleAction(formData)
    
    if (result?.error) {
      alert(`Error: ${result.error}`)
    } else {
      setIsCreating(false)
      setCreateForm({ default_role_level: 0, can_manage_own_company_roster: false, can_manage_all_rosters: false, company_id: '', approval_group_id: '' })
      fetchRoles()
    }
  }

  const handleEditCheck = (field: 'can_manage_own_company_roster' | 'can_manage_all_rosters', checked: boolean) => {
      setEditForm(prev => {
          const next = { ...prev, [field]: checked };
          if (field === 'can_manage_all_rosters' && checked) next.can_manage_own_company_roster = true;
          return next;
      })
  }

  const startEdit = (role: Role) => {
    setEditingId(role.id)
    setEditForm(role)
  }

  const saveEdit = async () => {
    if (!editingId) return
    const formData = new FormData()
    formData.append('roleId', editingId)
    formData.append('roleName', editForm.role_name || '')
    formData.append('defaultLevel', editForm.default_role_level?.toString() || '0')
    if (editForm.company_id) formData.append('companyId', editForm.company_id)
    if (editForm.approval_group_id) formData.append('approvalGroupId', editForm.approval_group_id)
    if (editForm.can_manage_own_company_roster) formData.append('canManageOwn', 'on')
    if (editForm.can_manage_all_rosters) formData.append('canManageAll', 'on')

    const result = await updateAdminRoleAction(formData)
    if (result?.error) alert(`Error: ${result.error}`)
    else { await fetchRoles(); setEditingId(null) }
  }

  const handleDelete = async (id: string) => {
      if(!confirm("Are you sure?")) return
      const result = await deleteAdminRoleAction(id)
      if (result?.error) alert(result.error)
      else fetchRoles()
  }

  // --- Filtering Helpers ---
  const getGroupsForCompany = (companyId: string | null | undefined) => {
      if (!companyId) return [] // Global roles usually don't have approval groups, or logic differs
      return approvalGroups.filter(g => g.company_id === companyId)
  }

  if (loading) return <div className="p-8 text-gray-500">Loading roles...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Role Configuration</h2>
        <button onClick={() => setIsCreating(true)} disabled={isCreating} className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">+ Add Role</button>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md border border-blue-200 dark:border-blue-800 text-sm text-blue-800 dark:text-blue-200">
        <p><strong>Note:</strong> "Approval Group" links a role to the Chain of Command. You must select a Company first.</p>
      </div>

      <div className="border rounded-lg overflow-x-auto dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Role Name</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Company</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Appr. Group</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Lvl</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Perms</th>
              <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            
            {/* CREATION ROW */}
            {isCreating && (
              <tr className="bg-indigo-50 dark:bg-indigo-900/20">
                <td className="px-4 py-4 align-top">
                    <input placeholder="Role Name" className="w-full p-1 border rounded text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white" value={createForm.role_name || ''} onChange={e => setCreateForm({...createForm, role_name: e.target.value})} />
                </td>
                <td className="px-4 py-4 align-top">
                    <select className="w-full p-1 border rounded text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white" value={createForm.company_id || ''} onChange={e => setCreateForm({...createForm, company_id: e.target.value || null, approval_group_id: ''})}>
                        <option value="">Global</option>
                        {companies.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
                    </select>
                </td>
                <td className="px-4 py-4 align-top">
                    <select className="w-full p-1 border rounded text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white" value={createForm.approval_group_id || ''} onChange={e => setCreateForm({...createForm, approval_group_id: e.target.value || null})} disabled={!createForm.company_id}>
                        <option value="">None</option>
                        {getGroupsForCompany(createForm.company_id).map(g => <option key={g.id} value={g.id}>{g.group_name}</option>)}
                    </select>
                </td>
                <td className="px-4 py-4 align-top">
                    <input type="number" className="w-12 p-1 border rounded text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white" value={createForm.default_role_level} onChange={e => setCreateForm({...createForm, default_role_level: Number(e.target.value)})} />
                </td>
                <td className="px-4 py-4 align-top text-xs space-y-1">
                    <label className="flex items-center gap-1"><input type="checkbox" checked={createForm.can_manage_own_company_roster || false} onChange={e => handleCreateCheck('can_manage_own_company_roster', e.target.checked)}/> Own</label>
                    <label className="flex items-center gap-1"><input type="checkbox" checked={createForm.can_manage_all_rosters || false} onChange={e => handleCreateCheck('can_manage_all_rosters', e.target.checked)}/> All</label>
                </td>
                <td className="px-4 py-4 text-right space-x-2 align-top">
                    <button onClick={handleCreate} className="text-green-600 font-medium hover:underline text-xs">Save</button>
                    <button onClick={() => setIsCreating(false)} className="text-red-500 hover:underline text-xs">Cancel</button>
                </td>
              </tr>
            )}

            {/* DATA ROWS */}
            {roles.map((role) => (
              <tr key={role.id}>
                {editingId === role.id ? (
                  <>
                    <td className="px-4 py-4 align-top"><input className="w-full p-1 border rounded text-sm text-black" value={editForm.role_name || ''} onChange={e => setEditForm({...editForm, role_name: e.target.value})} /></td>
                    <td className="px-4 py-4 align-top">
                        <select className="w-full p-1 border rounded text-sm text-black" value={editForm.company_id || ''} onChange={e => setEditForm({...editForm, company_id: e.target.value || null, approval_group_id: ''})}>
                            <option value="">Global</option>
                            {companies.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
                        </select>
                    </td>
                    <td className="px-4 py-4 align-top">
                        <select className="w-full p-1 border rounded text-sm text-black" value={editForm.approval_group_id || ''} onChange={e => setEditForm({...editForm, approval_group_id: e.target.value || null})} disabled={!editForm.company_id}>
                            <option value="">None</option>
                            {getGroupsForCompany(editForm.company_id).map(g => <option key={g.id} value={g.id}>{g.group_name}</option>)}
                        </select>
                    </td>
                    <td className="px-4 py-4 align-top"><input type="number" className="w-12 p-1 border rounded text-sm text-black" value={editForm.default_role_level || 0} onChange={e => setEditForm({...editForm, default_role_level: Number(e.target.value)})} /></td>
                    <td className="px-4 py-4 align-top text-xs space-y-1">
                        <label className="flex items-center gap-1 text-black"><input type="checkbox" checked={editForm.can_manage_own_company_roster || false} onChange={e => handleEditCheck('can_manage_own_company_roster', e.target.checked)}/> Own</label>
                        <label className="flex items-center gap-1 text-black"><input type="checkbox" checked={editForm.can_manage_all_rosters || false} onChange={e => handleEditCheck('can_manage_all_rosters', e.target.checked)}/> All</label>
                    </td>
                    <td className="px-4 py-4 text-right space-x-2 align-top">
                        <button onClick={saveEdit} className="text-green-600 font-medium hover:underline text-xs">Save</button>
                        <button onClick={() => setEditingId(null)} className="text-gray-500 hover:underline text-xs">Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{role.role_name}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{companies.find(c => c.id === role.company_id)?.company_name || '-'}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{approvalGroups.find(g => g.id === role.approval_group_id)?.group_name || '-'}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{role.default_role_level}</td>
                    <td className="px-4 py-4 text-xs text-gray-500">
                        {role.can_manage_all_rosters ? 'All' : role.can_manage_own_company_roster ? 'Own' : '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => startEdit(role)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200 mr-2">Edit</button>
                      <button onClick={() => handleDelete(role.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200">Delete</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}