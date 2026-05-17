import React from 'react';

type Props = {
  deploymentStatus?: string;
  deploymentProfile?: any;
};

export function DeploymentStatusCard({ deploymentStatus, deploymentProfile }: Props) {
  return (
    <div className="rounded-lg border border-sky-200 bg-sky-50 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-sky-700">Deployment Status</div>
      <div className="mt-2 text-xl font-bold text-sky-900">{deploymentStatus || 'NOT_CONFIGURED'}</div>
      <div className="mt-1 text-sm text-sky-800">{deploymentProfile?.cloudRuntimeClaim || 'Deployment claim unavailable.'}</div>
      <div className="mt-3 text-xs text-sky-700">
        Profile: {deploymentProfile?.deploymentProfile || '-'} | Declared: {deploymentProfile?.deploymentStateDeclared || '-'}
      </div>
    </div>
  );
}
