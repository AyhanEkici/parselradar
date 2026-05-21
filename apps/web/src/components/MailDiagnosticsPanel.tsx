import React from 'react';

type MailDiagnosticsData = {
  provider?: string;
  state?: string;
  configured?: boolean;
  retryQueueDepth?: number;
  failedDeliveriesLast24h?: number;
  recentFailures?: Array<{ at: string; message: string }>;
};

export default function MailDiagnosticsPanel({ data, onSendTest, testing }: { data: MailDiagnosticsData | null; onSendTest: () => Promise<void>; testing: boolean }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-900">Mail Diagnostics</h3>
      <div className="mt-2 grid grid-cols-1 gap-2 text-xs text-slate-700 sm:grid-cols-2">
        <div>Provider: {data?.provider || '-'}</div>
        <div>State: {data?.state || '-'}</div>
        <div>Configured: {data?.configured ? 'YES' : 'NO'}</div>
        <div>Retry queue depth: {data?.retryQueueDepth ?? 0}</div>
        <div>Failed deliveries (24h): {data?.failedDeliveriesLast24h ?? 0}</div>
      </div>
      <button
        type="button"
        disabled={testing}
        onClick={() => { void onSendTest(); }}
        className="mt-3 rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
      >
        {testing ? 'Sending test email...' : 'Send test email'}
      </button>
      <ul className="mt-3 space-y-1 text-xs text-slate-700">
        {(data?.recentFailures || []).length === 0 ? <li>No recent mail failures.</li> : null}
        {(data?.recentFailures || []).map((failure, index) => (
          <li key={`${failure.at}-${index}`}>{new Date(failure.at).toLocaleString()} | {failure.message}</li>
        ))}
      </ul>
    </div>
  );
}
