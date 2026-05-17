import React from 'react';

type Props = {
  title: string;
  scenario?: any;
};

export default function PortfolioScenarioCard({ title, scenario }: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</div>
      <pre className="mt-2 overflow-auto rounded bg-slate-50 p-2 text-xs text-slate-700">
        {JSON.stringify(scenario || {}, null, 2)}
      </pre>
    </div>
  );
}
