export const CADET_RANKS = [
  'c/PVT', 'c/PV2', 'c/PFC', 'c/CPL', 'c/SGT', 'c/SSG', 'c/SFC', 'c/MSG', 'c/1SG', 'c/SGM', 'c/CSM', 
  'c/2LT', 'c/1LT', 'c/CPT', 'c/MAJ', 'c/LTC', 'c/COL'
];

export const FALL_SPORTS = [
  'None', 'JV Football','Varsity Football', 'JV Soccer', 'Varsity Soccer', 'Cross Country', 'Swimming (Off Season)', 'PG Lacross', 'PG Basketball', 'PG Football', 'PT'
];

export const WINTER_SPORTS = [
  'None', 'JV Basketball', 'Varsity Basketball', 'Wrestling', 'Swimming', 'Indoor Track', 'PG Lacrosse', 'PG Basketball', 'PT' 
];

export const SPRING_SPORTS = [
  'None', 'Baseball', 'Varsity Lacrosse', 'Track & Field', 'Tennis', 'Golf', 'PG Basketball', 'PG Lacrosse', 
];

export { CONDUCT_LEVELS as CONDUCT_STATUSES } from '@/app/lib/blueBook';

export const PROBATION_STATUSES = [
  'None',
  'Academic',
  'Disciplinary',
  'Honor',
  'Physical'
];

export const GRADE_LEVELS = [
  '7th', '8th', '9th', '10th', '11th', '12th', 'PG'
];

// Roles authorized to EDIT profiles
export const EDIT_AUTHORIZED_ROLES = [
    'Admin',
    'Commandant',
    'Deputy Commandant',
    'Assistant Commandant',
    'TAC Officer',
    'Alpha CO',
    'First Sergeant'
  ]
// Roles authorized to manage Star Tours
export const STAR_TOUR_AUTHORIZED_ROLES = [
  'Commandant', 
  'Deputy Commandant', 
  'Admin'
];