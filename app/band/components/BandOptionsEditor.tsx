'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

const BAND_CATEGORIES = [
  { id: 'instrument', label: 'Instruments', group: true },
  { id: 'band_role', label: 'Leadership Roles', group: false }
]

type Option = {
  id: string
  value: string
  group_name?: string
  sort_order: number
}

type Props = {
  onClose: () => void
}

export default function BandOptionsEditor({ onClose }: Props) {
  const supabase = createClient()
  const [selectedCategory, setSelectedCategory] = useState(BAND_CATEGORIES[0].id)
  const [items, setItems] = useState<Option[]>([])
  const [loading, setLoading] = useState(true)
  
  const [newValue, setNewValue] = useState('')
  const [newGroup, setNewGroup] = useState('')

  const currentCatConfig = BAND_CATEGORIES.find(c => c.id === selectedCategory)

  useEffect(() => {
    fetchItems()
  }, [selectedCategory])

  const fetchItems = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('app_options')
      .select('*')
      .eq('category', selectedCategory)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
    
    setItems(data as Option[] || [])
    setLoading(false)
  }

  const handleAddItem = async () => {
    if (!newValue.trim()) return
    
    const newOrder = items.length > 0 ? Math.max(...items.map(i => i.sort_order)) + 10 : 10

    const { error } = await supabase
      .from('app_options')
      .insert({
        category: selectedCategory,
        value: newValue.trim(),
        group_name: currentCatConfig?.group ? newGroup.trim() : null,
        sort_order: newOrder
      })
    
    if (error) {
        alert('Error adding item: ' + error.message)
    } else {
        setNewValue('')
        // Keep group populated for rapid entry of sections
        fetchItems()
    }
  }

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure? This will remove it from the dropdown list.')) return
    const { error } = await supabase.from('app_options').delete().eq('id', id)
    if (error) alert(error.message)
    else fetchItems()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card border border-border w-full max-w-2xl rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
        
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-border bg-muted/30 flex justify-between items-center">
            <div>
                <h3 className="text-lg font-bold text-foreground">Band Settings</h3>
                <p className="text-sm text-muted-foreground">Manage instruments and roles</p>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>

        {/* TABS */}
        <div className="flex border-b border-border">
            {BAND_CATEGORIES.map(cat => (
                <button
                    key={cat.id}
                    onClick={() => { setSelectedCategory(cat.id); setNewGroup(''); }}
                    className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${
                        selectedCategory === cat.id 
                        ? 'border-primary text-primary bg-primary/5' 
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                >
                    {cat.label}
                </button>
            ))}
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-hidden flex flex-col p-6">
            
            {/* ADD NEW FORM */}
            <div className="mb-6 flex gap-2 items-end bg-muted/20 p-4 rounded-lg border border-border">
                <div className="flex-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">
                        New {currentCatConfig?.label.slice(0, -1)} Name
                    </label>
                    <input 
                        type="text" 
                        value={newValue}
                        onChange={e => setNewValue(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddItem()}
                        placeholder={`e.g. ${currentCatConfig?.group ? 'Trombone' : 'Section Leader'}`}
                        className="w-full input-base bg-background"
                    />
                </div>

                {currentCatConfig?.group && (
                    <div className="w-1/3">
                        <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Section</label>
                        <input 
                            type="text" 
                            value={newGroup}
                            onChange={e => setNewGroup(e.target.value)}
                            placeholder="e.g. Brass"
                            className="w-full input-base bg-background"
                            list="section-suggestions"
                        />
                        <datalist id="section-suggestions">
                            {[...new Set(items.map(i => i.group_name).filter(Boolean))].map(g => <option key={g} value={g!} />)}
                        </datalist>
                    </div>
                )}

                <button onClick={handleAddItem} disabled={!newValue.trim()} className="btn-primary h-10 px-6">
                    Add
                </button>
            </div>

            {/* LIST */}
            <div className="flex-1 overflow-y-auto border border-border rounded-md">
                {loading ? (
                    <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : items.length > 0 ? (
                    <ul className="divide-y divide-border">
                        {items.map(item => (
                            <li key={item.id} className="px-4 py-3 flex justify-between items-center group bg-card hover:bg-muted/50 transition-colors">
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-foreground">{item.value}</span>
                                    {item.group_name && (
                                        <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded w-fit mt-1">
                                            {item.group_name}
                                        </span>
                                    )}
                                </div>
                                <button 
                                    onClick={() => handleDeleteItem(item.id)}
                                    className="text-muted-foreground hover:text-destructive p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Delete"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="p-8 text-center text-sm text-muted-foreground italic">No options found. Add one above.</div>
                )}
            </div>
        </div>

        <div className="p-4 border-t border-border bg-muted/10 text-right">
            <button onClick={onClose} className="px-4 py-2 bg-muted text-foreground rounded-md hover:bg-muted/80 text-sm font-medium">
                Done
            </button>
        </div>
      </div>
    </div>
  )
}