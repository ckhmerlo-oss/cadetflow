'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

type Option = {
  id: string
  value: string
  sort_order: number
}

const CATEGORIES = [
  { id: 'rank', label: 'Cadet Ranks' },
  { id: 'grade', label: 'Grade Levels' },
  { id: 'conduct', label: 'Conduct Statuses' },
  { id: 'probation', label: 'Probation Types' },
  { id: 'extracurricular', label: 'Extracurricular Activities' }
]

export default function OptionsTab() {
  const supabase = createClient()
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0].id)
  const [items, setItems] = useState<Option[]>([])
  const [loading, setLoading] = useState(true)
  const [newValue, setNewValue] = useState('')

  // Fetch items when category changes
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
        sort_order: newOrder
      })
    
    if (error) {
        alert(error.message)
    } else {
        setNewValue('')
        fetchItems()
    }
  }

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to remove this option?')) return

    // Soft delete usually safer, but hard delete works if no FK constraints
    const { error } = await supabase
        .from('app_options')
        .delete()
        .eq('id', id)

    if (error) alert(error.message)
    else fetchItems()
  }

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-bold text-foreground mb-4">Dropdown Editor</h2>
        <p className="text-muted-foreground text-sm mb-6">Manage the standard lists used in cadet profiles.</p>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-64 space-y-1">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedCategory === cat.id 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted/50 text-foreground hover:bg-muted'
                }`}
              >
                {cat.label}
              </button>
            ))}
            
            <div className="pt-4 mt-4 border-t border-border">
                <p className="px-4 text-xs text-muted-foreground uppercase font-bold">Note</p>
                <p className="px-4 text-xs text-muted-foreground mt-1">Sports are managed in the Sports Dashboard, not here.</p>
            </div>
          </div>

          {/* Editor Area */}
          <div className="flex-1">
            <div className="mb-4 flex gap-2">
              <input 
                type="text" 
                value={newValue}
                onChange={e => setNewValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddItem()}
                placeholder={`Add new ${CATEGORIES.find(c => c.id === selectedCategory)?.label.slice(0, -1)}...`}
                className="flex-1 input-base"
              />
              <button onClick={handleAddItem} disabled={!newValue.trim()} className="btn-primary">
                Add
              </button>
            </div>

            {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : (
                <div className="bg-muted/30 rounded-md border border-border overflow-hidden">
                    {items.length > 0 ? (
                        <ul className="divide-y divide-border">
                            {items.map(item => (
                                <li key={item.id} className="px-4 py-3 flex justify-between items-center group bg-card hover:bg-muted/50 transition-colors">
                                    <span className="text-sm font-medium text-foreground">{item.value}</span>
                                    <button 
                                        onClick={() => handleDeleteItem(item.id)}
                                        className="text-muted-foreground hover:text-destructive p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Delete"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="p-8 text-center text-sm text-muted-foreground italic">No items found.</div>
                    )}
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}