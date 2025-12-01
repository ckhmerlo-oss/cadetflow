import './globals.css'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { ThemeProvider } from '@/app/components/ThemeProvider'
import HeaderMenu from '@/app/components/HeaderMenu'
import OnboardingTour from '@/app/components/tour/OnboardingTour'

import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"

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
  
  let canManage = false
  let roleLevel = 0
  let logoText = "CadetFlow";
  let logoColor = "text-indigo-600 hover:text-indigo-700";
  let isSiteAdmin = false;
  let hasSeenTour = false;

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select(`
        is_site_admin,
        has_seen_tour,
        roles(can_manage_own_company_roster, can_manage_all_rosters, role_name, default_role_level),
        company:companies(company_name)
      `)
      .eq('id', user.id)
      .single()
    
    const roles = (profile as any)?.roles
    const company = (profile as any)?.company 

    if (roles) {
      roleLevel = roles.default_role_level || 0;
      canManage = roles.can_manage_own_company_roster || roles.can_manage_all_rosters;
    }
    
    isSiteAdmin = profile?.is_site_admin || false;
    hasSeenTour = profile?.has_seen_tour || false;

    // Dynamic Logo Logic
    if (roleLevel >= 60 || (roles?.role_name && roles.role_name.includes('TAC'))) {
      logoText = "TACFlow";
      logoColor = "text-red-600 hover:text-red-700";
    } else if (company?.company_name === 'Battalion Staff') { 
      logoText = "StaffFlow";
      logoColor = "text-yellow-600 hover:text-yellow-700";
    }
  }
  
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.className}`}>
        <ThemeProvider defaultTheme="dark">
          <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
            <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                
                <div className="flex-shrink-0">
                  <Link 
                    href="/" 
                    className={`text-2xl font-bold ${logoColor} transition-colors`}
                  >
                    {logoText}
                  </Link>
                </div>
               
                <div className="flex items-center">
                  <HeaderMenu 
                    isLoggedIn={!!user}
                    canManage={canManage}
                    showDailyReports={roleLevel >= 50}
                    isSiteAdmin={isSiteAdmin}
                    roleLevel={roleLevel} // <--- Added this prop
                  />
                </div>
              </div>
            </nav>
          </header>

          <main>
            {user && (
              <OnboardingTour 
                show={!hasSeenTour} 
                canManage={canManage}
                showDailyReports={roleLevel >= 50}
                isSiteAdmin={isSiteAdmin}
                roleLevel={roleLevel}
                userId={user.id}
              />
            )}
            {children}
          </main>
        </ThemeProvider>
        <SpeedInsights/>
        <Analytics/>
      </body>
    </html>
  )
}