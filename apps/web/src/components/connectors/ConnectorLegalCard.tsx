import React from 'react';

type Props = {
  legal?: any;
};

export default function ConnectorLegalCard({ legal }: Props) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Legal/Source Requirement</div>
      <div className="mt-2 text-sm text-slate-700">Requirement key: {legal?.legalRequirementKey || '-'}</div>
      <div className="mt-1 text-sm text-slate-700">Approved: {legal?.legalApproved ? 'yes' : 'no'}</div>
      <div className="mt-1 text-xs text-slate-600">{legal?.requirement?.description || '-'}</div>
    </div>
  );
}
