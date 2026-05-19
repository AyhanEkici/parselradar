import React from 'react';

export default function InvestorAlertCard({ alert }: { alert?: { state?: string; route?: string; suppressed?: boolean; governanceState?: string } }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800">Investor Alert</h3>
      <p className="mt-1 text-xs text-slate-700">State: {alert?.state || '-'}</p>
      <p className="text-xs text-slate-700">Route: {alert?.route || '-'}</p>
      <p className="text-xs text-slate-700">Suppressed: {alert?.suppressed ? 'Yes' : 'No'}</p>
      <p className="text-xs text-slate-600">Governance: {alert?.governanceState || '-'}</p>
    </div>
  );
}
