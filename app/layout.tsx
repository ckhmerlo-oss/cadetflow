import './globals.css'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { ThemeProvider } from '@/app/components/ThemeProvider'
import HeaderMenu from '@/app/components/HeaderMenu'
import OnboardingTour from '@/app/components/tour/OnboardingTour'
import Snowfall from '@/app/components/Snowfall'
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
  let logoColor = "text-primary hover:text-foreground";
  let isSiteAdmin = false;
  let hasSeenTour = false;
  let isInBand = false; // <--- NEW VARIABLE

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select(`
        is_site_admin,
        has_seen_tour,
        is_in_band,
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
    isInBand = profile?.is_in_band || false;

    // --- Dynamic Role-Based Logos ---
    // We keep specific colors for specific roles (like Band/Staff) to maintain identity,
    // but update TAC to use semantic 'destructive' (Red) for better theme integration.

    if (roles?.role_name && roles.role_name.includes('Band Director')) {
      logoText = "Now with 100% More Band!"
      logoColor = "text-green-400 hover:text-green-700"
    } else if (roleLevel >= 60 || (roles?.role_name && roles.role_name.includes('TAC'))) {
      logoText = "TACFlow";
      // Update TAC color logic too
      logoColor = "text-destructive hover:text-foreground"; 
    } else if (company?.company_name === 'Battalion Staff') { 
      logoText = "StaffFlow";
      logoColor = "text-yellow-500 hover:text-yellow-600"; // Kept Gold
    } else if (roleLevel == 50) {
      logoText = "TeacherFlow"
      logoColor = "text-sky-500 hover:text-sky-600" // Kept Blue
    }
  }
  
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-background text-foreground`}>
        {/* NOTE: Ensure your '@/app/components/ThemeProvider' file includes the 
           themes={['light', 'dark', 'christmas', 'christmas-dark']} prop inside it 
           to fix the sticky theme bug.
        */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          >
          <header className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-50 transition-colors">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                
                {/* Logo */}
                <div className="flex-shrink-0">
                  <Link 
                    href="/" 
                    className={`text-2xl font-bold tracking-tight transition-colors ${logoColor}`}
                  >
                    {logoText}
                  </Link>
                </div>
               
                {/* Menu */}
                <div className="flex items-center">
                  <HeaderMenu 
                    isLoggedIn={!!user}
                    canManage={canManage}
                    showDailyReports={roleLevel >= 50}
                    isSiteAdmin={isSiteAdmin}
                    roleLevel={roleLevel}
                    isInBand={isInBand}
                  />
                </div>
              </div>
            </nav>
          </header>

          <main className="min-h-screen">
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
            <Snowfall/>
            {children}
          </main>
        </ThemeProvider>
        <SpeedInsights/>
        <Analytics/>
      </body>
    </html>
  )
}