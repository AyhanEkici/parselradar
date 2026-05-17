import React from 'react';

type Props = {
  districtHeat?: number;
  volatilityIndex?: number;
};

export const DistrictHeatCard: React.FC<Props> = ({ districtHeat = 0, volatilityIndex = 0 }) => {
  const heatLabel = districtHeat >= 72 ? 'Hot' : districtHeat >= 52 ? 'Warm' : 'Cool';

  return (
    <div className="h-full rounded-xl border border-rose-200 bg-rose-50 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-rose-700">District Heat</div>
      <div className="mt-2 text-3xl font-bold text-rose-900">{districtHeat}</div>
      <div className="mt-1 text-sm text-rose-800">{heatLabel} district activity</div>
      <div className="mt-3 text-xs text-rose-700">Volatility index: {volatilityIndex}</div>
    </div>
  );
};
