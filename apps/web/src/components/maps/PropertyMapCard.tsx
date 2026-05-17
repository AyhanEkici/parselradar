import React from 'react';
import { LeafletMapSurface } from './LeafletMapSurface';

type Props = {
  coordinates?: { latitude: number; longitude: number; source: 'exact' | 'approximate' | 'district_center_fallback' } | null;
  geoConfidence?: { level: 'exact' | 'approximate' | 'district_center_fallback' | 'unresolved'; score: number };
  mapSummary?: string;
};

export const PropertyMapCard: React.FC<Props> = ({ coordinates, geoConfidence, mapSummary }) => {
  if (!coordinates) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">Parcel Position</h3>
        <p className="mt-2 text-sm text-slate-600">No resolved coordinates available for this parcel.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Parcel Position</h3>
          <p className="mt-1 text-xs text-slate-600">Resolved parcel coordinates with explicit confidence</p>
        </div>
        <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-1 text-right">
          <div className="text-xs text-blue-700">Confidence</div>
          <div className="text-sm font-semibold text-blue-900">{geoConfidence?.level || 'unresolved'} {geoConfidence?.score ?? 0}</div>
        </div>
      </div>

      <LeafletMapSurface
        center={coordinates}
        layerBuilder={({ L }) => {
          const group = L.layerGroup();
          L.circleMarker([coordinates.latitude, coordinates.longitude], {
            radius: 8,
            color: '#0f172a',
            fillColor: '#2563eb',
            fillOpacity: 0.9,
            weight: 2,
          })
            .bindPopup(`Parcel location (${coordinates.source})`)
            .addTo(group);

          const radiusMeters = geoConfidence?.level === 'exact' ? 120 : geoConfidence?.level === 'approximate' ? 600 : 1200;
          L.circle([coordinates.latitude, coordinates.longitude], {
            radius: radiusMeters,
            color: '#60a5fa',
            fillColor: '#bfdbfe',
            fillOpacity: 0.18,
            weight: 1,
          }).addTo(group);

          return group;
        }}
      />

      {mapSummary && <p className="mt-3 text-sm text-slate-600">{mapSummary}</p>}
    </div>
  );
};
