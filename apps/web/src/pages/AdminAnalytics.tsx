import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiFetch } from '../lib/api';
import { AdminHeader, AdminLayout, AdminPage, AdminSurface } from '../components/admin';
import ProductAnalyticsCard from '../components/analytics/ProductAnalyticsCard';
import IngestionAnalyticsCard from '../components/analytics/IngestionAnalyticsCard';
import RuntimeAnalyticsCard from '../components/analytics/RuntimeAnalyticsCard';
import InvestorAnalyticsCard from '../components/analytics/InvestorAnalyticsCard';
import WorkspaceAnalyticsCard from '../components/analytics/WorkspaceAnalyticsCard';

export default function AdminAnalytics() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    apiFetch('/admin/analytics')
      .then((response) => {
        setData(response);
        setError('');
      })
      .catch((err) => setError(err?.error || err?.message || 'Analytics data could not be loaded'))
      .finally(() => setLoading(false));
  }, []);

  if (!user || String(user.role || '').toUpperCase() !== 'ADMIN') return <div>Yönetici yetkisi gerekli</div>;
  if (error) return <div>Hata: {error}</div>;

  return (
    <AdminLayout title="Analytics Overview">
      <AdminPage className="p-0 sm:p-0">
        <AdminSurface className="space-y-4 p-4 sm:p-5">
          <AdminHeader
            title="Product + Operational Analytics"
            subtitle="Analytics snapshots are additive and derived from current persisted system data."
          />

          {loading ? (
            <div className="text-sm text-slate-600">Yükleniyor...</div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
                <div className="xl:col-span-4">
                  <ProductAnalyticsCard data={data?.product} />
                </div>
                <div className="xl:col-span-4">
                  <IngestionAnalyticsCard data={data?.ingestion} />
                </div>
                <div className="xl:col-span-4">
                  <RuntimeAnalyticsCard data={data?.runtime} />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
                <div className="xl:col-span-6">
                  <InvestorAnalyticsCard data={data?.investor} />
                </div>
                <div className="xl:col-span-6">
                  <WorkspaceAnalyticsCard data={data?.workspace} />
                </div>
              </div>
            </>
          )}
        </AdminSurface>
      </AdminPage>
    </AdminLayout>
  );
}
