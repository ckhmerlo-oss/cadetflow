'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { isParentAllowedPath, PARENT_HOME } from '@/app/lib/parentAccess'

export default function ParentRouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!isParentAllowedPath(pathname)) {
      router.replace(PARENT_HOME)
    }
  }, [pathname, router])

  if (!isParentAllowedPath(pathname)) {
    return null
  }

  return <>{children}</>
}
