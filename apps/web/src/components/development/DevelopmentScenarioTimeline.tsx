import React from 'react';

type Item = {
  phase: 'land_control' | 'scheme_test' | 'entitlement_watch' | 'delivery_readiness';
  title: string;
  detail: string;
};

type Props = {
  developmentScenario?: Item[];
  developmentSignals?: string[];
};

export const DevelopmentScenarioTimeline: React.FC<Props> = ({ developmentScenario = [], developmentSignals = [] }) => {
  if (developmentScenario.length === 0) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div>
        <h3 className="text-sm font-semibold text-slate-900">Development Scenario</h3>
        <p className="mt-1 text-xs text-slate-600">Recommended developer sequencing</p>
      </div>

      <div className="mt-4 space-y-4">
        {developmentScenario.map((item, index) => (
          <div key={`${item.phase}-${index}`} className="flex gap-3">
            <div className="mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
              {index + 1}
            </div>
            <div className="flex-1 rounded-lg border border-slate-100 bg-slate-50 px-3 py-3">
              <div className="text-sm font-semibold text-slate-900">{item.title}</div>
              <div className="mt-1 text-xs text-slate-600">{item.detail}</div>
            </div>
          </div>
        ))}
      </div>

      {developmentSignals.length > 0 && (
        <div className="mt-4 border-t border-slate-100 pt-4">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">Signals</div>
          <div className="flex flex-wrap gap-2">
            {developmentSignals.map((signal) => (
              <span key={signal} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700">
                {signal.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
