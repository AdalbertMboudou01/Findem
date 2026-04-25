import { useState } from 'react';
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
} from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Activite' },
  { to: '/offers', icon: Briefcase, label: 'Offres' },
  { to: '/candidates', icon: Users, label: 'Candidats', matchPrefix: '/candidates' },
  { to: '/chatbot', icon: Bot, label: 'Chatbot' },
  { to: '/entreprise', icon: Building2, label: 'Entreprise' },
];

export default function Sidebar({ mobileOpen, onMobileClose }: { mobileOpen?: boolean; onMobileClose?: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() || 'FD';

  function isActive(item: typeof navItems[number]) {
    if (item.matchPrefix) return location.pathname.startsWith(item.matchPrefix);
    return location.pathname === item.to;
  }

  const sidebarContent = (
    <aside className="fixed left-0 top-0 bottom-0 w-rail bg-t-bg-static flex flex-col items-center z-50 select-none">
      {/* App icon */}
      <div className="w-full h-header flex items-center justify-center">
        <div className="w-7 h-7 rounded-fluent bg-t-brand-80 flex items-center justify-center">
          <span className="text-white text-caption1 font-bold leading-none">FD</span>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 w-full flex flex-col items-center pt-0.5">
        {navItems.map((item) => {
          const active = isActive(item);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onMobileClose}
              className="group relative w-full flex flex-col items-center py-[6px]"
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-t-brand-100 rounded-r-full" />
              )}
              <div
                className={`w-9 h-9 flex items-center justify-center rounded-fluent transition-colors duration-100 ${
                  active
                    ? 'bg-white/15'
                    : 'hover:bg-white/10'
                }`}
              >
                <item.icon
                  className={`w-5 h-5 transition-colors duration-100 ${
                    active ? 'text-t-brand-100' : 'text-[#ADADAD] group-hover:text-[#D6D6D6]'
                  }`}
                  strokeWidth={active ? 2 : 1.5}
                />
              </div>
              <span className={`text-caption2 mt-px leading-none transition-colors duration-100 ${
                active ? 'text-white font-medium' : 'text-[#ADADAD] group-hover:text-[#D6D6D6]'
              }`}>
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom area - profile with menu */}
      <div className="w-full flex flex-col items-center pb-3 gap-1.5 relative">
        {showMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
            <div className="absolute bottom-14 left-2 z-50 bg-t-bg1 border border-t-stroke2 rounded-fluent-lg shadow-lg w-48 py-1 animate-in fade-in slide-in-from-bottom-2 duration-150">
              <div className="px-3 py-2 border-b border-t-stroke3">
                <p className="text-caption1 font-semibold text-t-fg1 truncate">
                  {user?.user_metadata?.full_name || 'Utilisateur'}
                </p>
                <p className="text-caption2 text-t-fg3 truncate">{user?.email || ''}</p>
              </div>
              <button
                onClick={() => { setShowMenu(false); navigate('/settings'); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-caption1 text-t-fg2 hover:bg-t-bg1-hover transition-colors">
                <Settings className="w-3.5 h-3.5" />Parametres
              </button>
              <button
                onClick={signOut}
                className="w-full flex items-center gap-2 px-3 py-2 text-caption1 text-t-danger hover:bg-t-danger-bg transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />Deconnexion
              </button>
            </div>
          </>
        )}

        <button
          onClick={() => setShowMenu(!showMenu)}
          className="group w-full flex flex-col items-center gap-0.5"
        >
          <div className="w-8 h-8 rounded-full bg-t-brand-70 flex items-center justify-center cursor-pointer hover:brightness-110 transition-all relative">
            <span className="text-white text-caption2 font-semibold">{initials}</span>
          </div>
          <ChevronUp className={`w-3 h-3 text-[#ADADAD] transition-transform duration-200 ${showMenu ? '' : 'rotate-180'}`} />
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        {sidebarContent}
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={onMobileClose} />
          <div className="relative z-50">
            {sidebarContent}
            <button
              onClick={onMobileClose}
              className="absolute top-2 left-[76px] w-8 h-8 rounded-full bg-t-bg-static/90 flex items-center justify-center text-white z-50"
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
    >
      <Menu className="w-5 h-5" />
    </button>
  );
}
