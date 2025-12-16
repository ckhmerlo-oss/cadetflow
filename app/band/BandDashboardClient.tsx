'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BandMember, setBandMembership } from './actions' // Import remove action
import EditBandMemberModal from './components/EditBandMemberModal'
import BandOptionsEditor from './components/BandOptionsEditor'
import AddCadetModal from './components/AddCadetModal' // Import Add Modal
import { AppOption } from '@/app/lib/options'

export default function BandDashboardClient({ 
  initialMembers, 
  instrumentOptions, 
  roleOptions,
  canManageOptions,
  canManageRoster // <--- NEW PROP
}: { 
  initialMembers: BandMember[], 
  instrumentOptions: AppOption[],
  roleOptions: string[],
  canManageOptions: boolean,
  canManageRoster: boolean
}) {
  const router = useRouter()
  
  // -- STATE --
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSection, setSelectedSection] = useState('')
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null)
  
  const [editingMember, setEditingMember] = useState<BandMember | null>(null)
  const [showOptionsEditor, setShowOptionsEditor] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false) // <--- Add Modal State

  // -- HELPERS --
  const instrumentToSectionMap = useMemo(() => {
    const map: Record<string, string> = {}
    instrumentOptions.forEach(opt => {
        if (opt.group_name) map[opt.value] = opt.group_name
    })
    return map
  }, [instrumentOptions])

  const sections = useMemo(() => {
      const all = instrumentOptions.map(o => o.group_name).filter(Boolean) as string[]
      return [...new Set(all)].sort()
  }, [instrumentOptions])

  const filteredMembers = initialMembers.filter(m => {
    const instrument = m.band_details?.instrument || ''
    const section = instrumentToSectionMap[instrument] || 'Other'
    
    const matchesSearch = 
        m.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        instrument.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesSection = selectedSection ? section === selectedSection : true

    return matchesSearch && matchesSection
  })

  const toggleRow = (id: string) => {
      setExpandedMemberId(prev => prev === id ? null : id)
  }

  // REMOVE HANDLER
  const handleRemoveMember = async (id: string, name: string) => {
      if (!confirm(`Are you sure you want to remove ${name} from the Band roster?`)) return
      
      const res = await setBandMembership(id, false)
      if (res.success) {
          router.refresh()
      } else {
          alert('Error removing member: ' + res.error)
      }
  }

  return (
    <>
    <style jsx global>{`
      @media print {
        @page { margin: 0.5cm; }
        body { -webkit-print-color-adjust: exact; }
        .print-tight td, .print-tight th { padding-top: 4px !important; padding-bottom: 4px !important; font-size: 10pt !important; }
        .no-break { break-inside: avoid; }
      }
    `}</style>

    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* --- TOOLBAR --- */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-card p-4 rounded-lg border border-border shadow-sm print:hidden">
        
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <input 
                type="text" 
                placeholder="Search cadets..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 p-2 rounded-md border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-primary"
            />

            <select 
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full sm:w-48 p-2 rounded-md border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-primary"
            >
                <option value="">All Sections</option>
                {sections.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto justify-end">
            
            {/* ADD CADET BUTTON (Roster Mgmt) */}
            {canManageRoster && (
                <button 
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-md hover:bg-green-700 transition-colors shadow-sm"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Add Cadet
                </button>
            )}

            {/* OPTIONS BUTTON (Director Only) */}
            {canManageOptions && (
                <button 
                    onClick={() => setShowOptionsEditor(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground text-sm font-bold rounded-md hover:bg-secondary/80 transition-colors border border-border"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    Options
                </button>
            )}

            <button 
                onClick={() => window.print()} 
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-md hover:bg-primary/90 transition-colors"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                Print
            </button>
        </div>
      </div>

      {/* --- ROSTER TABLE --- */}
      <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm print:border-none print:shadow-none">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border print-tight">
            <thead className="bg-muted/50 print:bg-transparent">
              <tr>
                <th className="w-8 px-4 py-3 print:hidden"></th>
                <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider print:px-2 print:py-1 print:text-black">Cadet</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider print:px-2 print:py-1 print:text-black">Section</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider print:px-2 print:py-1 print:text-black">Instrument</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider print:px-2 print:py-1 print:text-black">Role</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider print:px-2 print:py-1 print:text-black">Room</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider print:px-2 print:py-1 print:text-black">Tours</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-muted-foreground uppercase tracking-wider print:hidden">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border print:divide-gray-300">
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => {
                  const instrument = member.band_details?.instrument || '';
                  const section = instrumentToSectionMap[instrument] || '-';
                  const isExpanded = expandedMemberId === member.id;

                  return (
                    <React.Fragment key={member.id}>
                        <tr className={`hover:bg-accent/50 transition-colors group ${isExpanded ? 'bg-accent/30' : ''} no-break`}>
                            <td className="px-4 py-4 text-center cursor-pointer print:hidden" onClick={() => toggleRow(member.id)}>
                                <svg className={`w-5 h-5 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap cursor-pointer print:px-2 print:py-1" onClick={() => toggleRow(member.id)}>
                                <div>
                                    <div className="text-sm font-bold text-foreground print:text-black">{member.last_name}, {member.first_name}</div>
                                    <div className="text-xs text-muted-foreground print:text-gray-600">{member.cadet_rank} • {member.company?.company_name}</div>
                                </div>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground print:px-2 print:py-1 print:text-black">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground print:bg-transparent print:text-black print:p-0">
                                    {section}
                                </span>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground print:px-2 print:py-1 print:text-black">
                                {instrument || <span className="opacity-50">-</span>}
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-sm text-primary font-medium print:px-2 print:py-1 print:text-black">
                                {member.band_details?.leadership_role || <span className="opacity-50 text-muted-foreground">-</span>}
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground print:px-2 print:py-1 print:text-black">
                                {member.room_number || '-'}
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-center print:px-2 print:py-1">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${member.cached_tour_balance > 0 ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'} print:bg-transparent print:text-black print:p-0`}>
                                    {member.cached_tour_balance}
                                </span>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2 print:hidden">
                                {canManageRoster && (
                                    <button 
                                        onClick={() => handleRemoveMember(member.id, member.last_name)} 
                                        className="text-destructive hover:text-destructive/80 transition-colors"
                                        title="Remove from Band"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                )}
                                <button onClick={() => setEditingMember(member)} className="text-primary hover:text-primary/80 transition-colors">
                                    Edit
                                </button>
                                <Link href={`/profile/${member.id}`} className="text-muted-foreground hover:text-foreground transition-colors">
                                    Profile
                                </Link>
                            </td>
                        </tr>

                        {isExpanded && (
                            <tr className="bg-muted/10 print:hidden">
                                <td colSpan={8} className="px-6 py-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                                        <div>
                                            <h4 className="text-xs font-bold text-muted-foreground uppercase mb-2">Contact Info</h4>
                                            <div className="space-y-1">
                                                <p className="text-foreground flex items-center gap-2">
                                                    <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                                    {member.email}
                                                </p>
                                                <p className="text-muted-foreground">Grade: {member.grade_level || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div className="col-span-2">
                                            <h4 className="text-xs font-bold text-muted-foreground uppercase mb-2">Notes</h4>
                                            <div className="bg-card border border-border rounded-md p-3">
                                                {member.band_details?.travel_notes ? (
                                                    <p className="text-foreground whitespace-pre-wrap">{member.band_details.travel_notes}</p>
                                                ) : (
                                                    <p className="text-muted-foreground italic">No notes recorded.</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </React.Fragment>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground italic">
                    No cadets match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALS */}
      {editingMember && (
        <EditBandMemberModal 
            member={editingMember} 
            instrumentOptions={instrumentOptions}
            roleOptions={roleOptions}
            onClose={() => setEditingMember(null)}
            onSuccess={() => {
                setEditingMember(null)
                router.refresh()
            }}
        />
      )}

      {canManageRoster && showAddModal && (
        <AddCadetModal 
            onClose={() => setShowAddModal(false)}
            onSuccess={() => router.refresh()}
        />
      )}

      {canManageOptions && showOptionsEditor && (
        <BandOptionsEditor 
            onClose={() => {
                setShowOptionsEditor(false)
                router.refresh()
            }} 
        />
      )}
    </div>
    </>
  )
}