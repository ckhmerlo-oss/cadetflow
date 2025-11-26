'use client'

import { createClient } from '@/utils/supabase/client'
import { useState, useEffect, useMemo } from 'react'

type OffenseType = {
  id: string;
  offense_name: string;
  policy_category: number;
  demerits: number;
  offense_code: string | null;
  offense_group: string | null;
}

// Configuration for the Category System
const CATEGORY_CONFIG: Record<string, { code: string; label: string; demerits: number; policy_cat: number; color: string }> = {
  '1':  { code: '1',  label: 'Cat 1',  demerits: 3,  policy_cat: 1, color: 'bg-green-100 text-green-800 border-green-200' },
  '2a': { code: '2a', label: 'Cat 2a', demerits: 6,  policy_cat: 2, color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  '2b': { code: '2b', label: 'Cat 2b', demerits: 10, policy_cat: 2, color: 'bg-orange-100 text-orange-800 border-orange-200' },
  '3a': { code: '3a', label: 'Cat 3a', demerits: 15, policy_cat: 3, color: 'bg-red-100 text-red-800 border-red-200' },
  '3b': { code: '3b', label: 'Cat 3b', demerits: 25, policy_cat: 3, color: 'bg-red-200 text-red-900 border-red-300' },
  '3c': { code: '3c', label: 'Cat 3c', demerits: 35, policy_cat: 3, color: 'bg-red-900 text-white border-red-700' },
}

// Sorting Types
type SortKey = 'category' | 'name' | 'group' | 'demerits'
type SortDirection = 'asc' | 'desc'

export default function InfractionsTab() {
  const supabase = createClient()
  const [infractions, setInfractions] = useState<OffenseType[]>([])
  const [loading, setLoading] = useState(true)
  
  // Sorting State
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({ key: 'category', direction: 'asc' })

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<OffenseType>>({})
  const [editCategoryKey, setEditCategoryKey] = useState<string>('1')
  const [isEditingCustomGroup, setIsEditingCustomGroup] = useState(false)

  // Create State
  const [isCreating, setIsCreating] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createGroup, setCreateGroup] = useState('') 
  const [createCategoryKey, setCreateCategoryKey] = useState('1')
  const [isCreatingCustomGroup, setIsCreatingCustomGroup] = useState(false)

  useEffect(() => {
    fetchInfractions()
  }, [])

  async function fetchInfractions() {
    setLoading(true)
    const { data, error } = await supabase
      .from('offense_types')
      .select('*')
    
    if (!error && data) setInfractions(data)
    setLoading(false)
  }

  // --- Derived Data ---
  const uniqueGroups = useMemo(() => {
    const groups = new Set(infractions.map(i => i.offense_group).filter(Boolean) as string[])
    return Array.from(groups).sort()
  }, [infractions])

  const sortedInfractions = useMemo(() => {
    const sorted = [...infractions]
    sorted.sort((a, b) => {
      let valA: any = ''
      let valB: any = ''

      switch (sortConfig.key) {
        case 'category':
          // Sort by Policy Category first, then Demerits
          if (a.policy_category !== b.policy_category) {
            return sortConfig.direction === 'asc' ? a.policy_category - b.policy_category : b.policy_category - a.policy_category
          }
          return sortConfig.direction === 'asc' ? a.demerits - b.demerits : b.demerits - a.demerits
        case 'name':
          valA = a.offense_name.toLowerCase()
          valB = b.offense_name.toLowerCase()
          break
        case 'group':
          valA = (a.offense_group || '').toLowerCase()
          valB = (b.offense_group || '').toLowerCase()
          break
        case 'demerits':
          valA = a.demerits
          valB = b.demerits
          break
      }

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
    return sorted
  }, [infractions, sortConfig])

  // --- Helpers ---
  const handleSort = (key: SortKey) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortConfig.key !== column) return <span className="text-gray-300 ml-1 text-[10px]">⇅</span>
    return <span className="text-indigo-600 dark:text-indigo-400 ml-1 text-[10px]">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>
  }

  const getCategoryKeyFromCode = (code: string | null) => {
    if (code && CATEGORY_CONFIG[code]) return code;
    return '1';
  }

  // --- Handlers ---

  const handleCreate = async () => {
    if (!createName || !createGroup) {
      alert("Offense Name and Group are required.")
      return
    }

    const config = CATEGORY_CONFIG[createCategoryKey];

    const { error } = await supabase.rpc('admin_create_infraction', {
      p_offense_name: createName,
      p_policy_category: config.policy_cat,
      p_demerits: config.demerits,
      p_offense_code: config.code,
      p_offense_group: createGroup
    })
    
    if (error) {
      alert(`Error creating: ${error.message}`)
    } else {
      setIsCreating(false)
      setCreateName('')
      setCreateGroup('')
      setIsCreatingCustomGroup(false)
      setCreateCategoryKey('1')
      fetchInfractions()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this infraction? This cannot be undone.")) return;

    const { error } = await supabase.rpc('admin_delete_infraction', { p_id: id })
    
    if (error) {
      alert(`Error deleting: ${error.message}`)
    } else {
      setInfractions(prev => prev.filter(i => i.id !== id))
    }
  }

  const startEdit = (infraction: OffenseType) => {
    setEditingId(infraction.id)
    setEditForm(infraction)
    setEditCategoryKey(getCategoryKeyFromCode(infraction.offense_code))
    setIsEditingCustomGroup(false) // Reset to dropdown mode initially
  }

  const saveEdit = async () => {
    if (!editingId) return
    
    const config = CATEGORY_CONFIG[editCategoryKey];

    const { error } = await supabase.rpc('admin_update_infraction', {
      p_id: editingId,
      p_offense_name: editForm.offense_name,
      p_policy_category: config.policy_cat,
      p_demerits: config.demerits,
      p_offense_code: config.code,
      p_offense_group: editForm.offense_group
    })

    if (error) {
      alert(`Error updating: ${error.message}`)
    } else {
      setInfractions(prev => prev.map(item => item.id === editingId ? { 
          ...item, 
          offense_name: editForm.offense_name!,
          offense_group: editForm.offense_group!,
          policy_category: config.policy_cat,
          demerits: config.demerits,
          offense_code: config.code
      } : item))
      setEditingId(null)
    }
  }

  if (loading) return <div className="p-8 text-gray-500">Loading infractions...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Infraction Catalog</h2>
        <button 
          onClick={() => setIsCreating(true)} 
          disabled={isCreating}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          + Add Infraction
        </button>
      </div>

      <div className="border rounded-lg overflow-hidden dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase w-32 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => handleSort('category')}>Category <SortIcon column="category"/></th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => handleSort('name')}>Offense Name <SortIcon column="name"/></th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase w-48 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => handleSort('group')}>Group <SortIcon column="group"/></th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase w-24 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => handleSort('demerits')}>Demerits <SortIcon column="demerits"/></th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase w-48">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            
            {/* CREATION ROW */}
            {isCreating && (
              <tr className="bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-indigo-500">
                <td className="px-6 py-4 align-top">
                    <select 
                        className="block w-full p-2 border rounded text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                        value={createCategoryKey}
                        onChange={e => setCreateCategoryKey(e.target.value)}
                    >
                        {Object.entries(CATEGORY_CONFIG).map(([key, conf]) => (
                            <option key={key} value={key}>{conf.label}</option>
                        ))}
                    </select>
                </td>
                <td className="px-6 py-4 align-top">
                    <input 
                        placeholder="Offense Name..." 
                        className="w-full p-2 border rounded text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white" 
                        value={createName} 
                        onChange={e => setCreateName(e.target.value)} 
                        autoFocus
                    />
                </td>
                <td className="px-6 py-4 align-top">
                    {isCreatingCustomGroup ? (
                        <div className="flex gap-1">
                            <input 
                                placeholder="New Group Name" 
                                className="w-full p-2 border rounded text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white" 
                                value={createGroup} 
                                onChange={e => setCreateGroup(e.target.value)} 
                            />
                            <button onClick={() => setIsCreatingCustomGroup(false)} className="text-xs text-blue-600 hover:underline">List</button>
                        </div>
                    ) : (
                        <select 
                            className="block w-full p-2 border rounded text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                            value={createGroup}
                            onChange={(e) => {
                                if (e.target.value === '__NEW__') {
                                    setIsCreatingCustomGroup(true)
                                    setCreateGroup('')
                                } else {
                                    setCreateGroup(e.target.value)
                                }
                            }}
                        >
                            <option value="">Select Group...</option>
                            {uniqueGroups.map(g => <option key={g} value={g}>{g}</option>)}
                            <option value="__NEW__" className="text-indigo-600 font-bold">+ Create New Group</option>
                        </select>
                    )}
                </td>
                <td className="px-6 py-4 align-top">
                    <div className="text-sm font-bold text-gray-500 pt-2">
                        {CATEGORY_CONFIG[createCategoryKey].demerits}
                    </div>
                </td>
                <td className="px-6 py-4 text-right space-x-3 align-top">
                    <button onClick={handleCreate} className="text-green-600 font-medium hover:text-green-800">Save</button>
                    <button onClick={() => setIsCreating(false)} className="text-gray-500 hover:text-gray-700">Cancel</button>
                </td>
              </tr>
            )}

            {/* DATA ROWS */}
            {sortedInfractions.map((item) => {
                const config = CATEGORY_CONFIG[item.offense_code || ''] || { label: item.offense_code || '?', color: 'bg-gray-100 text-gray-800' };

                return (
                  <tr key={item.id}>
                    {editingId === item.id ? (
                      <>
                        <td className="px-6 py-4 align-top">
                            <select 
                                className="block w-full p-1 border rounded text-sm text-black"
                                value={editCategoryKey}
                                onChange={e => setEditCategoryKey(e.target.value)}
                            >
                                {Object.entries(CATEGORY_CONFIG).map(([key, conf]) => (
                                    <option key={key} value={key}>{conf.label}</option>
                                ))}
                            </select>
                        </td>
                        <td className="px-6 py-4 align-top">
                            <input 
                                className="w-full p-1 border rounded text-sm text-black" 
                                value={editForm.offense_name || ''} 
                                onChange={e => setEditForm({...editForm, offense_name: e.target.value})} 
                            />
                        </td>
                        <td className="px-6 py-4 align-top">
                            {isEditingCustomGroup ? (
                                <div className="flex gap-1">
                                    <input 
                                        className="w-full p-1 border rounded text-sm text-black" 
                                        value={editForm.offense_group || ''} 
                                        onChange={e => setEditForm({...editForm, offense_group: e.target.value})} 
                                    />
                                    <button onClick={() => setIsEditingCustomGroup(false)} className="text-xs text-blue-600">List</button>
                                </div>
                            ) : (
                                <select 
                                    className="block w-full p-1 border rounded text-sm text-black"
                                    value={editForm.offense_group || ''} 
                                    onChange={(e) => {
                                        if (e.target.value === '__NEW__') {
                                            setIsEditingCustomGroup(true)
                                            setEditForm({...editForm, offense_group: ''})
                                        } else {
                                            setEditForm({...editForm, offense_group: e.target.value})
                                        }
                                    }}
                                >
                                    <option value="">Select...</option>
                                    {uniqueGroups.map(g => <option key={g} value={g}>{g}</option>)}
                                    <option value="__NEW__" className="text-indigo-600 font-bold">+ New Group</option>
                                </select>
                            )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-500 align-top pt-2">
                            {CATEGORY_CONFIG[editCategoryKey].demerits}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2 align-top">
                            <button onClick={saveEdit} className="text-green-600 font-medium hover:underline">Save</button>
                            <button onClick={() => setEditingId(null)} className="text-gray-500 hover:underline">Cancel</button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${config.color}`}>
                                {config.label}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{item.offense_name}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                {item.offense_group || 'General'}
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">{item.demerits}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                          <button onClick={() => startEdit(item)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200">Edit</button>
                          <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200">Delete</button>
                        </td>
                      </>
                    )}
                  </tr>
                )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}