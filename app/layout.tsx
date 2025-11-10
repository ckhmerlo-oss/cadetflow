// in app/layout.tsx
import './globals.css'
import { Inter } from 'next/font/google'
import SignOutButton from '@/app/components/SignOutButton'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { ThemeProvider } from '@/app/components/ThemeProvider'
import ThemeToggleButton from '@/app/components/ThemeToggleButton'
import FeedbackButton from '@/app/components/FeedbackButton'


const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'CadetFlow',
  description: 'Approval workflow application',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // --- Initialize all permission variables with defaults ---
  let canManage = false
  let isCommandantStaff = false
  let roleLevel = 0 // <--- FIX: Added this initialization
  let logoText = "CadetFlow";
  let logoColor = "text-indigo-600 hover:text-indigo-700";

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select(`
        roles(can_manage_own_company_roster, can_manage_all_rosters, role_name, default_role_level),
        company:companies(company_name)
      `)
      .eq('id', user.id)
      .single()
    
    const roles = (profile as any)?.roles
    const company = (profile as any)?.company 

    if (roles) {
      // --- FIX: Set the actual level here ---
      roleLevel = roles.default_role_level || 0;

      if (roles.can_manage_own_company_roster || roles.can_manage_all_rosters) {
        canManage = true
      }
      isCommandantStaff = roles.role_name === 'Commandant' || roles.role_name === 'Deputy Commandant'
    }

    if (isCommandantStaff || (roles?.role_name && roles.role_name.includes('TAC'))) {
      logoText = "TACFlow";
      logoColor = "text-red-600 hover:text-red-700";
    } else if (company?.company_name === 'Battalion Staff') { 
      logoText = "StaffFlow";
      logoColor = "text-yellow-600 hover:text-yellow-700";
    }
  }

  return (
    // *** FIX: Added className="dark" to prevent white flash on load ***
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.className}`}>
        <ThemeProvider defaultTheme="dark">
          <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
            <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              
              <div className="flex justify-between items-center h-16">
                
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <Link 
                      href="/" 
                      className={`text-2xl font-bold ${logoColor} transition-colors`}
                    >
                      {logoText}
                    </Link>
                  </div>
                  {user && <FeedbackButton />}
                </div>
               
                <div className="flex items-center space-x-4">
                  {/* Use the now-defined roleLevel variable */}
                  {roleLevel >= 50 && (
                    <Link 
                      href="/reports/daily" 
                      className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600"
                    >
                      Daily Reports
                    </Link>
                  )}
                  {canManage && (
                    <Link 
                      href="/manage" 
                      className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600"
                    >
                      Manage Roster
                    </Link>
                  )}
                                  
                  <ThemeToggleButton />
                  <SignOutButton />
                </div>
              </div>
            </nav>
          </header>

          <main>
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  )
}