import React from 'react';

type Props = {
  spatialSignals?: string[];
  spatialLiquidity?: { score: number; label: 'thin' | 'balanced' | 'liquid' };
  geoConfidence?: { level: 'exact' | 'approximate' | 'district_center_fallback' | 'unresolved'; score: number };
  infrastructureDistances?: {
    airport?: number;
    industrial_zone?: number;
    university?: number;
    hospital?: number;
    road_corridor?: number;
    tourism_zone?: number;
  };
};

export const SpatialSignalsCard: React.FC<Props> = ({ spatialSignals = [], spatialLiquidity, geoConfidence, infrastructureDistances }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Spatial Signals</h3>
          <p className="mt-1 text-xs text-slate-600">Liquidity, proximity, and opportunity outputs</p>
        </div>
        {spatialLiquidity && <div className="rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-900">{spatialLiquidity.label} {spatialLiquidity.score}</div>}
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-slate-700">
        <div className="rounded-lg bg-slate-50 p-2 border border-slate-100">Geo confidence: {geoConfidence?.level || 'unresolved'} {geoConfidence?.score ?? 0}</div>
        <div className="rounded-lg bg-slate-50 p-2 border border-slate-100">Airport: {infrastructureDistances?.airport ?? '-'} km</div>
        <div className="rounded-lg bg-slate-50 p-2 border border-slate-100">Industrial: {infrastructureDistances?.industrial_zone ?? '-'} km</div>
        <div className="rounded-lg bg-slate-50 p-2 border border-slate-100">Road: {infrastructureDistances?.road_corridor ?? '-'} km</div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {spatialSignals.map((signal) => (
          <span key={signal} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700">
            {signal.replace(/_/g, ' ')}
          </span>
        ))}
      </div>
    </div>
  );
};
