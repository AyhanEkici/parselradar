import React from 'react';

type Props = {
  credentials?: any;
};

export default function ConnectorCredentialCard({ credentials }: Props) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Credential Requirements</div>
      <div className="mt-2 text-sm text-slate-700">Configured: {credentials?.credentialsConfigured ? 'yes' : 'no'}</div>
      <div className="mt-1 text-sm text-slate-700">Endpoint configured: {credentials?.endpointConfigured ? 'yes' : 'no'}</div>
      <div className="mt-2 text-xs text-slate-600">Keys: {(credentials?.credentialKeys || []).join(', ') || '-'}</div>
      <div className="mt-1 text-xs text-rose-600">Missing: {(credentials?.missingCredentialKeys || []).join(', ') || '-'}</div>
    </div>
  );
}
