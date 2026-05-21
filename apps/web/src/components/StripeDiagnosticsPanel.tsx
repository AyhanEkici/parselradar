import React from 'react';

type StripeDiagnosticsData = {
  state?: string;
  configured?: boolean;
  pendingCheckouts?: number;
  failedCheckoutsLast24h?: number;
  webhookFailuresLast24h?: number;
  recentFailures?: Array<{ at: string; type: string; message: string }>;
};

export default function StripeDiagnosticsPanel({ data }: { data: StripeDiagnosticsData | null }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-900">Stripe Diagnostics</h3>
      <div className="mt-2 grid grid-cols-1 gap-2 text-xs text-slate-700 sm:grid-cols-2">
        <div>State: {data?.state || '-'}</div>
        <div>Configured: {data?.configured ? 'YES' : 'NO'}</div>
        <div>Pending checkouts: {data?.pendingCheckouts ?? 0}</div>
        <div>Failed checkouts (24h): {data?.failedCheckoutsLast24h ?? 0}</div>
        <div>Webhook failures (24h): {data?.webhookFailuresLast24h ?? 0}</div>
      </div>
      <ul className="mt-3 space-y-1 text-xs text-slate-700">
        {(data?.recentFailures || []).length === 0 ? <li>No recent Stripe failures.</li> : null}
        {(data?.recentFailures || []).map((failure, index) => (
          <li key={`${failure.at}-${index}`}>{new Date(failure.at).toLocaleString()} | {failure.type} | {failure.message}</li>
        ))}
      </ul>
    </div>
  );
}
