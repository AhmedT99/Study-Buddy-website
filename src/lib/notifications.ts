export type AppNotification = {
  id: string
  title: string
  body: string
  type: 'message' | 'request' | 'system'
  isRead: boolean
  createdAt: string
  href?: string
}

const STORAGE_KEY = 'studybuddy.notifications'
const EVENT_NAME = 'studybuddy:notifications:updated'

function readNotifications() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return [] as AppNotification[]
    }

    const parsed = JSON.parse(raw) as AppNotification[]
    if (!Array.isArray(parsed)) {
      return [] as AppNotification[]
    }

    return parsed
  } catch {
    return [] as AppNotification[]
  }
}

function writeNotifications(notifications: AppNotification[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications))
  window.dispatchEvent(new Event(EVENT_NAME))
}

export function getNotifications() {
  return readNotifications().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}

export function addNotification(input: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'>) {
  const notifications = readNotifications()
  const nextNotification: AppNotification = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    isRead: false,
  }

  writeNotifications([nextNotification, ...notifications].slice(0, 100))
}

export function markNotificationAsRead(notificationId: string) {
  const notifications = readNotifications().map((notification) =>
    notification.id === notificationId
      ? {
          ...notification,
          isRead: true,
        }
      : notification,
  )
  writeNotifications(notifications)
}

export function markAllNotificationsAsRead() {
  const notifications = readNotifications().map((notification) => ({
    ...notification,
    isRead: true,
  }))
  writeNotifications(notifications)
}

export function clearNotifications() {
  writeNotifications([])
}

export function subscribeToNotifications(onUpdate: () => void) {
  function handleUpdate() {
    onUpdate()
  }

  window.addEventListener(EVENT_NAME, handleUpdate)
  window.addEventListener('storage', handleUpdate)

  return () => {
    window.removeEventListener(EVENT_NAME, handleUpdate)
    window.removeEventListener('storage', handleUpdate)
  }
}
