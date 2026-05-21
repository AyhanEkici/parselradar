import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiFetch } from '../lib/api';
import { AdminHeader, AdminLayout, AdminPage, AdminSurface } from '../components/admin';

export default function AdminLayerHealth() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const payload = await apiFetch('/admin/layer-health');
        setData(payload);
      } catch (err: any) {
        setError(err?.error || err?.message || 'Layer health could not be loaded');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  if (!user || String(user.role || '').toUpperCase() !== 'ADMIN') return <div>Yonetici yetkisi gerekli</div>;

  return (
    <AdminLayout title="Layer Health">
      <AdminPage className="p-0 sm:p-0">
        <AdminSurface className="space-y-4 p-4 sm:p-5">
          <AdminHeader title="Layer Health" subtitle="Availability, latency, projection support, and capability parse status." />
          {error ? <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}
          {loading ? <div className="text-sm text-slate-600">Yukleniyor...</div> : null}
          {!loading && !error ? (
            <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 text-xs text-slate-700">
              <div>Provider: {data?.provider || '-'}</div>
              <div>Availability: {data?.availability || '-'}</div>
              <div>Layer count: {data?.layerCount ?? 0}</div>
              <div>Projection support: {(data?.projectionSupport || []).join(', ') || '-'}</div>
              <div>Last sync: {data?.lastSync ? new Date(data.lastSync).toLocaleString() : '-'}</div>
              <ul className="space-y-1">
                {(data?.serviceDiagnostics || []).map((service: any) => (
                  <li key={service.service}>
                    {service.service}: {service.available ? 'available' : 'unavailable'} | latency={service.latencyMs}ms | parse={service.parseState} | layers={service.layerCount}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </AdminSurface>
      </AdminPage>
    </AdminLayout>
  );
}
