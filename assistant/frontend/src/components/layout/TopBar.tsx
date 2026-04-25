import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';
import { MobileMenuButton } from './Sidebar';

interface TopBarProps {
  title: string;
  actions?: React.ReactNode;
}

export default function TopBar({ title, actions }: TopBarProps) {
  const { user } = useAuth();
  const sidebar = useOutletContext<{ toggle: () => void }>();

  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() || 'FD';

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
      <span className="text-body1 font-semibold text-t-fg1 mr-2 md:mr-4 truncate">{title}</span>

      {/* Centered search - hidden on small mobile */}
      <div className="flex-1 hidden sm:flex justify-center">
        <div className="relative w-full max-w-[480px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-t-fg3" />
          <input
            type="text"
            placeholder="Rechercher"
            className="w-full h-8 pl-9 pr-4 text-body1 bg-t-bg3 border border-t-stroke2 rounded-fluent outline-none focus:border-t-stroke-brand focus:bg-t-bg1 placeholder:text-t-fg3 transition-colors"
          />
        </div>
      </div>

      {/* Spacer on mobile when search hidden */}
      <div className="flex-1 sm:hidden" />

      {/* Right actions */}
      <div className="flex items-center gap-1 ml-2 md:ml-4 shrink-0">
        {actions}
      </div>

      {/* Profile avatar */}
      <div className="w-8 h-8 rounded-full bg-t-brand-70 flex items-center justify-center ml-1 md:ml-2 cursor-pointer hover:brightness-110 transition-all shrink-0">
        <span className="text-white text-caption2 font-semibold">{initials}</span>
      </div>
    </header>
  );
}
