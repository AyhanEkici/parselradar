import React from 'react';
import { LeafletMapSurface } from './LeafletMapSurface';

type Props = {
  coordinates?: { latitude: number; longitude: number; source: 'exact' | 'approximate' | 'district_center_fallback' } | null;
  regionalCluster?: {
    municipality?: { city: string; district?: string; distanceKm: number };
    roadCluster?: { name: string; distanceKm: number };
    clusterLabel: string;
  };
  clusterStrength?: number;
  spatialLiquidity?: { score: number; label: 'thin' | 'balanced' | 'liquid' };
};

export const RegionalHeatMapCard: React.FC<Props> = ({ coordinates, regionalCluster, clusterStrength = 0, spatialLiquidity }) => {
  if (!coordinates) return null;

  const radius = clusterStrength >= 70 ? 2800 : clusterStrength >= 45 ? 1800 : 1100;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Regional Heat</h3>
          <p className="mt-1 text-xs text-slate-600">Cluster-centered spatial intensity view</p>
        </div>
        <div className="text-right text-sm font-semibold text-slate-900">
          {clusterStrength}
          <div className="text-xs font-normal text-slate-500">{spatialLiquidity?.label || 'thin'}</div>
        </div>
      </div>

      <LeafletMapSurface
        center={coordinates}
        zoom={11}
        layerBuilder={({ L }) => {
          const group = L.layerGroup();
          L.circle([coordinates.latitude, coordinates.longitude], {
            radius,
            color: '#ea580c',
            fillColor: '#fdba74',
            fillOpacity: 0.28,
            weight: 1,
          }).addTo(group);
          L.circleMarker([coordinates.latitude, coordinates.longitude], {
            radius: 7,
            color: '#9a3412',
            fillColor: '#f97316',
            fillOpacity: 0.95,
          }).addTo(group);
          return group;
        }}
      />

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-700">
        <div className="rounded-lg border border-slate-100 bg-slate-50 p-2">Cluster: {regionalCluster?.clusterLabel || '-'}</div>
        <div className="rounded-lg border border-slate-100 bg-slate-50 p-2">Municipality: {regionalCluster?.municipality?.distanceKm ?? '-'} km</div>
        <div className="rounded-lg border border-slate-100 bg-slate-50 p-2">Road corridor: {regionalCluster?.roadCluster?.distanceKm ?? '-'} km</div>
        <div className="rounded-lg border border-slate-100 bg-slate-50 p-2">Heat radius: {(radius / 1000).toFixed(1)} km</div>
      </div>
    </div>
  );
};
