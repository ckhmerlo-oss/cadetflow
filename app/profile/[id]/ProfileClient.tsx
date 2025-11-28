'use client'

import { useState } from 'react'
import { submitTourAdjustment, updateCadetProfile } from './actions'
import { 
  CADET_RANKS, 
  FALL_SPORTS, 
  WINTER_SPORTS, 
  SPRING_SPORTS, 
  PROBATION_STATUSES, 
  GRADE_LEVELS 
} from '../constants'
import Link from 'next/link'

type ProfileClientProps = {
  profile: any
  stats: any 
  canEdit: boolean
  canManageStarTours: boolean
  currentSportData: { season: string, sport: string }
  calculatedConduct: string 
}

export default function ProfileClient({ profile, stats, canEdit, canManageStarTours, currentSportData, calculatedConduct }: ProfileClientProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // Adjustment State
  const [adjAmount, setAdjAmount] = useState(0)
  const [adjReason, setAdjReason] = useState('')
  const [isAdjusting, setIsAdjusting] = useState(false)

  const fullName = `${profile.last_name}, ${profile.first_name}`
  const isProbation = !!profile.probation_status && profile.probation_status !== 'None'
  const probationStatus = profile.probation_status || 'None'
  const hasStarTours = profile.has_star_tours === true
  
  const getConductColor = (status: string) => {
      if (status === 'Exemplary') return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 ring-1 ring-purple-500/20';
      if (status === 'Commendable') return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 ring-1 ring-green-500/20';
      if (status === 'Satisfactory') return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 ring-1 ring-blue-500/20';
      if (status === 'Deficient') return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 ring-1 ring-orange-500/20';
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 ring-1 ring-red-500/20';
  }

  async function handleSubmit(formData: FormData) {
    setIsSaving(true)
    const result = await updateCadetProfile(profile.id, formData)
    setIsSaving(false)
    if (result.error) {
      alert(result.error)
    } else {
      setIsEditing(false)
    }
  }
  
  // New Handler for Adjustments
  async function handleAdjustment() {
    if (adjAmount === 0 || !adjReason) {
        alert("Please enter a valid amount and a reason.");
        return;
    }
    if(!confirm(`Are you sure you want to adjust the tour balance by ${adjAmount > 0 ? '+' : ''}${adjAmount}? This will be permanently logged.`)) return;

    setIsAdjusting(true)
    const res = await submitTourAdjustment(profile.id, adjAmount, adjReason)
    setIsAdjusting(false)

    if(res.error) {
        alert(res.error)
    } else {
        alert("Adjustment applied successfully.")
        setAdjAmount(0)
        setAdjReason('')
    }
  }

  // --- EDIT MODE ---
  if (isEditing) {
    return (
      <div className="w-full space-y-6">
        <form action={handleSubmit} className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          {/* ... existing form header and fields ... */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700/50">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Editing {fullName}</h2>
            <div className="space-x-3">
              <button type="button" onClick={() => setIsEditing(false)} className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 hover:underline">Cancel</button>
              <button type="submit" disabled={isSaving} className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 shadow-sm disabled:opacity-50">
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <SelectField label="Cadet Rank" name="cadet_rank" defaultValue={profile.cadet_rank} options={CADET_RANKS} />
            <SelectField label="Grade Level" name="grade_level" defaultValue={profile.grade_level} options={GRADE_LEVELS} />
            
            <div className="md:col-span-1">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Room Number</label>
              <input type="text" name="room_number" defaultValue={profile.room_number || ''} className="block w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border" />
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Years Attended</label>
              <input type="number" name="years_attended" defaultValue={profile.years_attended || 0} className="block w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border" />
            </div>

            <SelectField label="Probation Status" name="probation_status" defaultValue={profile.probation_status} options={PROBATION_STATUSES} />
            
            <div className={`md:col-span-1 ${!canManageStarTours ? 'opacity-50' : ''}`}>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Disciplinary Status</label>
              <div className="mt-2 flex items-center space-x-3 p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                <input
                  id="has_star_tours"
                  name="has_star_tours"
                  type="checkbox"
                  defaultChecked={hasStarTours}
                  disabled={!canManageStarTours}
                  className="h-5 w-5 rounded text-red-600 focus:ring-red-500 border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:checked:bg-red-600 disabled:opacity-50"
                />
                <label htmlFor="has_star_tours" className="font-medium text-red-700 dark:text-red-300">
                  Cadet is on * Tours
                </label>
              </div>
            </div>

            <div className="col-span-full border-t border-gray-200 dark:border-gray-700 pt-6 mt-2">
               <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Athletics</h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <SelectField label="Fall Sport" name="sport_fall" defaultValue={profile.sport_fall} options={FALL_SPORTS} />
                  <SelectField label="Winter Sport" name="sport_winter" defaultValue={profile.sport_winter} options={WINTER_SPORTS} />
                  <SelectField label="Spring Sport" name="sport_spring" defaultValue={profile.sport_spring} options={SPRING_SPORTS} />
               </div>
            </div>
          </div>
        </form>

        {/* --- NEW: TOUR ADJUSTMENT SECTION --- */}
        {canManageStarTours && (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Manual Tour Adjustment</h2>
                    <p className="text-xs text-gray-500">Directly manipulate the ledger. Positive adds penalty, negative removes/serves.</p>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Adjustment Amount</label>
                        <input 
                            type="number" 
                            value={adjAmount}
                            onChange={e => setAdjAmount(Number(e.target.value))}
                            className="block w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border" 
                            placeholder="e.g. 5 or -5"
                        />
                    </div>
                    <div className="md:col-span-1">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Reason</label>
                        <input 
                            type="text" 
                            value={adjReason}
                            onChange={e => setAdjReason(e.target.value)}
                            className="block w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border" 
                            placeholder="Administrative Adjustment"
                        />
                    </div>
                    <div>
                        <button 
                            type="button" 
                            onClick={handleAdjustment}
                            disabled={isAdjusting || adjAmount === 0 || !adjReason}
                            className="w-full px-4 py-2.5 text-sm font-bold text-white bg-gray-800 dark:bg-gray-600 rounded-md hover:bg-gray-900 dark:hover:bg-gray-500 shadow-sm disabled:opacity-50"
                        >
                            {isAdjusting ? 'Applying...' : 'Apply Adjustment'}
                        </button>
                    </div>
                </div>
            </div>
        )}
      </div>
    )
  }

  // --- VIEW MODE ---
  return (
    <div className="w-full">
      
      {/* 1. Header Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
        <div className="h-32 bg-indigo-600 dark:bg-indigo-900"></div>
        <div className="px-6 pb-6">
          <div className="relative flex justify-between items-end -mt-10 mb-4">
            <div className="flex items-end">
              <div className="h-20 w-20 rounded-full bg-white dark:bg-gray-800 p-1.5 shadow-lg ring-1 ring-gray-200 dark:ring-gray-700">
                <div className="h-full w-full rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-2xl font-bold text-gray-600 dark:text-gray-300">
                  {profile.first_name[0]}{profile.last_name[0]}
                </div>
              </div>
              <div className="ml-4 mb-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{fullName}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600">
                    {profile.cadet_rank || 'Cadet'}
                  </span>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {profile.role?.role_name || 'Unassigned'} &bull; {profile.company?.company_name || 'No Co.'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              {canEdit && (
                <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                  Edit Profile
                </button>
              )}
              <Link href={`/ledger/${profile.id}`} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-indigo-700 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                View Ledger
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-t border-gray-100 dark:border-gray-700">
            <StatItem label="Grade" value={profile.grade_level} />
            <StatItem label="Room" value={profile.room_number} />
            <StatItem label="Years" value={profile.years_attended ? `${profile.years_attended} yrs` : '-'} />
            <StatItem label="Demerits" value={profile.total_demerits} isBad={profile.total_demerits > 0} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 h-fit">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-5">Status & Conduct</h3>
          
          <div className="space-y-5">
            {hasStarTours && (
              <div className="pb-4 border-b border-red-200 dark:border-red-800">
                <p className="text-xs font-semibold text-red-700 dark:text-red-300 uppercase tracking-wide mb-2">Disciplinary Status</p>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border border-red-200 dark:border-red-800">
                  {/* ICON-FIX: Replaced SVG with centered asterisk */}
                  <span className="font-bold text-lg leading-none" aria-hidden="true">&lowast;</span>
                  <span> TOURS ASSIGNED</span>
                </span>
              </div>
            )}

            <div>
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Conduct Status (Auto)</p>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold shadow-sm ${getConductColor(calculatedConduct)}`}>
                {calculatedConduct}
              </span>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Probation Status</p>
              {isProbation ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border border-red-200 dark:border-red-800">
                  {probationStatus}
                </span>
              ) : (
                <span className="text-sm font-medium text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full border dark:border-gray-600">
                  None
                </span>
              )}
            </div>
            
            <div className="pt-4 border-t border-gray-100 dark:border-gray-700 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">Term Demerits</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.term_demerits || 0}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">Year Demerits</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.year_demerits || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-5">Athletics & Activities</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SportCard title="Fall" sport={profile.sport_fall} active={currentSportData.season === 'Fall Sport'} />
            <SportCard title="Winter" sport={profile.sport_winter} active={currentSportData.season === 'Winter Sport'} />
            <SportCard title="Spring" sport={profile.sport_spring} active={currentSportData.season === 'Spring Sport'} />
          </div>
        </div>
      </div>
    </div>
  )
}

function StatItem({ label, value, isBad }: { label: string, value: string | number | null, isBad?: boolean }) {
    return (
        <div className="p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
          <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider font-bold">{label}</p>
          <p className={`text-lg font-bold mt-0.5 ${isBad ? 'text-red-700 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
            {value || '-'}
          </p>
        </div>
    )
}

