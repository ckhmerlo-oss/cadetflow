export const MAINTENANCE_HOME = '/work-orders'

const ALLOWED_PREFIXES = [
  '/work-orders',
  '/barracks/hallway',
  '/barracks/rooms/',
  '/barracks/forms/',
  '/submit',
  '/preferences',
  '/update-password',
  '/login',
]

export function isMaintenanceAllowedPath(pathname: string): boolean {
  if (pathname === '/') return false
  return ALLOWED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix)
  )
}

export function shouldUseMaintenanceShell(isMaintenance: boolean, isAdmin: boolean): boolean {
  return isMaintenance && !isAdmin
}
