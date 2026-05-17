import React from 'react';
import { LeafletMapSurface } from './LeafletMapSurface';

type Props = {
  coordinates?: { latitude: number; longitude: number; source: 'exact' | 'approximate' | 'district_center_fallback' } | null;
  comparableMapPoints?: Array<{ _id: string; latitude: number; longitude: number; distanceKm: number; pricePerM2?: number }>;
  clusterStrength?: number;
};

export const ComparableMapCluster: React.FC<Props> = ({ coordinates, comparableMapPoints = [], clusterStrength = 0 }) => {
  if (!coordinates) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Comparable Cluster</h3>
          <p className="mt-1 text-xs text-slate-600">Nearby comparable grouping from resolved coordinates</p>
        </div>
        <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-900">
          {clusterStrength}
        </div>
      </div>

      <LeafletMapSurface
        center={coordinates}
        layerBuilder={({ L }) => {
          const group = L.layerGroup();
          L.circleMarker([coordinates.latitude, coordinates.longitude], {
            radius: 7,
            color: '#0f172a',
            fillColor: '#1d4ed8',
            fillOpacity: 0.95,
          }).bindPopup('Subject parcel').addTo(group);

          comparableMapPoints.forEach((item) => {
            L.circleMarker([item.latitude, item.longitude], {
              radius: item.distanceKm <= 3 ? 6 : item.distanceKm <= 10 ? 5 : 4,
              color: item.distanceKm <= 3 ? '#059669' : item.distanceKm <= 10 ? '#0ea5e9' : '#94a3b8',
              fillColor: item.distanceKm <= 3 ? '#10b981' : item.distanceKm <= 10 ? '#38bdf8' : '#cbd5e1',
              fillOpacity: 0.8,
            })
              .bindPopup(`Comparable ${item._id} - ${item.distanceKm} km${typeof item.pricePerM2 === 'number' ? ` - ${item.pricePerM2} TL/m²` : ''}`)
              .addTo(group);
          });
          return group;
        }}
      />

      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-lg bg-emerald-50 px-2 py-2 text-emerald-800">Close {comparableMapPoints.filter((item) => item.distanceKm <= 3).length}</div>
        <div className="rounded-lg bg-blue-50 px-2 py-2 text-blue-800">Mid {comparableMapPoints.filter((item) => item.distanceKm > 3 && item.distanceKm <= 10).length}</div>
        <div className="rounded-lg bg-slate-50 px-2 py-2 text-slate-700">Broad {comparableMapPoints.filter((item) => item.distanceKm > 10).length}</div>
      </div>
    </div>
  );
};
