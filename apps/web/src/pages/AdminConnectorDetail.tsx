import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { apiFetch } from '../lib/api';
import { AdminHeader, AdminLayout, AdminPage, AdminSurface } from '../components/admin';
import ConnectorStatusCard from '../components/connectors/ConnectorStatusCard';
import ConnectorReadinessChecklist from '../components/connectors/ConnectorReadinessChecklist';
import ConnectorCredentialCard from '../components/connectors/ConnectorCredentialCard';
import ConnectorLegalCard from '../components/connectors/ConnectorLegalCard';
import ConnectorTestResultCard from '../components/connectors/ConnectorTestResultCard';
import ConnectorActivationPlanCard from '../components/connectors/ConnectorActivationPlanCard';

export default function AdminConnectorDetail() {
  const { connectorKey } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    if (!connectorKey) return;
    const [detail, activationPlan] = await Promise.all([
      apiFetch(`/admin/connectors/${connectorKey}`),
      apiFetch(`/admin/connectors/${connectorKey}/activation-plan`),
    ]);
    setData(detail);
    setPlan(activationPlan);
  };

  useEffect(() => {
    setLoading(true);
    load()
      .then(() => setError(''))
      .catch((err) => setError(err?.error || err?.message || 'Connector detail could not be loaded'))
      .finally(() => setLoading(false));
  }, [connectorKey]);

  const runTest = async () => {
    if (!connectorKey) return;
    const result = await apiFetch(`/admin/connectors/${connectorKey}/test`, { method: 'POST' });
    setTestResult(result?.testResult || result);
    await load();
  };

  if (!user || user.role !== 'ADMIN') return <div>Yonetici yetkisi gerekli</div>;
  if (error) return <div>Hata: {error}</div>;

  return (
    <AdminLayout title="Connector Detail">
      <AdminPage className="p-0 sm:p-0">
        <AdminSurface className="space-y-4 p-4 sm:p-5">
          <AdminHeader
            title={`Connector Detail: ${connectorKey || '-'}`}
            subtitle="Tests remain safe by default and do not imply active live external integration unless explicitly configured and passed."
          />

          {loading ? (
            <div className="text-sm text-slate-600">Yukleniyor...</div>
          ) : (
            <>
              <button
                onClick={runTest}
                className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Run Connector Test
              </button>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
                <div className="xl:col-span-4">
                  <ConnectorStatusCard connector={{ ...(data?.connector || {}), ...(data?.status || {}) }} />
                </div>
                <div className="xl:col-span-4">
                  <ConnectorReadinessChecklist status={data?.status} />
                </div>
                <div className="xl:col-span-4">
                  <ConnectorTestResultCard result={testResult} />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
                <div className="xl:col-span-6">
                  <ConnectorCredentialCard credentials={data?.credentials} />
                </div>
                <div className="xl:col-span-6">
                  <ConnectorLegalCard legal={{
                    legalRequirementKey: data?.connector?.legalRequirementKey,
                    legalApproved: data?.status?.legalApproved,
                    requirement: data?.connector?.legalRequirement,
                  }} />
                </div>
              </div>

              <ConnectorActivationPlanCard plan={plan || data?.activationPlan} />
            </>
          )}
        </AdminSurface>
      </AdminPage>
    </AdminLayout>
  );
}
