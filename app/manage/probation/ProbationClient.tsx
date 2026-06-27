'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import SearchableSelect, { SelectOption } from '@/app/components/SearchableSelect'
import { ProbationRecord, updateCadetProbation } from './actions'
import { PROBATION_STATUSES } from '@/app/profile/constants'

export default function ProbationClient({ 
  initialData, 
  cadetOptions, 
  canEdit 
}: { 
  initialData: ProbationRecord[]
  cadetOptions: SelectOption[]
  canEdit: boolean 
}) {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // Form State
  const [selectedCadetId, setSelectedCadetId] = useState('')
  const [status, setStatus] = useState('Academic')
  const [notes, setNotes] = useState('')
  const [isEditingExisting, setIsEditingExisting] = useState(false)

  const handleOpenAdd = () => {
    setSelectedCadetId('')
    setStatus('Academic')
    setNotes('')
    setIsEditingExisting(false)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (record: ProbationRecord) => {
    setSelectedCadetId(record.id)
    setStatus(record.probation_status || 'Academic')
    setNotes(record.probation_notes || '')
    setIsEditingExisting(true)
    setIsModalOpen(true)
  }

  const handleSubmit = async () => {
    if (!selectedCadetId || !status) return
    setLoading(true)
    
    const { error } = await updateCadetProbation(selectedCadetId, status, notes)
    
    setLoading(false)
    if (error) {
      alert(error)
    } else {
      setIsModalOpen(false)
      router.refresh()
    }
  }

  const handlePrint = () => window.print()

  return (
    <>
      <style jsx global>{`
        @media print {
          body { background-color: white !important; color: black !important; }
          .no-print { display: none !important; }
          #probation-container { margin: 0; padding: 0; border: none !important; box-shadow: none !important; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; font-size: 12px; color: black !important; }
          .print-header { display: block !important; text-align: center; margin-bottom: 20px; }
        }
      `}</style>

      <div id="probation-container" className="bg-card shadow-sm border border-border rounded-lg overflow-hidden">
        
        {/* Header / Actions */}
        <div className="p-4 border-b border-border flex justify-between items-center bg-muted/50 no-print">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-foreground">Active Probation List</h2>
            <span className="bg-destructive/10 text-destructive text-xs font-bold px-2 py-1 rounded-full">{initialData.length} Cadets</span>
          </div>
          <div className="flex gap-2">
            <button 
                onClick={handlePrint} 
                className="px-3 py-2 bg-background border border-input rounded-md text-sm font-medium text-foreground hover:bg-accent transition-colors"
            >
               Print View
            </button>
            {canEdit && (
                <button onClick={handleOpenAdd} className="btn-primary">
                + Add Cadet
                </button>
            )}
          </div>
        </div>

        {/* Print Header (Hidden normally) */}
        <div className="hidden print-header pt-4">
            <h1 className="text-2xl font-bold uppercase underline">Cadet Probation Roster</h1>
            <p className="text-sm text-gray-600">Effective Date: {new Date().toLocaleDateString()}</p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Cadet</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Company</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Measure / Notes</th>
                {canEdit && <th className="px-6 py-3 text-right no-print">Actions</th>}
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {initialData.length > 0 ? initialData.map(record => (
                <tr key={record.id} className="hover:bg-accent transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                    {record.last_name}, {record.first_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {record.company_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        record.probation_status === 'Disciplinary' ? 'bg-destructive/10 text-destructive' : 
                        record.probation_status === 'Academic' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200' :
                        'bg-muted text-muted-foreground'
                    }`}>
                        {record.probation_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground max-w-xs truncate">
                    {record.probation_notes || <span className="italic text-muted-foreground">None</span>}
                  </td>
                  {canEdit && (
                      <td className="px-6 py-4 text-right text-sm font-medium no-print">
                        <button onClick={() => handleOpenEdit(record)} className="text-primary hover:text-primary/80 transition-colors">Edit</button>
                      </td>
                  )}
                </tr>
              )) : (
                  <tr><td colSpan={canEdit ? 5 : 4} className="px-6 py-12 text-center text-muted-foreground italic">No cadets currently on probation.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto no-print" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)}></div>
            <div className="relative inline-block align-bottom bg-card rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full border border-border">
              <div className="bg-card px-4 pt-5 pb-4 sm:p-6">
                <h3 className="text-lg font-medium text-foreground mb-4">
                    {isEditingExisting ? 'Edit Probation Details' : 'Add Cadet to Probation'}
                </h3>
                
                <div className="space-y-4">
                    {!isEditingExisting && (
                        <SearchableSelect 
                            label="Select Cadet" 
                            options={cadetOptions} 
                            value={selectedCadetId} 
                            onChange={setSelectedCadetId} 
                            placeholder="Search roster..."
                        />
                    )}
                    
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Probation Type</label>
                        <select 
                            value={status} 
                            onChange={e => setStatus(e.target.value)} 
                            className="input-base"
                        >
                            {PROBATION_STATUSES.filter(s => s !== 'None').map(s => <option key={s} value={s}>{s}</option>)}
                            {isEditingExisting && <option value="None">-- Remove from Probation --</option>}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Measures / Notes</label>
                        <textarea 
                            value={notes} 
                            onChange={e => setNotes(e.target.value)} 
                            rows={3} 
                            className="input-base"
                            placeholder="Specific restrictions (e.g., Confined to post, No electronics)..."
                        />
                    </div>
                </div>
              </div>
              <div className="bg-muted/30 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-border">
                <button type="button" onClick={handleSubmit} disabled={loading || !selectedCadetId} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 transition-colors">
                    {loading ? 'Saving...' : 'Save'}
                </button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-input shadow-sm px-4 py-2 bg-background text-base font-medium text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors">
                    Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}