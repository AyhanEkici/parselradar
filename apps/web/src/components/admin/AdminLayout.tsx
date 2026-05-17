import React, { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AdminButton, AdminStatusPill, AdminSurface } from './AdminPrimitives';

type AdminLayoutProps = {
  title?: string;
  children: React.ReactNode;
};

type AdminNavItem = {
  label: string;
  to: string;
  matchPrefixes: string[];
};

const navItems: AdminNavItem[] = [
  { label: 'Audit', to: '/admin/audit-timeline', matchPrefixes: ['/admin/audit-timeline'] },
  { label: 'Users', to: '/admin/users', matchPrefixes: ['/admin/users'] },
  { label: 'Analyses', to: '/admin/analyses', matchPrefixes: ['/admin/analyses'] },
  { label: 'Credit Ledger', to: '/admin/credit-ledger', matchPrefixes: ['/admin/credit-ledger'] },
  { label: 'Stripe Sessions', to: '/admin/stripe-sessions', matchPrefixes: ['/admin/stripe-sessions'] },
  { label: 'Properties', to: '/admin/properties', matchPrefixes: ['/admin/properties'] },
  { label: 'Runtime', to: '/admin/runtime', matchPrefixes: ['/admin/runtime'] },
  { label: 'Deployment', to: '/admin/deployment', matchPrefixes: ['/admin/deployment'] },
  { label: 'Observability', to: '/admin/observability', matchPrefixes: ['/admin/observability'] },
  { label: 'Analytics', to: '/admin/analytics', matchPrefixes: ['/admin/analytics'] },
];

export function AdminLayout({ title = 'Admin Area', children }: AdminLayoutProps) {
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const activePath = useMemo(() => location.pathname, [location.pathname]);

  const isItemActive = (item: AdminNavItem) =>
    item.matchPrefixes.some((prefix) => activePath === prefix || activePath.startsWith(`${prefix}/`));

  const nav = (
    <nav className="space-y-1.5" aria-label="Admin navigation">
      {navItems.map((item) => {
        const active = isItemActive(item);
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={() => setDrawerOpen(false)}
            className={
              active
                ? 'block rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700'
                : 'block rounded-lg border border-transparent px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900'
            }
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-slate-50 to-white">
      <header className="sticky top-0 z-40 border-b border-blue-100 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <AdminButton
              className="lg:hidden"
              variant="ghost"
              aria-label="Open menu"
              onClick={() => setDrawerOpen(true)}
            >
              Menu
            </AdminButton>
            <div>
              <div className="text-sm font-medium text-slate-500">ParselRadar</div>
              <h1 className="text-base font-semibold text-slate-900 sm:text-lg">{title}</h1>
            </div>
          </div>

          <AdminStatusPill tone="info">ADMIN</AdminStatusPill>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:py-6">
        <aside className="hidden lg:block lg:sticky lg:top-20 lg:self-start">
          <AdminSurface className="p-3">{nav}</AdminSurface>
        </aside>

        <main className="min-w-0">{children}</main>
      </div>

      {drawerOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <button
            className="absolute inset-0 bg-slate-900/45"
            aria-label="Close menu"
            onClick={() => setDrawerOpen(false)}
          />

          <div className="absolute inset-y-0 left-0 w-[82%] max-w-xs bg-white p-4 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-900">Admin Navigation</div>
              <AdminButton variant="ghost" onClick={() => setDrawerOpen(false)}>
                Close
              </AdminButton>
            </div>

            <AdminSurface className="p-3">{nav}</AdminSurface>
          </div>
        </div>
      ) : null}
    </div>
  );
}
