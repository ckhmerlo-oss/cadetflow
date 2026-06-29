import { NextResponse, type NextRequest } from 'next/server'
import { buildLoginUrl, LOGIN_PATH } from '@/utils/auth-redirect'
import { createClient } from '@/utils/supabase/middleware'
import { isMaintenanceAllowedPath, MAINTENANCE_HOME } from '@/app/lib/maintenanceAccess'
import { isParentAllowedPath, PARENT_HOME } from '@/app/lib/parentAccess'

type ProfileRole = {
  role_name?: string
  default_role_level?: number
}

function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach(({ name, value, ...options }) => {
    to.cookies.set(name, value, options)
  })
}

function redirectWithCookies(
  request: NextRequest,
  path: string,
  response: NextResponse,
) {
  const redirectResponse = NextResponse.redirect(new URL(path, request.url))
  copyCookies(response, redirectResponse)
  return redirectResponse
}

function resolveRole(roleRaw: ProfileRole | ProfileRole[] | null | undefined): ProfileRole | null {
  if (!roleRaw) return null
  return Array.isArray(roleRaw) ? roleRaw[0] ?? null : roleRaw
}

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request)
  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  if (!user) {
    if (pathname === LOGIN_PATH) {
      return response
    }

    const returnPath =
      pathname + (request.nextUrl.search ? request.nextUrl.search : '')
    return redirectWithCookies(request, buildLoginUrl(returnPath), response)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_site_admin, role:roles(role_name, default_role_level)')
    .eq('id', user.id)
    .single()

  const role = resolveRole(profile?.role as ProfileRole | ProfileRole[] | null | undefined)
  const roleName = role?.role_name?.toLowerCase() ?? ''
  const isSiteAdmin = profile?.is_site_admin ?? false

  // Role-based routing in middleware avoids RSC redirect()/notFound() aborts that
  // trigger React dev-mode Performance.measure errors (vercel/next.js#86060).
  if (roleName === 'parent' && !isSiteAdmin) {
    if (pathname === '/' || !isParentAllowedPath(pathname)) {
      return redirectWithCookies(request, PARENT_HOME, response)
    }

    if (
      pathname.startsWith('/parent') &&
      pathname !== '/parent/legal/reaccept'
    ) {
      const { data: missingLegal } = await supabase.rpc(
        'user_missing_required_legal_acceptances',
      )
      if (missingLegal?.length) {
        return redirectWithCookies(request, '/parent/legal/reaccept', response)
      }
    }

    return response
  }

  if (roleName.includes('maintenance') && !isSiteAdmin) {
    if (pathname === '/' || !isMaintenanceAllowedPath(pathname)) {
      return redirectWithCookies(request, MAINTENANCE_HOME, response)
    }
    return response
  }

  if (pathname === '/' && role?.default_role_level === 10) {
    return redirectWithCookies(request, `/ledger/${user.id}`, response)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|auth/callback|update-password|invite/move-in|invite/portal|legal|api/demo).*)',
  ],
}
