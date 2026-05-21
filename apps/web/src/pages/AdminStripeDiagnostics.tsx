import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiFetch } from '../lib/api';
import { AdminHeader, AdminLayout, AdminPage, AdminSurface } from '../components/admin';
import StripeDiagnosticsPanel from '../components/StripeDiagnosticsPanel';

export default function AdminStripeDiagnostics() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = await apiFetch('/admin/stripe-diagnostics');
      setData(payload);
    } catch (err: any) {
      setError(err?.error || err?.message || 'Stripe diagnostics could not be loaded');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  if (!user || String(user.role || '').toUpperCase() !== 'ADMIN') return <div>Yonetici yetkisi gerekli</div>;

  return (
    <AdminLayout title="Stripe Diagnostics">
      <AdminPage className="p-0 sm:p-0">
        <AdminSurface className="space-y-4 p-4 sm:p-5">
          <AdminHeader title="Stripe Diagnostics" subtitle="Checkout integrity, webhook failure visibility, and stripe runtime diagnostics." />
          {error ? (
            <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
          ) : null}
          {loading ? <div className="text-sm text-slate-600">Yukleniyor...</div> : null}
          {!loading && !error ? <StripeDiagnosticsPanel data={data} /> : null}
        </AdminSurface>
      </AdminPage>
    </AdminLayout>
  );
}
