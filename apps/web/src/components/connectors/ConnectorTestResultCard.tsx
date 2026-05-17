import React from 'react';

type Props = {
  result?: any;
};

export default function ConnectorTestResultCard({ result }: Props) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Test Result</div>
      <div className="mt-2 text-lg font-bold text-slate-900">{result?.state || 'NOT_CONFIGURED'}</div>
      <div className="mt-1 text-sm text-slate-700">{result?.message || 'No test run yet.'}</div>
      <div className="mt-1 text-xs text-slate-500">Checked: {result?.checkedAt ? new Date(result.checkedAt).toLocaleString() : '-'}</div>
    </div>
  );
}
