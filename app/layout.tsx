// in app/layout.tsx
import './globals.css'
import { Inter } from 'next/font/google'
import SignOutButton from '@/app/components/SignOutButton'
import Link from 'next/link'
// *** NEW: Import the server client ***
import { createClient } from '@/utils/supabase/server'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'CadetFlow',
  description: 'Approval workflow application',
}

// *** NEW: Make the function async ***
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  // *** NEW: Check user and permissions ***
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  let canManage = false
  let isCommandantStaff = false
  
  // *** NEW: Default Logo State ***
  let logoText = "CadetFlow";
  let logoColor = "text-indigo-600 hover:text-indigo-700";

if (user) {if (user) {
    // Check if the user has roster management permissions
    const { data: profile } = await supabase
      .from('profiles')
      .select('roles(can_manage_own_company_roster, can_manage_all_rosters, role_name)')
      .eq('id', user.id)
      .single()
    
    const roles = (profile as any)?.roles

    // *** NEW: Check if 'roles' exists before trying to read it ***
    if (roles) {
      if (roles.can_manage_own_company_roster || roles.can_manage_all_rosters) {
        canManage = true
      }

      // Check for Commandant Staff
      isCommandantStaff = roles.role_name === 'Commandant' || roles.role_name === 'Deputy Commandant'

      // Set Logo based on role
      if (isCommandantStaff || roles.role_name === 'TAC Officer') {
        logoText = "TACFlow";
        logoColor = "text-red-600 hover:text-red-700";
      } else if (['Battalion Commander', 'Command Sergeant Major', 'S1'].includes(roles.role_name)) {
        logoText = "StaffFlow";
        logoColor = "text-yellow-600 hover:text-yellow-700";
      }
    }
    // If 'roles' is null (like for a new user), all this logic is
    // skipped, and the defaults (CadetFlow logo, no links) are used.
}
}

  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-900`}>
        <header className="bg-white shadow-sm border-b border-gray-200">
          <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="flex justify-between items-center h-16">
              
              {/* Logo/Title */}
            <div className="flex-shrink-0">
              <Link 
                href="/" 
                className={`text-2xl font-bold ${logoColor} transition-colors`}
              >
                {logoText}
              </Link>
            </div>

              {/* Right Side Links & Button */}
              <div className="flex items-center space-x-4">
                {/* *** NEW: Conditional Daily Reports Link *** */}
                {isCommandantStaff && (
                  <Link 
                    href="/reports/daily" 
                    className="text-sm font-medium text-gray-600 hover:text-indigo-600"
                  >
                    Daily Reports
                  </Link>
                )}
                {/* *** END NEW SECTION *** */}

                {/* Conditional Manage Link */}
                {canManage && (
                  <Link 
                    href="/manage" 
                    className="text-sm font-medium text-gray-600 hover:text-indigo-600"
                  >
                    Manage Roster
                  </Link>
                )}
                <SignOutButton />
              </div>
            </div>
          </nav>
        </header>

        {/* This is where your pages will be rendered */}
        <main>
          {children}
        </main>
      </body>
    </html>
  )
}