'use client'
import { useState, useEffect } from 'react'
import { createGroupAction, createSubordinateGroupAction, getAllApprovalGroups } from '../actions'

interface AddGroupModalProps {
  isOpen: boolean
  onClose: () => void
  companyId: string
  referenceGroupId: string | null
  mode: 'genesis' | 'add_parent' | 'add_child' 
  onSuccess: () => void
}

type GroupOption = { id: string; label: string }

export default function AddGroupModal({ isOpen, onClose, companyId, referenceGroupId, mode, onSuccess }: AddGroupModalProps) {
  const [tab, setTab] = useState<'new' | 'existing'>('new')
  const [name, setName] = useState('')
  const [selectedGroupId, setSelectedGroupId] = useState('')
  
  const [options, setOptions] = useState<GroupOption[]>([])
  const [loadingOptions, setLoadingOptions] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch options on mount
  useEffect(() => {
    if (isOpen) {
        setLoadingOptions(true)
        getAllApprovalGroups().then(data => {
            setOptions(data)
            setLoadingOptions(false)
        })
    }
  }, [isOpen])

  const getTitle = () => {
      switch(mode) {
          case 'genesis': return 'Create First Group';
          case 'add_parent': return 'Insert Next Approver';
          case 'add_child': return 'Add Reporting Group';
      }
  }

  const getDescription = () => {
      switch(mode) {
          case 'genesis': return 'Start the chain of command for this company.';
          case 'add_parent': return 'This group will APPROVE reports from the selected group.';
          case 'add_child': return 'This group will REPORT TO the selected group.';
      }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (tab === 'new' && !name.trim()) return
    if (tab === 'existing' && !selectedGroupId) return
    
    setIsSubmitting(true)
    let result;

    const existingId = tab === 'existing' ? selectedGroupId : null;
    const newName = tab === 'new' ? name : null;

    if (mode === 'add_child' && referenceGroupId) {
        // Add Subordinate
        result = await createSubordinateGroupAction(companyId, newName, referenceGroupId, existingId)
    } else {
        // Add Parent (or Genesis)
        result = await createGroupAction(companyId, newName, referenceGroupId, existingId)
    }

    setIsSubmitting(false)

    if (result?.error) {
      alert(result.error)
    } else {
      onSuccess()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-card p-6 rounded-lg shadow-xl w-96 border border-border">
        <h2 className="text-lg font-bold mb-2 text-foreground">
            {getTitle()}
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          {getDescription()}
        </p>
        
        {/* TABS */}
        <div className="flex border-b border-border mb-4">
            <button 
                type="button"
                onClick={() => setTab('new')}
                className={`flex-1 pb-2 text-sm font-medium transition-colors ${tab === 'new' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
                Create New
            </button>
            <button 
                type="button"
                onClick={() => setTab('existing')}
                className={`flex-1 pb-2 text-sm font-medium transition-colors ${tab === 'existing' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
                Select Existing
            </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          
          {tab === 'new' ? (
              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-1">Group Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)}
                  placeholder={mode === 'genesis' ? "e.g. Squad Leaders" : "e.g. Commandant"}
                  className="w-full rounded-md border-input bg-background text-foreground p-2 border"
                  autoFocus
                />
              </div>
          ) : (
              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-1">Select Group</label>
                <select 
                    value={selectedGroupId}
                    onChange={e => setSelectedGroupId(e.target.value)}
                    className="w-full rounded-md border-input bg-background text-foreground p-2 border"
                    disabled={loadingOptions}
                >
                    <option value="">-- Choose Group --</option>
                    {options.map(opt => (
                        <option key={opt.id} value={opt.id}>{opt.label}</option>
                    ))}
                </select>
                {loadingOptions && <p className="text-xs text-muted-foreground mt-1">Loading list...</p>}
              </div>
          )}

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded transition-colors">Cancel</button>
            <button 
              type="submit" 
              disabled={isSubmitting || (tab === 'new' ? !name.trim() : !selectedGroupId)}
              className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Saving...' : (tab === 'new' ? 'Create' : 'Link Group')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}