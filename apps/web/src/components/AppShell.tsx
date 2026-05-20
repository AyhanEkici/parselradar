import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { hasAuthSession } from '../lib/authStorage';
import { logout } from '../lib/auth';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { isAdmin, user, hydrating, authState } = useAuth();
  const navigate = useNavigate();

  const roleLabel = String(user?.role || '').toUpperCase() || 'USER';

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const showAuthenticatedNav = !hydrating && authState === 'authenticated' && Boolean(user) && hasAuthSession();

  return (
    <>
      {showAuthenticatedNav ? (
        <div className="w-full bg-gray-100 border-b mb-4">
          <div className="max-w-5xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-3">
            <nav className="flex flex-wrap gap-2 text-xs">
              {isAdmin ? <Link to="/admin/audit-timeline" className="hover:underline">Audit</Link> : null}
              {isAdmin ? <Link to="/admin/users" className="hover:underline">Users</Link> : null}
              {isAdmin ? <Link to="/admin/analyses" className="hover:underline">Analyses</Link> : null}
              {isAdmin ? <Link to="/admin/credit-ledger" className="hover:underline">Credit Ledger</Link> : null}
              {isAdmin ? <Link to="/admin/stripe-sessions" className="hover:underline">Stripe Sessions</Link> : null}
              {isAdmin ? <Link to="/admin/properties" className="hover:underline">Properties</Link> : null}
              {isAdmin ? <Link to="/admin/runtime" className="hover:underline">Runtime</Link> : null}
              {isAdmin ? <Link to="/admin/deployment" className="hover:underline">Deployment</Link> : null}
              {isAdmin ? <Link to="/admin/observability" className="hover:underline">Observability</Link> : null}
              {isAdmin ? <Link to="/admin/analytics" className="hover:underline">Analytics</Link> : null}
              {isAdmin ? <Link to="/admin/connectors" className="hover:underline">Connectors</Link> : null}
              <Link to="/investor" className="hover:underline">Investor</Link>
              <Link to="/investor/saved-analyses" className="hover:underline">Saved</Link>
              <Link to="/investor/watchlist" className="hover:underline">Watchlist</Link>
              <Link to="/investor/portfolio" className="hover:underline">Portfolio</Link>
              <Link to="/organizations" className="hover:underline">Organizations</Link>
              <Link to="/notifications" className="hover:underline">Notifications</Link>
            </nav>

            <div className="ml-auto flex items-center gap-2 text-xs">
              <span className="text-gray-700 truncate max-w-[180px]" title={user?.email || ''}>
                {user?.name || user?.email}
              </span>
              <span className={`px-2 py-0.5 rounded border font-semibold ${isAdmin ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                {roleLabel}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="px-2 py-1 rounded border border-red-200 text-red-700 bg-red-50 hover:bg-red-100"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {children}
    </>
  );
}