function SelectField({ label, name, defaultValue, options }: { label: string, name: string, defaultValue: string, options: string[] }) {
    return (
        <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{label}</label>
            <select name={name} defaultValue={defaultValue || ''} className="block w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border">
                <option value="">Select...</option>
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
        </div>
    )
}

function SportCard({ title, sport, active }: { title: string, sport: string | null, active: boolean }) {
    return (
      <div className={`p-4 rounded-lg border shadow-sm transition-all ${
        active 
          ? 'bg-indigo-50 border-indigo-300 dark:bg-indigo-900/30 dark:border-indigo-700 ring-2 ring-indigo-500/50 dark:ring-indigo-600/50' 
          : 'bg-white border-gray-200 dark:bg-gray-700/30 dark:border-gray-700'
      }`}>
        <div className="flex justify-between items-start mb-2">
          <p className={`text-xs uppercase tracking-wide font-bold ${active ? 'text-indigo-800 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400'}`}>
            {title}
            {/* REMOVED pulsing dot, replaced with static bullet */}
            {active && <span className="ml-1.5 text-indigo-600" aria-hidden="true">&bull;</span>}
          </p>
        </div>
        <p className={`text-lg font-bold ${active ? 'text-indigo-900 dark:text-indigo-100' : 'text-gray-900 dark:text-white'}`}>
            {sport || 'None'}
        </p>
      </div>
    )
}