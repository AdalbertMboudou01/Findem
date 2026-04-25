import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { MobileMenuButton } from './Sidebar';

export function useMobileSidebar() {
  const [open, setOpen] = useState(false);
  return { open, toggle: () => setOpen((v) => !v), close: () => setOpen(false) };
}

export default function AppLayout() {
  const sidebar = useMobileSidebar();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar mobileOpen={sidebar.open} onMobileClose={sidebar.close} />
      <div className="md:ml-rail flex-1 flex flex-col h-screen overflow-hidden">
        <Outlet context={sidebar} />
      </div>
    </div>
  );
}

export { MobileMenuButton };
