import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { logout } from '../lib/auth';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { isAdmin, user, authStatus, hasPersistentSession } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const roleLabel = String(user?.role || '').toUpperCase() || 'USER';
  const isPublicRoute =
    location.pathname === '/' ||
    location.pathname === '/login' ||
    location.pathname === '/register' ||
    location.pathname === '/forgot-password' ||
   location.pathname === '/reset-password';

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const shellVisible = !isPublicRoute && (hasPersistentSession || authStatus === 'authenticated' || authStatus === 'checking' || authStatus === 'booting');
  const showAuthenticatedNav = shellVisible && Boolean(user) && authStatus === 'authenticated';
  const roleDisplay = user ? roleLabel : 'CHECKING';
  const identityDisplay = user?.name || user?.email || 'Oturum doğrulanıyor...';
  const navLinkClass = (to: string) => {
    const active = location.pathname === to || (to !== '/dashboard' && location.pathname.startsWith(to));
    return active ? 'is-active-nav' : '';
  };

  const primaryNavLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/properties/new', label: 'Yeni Mülk' },
    { to: '/credits', label: 'Kredi' },
    { to: '/admin/properties', label: 'Properties', adminOnly: true },
    { to: '/admin/analysis-reports', label: 'Reports', adminOnly: true },
    { to: '/admin/deal-flow', label: 'Deal-Flow', adminOnly: true },
    { to: '/admin/connectors/center', label: 'Connectors', adminOnly: true },
    { to: '/map', label: 'Map' },
  ];

  const secondaryAdminLinks = [
    { to: '/admin/audit-timeline', label: 'Audit' },
    { to: '/admin/users', label: 'Users' },
    { to: '/admin/analyses', label: 'Analyses' },
    { to: '/admin/credit-ledger', label: 'Credit Ledger' },
    { to: '/admin/stripe-sessions', label: 'Stripe Sessions' },
    { to: '/admin/cms', label: 'CMS' },
    { to: '/admin/analytics', label: 'Analytics' },
    { to: '/admin/runtime', label: 'Runtime' },
    { to: '/admin/runtime-health', label: 'Runtime Health' },
    { to: '/admin/deployment', label: 'Deployment' },
    { to: '/admin/observability', label: 'Observability' },
    { to: '/admin/mail-diagnostics', label: 'Mail' },
    { to: '/admin/stripe-diagnostics', label: 'Stripe' },
    { to: '/admin/connectors', label: 'Connectors' },
    { to: '/admin/connectors/tucbs', label: 'TUCBS' },
    { to: '/admin/connectors/ogc', label: 'OGC' },
    { to: '/admin/layers', label: 'Layers' },
    { to: '/admin/layer-health', label: 'Layer Health' },
    { to: '/admin/geo-diagnostics', label: 'Geo Diagnostics' },
  ];

  return (
    <>
      {shellVisible ? (
        <div className="premium-shell w-full mb-4">
          <div className="max-w-5xl mx-auto px-4 py-2 flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-3">
            {showAuthenticatedNav ? (
              <>
                <div className="w-full sm:hidden">
                  <nav className="grid grid-cols-3 gap-2 text-xs">
                    {primaryNavLinks
                      .filter((link) => !link.adminOnly || isAdmin)
                      .map((link) => (
                        <Link
                          key={`mobile-primary-${link.to}`}
                          to={link.to}
                          className={`rounded border px-2 py-1.5 text-center ${navLinkClass(link.to)}`}
                        >
                          {link.label}
                        </Link>
                      ))}
                  </nav>
                  {isAdmin ? (
                    <details className="mt-2 rounded border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-700">
                      <summary className="cursor-pointer font-semibold">More admin links</summary>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {secondaryAdminLinks.map((link) => (
                          <Link key={`mobile-secondary-${link.to}`} to={link.to} className={navLinkClass(link.to)}>
                            {link.label}
                          </Link>
                        ))}
                      </div>
                    </details>
                  ) : null}
                </div>

                <div className="hidden w-full overflow-x-auto sm:block">
                <nav className="flex w-max gap-2 whitespace-nowrap text-xs pb-1">
                  <Link to="/dashboard" className={navLinkClass('/dashboard')}>Dashboard</Link>
                  <Link to="/properties/new" className={navLinkClass('/properties/new')}>Yeni Mülk</Link>
                  <Link to="/credits" className={navLinkClass('/credits')}>Kredi</Link>
                  {isAdmin ? <Link to="/admin/analysis-reports" className={navLinkClass('/admin/analysis-reports')}>Reports</Link> : null}
                  {isAdmin ? <Link to="/admin/deal-flow" className={navLinkClass('/admin/deal-flow')}>Deal-Flow</Link> : null}
                  {isAdmin ? <Link to="/admin/audit-timeline" className={navLinkClass('/admin/audit-timeline')}>Audit</Link> : null}
                  {isAdmin ? <Link to="/admin/users" className={navLinkClass('/admin/users')}>Users</Link> : null}
                  {isAdmin ? <Link to="/admin/analyses" className={navLinkClass('/admin/analyses')}>Analyses</Link> : null}
                  {isAdmin ? <Link to="/admin/credit-ledger" className={navLinkClass('/admin/credit-ledger')}>Credit Ledger</Link> : null}
                  {isAdmin ? <Link to="/admin/stripe-sessions" className={navLinkClass('/admin/stripe-sessions')}>Stripe Sessions</Link> : null}
                  {isAdmin ? <Link to="/admin/properties" className={navLinkClass('/admin/properties')}>Properties</Link> : null}
                  {isAdmin ? <Link to="/admin/runtime" className={navLinkClass('/admin/runtime')}>Runtime</Link> : null}
                  {isAdmin ? <Link to="/admin/runtime-health" className={navLinkClass('/admin/runtime-health')}>Runtime Health</Link> : null}
                  {isAdmin ? <Link to="/admin/deployment" className={navLinkClass('/admin/deployment')}>Deployment</Link> : null}
                  {isAdmin ? <Link to="/admin/observability" className={navLinkClass('/admin/observability')}>Observability</Link> : null}
                  {isAdmin ? <Link to="/admin/mail-diagnostics" className={navLinkClass('/admin/mail-diagnostics')}>Mail</Link> : null}
                  {isAdmin ? <Link to="/admin/stripe-diagnostics" className={navLinkClass('/admin/stripe-diagnostics')}>Stripe</Link> : null}
                  {isAdmin ? <Link to="/admin/analytics" className={navLinkClass('/admin/analytics')}>Analytics</Link> : null}
                  {isAdmin ? <Link to="/admin/cms" className={navLinkClass('/admin/cms')}>CMS</Link> : null}
                  {isAdmin ? <Link to="/admin/connectors" className={navLinkClass('/admin/connectors')}>Connectors</Link> : null}
                  {isAdmin ? <Link to="/admin/connectors/center" className={navLinkClass('/admin/connectors/center')}>Connector Center</Link> : null}
                  {isAdmin ? <Link to="/admin/connectors/tucbs" className={navLinkClass('/admin/connectors/tucbs')}>TUCBS</Link> : null}
                  {isAdmin ? <Link to="/admin/connectors/ogc" className={navLinkClass('/admin/connectors/ogc')}>OGC</Link> : null}
                  {isAdmin ? <Link to="/admin/layers" className={navLinkClass('/admin/layers')}>Layers</Link> : null}
                  {isAdmin ? <Link to="/admin/layer-health" className={navLinkClass('/admin/layer-health')}>Layer Health</Link> : null}
                  {isAdmin ? <Link to="/admin/geo-diagnostics" className={navLinkClass('/admin/geo-diagnostics')}>Geo Diagnostics</Link> : null}
                  <Link to="/map" className={navLinkClass('/map')}>Map (Preview)</Link>
                  <Link to="/map/portfolio" className={navLinkClass('/map/portfolio')}>Map Portfolio (Preview)</Link>
                  <Link to="/investor" className={navLinkClass('/investor')}>Investor</Link>
                  <Link to="/investor/saved-analyses" className={navLinkClass('/investor/saved-analyses')}>Saved</Link>
                  <Link to="/investor/watchlist" className={navLinkClass('/investor/watchlist')}>Watchlist</Link>
                  <Link to="/investor/portfolio" className={navLinkClass('/investor/portfolio')}>Portfolio</Link>
                  <Link to="/organizations" className={navLinkClass('/organizations')}>Organizations</Link>
                  <Link to="/notifications" className={navLinkClass('/notifications')}>Notifications</Link>
                </nav>
                </div>

                <div className="w-full sm:w-auto sm:ml-auto flex flex-wrap items-center gap-2 text-xs">
                  <span className="premium-muted truncate max-w-[180px]" title={user?.email || ''}>
                    {identityDisplay}
                  </span>
                  <span className={`px-2 py-0.5 rounded border font-semibold ${isAdmin ? 'bg-cyan-950/40 text-cyan-100 border-cyan-400/40' : 'bg-slate-900 text-slate-200 border-slate-700'}`}>
                    {roleDisplay}
                  </span>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="px-2 py-1 rounded border border-rose-500/30 text-rose-200 bg-rose-950/30 hover:bg-rose-900/40"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="text-xs text-slate-600">Oturum dogrulaniyor...</div>
            )}
          </div>
        </div>
      ) : null}

      {children}
    </>
  );
}
