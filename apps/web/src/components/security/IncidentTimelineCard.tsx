import React from 'react';

export default function IncidentTimelineCard({ incident }: { incident?: any }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">Incident Timeline</h3>
      <p className="mt-2 text-xs text-slate-700">Open: {incident?.openIncidents ?? '-'}</p>
      <p className="text-xs text-slate-700">Critical: {incident?.criticalIncidents ?? '-'}</p>
      <p className="text-xs text-slate-700">Latest: {incident?.latestIncidentAt || '-'}</p>
    </div>
  );
}
