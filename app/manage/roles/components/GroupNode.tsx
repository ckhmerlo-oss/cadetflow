// app/manage/roles/components/GroupNode.tsx
import { ApprovalGroupNode } from '../actions'
import React from 'react'

interface GroupNodeProps {
  node: ApprovalGroupNode
  onDelete: (e: React.MouseEvent) => void
  onAddParent: (e: React.MouseEvent) => void
  onAddSubordinate: (e: React.MouseEvent) => void // <--- NEW
}

export default function GroupNode({ node, onDelete, onAddParent, onAddSubordinate }: GroupNodeProps) {
  
  const isFinal = node.is_final_authority
  
  return (
    <div className={`
      relative w-64 p-4 rounded-lg border-2 shadow-md transition-all hover:shadow-lg bg-card group
      ${isFinal ? 'border-yellow-500 ring-2 ring-yellow-100 dark:ring-yellow-900/30' : 'border-border'}
    `}>
      
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-foreground text-sm leading-tight">
          {node.group_name}
        </h3>
        <button 
            onClick={onDelete}
            className="text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
            title="Delete Group"
        >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      {/* Stats */}
      <div className="text-xs text-muted-foreground flex gap-2">
        <span>Roles: {node.role_count || 0}</span>
        {isFinal && <span className="text-yellow-600 dark:text-yellow-500 font-semibold ml-auto">Final Authority</span>}
      </div>

      {/* --- RIGHT BUTTON: Add Approver/Parent (ALWAYS VISIBLE) --- */}
      <div className="absolute -right-4 top-1/2 -translate-y-1/2 z-20">
           <button 
             onClick={onAddParent}
             className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full shadow-sm hover:bg-primary/90 hover:scale-110 transition-all border-2 border-background"
             title="Add Next Approver (Parent)"
           >
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
           </button>
      </div>

      {/* --- LEFT BUTTON: Add Subordinate/Child (ALWAYS VISIBLE) --- */}
      <div className="absolute -left-4 top-1/2 -translate-y-1/2 z-20">
           <button 
             onClick={onAddSubordinate}
             className="flex items-center justify-center w-8 h-8 bg-card text-primary rounded-full shadow-sm hover:bg-accent hover:scale-110 transition-all border-2 border-primary"
             title="Add Feeder Group (Child)"
           >
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
           </button>
      </div>

    </div>
  )
}