import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiFetch } from '../lib/api';
import { AdminHeader, AdminLayout, AdminPage, AdminSurface } from '../components/admin';
import OverlayHealthBadge from '../components/map/OverlayHealthBadge';

export default function AdminGeoDiagnostics() {
  const { user } = useAuth();
  const [payload, setPayload] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch('/admin/geo-diagnostics').then(setPayload).catch((err: any) => setError(err?.error || err?.message || 'Diagnostics could not be loaded'));
  }, []);

  if (!user || String(user.role || '').toUpperCase() !== 'ADMIN') return <div>Yonetici yetkisi gerekli</div>;

  const availability = String(payload?.availability || 'UNAVAILABLE').toUpperCase();
  const status = availability === 'HEALTHY' ? 'HEALTHY' : availability === 'DEGRADED' ? 'DEGRADED' : 'UNAVAILABLE';

  return (
    <AdminLayout title="Geo Diagnostics">
      <AdminPage className="p-0 sm:p-0">
        <AdminSurface className="space-y-4 p-4 sm:p-5">
          <AdminHeader title="Geo Diagnostics" subtitle="Operational diagnostics for overlays, providers, projections and service health." />
          {error ? <div className="rounded border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div> : null}

          <div className="rounded border border-slate-200 bg-white p-3">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-900">Provider status</div>
              <OverlayHealthBadge status={status as 'HEALTHY' | 'DEGRADED' | 'UNAVAILABLE'} />
            </div>
            <div className="grid grid-cols-1 gap-2 text-xs text-slate-700 md:grid-cols-2">
              <div className="rounded border border-slate-200 bg-slate-50 px-2 py-1">provider: {payload?.provider || '-'}</div>
              <div className="rounded border border-slate-200 bg-slate-50 px-2 py-1">layer count: {payload?.layerCount || 0}</div>
              <div className="rounded border border-slate-200 bg-slate-50 px-2 py-1">availability: {payload?.availability || '-'}</div>
              <div className="rounded border border-slate-200 bg-slate-50 px-2 py-1">last sync: {payload?.lastSync || '-'}</div>
            </div>
          </div>

          <div className="rounded border border-slate-200 bg-white p-3">
            <div className="mb-2 text-sm font-semibold text-slate-900">Service diagnostics</div>
            <ul className="space-y-2 text-xs">
              {(Array.isArray(payload?.serviceDiagnostics) ? payload.serviceDiagnostics : []).map((item: any) => (
                <li key={`${item.service}-${item.endpoint}`} className="rounded border border-slate-200 p-2">
                  <div className="font-semibold text-slate-900">{item.service}</div>
                  <div className="text-slate-600">endpoint: {item.endpoint}</div>
                  <div className="text-slate-600">parse: {item.parseState} | available: {String(item.available)}</div>
                  <div className="text-slate-600">latency: {item.latencyMs}ms | layers: {item.layerCount}</div>
                  {item.error ? <div className="text-rose-600">error: {item.error}</div> : null}
                </li>
              ))}
            </ul>
          </div>
        </AdminSurface>
      </AdminPage>
    </AdminLayout>
  );
}
