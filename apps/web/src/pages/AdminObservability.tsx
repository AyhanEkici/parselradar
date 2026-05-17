import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiFetch } from '../lib/api';
import { AdminHeader, AdminLayout, AdminPage, AdminSurface } from '../components/admin';
import TelemetryStatusCard from '../components/observability/TelemetryStatusCard';
import TracingStatusCard from '../components/observability/TracingStatusCard';
import ErrorAnalyticsCard from '../components/observability/ErrorAnalyticsCard';
import ProductionAlertsCard from '../components/observability/ProductionAlertsCard';
import ObservabilitySnapshotCard from '../components/observability/ObservabilitySnapshotCard';

export default function AdminObservability() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    apiFetch('/admin/observability')
      .then((response) => {
        setData(response);
        setError('');
      })
      .catch((err) => setError(err?.error || err?.message || 'Observability data could not be loaded'))
      .finally(() => setLoading(false));
  }, []);

  if (!user || user.role !== 'ADMIN') return <div>Yönetici yetkisi gerekli</div>;
  if (error) return <div>Hata: {error}</div>;

  return (
    <AdminLayout title="Observability Overview">
      <AdminPage className="p-0 sm:p-0">
        <AdminSurface className="space-y-4 p-4 sm:p-5">
          <AdminHeader
            title="Analytics + Observability Expansion"
            subtitle="Provider states are explicit and remain NOT_CONFIGURED until environment/config exists."
          />

          {loading ? (
            <div className="text-sm text-slate-600">Yükleniyor...</div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
                <div className="xl:col-span-4">
                  <ObservabilitySnapshotCard snapshot={data} />
                </div>
                <div className="xl:col-span-4">
                  <TelemetryStatusCard telemetry={data?.telemetry} />
                </div>
                <div className="xl:col-span-4">
                  <TracingStatusCard tracing={data?.tracing?.tracing} />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
                <div className="xl:col-span-6">
                  <ErrorAnalyticsCard errorAnalytics={data?.errorAnalytics} />
                </div>
                <div className="xl:col-span-6">
                  <ProductionAlertsCard productionAlerts={data?.productionAlerts} />
                </div>
              </div>
            </>
          )}
        </AdminSurface>
      </AdminPage>
    </AdminLayout>
  );
}
