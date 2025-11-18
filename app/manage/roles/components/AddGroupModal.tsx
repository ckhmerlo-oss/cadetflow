// app/manage/roles/components/AddGroupModal.tsx
'use client'
import { useState } from 'react'
import { createGroupAction } from '../actions'

interface AddGroupModalProps {
  isOpen: boolean
  onClose: () => void
  companyId: string
  childGroupId: string // The group that will report TO this new group
  onSuccess: () => void
}

export default function AddGroupModal({ isOpen, onClose, companyId, childGroupId, onSuccess }: AddGroupModalProps) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    
    setLoading(true)
    const result = await createGroupAction(companyId, name, childGroupId)
    setLoading(false)

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
        <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Insert Approval Step</h2>
        <p className="text-sm text-gray-500 mb-4">
          This new group will approve reports coming from the selected group, and then forward them up the existing chain.
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Group Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Platoon Sergeant"
              className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white p-2"
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">Cancel</button>
            <button 
              type="submit" 
              disabled={loading || !name.trim()}
              className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Create & Insert'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}