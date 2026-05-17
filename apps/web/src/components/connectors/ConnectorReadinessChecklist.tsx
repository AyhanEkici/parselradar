import React from 'react';

type Props = {
  status?: any;
};

export default function ConnectorReadinessChecklist({ status }: Props) {
  const credentialConfigured = Boolean(status?.credentialStatus?.credentialsConfigured);
  const endpointConfigured = Boolean(status?.credentialStatus?.endpointConfigured);
  const legalApproved = Boolean(status?.legalApproved);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Readiness Checklist</div>
      <ul className="mt-3 space-y-2 text-sm text-slate-700">
        <li>Endpoint configured: {endpointConfigured ? 'yes' : 'no'}</li>
        <li>Credentials configured: {credentialConfigured ? 'yes' : 'no'}</li>
        <li>Legal approved: {legalApproved ? 'yes' : 'no'}</li>
      </ul>
    </div>
  );
}
