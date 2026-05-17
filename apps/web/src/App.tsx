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
import NewProperty from './pages/NewProperty';
import PropertyDocuments from './pages/PropertyDocuments';
import PropertyConsent from './pages/PropertyConsent';
import PropertyResult from './pages/PropertyResult';
import PropertyDetail from './pages/PropertyDetail';
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
          <Route path="/properties/new" element={<NewProperty />} />
          <Route path="/properties/:id" element={<PropertyDetail />} />
          <Route path="/properties/:id/documents" element={<PropertyDocuments />} />
          <Route path="/properties/:id/consent" element={<PropertyConsent />} />
          <Route path="/properties/:id/result" element={<PropertyResult />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
