import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Credits from './pages/Credits';
import Reports from './pages/Reports';
import AdminProperties from './pages/AdminProperties';
import AdminDealPool from './pages/AdminDealPool';
import AdminAuditTimeline from './pages/AdminAuditTimeline';
import AdminUsers from './pages/AdminUsers';
import AdminAnalyses from './pages/AdminAnalyses';
import AdminCreditLedger from './pages/AdminCreditLedger';
import AdminStripeSessions from './pages/AdminStripeSessions';
import AdminPropertyDocuments from './pages/AdminPropertyDocuments';
import AdminSystemRuntime from './pages/AdminSystemRuntime';
import AdminDeploymentOverview from './pages/AdminDeploymentOverview';
import AdminObservability from './pages/AdminObservability';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminConnectors from './pages/AdminConnectors';
import AdminConnectorDetail from './pages/AdminConnectorDetail';
import NewProperty from './pages/NewProperty';
import PropertyDocuments from './pages/PropertyDocuments';
import PropertyConsent from './pages/PropertyConsent';
import PropertyResult from './pages/PropertyResult';
import PropertyDetail from './pages/PropertyDetail';
import InvestorDashboard from './pages/InvestorDashboard';
import SavedAnalyses from './pages/SavedAnalyses';
import Watchlist from './pages/Watchlist';
import PortfolioDashboard from './pages/PortfolioDashboard';
import PortfolioDetail from './pages/PortfolioDetail';
import PortfolioAnalytics from './pages/PortfolioAnalytics';
import Organizations from './pages/Organizations';
import OrganizationDetail from './pages/OrganizationDetail';
import WorkspaceDashboard from './pages/WorkspaceDashboard';
import WorkspacePortfolio from './pages/WorkspacePortfolio';
import WorkspaceWatchlist from './pages/WorkspaceWatchlist';
import WorkspaceActivity from './pages/WorkspaceActivity';
import NotificationInbox from './pages/NotificationInbox';
import NotificationPreferences from './pages/NotificationPreferences';
import NotFound from './pages/NotFound';
import { ToastProvider } from './components/ui';
import AccessDenied from './pages/AccessDenied';
import AdminOnly from './components/AdminOnly';
import AppShell from './components/AppShell';
import RequireAuth from './components/RequireAuth';
import { useAuth } from './hooks/useAuth';

function RootRedirect() {
  const { user, authStatus, hasPersistentSession } = useAuth();

  if (authStatus === 'booting' || authStatus === 'checking' || hasPersistentSession) {
    return <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">Oturum dogrulaniyor...</div>;
  }

  return <Navigate to={user ? '/dashboard' : '/login'} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/register" element={<Register />} />
      <Route path="/access-denied" element={<AccessDenied />} />

      <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
      <Route path="/credits" element={<RequireAuth><Credits /></RequireAuth>} />
      <Route path="/reports" element={<RequireAuth><Reports /></RequireAuth>} />
      <Route path="/admin/properties" element={<RequireAuth><AdminOnly><AdminProperties /></AdminOnly></RequireAuth>} />
      <Route path="/admin/properties/:propertyId" element={<RequireAuth><AdminOnly><PropertyDetail /></AdminOnly></RequireAuth>} />
      <Route path="/admin/properties/:propertyId/documents" element={<RequireAuth><AdminOnly><AdminPropertyDocuments /></AdminOnly></RequireAuth>} />
      <Route path="/admin/deal-pool" element={<RequireAuth><AdminOnly><AdminDealPool /></AdminOnly></RequireAuth>} />
      <Route path="/admin/audit-timeline" element={<RequireAuth><AdminOnly><AdminAuditTimeline /></AdminOnly></RequireAuth>} />
      <Route path="/admin/users" element={<RequireAuth><AdminOnly><AdminUsers /></AdminOnly></RequireAuth>} />
      <Route path="/admin/analyses" element={<RequireAuth><AdminOnly><AdminAnalyses /></AdminOnly></RequireAuth>} />
      <Route path="/admin/credit-ledger" element={<RequireAuth><AdminOnly><AdminCreditLedger /></AdminOnly></RequireAuth>} />
      <Route path="/admin/stripe-sessions" element={<RequireAuth><AdminOnly><AdminStripeSessions /></AdminOnly></RequireAuth>} />
      <Route path="/admin/runtime" element={<RequireAuth><AdminOnly><AdminSystemRuntime /></AdminOnly></RequireAuth>} />
      <Route path="/admin/deployment" element={<RequireAuth><AdminOnly><AdminDeploymentOverview /></AdminOnly></RequireAuth>} />
      <Route path="/admin/observability" element={<RequireAuth><AdminOnly><AdminObservability /></AdminOnly></RequireAuth>} />
      <Route path="/admin/analytics" element={<RequireAuth><AdminOnly><AdminAnalytics /></AdminOnly></RequireAuth>} />
      <Route path="/admin/connectors" element={<RequireAuth><AdminOnly><AdminConnectors /></AdminOnly></RequireAuth>} />
      <Route path="/admin/connectors/:connectorKey" element={<RequireAuth><AdminOnly><AdminConnectorDetail /></AdminOnly></RequireAuth>} />
      <Route path="/properties/new" element={<RequireAuth><NewProperty /></RequireAuth>} />
      <Route path="/properties/:id" element={<RequireAuth><PropertyDetail /></RequireAuth>} />
      <Route path="/properties/:id/documents" element={<RequireAuth><PropertyDocuments /></RequireAuth>} />
      <Route path="/properties/:id/consent" element={<RequireAuth><PropertyConsent /></RequireAuth>} />
      <Route path="/properties/:id/result" element={<RequireAuth><PropertyResult /></RequireAuth>} />
      <Route path="/investor" element={<RequireAuth><InvestorDashboard /></RequireAuth>} />
      <Route path="/investor/saved-analyses" element={<RequireAuth><SavedAnalyses /></RequireAuth>} />
      <Route path="/investor/watchlist" element={<RequireAuth><Watchlist /></RequireAuth>} />
      <Route path="/investor/portfolio" element={<RequireAuth><PortfolioDashboard /></RequireAuth>} />
      <Route path="/investor/portfolio/:id" element={<RequireAuth><PortfolioDetail /></RequireAuth>} />
      <Route path="/investor/portfolio/:id/analytics" element={<RequireAuth><PortfolioAnalytics /></RequireAuth>} />
      <Route path="/organizations" element={<RequireAuth><Organizations /></RequireAuth>} />
      <Route path="/organizations/:id" element={<RequireAuth><OrganizationDetail /></RequireAuth>} />
      <Route path="/workspace/:organizationId/dashboard" element={<RequireAuth><WorkspaceDashboard /></RequireAuth>} />
      <Route path="/workspace/:organizationId/portfolio" element={<RequireAuth><WorkspacePortfolio /></RequireAuth>} />
      <Route path="/workspace/:organizationId/watchlist" element={<RequireAuth><WorkspaceWatchlist /></RequireAuth>} />
      <Route path="/workspace/:organizationId/activity" element={<RequireAuth><WorkspaceActivity /></RequireAuth>} />
      <Route path="/notifications" element={<RequireAuth><NotificationInbox /></RequireAuth>} />
      <Route path="/notifications/preferences" element={<RequireAuth><NotificationPreferences /></RequireAuth>} />
      <Route path="*" element={<RequireAuth><NotFound /></RequireAuth>} />
    </Routes>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <AppShell>
          <AppRoutes />
        </AppShell>
      </BrowserRouter>
    </ToastProvider>
  );
}
