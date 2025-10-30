// in app/page.tsx (This is your main dashboard)
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function Dashboard() {
  const supabase = createClient()

  // 1. Get the current user
  const { data: { user } } = await supabase.auth.getUser()

  // 2. If no user, redirect them to the login page
  if (!user) {
    return redirect('/login')
  }

  // 3. Fetch reports awaiting YOUR approval
  // RLS does all the magic here! You don't need a complex query.
  const { data: actionItems } = await supabase
    .from('reports') // Your table might be named 'demerit_reports'
    .select('*')
    // RLS automatically filters this to reports where you're in the group!

  // 4. Fetch reports YOU submitted
  const { data: mySubmittedReports } = await supabase
    .from('reports') // Your table might be named 'demerit_reports'
    .select('*')
    .eq('submitted_by', user.id)

  return (
    <div>
      <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '1em' }}>
        <span>Hello, {user.email}</span>
        <Link href="/submit">Submit New Report</Link>
      </nav>
      
      <main style={{ padding: '1em' }}>
        <h2>My Action Items ({actionItems?.length || 0})</h2>
        <ul>
          {actionItems?.map(report => (
            <li key={report.id}>
              {/* This link won't work yet, we'll build it next */}
              <Link href={`/report/${report.id}`}>{report.title} ({report.status})</Link>
            </li>
          ))}
        </ul>

        <h2>My Submitted Reports ({mySubmittedReports?.length || 0})</h2>
        <ul>
          {mySubmittedReports?.map(report => (
            <li key={report.id}>
              {/* This link won't work yet, we'll build it next */}
              <Link href={`/report/${report.id}`}>{report.title} ({report.status})</Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}