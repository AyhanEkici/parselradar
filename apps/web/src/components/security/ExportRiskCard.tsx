import React from 'react';

export default function ExportRiskCard({ risk }: { risk?: any }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">Export Risk</h3>
      <p className="mt-2 text-xs text-slate-700">Risk: {risk?.exportRisk || '-'}</p>
      <p className="text-xs text-slate-700">Allowed: {risk?.allowed ? 'yes' : 'no'}</p>
    </div>
  );
}
