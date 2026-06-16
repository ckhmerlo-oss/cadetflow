'use server'

import { createClient } from '@/utils/supabase/server'

export type UserNotification = {
  id: string
  event_type: string
  title: string
  body: string
  link_url: string | null
  metadata: Record<string, unknown>
  read_at: string | null
  created_at: string
}

export async function fetchNotifications(limit = 20, offset = 0): Promise<UserNotification[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('list_user_notifications', {
    p_limit: limit,
    p_offset: offset,
  })

  if (error) {
    console.error('Failed to fetch notifications:', error.message)
    return []
  }

  return (data ?? []) as UserNotification[]
}

export async function fetchUnreadNotificationCount(): Promise<number> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_unread_notification_count')

  if (error) {
    console.error('Failed to fetch unread count:', error.message)
    return 0
  }

  return Number(data ?? 0)
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.rpc('mark_notification_read', { p_id: notificationId })

  if (error) {
    console.error('Failed to mark notification read:', error.message)
  }
}

export async function markAllNotificationsRead(): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.rpc('mark_all_notifications_read')

  if (error) {
    console.error('Failed to mark all notifications read:', error.message)
  }
}

export async function clearAllNotifications(): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.rpc('clear_all_notifications')

  if (error) {
    console.error('Failed to clear notifications:', error.message)
  }
}
