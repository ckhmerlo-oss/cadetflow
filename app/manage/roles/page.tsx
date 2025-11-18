// app/manage/roles/page.tsx
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ChainVisualizer from './components/ChainVisualizer'

// Define the required types for safety
type Company = { id: string; company_name: string }
type UserProfile = {
    company_id: string | null;
    role: {
        can_manage_all_rosters: boolean;
        can_manage_own_company_roster: boolean;
        default_role_level: number;
    } | null;
}

export default async function RolesConfigurationPage() {
  const supabase = createClient()

  // 1. Get User & Permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select(`
        company_id, 
        role:role_id (can_manage_all_rosters, can_manage_own_company_roster, default_role_level)
    `)
    .eq('id', user.id)
    .single<UserProfile>()
    
  const userPermissions = profile?.role || { can_manage_all_rosters: false, can_manage_own_company_roster: false, default_role_level: 0 }
  const userCompanyId = profile?.company_id

  // 2. Authorization Check (Staff/High Level Required to configure the chain)
  // This prevents non-managers from even loading the page
  if (userPermissions.default_role_level < 50) {
      return <div className="max-w-7xl mx-auto p-8 text-red-500">Permission Denied: You must be Staff (Level 50+) or higher to configure the Chain of Command.</div>
  }

  // 3. Fetch all potential companies (excluding non-cadet units)
  const { data: allCompanies } = await supabase
    .from('companies')
    .select('id, company_name')
    // Exclude Commandant Department and Faculty, as requested
    .not('company_name', 'in', '("Commandant Department", "Faculty")') 
    .order('company_name')

  // 4. Apply Management Filters
  const filteredCompanies = (allCompanies || [])
    .filter(company => {
        // Condition A: If user can manage all, show all companies
        if (userPermissions.can_manage_all_rosters) {
            return true;
        }
        
        // Condition B: If user can manage their own company, show only their company
        if (userPermissions.can_manage_own_company_roster && userCompanyId) {
            return company.id === userCompanyId;
        }
        
        // If neither condition is met, exclude the company
        return false;
    }) as Company[]

  return (
    <div className="max-w-[95vw] mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Chain of Command Configuration</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Select a company to visualize and edit its specific approval flow.
        </p>
      </div>
      
      {filteredCompanies.length === 0 ? (
          <div className="p-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-800 rounded-lg">
              <h2 className="text-lg font-medium text-yellow-800 dark:text-yellow-200">No Companies Available</h2>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Your current role does not grant permission to configure any company's approval chain.
              </p>
          </div>
      ) : (
          // Pass the filtered list of companies to the client
          <ChainVisualizer initialCompanies={filteredCompanies} />
      )}
    </div>
  )
}