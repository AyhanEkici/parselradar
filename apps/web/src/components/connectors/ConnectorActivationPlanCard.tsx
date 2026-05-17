import React from 'react';

type Props = {
  plan?: any;
};

export default function ConnectorActivationPlanCard({ plan }: Props) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Activation Plan</div>
      <div className="mt-2 text-sm text-slate-700">Current state: {plan?.currentState || '-'}</div>
      <div className="mt-1 text-sm text-slate-700">Can activate: {plan?.canActivate ? 'yes' : 'no'}</div>
      <ul className="mt-3 space-y-1 text-xs text-slate-600">
        {(plan?.steps || []).map((step: any, idx: number) => (
          <li key={`${step.step}-${idx}`}>{step.complete ? '[x]' : '[ ]'} {step.step} ({step.stateHint || '-'})</li>
        ))}
      </ul>
    </div>
  );
}
