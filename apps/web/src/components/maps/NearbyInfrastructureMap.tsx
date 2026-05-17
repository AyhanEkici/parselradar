import React from 'react';
import { LeafletMapSurface } from './LeafletMapSurface';

type Props = {
  coordinates?: { latitude: number; longitude: number; source: 'exact' | 'approximate' | 'district_center_fallback' } | null;
  nearbyInfrastructure?: Array<{ id: string; name: string; type: string; distanceKm: number; city: string }>;
};

const colors: Record<string, string> = {
  airport: '#dc2626',
  industrial_zone: '#ea580c',
  university: '#7c3aed',
  hospital: '#0f766e',
  road_corridor: '#2563eb',
  tourism_zone: '#db2777',
};

export const NearbyInfrastructureMap: React.FC<Props> = ({ coordinates, nearbyInfrastructure = [] }) => {
  if (!coordinates) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Nearby Infrastructure</h3>
          <p className="mt-1 text-xs text-slate-600">Configured overlays within measurable radius bands</p>
        </div>
        <div className="text-sm font-semibold text-slate-900">{nearbyInfrastructure.length}</div>
      </div>

      <LeafletMapSurface
        center={coordinates}
        layerBuilder={({ L }) => {
          const group = L.layerGroup();
          L.circleMarker([coordinates.latitude, coordinates.longitude], {
            radius: 7,
            color: '#0f172a',
            fillColor: '#0f172a',
            fillOpacity: 1,
          }).bindPopup('Parcel').addTo(group);

          nearbyInfrastructure.forEach((item) => {
            const angle = (item.distanceKm * 37) % 360;
            const latOffset = Math.cos((angle * Math.PI) / 180) * (item.distanceKm / 111);
            const lngOffset = Math.sin((angle * Math.PI) / 180) * (item.distanceKm / 111);
            L.circleMarker([coordinates.latitude + latOffset, coordinates.longitude + lngOffset], {
              radius: 6,
              color: colors[item.type] || '#475569',
              fillColor: colors[item.type] || '#475569',
              fillOpacity: 0.85,
            })
              .bindPopup(`${item.name} - ${item.distanceKm} km`)
              .addTo(group);
          });

          return group;
        }}
      />

      <div className="mt-3 flex flex-wrap gap-2">
        {nearbyInfrastructure.slice(0, 6).map((item) => (
          <span key={item.id} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700">
            {item.name} {item.distanceKm} km
          </span>
        ))}
      </div>
    </div>
  );
};
