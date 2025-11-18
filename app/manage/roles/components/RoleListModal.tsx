'use client'
import { useState, useEffect } from 'react'
import { getGroupRoles, deleteRoleAction, createRoleAction } from '../actions'

interface RoleListModalProps {
  isOpen: boolean
  onClose: () => void // Reverted to simple close
  onRoleUpdate: () => void // NEW: Call this to refresh parent data immediately
  groupName: string
  groupId: string
  companyName: string
  companyId: string
}

type Role = { id: string; role_name: string; default_role_level: number }

export default function RoleListModal({ 
  isOpen, onClose, onRoleUpdate, groupName, groupId, companyName, companyId 
}: RoleListModalProps) {
  
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)

  // Builder State
  const [echelon, setEchelon] = useState('1st Platoon')
  const [position, setPosition] = useState('Squad Member')
  const [customLevel, setCustomLevel] = useState(10)

  // Handle Escape Key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Fetch roles on open
  useEffect(() => {
    if (isOpen) {
      setLoading(true)
      getGroupRoles(groupId).then(res => {
        setRoles(res.roles)
        setLoading(false)
      })
    }
  }, [isOpen, groupId])

  const previewName = `${companyName} ${echelon} ${position}`

  const handleAdd = async () => {
    setLoading(true)
    const res = await createRoleAction(companyId, groupId, previewName, customLevel)
    if (res.error) {
      alert(res.error)
    } else {
      const updated = await getGroupRoles(groupId)
      setRoles(updated.roles)
      setIsAdding(false)
      // --- TRIGGER PARENT REFRESH IMMEDIATELY ---
      onRoleUpdate() 
    }
    setLoading(false)
  }

  const handleDelete = async (roleId: string) => {
    if(!confirm("Delete this role? Ensure no cadets are assigned to it first.")) return
    setLoading(true)
    await deleteRoleAction(roleId)
    const updated = await getGroupRoles(groupId)
    setRoles(updated.roles)
    // --- TRIGGER PARENT REFRESH IMMEDIATELY ---
    onRoleUpdate()
    setLoading(false)
  }

  // Auto-set level based on position
  useEffect(() => {
    const lowerPos = position.toLowerCase()
    if (lowerPos.includes('commander')) setCustomLevel(40)
    else if (lowerPos.includes('sergeant major') || lowerPos.includes('1sg')) setCustomLevel(38)
    else if (lowerPos.includes('platoon leader')) setCustomLevel(30)
    else if (lowerPos.includes('platoon sergeant')) setCustomLevel(28)
    else if (lowerPos.includes('squad leader')) setCustomLevel(20)
    else setCustomLevel(10)
  }, [position])

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose} 
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full border dark:border-gray-700 flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{groupName}</h2>
            <p className="text-sm text-gray-500">Manage roles within this approval group.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">✕</button>
        </div>

        {/* Role List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {loading && <div className="text-center text-gray-500 py-4">Loading...</div>}
          
          {!loading && roles.length === 0 && (
            <div className="text-center text-gray-500 py-8 italic">No roles in this group yet.</div>
          )}

          {!loading && roles.map(role => (
            <div key={role.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md border dark:border-gray-700">
              <div>
                <div className="font-medium text-gray-800 dark:text-gray-200">{role.role_name}</div>
                <div className="text-xs text-gray-500">Level: {role.default_role_level}</div>
              </div>
              <button 
                onClick={() => handleDelete(role.id)}
                className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 p-2 rounded"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          ))}
        </div>

        {/* Footer / Add Form */}
        <div className="p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 rounded-b-xl">
          {!isAdding ? (
            <button 
              onClick={() => setIsAdding(true)}
              className="w-full py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700"
            >
              + Add New Role
            </button>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Role Builder</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Echelon</label>
                  <select value={echelon} onChange={e => setEchelon(e.target.value)} className="w-full rounded text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white">
                    <option>Company HQ</option>
                    <option>1st Platoon</option>
                    <option>2nd Platoon</option>
                    <option>3rd Platoon</option>
                    <option>Band</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Position</label>
                  <select value={position} onChange={e => setPosition(e.target.value)} className="w-full rounded text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white">
                    <option>Commander</option>
                    <option>Executive Officer</option>
                    <option>First Sergeant</option>
                    <option>Platoon Leader</option>
                    <option>Platoon Sergeant</option>
                    <option>Squad Leader</option>
                    <option>Squad Member</option>
                    <option>Clerk</option>
                    <option>Armorer</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded border border-indigo-100 dark:border-indigo-800">
                <div className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mb-1">Preview Name:</div>
                <div className="text-sm font-mono text-gray-800 dark:text-gray-200">{previewName}</div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setIsAdding(false)} className="flex-1 py-2 border border-gray-300 dark:border-gray-600 rounded text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700">Cancel</button>
                <button onClick={handleAdd} disabled={loading} className="flex-1 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                  Create Role
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}