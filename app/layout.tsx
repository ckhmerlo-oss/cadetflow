import './globals.css'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { ThemeProvider } from '@/app/components/ThemeProvider'
import HeaderMenu from '@/app/components/HeaderMenu'
import MaintenanceRouteGuard from '@/app/components/MaintenanceRouteGuard'
import ParentRouteGuard from '@/app/components/ParentRouteGuard'
import OnboardingTour from '@/app/components/tour/OnboardingTour'
import { ONBOARDING_TOUR_ENABLED } from '@/app/components/tour/TourConfig'
import { MAINTENANCE_HOME, shouldUseMaintenanceShell } from '@/app/lib/maintenanceAccess'
import { PARENT_HOME, shouldUseParentShell } from '@/app/lib/parentAccess'
import DemoBanner from '@/app/components/DemoBanner'
import { DEMO_ENV_COOKIE, isDemoEnvironment, resolveRequestHost } from '@/app/lib/demoEnvironment'
import { headers, cookies } from 'next/headers'
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
  const headerStore = await headers()
  const cookieStore = await cookies()
  const host = resolveRequestHost(headerStore)
  const demoCookie = cookieStore.get(DEMO_ENV_COOKIE)?.value === 'demo'
  const showDemoBanner = isDemoEnvironment({ host, demoCookie })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let canManage = false
  let roleLevel = 0
  let logoText = "CadetFlow";
  let logoColor = "text-primary hover:text-foreground";
  let isSiteAdmin = false;
  let hasSeenTour = false;
  let isInBand = false;
  let isMaintenanceManager = false;
  let isMaintenanceOnlyNav = false;
  let isParentOnlyNav = false;
  let logoHref = '/';

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select(`
        is_site_admin,
        has_seen_tour,
        role:roles(can_manage_own_company_roster, can_manage_all_rosters, role_name, default_role_level),
        company:companies(company_name),
        cadet_profiles(is_in_band)
      `)
      .eq('id', user.id)
      .single()
    
    const roleRaw = (profile as { role?: unknown })?.role
    const role = Array.isArray(roleRaw) ? roleRaw[0] : roleRaw as {
      default_role_level?: number
      can_manage_own_company_roster?: boolean
      can_manage_all_rosters?: boolean
      role_name?: string
    } | null | undefined
    const company = (profile as { company?: { company_name?: string } | { company_name?: string }[] | null })?.company
    const companyName = Array.isArray(company) ? company[0]?.company_name : company?.company_name

    if (role) {
      roleLevel = role.default_role_level || 0;
      canManage = Boolean(role.can_manage_own_company_roster || role.can_manage_all_rosters);
      isMaintenanceManager = Boolean(role.role_name && role.role_name.toLowerCase().includes('maintenance'));
    }
    
    isSiteAdmin = profile?.is_site_admin || false;
    isMaintenanceOnlyNav = shouldUseMaintenanceShell(isMaintenanceManager, isSiteAdmin);
    isParentOnlyNav = shouldUseParentShell(role?.role_name, isSiteAdmin);
    hasSeenTour = profile?.has_seen_tour || false;
    const cadetDetails = Array.isArray((profile as any)?.cadet_profiles)
      ? (profile as any).cadet_profiles[0]
      : (profile as any)?.cadet_profiles
    isInBand = cadetDetails?.is_in_band || false;

    // --- Dynamic Role-Based Logos ---
    // We keep specific colors for specific roles (like Band/Staff) to maintain identity,
    // but update TAC to use semantic 'destructive' (Red) for better theme integration.

    if (isMaintenanceOnlyNav) {
      logoText = 'WorkFlow';
      logoColor = 'text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300';
      logoHref = MAINTENANCE_HOME;
    } else if (isParentOnlyNav) {
      logoText = 'CadetFlow Family';
      logoColor = 'text-primary hover:text-foreground';
      logoHref = PARENT_HOME;
    } else if (role?.role_name && role.role_name.includes('Band Director')) {
      logoText = "Now with 100% More Band!"
      logoColor = "text-green-400 hover:text-green-700"
    } else if (roleLevel >= 60 || (role?.role_name && role.role_name.includes('TAC'))) {
      logoText = "TACFlow";
      // Update TAC color logic too
      logoColor = "text-destructive hover:text-foreground"; 
    } else if (roleLevel >= 70 || (role?.role_name && role.role_name.includes('Band SDO'))) {
      logoText = "TACs rule SDOs Drool";
      // Update TAC color logic too
      logoColor = "text-pink-400 hover:text-pink-700"; 
    } else if (roleLevel >= 100 || (role?.role_name && role.role_name.includes('Admin'))) {
      logoText = "Hi!";
      // Update TAC color logic too
      logoColor = "text-green-300 hover:text-green-500"; 
    } else if (companyName === 'Battalion Staff') { 
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
          <header className="no-print bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-50 transition-colors">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                
                {/* Logo */}
                <div className="flex-shrink-0">
                  <Link 
                    href={logoHref} 
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
                    showDailyReports={roleLevel >= 50 && !isMaintenanceOnlyNav}
                    showClasses={roleLevel >= 50 && roleLevel < 65 && !isMaintenanceOnlyNav}
                    isSiteAdmin={isSiteAdmin}
                    roleLevel={roleLevel}
                    isInBand={isInBand}
                    isMaintenanceManager={isMaintenanceManager}
                    isMaintenanceOnlyNav={isMaintenanceOnlyNav}
                    isParentOnlyNav={isParentOnlyNav}
                    showDemoDocs={showDemoBanner}
                  />
                </div>
              </div>
            </nav>
          </header>

          {showDemoBanner && <DemoBanner />}

          <main className="min-h-screen">
            {user && ONBOARDING_TOUR_ENABLED && !isMaintenanceOnlyNav && !isParentOnlyNav && (
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
            {isMaintenanceOnlyNav ? (
              <MaintenanceRouteGuard>{children}</MaintenanceRouteGuard>
            ) : isParentOnlyNav ? (
              <ParentRouteGuard>{children}</ParentRouteGuard>
            ) : (
              children
            )}
          </main>
        </ThemeProvider>
        <SpeedInsights/>
        <Analytics/>
      </body>
    </html>
  )
}