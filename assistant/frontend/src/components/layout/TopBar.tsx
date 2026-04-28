import { Bell, ChevronLeft, ChevronRight, Command, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';
import { MobileMenuButton } from './Sidebar';
import { loadMyInAppNotifications, markAllInAppNotificationsAsRead, markInAppNotificationAsRead } from '../../lib/domainApi';
import type { InAppNotification } from '../../types';

interface TopBarProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function TopBar({ title, subtitle, actions }: TopBarProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const sidebar = useOutletContext<{ toggle: () => void }>();
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() || 'FD';

  const hasUnread = unreadCount > 0;

  const previewNotifications = useMemo(() => notifications.slice(0, 8), [notifications]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setNotifLoading(true);
      try {
        const data = await loadMyInAppNotifications();
        if (!mounted) return;
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      } catch {
        if (!mounted) return;
      } finally {
        if (mounted) setNotifLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  async function toggleNotifications() {
    const next = !notifOpen;
    setNotifOpen(next);
    if (!next) return;
    setNotifLoading(true);
    try {
      const data = await loadMyInAppNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } finally {
      setNotifLoading(false);
    }
  }

  async function markOneRead(notificationId: string) {
    try {
      await markInAppNotificationAsRead(notificationId);
      setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // no-op UI fallback
    }
  }

  async function markAllRead() {
    try {
      await markAllInAppNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      // no-op UI fallback
    }
  }

  function resolveNotificationPath(notification: InAppNotification): string | null {
    if (notification.reference_type === 'candidate' && notification.reference_id) {
      return `/candidates/${notification.reference_id}`;
    }
    return null;
  }

  async function openNotification(notification: InAppNotification) {
    if (!notification.read) {
      await markOneRead(notification.id);
    }

    const path = resolveNotificationPath(notification);
    setNotifOpen(false);
    if (path) {
      navigate(path);
    }
  }

  return (
    <header className="h-header bg-t-bg1 border-b border-t-stroke2 flex items-center px-3 md:px-4 shrink-0 gap-2">
      {/* Mobile hamburger */}
      {sidebar && <MobileMenuButton onClick={sidebar.toggle} />}

      {/* Back/Forward nav - hidden on mobile */}
      <div className="hidden md:flex items-center gap-0.5 mr-2">
        <button className="w-7 h-7 flex items-center justify-center rounded-fluent text-t-fg3 hover:bg-t-bg1-hover transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button className="w-7 h-7 flex items-center justify-center rounded-fluent text-t-fg-disabled hover:bg-t-bg1-hover transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Title */}
      <div className="mr-2 md:mr-4 min-w-0">
        <p className="text-body1 font-semibold text-t-fg1 truncate">{title}</p>
        {subtitle && <p className="text-caption2 text-t-fg3 truncate">{subtitle}</p>}
      </div>

      {/* Centered search - hidden on small mobile */}
      <div className="flex-1 hidden sm:flex justify-center">
        <div className="relative w-full max-w-[480px] h-8 pl-9 pr-2 text-body1 bg-t-bg3 border border-t-stroke2 rounded-fluent text-left cursor-default">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-t-fg3" />
          <span className="text-t-fg3">Rechercher ou agir</span>
        </div>
      </div>

      {/* Spacer on mobile when search hidden */}
      <div className="flex-1 sm:hidden" />

      {/* Right actions */}
      <div className="flex items-center gap-1 ml-2 md:ml-4 shrink-0">
        {actions}

        <div className="relative">
          <button
            onClick={toggleNotifications}
            className="w-8 h-8 flex items-center justify-center rounded-fluent text-t-fg3 hover:bg-t-bg1-hover transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {hasUnread && (
              <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-t-danger text-white text-[10px] leading-4 text-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-[320px] max-h-[420px] overflow-y-auto bg-t-bg1 border border-t-stroke3 rounded-fluent shadow-lg z-50">
              <div className="px-3 py-2 border-b border-t-stroke3 flex items-center justify-between">
                <span className="text-caption1 font-semibold text-t-fg2">Notifications</span>
                <button
                  onClick={markAllRead}
                  disabled={unreadCount === 0}
                  className="text-caption2 text-t-fg-brand disabled:text-t-fg-disabled"
                >
                  Tout marquer lu
                </button>
              </div>
              {notifLoading ? (
                <div className="px-3 py-4 text-caption1 text-t-fg3">Chargement...</div>
              ) : previewNotifications.length === 0 ? (
                <div className="px-3 py-4 text-caption1 text-t-fg3">Aucune notification</div>
              ) : (
                previewNotifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => {
                      void openNotification(n);
                    }}
                    className={`w-full text-left px-3 py-2 border-b border-t-stroke3 last:border-b-0 hover:bg-t-bg1-hover ${n.read ? 'opacity-80' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-caption1 font-semibold text-t-fg2">{n.title}</span>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-t-brand-80 mt-1" />}
                    </div>
                    <p className="text-caption1 text-t-fg3 mt-1 line-clamp-2">{n.message}</p>
                    <p className="text-caption2 text-t-fg-disabled mt-1">{new Date(n.created_at).toLocaleString('fr-FR')}</p>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Profile avatar */}
      <div className="w-8 h-8 rounded-full bg-t-brand-70 flex items-center justify-center ml-1 md:ml-2 cursor-pointer hover:brightness-110 transition-all shrink-0">
        <span className="text-white text-caption2 font-semibold">{initials}</span>
      </div>
    </header>
  );
}
