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
      relative w-64 p-4 rounded-lg border-2 shadow-md transition-all hover:shadow-lg bg-white dark:bg-gray-800 group
      ${isFinal ? 'border-yellow-500 dark:border-yellow-500 ring-2 ring-yellow-100 dark:ring-yellow-900/30' : 'border-gray-200 dark:border-gray-700'}
    `}>
      
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-tight">
          {node.group_name}
        </h3>
        <button 
            onClick={onDelete}
            className="text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
            title="Delete Group"
        >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      {/* Stats */}
      <div className="text-xs text-gray-500 dark:text-gray-400 flex gap-2">
        <span>Roles: {node.role_count || 0}</span>
        {isFinal && <span className="text-yellow-600 font-semibold ml-auto">Final Authority</span>}
      </div>

      {/* --- RIGHT BUTTON: Add Approver/Parent (ALWAYS VISIBLE) --- */}
      <div className="absolute -right-4 top-1/2 -translate-y-1/2 z-20">
           <button 
             onClick={onAddParent}
             className="flex items-center justify-center w-8 h-8 bg-indigo-600 text-white rounded-full shadow-sm hover:bg-indigo-700 hover:scale-110 transition-all border-2 border-white dark:border-gray-800"
             title="Add Next Approver (Parent)"
           >
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
           </button>
      </div>

      {/* --- LEFT BUTTON: Add Subordinate/Child (ALWAYS VISIBLE) --- */}
      <div className="absolute -left-4 top-1/2 -translate-y-1/2 z-20">
           <button 
             onClick={onAddSubordinate}
             className="flex items-center justify-center w-8 h-8 bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-300 rounded-full shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 hover:scale-110 transition-all border-2 border-indigo-200 dark:border-indigo-700"
             title="Add Feeder Group (Child)"
           >
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
           </button>
      </div>

    </div>
  )
}