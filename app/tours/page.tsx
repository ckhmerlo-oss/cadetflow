import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getAllTourLogs, TourLogEntry } from './actions'
import Link from 'next/link'

export default async function TourLogsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  // 1. Check Permissions
  const { data: profile } = await supabase
    .from('profiles')
    .select('role:roles(default_role_level)')
    .eq('id', user.id)
    .single()
  
  const roleLevel = (profile?.role as any)?.default_role_level || 0
  if (roleLevel < 50) return redirect('/')

  // 2. Fetch Logs
  const logs = await getAllTourLogs()

  // 3. Group Logs by Date
  const groupedLogs: Record<string, TourLogEntry[]> = {};
  logs.forEach(log => {
      const dateKey = new Date(log.created_at).toLocaleDateString(undefined, { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
      });
      if (!groupedLogs[dateKey]) groupedLogs[dateKey] = [];
      groupedLogs[dateKey].push(log);
  });

  const formatName = (p: { first_name: string; last_name: string } | null) => 
    p ? `${p.last_name}, ${p.first_name}` : 'System'

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tour Ledger</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Daily record of tour assignments and reductions.
          </p>
        </div>
        
        {/* UPDATED BACK BUTTON */}
        <Link 
            href="/reports/daily" // This goes back to Roster
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
        >
            <span>&larr;</span> Back to Tour Sheet
        </Link>
      </div>

      {/* LOGS LIST */}
      <div className="space-y-8">
          {Object.keys(groupedLogs).length > 0 ? Object.entries(groupedLogs).map(([date, dayLogs]) => (
              <div key={date} className="space-y-3">
                  {/* DATE HEADER */}
                  <div className="sticky top-0 z-10 bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur py-2 border-b border-gray-200 dark:border-gray-700">
                      <h2 className="text-lg font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                          {date}
                      </h2>
                  </div>

                  {/* CARDS GRID */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {dayLogs.map(log => {
                          const isReduction = log.amount < 0;
                          return (
                              <div key={log.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
                                  
                                  {/* Top Row: Name & Badge */}
                                  <div className="flex justify-between items-start mb-3">
                                      <div>
                                          <span className="block text-xs font-bold text-gray-500 uppercase">Cadet</span>
                                          <span className="text-base font-bold text-gray-900 dark:text-white line-clamp-1">
                                              {formatName(log.cadet)}
                                          </span>
                                      </div>
                                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                                          isReduction 
                                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                      }`}>
                                          {log.amount > 0 ? `+${log.amount}` : log.amount}
                                      </span>
                                  </div>

                                  {/* Middle: Notes */}
                                  <div className="flex-grow mb-4">
                                      <span className="block text-xs font-bold text-gray-400 uppercase mb-1">Notes</span>
                                      <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 p-2 rounded border border-gray-100 dark:border-gray-700 min-h-[3rem]">
                                          {log.comment || <span className="italic text-gray-400">No notes provided.</span>}
                                      </p>
                                  </div>

                                  {/* Bottom: Staff & Time */}
                                  <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-xs text-gray-500">
                                      <div>
                                          <span className="font-bold mr-1">Logged By:</span>
                                          {formatName(log.staff)}
                                      </div>
                                      <span>
                                          {new Date(log.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                      </span>
                                  </div>
                              </div>
                          )
                      })}
                  </div>
              </div>
          )) : (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <p className="text-gray-500">No tour logs found.</p>
              </div>
          )}
      </div>
    </div>
  )
}