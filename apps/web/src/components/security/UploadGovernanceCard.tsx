import React from 'react';

export default function UploadGovernanceCard({ upload }: { upload?: any }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">Upload Governance</h3>
      <p className="mt-2 text-xs text-slate-700">Risk: {upload?.risk || '-'}</p>
      <p className="text-xs text-slate-700">Blocked: {upload?.blocked ? 'yes' : 'no'}</p>
    </div>
  );
}
