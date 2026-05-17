import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { apiFetch } from '../lib/api';
import { AdminHeader, AdminLayout, AdminPage, AdminSurface } from '../components/admin';
import ConnectorStatusCard from '../components/connectors/ConnectorStatusCard';
import ConnectorReadinessChecklist from '../components/connectors/ConnectorReadinessChecklist';
import ConnectorLegalCard from '../components/connectors/ConnectorLegalCard';
import ConnectorActivationPlanCard from '../components/connectors/ConnectorActivationPlanCard';
import ConnectorCredentialForm from '../components/connectors/ConnectorCredentialForm';
import ConnectorActivationControls from '../components/connectors/ConnectorActivationControls';
import ConnectorTestRunPanel from '../components/connectors/ConnectorTestRunPanel';
import ConnectorSourceApprovalPanel from '../components/connectors/ConnectorSourceApprovalPanel';
import ConnectorActivationAuditPanel from '../components/connectors/ConnectorActivationAuditPanel';
import ConnectorSamplePayloadPanel from '../components/connectors/ConnectorSamplePayloadPanel';
import ConnectorRateLimitCard from '../components/connectors/ConnectorRateLimitCard';
import ConnectorRetryPolicyCard from '../components/connectors/ConnectorRetryPolicyCard';
import PlanningLayerAvailabilityCard from '../components/planning/PlanningLayerAvailabilityCard';
import PlanningSourceFreshnessCard from '../components/planning/PlanningSourceFreshnessCard';
import PlanningGovernanceClassificationCard from '../components/planning/PlanningGovernanceClassificationCard';

export default function AdminConnectorDetail() {
  const { connectorKey } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');

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

  if (!user || user.role !== 'ADMIN') return <div>Yonetici yetkisi gerekli</div>;
  if (error) return <div>Hata: {error}</div>;

  const activationState = data?.activationState;
  const connector = data?.connector;
  const status = data?.status;
  const currentState: string = activationState?.state || status?.state || 'NOT_CONFIGURED';
  const requiredEnv: string[] = activationState?.requiredEnv || [];
  const maskedKeys: Record<string, boolean> = activationState?.maskedKeys || {};
  const legalRequirement: string = activationState?.legalRequirement || connector?.legalRequirementKey || '';
  const legalApproved: boolean = activationState?.legalApproved ?? status?.legalApproved ?? false;
  const approvalNote: string | null = activationState?.legalApprovalNote ?? null;
  const lastTestRun = activationState?.lastTestRun ?? null;
  const v23 = activationState?.v23 ?? null;

  return (
    <AdminLayout title="Connector Detail">
      <AdminPage className="p-0 sm:p-0">
        <AdminSurface className="space-y-4 p-4 sm:p-5">
          <AdminHeader
            title={`Connector: ${connectorKey || '-'}`}
            subtitle="Connector activation is gated by credentials, legal approval, and a passed test run. No live data claim without all gates passing."
          />

          {actionError && (
            <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              {actionError}
            </div>
          )}

          {loading ? (
            <div className="text-sm text-slate-600">Yukleniyor...</div>
          ) : (
            <>
              {/* Row 1: Status + Readiness + Activation Controls */}
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
                <div className="xl:col-span-4">
                  <ConnectorStatusCard connector={{ ...(connector || {}), ...(status || {}) }} />
                </div>
                <div className="xl:col-span-4">
                  <ConnectorReadinessChecklist status={status} />
                </div>
                <div className="xl:col-span-4">
                  <ConnectorActivationControls
                    connectorKey={connectorKey!}
                    currentState={currentState}
                    onDone={() => { setActionError(''); void load(); }}
                    onError={setActionError}
                    apiFetch={apiFetch}
                  />
                </div>
              </div>

              {/* Row 2: Credential Form + Legal Approval */}
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
                <div className="xl:col-span-6">
                  <ConnectorCredentialForm
                    connectorKey={connectorKey!}
                    requiredEnv={requiredEnv}
                    maskedKeys={maskedKeys}
                    onSaved={() => { setActionError(''); void load(); }}
                    onError={setActionError}
                    apiFetch={apiFetch}
                  />
                </div>
                <div className="xl:col-span-6">
                  <ConnectorSourceApprovalPanel
                    connectorKey={connectorKey!}
                    legalRequirement={legalRequirement}
                    legalApproved={legalApproved}
                    approvalNote={approvalNote}
                    onDone={() => { setActionError(''); void load(); }}
                    onError={setActionError}
                    apiFetch={apiFetch}
                  />
                </div>
              </div>

              {/* Row 3: Test Run + Sample Payload */}
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
                <div className="xl:col-span-6">
                  <ConnectorTestRunPanel
                    connectorKey={connectorKey!}
                    lastTestRun={lastTestRun}
                    onTestDone={() => { setActionError(''); void load(); }}
                    onError={setActionError}
                    apiFetch={apiFetch}
                  />
                </div>
                <div className="xl:col-span-6">
                  <ConnectorSamplePayloadPanel
                    samplePayloadSchema={lastTestRun?.samplePayloadSchema}
                  />
                </div>
              </div>

              {/* Row 3B: Rate limit + Retry policy + Freshness */}
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
                <div className="xl:col-span-4">
                  <ConnectorRateLimitCard rateLimit={v23?.rateLimit} />
                </div>
                <div className="xl:col-span-4">
                  <ConnectorRetryPolicyCard retryPolicy={v23?.retryPolicy} />
                </div>
                <div className="xl:col-span-4">
                  <PlanningSourceFreshnessCard freshness={v23?.freshness} />
                </div>
              </div>

              {/* Row 3C: Planning layer availability + Governance (municipality) */}
              {v23?.planning && (
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
                  <div className="xl:col-span-6">
                    <PlanningLayerAvailabilityCard connectorKey={connectorKey!} planning={v23?.planning} />
                  </div>
                  <div className="xl:col-span-6">
                    <PlanningGovernanceClassificationCard governance={v23?.planning} />
                  </div>
                </div>
              )}

              {/* Row 4: Legal card + Activation Plan */}
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
                <div className="xl:col-span-6">
                  <ConnectorLegalCard legal={{
                    legalRequirementKey: connector?.legalRequirementKey,
                    legalApproved,
                    requirement: connector?.legalRequirement,
                  }} />
                </div>
                <div className="xl:col-span-6">
                  <ConnectorActivationPlanCard plan={plan || data?.activationPlan} />
                </div>
              </div>

              {/* Row 5: Activation Audit */}
              <ConnectorActivationAuditPanel
                connectorKey={connectorKey!}
                apiFetch={apiFetch}
              />
            </>
          )}
        </AdminSurface>
      </AdminPage>
    </AdminLayout>
  );
}
