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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-96 border dark:border-gray-700">
        <h2 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">
            {getTitle()}
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          {getDescription()}
        </p>
        
        {/* TABS */}
        <div className="flex border-b dark:border-gray-700 mb-4">
            <button 
                type="button"
                onClick={() => setTab('new')}
                className={`flex-1 pb-2 text-sm font-medium ${tab === 'new' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
            >
                Create New
            </button>
            <button 
                type="button"
                onClick={() => setTab('existing')}
                className={`flex-1 pb-2 text-sm font-medium ${tab === 'existing' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
            >
                Select Existing
            </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          
          {tab === 'new' ? (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Group Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)}
                  placeholder={mode === 'genesis' ? "e.g. Squad Leaders" : "e.g. Commandant"}
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white p-2"
                  autoFocus
                />
              </div>
          ) : (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Group</label>
                <select 
                    value={selectedGroupId}
                    onChange={e => setSelectedGroupId(e.target.value)}
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white p-2"
                    disabled={loadingOptions}
                >
                    <option value="">-- Choose Group --</option>
                    {options.map(opt => (
                        <option key={opt.id} value={opt.id}>{opt.label}</option>
                    ))}
                </select>
                {loadingOptions && <p className="text-xs text-gray-500 mt-1">Loading list...</p>}
              </div>
          )}

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">Cancel</button>
            <button 
              type="submit" 
              disabled={isSubmitting || (tab === 'new' ? !name.trim() : !selectedGroupId)}
              className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : (tab === 'new' ? 'Create' : 'Link Group')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}