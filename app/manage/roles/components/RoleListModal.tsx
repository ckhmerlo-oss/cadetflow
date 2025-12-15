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
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
      onClick={onClose} 
    >
      <div 
        className="bg-card rounded-xl shadow-2xl max-w-lg w-full border border-border flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-border flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-foreground">{groupName}</h2>
            <p className="text-sm text-muted-foreground">Roles in this approval group</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {loading && <div className="text-center text-muted-foreground py-4">Loading...</div>}
          
          {!loading && currentRoles.length === 0 && (
            <div className="text-center text-muted-foreground py-8 italic">No roles assigned yet.</div>
          )}

          {!loading && currentRoles.map(role => (
            <div key={role.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-md border border-border">
              <div>
                <div className="font-medium text-foreground">{role.role_name}</div>
                <div className="text-xs text-muted-foreground">Level: {role.default_role_level}</div>
              </div>
              {canModify && (
                  <button 
                    onClick={() => handleUnassign(role.id)}
                    className="text-destructive hover:bg-destructive/10 p-2 rounded text-sm transition-colors"
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
            <div className="p-6 border-t border-border bg-muted/30 rounded-b-xl">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-3">Add Role to Group</h3>
              <div className="flex gap-2">
                  <select 
                    className="flex-1 rounded-md border border-input bg-background text-foreground text-sm p-2"
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
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 disabled:opacity-50 text-sm transition-colors"
                  >
                    {isAssigning ? 'Saving...' : 'Assign'}
                  </button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Only unassigned roles for {companyName} are shown.</p>
            </div>
        )}
        
        {!canModify && (
            <div className="p-4 border-t border-border bg-yellow-50 dark:bg-yellow-900/20 rounded-b-xl text-center">
                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                    Contact your TAC Officer or Admin to change role assignments.
                </p>
            </div>
        )}

      </div>
    </div>
  )
}