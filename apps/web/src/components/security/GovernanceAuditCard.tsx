import React from 'react';

export default function GovernanceAuditCard({ governance }: { governance?: any }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">Governance Audit</h3>
      <p className="mt-2 text-xs text-slate-700">Compliant: {governance?.overallCompliant ? 'yes' : 'no'}</p>
      <p className="text-xs text-slate-700">Rate: {governance?.complianceRate ?? '-'}%</p>
    </div>
  );
}
