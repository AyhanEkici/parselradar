import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Credits from './pages/Credits';
import Reports from './pages/Reports';
import AdminProperties from './pages/AdminProperties';
import AdminDealPool from './pages/AdminDealPool';
import NewProperty from './pages/NewProperty';
import PropertyDocuments from './pages/PropertyDocuments';
import PropertyConsent from './pages/PropertyConsent';
import PropertyResult from './pages/PropertyResult';
import PropertyDetail from './pages/PropertyDetail';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/credits" element={<Credits />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/admin/properties" element={<AdminProperties />} />
        <Route path="/admin/deal-pool" element={<AdminDealPool />} />
        <Route path="/properties/new" element={<NewProperty />} />
        <Route path="/properties/:id" element={<PropertyDetail />} />
        <Route path="/properties/:id/documents" element={<PropertyDocuments />} />
        <Route path="/properties/:id/consent" element={<PropertyConsent />} />
        <Route path="/properties/:id/result" element={<PropertyResult />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
