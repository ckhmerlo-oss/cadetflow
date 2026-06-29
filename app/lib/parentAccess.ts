export const PARENT_HOME = '/parent'

const ALLOWED_PREFIXES = [
  '/parent',
  '/move-in/forms/',
  '/invite/move-in/',
  '/invite/portal/',
  '/legal/',
  '/preferences',
  '/update-password',
  '/login',
]

export function isParentAllowedPath(pathname: string): boolean {
  if (pathname === '/') return false
  return ALLOWED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix)
  )
}

export function isParentRole(roleName: string | null | undefined): boolean {
  return Boolean(roleName && roleName.toLowerCase() === 'parent')
}

export function shouldUseParentShell(
  roleName: string | null | undefined,
  isSiteAdmin: boolean
): boolean {
  return isParentRole(roleName) && !isSiteAdmin
}
