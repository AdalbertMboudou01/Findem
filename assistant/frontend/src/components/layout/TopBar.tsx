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
    <header className="h-header bg-t-bg1 border-b border-t-stroke2 flex items-center px-3 md:px-4 shrink-0 gap-2" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      {/* Mobile hamburger */}
      {sidebar && <MobileMenuButton onClick={sidebar.toggle} />}

      {/* Back/Forward nav */}
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
        <p className="text-body1 font-semibold text-t-fg1 truncate leading-tight">{title}</p>
        {subtitle && <p className="text-caption2 text-t-fg3 truncate">{subtitle}</p>}
      </div>

      {/* Centered search */}
      <div className="flex-1 hidden sm:flex justify-center">
        <div className="relative w-full max-w-[480px] h-8 pl-9 pr-3 text-body1 bg-t-bg3 border border-t-stroke2 rounded-fluent text-left cursor-default flex items-center transition-colors hover:border-t-stroke-brand/40 hover:bg-t-bg1-hover">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-t-fg3" />
          <span className="text-t-fg3 text-caption1">Rechercher ou agir</span>
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-50">
            <Command className="w-3 h-3 text-t-fg3" />
            <span className="text-[10px] text-t-fg3">K</span>
          </div>
        </div>
      </div>

      <div className="flex-1 sm:hidden" />

      {/* Right actions */}
      <div className="flex items-center gap-1 ml-2 md:ml-3 shrink-0">
        {actions}
        <div className="relative">
          <button
            onClick={toggleNotifications}
            className="w-8 h-8 flex items-center justify-center rounded-fluent text-t-fg3 hover:bg-t-bg1-hover transition-colors relative"
          >
            <Bell className="w-[18px] h-[18px]" />
            {hasUnread && (
              <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold leading-4 text-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-[340px] max-h-[440px] overflow-y-auto bg-t-bg1 border border-t-stroke2 rounded-fluent-lg z-50" style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
              <div className="px-4 py-3 border-b border-t-stroke3 flex items-center justify-between bg-t-bg2 rounded-t-fluent-lg">
                <span className="text-caption1 font-semibold text-t-fg1">Notifications</span>
                <button onClick={markAllRead} disabled={unreadCount === 0}
                  className="text-caption2 text-t-fg-brand font-medium disabled:text-t-fg-disabled hover:text-t-fg-brand-hover transition-colors">
                  Tout lire
                </button>
              </div>
              {notifLoading ? (
                <div className="px-4 py-5 text-caption1 text-t-fg3 text-center">Chargement...</div>
              ) : previewNotifications.length === 0 ? (
                <div className="px-4 py-8 text-caption1 text-t-fg3 text-center">Aucune notification</div>
              ) : (
                previewNotifications.map((n) => (
                  <button key={n.id} onClick={() => void openNotification(n)}
                    className={`w-full text-left px-4 py-3 border-b border-t-stroke3 last:border-b-0 transition-colors ${n.read ? 'hover:bg-t-bg2' : 'bg-t-brand-160/40 hover:bg-t-brand-160/70'}`}>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-caption1 font-semibold text-t-fg1 leading-snug">{n.title}</span>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-t-brand-80 mt-1 shrink-0" />}
                    </div>
                    <p className="text-caption1 text-t-fg3 mt-0.5 line-clamp-2 leading-snug">{n.message}</p>
                    <p className="text-caption2 text-t-fg-disabled mt-1">{new Date(n.created_at).toLocaleString('fr-FR')}</p>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="w-7 h-7 rounded-full flex items-center justify-center ml-1 cursor-pointer hover:ring-2 hover:ring-t-brand-100/30 transition-all shrink-0"
          style={{ background: 'linear-gradient(135deg, #7074D0, #5B5FC7)' }}>
          <span className="text-white text-[11px] font-semibold">{initials}</span>
        </div>
      </div>
    </header>
  );
}
