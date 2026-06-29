import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getAllTourLogs, TourLogEntry } from './actions'
import Link from 'next/link'

export default async function TourLogsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  // 1. Check Permissions
  const { data: profile } = await supabase
    .from('profiles')
    .select('role:roles(default_role_level)')
    .eq('id', user.id)
    .eq('archived', false)
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
          <h1 className="text-3xl font-bold text-primary">Tour Ledger</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Daily record of tour assignments and reductions.
          </p>
        </div>
        
        {/* UPDATED BACK BUTTON */}
        <Link 
            href="/reports/daily" // This goes back to Roster
            className="px-4 py-2 bg-card border border-input rounded-md text-sm font-medium text-foreground hover:bg-accent transition-colors flex items-center gap-2"
        >
            <span>&larr;</span> Back to Tour Sheet
        </Link>
      </div>

      {/* LOGS LIST */}
      <div className="space-y-8">
          {Object.keys(groupedLogs).length > 0 ? Object.entries(groupedLogs).map(([date, dayLogs]) => (
              <div key={date} className="space-y-3">
                  <div className="sticky top-0 z-10 bg-background/95 backdrop-blur py-2 border-b border-border">
                      <h2 className="text-lg font-bold text-muted-foreground uppercase tracking-wide">
                          {date}
                      </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {dayLogs.map(log => {
                          const isReduction = log.amount < 0;
                          return (
                              <div key={log.id} className="bg-card rounded-lg shadow-sm border border-border p-4 flex flex-col justify-between transition-colors">
                                  
                                  {/* Top Row: Name & Badge */}
                                  <div className="flex justify-between items-start mb-3">
                                      <div>
                                          <span className="block text-xs font-bold text-muted-foreground uppercase">Cadet</span>
                                          {/* LINK TO LEDGER */}
                                          <Link 
                                            href={`/ledger/${log.cadet_id}`}
                                            className="text-base font-bold text-primary hover:underline line-clamp-1"
                                          >
                                              {formatName(log.cadet)}
                                          </Link>
                                      </div>
                                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                                          isReduction 
                                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' 
                                          : 'bg-destructive/10 text-destructive'
                                      }`}>
                                          {log.amount > 0 ? `+${log.amount}` : log.amount}
                                      </span>
                                  </div>

                                  {/* Middle: Notes */}
                                  <div className="flex-grow mb-4">
                                      <span className="block text-xs font-bold text-muted-foreground uppercase mb-1">Notes</span>
                                      <p className="text-sm text-foreground bg-muted/50 p-2 rounded border border-border min-h-[3rem]">
                                          {log.comment || <span className="italic text-muted-foreground">No notes provided.</span>}
                                      </p>
                                  </div>

                                  {/* Bottom: Staff & Time */}
                                  <div className="pt-3 border-t border-border flex justify-between items-center text-xs text-muted-foreground">
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
              <div className="text-center py-12 bg-card rounded-lg border border-border">
                  <p className="text-muted-foreground">No tour logs found.</p>
              </div>
          )}
      </div>
    </div>
  )
}