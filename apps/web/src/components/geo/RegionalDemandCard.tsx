import React from 'react';

interface RegionalDemandCardProps {
  regionalDemand?: {
    demandLevel: 'cold' | 'stable' | 'active' | 'high_growth';
    demandScore: number;
  };
}

export const RegionalDemandCard: React.FC<RegionalDemandCardProps> = ({ regionalDemand }) => {
  if (!regionalDemand) return null;

  const { demandLevel, demandScore } = regionalDemand;

  const demandColor = {
    cold: 'bg-slate-100 text-slate-900 border-slate-200',
    stable: 'bg-blue-100 text-blue-900 border-blue-200',
    active: 'bg-emerald-100 text-emerald-900 border-emerald-200',
    high_growth: 'bg-amber-100 text-amber-900 border-amber-200',
  };

  const demandLabel = {
    cold: 'Cold Market',
    stable: 'Stable Market',
    active: 'Active Market',
    high_growth: 'High Growth',
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-4">
        <h3 className="font-semibold text-gray-900">Regional Demand</h3>
        <p className="text-sm text-gray-600">Market activity level</p>
      </div>

      <div className="space-y-3">
        <div className={`rounded-lg border ${demandColor[demandLevel]} p-3 text-center`}>
          <div className="text-lg font-semibold">{demandLabel[demandLevel]}</div>
          <div className="text-xs opacity-80 mt-1">Demand Score: {demandScore}</div>
        </div>

        <div className="flex items-center gap-2">
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-slate-400 via-emerald-500 to-amber-500 transition-all"
              style={{
                width: `${Math.min(demandScore, 100)}%`,
              }}
            />
          </div>
          <span className="text-sm font-medium text-gray-900 w-10">{demandScore}</span>
        </div>

        <div className="text-xs text-gray-600 px-2">
          {demandLevel === 'cold' && 'Low market activity. Limited transactions and pricing pressure.'}
          {demandLevel === 'stable' && 'Steady market. Consistent pricing and moderate activity.'}
          {demandLevel === 'active' && 'Strong demand. Frequent transactions and competitive pricing.'}
          {demandLevel === 'high_growth' && 'Exceptional growth. High investment activity and rising values.'}
        </div>
      </div>
    </div>
  );
};
