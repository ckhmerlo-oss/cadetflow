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
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        {/* Left side (title) */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {user.email?.split('@')[0]}
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Here's a summary of your reports.
          </p>
        </div>
        {/* Right side (button) */}
        <div>
          <Link 
            href="/submit" 
            className="py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Submit New Report
          </Link>
        </div>
      </div>

      {/* Grid for the two columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Column 1: My Action Items */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800">
            My Action Items ({actionItems?.length || 0})
          </h2>
          <div className="bg-white p-4 rounded-lg shadow space-y-3">
            {actionItems && actionItems.length > 0 ? (
              actionItems.map(report => (
                <Link 
                  href={`/report/${report.id}`} 
                  key={report.id}
                  className="block p-4 border rounded-md hover:bg-gray-50"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-indigo-600">{report.title}</span>
                    <span className="text-sm font-medium text-white bg-yellow-500 px-2 py-0.5 rounded-full">
                      {report.status}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-gray-500">No action items in your queue. Great job!</p>
            )}
          </div>
        </div>

        {/* Column 2: My Submitted Reports */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800">
            My Submitted Reports ({mySubmittedReports?.length || 0})
          </h2>
          <div className="bg-white p-4 rounded-lg shadow space-y-3">
            {mySubmittedReports && mySubmittedReports.length > 0 ? (
              mySubmittedReports.map(report => (
                <Link 
                  href={`/report/${report.id}`} 
                  key={report.id}
                  className="block p-4 border rounded-md hover:bg-gray-50"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">{report.title}</span>
                    {/* Dynamic "badge" for status */}
                    <span 
                      className={`text-sm font-medium px-2 py-0.5 rounded-full ${
                        report.status === 'approved' ? 'bg-green-100 text-green-800' :
                        report.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {report.status}
                    </span>
                  </div>
                  {/* Here's the transparency part you wanted! */}
                  {report.status === 'pending_approval' && (
                    <p className="text-sm text-gray-500 mt-2">
                      Waiting for: {report.current_group.name}
                    </p>
                  )}
                </Link>
              ))
            ) : (
              <p className="text-gray-500">You haven't submitted any reports yet.</p>
            )}
          </div>
        </div>
        
      </div>
    </div>
  )
}