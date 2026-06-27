'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { isMaintenanceAllowedPath, MAINTENANCE_HOME } from '@/app/lib/maintenanceAccess'

export default function MaintenanceRouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!isMaintenanceAllowedPath(pathname)) {
      router.replace(MAINTENANCE_HOME)
    }
  }, [pathname, router])

  if (!isMaintenanceAllowedPath(pathname)) {
    return null
  }

  return <>{children}</>
}
