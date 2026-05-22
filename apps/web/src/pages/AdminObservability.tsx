import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiFetch } from '../lib/api';
import { AdminHeader, AdminLayout, AdminPage, AdminSurface } from '../components/admin';
import TelemetryStatusCard from '../components/observability/TelemetryStatusCard';
import TracingStatusCard from '../components/observability/TracingStatusCard';
import ErrorAnalyticsCard from '../components/observability/ErrorAnalyticsCard';
import ProductionAlertsCard from '../components/observability/ProductionAlertsCard';
import ObservabilitySnapshotCard from '../components/observability/ObservabilitySnapshotCard';
import InvestorPriorityCard from '../components/autonomy/InvestorPriorityCard';
import AutonomousReviewQueueCard from '../components/autonomy/AutonomousReviewQueueCard';
import EscalationTimelineCard from '../components/autonomy/EscalationTimelineCard';
import CadenceAndDegradationCard from '../components/autonomy/CadenceAndDegradationCard';
import ExecutionReadinessCard from '../components/execution/ExecutionReadinessCard';
import OperationalStateCard from '../components/operatingSystem/OperationalStateCard';
import DecisionConfidenceCard from '../components/decisioning/DecisionConfidenceCard';
import TerritorialOperatingSystemCard from '../components/operatingSystem/TerritorialOperatingSystemCard';
import ObservabilityDashboard from '../components/ObservabilityDashboard';

export default function AdminObservability() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [telemetry, setTelemetry] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiFetch('/admin/observability'),
      apiFetch('/admin/analyses?page=1'),
      apiFetch('/admin/observability-summary'),
      apiFetch('/admin/telemetry'),
    ])
      .then(([response, analysesPayload, observabilitySummary, telemetryPayload]) => {
        const first = (analysesPayload?.analyses || [])[0]?.fullAnalysis?.autonomyIntelligence || {};
        const execution = (analysesPayload?.analyses || [])[0]?.fullAnalysis?.executionOperatingSystem || {};
        setData({
          ...response,
          autonomy: {
            investorPriority: first.watchlist?.investor || null,
            reviewQueue: first.operations?.reviewQueue || null,
            escalation: first.prioritization?.governedEscalationQueue || null,
            cadence: first.autonomy?.cadence || null,
            degradation: first.operations?.degradation || null,
          },
          execution,
        });
        setSummary(observabilitySummary);
        setTelemetry(telemetryPayload);
        setError('');
      })
      .catch((err) => setError(err?.error || err?.message || 'Observability data could not be loaded'))
      .finally(() => setLoading(false));
  }, []);

  if (!user || String(user.role || '').toUpperCase() !== 'ADMIN') return <div>Yönetici yetkisi gerekli</div>;
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
                <div className="xl:col-span-12">
                  <ObservabilityDashboard data={summary} />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
                <div className="xl:col-span-4">
                  <ObservabilitySnapshotCard snapshot={data} />
                </div>
                <div className="xl:col-span-4">
                  <TelemetryStatusCard telemetry={telemetry || data?.telemetry} />
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

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
                <div className="xl:col-span-3">
                  <InvestorPriorityCard priority={data?.autonomy?.investorPriority} />
                </div>
                <div className="xl:col-span-3">
                  <AutonomousReviewQueueCard queue={data?.autonomy?.reviewQueue} />
                </div>
                <div className="xl:col-span-3">
                  <EscalationTimelineCard escalation={data?.autonomy?.escalation} />
                </div>
                <div className="xl:col-span-3">
                  <CadenceAndDegradationCard cadence={data?.autonomy?.cadence} degradation={data?.autonomy?.degradation} />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
                <div className="xl:col-span-3">
                  <ExecutionReadinessCard readiness={data?.execution?.readiness?.readinessEnvelope} />
                </div>
                <div className="xl:col-span-3">
                  <OperationalStateCard state={data?.execution?.operatingSystem?.state} />
                </div>
                <div className="xl:col-span-3">
                  <DecisionConfidenceCard decision={data?.execution?.decisioning?.confidence} />
                </div>
                <div className="xl:col-span-3">
                  <TerritorialOperatingSystemCard tos={data?.execution} />
                </div>
              </div>
            </>
          )}
        </AdminSurface>
      </AdminPage>
    </AdminLayout>
  );
}
