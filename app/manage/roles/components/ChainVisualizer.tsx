'use client'

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { getCompanyChain, deleteGroupAction, type ApprovalGroupNode } from '../actions'
import GroupNode from './GroupNode'
import AddGroupModal from './AddGroupModal'
import RoleListModal from './RoleListModal'

interface ChainVisualizerProps {
  initialCompanies: { id: string; company_name: string }[]
}

export default function ChainVisualizer({ initialCompanies }: ChainVisualizerProps) {
  const [selectedCompanyId, setSelectedCompanyId] = useState(initialCompanies[0]?.id || '')
  const [nodes, setNodes] = useState<ApprovalGroupNode[]>([])
  const [loading, setLoading] = useState(false)
  
  // Ref for the inner wrapper that holds Nodes + SVG
  const contentRef = useRef<HTMLDivElement>(null)
  const [connections, setConnections] = useState<{ path: string; key: string }[]>([])
  
  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [targetChildId, setTargetChildId] = useState<string | null>(null)
  const [selectedNodeForRoles, setSelectedNodeForRoles] = useState<ApprovalGroupNode | null>(null)

  // 1. Fetch Chain
  useEffect(() => {
    if (!selectedCompanyId) return
    fetchChain()
  }, [selectedCompanyId])

  async function fetchChain() {
    setLoading(true)
    const data = await getCompanyChain(selectedCompanyId)
    setNodes(data)
    setLoading(false)
  }

  // 2. Layout Algorithm (Columns)
  const columns = useMemo(() => {
    if (nodes.length === 0) return []

    const depthMap = new Map<string, number>()
    const adjacency = new Map<string, string[]>() 

    nodes.forEach(node => {
      const parent = node.next_approver_group_id || 'ROOT'
      if (!adjacency.has(parent)) adjacency.set(parent, [])
      adjacency.get(parent)?.push(node.id)
    })

    function assignDepth(nodeId: string, currentDepth: number) {
      const children = adjacency.get(nodeId) || []
      children.forEach(childId => {
        depthMap.set(childId, currentDepth + 1)
        assignDepth(childId, currentDepth + 1)
      })
    }

    const finalNodes = nodes.filter(n => n.is_final_authority || !n.next_approver_group_id)
    finalNodes.forEach(node => {
      depthMap.set(node.id, 0)
      assignDepth(node.id, 0)
    })

    nodes.forEach(node => {
      if (!depthMap.has(node.id)) depthMap.set(node.id, 0) 
    })

    const maxDepth = Math.max(...Array.from(depthMap.values()), 0)
    const cols: ApprovalGroupNode[][] = Array.from({ length: maxDepth + 1 }, () => [])

    nodes.forEach(node => {
      const depth = depthMap.get(node.id)
      if (depth !== undefined) cols[depth].push(node)
    })

    cols.forEach(col => col.sort((a, b) => a.group_name.localeCompare(b.group_name)))
    return cols.reverse() 
  }, [nodes])


  // 3. Draw Lines (Anchored to Nodes Layer)
  const drawConnections = useCallback(() => {
    // We check contentRef to ensure we have the correct origin
    if (!contentRef.current || nodes.length === 0) return

    const newConnections: { path: string; key: string }[] = []
    
    // Get the bounding box of the DIV that contains both SVG and Nodes
    const contentRect = contentRef.current.getBoundingClientRect()

    nodes.forEach(node => {
      if (!node.next_approver_group_id) return

      const childEl = document.getElementById(`node-${node.id}`)
      const parentEl = document.getElementById(`node-${node.next_approver_group_id}`)

      if (childEl && parentEl) {
        const childRect = childEl.getBoundingClientRect()
        const parentRect = parentEl.getBoundingClientRect()

        // Calculate coordinates relative to the contentRef container
        // This removes any offsets from headers, padding, or scrolling
        const startX = childRect.right - contentRect.left
        const startY = (childRect.top + childRect.height / 2) - contentRect.top
        
        const endX = parentRect.left - contentRect.left
        const endY = (parentRect.top + parentRect.height / 2) - contentRect.top

        // Straight Direct Line
        const path = `M ${startX} ${startY} L ${endX} ${endY}`
        newConnections.push({ path, key: `${node.id}-${node.next_approver_group_id}` })
      }
    })

    setConnections(newConnections)
  }, [nodes])

  useEffect(() => {
    const timer = setTimeout(drawConnections, 50)
    window.addEventListener('resize', drawConnections)
    return () => {
      window.removeEventListener('resize', drawConnections)
      clearTimeout(timer)
    }
  }, [drawConnections, columns])


  // 4. Handlers
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this group? Any groups pointing to it will be moved to its approver.")) return
    await deleteGroupAction(id)
    fetchChain()
  }
  const handleOpenAdd = (childId: string) => {
    setTargetChildId(childId)
    setIsAddModalOpen(true)
  }
  const handleNodeClick = (node: ApprovalGroupNode) => {
    setSelectedNodeForRoles(node)
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow z-10 relative">
        <label className="font-medium text-gray-700 dark:text-gray-300">Select Company:</label>
        <select 
          value={selectedCompanyId} 
          onChange={(e) => setSelectedCompanyId(e.target.value)}
          className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white p-2"
        >
          {initialCompanies.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
        </select>
        <button onClick={fetchChain} className="ml-auto text-sm text-indigo-600 hover:underline dark:text-indigo-400">Refresh</button>
      </div>

      {/* Scrollable Outer Container */}
      <div 
        className="overflow-x-auto bg-gray-50 dark:bg-gray-900/50 rounded-xl border dark:border-gray-700 flex flex-col"
        style={{ height: '700px' }}
      >
        {loading ? (
          <div className="flex items-center justify-center h-full text-gray-500">Loading Chain...</div>
        ) : (
          <div className="flex flex-col min-w-max h-full p-8">
            
            {/* --- ROW 1: HEADERS --- */}
            <div className="flex gap-24 mb-4 border-b dark:border-gray-700 pb-2">
              {columns.map((_, colIndex) => (
                <div key={colIndex} className="w-64 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                   {colIndex === columns.length - 1 ? "Final Authority" : `Step ${columns.length - 1 - colIndex}`}
                </div>
              ))}
            </div>

            {/* --- ROW 2: NODES & LINES --- */}
            {/* THIS DIV is the Anchor (contentRef) */}
            <div 
              ref={contentRef}
              className="relative flex-grow flex items-center"
            >
              
              {/* SVG Layer (Positions at 0,0 of contentRef) */}
              <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
                <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#9CA3AF" />
                  </marker>
                </defs>
                {connections.map(conn => (
                  <path 
                    key={conn.key} 
                    d={conn.path} 
                    stroke="#9CA3AF" 
                    strokeWidth="2" 
                    fill="none" 
                    markerEnd="url(#arrowhead)"
                    className="opacity-60 transition-all duration-300"
                  />
                ))}
              </svg>

              {/* Nodes Layer */}
              <div className="flex gap-24 z-10 relative h-full w-full">
                {columns.map((col, colIndex) => (
                  <div key={colIndex} className="flex flex-col gap-16 justify-center h-full w-64">
                    {col.map(node => (
                      <div key={node.id} id={`node-${node.id}`} onClick={() => handleNodeClick(node)} className="cursor-pointer">
                        <GroupNode 
                          node={node} 
                          onDelete={(e: React.MouseEvent) => { 
                            e.stopPropagation(); 
                            handleDelete(node.id); 
                          }}
                          onAddParent={(e: React.MouseEvent) => { 
                            e.stopPropagation(); 
                            handleOpenAdd(node.id); 
                          }}
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>

            </div>

            {columns.length === 0 && (
               <div className="absolute inset-0 flex items-center justify-center text-gray-500">No approval groups found for this company.</div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {isAddModalOpen && targetChildId && (
        <AddGroupModal 
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          companyId={selectedCompanyId}
          childGroupId={targetChildId}
          onSuccess={() => {
            setIsAddModalOpen(false)
            fetchChain()
          }}
        />
      )}

      {selectedNodeForRoles && (
        <RoleListModal
          isOpen={!!selectedNodeForRoles}
          onClose={() => setSelectedNodeForRoles(null)}
          onRoleUpdate={fetchChain}
          groupName={selectedNodeForRoles.group_name}
          groupId={selectedNodeForRoles.id}
          companyName={initialCompanies.find(c => c.id === selectedCompanyId)?.company_name || 'Unit'}
          companyId={selectedCompanyId}
        />
      )}
    </div>
  )
}