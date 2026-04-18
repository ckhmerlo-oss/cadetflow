'use client'

import { createClient } from '@/utils/supabase/client'
import { useState, useEffect } from 'react'
import { createAdminRoleAction, updateAdminRoleAction, deleteAdminRoleAction } from '../actions'

type Role = {
  id: string; role_name: string; default_role_level: number;
  company_id: string | null; approval_group_id: string | null;
  can_manage_own_company_roster: boolean; can_manage_all_rosters: boolean;
}
type Company = { id: string; company_name: string; }
type ApprovalGroup = { id: string; group_name: string; company_id: string; }

export default function RolesTab() {
  const supabase = createClient()
  const [roles, setRoles] = useState<Role[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [approvalGroups, setApprovalGroups] = useState<ApprovalGroup[]>([])
  const [loading, setLoading] = useState(true)
  
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Role>>({})
  const [isCreating, setIsCreating] = useState(false)
  const [createForm, setCreateForm] = useState<Partial<Role>>({ default_role_level: 0, can_manage_own_company_roster: false, can_manage_all_rosters: false, company_id: '', approval_group_id: '' })

  useEffect(() => { Promise.all([fetchRoles(), fetchCompanies(), fetchGroups()]).then(() => setLoading(false)) }, [])

  async function fetchRoles() { const { data } = await supabase.from('roles').select('*').order('default_role_level', { ascending: false }); if (data) setRoles(data) }
  async function fetchCompanies() { const { data } = await supabase.from('companies').select('id, company_name').order('company_name'); if (data) setCompanies(data) }
  async function fetchGroups() { const { data } = await supabase.from('approval_groups').select('id, group_name, company_id').order('group_name'); if (data) setApprovalGroups(data) }

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
    if (result?.error) alert(`Error: ${result.error}`)
    else { setIsCreating(false); setCreateForm({ default_role_level: 0, can_manage_own_company_roster: false, can_manage_all_rosters: false, company_id: '', approval_group_id: '' }); fetchRoles() }
  }

  const handleEditCheck = (field: 'can_manage_own_company_roster' | 'can_manage_all_rosters', checked: boolean) => {
      setEditForm(prev => {
          const next = { ...prev, [field]: checked };
          if (field === 'can_manage_all_rosters' && checked) next.can_manage_own_company_roster = true;
          return next;
      })
  }

  const startEdit = (role: Role) => { setEditingId(role.id); setEditForm(role); }
  const saveEdit = async () => {
    if (!editingId) return
    const formData = new FormData()
    formData.append('roleId', editingId); formData.append('roleName', editForm.role_name || ''); formData.append('defaultLevel', editForm.default_role_level?.toString() || '0')
    if (editForm.company_id) formData.append('companyId', editForm.company_id); if (editForm.approval_group_id) formData.append('approvalGroupId', editForm.approval_group_id)
    if (editForm.can_manage_own_company_roster) formData.append('canManageOwn', 'on'); if (editForm.can_manage_all_rosters) formData.append('canManageAll', 'on')

    const result = await updateAdminRoleAction(formData)
    if (result?.error) alert(`Error: ${result.error}`); else { await fetchRoles(); setEditingId(null) }
  }

  const handleDelete = async (id: string) => { if(!confirm("Are you sure?")) return; const result = await deleteAdminRoleAction(id); if (result?.error) alert(result.error); else fetchRoles() }
  const getGroupsForCompany = (companyId: string | null | undefined) => { if (!companyId) return []; return approvalGroups.filter(g => g.company_id === companyId) }

  if (loading) return <div className="p-8 text-muted-foreground">Loading roles...</div>

  // Standard Styling
  const inputClass = "w-full p-1 border border-input rounded text-sm bg-background text-foreground focus:ring-primary focus:border-primary";

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Role Configuration</h2>
        <button onClick={() => setIsCreating(true)} disabled={isCreating} className="btn-primary py-1">+ Add Role</button>
      </div>

      <div className="bg-primary/5 p-4 rounded-md border border-primary/20 text-sm text-primary">
        <p><strong>Note:</strong> "Approval Group" links a role to the Chain of Command. You must select a Company first.</p>
      </div>

      {/* UPDATED WRAPPER: overflow-x-auto handles the horizontal scroll */}
      <div className="card-base w-full overflow-x-auto">
        {/* UPDATED TABLE: min-w-[900px] ensures columns don't squish out of view */}
        <table className="w-full min-w-[900px] divide-y divide-border">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase">Role Name</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase">Company</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase">Appr. Group</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase">Lvl</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase">Perms</th>
              <th className="px-4 py-3 text-right text-xs font-bold text-muted-foreground uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">
            
            {/* CREATION ROW */}
            {isCreating && (
              <tr className="bg-primary/5">
                <td className="px-4 py-4 align-top"><input placeholder="Role Name" className={inputClass} value={createForm.role_name || ''} onChange={e => setCreateForm({...createForm, role_name: e.target.value})} /></td>
                <td className="px-4 py-4 align-top">
                    <select className={inputClass} value={createForm.company_id || ''} onChange={e => setCreateForm({...createForm, company_id: e.target.value || null, approval_group_id: ''})}>
                        <option value="">Global</option>
                        {companies.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
                    </select>
                </td>
                <td className="px-4 py-4 align-top">
                    <select className={inputClass} value={createForm.approval_group_id || ''} onChange={e => setCreateForm({...createForm, approval_group_id: e.target.value || null})} disabled={!createForm.company_id}>
                        <option value="">None</option>
                        {getGroupsForCompany(createForm.company_id).map(g => <option key={g.id} value={g.id}>{g.group_name}</option>)}
                    </select>
                </td>
                <td className="px-4 py-4 align-top"><input type="number" className={`w-12 ${inputClass}`} value={createForm.default_role_level} onChange={e => setCreateForm({...createForm, default_role_level: Number(e.target.value)})} /></td>
                <td className="px-4 py-4 align-top text-xs space-y-1">
                    <label className="flex items-center gap-1 text-foreground"><input type="checkbox" checked={createForm.can_manage_own_company_roster || false} onChange={e => handleCreateCheck('can_manage_own_company_roster', e.target.checked)}/> Own</label>
                    <label className="flex items-center gap-1 text-foreground"><input type="checkbox" checked={createForm.can_manage_all_rosters || false} onChange={e => handleCreateCheck('can_manage_all_rosters', e.target.checked)}/> All</label>
                </td>
                <td className="px-4 py-4 text-right space-x-2 align-top">
                    <button onClick={handleCreate} className="text-green-600 font-medium hover:underline text-xs">Save</button>
                    <button onClick={() => setIsCreating(false)} className="text-destructive hover:underline text-xs">Cancel</button>
                </td>
              </tr>
            )}

            {/* DATA ROWS */}
            {roles.map((role) => (
              <tr key={role.id} className="hover:bg-muted/30 transition-colors">
                {editingId === role.id ? (
                  <>
                    <td className="px-4 py-4 align-top"><input className={inputClass} value={editForm.role_name || ''} onChange={e => setEditForm({...editForm, role_name: e.target.value})} /></td>
                    <td className="px-4 py-4 align-top">
                        <select className={inputClass} value={editForm.company_id || ''} onChange={e => setEditForm({...editForm, company_id: e.target.value || null, approval_group_id: ''})}>
                            <option value="">Global</option>
                            {companies.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
                        </select>
                    </td>
                    <td className="px-4 py-4 align-top">
                        <select className={inputClass} value={editForm.approval_group_id || ''} onChange={e => setEditForm({...editForm, approval_group_id: e.target.value || null})} disabled={!editForm.company_id}>
                            <option value="">None</option>
                            {getGroupsForCompany(editForm.company_id).map(g => <option key={g.id} value={g.id}>{g.group_name}</option>)}
                        </select>
                    </td>
                    <td className="px-4 py-4 align-top"><input type="number" className={`w-12 ${inputClass}`} value={editForm.default_role_level || 0} onChange={e => setEditForm({...editForm, default_role_level: Number(e.target.value)})} /></td>
                    <td className="px-4 py-4 align-top text-xs space-y-1">
                        <label className="flex items-center gap-1 text-foreground"><input type="checkbox" checked={editForm.can_manage_own_company_roster || false} onChange={e => handleEditCheck('can_manage_own_company_roster', e.target.checked)}/> Own</label>
                        <label className="flex items-center gap-1 text-foreground"><input type="checkbox" checked={editForm.can_manage_all_rosters || false} onChange={e => handleEditCheck('can_manage_all_rosters', e.target.checked)}/> All</label>
                    </td>
                    <td className="px-4 py-4 text-right space-x-2 align-top">
                        <button onClick={saveEdit} className="text-green-600 font-medium hover:underline text-xs">Save</button>
                        <button onClick={() => setEditingId(null)} className="text-muted-foreground hover:underline text-xs">Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-foreground">{role.role_name}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">{companies.find(c => c.id === role.company_id)?.company_name || '-'}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">{approvalGroups.find(g => g.id === role.approval_group_id)?.group_name || '-'}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">{role.default_role_level}</td>
                    <td className="px-4 py-4 text-xs text-muted-foreground">
                        {role.can_manage_all_rosters ? 'All' : role.can_manage_own_company_roster ? 'Own' : '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => startEdit(role)} className="text-primary hover:text-primary/80 mr-2 transition-colors">Edit</button>
                      <button onClick={() => handleDelete(role.id)} className="text-destructive hover:text-destructive/80 transition-colors">Delete</button>
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