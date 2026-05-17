import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiFetch } from '../lib/api';
import { AdminHeader, AdminLayout, AdminPage, AdminSurface } from '../components/admin';
import { DeploymentStatusCard } from '../components/runtime/DeploymentStatusCard';
import { RuntimeCapacityCard } from '../components/runtime/RuntimeCapacityCard';
import { ScalingPolicyCard } from '../components/runtime/ScalingPolicyCard';
import { BackupPolicyCard } from '../components/runtime/BackupPolicyCard';

type DeploymentResponse = {
  deploymentStatus?: string;
  scalingStatus?: string;
  backupStatus?: string;
  runtimeCapacity?: any;
  deploymentProfile?: any;
  scalingPolicy?: any;
  backupPolicy?: any;
  retentionPolicy?: any;
  securityAuditSummary?: any;
};

export default function AdminDeploymentOverview() {
  const { user } = useAuth();
  const [data, setData] = useState<DeploymentResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    apiFetch('/admin/deployment')
      .then((response) => {
        setData(response as DeploymentResponse);
        setError('');
      })
      .catch((err) => setError(err?.error || err?.message || 'Deployment overview could not be loaded'))
      .finally(() => setLoading(false));
  }, []);

  if (!user || user.role !== 'ADMIN') return <div>Yönetici yetkisi gerekli</div>;
  if (error) return <div>Hata: {error}</div>;

  return (
    <AdminLayout title="Deployment Operations">
      <AdminPage className="p-0 sm:p-0">
        <AdminSurface className="space-y-4 p-4 sm:p-5">
          <AdminHeader
            title="Production Cloud Hardening + Deployment Ops"
            subtitle="Deployment templates and runtime checks are explicit. No active cloud runtime is inferred from templates alone."
          />

          {loading ? (
            <div className="text-sm text-slate-600">Yükleniyor...</div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
                <div className="xl:col-span-4">
                  <DeploymentStatusCard
                    deploymentStatus={data?.deploymentStatus}
                    deploymentProfile={data?.deploymentProfile}
                  />
                </div>
                <div className="xl:col-span-4">
                  <RuntimeCapacityCard runtimeCapacity={data?.runtimeCapacity} />
                </div>
                <div className="xl:col-span-4">
                  <ScalingPolicyCard
                    scalingStatus={data?.scalingStatus}
                    scalingPolicy={data?.scalingPolicy}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
                <div className="xl:col-span-6">
                  <BackupPolicyCard
                    backupStatus={data?.backupStatus}
                    backupPolicy={data?.backupPolicy}
                    retentionPolicy={data?.retentionPolicy}
                  />
                </div>
                <div className="xl:col-span-6">
                  <div className="rounded-lg border border-rose-200 bg-rose-50 p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-rose-700">
                      Security Audit Summary
                    </div>
                    <pre className="mt-2 overflow-x-auto whitespace-pre-wrap text-xs text-rose-900">
                      {JSON.stringify(data?.securityAuditSummary || {}, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </>
          )}
        </AdminSurface>
      </AdminPage>
    </AdminLayout>
  );
}
