import { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Bot,
  Building2,
  LogOut,
  Settings,
  ChevronUp,
  Menu,
  X,
  LayoutList,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { loadMyInAppNotifications } from '../../lib/domainApi';

type NavSection = 'pilotage' | 'execution' | 'administration';

type NavItem = {
  to: string;
  icon: typeof LayoutDashboard;
  label: string;
  matchPrefix?: string;
  section: NavSection;
  badge?: 'unread';
};

const navItems: NavItem[] = [
  { to: '/', icon: LayoutDashboard, label: 'Accueil', section: 'pilotage', badge: 'unread' },
  { to: '/offers', icon: Briefcase, label: 'Offres', section: 'pilotage' },
  { to: '/candidates', icon: Users, label: 'Candidats', matchPrefix: '/candidates', section: 'pilotage' },
  { to: '/team-views', icon: LayoutList, label: 'Vues équipe', section: 'pilotage' },
  { to: '/chatbot', icon: Bot, label: 'Chatbot', section: 'execution' },
  { to: '/team-chat', icon: MessageSquare, label: 'Canaux', section: 'execution' },
  { to: '/entreprise', icon: Building2, label: 'Entreprise', section: 'administration' },
  { to: '/settings', icon: Settings, label: 'Paramètres', section: 'administration' },
];

const navSections: Array<{ key: NavSection; label: string }> = [
  { key: 'pilotage', label: 'Pilotage' },
  { key: 'execution', label: 'Exécution' },
  { key: 'administration', label: 'Admin' },
];

export default function Sidebar({ mobileOpen, onMobileClose }: { mobileOpen?: boolean; onMobileClose?: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [metrics, setMetrics] = useState({ unread: 0 });

  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() || 'FD';

  function isActive(item: NavItem) {
    if (item.matchPrefix) return location.pathname.startsWith(item.matchPrefix);
    return location.pathname === item.to;
  }

  useEffect(() => {
    let mounted = true;
    const refresh = async () => {
      try {
        const [notifs] = await Promise.all([loadMyInAppNotifications()]);
        if (!mounted) return;
        setMetrics({ unread: notifs.unreadCount || 0 });
      } catch { /* ignore */ }
    };
    void refresh();
    const iv = window.setInterval(() => void refresh(), 45000);
    return () => { mounted = false; window.clearInterval(iv); };
  }, [location.pathname]);

  function badgeValue(item: NavItem): number {
    return item.badge === 'unread' ? metrics.unread : 0;
  }

  const sidebarContent = (
    <aside className="fixed left-0 top-0 bottom-0 w-rail bg-t-bg-static flex flex-col items-center z-50 select-none" style={{ width: '76px' }}>
      {/* App logo */}
      <div className="w-full h-14 flex items-center justify-center shrink-0">
        <div className="w-8 h-8 rounded-fluent-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7074D0 0%, #5B5FC7 100%)' }}>
          <span className="text-white text-caption1 font-bold tracking-tight">FD</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 w-full flex flex-col items-center overflow-y-auto pt-1 pb-2">
        {navSections.map((section) => {
          const items = navItems.filter((i) => i.section === section.key);
          if (items.length === 0) return null;
          return (
            <div key={section.key} className="w-full mb-3">
              <p className="text-[9px] tracking-widest text-[#5A5A7A] uppercase text-center mb-1 px-1">
                {section.label}
              </p>
              {items.map((item) => {
                const active = isActive(item);
                const count = badgeValue(item);
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onMobileClose}
                    className="group relative w-full flex flex-col items-center py-1 px-2"
                  >
                    <div
                      className={`relative w-12 h-10 flex flex-col items-center justify-center rounded-fluent-lg gap-0.5 transition-all duration-150 ${
                        active
                          ? 'bg-t-brand-80/90'
                          : 'hover:bg-white/8'
                      }`}
                      style={active ? { background: 'rgba(91,95,199,0.85)' } : {}}
                    >
                      <item.icon
                        className={`w-[18px] h-[18px] transition-colors duration-150 ${
                          active ? 'text-white' : 'text-[#9090B8] group-hover:text-[#C8C8E8]'
                        }`}
                        strokeWidth={active ? 2.2 : 1.6}
                      />
                      <span className={`text-[9px] leading-none font-medium transition-colors duration-150 ${
                        active ? 'text-white' : 'text-[#7070A0] group-hover:text-[#B0B0D0]'
                      }`}>
                        {item.label}
                      </span>
                      {count > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-semibold leading-4 text-center">
                          {count > 99 ? '99+' : count}
                        </span>
                      )}
                    </div>
                  </NavLink>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Profile */}
      <div className="w-full flex flex-col items-center pb-3 gap-1 relative">
        {showMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
            <div className="absolute bottom-16 left-2 z-50 bg-t-bg1 border border-t-stroke2 rounded-fluent-lg shadow-teams-dropdown w-52 py-1.5 animate-in fade-in slide-in-from-bottom-2 duration-150">
              <div className="px-3 py-2.5 border-b border-t-stroke3">
                <p className="text-caption1 font-semibold text-t-fg1 truncate">
                  {user?.user_metadata?.full_name || 'Utilisateur'}
                </p>
                <p className="text-caption2 text-t-fg3 truncate">{user?.email || ''}</p>
              </div>
              <button onClick={() => { setShowMenu(false); navigate('/settings'); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-caption1 text-t-fg2 hover:bg-t-bg1-hover transition-colors">
                <Settings className="w-4 h-4 text-t-fg3" /> Paramètres
              </button>
              <button onClick={signOut}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-caption1 text-t-danger hover:bg-t-danger-bg transition-colors">
                <LogOut className="w-4 h-4" /> Déconnexion
              </button>
            </div>
          </>
        )}
        <button onClick={() => setShowMenu(!showMenu)} className="group w-full flex flex-col items-center gap-1">
          <div className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-white/20 transition-all"
            style={{ background: 'linear-gradient(135deg, #7074D0, #5B5FC7)' }}>
            <span className="text-white text-caption2 font-semibold">{initials}</span>
          </div>
          <ChevronUp className={`w-2.5 h-2.5 text-[#5A5A7A] transition-transform duration-200 ${showMenu ? '' : 'rotate-180'}`} />
        </button>
      </div>
    </aside>
  );

  return (
    <>
      <div className="hidden md:block">{sidebarContent}</div>
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={onMobileClose} />
          <div className="relative z-50">
            {sidebarContent}
            <button onClick={onMobileClose}
              className="absolute top-2 left-[80px] w-8 h-8 rounded-full bg-t-bg-static/90 flex items-center justify-center text-white z-50">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="md:hidden w-8 h-8 flex items-center justify-center rounded-fluent text-t-fg2 hover:bg-t-bg1-hover transition-colors shrink-0">
      <Menu className="w-5 h-5" />
    </button>
  );
}

