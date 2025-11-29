export type TourStep = {
  id: string;
  path: string;
  targetId: string;
  title: string;
  content: string;
  placement: 'top' | 'bottom' | 'left' | 'right';
  shouldShow: (permissions: UserPermissions) => boolean;
  disableScroll?: boolean;
}

export type UserPermissions = {
  roleLevel: number;
  canManage: boolean;
  isSiteAdmin: boolean;
  showDailyReports: boolean;
  userId: string;
}

export const TOUR_STEPS: TourStep[] = [
  // --- LEVEL 10 SPECIFIC TOUR (Ledger Only) ---
  {
    id: 'ledger-intro',
    path: '/ledger/::userId::', 
    targetId: 'ledger-header',
    title: 'Your Disciplinary Record',
    content: 'This is your personal ledger. It tracks every demerit you have received and every tour you have served.',
    placement: 'bottom',
    shouldShow: (p) => p.roleLevel === 10
  },
  {
    id: 'ledger-stats',
    path: '/ledger/::userId::',
    targetId: 'ledger-stats-grid',
    title: 'Current Standing',
    content: 'Keep an eye on these numbers. Your "Current Tour Balance" tells you how many penalty tours you currently owe.',
    placement: 'bottom',
    shouldShow: (p) => p.roleLevel === 10
  },
  {
    id: 'ledger-history',
    path: '/ledger/::userId::',
    targetId: 'ledger-history-list',
    title: 'Report History',
    content: 'This list shows all reports filed against you. Click any report title to view the full details or file an appeal.',
    placement: 'top',
    shouldShow: (p) => p.roleLevel === 10
  },

  // --- STANDARD TOUR (Level 15+) ---
  {
    id: 'dashboard-intro',
    path: '/',
    targetId: 'nav-dashboard',
    title: 'Dashboard',
    content: 'This is your command center.',
    placement: 'bottom',
    shouldShow: (p) => p.roleLevel >= 15
  },
  {
    id: 'dashboard-action-items',
    path: '/',
    targetId: 'dashboard-action-items',
    title: 'Action Items',
    content: 'This is the most important section. Reports waiting for your approval, revision, or attention will appear here.',
    placement: 'right', 
    shouldShow: (p) => p.roleLevel >= 15,
    disableScroll: true
  },
  {
    id: 'nav-submit',
    path: '/',
    targetId: 'nav-submit',
    title: 'Submit Report',
    content: 'Click here to file a new demerit report.',
    placement: 'bottom',
    shouldShow: (p) => p.roleLevel >= 15,
    disableScroll: true
  },
  
  // --- STAFF (Level 50+) ---
  {
    id: 'green-sheet',
    path: '/reports/daily',
    targetId: 'green-sheet-container',
    title: 'Daily Reports',
    content: 'View the unposted Green Sheet here. You can toggle to the Tour Sheet to log served punishments.',
    placement: 'top',
    shouldShow: (p) => p.showDailyReports
  },
  
  // --- ADMIN / MANAGE ---
  {
    id: 'roster-manage',
    path: '/manage',
    targetId: 'roster-controls', // <--- CHANGED TARGET
    title: 'Roster Management',
    content: 'Search for cadets, assign roles, or move them between companies using these filters.',
    placement: 'bottom', // <--- CHANGED PLACEMENT
    shouldShow: (p) => p.canManage
  },

  // --- FINISH (Everyone) ---
  {
    id: 'finish-logout',
    path: '/', 
    targetId: 'nav-signout', 
    title: 'Sign Out',
    content: 'When you are done, use this button to log out.',
    placement: 'left',
    shouldShow: (p) => p.roleLevel >= 15,
    disableScroll: true
  },
  {
    id: 'finish-logout-l10',
    path: '/ledger/::userId::', 
    targetId: 'nav-signout', 
    title: 'Sign Out',
    content: 'Use this button to log out.',
    placement: 'left',
    shouldShow: (p) => p.roleLevel === 10,
    disableScroll: true
  }
];