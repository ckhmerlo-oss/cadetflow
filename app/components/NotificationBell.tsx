'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  fetchNotifications,
  fetchUnreadNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
  clearAllNotifications,
  type UserNotification,
} from '@/app/lib/notificationActions'

const POLL_INTERVAL_MS = 60_000

const BellIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
  </svg>
)

function formatRelativeTime(iso: string): string {
  const date = new Date(iso)
  const diffMs = Date.now() - date.getTime()
  const diffMin = Math.floor(diffMs / 60_000)
  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  const diffDay = Math.floor(diffHr / 24)
  if (diffDay < 7) return `${diffDay}d ago`
  return date.toLocaleDateString()
}

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<UserNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const refreshCount = useCallback(async () => {
    const count = await fetchUnreadNotificationCount()
    setUnreadCount(count)
  }, [])

  const loadFeed = useCallback(async () => {
    setLoading(true)
    try {
      const [count, feed] = await Promise.all([
        fetchUnreadNotificationCount(),
        fetchNotifications(20, 0),
      ])
      setUnreadCount(count)
      setNotifications(feed)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshCount()
    const interval = setInterval(refreshCount, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [refreshCount])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleToggle = async () => {
    if (isOpen) {
      setIsOpen(false)
      return
    }

    setIsOpen(true)
    setNotifications([])
    await loadFeed()
  }

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead()
    await loadFeed()
  }

  const handleClearAll = async () => {
    await clearAllNotifications()
    setNotifications([])
    setUnreadCount(0)
  }

  const handleNotificationClick = async (notification: UserNotification) => {
    if (!notification.read_at) {
      await markNotificationRead(notification.id)
      setUnreadCount((c) => Math.max(0, c - 1))
      setNotifications((items) =>
        items.map((item) =>
          item.id === notification.id ? { ...item, read_at: new Date().toISOString() } : item
        )
      )
    }
    setIsOpen(false)
    if (notification.link_url) {
      router.push(notification.link_url)
    }
  }

  const badgeLabel = unreadCount > 9 ? '9+' : String(unreadCount)
  const hasNotifications = notifications.length > 0

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={handleToggle}
        aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}
        className="relative p-2 rounded-full text-muted-foreground hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[1.125rem] h-[1.125rem] px-1 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold leading-none">
            {badgeLabel}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-popover border border-border rounded-md shadow-lg z-50 animate-in fade-in zoom-in duration-200">
          <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="text-xs text-primary hover:text-primary/80 font-medium"
                >
                  Mark all read
                </button>
              )}
              {hasNotifications && !loading && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-xs text-destructive hover:text-destructive/80 font-medium"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <p className="px-4 py-6 text-sm text-muted-foreground text-center">Loading...</p>
            ) : notifications.length === 0 ? (
              <p className="px-4 py-6 text-sm text-muted-foreground text-center">No notifications yet.</p>
            ) : (
              <ul>
                {notifications.map((notification) => (
                  <li key={notification.id}>
                    <button
                      type="button"
                      onClick={() => handleNotificationClick(notification)}
                      className={`w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border last:border-b-0 ${
                        !notification.read_at ? 'bg-primary/5' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-foreground line-clamp-1">
                          {notification.title}
                        </p>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">
                          {formatRelativeTime(notification.created_at)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {notification.body}
                      </p>
                      {!notification.read_at && (
                        <span className="inline-block mt-1.5 w-2 h-2 rounded-full bg-primary" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
