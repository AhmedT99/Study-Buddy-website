import { Link } from 'react-router-dom'
import { timeAgo } from '../lib/timeAgo'
import useNotifications from '../hooks/useNotifications'

function NotificationsPage() {
  const { items, unreadCount, markAsRead, markAllAsRead } = useNotifications()

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4">
        <div>
          <p className="font-display text-xs font-medium uppercase tracking-[0.2em] text-accent-text">
            Notifications
          </p>
          <h2 className="mt-2 font-display text-2xl font-medium text-text-primary">
            Activity updates
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            {unreadCount} unread notification{unreadCount === 1 ? '' : 's'}
          </p>
        </div>
        <button
          type="button"
          onClick={markAllAsRead}
          className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs font-semibold text-text-secondary transition-colors hover:border-accent/30 hover:text-accent-text"
        >
          Mark all as read
        </button>
      </header>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface-1/50 py-16 text-center">
          <p className="font-display text-base font-medium text-text-primary">
            No notifications yet
          </p>
          <p className="mt-2 text-sm text-text-secondary">
            You will see new messages and request activity here.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li
              key={item.id}
              className={`rounded-2xl border p-4 ${
                item.isRead
                  ? 'border-border bg-surface-1'
                  : 'border-accent/20 bg-accent-muted/20'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-text-primary">{item.title}</p>
                  <p className="mt-1 text-sm text-text-secondary">{item.body}</p>
                  <p className="mt-2 text-xs text-text-tertiary">
                    {timeAgo(item.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {!item.isRead && (
                    <button
                      type="button"
                      onClick={() => markAsRead(item.id)}
                      className="rounded-lg border border-border px-2.5 py-1.5 text-[11px] font-medium text-text-secondary hover:border-accent/30 hover:text-accent-text"
                    >
                      Mark read
                    </button>
                  )}
                  {item.href && (
                    <Link
                      to={item.href}
                      className="rounded-lg bg-accent px-2.5 py-1.5 text-[11px] font-medium text-surface-0 hover:bg-accent-deep"
                    >
                      Open
                    </Link>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default NotificationsPage
