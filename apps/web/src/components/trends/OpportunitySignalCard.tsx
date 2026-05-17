import React from 'react';

type Props = {
  opportunityScore?: number;
  alertSignals?: string[];
};

export const OpportunitySignalCard: React.FC<Props> = ({ opportunityScore = 0, alertSignals = [] }) => {
  const status = opportunityScore >= 74 ? 'Actionable' : opportunityScore >= 56 ? 'Watchlist' : 'Limited';

  return (
    <div className="h-full rounded-xl border border-emerald-200 bg-emerald-50 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Opportunity Score</div>
      <div className="mt-2 text-3xl font-bold text-emerald-900">{opportunityScore}</div>
      <div className="mt-1 text-sm text-emerald-800">{status}</div>
      <div className="mt-3 text-xs text-emerald-700">Alerts: {alertSignals.length}</div>
    </div>
  );
};
