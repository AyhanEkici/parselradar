import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiFetch } from '../lib/api';
import { AdminHeader, AdminLayout, AdminPage, AdminSurface } from '../components/admin';
import OgcServiceDiagnosticsCard from '../components/connectors/OgcServiceDiagnosticsCard';

export default function AdminOgcConnectors() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const payload = await apiFetch('/admin/connectors/ogc');
        setData(payload);
      } catch (err: any) {
        setError(err?.error || err?.message || 'OGC connectors could not be loaded');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  if (!user || String(user.role || '').toUpperCase() !== 'ADMIN') return <div>Yonetici yetkisi gerekli</div>;

  return (
    <AdminLayout title="OGC Connectors">
      <AdminPage className="p-0 sm:p-0">
        <AdminSurface className="space-y-4 p-4 sm:p-5">
          <AdminHeader title="OGC Connector Diagnostics" subtitle="WMS operational, WMTS/WFS foundation-level capability visibility." />
          {error ? <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}
          {loading ? <div className="text-sm text-slate-600">Yukleniyor...</div> : null}
          {!loading && !error ? <OgcServiceDiagnosticsCard services={data?.services || []} /> : null}
        </AdminSurface>
      </AdminPage>
    </AdminLayout>
  );
}
