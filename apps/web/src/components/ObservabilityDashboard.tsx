import React from 'react';

type ObservabilityData = {
  generatedAt?: string;
  runtimeDiagnostics?: { degraded?: boolean; startupPhases?: Array<{ phase: string; createdAt?: string }> };
  apiErrorCounters?: { total?: number; byStatus?: Record<string, number> };
  verifierStatus?: Array<{ name: string; status: string }>;
  connectorRuntimeState?: Array<{ key: string; state: string; reason?: string }>;
};

export default function ObservabilityDashboard({ data }: { data: ObservabilityData | null }) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-slate-900">Observability Snapshot</h3>
        <div className="mt-2 text-xs text-slate-700">Generated: {data?.generatedAt ? new Date(data.generatedAt).toLocaleString() : '-'}</div>
        <div className="mt-1 text-xs text-slate-700">Runtime degraded: {data?.runtimeDiagnostics?.degraded ? 'YES' : 'NO'}</div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-slate-900">API Error Counters</h3>
        <div className="mt-2 text-xs text-slate-700">Total errors: {data?.apiErrorCounters?.total ?? 0}</div>
        <ul className="mt-2 space-y-1 text-xs text-slate-700">
          {Object.entries(data?.apiErrorCounters?.byStatus || {}).map(([status, count]) => (
            <li key={status}>{status}: {count}</li>
          ))}
        </ul>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-slate-900">Verifier Status</h3>
        <ul className="mt-2 space-y-1 text-xs text-slate-700">
          {(data?.verifierStatus || []).length === 0 ? <li>No verifier status found.</li> : null}
          {(data?.verifierStatus || []).map((item) => (
            <li key={item.name}>{item.name}: {item.status}</li>
          ))}
        </ul>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-slate-900">Connector Runtime State</h3>
        <ul className="mt-2 space-y-1 text-xs text-slate-700">
          {(data?.connectorRuntimeState || []).length === 0 ? <li>No connector runtime state.</li> : null}
          {(data?.connectorRuntimeState || []).map((connector) => (
            <li key={connector.key}>{connector.key}: {connector.state}{connector.reason ? ` (${connector.reason})` : ''}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
