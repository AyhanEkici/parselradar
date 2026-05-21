import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiFetch } from '../lib/api';
import { AdminHeader, AdminLayout, AdminPage, AdminSurface } from '../components/admin';
import TucbsConnectorCard from '../components/connectors/TucbsConnectorCard';
import OgcServiceDiagnosticsCard from '../components/connectors/OgcServiceDiagnosticsCard';

export default function AdminTucbsConnector() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = await apiFetch('/admin/connectors/tucbs');
      setData(payload);
    } catch (err: any) {
      setError(err?.error || err?.message || 'TUCBS connector could not be loaded');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const sync = async () => {
    setSyncing(true);
    setError('');
    try {
      await apiFetch('/admin/connectors/tucbs/sync', { method: 'POST' });
      await load();
    } catch (err: any) {
      setError(err?.error || err?.message || 'TUCBS sync failed');
    } finally {
      setSyncing(false);
    }
  };

  if (!user || String(user.role || '').toUpperCase() !== 'ADMIN') return <div>Yonetici yetkisi gerekli</div>;

  return (
    <AdminLayout title="TUCBS Connector">
      <AdminPage className="p-0 sm:p-0">
        <AdminSurface className="space-y-4 p-4 sm:p-5">
          <AdminHeader title="TUCBS Connector" subtitle="Public Geo-Layer Provider mode (read-only WMS/WMTS/WFS capabilities)." />
          <div>
            <button
              type="button"
              onClick={() => { void sync(); }}
              disabled={syncing}
              className="rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
            >
              {syncing ? 'Syncing...' : 'Sync capabilities'}
            </button>
          </div>
          {error ? <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}
          {loading ? <div className="text-sm text-slate-600">Yukleniyor...</div> : null}
          {!loading && !error ? (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
              <div className="xl:col-span-4">
                <TucbsConnectorCard data={data} />
              </div>
              <div className="xl:col-span-8">
                <OgcServiceDiagnosticsCard services={data?.diagnostics?.services || []} />
              </div>
            </div>
          ) : null}
        </AdminSurface>
      </AdminPage>
    </AdminLayout>
  );
}
