'use client'

import { useState, useMemo } from 'react'
import { updateBandDetails } from '../actions'
import { AppOption } from '@/app/lib/options'

type BandMember = {
  id: string
  first_name: string
  last_name: string
  band_details: {
    instrument: string | null
    leadership_role: string | null
    travel_notes: string | null
  } | null
}

type Props = {
  member: BandMember
  instrumentOptions: AppOption[] // <--- Now receiving full objects
  roleOptions: string[]          // <--- Roles are just strings
  onClose: () => void
  onSuccess: () => void
}

export default function EditBandMemberModal({ member, instrumentOptions, roleOptions, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    instrument: member.band_details?.instrument || '',
    leadership_role: member.band_details?.leadership_role || '',
    travel_notes: member.band_details?.travel_notes || ''
  })

  // Determine initial section based on current instrument (if any)
  const initialSection = useMemo(() => {
      const found = instrumentOptions.find(opt => opt.value === member.band_details?.instrument)
      return found?.group_name || ''
  }, [member.band_details?.instrument, instrumentOptions])

  const [selectedSection, setSelectedSection] = useState(initialSection)

  // 1. Get Unique Sections
  const sections = useMemo(() => {
      const allGroups = instrumentOptions.map(opt => opt.group_name).filter(Boolean) as string[]
      return [...new Set(allGroups)].sort()
  }, [instrumentOptions])

  // 2. Filter Instruments by Section
  const filteredInstruments = useMemo(() => {
      if (!selectedSection) return []
      return instrumentOptions.filter(opt => opt.group_name === selectedSection)
  }, [selectedSection, instrumentOptions])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const result = await updateBandDetails(member.id, formData)
    
    setLoading(false)
    if (result.success) {
      onSuccess()
      onClose()
    } else {
      alert('Error updating details')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card border border-border w-full max-w-md rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 border-b border-border bg-muted/30">
            <h3 className="text-lg font-bold text-foreground">Edit Band Details</h3>
            <p className="text-sm text-muted-foreground">{member.first_name} {member.last_name}</p>
          </div>
          
          <div className="p-6 space-y-4">
            
            {/* TWO-STEP SELECTION */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">1. Section</label>
                    <select 
                        value={selectedSection}
                        onChange={e => {
                            setSelectedSection(e.target.value)
                            setFormData({...formData, instrument: ''}) // Reset instrument when section changes
                        }}
                        className="w-full p-2 rounded-md border border-input bg-background text-foreground text-sm"
                    >
                        <option value="">Select...</option>
                        {sections.map(sec => (
                            <option key={sec} value={sec}>{sec}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">2. Instrument</label>
                    <select 
                        value={formData.instrument}
                        onChange={e => setFormData({...formData, instrument: e.target.value})}
                        disabled={!selectedSection}
                        className="w-full p-2 rounded-md border border-input bg-background text-foreground text-sm disabled:opacity-50"
                    >
                        <option value="">Select...</option>
                        {filteredInstruments.map(opt => (
                            <option key={opt.id} value={opt.value}>{opt.value}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Leadership Role</label>
              <select 
                value={formData.leadership_role}
                onChange={e => setFormData({...formData, leadership_role: e.target.value})}
                className="w-full p-2 rounded-md border border-input bg-background text-foreground"
              >
                <option value="">None / Member</option>
                {roleOptions.map(role => (
                    <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Travel / Medical Notes</label>
              <textarea 
                rows={3}
                placeholder="Allergies, bus preferences, etc."
                value={formData.travel_notes}
                onChange={e => setFormData({...formData, travel_notes: e.target.value})}
                className="w-full p-2 rounded-md border border-input bg-background text-foreground"
              />
            </div>
          </div>

          <div className="px-6 py-4 border-t border-border bg-muted/30 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-4 py-2 text-sm font-bold bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}