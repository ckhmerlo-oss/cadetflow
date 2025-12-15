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

// CONFIG: Using opacity-based backgrounds to work on all themes (White, Dark, Christmas Green)
const CATEGORY_CONFIG: Record<string, { code: string; label: string; demerits: number; policy_cat: number; color: string }> = {
  '0':  { code: '0',  label: 'Cat 0',  demerits: 0,  policy_cat: 0, color: 'bg-muted text-muted-foreground border-border'},
  '1':  { code: '1',  label: 'Cat 1',  demerits: 3,  policy_cat: 1, color: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20' },
  '2a': { code: '2a', label: 'Cat 2a', demerits: 6,  policy_cat: 2, color: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20' },
  '2b': { code: '2b', label: 'Cat 2b', demerits: 10, policy_cat: 2, color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20' },
  '3a': { code: '3a', label: 'Cat 3a', demerits: 15, policy_cat: 3, color: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' },
  '3b': { code: '3b', label: 'Cat 3b', demerits: 25, policy_cat: 3, color: 'bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30' },
  '3c': { code: '3c', label: 'Cat 3c', demerits: 35, policy_cat: 3, color: 'bg-destructive/20 text-destructive border-destructive/30' },
}

type SortKey = 'category' | 'name' | 'group' | 'demerits'
type SortDirection = 'asc' | 'desc'

export default function InfractionsTab() {
  const supabase = createClient()
  const [infractions, setInfractions] = useState<OffenseType[]>([])
  const [loading, setLoading] = useState(true)
  
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({ key: 'category', direction: 'asc' })
  
  // Edit & Create States
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<OffenseType>>({})
  const [editCategoryKey, setEditCategoryKey] = useState<string>('1')
  const [isEditingCustomGroup, setIsEditingCustomGroup] = useState(false)

  const [isCreating, setIsCreating] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createGroup, setCreateGroup] = useState('') 
  const [createCategoryKey, setCreateCategoryKey] = useState('1')
  const [isCreatingCustomGroup, setIsCreatingCustomGroup] = useState(false)

  useEffect(() => { fetchInfractions() }, [])

  async function fetchInfractions() {
    setLoading(true)
    const { data, error } = await supabase.from('offense_types').select('*')
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
      let valA: any = '', valB: any = ''
      switch (sortConfig.key) {
        case 'category':
          if (a.policy_category !== b.policy_category) return sortConfig.direction === 'asc' ? a.policy_category - b.policy_category : b.policy_category - a.policy_category
          return sortConfig.direction === 'asc' ? a.demerits - b.demerits : b.demerits - a.demerits
        case 'name': valA = a.offense_name.toLowerCase(); valB = b.offense_name.toLowerCase(); break
        case 'group': valA = (a.offense_group || '').toLowerCase(); valB = (b.offense_group || '').toLowerCase(); break
        case 'demerits': valA = a.demerits; valB = b.demerits; break
      }
      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
    return sorted
  }, [infractions, sortConfig])

  // --- Helpers ---
  const handleSort = (key: SortKey) => {
    setSortConfig(current => ({ key, direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc' }))
  }

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortConfig.key !== column) return <span className="text-muted-foreground/30 ml-1 text-[10px]">⇅</span>
    return <span className="text-primary ml-1 text-[10px]">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>
  }

  const getCategoryKeyFromCode = (code: string | null) => {
    if (code && CATEGORY_CONFIG[code]) return code;
    return '1';
  }

  // --- Handlers ---
  const handleCreate = async () => {
    if (!createName || !createGroup) { alert("Offense Name and Group are required."); return }
    const config = CATEGORY_CONFIG[createCategoryKey];

    const { error } = await supabase.rpc('admin_create_infraction', {
      p_offense_name: createName, p_policy_category: config.policy_cat, p_demerits: config.demerits, p_offense_code: config.code, p_offense_group: createGroup
    })
    
    if (error) alert(`Error creating: ${error.message}`)
    else { setIsCreating(false); setCreateName(''); setCreateGroup(''); setIsCreatingCustomGroup(false); setCreateCategoryKey('1'); fetchInfractions() }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this infraction?")) return;
    const { error } = await supabase.rpc('admin_delete_infraction', { p_id: id })
    if (error) alert(`Error deleting: ${error.message}`)
    else setInfractions(prev => prev.filter(i => i.id !== id))
  }

  const startEdit = (infraction: OffenseType) => {
    setEditingId(infraction.id); setEditForm(infraction);
    setEditCategoryKey(getCategoryKeyFromCode(infraction.offense_code)); setIsEditingCustomGroup(false);
  }

  const saveEdit = async () => {
    if (!editingId) return
    const config = CATEGORY_CONFIG[editCategoryKey];
    const { error } = await supabase.rpc('admin_update_infraction', {
      p_id: editingId, p_offense_name: editForm.offense_name, p_policy_category: config.policy_cat, p_demerits: config.demerits, p_offense_code: config.code, p_offense_group: editForm.offense_group
    })

    if (error) alert(`Error updating: ${error.message}`)
    else {
      setInfractions(prev => prev.map(item => item.id === editingId ? { 
          ...item, offense_name: editForm.offense_name!, offense_group: editForm.offense_group!, policy_category: config.policy_cat, demerits: config.demerits, offense_code: config.code
      } : item))
      setEditingId(null)
    }
  }

  if (loading) return <div className="p-8 text-muted-foreground">Loading infractions...</div>

  // --- Styles ---
  const inputClass = "w-full p-2 border border-input rounded text-sm bg-background text-foreground shadow-sm focus:border-primary focus:ring-primary";

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Infraction Catalog</h2>
        <button onClick={() => setIsCreating(true)} disabled={isCreating} className="btn-primary">
          + Add Infraction
        </button>
      </div>

      <div className="card-base">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase w-32 cursor-pointer hover:bg-muted/80" onClick={() => handleSort('category')}>Category <SortIcon column="category"/></th>
              <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase cursor-pointer hover:bg-muted/80" onClick={() => handleSort('name')}>Offense Name <SortIcon column="name"/></th>
              <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase w-48 cursor-pointer hover:bg-muted/80" onClick={() => handleSort('group')}>Group <SortIcon column="group"/></th>
              <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase w-24 cursor-pointer hover:bg-muted/80" onClick={() => handleSort('demerits')}>Demerits <SortIcon column="demerits"/></th>
              <th className="px-6 py-3 text-right text-xs font-bold text-muted-foreground uppercase w-48">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">
            
            {/* CREATION ROW */}
            {isCreating && (
              <tr className="bg-primary/5 border-l-4 border-primary">
                <td className="px-6 py-4 align-top">
                    <select className={inputClass} value={createCategoryKey} onChange={e => setCreateCategoryKey(e.target.value)}>
                        {Object.entries(CATEGORY_CONFIG).map(([key, conf]) => ( <option key={key} value={key}>{conf.label}</option> ))}
                    </select>
                </td>
                <td className="px-6 py-4 align-top">
                    <input placeholder="Offense Name..." className={inputClass} value={createName} onChange={e => setCreateName(e.target.value)} autoFocus />
                </td>
                <td className="px-6 py-4 align-top">
                    {isCreatingCustomGroup ? (
                        <div className="flex gap-1">
                            <input placeholder="New Group" className={inputClass} value={createGroup} onChange={e => setCreateGroup(e.target.value)} />
                            <button onClick={() => setIsCreatingCustomGroup(false)} className="text-xs text-primary hover:underline">List</button>
                        </div>
                    ) : (
                        <select className={inputClass} value={createGroup} onChange={(e) => {
                                if (e.target.value === '__NEW__') { setIsCreatingCustomGroup(true); setCreateGroup('') } else { setCreateGroup(e.target.value) }
                            }}>
                            <option value="">Select Group...</option>
                            {uniqueGroups.map(g => <option key={g} value={g}>{g}</option>)}
                            <option value="__NEW__" className="text-primary font-bold">+ Create New</option>
                        </select>
                    )}
                </td>
                <td className="px-6 py-4 align-top">
                    <div className="text-sm font-bold text-muted-foreground pt-2">{CATEGORY_CONFIG[createCategoryKey].demerits}</div>
                </td>
                <td className="px-6 py-4 text-right space-x-3 align-top">
                    <button onClick={handleCreate} className="text-green-600 hover:text-green-700 font-medium text-sm">Save</button>
                    <button onClick={() => setIsCreating(false)} className="text-muted-foreground hover:text-foreground text-sm">Cancel</button>
                </td>
              </tr>
            )}

            {/* DATA ROWS */}
            {sortedInfractions.map((item) => {
                const config = CATEGORY_CONFIG[item.offense_code || ''] || { label: item.offense_code || '?', color: 'bg-muted text-muted-foreground' };

                return (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    {editingId === item.id ? (
                      <>
                        <td className="px-6 py-4 align-top">
                            <select className={inputClass} value={editCategoryKey} onChange={e => setEditCategoryKey(e.target.value)}>
                                {Object.entries(CATEGORY_CONFIG).map(([key, conf]) => ( <option key={key} value={key}>{conf.label}</option> ))}
                            </select>
                        </td>
                        <td className="px-6 py-4 align-top">
                            <input className={inputClass} value={editForm.offense_name || ''} onChange={e => setEditForm({...editForm, offense_name: e.target.value})} />
                        </td>
                        <td className="px-6 py-4 align-top">
                            {isEditingCustomGroup ? (
                                <div className="flex gap-1">
                                    <input className={inputClass} value={editForm.offense_group || ''} onChange={e => setEditForm({...editForm, offense_group: e.target.value})} />
                                    <button onClick={() => setIsEditingCustomGroup(false)} className="text-xs text-primary">List</button>
                                </div>
                            ) : (
                                <select className={inputClass} value={editForm.offense_group || ''} onChange={(e) => {
                                        if (e.target.value === '__NEW__') { setIsEditingCustomGroup(true); setEditForm({...editForm, offense_group: ''}) } else { setEditForm({...editForm, offense_group: e.target.value}) }
                                    }}>
                                    <option value="">Select...</option>
                                    {uniqueGroups.map(g => <option key={g} value={g}>{g}</option>)}
                                    <option value="__NEW__" className="text-primary font-bold">+ New Group</option>
                                </select>
                            )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-muted-foreground align-top pt-2">
                            {CATEGORY_CONFIG[editCategoryKey].demerits}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2 align-top">
                            <button onClick={saveEdit} className="text-green-600 hover:underline text-sm font-medium">Save</button>
                            <button onClick={() => setEditingId(null)} className="text-muted-foreground hover:underline text-sm">Cancel</button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${config.color}`}>
                                {config.label}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-foreground">{item.offense_name}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
                                {item.offense_group || 'General'}
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-foreground">{item.demerits}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                          <button onClick={() => startEdit(item)} className="text-primary hover:text-primary/80 transition-colors">Edit</button>
                          <button onClick={() => handleDelete(item.id)} className="text-destructive hover:text-destructive/80 transition-colors">Delete</button>
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