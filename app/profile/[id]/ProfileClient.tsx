'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { CADET_RANKS, FALL_SPORTS, WINTER_SPORTS, SPRING_SPORTS, PROBATION_STATUSES } from '@/app/profile/constants'

// Fallback if constants file isn't perfect
const GRADE_LEVELS = ['7', '8', '9', '10', '11', '12', 'PG']

type Profile = {
  id: string
  first_name: string
  last_name: string
  email: string
  phone_number: string | null
  room_number: string | null
  grade_level: string | null
  cadet_rank: string | null
  company_id: string | null
  company?: { company_name: string }
  role?: { role_name: string }
  term_demerits: number
  year_demerits: number
  current_tour_balance: number
  has_star_tours?: boolean
  conduct_status: string
  // New fields
  probation_status?: string | null
  sport_fall?: string | null
  sport_winter?: string | null
  sport_spring?: string | null
  is_in_band?: boolean
  extracurriculars?: string | null
  parent_name?: string
  parent_email?: string
  parent_phone?: string
}

type AuditLogEntry = {
  event_date: string
  event_type: string
  title: string
  details: string
  demerits_issued: number
  tour_change: number
  actor_name: string
  status: string
  report_id: string | null
}

export default function ProfileClient({ 
  profile, 
  auditLog, 
  canEdit,
  viewerRoleLevel 
}: { 
  profile: Profile
  auditLog: AuditLogEntry[]
  canEdit: boolean
  viewerRoleLevel: number
}) {
  const supabase = createClient()
  const router = useRouter()
  
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  
  // Initialize form with all profile fields
  const [formData, setFormData] = useState({
    room_number: profile.room_number || '',
    grade_level: profile.grade_level || '',
    cadet_rank: profile.cadet_rank || '',
    sport_fall: profile.sport_fall || 'None',
    sport_winter: profile.sport_winter || 'None',
    sport_spring: profile.sport_spring || 'None',
    extracurriculars: profile.extracurriculars || '',
    is_in_band: profile.is_in_band || false,
    probation_status: profile.probation_status || 'None',
    has_star_tours: profile.has_star_tours || false,
    manual_tour_balance: profile.current_tour_balance
  })

  // *** PERMISSION CHECK ***
  // Only Commandant Staff (90+) can edit disciplinary fields (Probation, Tours, Star Status)
  const isCommandant = viewerRoleLevel >= 90;
  const isFaculty = viewerRoleLevel >= 50;

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  const getStatusColor = (status: string) => {
      if (status === 'Unsatisfactory') return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'
      if (status === 'Deficient') return 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800'
      return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800'
  }

  const handleSave = async () => {
      setSaving(true)
      
      // 1. Prepare Update Object
      // We only include disciplinary fields if the user has permission to change them
      const updates: any = {
          room_number: formData.room_number,
          grade_level: formData.grade_level,
          cadet_rank: formData.cadet_rank,
          sport_fall: formData.sport_fall === 'None' ? null : formData.sport_fall,
          sport_winter: formData.sport_winter === 'None' ? null : formData.sport_winter,
          sport_spring: formData.sport_spring === 'None' ? null : formData.sport_spring,
          extracurriculars: formData.extracurriculars,
          is_in_band: formData.is_in_band,
      };

      if (isCommandant) {
          updates.probation_status = formData.probation_status;
          updates.has_star_tours = formData.has_star_tours;
      }

      const { error: profileError } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', profile.id)

      // 2. Update Tour Balance (via RPC if changed AND user has permission)
      if (isCommandant && formData.manual_tour_balance !== profile.current_tour_balance) {
          const { error: tourError } = await supabase.rpc('set_tour_balance', {
              p_cadet_id: profile.id,
              p_new_balance: formData.manual_tour_balance,
              p_comment: 'Manual adjustment via Profile'
          })
          if (tourError) console.error("Tour update error:", tourError)
      }
      
      setSaving(false)
      if (profileError) alert(`Error: ${profileError.message}`)
      else { setIsEditing(false); router.refresh(); }
  }

  const getSportIcon = (sportName: string | null | undefined) => {
      const lower = (sportName || '').toLowerCase();
      if (lower === 'none' || !lower) return <span className="text-xl font-bold opacity-30">-</span>
      if (lower.includes('football')) return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> 
      if (lower.includes('basketball')) return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      if (lower.includes('baseball')) return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
      if (lower.includes('soccer')) return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      
      {/* --- IDENTITY HEADER --- */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-800"></div>
        <div className="px-6 pb-6 relative flex flex-col md:flex-row items-end md:items-center gap-6 -mt-12 md:-mt-16">
            <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-4xl font-bold text-gray-400 dark:text-gray-500 shadow-md">
                    {profile.first_name[0]}{profile.last_name[0]}
                </div>
            </div>

            <div className="flex-1 pb-2 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{profile.cadet_rank || 'Cadet'} {profile.last_name}, {profile.first_name}</h1>
                    {/* Band Badge */}
                    {formData.is_in_band && (
                        <span className="bg-yellow-100 text-yellow-800 border border-yellow-200 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m9-6.032l-2-4.004V5.5a1 1 0 112 0v2.468z" /></svg>
                            BAND
                        </span>
                    )}
                </div>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                        {profile.company?.company_name || 'Unassigned'}
                    </span>
                    <span className="hidden md:inline text-gray-300 dark:text-gray-600">•</span>
                    <span className="flex items-center gap-1">
                        {profile.role?.role_name || 'No Role'}
                    </span>
                    <span className="hidden md:inline text-gray-300 dark:text-gray-600">•</span>
                    <span className="flex items-center gap-1">
                        {profile.email}
                    </span>
                </div>
            </div>

            <div className="flex gap-3 pb-2 w-full md:w-auto justify-center md:justify-end">
                {canEdit && (
                    <button onClick={() => setIsEditing(!isEditing)} className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium transition-colors ${isEditing ? 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                        {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                    </button>
                )}
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* --- 1. STATUS BOX --- */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-xl p-5 flex flex-col gap-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Status</h3>
            
            <div className={`p-3 rounded-lg border ${getStatusColor(profile.conduct_status)}`}>
                <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase opacity-75">Conduct</span>
                    <span className="font-bold">{profile.conduct_status}</span>
                </div>
            </div>

            {/* Probation: ONLY Editable if isCommandant */}
            {isEditing && isCommandant ? (
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                    <label className="text-xs font-bold uppercase text-gray-500 block mb-1">Probation</label>
                    <select value={formData.probation_status} onChange={e => setFormData({...formData, probation_status: e.target.value})} className="w-full border rounded p-1 text-sm dark:bg-gray-900 dark:text-white">
                        {PROBATION_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            ) : (
                <div className={`p-3 rounded-lg border ${profile.probation_status && profile.probation_status !== 'None' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800' : 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-700/50 dark:text-gray-300 dark:border-gray-600'}`}>
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold uppercase opacity-75">Probation</span>
                        <span className="font-bold">{profile.probation_status || 'None'}</span>
                    </div>
                </div>
            )}

            {/* Tours: ONLY Editable if isCommandant */}
            {isEditing && isCommandant ? (
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                    <label className="text-xs font-bold uppercase text-gray-500 block mb-1">Tour Balance</label>
                    <div className="flex gap-2">
                        <input type="number" value={formData.manual_tour_balance} onChange={e => setFormData({...formData, manual_tour_balance: Number(e.target.value)})} className="w-20 border rounded p-1 text-sm dark:bg-gray-900 dark:text-white" />
                        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                            <input type="checkbox" checked={formData.has_star_tours} onChange={e => setFormData({...formData, has_star_tours: e.target.checked})} className="rounded text-indigo-600" />
                            Star Tours
                        </label>
                    </div>
                </div>
            ) : (
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="text-xs font-bold text-gray-500 uppercase">Tours Owed</span>
                    <span className={`text-xl font-bold ${profile.current_tour_balance > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                        {profile.has_star_tours ? '*' : profile.current_tour_balance}
                    </span>
                </div>
            )}
        </div>

        {/* --- 2. ACTIVITIES --- */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-xl p-5 flex flex-col justify-between">
            <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Athletics</h3>
                
                {isEditing ? (
                    <div className="space-y-2">
                        <select value={formData.sport_fall || 'None'} onChange={e => setFormData({...formData, sport_fall: e.target.value})} className="w-full border rounded p-1 text-sm dark:bg-gray-900 dark:text-white">{FALL_SPORTS.map(s => <option key={s} value={s}>{s}</option>)}</select>
                        <select value={formData.sport_winter || 'None'} onChange={e => setFormData({...formData, sport_winter: e.target.value})} className="w-full border rounded p-1 text-sm dark:bg-gray-900 dark:text-white">{WINTER_SPORTS.map(s => <option key={s} value={s}>{s}</option>)}</select>
                        <select value={formData.sport_spring || 'None'} onChange={e => setFormData({...formData, sport_spring: e.target.value})} className="w-full border rounded p-1 text-sm dark:bg-gray-900 dark:text-white">{SPRING_SPORTS.map(s => <option key={s} value={s}>{s}</option>)}</select>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <span className="w-12 text-xs font-bold text-gray-400 uppercase">Fall</span>
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">{getSportIcon(profile.sport_fall)} {profile.sport_fall || 'None'}</div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="w-12 text-xs font-bold text-gray-400 uppercase">Winter</span>
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">{getSportIcon(profile.sport_winter)} {profile.sport_winter || 'None'}</div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="w-12 text-xs font-bold text-gray-400 uppercase">Spring</span>
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">{getSportIcon(profile.sport_spring)} {profile.sport_spring || 'None'}</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Extracurriculars */}
            <div className="mt-6 pt-6 border-t dark:border-gray-700">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Extracurriculars</h3>
                {isEditing ? (
                    <div className="space-y-2">
                        <textarea value={formData.extracurriculars} onChange={e => setFormData({...formData, extracurriculars: e.target.value})} className="w-full border rounded p-2 text-sm dark:bg-gray-900 dark:text-white" rows={2} placeholder="Clubs..." />
                        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer bg-gray-50 dark:bg-gray-700/50 p-2 rounded border border-gray-200 dark:border-gray-600">
                            <input type="checkbox" checked={formData.is_in_band} onChange={e => setFormData({...formData, is_in_band: e.target.checked})} className="rounded text-indigo-600" />
                            Band Member
                        </label>
                    </div>
                ) : (
                    <p className="text-sm text-gray-700 dark:text-gray-300 italic">{profile.extracurriculars || 'None recorded.'}</p>
                )}
            </div>
        </div>

        {/* --- 3. DETAILS --- */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-xl p-5">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Details</h3>
            {isEditing ? (
                <div className="space-y-3">
                    <div><label className="text-xs font-medium text-gray-500">Rank</label><select value={formData.cadet_rank} onChange={e => setFormData({...formData, cadet_rank: e.target.value})} className="w-full border rounded p-1 text-sm dark:bg-gray-900 dark:text-white"><option value="">Select Rank</option>{CADET_RANKS.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
                    <div><label className="text-xs font-medium text-gray-500">Room</label><input type="text" value={formData.room_number} onChange={e => setFormData({...formData, room_number: e.target.value})} className="w-full border rounded p-1 text-sm dark:bg-gray-900 dark:text-white" /></div>
                    <div><label className="text-xs font-medium text-gray-500">Grade</label><select value={formData.grade_level} onChange={e => setFormData({...formData, grade_level: e.target.value})} className="w-full border rounded p-1 text-sm dark:bg-gray-900 dark:text-white">{GRADE_LEVELS.map(g => <option key={g} value={g}>{g}</option>)}</select></div>
                    <button onClick={handleSave} disabled={saving} className="w-full mt-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 font-bold shadow">{saving ? 'Saving...' : 'Save Changes'}</button>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex justify-between border-b dark:border-gray-700 pb-2"><span className="text-sm text-gray-500">Company</span><span className="text-sm font-medium text-gray-900 dark:text-white">{profile.company?.company_name || '-'}</span></div>
                    <div className="flex justify-between border-b dark:border-gray-700 pb-2"><span className="text-sm text-gray-500">Room</span><span className="text-sm font-medium text-gray-900 dark:text-white">{profile.room_number || '-'}</span></div>
                    <div className="flex justify-between border-b dark:border-gray-700 pb-2"><span className="text-sm text-gray-500">Grade</span><span className="text-sm font-medium text-gray-900 dark:text-white">{profile.grade_level || '-'}</span></div>
                    <div className="flex justify-between pb-2"><span className="text-sm text-gray-500">Rank</span><span className="text-sm font-medium text-gray-900 dark:text-white">{profile.cadet_rank || '-'}</span></div>
                </div>
            )}
        </div>

      </div>

      {/* --- BOTTOM ROW --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* LEDGER */}
          <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden h-96 flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Disciplinary Record</h3>
            </div>
            <div className="overflow-y-auto flex-1">
                {auditLog && auditLog.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700/50 sticky top-0">
                        <tr><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Event</th><th className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Dem</th><th className="px-4 py-2"></th></tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {auditLog.map((entry, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-sm">
                            <td className="px-4 py-2 text-gray-600 dark:text-gray-300 whitespace-nowrap">{formatDate(entry.event_date)}</td>
                            <td className="px-4 py-2 text-gray-900 dark:text-white truncate max-w-[150px]">{entry.title}</td>
                            <td className="px-4 py-2 text-center font-mono text-gray-900 dark:text-white">{entry.demerits_issued > 0 ? entry.demerits_issued : (entry.tour_change !== 0 ? `${entry.tour_change}T` : '-')}</td>
                            <td className="px-4 py-2 text-right">{entry.report_id && <Link href={`/report/${entry.report_id}`} className="text-indigo-600 hover:underline text-xs">View</Link>}</td>
                        </tr>
                        ))}
                    </tbody>
                </table>
                ) : <div className="p-8 text-center text-gray-500 dark:text-gray-400 italic text-sm">No disciplinary history recorded.</div>}
            </div>
          </div>

          {/* PARENT INFO (Faculty Only) */}
          {isFaculty ? (
              <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden h-96 flex flex-col">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-amber-50 dark:bg-amber-900/20 flex justify-between items-center">
                    <h3 className="text-sm font-bold text-amber-900 dark:text-amber-100 uppercase tracking-wider flex items-center gap-2">Parent / Guardian</h3>
                    <span className="text-[10px] font-bold bg-amber-200 text-amber-800 px-2 py-0.5 rounded uppercase">Faculty Only</span>
                </div>
                <div className="p-6 flex-1 overflow-y-auto">
                    <div className="space-y-6">
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Primary Contact</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">{profile.parent_name || 'Not Listed'}</p>
                            <div className="mt-2 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                {profile.parent_phone || '(---) --- ----'}
                            </div>
                            <div className="mt-1 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                {profile.parent_email || 'No Email'}
                            </div>
                        </div>
                    </div>
                </div>
              </div>
          ) : (
              <div className="bg-gray-50 dark:bg-gray-800/50 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl h-96 flex items-center justify-center text-gray-400 dark:text-gray-600 text-sm">
                  Restricted Access
              </div>
          )}

      </div>

    </div>
  )
}