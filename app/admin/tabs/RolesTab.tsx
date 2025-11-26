'use client'

import { createClient } from '@/utils/supabase/client'
import { useState, useEffect } from 'react'

type Role = {
  id: string;
  role_name: string;
  default_role_level: number;
}

export default function RolesTab() {
  const supabase = createClient()
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  
  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Role>>({})

  // Create State
  const [isCreating, setIsCreating] = useState(false)
  const [createForm, setCreateForm] = useState<Partial<Role>>({ default_role_level: 0 })

  useEffect(() => {
    fetchRoles()
  }, [])

  async function fetchRoles() {
    setLoading(true)
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .order('default_role_level', { ascending: false })
    
    if (!error && data) setRoles(data)
    setLoading(false)
  }

  // --- UPDATED CREATE HANDLER ---
  const handleCreate = async () => {
    if (!createForm.role_name) {
      alert("Role Name is required.")
      return
    }

    // CALL THE NEW SECURE FUNCTION
    const { error } = await supabase.rpc('admin_create_role', {
      p_role_name: createForm.role_name,
      p_default_role_level: createForm.default_role_level || 0
    })
    
    if (error) {
      alert(`Error creating role: ${error.message}`)
    } else {
      setIsCreating(false)
      setCreateForm({ default_role_level: 0 }) // Reset
      fetchRoles() // Refresh
    }
  }

  // --- Edit Handlers ---
  const startEdit = (role: Role) => {
    setEditingId(role.id)
    setEditForm(role)
  }

  const saveEdit = async () => {
    if (!editingId) return
    
    const { error } = await supabase
      .from('roles')
      .update({
        role_name: editForm.role_name,
        default_role_level: editForm.default_role_level
      })
      .eq('id', editingId)

    if (error) {
      alert(`Error updating: ${error.message}`)
    } else {
      setRoles(prev => prev.map(r => r.id === editingId ? { ...r, ...editForm } as Role : r))
      setEditingId(null)
    }
  }

  if (loading) return <div className="p-8 text-gray-500">Loading roles...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Role Configuration</h2>
        <button 
          onClick={() => setIsCreating(true)} 
          disabled={isCreating}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          + Add Role
        </button>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Note:</strong> The "Level" determines hierarchy. 
          <br/>0-10: Cadets
          <br/>15-49: Cadet Leaders
          <br/>50-89: Staff/Faculty
          <br/>90+: Administrators
        </p>
      </div>

      <div className="border rounded-lg overflow-hidden dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Role Name</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Level (0-100)</th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            
            {/* CREATION ROW */}
            {isCreating && (
              <tr className="bg-indigo-50 dark:bg-indigo-900/20">
                <td className="px-6 py-4">
                    <input 
                        placeholder="New Role Name" 
                        className="w-full p-1 border rounded text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white" 
                        value={createForm.role_name || ''} 
                        onChange={e => setCreateForm({...createForm, role_name: e.target.value})} 
                    />
                </td>
                <td className="px-6 py-4">
                    <input 
                        type="number" 
                        className="w-20 p-1 border rounded text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white" 
                        value={createForm.default_role_level} 
                        onChange={e => setCreateForm({...createForm, default_role_level: Number(e.target.value)})} 
                        min={0} max={105}
                    />
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={handleCreate} className="text-green-600 font-medium hover:underline">Create</button>
                    <button onClick={() => setIsCreating(false)} className="text-red-500 hover:underline">Cancel</button>
                </td>
              </tr>
            )}

            {/* DATA ROWS */}
            {roles.map((role) => (
              <tr key={role.id}>
                {editingId === role.id ? (
                  <>
                    <td className="px-6 py-4">
                        <input className="w-full p-1 border rounded text-sm text-black" value={editForm.role_name || ''} onChange={e => setEditForm({...editForm, role_name: e.target.value})} />
                    </td>
                    <td className="px-6 py-4">
                        <input type="number" className="w-20 p-1 border rounded text-sm text-black" value={editForm.default_role_level || 0} onChange={e => setEditForm({...editForm, default_role_level: Number(e.target.value)})} />
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                        <button onClick={saveEdit} className="text-green-600 font-medium hover:underline">Save</button>
                        <button onClick={() => setEditingId(null)} className="text-gray-500 hover:underline">Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{role.role_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{role.default_role_level}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => startEdit(role)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200">Edit</button>
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