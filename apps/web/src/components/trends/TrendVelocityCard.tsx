import React from 'react';

type Props = {
  velocityScore?: number;
  velocityLabel?: string;
  liquidityTrend?: string;
};

export const TrendVelocityCard: React.FC<Props> = ({ velocityScore = 0, velocityLabel, liquidityTrend }) => {
  return (
    <div className="h-full rounded-xl border border-violet-200 bg-violet-50 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-violet-700">Trend Velocity</div>
      <div className="mt-2 text-3xl font-bold text-violet-900">{velocityScore}</div>
      <div className="mt-1 text-sm text-violet-800">{velocityLabel || 'balanced'}</div>
      <div className="mt-3 text-xs text-violet-700">Liquidity trend: {liquidityTrend || '-'}</div>
    </div>
  );
};
