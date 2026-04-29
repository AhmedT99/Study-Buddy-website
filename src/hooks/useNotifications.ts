import { useEffect, useMemo, useState } from 'react'
import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  subscribeToNotifications,
  type AppNotification,
} from '../lib/notifications'

function useNotifications() {
  const [items, setItems] = useState<AppNotification[]>(() => getNotifications())

  useEffect(() => {
    const unsubscribe = subscribeToNotifications(() => {
      setItems(getNotifications())
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const unreadCount = useMemo(
    () => items.filter((notification) => !notification.isRead).length,
    [items],
  )

  return {
    items,
    unreadCount,
    markAsRead: markNotificationAsRead,
    markAllAsRead: markAllNotificationsAsRead,
  }
}

export default useNotifications
