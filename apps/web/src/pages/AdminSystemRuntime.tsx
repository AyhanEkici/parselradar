import React, { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { AdminHeader, AdminLayout, AdminPage, AdminSurface } from '../components/admin';
import { RuntimeStatusCard } from '../components/runtime/RuntimeStatusCard';
import { QueueHealthCard } from '../components/runtime/QueueHealthCard';
import { WorkerStatusCard } from '../components/runtime/WorkerStatusCard';
import { RuntimeMetricsCard } from '../components/runtime/RuntimeMetricsCard';
import { SecurityHealthCard } from '../components/runtime/SecurityHealthCard';
import { OperationalSnapshotCard } from '../components/runtime/OperationalSnapshotCard';

type RuntimeResponse = {
  runtimeStatus?: {
    state?: string;
    reason?: string;
    mode?: string;
    redisConfigured?: boolean;
    bullmqConfigured?: boolean;
  };
  queueStates?: Array<{ name: string; state: string; reason: string; depth: number; deadLetterReady: boolean }>;
  workerStates?: Array<{ name: string; queueName: string; state: string; reason: string; concurrency: number }>;
  runtimeMetrics?: {
    queueDepthTotal?: number;
    failureRatePercent?: number;
    analysisThroughputPerHour?: number;
    refreshThroughputPerHour?: number;
    staleAnalysisCount?: number;
    staleRefreshCount?: number;
  };
  operationalSnapshot?: {
    generatedAt?: string;
    degradedQueues?: number;
    degradedWorkers?: number;
    mode?: string;
  };
  securitySignals?: Array<{ level: 'low' | 'medium' | 'high' | string; type: string; message: string; fingerprint?: string }>;
  healthSummary?: { live?: string; ready?: string; overall?: string; detail?: string };
};

export default function AdminSystemRuntime() {
  const { user } = useAuth();
  const [data, setData] = useState<RuntimeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    apiFetch('/admin/runtime')
      .then((response) => {
        setData(response as RuntimeResponse);
        setError('');
      })
      .catch((err) => {
        setError(err?.error || err?.message || 'Runtime data could not be loaded');
      })
      .finally(() => setLoading(false));
  }, []);

  if (!user || user.role !== 'ADMIN') return <div>Yönetici yetkisi gerekli</div>;
  if (error) return <div>Hata: {error}</div>;

  return (
    <AdminLayout title="System Runtime">
      <AdminPage className="p-0 sm:p-0">
        <AdminSurface className="space-y-4 p-4 sm:p-5">
          <AdminHeader
            title="Production Runtime + Enterprise Operations"
            subtitle="Deterministic runtime truth only. Redis/BullMQ states are reported exactly as configured."
          />

          {loading ? (
            <div className="text-sm text-slate-600">Yükleniyor...</div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
                <div className="xl:col-span-4">
                  <RuntimeStatusCard runtimeStatus={data?.runtimeStatus} />
                </div>
                <div className="xl:col-span-4">
                  <OperationalSnapshotCard
                    operationalSnapshot={data?.operationalSnapshot}
                    healthSummary={data?.healthSummary}
                  />
                </div>
                <div className="xl:col-span-4">
                  <RuntimeMetricsCard runtimeMetrics={data?.runtimeMetrics} />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
                <div className="xl:col-span-6">
                  <QueueHealthCard queueStates={data?.queueStates} />
                </div>
                <div className="xl:col-span-6">
                  <WorkerStatusCard workerStates={data?.workerStates} />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
                <div className="xl:col-span-12">
                  <SecurityHealthCard securitySignals={data?.securitySignals} />
                </div>
              </div>
            </>
          )}
        </AdminSurface>
      </AdminPage>
    </AdminLayout>
  );
}
