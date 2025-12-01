'use client'
import { useState, useEffect } from 'react'
import { getGroupRoles, getCompanyRoles, assignRoleToGroupAction, unassignRoleAction } from '../actions'

interface RoleListModalProps {
  isOpen: boolean
  onClose: () => void
  onRoleUpdate: () => void
  groupName: string
  groupId: string
  companyName: string
  companyId: string
  viewerRoleLevel: number // <--- NEW
}

type Role = { id: string; role_name: string; default_role_level: number }

export default function RoleListModal({ 
  isOpen, onClose, onRoleUpdate, groupName, groupId, companyName, companyId, viewerRoleLevel
}: RoleListModalProps) {
  
  const [currentRoles, setCurrentRoles] = useState<Role[]>([])
  const [availableRoles, setAvailableRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  
  // State for assignment selection
  const [selectedRoleId, setSelectedRoleId] = useState('')
  const [isAssigning, setIsAssigning] = useState(false)

  // Permission Check: TAC or Admin (Level 60+)
  const canModify = viewerRoleLevel >= 60;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (isOpen) window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Fetch Data
  const fetchData = async () => {
      setLoading(true)
      const [curr, avail] = await Promise.all([
          getGroupRoles(groupId),
          getCompanyRoles(companyId)
      ])
      setCurrentRoles(curr.roles)
      setAvailableRoles(avail.roles)
      setLoading(false)
  }

  useEffect(() => {
    if (isOpen) fetchData()
  }, [isOpen, groupId])

  // Handlers
  const handleAssign = async () => {
      if (!selectedRoleId) return
      setIsAssigning(true)
      const res = await assignRoleToGroupAction(selectedRoleId, groupId)
      setIsAssigning(false)
      if (res.error) alert(res.error)
      else {
          setSelectedRoleId('')
          fetchData()
          onRoleUpdate()
      }
  }

  const handleUnassign = async (roleId: string) => {
      if(!confirm("Remove this role from the group? It will become unassigned.")) return
      const res = await unassignRoleAction(roleId)
      if (res.error) alert(res.error)
      else {
          fetchData()
          onRoleUpdate()
      }
  }

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
        <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{groupName}</h2>
            <p className="text-sm text-gray-500">Roles in this approval group</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {loading && <div className="text-center text-gray-500 py-4">Loading...</div>}
          
          {!loading && currentRoles.length === 0 && (
            <div className="text-center text-gray-500 py-8 italic">No roles assigned yet.</div>
          )}

          {!loading && currentRoles.map(role => (
            <div key={role.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md border dark:border-gray-700">
              <div>
                <div className="font-medium text-gray-800 dark:text-gray-200">{role.role_name}</div>
                <div className="text-xs text-gray-500">Level: {role.default_role_level}</div>
              </div>
              {canModify && (
                  <button 
                    onClick={() => handleUnassign(role.id)}
                    className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 p-2 rounded text-sm"
                    title="Unassign Role"
                  >
                    Remove
                  </button>
              )}
            </div>
          ))}
        </div>

        {/* FOOTER: Assign New Role (Restricted) */}
        {canModify && (
            <div className="p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 rounded-b-xl">
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">Add Role to Group</h3>
              <div className="flex gap-2">
                  <select 
                    className="flex-1 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white text-sm p-2"
                    value={selectedRoleId}
                    onChange={(e) => setSelectedRoleId(e.target.value)}
                    disabled={availableRoles.length === 0}
                  >
                      <option value="">{availableRoles.length === 0 ? "No unassigned roles available" : "Select a role..."}</option>
                      {availableRoles.map(r => (
                          <option key={r.id} value={r.id}>{r.role_name}</option>
                      ))}
                  </select>
                  <button 
                    onClick={handleAssign}
                    disabled={isAssigning || !selectedRoleId}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 disabled:opacity-50 text-sm"
                  >
                    {isAssigning ? 'Saving...' : 'Assign'}
                  </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">Only unassigned roles for {companyName} are shown.</p>
            </div>
        )}
        
        {!canModify && (
            <div className="p-4 border-t dark:border-gray-700 bg-yellow-50 dark:bg-yellow-900/20 rounded-b-xl text-center">
                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                    Contact your TAC Officer or Admin to change role assignments.
                </p>
            </div>
        )}

      </div>
    </div>
  )
}