import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiFetch } from '../lib/api';
import { AdminHeader, AdminLayout, AdminPage, AdminSurface } from '../components/admin';
import RuntimeHealthPanel from '../components/RuntimeHealthPanel';

export default function AdminRuntimeHealth() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = await apiFetch('/admin/runtime-health');
      setData(payload);
    } catch (err: any) {
      setError(err?.error || err?.message || 'Runtime health data could not be loaded');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  if (!user || String(user.role || '').toUpperCase() !== 'ADMIN') return <div>Yonetici yetkisi gerekli</div>;

  return (
    <AdminLayout title="Runtime Health">
      <AdminPage className="p-0 sm:p-0">
        <AdminSurface className="space-y-4 p-4 sm:p-5">
          <AdminHeader title="Runtime Health" subtitle="Operational runtime health, failed request timeline, and auth failure visibility." />
          {error ? (
            <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
              <button type="button" onClick={() => { void load(); }} className="ml-3 rounded border border-red-300 bg-white px-2 py-1 text-xs">
                Retry
              </button>
            </div>
          ) : null}
          {loading ? <div className="text-sm text-slate-600">Yukleniyor...</div> : null}
          {!loading && !error ? <RuntimeHealthPanel data={data} /> : null}
        </AdminSurface>
      </AdminPage>
    </AdminLayout>
  );
}
