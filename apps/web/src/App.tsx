import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
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

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <div className="w-full bg-gray-100 border-b mb-4">
          <nav className="max-w-5xl mx-auto flex flex-wrap gap-2 py-2 px-4 text-xs">
            <a href="/admin/audit-timeline" className="hover:underline">Audit</a>
            <a href="/admin/users" className="hover:underline">Users</a>
            <a href="/admin/analyses" className="hover:underline">Analyses</a>
            <a href="/admin/credit-ledger" className="hover:underline">Credit Ledger</a>
            <a href="/admin/stripe-sessions" className="hover:underline">Stripe Sessions</a>
            <a href="/admin/properties" className="hover:underline">Properties</a>
            <a href="/admin/runtime" className="hover:underline">Runtime</a>
            <a href="/admin/deployment" className="hover:underline">Deployment</a>
            <a href="/investor" className="hover:underline">Investor</a>
            <a href="/investor/saved-analyses" className="hover:underline">Saved</a>
            <a href="/investor/watchlist" className="hover:underline">Watchlist</a>
            <a href="/investor/portfolio" className="hover:underline">Portfolio</a>
            <a href="/organizations" className="hover:underline">Organizations</a>
            <a href="/notifications" className="hover:underline">Notifications</a>
          </nav>
        </div>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/credits" element={<Credits />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/admin/properties" element={<AdminProperties />} />
          <Route path="/admin/properties/:propertyId" element={<PropertyDetail />} />
          <Route path="/admin/properties/:propertyId/documents" element={<AdminPropertyDocuments />} />
          <Route path="/admin/deal-pool" element={<AdminDealPool />} />
          <Route path="/admin/audit-timeline" element={<AdminAuditTimeline />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/analyses" element={<AdminAnalyses />} />
          <Route path="/admin/credit-ledger" element={<AdminCreditLedger />} />
          <Route path="/admin/stripe-sessions" element={<AdminStripeSessions />} />
          <Route path="/admin/runtime" element={<AdminSystemRuntime />} />
          <Route path="/admin/deployment" element={<AdminDeploymentOverview />} />
          <Route path="/properties/new" element={<NewProperty />} />
          <Route path="/properties/:id" element={<PropertyDetail />} />
          <Route path="/properties/:id/documents" element={<PropertyDocuments />} />
          <Route path="/properties/:id/consent" element={<PropertyConsent />} />
          <Route path="/properties/:id/result" element={<PropertyResult />} />
          <Route path="/investor" element={<InvestorDashboard />} />
          <Route path="/investor/saved-analyses" element={<SavedAnalyses />} />
          <Route path="/investor/watchlist" element={<Watchlist />} />
          <Route path="/investor/portfolio" element={<PortfolioDashboard />} />
          <Route path="/investor/portfolio/:id" element={<PortfolioDetail />} />
          <Route path="/organizations" element={<Organizations />} />
          <Route path="/organizations/:id" element={<OrganizationDetail />} />
          <Route path="/workspace/:organizationId/dashboard" element={<WorkspaceDashboard />} />
          <Route path="/workspace/:organizationId/portfolio" element={<WorkspacePortfolio />} />
          <Route path="/workspace/:organizationId/watchlist" element={<WorkspaceWatchlist />} />
          <Route path="/workspace/:organizationId/activity" element={<WorkspaceActivity />} />
          <Route path="/notifications" element={<NotificationInbox />} />
          <Route path="/notifications/preferences" element={<NotificationPreferences />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
