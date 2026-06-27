'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import SearchableSelect from '@/app/components/SearchableSelect' // <--- IMPORTED
import CadetScheduleOversight from './CadetScheduleOversight'
import { getConductLevelBadgeClass } from '@/app/lib/blueBook'
import PeriodSelector from '@/app/components/PeriodSelector'
import type { AcademicTermRow, PeriodSelection, CadetPeriodStats } from '@/app/lib/period-types'

// --- TYPES ---

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
  probation_status?: string | null
  sport_fall?: string | null
  sport_winter?: string | null
  sport_spring?: string | null
  is_in_band?: boolean
  extracurriculars?: string[] | null
  parent_name?: string
  parent_email?: string
  parent_phone?: string
  graduated_at?: string | null
  departure_classification?: string | null
  years_attended?: number
}

import DepartureBadge from '@/app/components/DepartureBadge'
type OptionsProps = {
    ranks: string[]
    grades: string[]
    conduct: string[]
    probation: string[]
    extracurriculars: string[]
    fallSports: string[]
    winterSports: string[]
    springSports: string[]
}

export default function ProfileClient({ 
  profile, 
  auditLog, 
  canEdit,
  viewerRoleLevel,
  options,
  isStaff = false,
  schedule = [],
  oversight = [],
  canEditSchedule = false,
  currentUserId = '',
  isArchivedView = false,
  historicalYears = [],
  allTerms = [],
  initialPeriod = null,
  canViewHistory = false,
}: { 
  profile: Profile
  auditLog: AuditLogEntry[]
  canEdit: boolean
  viewerRoleLevel: number
  options: OptionsProps
  isStaff?: boolean
  schedule?: Array<{
    slot_type: string
    section_id: string | null
    course_name: string | null
    teacher_first_name: string | null
    teacher_last_name: string | null
  }>
  oversight?: Array<{
    assignment_id: string
    assignment_type: string
    source: string
    staff_id: string
    staff_first_name: string
    staff_last_name: string
    course_name: string | null
    is_self: boolean
  }>
  canEditSchedule?: boolean
  currentUserId?: string
  isArchivedView?: boolean
  historicalYears?: string[]
  allTerms?: AcademicTermRow[]
  initialPeriod?: PeriodSelection | null
  canViewHistory?: boolean
}) {
  const supabase = createClient()
  const router = useRouter()

  const [period, setPeriod] = useState<PeriodSelection | null>(initialPeriod)
  const [periodStats, setPeriodStats] = useState({
    term_demerits: profile.term_demerits,
    year_demerits: profile.year_demerits,
    conduct_status: profile.conduct_status,
    current_tour_balance: profile.current_tour_balance,
  })
  const [periodLoading, setPeriodLoading] = useState(false)

  useEffect(() => {
    if (!period || isStaff) return
    const activePeriod = period
    let cancelled = false
    async function load() {
      setPeriodLoading(true)
      const { data, error } = await supabase.rpc('get_cadet_period_stats', {
        p_cadet_id: profile.id,
        p_school_year: activePeriod.schoolYear,
        p_term_number: activePeriod.termNumber,
      }).single()
      if (!cancelled && !error && data) {
        const ps = data as CadetPeriodStats
        setPeriodStats({
          term_demerits: ps.term_demerits,
          year_demerits: ps.year_demerits,
          conduct_status: ps.conduct_status,
          current_tour_balance: ps.current_tour_balance ?? profile.current_tour_balance,
        })
      }
      if (!cancelled) setPeriodLoading(false)
    }
    void load()
    return () => { cancelled = true }
  }, [period, isStaff, profile.id, profile.current_tour_balance, supabase])
  
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  
  // Initialize form
  const [formData, setFormData] = useState({
    room_number: profile.room_number || '',
    grade_level: profile.grade_level || '',
    cadet_rank: profile.cadet_rank || '',
    sport_fall: profile.sport_fall || 'None',
    sport_winter: profile.sport_winter || 'None',
    sport_spring: profile.sport_spring || 'None',
    extracurriculars: Array.isArray(profile.extracurriculars) ? profile.extracurriculars : [],
    is_in_band: profile.is_in_band || false,
    probation_status: profile.probation_status || 'None',
    has_star_tours: profile.has_star_tours || false,
    manual_tour_balance: profile.current_tour_balance
  })

  // Permission Checks
  const isCommandant = viewerRoleLevel >= 90;
  const isFaculty = viewerRoleLevel >= 50;

  // Helpers
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  const getStatusColor = (status: string) => getConductLevelBadgeClass(status)

  // UPDATED: Logic to add/remove activities
  const addActivity = (activity: string) => {
    if (!formData.extracurriculars.includes(activity)) {
        setFormData(prev => ({ ...prev, extracurriculars: [...prev.extracurriculars, activity] }))
    }
  }

  const removeActivity = (activity: string) => {
    setFormData(prev => ({ ...prev, extracurriculars: prev.extracurriculars.filter(a => a !== activity) }))
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

  const handleSave = async () => {
      setSaving(true)
      
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
          .from('cadet_profiles')
          .update(updates)
          .eq('profile_id', profile.id)

      if (isCommandant && formData.manual_tour_balance !== profile.current_tour_balance) {
          await supabase.rpc('set_tour_balance', {
              p_cadet_id: profile.id,
              p_new_balance: formData.manual_tour_balance,
              p_comment: 'Manual adjustment via Profile'
          })
      }
      
      setSaving(false)
      if (profileError) alert(`Error: ${profileError.message}`)
      else { setIsEditing(false); router.refresh(); }
  }

  // PREPARE OPTIONS: Filter out already selected items so they don't appear in the dropdown
  const availableActivities = options.extracurriculars
    .filter(ex => !formData.extracurriculars.includes(ex))
    .map(ex => ({ id: ex, label: ex }));

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      {isArchivedView && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg text-sm text-amber-800 dark:text-amber-200">
          This cadet is archived. Profile and ledger are read-only historical records.
        </div>
      )}
      
      {/* --- IDENTITY HEADER --- */}
      <div className="bg-card shadow-sm border border-border rounded-xl overflow-hidden">
        <div className="h-32 bg-primary"></div>
        
        <div className="px-6 pb-6 relative flex flex-col md:flex-row items-end md:items-center gap-6 -mt-12 md:-mt-16">
            <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-background bg-muted flex items-center justify-center text-4xl font-bold text-muted-foreground shadow-md">
                    {profile.first_name[0]}{profile.last_name[0]}
                </div>
            </div>

            <div className="flex-1 pb-2 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3">
                    <h1 className="text-3xl font-bold text-foreground">
                      {isStaff
                        ? `${(profile as any).staff_title || profile.role?.role_name || 'Staff'} ${profile.last_name}, ${profile.first_name}`
                        : `${profile.cadet_rank || 'Cadet'} ${profile.last_name}, ${profile.first_name}`}
                    </h1>
                    {/* Band Badge */}
                    {!isStaff && formData.is_in_band && (
                        <span className="bg-yellow-100 text-yellow-800 border border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-200 dark:border-yellow-800 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m9-6.032l-2-4.004V5.5a1 1 0 112 0v2.468z" /></svg>
                            BAND
                        </span>
                    )}
                    {!isStaff && profile.graduated_at && (
                        <span className="bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-800 text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                            GRADUATED
                        </span>
                    )}
                    {!isStaff && isArchivedView && (
                      <DepartureBadge classification={profile.departure_classification} />
                    )}
                </div>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2 text-sm font-medium text-muted-foreground">
                    <span className="flex items-center gap-1">
                        {profile.company?.company_name || 'Unassigned'}
                    </span>
                    <span className="hidden md:inline opacity-50">•</span>
                    <span className="flex items-center gap-1">
                        {profile.role?.role_name || 'No Role'}
                    </span>
                    <span className="hidden md:inline opacity-50">•</span>
                    <span className="flex items-center gap-1">
                        {profile.email}
                    </span>
                </div>
            </div>

            <div className="flex gap-3 pb-2 w-full md:w-auto justify-center md:justify-end">
                {canEdit && isEditing && (
                    <button 
                        onClick={handleSave} 
                        disabled={saving} 
                        className="px-4 py-2 rounded-md shadow-sm text-sm font-bold bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                        {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                )}
                {canEdit && (
                    <button 
                        onClick={() => setIsEditing(!isEditing)} 
                        disabled={saving}
                        className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium transition-colors ${
                            isEditing 
                            ? 'bg-muted text-muted-foreground hover:bg-muted/80 border border-border' 
                            : 'btn-primary'
                        }`}
                    >
                        {isEditing ? 'Cancel' : 'Edit Profile'}
                    </button>
                )}
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {isStaff ? (
          <div className="md:col-span-3 bg-card shadow-sm border border-border rounded-xl p-5">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Staff Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><span className="font-semibold">Title:</span> {(profile as any).staff_title || '—'}</div>
              <div><span className="font-semibold">Department:</span> {(profile as any).department || '—'}</div>
              <div><span className="font-semibold">Office:</span> {(profile as any).office_location || '—'}</div>
              <div><span className="font-semibold">Work Phone:</span> {(profile as any).work_phone || '—'}</div>
            </div>
          </div>
        ) : (
        <>
        
        {/* --- 1. STATUS BOX --- */}
        <div className="bg-card shadow-sm border border-border rounded-xl p-5 flex flex-col gap-4">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</h3>

            {period && historicalYears.length > 0 && (
              <PeriodSelector
                years={historicalYears}
                terms={allTerms}
                value={period}
                onChange={setPeriod}
                disabled={periodLoading}
              />
            )}
            
            <div className={`p-3 rounded-lg border ${getStatusColor(periodStats.conduct_status)}`}>
                <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase opacity-75">Conduct Level</span>
                    <span className="font-bold">{periodLoading ? '…' : periodStats.conduct_status}</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="p-2 rounded bg-muted/40">
                <span className="text-xs text-muted-foreground block">Term Demerits</span>
                <span className="font-bold">{periodStats.term_demerits}</span>
              </div>
              <div className="p-2 rounded bg-muted/40">
                <span className="text-xs text-muted-foreground block">Year Demerits</span>
                <span className="font-bold">{periodStats.year_demerits}</span>
              </div>
            </div>

            {profile.years_attended != null && (
              <p className="text-xs text-muted-foreground">Years completed: <span className="font-medium text-foreground">{profile.years_attended}</span></p>
            )}

            <div className="flex flex-col gap-1">
              <Link href={`/ledger/${profile.id}`} className="text-sm text-primary hover:underline">
                View full ledger →
              </Link>
              {canViewHistory && (
                <Link href={`/profile/${profile.id}/history`} className="text-sm text-primary hover:underline">
                  School history report →
                </Link>
              )}
            </div>

            {/* Probation: ONLY Editable if isCommandant */}
            {isEditing && isCommandant ? (
                <div className="p-3 bg-muted/30 rounded-lg border border-border">
                    <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">Probation</label>
                    <select value={formData.probation_status} onChange={e => setFormData({...formData, probation_status: e.target.value})} className="input-base text-sm py-1">
                        {options.probation.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            ) : (
                <div className={`p-3 rounded-lg border ${profile.probation_status && profile.probation_status !== 'None' ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-muted/50 text-foreground border-border'}`}>
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold uppercase opacity-75">Probation</span>
                        <span className="font-bold">{profile.probation_status || 'None'}</span>
                    </div>
                </div>
            )}

            {/* Tours: ONLY Editable if isCommandant */}
            {isEditing && isCommandant ? (
                <div className="p-3 bg-muted/30 rounded-lg border border-border">
                    <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">Penalty Tours Owed</label>
                    <div className="flex gap-2">
                        <input type="number" value={formData.manual_tour_balance} onChange={e => setFormData({...formData, manual_tour_balance: Number(e.target.value)})} className="w-20 input-base text-sm py-1" />
                        <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                            <input type="checkbox" checked={formData.has_star_tours} onChange={e => setFormData({...formData, has_star_tours: e.target.checked})} className="rounded text-primary focus:ring-primary" />
                            Star Tours
                        </label>
                    </div>
                </div>
            ) : (
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg border border-border">
                    <span className="text-xs font-bold text-muted-foreground uppercase">Penalty Tours Owed</span>
                    <span className={`text-xl font-bold ${profile.current_tour_balance > 0 ? 'text-destructive' : 'text-foreground'}`}>
                        {profile.has_star_tours ? '*' : profile.current_tour_balance}
                    </span>
                </div>
            )}
        </div>

        {/* --- 2. ACTIVITIES --- */}
        <div className="bg-card shadow-sm border border-border rounded-xl p-5 flex flex-col justify-between">
            <div>
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Athletics</h3>
                
                {isEditing ? (
                    <div className="space-y-2">
                        <select value={formData.sport_fall || 'None'} onChange={e => setFormData({...formData, sport_fall: e.target.value})} className="input-base text-sm py-1">{options.fallSports.map(s => <option key={s} value={s}>{s}</option>)}</select>
                        <select value={formData.sport_winter || 'None'} onChange={e => setFormData({...formData, sport_winter: e.target.value})} className="input-base text-sm py-1">{options.winterSports.map(s => <option key={s} value={s}>{s}</option>)}</select>
                        <select value={formData.sport_spring || 'None'} onChange={e => setFormData({...formData, sport_spring: e.target.value})} className="input-base text-sm py-1">{options.springSports.map(s => <option key={s} value={s}>{s}</option>)}</select>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <span className="w-12 text-xs font-bold text-muted-foreground uppercase">Fall</span>
                            <div className="flex items-center gap-2 text-sm font-medium text-foreground">{getSportIcon(profile.sport_fall)} {profile.sport_fall || 'None'}</div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="w-12 text-xs font-bold text-muted-foreground uppercase">Winter</span>
                            <div className="flex items-center gap-2 text-sm font-medium text-foreground">{getSportIcon(profile.sport_winter)} {profile.sport_winter || 'None'}</div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="w-12 text-xs font-bold text-muted-foreground uppercase">Spring</span>
                            <div className="flex items-center gap-2 text-sm font-medium text-foreground">{getSportIcon(profile.sport_spring)} {profile.sport_spring || 'None'}</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Extracurriculars: Searchable Multi-Select */}
            <div className="mt-6 pt-6 border-t border-border">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Extracurriculars</h3>
                
                {isEditing ? (
                    <div className="space-y-4">
                        {/* Band Toggle */}
                        <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer bg-muted/30 p-2 rounded border border-border hover:bg-muted/50 transition-colors">
                            <input type="checkbox" checked={formData.is_in_band} onChange={e => setFormData({...formData, is_in_band: e.target.checked})} className="rounded text-primary focus:ring-primary" />
                            <span className="font-bold">Band Member</span>
                        </label>

                        {/* Selected Tags */}
                        {formData.extracurriculars.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {formData.extracurriculars.map(activity => (
                                    <span key={activity} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                                        {activity}
                                        <button 
                                            onClick={() => removeActivity(activity)}
                                            className="hover:text-destructive focus:outline-none ml-1"
                                            title="Remove"
                                        >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Add New - Searchable Dropdown */}
                        <SearchableSelect
                            label=""
                            placeholder="Add activity..."
                            options={availableActivities}
                            value=""
                            onChange={(val) => {
                                if (val) addActivity(val);
                            }}
                        />
                    </div>
                ) : (
                    <div className="space-y-2">
                        {formData.extracurriculars.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {formData.extracurriculars.map(ex => (
                                    <span key={ex} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-secondary text-secondary-foreground">
                                        {ex}
                                    </span>
                                ))}
                            </div>
                        ) : <p className="text-sm text-muted-foreground italic">None recorded.</p>}
                    </div>
                )}
            </div>
        </div>

        {/* --- 3. DETAILS --- */}
        <div className="bg-card shadow-sm border border-border rounded-xl p-5">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Details</h3>
            {isEditing ? (
                <div className="space-y-3">
                    <div>
                        <label className="text-xs font-medium text-muted-foreground">Rank</label>
                        <select value={formData.cadet_rank} onChange={e => setFormData({...formData, cadet_rank: e.target.value})} className="input-base text-sm py-1">
                            <option value="">Select Rank</option>
                            {options.ranks.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                    <div><label className="text-xs font-medium text-muted-foreground">Room</label><input type="text" value={formData.room_number} onChange={e => setFormData({...formData, room_number: e.target.value})} className="input-base text-sm py-1" /></div>
                    <div>
                        <label className="text-xs font-medium text-muted-foreground">Grade</label>
                        <select value={formData.grade_level} onChange={e => setFormData({...formData, grade_level: e.target.value})} className="input-base text-sm py-1">
                            {options.grades.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex justify-between border-b border-border pb-2"><span className="text-sm text-muted-foreground">Company</span><span className="text-sm font-medium text-foreground">{profile.company?.company_name || '-'}</span></div>
                    <div className="flex justify-between border-b border-border pb-2"><span className="text-sm text-muted-foreground">Room</span><span className="text-sm font-medium text-foreground">{profile.room_number || '-'}</span></div>
                    <div className="flex justify-between border-b border-border pb-2"><span className="text-sm text-muted-foreground">Grade</span><span className="text-sm font-medium text-foreground">{profile.grade_level || '-'}</span></div>
                    <div className="flex justify-between pb-2"><span className="text-sm text-muted-foreground">Rank</span><span className="text-sm font-medium text-foreground">{profile.cadet_rank || '-'}</span></div>
                </div>
            )}
        </div>

        </>
        )}

      </div>

      {/* --- BOTTOM ROW --- */}
      {!isStaff && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* LEDGER */}
          <div className="bg-card shadow-sm border border-border rounded-xl overflow-hidden h-96 flex flex-col">
            <div className="px-6 py-4 border-b border-border bg-muted/30">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Disciplinary Record</h3>
            </div>
            <div className="overflow-y-auto flex-1">
                {auditLog && auditLog.length > 0 ? (
                <table className="min-w-full divide-y divide-border">
                    <thead className="bg-muted/50 sticky top-0">
                        <tr><th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Date</th><th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Event</th><th className="px-4 py-2 text-center text-xs font-medium text-muted-foreground uppercase">Dem</th><th className="px-4 py-2"></th></tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {auditLog.map((entry, idx) => (
                        <tr key={idx} className="hover:bg-muted/50 transition-colors text-sm">
                            <td className="px-4 py-2 text-muted-foreground whitespace-nowrap">{formatDate(entry.event_date)}</td>
                            <td className="px-4 py-2 text-foreground truncate max-w-[150px]">{entry.title}</td>
                            <td className="px-4 py-2 text-center font-mono text-foreground">{entry.demerits_issued > 0 ? entry.demerits_issued : (entry.tour_change !== 0 ? `${entry.tour_change}T` : '-')}</td>
                            <td className="px-4 py-2 text-right">{entry.report_id && <Link href={`/report/${entry.report_id}`} className="text-primary hover:underline text-xs">View</Link>}</td>
                        </tr>
                        ))}
                    </tbody>
                </table>
                ) : <div className="p-8 text-center text-muted-foreground italic text-sm">No disciplinary history recorded.</div>}
            </div>
          </div>

          {/* PARENT INFO (Faculty Only) */}
          {isFaculty ? (
              <div className="bg-card shadow-sm border border-border rounded-xl overflow-hidden h-96 flex flex-col">
                <div className="px-6 py-4 border-b border-border bg-yellow-50 dark:bg-yellow-900/10 flex justify-between items-center">
                    <h3 className="text-sm font-bold text-yellow-800 dark:text-yellow-200 uppercase tracking-wider flex items-center gap-2">Parent / Guardian</h3>
                    <span className="text-[10px] font-bold bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded uppercase">Faculty Only</span>
                </div>
                <div className="p-6 flex-1 overflow-y-auto">
                    <div className="space-y-6">
                        <div>
                            <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Primary Contact</p>
                            <p className="text-lg font-bold text-foreground">{profile.parent_name || 'Not Listed'}</p>
                            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                {profile.parent_phone || '(---) --- ----'}
                            </div>
                            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                {profile.parent_email || 'No Email'}
                            </div>
                        </div>
                    </div>
                </div>
              </div>
          ) : (
              <div className="bg-muted/10 border border-dashed border-border rounded-xl h-96 flex items-center justify-center text-muted-foreground text-sm">
                  Restricted Access
              </div>
          )}

      </div>
      )}

      {!isStaff && !isArchivedView && (
        <CadetScheduleOversight
          cadetId={profile.id}
          schedule={schedule}
          oversight={oversight}
          canEditSchedule={canEditSchedule}
          isFaculty={isFaculty}
          currentUserId={currentUserId}
          isArchivedView={isArchivedView}
        />
      )}
      {!isStaff && isArchivedView && (schedule.length > 0 || oversight.length > 0) && (
        <CadetScheduleOversight
          cadetId={profile.id}
          schedule={schedule}
          oversight={oversight}
          canEditSchedule={false}
          isFaculty={false}
          currentUserId={currentUserId}
          isArchivedView={isArchivedView}
        />
      )}

    </div>
  )
}