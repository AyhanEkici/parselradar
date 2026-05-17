import React from 'react';

type Props = {
  connectorKey: string;
  planning?: {
    expectedLayers?: string[];
    note?: string;
  } | null;
};

export default function PlanningLayerAvailabilityCard({ connectorKey, planning }: Props) {
  const expected = planning?.expectedLayers || ['1/100000', '1/25000', '1/5000', '1/1000'];

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-700">Planning Layer Availability</div>
      <div className="mt-1 text-xs text-slate-600">Connector: {connectorKey}</div>
      <div className="mt-3 space-y-1 text-sm text-slate-900">
        {expected.map((scale) => (
          <div key={scale} className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2">
            <div>{scale}</div>
            <div className="text-xs text-slate-600">UNKNOWN (requires test run)</div>
          </div>
        ))}
      </div>
      <div className="mt-3 text-xs text-slate-600">{planning?.note || 'Availability is established only after a successful connector test run returns structured layer flags.'}</div>
    </div>
  );
}

