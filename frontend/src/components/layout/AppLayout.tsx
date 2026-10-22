import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import { BackendStatus } from '../../features/system/BackendStatus';
import { humanize } from '../../lib/formatters';

const ACTIVE_LINKS = [
  { to: '/', label: 'Overview', end: true },
  { to: '/devices', label: 'Devices', end: false },
];

// Các mục này nằm trong lộ trình nhưng CHƯA có trong bản phát hành hiện tại: hiển thị rõ là chưa khả dụng.
const FUTURE_LINKS = ['Configuration', 'Commands', 'Firmware', 'Alerts', 'Audit logs'];

function linkClass({ isActive }: { isActive: boolean }) {
  return `block rounded-md px-3 py-2 text-sm font-medium ${
    isActive ? 'bg-petrol-700 text-white' : 'text-petrol-200 hover:bg-petrol-800 hover:text-white'
  }`;
}

export function AppLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleSignOut() {
    await signOut();
    navigate('/login', { replace: true });
  }

  const sidebar = (
    <nav aria-label="Main" className="flex h-full flex-col bg-petrol-900 p-4">
      <div className="px-3 pb-5 text-base font-semibold text-white">NEXUS Device Cloud</div>
      <ul className="space-y-1">
        {ACTIVE_LINKS.map((link) => (
          <li key={link.to}>
            <NavLink to={link.to} end={link.end} className={linkClass} onClick={() => setMenuOpen(false)}>
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
      <p className="mt-6 px-3 text-xs text-petrol-400">Not available in this release</p>
      <ul className="mt-1 space-y-1">
        {FUTURE_LINKS.map((label) => (
          <li key={label}>
            <span aria-disabled="true" className="block cursor-not-allowed rounded-md px-3 py-2 text-sm text-petrol-400/70">
              {label}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-auto border-t border-petrol-800 px-3 pt-4">
        <BackendStatus />
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen lg:flex">
      <aside className="hidden w-60 shrink-0 lg:block">
        <div className="sticky top-0 h-screen">{sidebar}</div>
      </aside>

      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setMenuOpen(false)} aria-hidden="true" />
          <div className="absolute inset-y-0 left-0 w-64">{sidebar}</div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
          <button
            type="button"
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm lg:hidden"
            onClick={() => setMenuOpen(true)}
            aria-label="Open navigation menu"
          >
            Menu
          </button>
          <div className="hidden text-sm text-slate-600 lg:block">{user?.organizationName}</div>
          <div className="flex items-center gap-3">
            <div className="text-right text-sm leading-tight">
              <div className="font-medium text-slate-900">{user?.displayName}</div>
              <div className="text-xs text-slate-500">{user ? humanize(user.role) : ''}</div>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
            >
              Sign out
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
