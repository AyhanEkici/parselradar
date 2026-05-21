import React from 'react';
import { GeoOverlayItem } from './types';

const COLORS: Record<GeoOverlayItem['overlayType'], string> = {
  parcel_analysis: '#2563eb',
  municipality: '#0ea5e9',
  zoning: '#7c3aed',
  infrastructure: '#16a34a',
  transport: '#dc2626',
  environmental: '#059669',
  investment: '#d97706',
  organization: '#475569',
};

export default function LayerLegend({ overlays }: { overlays: GeoOverlayItem[] }) {
  const counts = overlays.reduce<Record<string, number>>((acc, item) => {
    acc[item.overlayType] = (acc[item.overlayType] || 0) + 1;
    return acc;
  }, {});

  const entries = Object.entries(counts);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <h3 className="text-sm font-semibold text-slate-900">Layer Legend</h3>
      <ul className="mt-3 space-y-2">
        {entries.length === 0 ? <li className="text-xs text-slate-500">No active overlays.</li> : null}
        {entries.map(([type, count]) => (
          <li key={type} className="flex items-center justify-between text-xs text-slate-700">
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[type as GeoOverlayItem['overlayType']] || '#94a3b8' }} />
              <span>{type.replace(/_/g, ' ')}</span>
            </span>
            <span className="font-semibold text-slate-900">{count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
