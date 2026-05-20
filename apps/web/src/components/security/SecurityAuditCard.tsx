import React from 'react';

export default function SecurityAuditCard({ item }: { item?: any }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">Security Audit</h3>
      <p className="mt-2 text-xs text-slate-700">Action: {item?.action || '-'}</p>
      <p className="text-xs text-slate-700">Severity: {item?.severity || '-'}</p>
      <p className="text-xs text-slate-700">Time: {item?.timestamp || '-'}</p>
    </div>
  );
}
