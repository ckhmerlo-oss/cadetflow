export const LOGIN_PATH = '/login'
export const REDIRECT_PARAM = 'redirect'

/** Allow only same-origin relative paths (blocks open redirects). */
export function getSafeRedirectPath(
  raw: string | null | undefined,
  fallback = '/',
): string {
  if (!raw) return fallback
  if (!raw.startsWith('/') || raw.startsWith('//')) return fallback
  if (raw === LOGIN_PATH || raw.startsWith(`${LOGIN_PATH}?`)) return fallback
  return raw
}

export function buildLoginUrl(returnPath?: string | null): string {
  const safePath = returnPath ? getSafeRedirectPath(returnPath, '') : ''
  if (!safePath || safePath === '/') return LOGIN_PATH
  return `${LOGIN_PATH}?${REDIRECT_PARAM}=${encodeURIComponent(safePath)}`
}
