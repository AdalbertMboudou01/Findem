import { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Building2,
  ChevronUp,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Users,
  X,
  Network,
} from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';

type NavItem = {
  to: string;
  icon: typeof LayoutDashboard;
  label: string;
  matchPrefix?: string;
};

const navItems: NavItem[] = [
  { to: '/admin', icon: LayoutDashboard, label: 'Accueil' },
  { to: '/admin/company', icon: Building2, label: 'Entreprise' },
  { to: '/admin/team', icon: Users, label: 'Equipe' },
  { to: '/admin/departments', icon: Network, label: 'Services' },
  { to: '/admin/settings', icon: Settings, label: 'Parametres' },
];

export default function Sidebar({ mobileOpen, onMobileClose }: { mobileOpen?: boolean; onMobileClose?: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    setShowMenu(false);
  }, [location.pathname]);

  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() || 'AD';

  function isActive(item: NavItem) {
    if (item.matchPrefix) return location.pathname.startsWith(item.matchPrefix);
    if (item.to === '/admin') return location.pathname === '/admin' || location.pathname === '/';
    return location.pathname === item.to;
  }

  const sidebarContent = (
    <aside className="fixed left-0 top-0 bottom-0 w-rail bg-t-bg-static flex flex-col items-center z-50 select-none" style={{ width: '76px' }}>
      <div className="w-full h-14 flex items-center justify-center shrink-0">
        <button
          onClick={() => navigate('/admin')}
          className="w-8 h-8 rounded-fluent flex items-center justify-center text-white font-semibold text-caption1"
          style={{ background: 'linear-gradient(135deg, #7074D0 0%, #5B5FC7 100%)' }}
          aria-label="Accueil admin"
        >
          FD
        </button>
      </div>

      <nav className="flex-1 w-full flex flex-col items-center overflow-y-auto pt-2 pb-2">
        <p className="text-[9px] tracking-widest text-[#7777A6] uppercase text-center mb-2 px-1">Admin</p>
        {navItems.map((item) => {
          const active = isActive(item);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onMobileClose}
              className="group relative w-full flex flex-col items-center py-1 px-2"
              title={item.label}
            >
              <div
                className={`relative w-12 h-10 flex flex-col items-center justify-center rounded-fluent gap-0.5 transition-all duration-150 ${
                  active ? 'bg-t-brand-80/90' : 'hover:bg-white/8'
                }`}
                style={active ? { background: 'rgba(91,95,199,0.85)' } : {}}
              >
                <item.icon
                  className={`w-[18px] h-[18px] transition-colors duration-150 ${
                    active ? 'text-white' : 'text-[#A4A4CF] group-hover:text-[#DADAF0]'
                  }`}
                  strokeWidth={active ? 2.2 : 1.7}
                />
                <span className={`text-[9px] leading-none font-medium transition-colors duration-150 ${
                  active ? 'text-white' : 'text-[#8383B4] group-hover:text-[#C8C8E8]'
                }`}>
                  {item.label}
                </span>
              </div>
            </NavLink>
          );
        })}
      </nav>

      <div className="w-full flex flex-col items-center pb-3 gap-1 relative">
        {showMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
            <div className="absolute bottom-16 left-2 z-50 bg-t-bg1 border border-t-stroke2 rounded-fluent-lg shadow-teams-dropdown w-52 py-1.5">
              <div className="px-3 py-2.5 border-b border-t-stroke3">
                <p className="text-caption1 font-semibold text-t-fg1 truncate">
                  {user?.user_metadata?.full_name || 'Administrateur'}
                </p>
                <p className="text-caption2 text-t-fg3 truncate">{user?.email || ''}</p>
              </div>
              <button
                onClick={() => navigate('/admin/settings')}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-caption1 text-t-fg2 hover:bg-t-bg1-hover transition-colors"
              >
                <Settings className="w-4 h-4 text-t-fg3" /> Parametres
              </button>
              <button
                onClick={signOut}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-caption1 text-t-danger hover:bg-t-danger-bg transition-colors"
              >
                <LogOut className="w-4 h-4" /> Deconnexion
              </button>
            </div>
          </>
        )}
        <button onClick={() => setShowMenu(!showMenu)} className="group w-full flex flex-col items-center gap-1">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-white/20 transition-all"
            style={{ background: 'linear-gradient(135deg, #7074D0, #5B5FC7)' }}
          >
            <span className="text-white text-caption2 font-semibold">{initials}</span>
          </div>
          <ChevronUp className={`w-2.5 h-2.5 text-[#7777A6] transition-transform duration-200 ${showMenu ? '' : 'rotate-180'}`} />
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
            <button
              onClick={onMobileClose}
              className="absolute top-2 left-[80px] w-8 h-8 rounded-full bg-t-bg-static/90 flex items-center justify-center text-white z-50"
              aria-label="Fermer le menu"
            >
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
    <button
      onClick={onClick}
      className="md:hidden w-8 h-8 flex items-center justify-center rounded-fluent text-t-fg2 hover:bg-t-bg1-hover transition-colors shrink-0"
      aria-label="Ouvrir le menu"
    >
      <Menu className="w-5 h-5" />
    </button>
  );
}
