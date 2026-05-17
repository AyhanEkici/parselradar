import React from 'react';

type Props = {
  investorSignal?: string;
  trendSignals?: string[];
};

export const InvestorSignalCard: React.FC<Props> = ({ investorSignal, trendSignals = [] }) => {
  const normalized = (investorSignal || 'CAUTION').toUpperCase();

  return (
    <div className="h-full rounded-xl border border-amber-200 bg-amber-50 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-amber-700">Investor Signal</div>
      <div className="mt-2 text-2xl font-bold text-amber-900">{normalized}</div>
      <div className="mt-2 text-xs text-amber-700">Trend signals: {trendSignals.join(', ') || '-'}</div>
    </div>
  );
};
