import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiFetch } from '../lib/api';
import { AdminHeader, AdminLayout, AdminPage, AdminSurface } from '../components/admin';
import MailDiagnosticsPanel from '../components/MailDiagnosticsPanel';

export default function AdminMailDiagnostics() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = await apiFetch('/admin/mail-diagnostics');
      setData(payload);
    } catch (err: any) {
      setError(err?.error || err?.message || 'Mail diagnostics could not be loaded');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const sendTest = async () => {
    setTesting(true);
    setError('');
    try {
      await apiFetch('/admin/mail-diagnostics/test-email', { method: 'POST' });
      await load();
    } catch (err: any) {
      setError(err?.error || err?.message || 'Test email failed');
    } finally {
      setTesting(false);
    }
  };

  if (!user || String(user.role || '').toUpperCase() !== 'ADMIN') return <div>Yonetici yetkisi gerekli</div>;

  return (
    <AdminLayout title="Mail Diagnostics">
      <AdminPage className="p-0 sm:p-0">
        <AdminSurface className="space-y-4 p-4 sm:p-5">
          <AdminHeader title="Mail Diagnostics" subtitle="Provider state, failed delivery visibility, and admin test email endpoint." />
          {error ? (
            <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
          ) : null}
          {loading ? <div className="text-sm text-slate-600">Yukleniyor...</div> : null}
          {!loading ? <MailDiagnosticsPanel data={data} onSendTest={sendTest} testing={testing} /> : null}
        </AdminSurface>
      </AdminPage>
    </AdminLayout>
  );
}
